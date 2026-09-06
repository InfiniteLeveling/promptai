import app from './app.js';

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`[PromptArchitect Server] Running on http://localhost:${PORT}`);
  console.log(`[PromptArchitect Server] Health check: http://localhost:${PORT}/api/health`);
  console.log(`[PromptArchitect Server] Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful Shutdown Handlers
const handleShutdown = (signal) => {
  console.log(`[PromptArchitect Server] Received ${signal}. Shutting down gracefully...`);
  server.close(() => {
    console.log('[PromptArchitect Server] Closed all active HTTP connections.');
    process.exit(0);
  });

  // Force shutdown if connections do not close in 5s
  setTimeout(() => {
    console.error('[PromptArchitect Server] Forcefully shutting down due to timeout.');
    process.exit(1);
  }, 5000);
};

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));

// Unhandled Promise Rejection Defense (Never crash without logging)
process.on('unhandledRejection', (reason, promise) => {
  console.error('[PromptArchitect Server] Unhandled Promise Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('[PromptArchitect Server] Uncaught Exception thrown:', error);
});
