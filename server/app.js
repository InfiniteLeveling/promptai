import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

import { apiRateLimiter } from './middleware/rateLimiter.js';
import { notFoundHandler, globalErrorHandler } from './middleware/errorHandler.js';
import apiRoutes from './routes/index.js';

// Load environment variables
dotenv.config();

const app = express();

// Security Headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS Configuration
const allowedOrigin = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, same-origin, serverless) or matching origin / vercel domains
    if (!origin || origin === allowedOrigin || origin.startsWith('http://localhost:') || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-request-id']
}));

// Body Parsing Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate Limiter on API namespace
const apiPrefix = process.env.API_PREFIX || '/api';
app.use(apiPrefix, apiRateLimiter);

// Mount API Routes
app.use(apiPrefix, apiRoutes);

// 404 Route Handler
app.use(notFoundHandler);

// Centralized Global Error Handler
app.use(globalErrorHandler);

export default app;
