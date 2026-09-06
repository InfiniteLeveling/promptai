import type { AuthUser } from './types.js';
import { supabaseAdmin } from '../../infrastructure/database/supabaseClient.js';
import { logger } from '../../infrastructure/observability/logger.js';

export interface VerifyTokenResult {
  valid: boolean;
  user?: AuthUser;
  errorCode?: string;
  errorMessage?: string;
}

export async function verifyToken(token: string): Promise<VerifyTokenResult> {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const isProduction = nodeEnv === 'production' || nodeEnv === 'staging';

  // Security Gate: Reject dev_user_token in staging and production
  if (token === 'dev_user_token') {
    if (isProduction) {
      logger.warn({ token }, 'Security rejection: dev_user_token attempted in production/staging environment');
      return {
        valid: false,
        errorCode: 'UNAUTHORIZED',
        errorMessage: 'Invalid or forbidden development token in this environment'
      };
    }

    // Allowed ONLY in local development / test
    return {
      valid: true,
      user: {
        id: '00000000-0000-0000-0000-000000000001',
        email: 'dev@promptarchitect.local',
        role: 'user',
        tier: 'developer',
        isAnonymous: false
      }
    };
  }

  // Support local test mock tokens in test environment
  if (nodeEnv === 'test') {
    if (token === 'test_user_token') {
      return {
        valid: true,
        user: {
          id: '11111111-1111-1111-1111-111111111111',
          email: 'user@test.local',
          role: 'user',
          tier: 'free',
          isAnonymous: false
        }
      };
    }
    if (token === 'test_admin_token') {
      return {
        valid: true,
        user: {
          id: '22222222-2222-2222-2222-222222222222',
          email: 'admin@test.local',
          role: 'admin',
          tier: 'developer',
          isAnonymous: false
        }
      };
    }
    if (token === 'test_anonymous_token') {
      return {
        valid: true,
        user: {
          id: '33333333-3333-3333-3333-333333333333',
          role: 'user',
          tier: 'free',
          isAnonymous: true
        }
      };
    }
  }

  try {
    // Verify against Supabase Auth (GoTrue)
    const { data: authData, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !authData.user) {
      return {
        valid: false,
        errorCode: 'INVALID_TOKEN',
        errorMessage: authError?.message || 'Failed to authenticate user token'
      };
    }

    const authUser = authData.user;

    // Fetch profile details from public.profiles
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, tier, role, is_anonymous, deleted_at')
      .eq('id', authUser.id)
      .single();

    if (profileError || !profile) {
      // If profile does not exist yet, fallback to safe defaults while trigger finishes
      return {
        valid: true,
        user: {
          id: authUser.id,
          email: authUser.email,
          role: 'user',
          tier: 'free',
          isAnonymous: Boolean(authUser.is_anonymous)
        }
      };
    }

    // Check soft-deletion
    if (profile.deleted_at) {
      return {
        valid: false,
        errorCode: 'ACCOUNT_DELETED',
        errorMessage: 'This account has been deleted'
      };
    }

    return {
      valid: true,
      user: {
        id: profile.id,
        email: authUser.email,
        role: profile.role as 'user' | 'admin',
        tier: profile.tier as 'free' | 'pro' | 'developer',
        isAnonymous: Boolean(profile.is_anonymous)
      }
    };
  } catch (err: unknown) {
    logger.error({ err }, 'Unexpected error during token verification');
    return {
      valid: false,
      errorCode: 'AUTH_INTERNAL_ERROR',
      errorMessage: 'Authentication service encountered an unexpected error'
    };
  }
}
