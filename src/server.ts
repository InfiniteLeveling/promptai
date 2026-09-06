import { buildApp } from './app.js';
import { logger } from './infrastructure/observability/logger.js';

const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = process.env.HOST || '0.0.0.0';

async function start() {
  try {
    const app = await buildApp();

    await app.listen({ port: PORT, host: HOST });
    logger.info(`PromptArchitect Fastify Server listening at http://${HOST}:${PORT}`);

    // Graceful Shutdown Signals
    const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM'];
    for (const signal of signals) {
      process.on(signal, async () => {
        logger.info(`Received ${signal}, closing Fastify server gracefully...`);
        try {
          await app.close();
          logger.info('Fastify server closed successfully');
          process.exit(0);
        } catch (err) {
          logger.error({ err }, 'Error during graceful shutdown');
          process.exit(1);
        }
      });
    }
  } catch (err) {
    logger.fatal({ err }, 'Failed to bootstrap Fastify server');
    process.exit(1);
  }
}

start();
