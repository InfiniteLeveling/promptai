import 'dotenv/config';
import { supabaseAdmin } from '../../infrastructure/database/supabaseClient.js';
import { CompilationWorker } from './worker.js';
import { logger } from '../../infrastructure/observability/logger.js';

const POLL_INTERVAL_MS = parseInt(process.env.WORKER_POLL_INTERVAL_MS || '2000', 10);
const STALE_CHECK_INTERVAL_MS = parseInt(process.env.WORKER_STALE_CHECK_MS || '60000', 10);
const WORKER_ID = process.env.WORKER_ID || `worker-${crypto.randomUUID().slice(0, 8)}`;
const LEASE_SECONDS = parseInt(process.env.WORKER_LEASE_SECONDS || '60', 10);

async function startWorker() {
  const worker = new CompilationWorker(supabaseAdmin, WORKER_ID, LEASE_SECONDS);
  worker.isRunning = true;

  logger.info({ workerId: WORKER_ID, pollIntervalMs: POLL_INTERVAL_MS }, 'PromptArchitect Compilation Worker started');

  let lastStaleCheck = Date.now();

  const shutdown = async (signal: string) => {
    logger.info({ signal, workerId: WORKER_ID }, 'Received shutdown signal, terminating worker loop...');
    worker.isRunning = false;
    worker.stopHeartbeat();
    setTimeout(() => {
      logger.info('Worker exited cleanly');
      process.exit(0);
    }, 1000);
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));

  while (worker.isRunning) {
    try {
      // 1. Recover stale reservations periodically
      if (Date.now() - lastStaleCheck > STALE_CHECK_INTERVAL_MS) {
        lastStaleCheck = Date.now();
        const recovered = await worker.recoverStaleReservations();
        if (recovered > 0) {
          logger.info({ recovered }, 'Recovered expired quota reservations');
        }
      }

      // 2. Poll and execute next compilation job
      const { claimed, result } = await worker.runOnce();
      if (claimed) {
        logger.info({ workerId: WORKER_ID, result }, 'Successfully processed compilation job');
      } else {
        // No jobs available, wait for poll interval
        await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
      }
    } catch (err) {
      logger.error({ err, workerId: WORKER_ID }, 'Unhandled error in worker execution loop');
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
}

startWorker().catch((err) => {
  logger.fatal({ err }, 'Fatal error during worker bootstrap');
  process.exit(1);
});
