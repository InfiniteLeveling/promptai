import type { Database } from './types.js';

// Pre-seeded blueprints from seed.sql
const DEFAULT_BLUEPRINTS: Database['public']['Tables']['blueprints']['Row'][] = [
  {
    id: 'b0000000-0000-0000-0000-000000000001',
    slug: 'tpl_payment_reconciler',
    title: 'Autonomous Payment Reconciliation Engine',
    description: 'High-throughput Stripe and banking transaction reconciler with double-entry ledgers.',
    category: 'Fintech & Payments',
    complexity: 'Enterprise',
    spec: { archetype: 'Fintech Reconciliation' },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'b0000000-0000-0000-0000-000000000002',
    slug: 'tpl_saas_multi_tenant',
    title: 'B2B Multi-Tenant Core Platform',
    description: 'Enterprise multi-tenant SaaS skeleton with Row Level Security and RBAC.',
    category: 'SaaS Infrastructure',
    complexity: 'Enterprise',
    spec: { archetype: 'B2B SaaS Multi-Tenant' },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'b0000000-0000-0000-0000-000000000003',
    slug: 'tpl_mobile_offline_sync',
    title: 'Offline-First Mobile Sync Architecture',
    description: 'Cross-platform mobile application with conflict-free local database replication.',
    category: 'Mobile Applications',
    complexity: 'Advanced',
    spec: { archetype: 'Offline-First Mobile Sync' },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'b0000000-0000-0000-0000-000000000004',
    slug: 'tpl_cyber_dashboard',
    title: 'Cybersecurity Threat Detection Dashboard',
    description: 'Real-time security telemetry ingestion pipeline with streaming alert dispatch.',
    category: 'Security & Analytics',
    complexity: 'Advanced',
    spec: { archetype: 'Cybersecurity Telemetry Stream' },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'b0000000-0000-0000-0000-000000000005',
    slug: 'tpl_autonomous_agent',
    title: 'Autonomous Coding Agent Execution Environment',
    description: 'Secure sandboxed runner and file-system virtualizer for AI engineering agents.',
    category: 'AI Platform Engineering',
    complexity: 'Enterprise',
    spec: { archetype: 'Autonomous Agent Platform' },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export class MockDatabase {
  public blueprints = [...DEFAULT_BLUEPRINTS];
  public profiles: any[] = [];
  public prompts: any[] = [];
  public prompt_versions: any[] = [];
  public plan_entitlements: any[] = [
    { plan: 'free', version: '2026-Q3-v1', daily_compilations: 5 },
    { plan: 'pro', version: '2026-Q3-v1', daily_compilations: 100 },
    { plan: 'developer', version: '2026-Q3-v1', daily_compilations: 1000 }
  ];
  public usage_counters: any[] = [];
  public compilation_runs: any[] = [];
  public quota_reservations: any[] = [];
  public usage_events: any[] = [];
  public idempotency_keys: any[] = [];
  public subscriptions: any[] = [];
  public billing_events: any[] = [];
  public storage_objects: any[] = [];
  public compilation_jobs: any[] = [];
  public compilation_attempts: any[] = [];
  public deletion_requests: any[] = [];
  public account_deletions: any[] = [];
  public audit_logs: any[] = [];
  public migration_locks: any[] = [];

  createClient(): any {
    const db = this;

    return {
      auth: {
        admin: {
          async signOut(_userId: string) {
            return { error: null };
          },
          async deleteUser(userId: string) {
            const idx = db.profiles.findIndex((p: any) => p.id === userId);
            if (idx >= 0) db.profiles.splice(idx, 1);
            return { data: { user: null }, error: null };
          }
        }
      },

      storage: {
        from(bucket: string) {
          return {
            async createSignedUploadUrl(path: string) {
              return {
                data: { signedUrl: `https://storage.promptarchitect.local/${bucket}/${path}?token=mock_upload_token` },
                error: null
              };
            },
            async createSignedUrl(path: string, _expiresIn = 900) {
              return {
                data: { signedUrl: `https://storage.promptarchitect.local/${bucket}/${path}?token=mock_download_token` },
                error: null
              };
            },
            async remove(paths: string[]) {
              return { data: paths, error: null };
            }
          };
        }
      },

      from(tableName: string) {
        let filters: Array<(row: any) => boolean> = [];
        let orderBy: { field: string; ascending: boolean } | null = null;
        let limitVal: number | null = null;
        let rangeVal: { from: number; to: number } | null = null;
        let isInsert = false;
        let insertData: any = null;
        let isUpsert = false;
        let upsertData: any = null;
        let isUpdate = false;
        let updateData: any = null;
        let isDelete = false;

        if (!(db as any)[tableName]) {
          (db as any)[tableName] = [];
        }
        const table: any[] = (db as any)[tableName];

        const queryBuilder: any = {
          select(_fields = '*') {
            return queryBuilder;
          },
          delete() {
            isDelete = true;
            return queryBuilder;
          },
          eq(column: string, value: any) {
            filters.push((row) => row[column] === value);
            return queryBuilder;
          },
          is(column: string, value: any) {
            if (value === null) {
              filters.push((row) => row[column] === null || row[column] === undefined);
            } else {
              filters.push((row) => row[column] === value);
            }
            return queryBuilder;
          },
          or(_filterStr: string) {
            // Basic OR parser for user_id.eq.X,is_public.eq.true
            filters.push(() => true);
            return queryBuilder;
          },
          order(field: string, opts = { ascending: true }) {
            orderBy = { field, ascending: opts.ascending };
            return queryBuilder;
          },
          limit(n: number) {
            limitVal = n;
            return queryBuilder;
          },
          range(from: number, to: number) {
            rangeVal = { from, to };
            return queryBuilder;
          },
          insert(data: any) {
            isInsert = true;
            insertData = Array.isArray(data) ? data : [data];
            return queryBuilder;
          },
          upsert(data: any) {
            isUpsert = true;
            upsertData = Array.isArray(data) ? data : [data];
            return queryBuilder;
          },
          update(data: any) {
            isUpdate = true;
            updateData = data;
            return queryBuilder;
          },
          async then(resolve: any) {
            let resultData: any = null;

            if (isInsert) {
              const inserted = insertData.map((item: any) => ({
                id: item.id || crypto.randomUUID(),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                ...item
              }));
              table.push(...inserted);
              resultData = Array.isArray(insertData) && insertData.length > 1 ? inserted : inserted[0];
            } else if (isUpsert) {
              const upserted: any[] = [];
              for (const item of upsertData) {
                const existingIdx = table.findIndex((r: any) =>
                  (item.id && r.id === item.id) ||
                  (item.lock_name && r.lock_name === item.lock_name) ||
                  (item.slug && r.slug === item.slug) ||
                  (item.stripe_subscription_id && r.stripe_subscription_id === item.stripe_subscription_id) ||
                  (item.user_id && r.user_id === item.user_id)
                );
                if (existingIdx >= 0) {
                  table[existingIdx] = { ...table[existingIdx], ...item, updated_at: new Date().toISOString() };
                  upserted.push(table[existingIdx]);
                } else {
                  const newRow = {
                    id: item.id || crypto.randomUUID(),
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    ...item
                  };
                  table.push(newRow);
                  upserted.push(newRow);
                }
              }
              resultData = Array.isArray(upsertData) && upsertData.length > 1 ? upserted : upserted[0];
            } else if (isUpdate) {
              const matches = table.filter((row: any) => filters.every((f) => f(row)));
              for (const row of matches) {
                Object.assign(row, updateData, { updated_at: new Date().toISOString() });
              }
              resultData = matches[0] || null;
            } else if (isDelete) {
              const matches = table.filter((row: any) => filters.every((f) => f(row)));
              for (const row of matches) {
                const idx = table.indexOf(row);
                if (idx >= 0) {
                  table.splice(idx, 1);
                }
              }
              resultData = matches;
            } else {
              let rows = table.filter((row: any) => filters.every((f) => f(row)));
              if (orderBy) {
                rows.sort((a: any, b: any) => {
                  const valA = a[orderBy!.field];
                  const valB = b[orderBy!.field];
                  return orderBy!.ascending ? (valA > valB ? 1 : -1) : valA < valB ? 1 : -1;
                });
              }
              if (rangeVal) {
                rows = rows.slice(rangeVal.from, rangeVal.to + 1);
              } else if (limitVal !== null) {
                rows = rows.slice(0, limitVal);
              }
              resultData = rows;
            }

            return resolve({ data: resultData, error: null });
          },
          async single() {
            const res = await queryBuilder;
            const item = Array.isArray(res.data) ? res.data[0] : res.data;
            return { data: item || null, error: item ? null : { message: 'Row not found' } };
          },
          async maybeSingle() {
            const res = await queryBuilder;
            const item = Array.isArray(res.data) ? res.data[0] : res.data;
            return { data: item || null, error: null };
          }
        };

        return queryBuilder;
      },

      async rpc(fnName: string, args?: any) {
        if (fnName === 'reserve_compilation_quota') {
          const reservationId = crypto.randomUUID();
          db.quota_reservations.push({
            id: reservationId,
            compilation_run_id: args?.p_compilation_run_id,
            user_id: args?.p_user_id,
            amount: args?.p_amount || 1,
            status: 'reserved'
          });
          return { data: { success: true, reservation_id: reservationId }, error: null };
        }

        if (fnName === 'commit_compilation_quota') {
          const res = db.quota_reservations.find((r) => r.id === args?.p_reservation_id);
          if (res) res.status = 'committed';
          return { data: { success: true, status: 'committed' }, error: null };
        }

        if (fnName === 'refund_compilation_quota') {
          const res = db.quota_reservations.find((r) => r.id === args?.p_reservation_id);
          if (res) res.status = 'refunded';
          return { data: { success: true, status: 'refunded' }, error: null };
        }

        if (fnName === 'recover_stale_quota_reservations') {
          const now = Date.now();
          let recovered = 0;
          for (const res of db.quota_reservations) {
            if (res.status === 'reserved' && new Date(res.expires_at || 0).getTime() < now) {
              res.status = 'refunded';
              recovered++;
            }
          }
          return { data: recovered, error: null };
        }

        if (fnName === 'claim_next_compilation_job') {
          const now = Date.now();
          const job = db.compilation_jobs.find(
            (j) => j.status === 'queued' || (j.status === 'running' && new Date(j.lease_expires_at || 0).getTime() < now)
          );

          if (!job) {
            return { data: [], error: null };
          }

          const attemptId = crypto.randomUUID();
          db.compilation_attempts.push({
            id: attemptId,
            compilation_run_id: job.compilation_run_id,
            attempt_number: (job.retry_count || 0) + 1,
            worker_id: args?.p_worker_id,
            status: 'running'
          });

          job.worker_id = args?.p_worker_id;
          job.current_attempt_id = attemptId;
          job.retry_count = (job.retry_count || 0) + 1;
          job.lease_started_at = new Date().toISOString();
          job.lease_expires_at = new Date(Date.now() + (args?.p_lease_seconds || 60) * 1000).toISOString();
          job.heartbeat_at = new Date().toISOString();
          job.status = 'running';

          const run = db.compilation_runs.find((r) => r.id === job.compilation_run_id);
          return {
            data: [
              {
                job_id: job.id,
                compilation_run_id: job.compilation_run_id,
                current_attempt_id: attemptId,
                retry_count: job.retry_count,
                max_retries: job.max_retries || 3,
                run_input_hash: run?.input_hash || 'mock_hash',
                run_spec: run?.spec || { prompt: 'Synthesize architecture spec' },
                run_user_id: run?.user_id || 'mock_user'
              }
            ],
            error: null
          };
        }

        if (fnName === 'worker_heartbeat') {
          const job = db.compilation_jobs.find(
            (j) => j.id === args?.p_job_id && j.worker_id === args?.p_worker_id && j.status === 'running'
          );
          if (job) {
            job.heartbeat_at = new Date().toISOString();
            job.lease_expires_at = new Date(Date.now() + (args?.p_lease_seconds || 60) * 1000).toISOString();
            return { data: true, error: null };
          }
          return { data: false, error: null };
        }

        if (fnName === 'finalize_compilation_job') {
          const job = db.compilation_jobs.find((j) => j.id === args?.p_job_id);
          if (!job) {
            return { data: { success: false, error: 'Job not found' }, error: null };
          }

          if (args?.p_status === 'completed') {
            job.status = 'completed';
            const attempt = db.compilation_attempts.find((a) => a.id === job.current_attempt_id);
            if (attempt) {
              attempt.status = 'completed';
              attempt.tokens_consumed = args?.p_tokens || 0;
              attempt.actual_cost_usd = args?.p_actual_cost_usd || null;
            }
            const run = db.compilation_runs.find((r) => r.id === job.compilation_run_id);
            if (run) run.status = 'completed';

            const res = db.quota_reservations.find((r) => r.compilation_run_id === job.compilation_run_id);
            if (res && res.status === 'reserved') res.status = 'committed';

            return { data: { success: true, status: 'completed' }, error: null };
          } else if (args?.p_status === 'failed') {
            const attempt = db.compilation_attempts.find((a) => a.id === job.current_attempt_id);
            if (attempt) {
              attempt.status = 'failed';
              attempt.error_message = args?.p_error_message;
            }

            if (job.retry_count >= (job.max_retries || 3)) {
              job.status = 'dead_letter';
              const run = db.compilation_runs.find((r) => r.id === job.compilation_run_id);
              if (run) {
                run.status = 'failed';
                run.error_message = args?.p_error_message;
              }
              const res = db.quota_reservations.find((r) => r.compilation_run_id === job.compilation_run_id);
              if (res && res.status === 'reserved') res.status = 'refunded';

              return { data: { success: true, status: 'dead_letter' }, error: null };
            } else {
              job.status = 'queued';
              job.worker_id = null;
              job.lease_started_at = null;
              job.lease_expires_at = null;
              return { data: { success: true, status: 'queued_retry' }, error: null };
            }
          }
        }

        return { data: null, error: null };
      }
    };
  }
}

export const mockDb = new MockDatabase();
