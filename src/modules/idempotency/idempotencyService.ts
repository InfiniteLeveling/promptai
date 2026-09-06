import { createHash } from 'crypto';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, Json } from '../../infrastructure/database/types.js';

export interface IdempotencyCheckResult {
  allowed: boolean;
  isCached?: boolean;
  responseCode?: number;
  responseBody?: Json;
  error?: {
    code: string;
    message: string;
    statusCode: number;
  };
}

export class IdempotencyService {
  constructor(private readonly client: SupabaseClient<Database>) {}

  static computePayloadHash(payload: unknown): string {
    const serialized = JSON.stringify(payload ?? {});
    return createHash('sha256').update(serialized).digest('hex');
  }

  async checkAndLock(
    userId: string,
    requestPath: string,
    idempotencyKey: string,
    payload: unknown,
    lockDurationSeconds: number = 60
  ): Promise<IdempotencyCheckResult> {
    const requestHash = IdempotencyService.computePayloadHash(payload);
    const lockedUntil = new Date(Date.now() + lockDurationSeconds * 1000).toISOString();

    // Check existing key in PostgreSQL authoritative table
    const { data: existing, error: fetchError } = await this.client
      .from('idempotency_keys')
      .select('*')
      .eq('user_id', userId)
      .eq('request_path', requestPath)
      .eq('idempotency_key', idempotencyKey)
      .maybeSingle();

    if (fetchError) {
      throw new Error(`Idempotency lookup failed: ${fetchError.message}`);
    }

    if (existing) {
      // 1. Conflict Check: Same key used with different payload
      if (existing.request_hash !== requestHash) {
        return {
          allowed: false,
          error: {
            code: 'IDEMPOTENCY_KEY_REUSED',
            message: 'Idempotency key was previously used with a different request payload',
            statusCode: 409
          }
        };
      }

      // 2. Completed: Return cached authoritative response
      if (existing.status === 'completed') {
        return {
          allowed: false,
          isCached: true,
          responseCode: existing.response_code || 200,
          responseBody: existing.response_body
        };
      }

      // 3. In Progress: Concurrent duplicate request
      return {
        allowed: false,
        error: {
          code: 'REQUEST_IN_PROGRESS',
          message: 'An identical request is currently being processed',
          statusCode: 429
        }
      };
    }

    // Insert new in_progress lock
    const { error: insertError } = await this.client
      .from('idempotency_keys')
      .insert({
        user_id: userId,
        request_path: requestPath,
        idempotency_key: idempotencyKey,
        request_hash: requestHash,
        status: 'in_progress',
        locked_until: lockedUntil
      });

    if (insertError) {
      // Handle potential race condition insert collision
      return {
        allowed: false,
        error: {
          code: 'CONCURRENT_REQUEST',
          message: 'Concurrent request conflict detected on idempotency key',
          statusCode: 409
        }
      };
    }

    return { allowed: true };
  }

  async complete(
    userId: string,
    requestPath: string,
    idempotencyKey: string,
    responseCode: number,
    responseBody: Json
  ): Promise<void> {
    await this.client
      .from('idempotency_keys')
      .update({
        status: 'completed',
        response_code: responseCode,
        response_body: responseBody
      })
      .eq('user_id', userId)
      .eq('request_path', requestPath)
      .eq('idempotency_key', idempotencyKey);
  }

  async fail(userId: string, requestPath: string, idempotencyKey: string): Promise<void> {
    await this.client
      .from('idempotency_keys')
      .update({
        status: 'failed'
      })
      .eq('user_id', userId)
      .eq('request_path', requestPath)
      .eq('idempotency_key', idempotencyKey);
  }
}
