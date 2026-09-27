import express from 'express';
import supabase from '../lib/supabase.js';
import { requireAuth, requirePermission, getCompanyId } from '../middleware/auth.js';
import { BankPaymentAdapter } from '../services/bankPaymentAdapter.js';
import { StatutoryReportService } from '../services/statutoryReportService.js';
import {
  companyBankAccountSchema,
  createPaymentBatchSchema,
  generateBankFileSchema,
  reconcileBatchSchema,
  generateStatutoryReportSchema
} from '../validators/paymentStatutorySchemas.js';

const router = express.Router();

router.use(requireAuth);

/**
 * GET /api/payments/dashboard
 */
router.get('/dashboard', requirePermission('payment.view'), async (req, res) => {
  try {
    const companyId = getCompanyId(req);

    // Total Batches
    const { data: batches } = await supabase
      .from('payment_batches')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    let pendingPayment = 0;
    let totalPaid = 0;
    let totalFailed = 0;

    (batches || []).forEach((b) => {
      const amt = Number(b.total_net_amount || 0);
      if (b.status === 'COMPLETED' || b.status === 'RECONCILED') totalPaid += amt;
      else if (b.status === 'FAILED') totalFailed += amt;
      else pendingPayment += amt;
    });

    return res.json({
      success: true,
      data: {
        summary: {
          pendingPayment,
          totalPaid,
          totalFailed,
          totalBatches: batches?.length || 0
        },
        batches: batches || []
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/payments/bank-accounts
 */
router.get('/bank-accounts', requirePermission('bank_account.view'), async (req, res) => {
  try {
    const companyId = getCompanyId(req);
    const { data, error } = await supabase
      .from('company_bank_accounts')
      .select('*')
      .eq('company_id', companyId)
      .order('is_default', { ascending: false });

    if (error) throw error;
    return res.json({ success: true, data: data || [] });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/payments/bank-accounts
 */
router.post('/bank-accounts', requirePermission('bank_account.manage'), async (req, res) => {
  try {
    const companyId = getCompanyId(req);
    const body = companyBankAccountSchema.parse(req.body);

    const { data, error } = await supabase
      .from('company_bank_accounts')
      .insert({
        company_id: companyId,
        ...body
      })
      .select()
      .single();

    if (error) throw error;
    return res.json({ success: true, data });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/payments/batches
 */
router.get('/batches', requirePermission('payment.view'), async (req, res) => {
  try {
    const companyId = getCompanyId(req);
    const { data, error } = await supabase
      .from('payment_batches')
      .select('*, company_bank_accounts(bank_name, account_number), payroll_runs(run_number, payroll_period_id)')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return res.json({ success: true, data: data || [] });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/payments/batches
 */
router.post('/batches', requirePermission('payment.create'), async (req, res) => {
  try {
    const companyId = getCompanyId(req);
    const { payrollRunId, companyBankAccountId, notes } = createPaymentBatchSchema.parse(req.body);

    const result = await BankPaymentAdapter.createPaymentBatch(
      companyId,
      payrollRunId,
      companyBankAccountId,
      notes,
      req.user.id
    );

    return res.json({ success: true, data: result });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/payments/batches/:id
 */
router.get('/batches/:id', requirePermission('payment.view'), async (req, res) => {
  try {
    const companyId = getCompanyId(req);
    const { data: batch, error: bErr } = await supabase
      .from('payment_batches')
      .select('*, company_bank_accounts(*), payroll_runs(*)')
      .eq('id', req.params.id)
      .eq('company_id', companyId)
      .single();

    if (bErr || !batch) throw new Error('Payment batch not found.');

    const { data: items } = await supabase
      .from('payment_batch_items')
      .select('*')
      .eq('payment_batch_id', req.params.id);

    return res.json({ success: true, data: { batch, items: items || [] } });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/payments/batches/:id/approve
 */
router.post('/batches/:id/approve', requirePermission('payment.approve'), async (req, res) => {
  try {
    const companyId = getCompanyId(req);
    const { data: updated, error } = await supabase
      .from('payment_batches')
      .update({
        status: 'READY',
        approved_by: req.user.id,
        approved_at: new Date().toISOString()
      })
      .eq('id', req.params.id)
      .eq('company_id', companyId)
      .select()
      .single();

    if (error) throw error;
    return res.json({ success: true, data: updated });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/payments/batches/:id/generate-file
 */
router.post('/batches/:id/generate-file', requirePermission('payment.export'), async (req, res) => {
  try {
    const companyId = getCompanyId(req);
    const { fileFormat = 'CSV' } = req.body;

    const fileResult = await BankPaymentAdapter.generateBankTransferFile(
      companyId,
      req.params.id,
      fileFormat,
      req.user.id
    );

    return res.json({
      success: true,
      message: 'Bank transfer file generated. Upload this file through your bank’s authorized portal.',
      data: fileResult
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/payments/batches/:id/reconcile
 */
router.post('/batches/:id/reconcile', requirePermission('payment.reconcile'), async (req, res) => {
  try {
    const companyId = getCompanyId(req);
    const reconResult = await BankPaymentAdapter.reconcilePaymentBatch(
      companyId,
      req.params.id,
      req.user.id
    );

    return res.json({ success: true, data: reconResult });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/statutory/dashboard
 */
router.get('/statutory/dashboard', requirePermission('statutory.view'), async (req, res) => {
  try {
    const companyId = getCompanyId(req);

    const { data: reports } = await supabase
      .from('statutory_reports')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    return res.json({ success: true, data: reports || [] });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/statutory/pf
 */
router.post('/statutory/pf', requirePermission('statutory.export'), async (req, res) => {
  try {
    const companyId = getCompanyId(req);
    const { year, month } = req.body;

    const result = await StatutoryReportService.generatePFReport(
      companyId,
      parseInt(year),
      parseInt(month),
      req.user.id
    );

    return res.json({ success: true, data: result });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/statutory/esi
 */
router.post('/statutory/esi', requirePermission('statutory.export'), async (req, res) => {
  try {
    const companyId = getCompanyId(req);
    const { year, month } = req.body;

    const result = await StatutoryReportService.generateESIReport(
      companyId,
      parseInt(year),
      parseInt(month),
      req.user.id
    );

    return res.json({ success: true, data: result });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/employee/payments
 */
router.get('/employee/payments', async (req, res) => {
  try {
    const userId = req.user.id;

    const { data: emp } = await supabase
      .from('employees')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (!emp) return res.status(404).json({ success: false, message: 'Employee profile not found.' });

    const { data: items } = await supabase
      .from('payment_batch_items')
      .select('*, payment_batches(batch_number, created_at, status)')
      .eq('employee_id', emp.id)
      .order('created_at', { ascending: false });

    return res.json({ success: true, data: items || [] });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
