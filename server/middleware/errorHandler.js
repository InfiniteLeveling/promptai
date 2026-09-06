import { v4 as uuidv4 } from 'uuid';

/**
 * 404 Not Found Middleware
 */
export const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    status: 'error',
    error_code: 'RESOURCE_NOT_FOUND',
    message: `Cannot ${req.method} ${req.originalUrl} - Endpoint does not exist.`,
    details: {
      path: req.originalUrl,
      method: req.method
    },
    timestamp: new Date().toISOString(),
    request_id: uuidv4()
  });
};

/**
 * Global Error Handler Middleware
 */
export const globalErrorHandler = (err, req, res, next) => {
  const statusCode = err.status || err.statusCode || 500;
  const errorCode = err.error_code || (statusCode === 400 ? 'INVALID_INPUT_PAYLOAD' : 'INTERNAL_SERVER_ERROR');
  const requestId = req.headers['x-request-id'] || uuidv4();

  // Log error stack safely in non-production
  if (process.env.NODE_ENV !== 'production') {
    console.error(`[Error] [${requestId}] ${err.message}`, err.stack);
  }

  res.status(statusCode).json({
    status: 'error',
    error_code: errorCode,
    message: err.message || 'An unexpected internal error occurred.',
    details: err.details || {},
    timestamp: new Date().toISOString(),
    request_id: requestId
  });
};
