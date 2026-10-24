import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { errorHandler } from './middleware/errorHandler.js';
import { sendResponse } from './utils/response.js';

import authRoutes from './modules/auth/auth.routes.js';
import productRoutes from './modules/products/products.routes.js';
import campaignRoutes from './modules/campaigns/campaigns.routes.js';
import commitmentRoutes from './modules/commitments/commitments.routes.js';
import walletRoutes from './modules/wallet/wallet.routes.js';
import fulfillmentRoutes from './modules/fulfillment/fulfillment.routes.js';
import adminRoutes from './modules/admin/admin.routes.js';
import notificationRoutes from './modules/notifications/notifications.routes.js';
import meherbanRoutes from './modules/meherban/meherban.routes.js';
import { processExpiredCampaigns } from './workers/expiryWorker.js';

const app = express();

// Security Hardening with Helmet & CORS
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate Limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: 429,
    message: 'Too many requests from this IP, please try again after 15 minutes.',
    errors: ['RATE_LIMIT_EXCEEDED'],
  },
});
app.use('/api/', generalLimiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: 429,
    message: 'Too many authentication attempts from this IP, please try again later.',
    errors: ['AUTH_RATE_LIMIT_EXCEEDED'],
  },
});
app.use('/api/v1/auth/login', authLimiter);
app.use('/api/v1/auth/register', authLimiter);

// Health Check Endpoint
app.get('/api/v1/health', (_req, res) => {
  sendResponse(res, {
    statusCode: 200,
    message: 'BazarPool Backend Service is healthy and operational.',
    data: {
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      service: 'BazarPool REST API',
      version: '1.0.0',
    },
  });
});

// Mount Feature API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/campaigns', campaignRoutes);
app.use('/api/v1/commitments', commitmentRoutes);
app.use('/api/v1/wallet', walletRoutes);
app.use('/api/v1/fulfillment', fulfillmentRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/meherban', meherbanRoutes);
app.use('/api/meherban', meherbanRoutes);

// Vercel Serverless Cron Trigger for automated refunds
app.all('/api/v1/cron/expiry', async (_req, res) => {
  try {
    await processExpiredCampaigns();
    sendResponse(res, {
      statusCode: 200,
      message: 'Expired campaigns processed and refunded successfully.',
    });
  } catch (error: any) {
    sendResponse(res, {
      statusCode: 500,
      message: 'Failed to process campaign expirations.',
      errors: [error.message],
    });
  }
});

// Catch-all 404 Route
app.use('*', (req, res) => {
  sendResponse(res, {
    statusCode: 404,
    message: `API Route ${req.originalUrl} not found on this server.`,
    errors: ['NOT_FOUND'],
  });
});

// Global Error Handler
app.use(errorHandler);

export default app;
