import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { requirePermission, enforceTenantIsolation } from '../middleware/authorize.js';
import { auditService } from '../services/auditService.js';

const router = express.Router();

/**
 * GET /api/payroll/overview
 * Requires payroll.view permission & enforces tenant isolation
 */
router.get('/overview', authenticateToken, requirePermission('payroll.view'), enforceTenantIsolation, async (req, res) => {
  return res.status(200).json({
    success: true,
    data: {
      companyId: req.targetCompanyId,
      currentCycle: 'September 2026',
      totalEmployees: 48,
      grossPayrollAmount: 245000.00,
      netDisbursementAmount: 198250.00,
      taxDeductions: 34300.00,
      benefitDeductions: 12450.00,
      status: 'CALCULATED',
      paymentDueDate: '2026-09-30',
    },
    requestId: req.requestId,
  });
});

/**
 * POST /api/payroll/process
 * Requires payroll.process permission
 */
router.post('/process', authenticateToken, requirePermission('payroll.process'), enforceTenantIsolation, async (req, res) => {
  const { payPeriod } = req.body;

  await auditService.log({
    user: req.user,
    action: 'PAYROLL_PROCESSED',
    entity: 'PAYROLL_RUN',
    entityId: payPeriod || '2026-09',
    newValue: { status: 'PROCESSED', companyId: req.targetCompanyId },
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });

  return res.status(200).json({
    success: true,
    message: `Payroll calculation initiated for period ${payPeriod || 'Current Period'}.`,
    data: {
      payrollRunId: `pr_${Date.now()}`,
      status: 'PROCESSING',
      processedAt: new Date().toISOString(),
    },
    requestId: req.requestId,
  });
});

/**
 * POST /api/payroll/finalize
 * Requires payroll.finalize permission
 */
router.post('/finalize', authenticateToken, requirePermission('payroll.finalize'), enforceTenantIsolation, async (req, res) => {
  const { payrollRunId } = req.body;

  await auditService.log({
    user: req.user,
    action: 'PAYROLL_FINALIZED',
    entity: 'PAYROLL_RUN',
    entityId: payrollRunId || 'pr_latest',
    newValue: { status: 'FINALIZED', companyId: req.targetCompanyId },
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });

  return res.status(200).json({
    success: true,
    message: 'Payroll run successfully finalized and disbursement triggered.',
    data: {
      payrollRunId,
      status: 'FINALIZED',
      finalizedAt: new Date().toISOString(),
    },
    requestId: req.requestId,
  });
});

export default router;
