import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import payrollRoutes from './routes/payroll.js';
import auditRoutes from './routes/audit.js';
import superAdminRoutes from './routes/superAdmin.js';
import hrRoutes from './routes/hr.js';
import attendanceRoutes from './routes/attendance.js';
import leaveRoutes from './routes/leave.js';
import compensationRoutes from './routes/compensation.js';
import payrollProcessingRoutes from './routes/payrollProcessing.js';
import payslipsRoutes from './routes/payslips.js';
import paymentStatutoryRoutes from './routes/paymentStatutory.js';
import analyticsReportsRoutes from './routes/analyticsReports.js';
import automationAiIntegrationRoutes from './routes/automationAiIntegrations.js';
import healthRoutes from './routes/health.js';
import { apiRateLimiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorHandler.js';
import { requestTracker } from './middleware/requestTracker.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Global Middlewares
app.use(helmet({
  contentSecurityPolicy: false, // Allows Vite inline scripts in dev
}));

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(requestTracker);

// Apply global rate limiting to all API endpoints
app.use('/api', apiRateLimiter);

// Health check endpoints
app.use('/health', healthRoutes);
app.use('/api/health', healthRoutes);

// Register API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/super-admin', superAdminRoutes);
app.use('/api/hr', hrRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leave', leaveRoutes);
app.use('/api/compensation', compensationRoutes);
app.use('/api/payroll-processing', payrollProcessingRoutes);
app.use('/api/payslips', payslipsRoutes);
app.use('/api/payments', paymentStatutoryRoutes);
app.use('/api/statutory', paymentStatutoryRoutes);
app.use('/api/analytics', analyticsReportsRoutes);
app.use('/api/reports', analyticsReportsRoutes);
app.use('/api/automation', automationAiIntegrationRoutes);
app.use('/api/ai', automationAiIntegrationRoutes);
app.use('/api/integrations', automationAiIntegrationRoutes);

// 404 Route Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`,
    code: 'NOT_FOUND',
    requestId: req.requestId || `req_${Date.now()}`,
  });
});

// Centralized Error Handling Middleware
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`  Enterprise Payroll Backend Running on Port ${PORT}`);
  console.log(`  Health Check: http://localhost:${PORT}/api/health`);
  console.log(`====================================================`);
});

export default app;
