import pino from 'pino';

const isProduction = process.env.NODE_ENV === 'production';

// Sensitive keys to scrub from logs
const PII_PATHS = [
  'req.headers.authorization',
  'req.headers.cookie',
  'req.headers["x-api-key"]',
  'req.body.password',
  'req.body.token',
  'req.body.apiKey',
  'req.body.creditCard',
  'apiKey',
  'secret',
  'token',
  'password',
  'SUPABASE_SECRET_KEY',
  'STRIPE_SECRET_KEY'
];

export const logger = pino({
  level: process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug'),
  redact: {
    paths: PII_PATHS,
    censor: '[REDACTED]'
  },
  serializers: {
    req(req) {
      return {
        id: req.id,
        method: req.method,
        url: req.url,
        path: req.routerPath,
        parameters: req.params,
        headers: {
          host: req.headers.host,
          'user-agent': req.headers['user-agent'],
          'content-type': req.headers['content-type'],
          'x-request-id': req.headers['x-request-id']
        }
      };
    },
    res(res) {
      return {
        statusCode: res.statusCode
      };
    },
    err: pino.stdSerializers.err
  },
  timestamp: pino.stdTimeFunctions.isoTime
});
