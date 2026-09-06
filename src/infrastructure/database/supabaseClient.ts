import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types.js';
import { mockDb } from './mockDb.js';

const isTestEnv = process.env.NODE_ENV === 'test';

const supabaseUrl = process.env.SUPABASE_URL || 'http://127.0.0.1:54321';
const supabasePublishableKey =
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.fake-publishable-key';
const supabaseSecretKey =
  process.env.SUPABASE_SECRET_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.fake-secret-key';

// Privileged Supabase client (server-side only, bypasses RLS)
export const supabaseAdmin: SupabaseClient<Database> = isTestEnv
  ? (mockDb.createClient() as SupabaseClient<Database>)
  : createClient<Database>(supabaseUrl, supabaseSecretKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });

// Creates a client executing in the authenticated user's context (enforcing RLS)
export function createSupabaseUserClient(token: string): SupabaseClient<Database> {
  if (isTestEnv) {
    return mockDb.createClient() as SupabaseClient<Database>;
  }

  return createClient<Database>(supabaseUrl, supabasePublishableKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    },
    global: {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  });
}
