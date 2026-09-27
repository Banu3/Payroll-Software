import express from 'express';
import supabase from '../lib/supabase.js';
import { requireAuth, requirePermission, getCompanyId } from '../middleware/auth.js';
import { AnalyticsEngineService } from '../services/analyticsEngineService.js';
import {
  saveCustomReportSchema,
  scheduleReportSchema,
  dashboardLayoutSchema
} from '../validators/analyticsReportSchemas.js';

const router = express.Router();

router.use(requireAuth);

/**
 * GET /api/analytics/overview
 * Executive Management Dashboard Metrics
 */
router.get('/overview', requirePermission('analytics.view'), async (req, res) => {
  try {
    const companyId = getCompanyId(req);
    const overview = await AnalyticsEngineService.getExecutiveOverview(companyId);
    return res.json({ success: true, data: overview });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/analytics/payroll
 * Payroll Analytics (Gross vs Net, Employer Cost, Deductions, Variance)
 */
router.get('/payroll', requirePermission('analytics.view'), async (req, res) => {
  try {
    const companyId = getCompanyId(req);

    const { data: runs, error } = await supabase
      .from('payroll_runs')
      .select('*, payroll_periods(month_year)')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return res.json({ success: true, data: runs || [] });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/analytics/employees
 * Workforce Analytics & Attrition Rates
 */
router.get('/employees', requirePermission('analytics.view'), async (req, res) => {
  try {
    const companyId = getCompanyId(req);

    const { data: employees, error } = await supabase
      .from('employees')
      .select('id, status, joining_date, department_id, designation_id, departments(name), designations(name)')
      .eq('company_id', companyId);

    if (error) throw error;
    return res.json({ success: true, data: employees || [] });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/reports
 * Saved Custom Reports List
 */
router.get('/reports-list', requirePermission('reports.view'), async (req, res) => {
  try {
    const companyId = getCompanyId(req);

    const { data, error } = await supabase
      .from('saved_reports')
      .select('*')
      .eq('company_id', companyId)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return res.json({ success: true, data: data || [] });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/reports
 * Save Custom Report Configuration
 */
router.post('/reports-save', requirePermission('reports.create'), async (req, res) => {
  try {
    const companyId = getCompanyId(req);
    const body = saveCustomReportSchema.parse(req.body);

    const { data, error } = await supabase
      .from('saved_reports')
      .insert({
        company_id: companyId,
        name: body.name,
        description: body.description,
        data_source: body.dataSource,
        selected_fields: body.selectedFields,
        filters: body.filters,
        grouping: body.grouping,
        sorting: body.sorting,
        visibility: body.visibility,
        owner_id: req.user.id
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
 * POST /api/reports/builder/execute
 * Execute Custom Report Query safely
 */
router.post('/reports/builder/execute', requirePermission('reports.view'), async (req, res) => {
  try {
    const companyId = getCompanyId(req);
    const { dataSource, selectedFields, filters } = req.body;

    if (!dataSource) {
      return res.status(400).json({ success: false, message: 'dataSource is required.' });
    }

    const rows = await AnalyticsEngineService.executeCustomReport(
      companyId,
      dataSource,
      selectedFields,
      filters
    );

    return res.json({ success: true, data: rows });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/reports/export
 * Export Center CSV Generation
 */
router.post('/reports/export', requirePermission('reports.export'), async (req, res) => {
  try {
    const companyId = getCompanyId(req);
    const { reportName, dataSource, filters } = req.body;

    const rows = await AnalyticsEngineService.executeCustomReport(
      companyId,
      dataSource || 'PAYROLL',
      [],
      filters || []
    );

    const result = await AnalyticsEngineService.exportReportToCSV(
      companyId,
      reportName || 'Custom_Report',
      rows,
      req.user.id
    );

    return res.json({ success: true, data: result });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/reports/exports
 * Export Center History
 */
router.get('/reports/exports', requirePermission('reports.export'), async (req, res) => {
  try {
    const companyId = getCompanyId(req);
    const { data, error } = await supabase
      .from('report_export_jobs')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return res.json({ success: true, data: data || [] });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
