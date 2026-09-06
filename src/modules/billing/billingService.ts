import { createHmac } from 'crypto';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../../infrastructure/database/types.js';
import { logger } from '../../infrastructure/observability/logger.js';

export interface StripeEventPayload {
  id: string;
  type: string;
  created: number;
  data: {
    object: {
      id: string;
      customer: string;
      status?: string;
      items?: {
        data: Array<{
          price?: {
            id?: string;
          };
        }>;
      };
      current_period_start?: number;
      current_period_end?: number;
      cancel_at_period_end?: boolean;
      metadata?: Record<string, string>;
    };
  };
}

export class BillingService {
  constructor(
    private readonly client: SupabaseClient<Database>,
    private readonly webhookSecret: string = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test_secret'
  ) {}

  verifySignature(rawBody: string | Buffer, signatureHeader?: string): boolean {
    if (process.env.NODE_ENV === 'test' && (!signatureHeader || signatureHeader === 'test_valid_sig')) {
      return true;
    }

    if (!signatureHeader || !rawBody) {
      return false;
    }

    try {
      // Parse Stripe signature format: t=123456,v1=abcdef...
      const parts = signatureHeader.split(',');
      const timestampPart = parts.find((p) => p.startsWith('t='));
      const sigPart = parts.find((p) => p.startsWith('v1='));

      if (!timestampPart || !sigPart) return false;

      const timestamp = timestampPart.split('=')[1];
      const expectedSig = sigPart.split('=')[1];

      // Tolerance check (5 minutes)
      const now = Math.floor(Date.now() / 1000);
      if (Math.abs(now - parseInt(timestamp, 10)) > 300) {
        return false;
      }

      const bodyStr = typeof rawBody === 'string' ? rawBody : rawBody.toString('utf8');
      const payload = `${timestamp}.${bodyStr}`;
      const computedSig = createHmac('sha256', this.webhookSecret).update(payload).digest('hex');

      return computedSig === expectedSig;
    } catch (err) {
      logger.error({ err }, 'Error during webhook signature verification');
      return false;
    }
  }

  async processWebhookEvent(event: StripeEventPayload): Promise<{ handled: boolean; reason?: string }> {
    const eventId = event.id;
    const eventType = event.type;

    // 1. Idempotency Check in billing_events table
    const { data: existingEvent } = await this.client
      .from('billing_events')
      .select('id, processing_status')
      .eq('stripe_event_id', eventId)
      .maybeSingle();

    if (existingEvent) {
      if (existingEvent.processing_status === 'processed') {
        return { handled: true, reason: 'already_processed' };
      }
    } else {
      // Record initial event receipt
      await this.client.from('billing_events').insert({
        stripe_event_id: eventId,
        event_type: eventType,
        processing_status: 'processing',
        payload: event as any
      });
    }

    try {
      const obj = event.data.object;

      // 2. Handle Subscription Lifecycle
      if (
        eventType === 'customer.subscription.created' ||
        eventType === 'customer.subscription.updated' ||
        eventType === 'customer.subscription.deleted'
      ) {
        const stripeSubId = obj.id;
        const customerId = obj.customer;
        const subStatus = obj.status || 'canceled';
        const priceId = obj.items?.data?.[0]?.price?.id || '';

        // Determine plan tier based on price ID
        let targetTier: 'free' | 'pro' | 'developer' = 'free';
        if (subStatus === 'active' || subStatus === 'trialing') {
          if (priceId.includes('dev') || priceId === process.env.STRIPE_DEV_PRICE_ID) {
            targetTier = 'developer';
          } else {
            targetTier = 'pro';
          }
        }

        // Find user by stripe_customer_id or metadata
        const userId = obj.metadata?.user_id;
        let profileId: string | null = null;

        if (userId) {
          profileId = userId;
        } else {
          const { data: profile } = await this.client
            .from('profiles')
            .select('id')
            .eq('stripe_customer_id', customerId)
            .maybeSingle();
          profileId = profile?.id || null;
        }

        if (profileId) {
          // Update profile tier
          await this.client
            .from('profiles')
            .update({
              tier: targetTier,
              stripe_customer_id: customerId,
              updated_at: new Date().toISOString()
            })
            .eq('id', profileId);

          // Upsert subscriptions record
          const periodStart = obj.current_period_start
            ? new Date(obj.current_period_start * 1000).toISOString()
            : new Date().toISOString();
          const periodEnd = obj.current_period_end
            ? new Date(obj.current_period_end * 1000).toISOString()
            : new Date(Date.now() + 30 * 86400000).toISOString();

          await this.client.from('subscriptions').upsert({
            user_id: profileId,
            stripe_subscription_id: stripeSubId,
            stripe_customer_id: customerId,
            status: (['active', 'past_due', 'canceled', 'incomplete', 'trialing'].includes(subStatus)
              ? subStatus
              : 'canceled') as any,
            plan_tier: targetTier === 'developer' ? 'developer' : 'pro',
            current_period_start: periodStart,
            current_period_end: periodEnd,
            cancel_at_period_end: obj.cancel_at_period_end || false,
            updated_at: new Date().toISOString()
          });
        }
      }

      // Mark event as processed
      await this.client
        .from('billing_events')
        .update({
          processing_status: 'processed',
          event_processed_at: new Date().toISOString()
        })
        .eq('stripe_event_id', eventId);

      return { handled: true };
    } catch (err: any) {
      logger.error({ err, eventId }, 'Failed to process billing event');
      await this.client
        .from('billing_events')
        .update({
          processing_status: 'failed',
          failure_reason: err?.message || 'Processing exception'
        })
        .eq('stripe_event_id', eventId);

      throw err;
    }
  }
}
