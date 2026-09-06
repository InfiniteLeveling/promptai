import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../../infrastructure/database/types.js';

export interface QuotaStatus {
  userId: string;
  plan: 'free' | 'pro' | 'developer';
  dailyLimit: number;
  compilationsUsed: number;
  compilationsReserved: number;
  compilationsRemaining: number;
  tokensConsumed: number;
  date: string;
}

export class QuotaRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async getUserQuotaStatus(userId: string): Promise<QuotaStatus> {
    const today = new Date().toISOString().split('T')[0];

    // 1. Fetch user tier
    const { data: profile, error: profileError } = await this.client
      .from('profiles')
      .select('tier')
      .eq('id', userId)
      .is('deleted_at', null)
      .single();

    if (profileError || !profile) {
      throw new Error(`Profile not found for user ${userId}: ${profileError?.message}`);
    }

    const tier = profile.tier as 'free' | 'pro' | 'developer';

    // 2. Fetch plan entitlements
    const { data: entitlement, error: entError } = await this.client
      .from('plan_entitlements')
      .select('daily_compilations')
      .eq('plan', tier)
      .order('effective_from', { ascending: false })
      .limit(1)
      .single();

    const dailyLimit = entitlement?.daily_compilations || 5;

    // 3. Fetch today's usage counter
    const { data: counter } = await this.client
      .from('usage_counters')
      .select('compilations_used, compilations_reserved, tokens_consumed')
      .eq('user_id', userId)
      .eq('usage_date', today)
      .maybeSingle();

    const used = counter?.compilations_used || 0;
    const reserved = counter?.compilations_reserved || 0;
    const remaining = Math.max(0, dailyLimit - (used + reserved));
    const tokens = counter?.tokensConsumed || counter?.tokens_consumed || 0;

    return {
      userId,
      plan: tier,
      dailyLimit,
      compilationsUsed: used,
      compilationsReserved: reserved,
      compilationsRemaining: remaining,
      tokensConsumed: tokens,
      date: today
    };
  }

  async reserveQuota(runId: string, userId: string, amount: number = 1) {
    const { data, error } = await this.client.rpc('reserve_compilation_quota', {
      p_compilation_run_id: runId,
      p_user_id: userId,
      p_amount: amount
    });

    if (error) {
      throw new Error(`Quota reservation failed: ${error.message}`);
    }

    return data;
  }

  async commitQuota(reservationId: string, tokens: number = 0, costUsd: number = 0) {
    const { data, error } = await this.client.rpc('commit_compilation_quota', {
      p_reservation_id: reservationId,
      p_tokens: tokens,
      p_actual_cost_usd: costUsd
    });

    if (error) {
      throw new Error(`Quota commit failed: ${error.message}`);
    }

    return data;
  }

  async refundQuota(reservationId: string, reason: string = 'compilation_failed') {
    const { data, error } = await this.client.rpc('refund_compilation_quota', {
      p_reservation_id: reservationId,
      p_reason: reason
    });

    if (error) {
      throw new Error(`Quota refund failed: ${error.message}`);
    }

    return data;
  }

  async recoverStaleReservations(): Promise<number> {
    const { data, error } = await this.client.rpc('recover_stale_quota_reservations');

    if (error) {
      throw new Error(`Stale quota recovery failed: ${error.message}`);
    }

    return typeof data === 'number' ? data : 0;
  }
}
