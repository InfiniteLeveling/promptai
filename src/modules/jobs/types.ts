export interface ClaimedJob {
  job_id: string;
  compilation_run_id: string;
  current_attempt_id: string;
  retry_count: number;
  max_retries: number;
  run_input_hash: string;
  run_spec: any;
  run_user_id: string;
}

export interface FinalizeJobOptions {
  status: 'completed' | 'failed';
  errorMessage?: string;
  tokens?: number;
  actualCostUsd?: number;
}
