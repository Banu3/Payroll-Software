import crypto from 'crypto';
import supabase from '../lib/supabase.js';

export class AnalyticsEngineService {

  /**
   * Executive Management Dashboard Metrics Aggregator
   */
  static async getExecutiveOverview(companyId) {
    // 1. Workforce Metrics
    const { count: totalEmployees } = await supabase
      .from('employees')
      .select('id', { count: 'exact', head: true })
      .eq('company_id', companyId);

    const { count: activeEmployees } = await supabase
      .from('employees')
      .select('id', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .eq('status', 'ACTIVE');

    const { count: noticeEmployees } = await supabase
      .from('employees')
      .select('id', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .eq('status', 'NOTICE_PERIOD');

    // 2. Payroll Aggregates (Finalized Runs)
    const { data: recentRuns } = await supabase
      .from('payroll_runs')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })
      .limit(6);

    let latestGross = 0;
    let latestNet = 0;
    let latestEmployerCost = 0;
    let latestOvertime = 0;
    let latestLOP = 0;

    if (recentRuns && recentRuns.length > 0) {
      const run = recentRuns[0];
      latestGross = Number(run.total_gross || 0);
      latestNet = Number(run.total_net_pay || run.total_net || 0);
      latestEmployerCost = Number(run.total_employer_cost || 0);
      latestOvertime = Number(run.total_overtime || 0);
      latestLOP = Number(run.total_lop || 0);
    }

    // 3. Payment Aggregates
    const { data: batches } = await supabase
      .from('payment_batches')
      .select('total_net_amount, status')
      .eq('company_id', companyId);

    let totalPaid = 0;
    let pendingDisbursement = 0;

    (batches || []).forEach((b) => {
      const amt = Number(b.total_net_amount || 0);
      if (b.status === 'COMPLETED' || b.status === 'RECONCILED') totalPaid += amt;
      else pendingDisbursement += amt;
    });

    // 4. Department Distribution
    const { data: deptData } = await supabase
      .from('departments')
      .select('id, name, employees(count)')
      .eq('company_id', companyId);

    const departmentStats = (deptData || []).map((d) => ({
      name: d.name,
      count: d.employees?.[0]?.count || 0
    }));

    return {
      workforce: {
        totalEmployees: totalEmployees || 0,
        activeEmployees: activeEmployees || 0,
        noticeEmployees: noticeEmployees || 0,
        attritionRate: activeEmployees > 0 ? (noticeEmployees / activeEmployees) * 100 : 0
      },
      payroll: {
        latestGross,
        latestNet,
        latestEmployerCost,
        latestOvertime,
        latestLOP,
        averageSalary: activeEmployees > 0 ? latestGross / activeEmployees : 0,
        trend: recentRuns || []
      },
      payments: {
        totalPaid,
        pendingDisbursement
      },
      departments: departmentStats
    };
  }

  /**
   * SAFE Report Query Builder - Whitelisted Execution
   */
  static async executeCustomReport(companyId, dataSource, selectedFields, filters = []) {
    let tableName = 'employees';

    switch (dataSource) {
      case 'EMPLOYEES':
        tableName = 'employees';
        break;
      case 'PAYROLL':
        tableName = 'payroll_run_employees';
        break;
      case 'ATTENDANCE':
        tableName = 'attendance_records';
        break;
      case 'LEAVE':
        tableName = 'leave_requests';
        break;
      case 'PAYMENTS':
        tableName = 'payment_batch_items';
        break;
      case 'STATUTORY':
        tableName = 'statutory_reports';
        break;
      default:
        tableName = 'employees';
    }

    let query = supabase.from(tableName).select('*').eq('company_id', companyId);

    // Apply safe filters
    (filters || []).forEach((f) => {
      if (f.field && f.value !== undefined) {
        if (f.operator === 'eq') query = query.eq(f.field, f.value);
        else if (f.operator === 'neq') query = query.neq(f.field, f.value);
        else if (f.operator === 'gt') query = query.gt(f.field, f.value);
        else if (f.operator === 'lt') query = query.lt(f.field, f.value);
        else if (f.operator === 'contains') query = query.ilike(f.field, `%${f.value}%`);
      }
    });

    const { data, error } = await query.limit(500);
    if (error) throw error;
    return data || [];
  }

  /**
   * Export Custom Report to CSV with SHA-256 Hash
   */
  static async exportReportToCSV(companyId, reportName, rows, userId) {
    if (!rows || rows.length === 0) {
      throw new Error('No data available to export.');
    }

    const keys = Object.keys(rows[0]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [keys.join(','), ...rows.map((r) => keys.map((k) => `"${r[k] ?? ''}"`).join(','))].join('\n');

    const fileHash = crypto.createHash('sha256').update(csvContent).digest('hex');
    const fileName = `${reportName.replace(/\s+/g, '_')}_${Date.now()}.csv`;
    const filePath = `reports-export/${companyId}/${fileName}`;

    const { data: job, error } = await supabase
      .from('report_export_jobs')
      .insert({
        company_id: companyId,
        export_name: reportName,
        file_type: 'CSV',
        file_path: filePath,
        file_hash: fileHash,
        status: 'COMPLETED',
        created_by: userId,
        completed_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return { job, csvContent, fileName };
  }
}
