export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          avatar_url: string | null;
          tier: 'free' | 'pro' | 'developer';
          role: 'user' | 'admin';
          is_anonymous: boolean;
          stripe_customer_id: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          avatar_url?: string | null;
          tier?: 'free' | 'pro' | 'developer';
          role?: 'user' | 'admin';
          is_anonymous?: boolean;
          stripe_customer_id?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          tier?: 'free' | 'pro' | 'developer';
          role?: 'user' | 'admin';
          is_anonymous?: boolean;
          stripe_customer_id?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };
      blueprints: {
        Row: {
          id: string;
          slug: string;
          title: string;
          description: string;
          category: string;
          complexity: 'Beginner' | 'Intermediate' | 'Advanced' | 'Enterprise';
          spec: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          description: string;
          category: string;
          complexity: 'Beginner' | 'Intermediate' | 'Advanced' | 'Enterprise';
          spec: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          title?: string;
          description?: string;
          category?: string;
          complexity?: 'Beginner' | 'Intermediate' | 'Advanced' | 'Enterprise';
          spec?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      prompts: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          category: string;
          tags: string[];
          is_public: boolean;
          fork_count: number;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          category?: string;
          tags?: string[];
          is_public?: boolean;
          fork_count?: number;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          category?: string;
          tags?: string[];
          is_public?: boolean;
          fork_count?: number;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };
      prompt_versions: {
        Row: {
          id: string;
          prompt_id: string;
          version_number: number;
          input_prompt: string;
          canonical_spec: Json;
          dialect_outputs: Json;
          heuristic_score: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          prompt_id: string;
          version_number: number;
          input_prompt: string;
          canonical_spec: Json;
          dialect_outputs: Json;
          heuristic_score: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          prompt_id?: string;
          version_number?: number;
          input_prompt?: string;
          canonical_spec?: Json;
          dialect_outputs?: Json;
          heuristic_score?: number;
          created_at?: string;
        };
      };
      plan_entitlements: {
        Row: {
          id: string;
          plan: 'free' | 'pro' | 'developer';
          version: string;
          daily_compilations: number;
          daily_ai_budget_usd: string;
          max_input_size_bytes: number;
          max_output_tokens: number;
          max_concurrency: number;
          allowed_models: string[];
          feature_flags: Json;
          effective_from: string;
          effective_until: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          plan: 'free' | 'pro' | 'developer';
          version: string;
          daily_compilations: number;
          daily_ai_budget_usd: string;
          max_input_size_bytes: number;
          max_output_tokens: number;
          max_concurrency: number;
          allowed_models: string[];
          feature_flags?: Json;
          effective_from?: string;
          effective_until?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          plan?: 'free' | 'pro' | 'developer';
          version?: string;
          daily_compilations?: number;
          daily_ai_budget_usd?: string;
          max_input_size_bytes?: number;
          max_output_tokens?: number;
          max_concurrency?: number;
          allowed_models?: string[];
          feature_flags?: Json;
          effective_from?: string;
          effective_until?: string | null;
          created_at?: string;
        };
      };
      usage_counters: {
        Row: {
          id: string;
          user_id: string;
          usage_date: string;
          compilations_used: number;
          compilations_reserved: number;
          tokens_consumed: number;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          usage_date: string;
          compilations_used?: number;
          compilations_reserved?: number;
          tokens_consumed?: number;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          usage_date?: string;
          compilations_used?: number;
          compilations_reserved?: number;
          tokens_consumed?: number;
          updated_at?: string;
        };
      };
      compilation_runs: {
        Row: {
          id: string;
          user_id: string;
          request_id: string;
          status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
          prompt_input: string;
          input_hash: string;
          options: Json;
          result: Json | null;
          error_message: string | null;
          is_shadow: boolean;
          fallback_used: boolean;
          compiler_version: string;
          schema_version: string;
          adapter_version: string;
          model_provider: string;
          model_name: string;
          model_policy_version: string;
          pricing_version: string;
          entitlement_version: string;
          input_tokens: number;
          output_tokens: number;
          estimated_cost_usd: string;
          actual_cost_usd: string | null;
          created_at: string;
          started_at: string | null;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          request_id: string;
          status?: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
          prompt_input: string;
          input_hash: string;
          options?: Json;
          result?: Json | null;
          error_message?: string | null;
          is_shadow?: boolean;
          fallback_used?: boolean;
          compiler_version: string;
          schema_version: string;
          adapter_version: string;
          model_provider: string;
          model_name: string;
          model_policy_version: string;
          pricing_version: string;
          entitlement_version: string;
          input_tokens?: number;
          output_tokens?: number;
          estimated_cost_usd?: string;
          actual_cost_usd?: string | null;
          created_at?: string;
          started_at?: string | null;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          request_id?: string;
          status?: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
          prompt_input?: string;
          input_hash?: string;
          options?: Json;
          result?: Json | null;
          error_message?: string | null;
          is_shadow?: boolean;
          fallback_used?: boolean;
          compiler_version?: string;
          schema_version?: string;
          adapter_version?: string;
          model_provider?: string;
          model_name?: string;
          model_policy_version?: string;
          pricing_version?: string;
          entitlement_version?: string;
          input_tokens?: number;
          output_tokens?: number;
          estimated_cost_usd?: string;
          actual_cost_usd?: string | null;
          created_at?: string;
          started_at?: string | null;
          completed_at?: string | null;
        };
      };
      quota_reservations: {
        Row: {
          id: string;
          compilation_run_id: string;
          user_id: string;
          usage_date: string;
          amount: number;
          status: 'reserved' | 'committed' | 'refunded';
          reserved_at: string;
          expires_at: string;
          resolved_at: string | null;
        };
        Insert: {
          id?: string;
          compilation_run_id: string;
          user_id: string;
          usage_date: string;
          amount?: number;
          status?: 'reserved' | 'committed' | 'refunded';
          reserved_at?: string;
          expires_at: string;
          resolved_at?: string | null;
        };
        Update: {
          id?: string;
          compilation_run_id?: string;
          user_id?: string;
          usage_date?: string;
          amount?: number;
          status?: 'reserved' | 'committed' | 'refunded';
          reserved_at?: string;
          expires_at?: string;
          resolved_at?: string | null;
        };
      };
      usage_events: {
        Row: {
          id: string;
          reservation_id: string | null;
          user_id: string | null;
          event_type: 'reservation' | 'completion' | 'refund' | 'admin_adjustment';
          amount: number;
          tokens: number;
          estimated_cost_usd: string;
          actual_cost_usd: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          reservation_id?: string | null;
          user_id?: string | null;
          event_type: 'reservation' | 'completion' | 'refund' | 'admin_adjustment';
          amount: number;
          tokens?: number;
          estimated_cost_usd?: string;
          actual_cost_usd?: string | null;
          metadata?: Json;
          created_at?: string;
        };
      };
    };
    Functions: {
      reserve_compilation_quota: {
        Args: {
          p_compilation_run_id: string;
          p_user_id: string;
          p_amount?: number;
        };
        Returns: Json;
      };
      commit_compilation_quota: {
        Args: {
          p_reservation_id: string;
          p_tokens?: number;
          p_actual_cost_usd?: number;
        };
        Returns: Json;
      };
      refund_compilation_quota: {
        Args: {
          p_reservation_id: string;
          p_reason?: string;
        };
        Returns: Json;
      };
      recover_stale_quota_reservations: {
        Args: Record<string, never>;
        Returns: number;
      };
      adjust_user_quota: {
        Args: {
          p_user_id: string;
          p_date: string;
          p_adjustment: number;
          p_reason: string;
        };
        Returns: Json;
      };
      override_subscription_tier: {
        Args: {
          p_user_id: string;
          p_tier: string;
          p_reason: string;
        };
        Returns: Json;
      };
      authorize_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
    };
  };
}
