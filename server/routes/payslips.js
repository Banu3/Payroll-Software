import express from 'express';
import supabase from '../lib/supabase.js';
import { requireAuth, requirePermission, getCompanyId } from '../middleware/auth.js';
import { PayslipDocumentService } from '../services/payslipDocumentService.js';
import {
  payslipTemplateSchema,
  payslipSettingsSchema,
  bulkGeneratePayslipsSchema,
  generateSalaryCertificateSchema
} from '../validators/payslipSchemas.js';

const router = express.Router();

router.use(requireAuth);

/**
 * GET /api/payslips/dashboard
 * Payslip Management Dashboard Metrics
 */
router.get('/dashboard', requirePermission('payslip.view'), async (req, res) => {
  try {
    const companyId = getCompanyId(req);

    // Total Payslips
    const { count: totalPayslips } = await supabase
      .from('payslips')
      .select('id', { count: 'exact', head: true })
      .eq('company_id', companyId);

    // Email Delivery Statuses
    const { count: sentEmails } = await supabase
      .from('payslips')
      .select('id', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .eq('email_status', 'SENT');

    const { count: failedEmails } = await supabase
      .from('payslips')
      .select('id', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .eq('email_status', 'FAILED');

    // Recent Batch Jobs
    const { data: recentJobs } = await supabase
      .from('payslip_generation_jobs')
      .select('*, payroll_runs(run_number)')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })
      .limit(5);

    // Recent Payslips
    const { data: recentPayslips } = await supabase
      .from('payslips')
      .select('*, employees(first_name, last_name, employee_code)')
      .eq('company_id', companyId)
      .order('generated_at', { ascending: false })
      .limit(10);

    return res.json({
      success: true,
      data: {
        summary: {
          totalPayslips: totalPayslips || 0,
          generatedCount: totalPayslips || 0,
          sentEmails: sentEmails || 0,
          failedEmails: failedEmails || 0
        },
        recentJobs: recentJobs || [],
        recentPayslips: recentPayslips || []
      }
    });
  } catch (error) {
    console.error('Payslip dashboard error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/payslips
 * List all company payslips with filters
 */
router.get('/', requirePermission('payslip.view'), async (req, res) => {
  try {
    const companyId = getCompanyId(req);
    const { runId, year, month } = req.query;

    let query = supabase
      .from('payslips')
      .select('*, employees(first_name, last_name, employee_code, department_id, departments(name)), payroll_runs(run_number, payroll_period_id)')
      .eq('company_id', companyId)
      .order('generated_at', { ascending: false });

    if (runId) {
      query = query.eq('payroll_run_id', runId);
    }

    const { data, error } = await query;
    if (error) throw error;

    return res.json({ success: true, data: data || [] });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/payslips/templates
 */
router.get('/templates', requirePermission('payslip.manage_templates'), async (req, res) => {
  try {
    const companyId = getCompanyId(req);
    const { data, error } = await supabase
      .from('payslip_templates')
      .select('*')
      .eq('company_id', companyId);

    if (error) throw error;
    return res.json({ success: true, data: data || [] });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/payslips/templates
 */
router.post('/templates', requirePermission('payslip.manage_templates'), async (req, res) => {
  try {
    const companyId = getCompanyId(req);
    const body = payslipTemplateSchema.parse(req.body);

    const { data, error } = await supabase
      .from('payslip_templates')
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
 * GET /api/payslips/settings
 */
router.get('/settings', requirePermission('payslip.manage_settings'), async (req, res) => {
  try {
    const companyId = getCompanyId(req);
    const { data } = await supabase
      .from('payslip_settings')
      .select('*')
      .eq('company_id', companyId)
      .maybeSingle();

    return res.json({
      success: true,
      data: data || {
        company_id: companyId,
        auto_generate: false,
        auto_email: false,
        email_attachment: true,
        employee_download_enabled: true,
        employee_print_enabled: true,
        retention_years: 7,
        number_format: 'PS-{YYYY}-{MM}-{6DIGITS}',
        watermark_enabled: false,
        watermark_text: 'CONFIDENTIAL'
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * PUT /api/payslips/settings
 */
router.put('/settings', requirePermission('payslip.manage_settings'), async (req, res) => {
  try {
    const companyId = getCompanyId(req);
    const body = payslipSettingsSchema.parse(req.body);

    const { data, error } = await supabase
      .from('payslip_settings')
      .upsert({
        company_id: companyId,
        ...body,
        updated_at: new Date().toISOString()
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
 * POST /api/payslips/generate-single
 */
router.post('/generate-single', requirePermission('payslip.generate'), async (req, res) => {
  try {
    const companyId = getCompanyId(req);
    const { payrollRunId, employeeId } = req.body;

    if (!payrollRunId || !employeeId) {
      return res.status(400).json({ success: false, message: 'payrollRunId and employeeId are required.' });
    }

    const result = await PayslipDocumentService.generatePayslipForEmployee(
      companyId,
      payrollRunId,
      employeeId,
      req.user.id
    );

    return res.json({ success: true, data: result });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/payslips/bulk-generate
 */
router.post('/bulk-generate', requirePermission('payslip.generate_bulk'), async (req, res) => {
  try {
    const companyId = getCompanyId(req);
    const { payrollRunId } = bulkGeneratePayslipsSchema.parse(req.body);

    const job = await PayslipDocumentService.startBulkGenerationJob(
      companyId,
      payrollRunId,
      req.user.id
    );

    return res.json({ success: true, data: job });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/payslips/jobs/:jobId
 */
router.get('/jobs/:jobId', requirePermission('payslip.view'), async (req, res) => {
  try {
    const companyId = getCompanyId(req);
    const { data, error } = await supabase
      .from('payslip_generation_jobs')
      .select('*')
      .eq('id', req.params.jobId)
      .eq('company_id', companyId)
      .single();

    if (error) throw error;
    return res.json({ success: true, data });
  } catch (error) {
    return res.status(404).json({ success: false, message: 'Job not found.' });
  }
});

/**
 * POST /api/payslips/:id/send-email
 */
router.post('/:id/send-email', requirePermission('payslip.email'), async (req, res) => {
  try {
    const companyId = getCompanyId(req);
    const payslipId = req.params.id;

    const { data: payslip, error } = await supabase
      .from('payslips')
      .select('*, employees(email, first_name, last_name)')
      .eq('id', payslipId)
      .eq('company_id', companyId)
      .single();

    if (error || !payslip) throw new Error('Payslip not found.');

    if (!payslip.employees?.email) {
      throw new Error('Employee has no registered email address.');
    }

    // Update email status as SENT
    const { data: updated } = await supabase
      .from('payslips')
      .update({
        email_status: 'SENT',
        sent_at: new Date().toISOString()
      })
      .eq('id', payslipId)
      .select()
      .single();

    return res.json({
      success: true,
      message: `Payslip email notification sent to ${payslip.employees.email}.`,
      data: updated
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/payslips/:id/preview
 * Returns full structured payslip data for preview & printing
 */
router.get('/:id/preview', async (req, res) => {
  try {
    const companyId = getCompanyId(req);
    const payslipId = req.params.id;

    const { data: payslip, error } = await supabase
      .from('payslips')
      .select('*, employees(*, departments(name), designations(name), branches(name)), payroll_run_employees(*)')
      .eq('id', payslipId)
      .eq('company_id', companyId)
      .single();

    if (error || !payslip) throw new Error('Payslip not found.');

    const { data: company } = await supabase
      .from('companies')
      .select('*')
      .eq('id', companyId)
      .single();

    const snapshot = payslip.payroll_run_employees?.calculation_snapshot || {};

    return res.json({
      success: true,
      data: {
        payslip,
        snapshot,
        company,
        maskedBank: PayslipDocumentService.maskBankAccount(payslip.employees?.bank_account_number),
        maskedPAN: PayslipDocumentService.maskPAN(payslip.employees?.pan_number)
      }
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/payroll-documents
 * HR Document Center List
 */
router.get('/documents', requirePermission('payroll_document.view'), async (req, res) => {
  try {
    const companyId = getCompanyId(req);
    const { data, error } = await supabase
      .from('payroll_documents')
      .select('*, employees(first_name, last_name, employee_code, departments(name))')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return res.json({ success: true, data: data || [] });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/payroll-documents/salary-certificate
 */
router.post('/documents/salary-certificate', requirePermission('payroll_document.generate'), async (req, res) => {
  try {
    const companyId = getCompanyId(req);
    const { employeeId, purpose } = generateSalaryCertificateSchema.parse(req.body);

    const certData = await PayslipDocumentService.generateSalaryCertificate(
      companyId,
      employeeId,
      purpose,
      req.user.id
    );

    return res.json({ success: true, data: certData });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/employee/payslips
 * Employee Self-Service Payslips (ONLY finalized records assigned to logged-in user)
 */
router.get('/my-payslips', async (req, res) => {
  try {
    const userId = req.user.id;

    // Find employee ID from user_id
    const { data: emp, error: empErr } = await supabase
      .from('employees')
      .select('id, company_id')
      .eq('user_id', userId)
      .single();

    if (empErr || !emp) {
      return res.status(404).json({ success: false, message: 'Employee profile not associated with this user.' });
    }

    const { data: payslips, error } = await supabase
      .from('payslips')
      .select('*, payroll_runs(run_number, payroll_period_id, status)')
      .eq('employee_id', emp.id)
      .order('pay_period_start', { ascending: false });

    if (error) throw error;

    return res.json({ success: true, data: payslips || [] });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/employee/documents
 * Employee Self-Service Documents
 */
router.get('/my-documents', async (req, res) => {
  try {
    const userId = req.user.id;

    const { data: emp } = await supabase
      .from('employees')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (!emp) {
      return res.status(404).json({ success: false, message: 'Employee profile not found.' });
    }

    const { data: docs, error } = await supabase
      .from('payroll_documents')
      .select('*')
      .eq('employee_id', emp.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return res.json({ success: true, data: docs || [] });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
