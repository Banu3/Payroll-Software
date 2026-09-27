import crypto from 'crypto';
import supabase from '../lib/supabase.js';

/**
 * Enterprise Payslip & Payroll Document Service
 */
export class PayslipDocumentService {

  /**
   * Helper: Mask bank account number (e.g., "XXXX XXXX 4321")
   */
  static maskBankAccount(acc) {
    if (!acc) return 'N/A';
    const str = String(acc).trim();
    if (str.length <= 4) return str;
    const last4 = str.slice(-4);
    return `XXXX-XXXX-${last4}`;
  }

  /**
   * Helper: Mask PAN number (e.g., "XXXXX1234X")
   */
  static maskPAN(pan) {
    if (!pan) return 'N/A';
    const str = String(pan).trim();
    if (str.length !== 10) return str;
    return `${str.slice(0, 2)}XXXX${str.slice(6)}`;
  }

  /**
   * Generate Cryptographic SHA-256 Document Hash
   */
  static generateDocumentHash(payload) {
    const raw = JSON.stringify(payload);
    return crypto.createHash('sha256').update(raw).digest('hex');
  }

  /**
   * Generate Unique Payslip Number (e.g. PS-2026-09-000104)
   */
  static async generatePayslipNumber(companyId, year, month) {
    const mm = String(month).padStart(2, '0');
    const prefix = `PS-${year}-${mm}-`;
    
    const { count } = await supabase
      .from('payslips')
      .select('id', { count: 'exact', head: true })
      .eq('company_id', companyId);

    const seq = String((count || 0) + 1).padStart(6, '0');
    return `${prefix}${seq}`;
  }

  /**
   * Generate official Payslip for an Employee in a Finalized Payroll Run
   */
  static async generatePayslipForEmployee(companyId, payrollRunId, employeeId, userId) {
    // 1. Fetch Payroll Run & verify FINALIZED status
    const { data: run, error: runErr } = await supabase
      .from('payroll_runs')
      .select('*, payroll_periods(*)')
      .eq('id', payrollRunId)
      .eq('company_id', companyId)
      .single();

    if (runErr || !run) {
      throw new Error('Payroll run not found.');
    }

    if (run.status !== 'FINALIZED' && run.status !== 'APPROVED') {
      throw new Error('Payslips can only be generated for FINALIZED or APPROVED payroll runs.');
    }

    // 2. Fetch Immutable Calculation Snapshot from Part 7
    const { data: empRun, error: empErr } = await supabase
      .from('payroll_run_employees')
      .select('*, employees(*, departments(name), designations(name), branches(name))')
      .eq('payroll_run_id', payrollRunId)
      .eq('employee_id', employeeId)
      .single();

    if (empErr || !empRun) {
      throw new Error('Employee calculation record not found for this payroll run.');
    }

    // 3. Fetch Company settings & template
    const { data: company } = await supabase
      .from('companies')
      .select('*')
      .eq('id', companyId)
      .single();

    const { data: template } = await supabase
      .from('payslip_templates')
      .select('*')
      .eq('company_id', companyId)
      .eq('status', 'ACTIVE')
      .maybeSingle();

    const templateCfg = template || {
      show_company_logo: true,
      show_employer_contributions: true,
      show_attendance_summary: true,
      show_tax_details: true,
      show_bank_details: true,
      mask_bank_account: true,
      mask_pan: true,
      header_text: 'CONFIDENTIAL PAYSLIP STATEMENT',
      footer_text: 'This is a computer-generated document and does not require a physical signature.',
      primary_color: '#2563eb'
    };

    // 4. Check existing payslip for versioning
    const { data: existingPayslip } = await supabase
      .from('payslips')
      .select('*')
      .eq('payroll_run_id', payrollRunId)
      .eq('employee_id', employeeId)
      .maybeSingle();

    const version = existingPayslip ? existingPayslip.version + 1 : 1;
    const payslipNumber = existingPayslip
      ? existingPayslip.payslip_number
      : await this.generatePayslipNumber(companyId, run.payroll_period?.year || new Date().getFullYear(), run.payroll_period?.month || (new Date().getMonth() + 1));

    // 5. Build Document Hash from Part 7 Immutable Snapshot
    const snapshot = empRun.calculation_snapshot || {};
    const docPayload = {
      companyId,
      employeeId,
      payslipNumber,
      version,
      snapshot,
      gross: empRun.gross_earnings,
      deductions: empRun.total_deductions,
      net: empRun.net_salary
    };
    const documentHash = this.generateDocumentHash(docPayload);

    const periodStart = run.payroll_period?.start_date || new Date().toISOString().slice(0, 10);
    const periodEnd = run.payroll_period?.end_date || new Date().toISOString().slice(0, 10);
    const payDate = run.payroll_period?.pay_date || new Date().toISOString().slice(0, 10);

    // 6. Save or Update Payslip Record
    if (existingPayslip) {
      const { data: updated, error: uErr } = await supabase
        .from('payslips')
        .update({
          version,
          document_hash: documentHash,
          document_status: 'GENERATED',
          generated_at: new Date().toISOString(),
          generated_by: userId,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingPayslip.id)
        .select()
        .single();

      if (uErr) throw uErr;
      return { payslip: updated, snapshot, company, templateCfg };
    } else {
      const { data: created, error: cErr } = await supabase
        .from('payslips')
        .insert({
          company_id: companyId,
          payroll_run_id: payrollRunId,
          payroll_run_employee_id: empRun.id,
          employee_id: employeeId,
          payslip_number: payslipNumber,
          version: 1,
          pay_period_start: periodStart,
          pay_period_end: periodEnd,
          pay_date: payDate,
          gross_earnings: empRun.gross_earnings,
          total_deductions: empRun.total_deductions,
          net_salary: empRun.net_salary,
          document_path: `payslips/${companyId}/${payslipNumber}-v1.pdf`,
          document_hash: documentHash,
          document_status: 'GENERATED',
          generated_by: userId
        })
        .select()
        .single();

      if (cErr) throw cErr;
      return { payslip: created, snapshot, company, templateCfg };
    }
  }

  /**
   * Bulk Batch Payslip Generation for an entire Payroll Run
   */
  static async startBulkGenerationJob(companyId, payrollRunId, userId) {
    // 1. Verify Payroll Run
    const { data: run, error: runErr } = await supabase
      .from('payroll_runs')
      .select('*, payroll_periods(*)')
      .eq('id', payrollRunId)
      .eq('company_id', companyId)
      .single();

    if (runErr || !run) {
      throw new Error('Payroll run not found.');
    }

    // 2. Fetch all employee calculation summaries
    const { data: empRuns } = await supabase
      .from('payroll_run_employees')
      .select('id, employee_id')
      .eq('payroll_run_id', payrollRunId);

    const totalEmployees = empRuns?.length || 0;

    // 3. Create Batch Processing Job
    const { data: job, error: jobErr } = await supabase
      .from('payslip_generation_jobs')
      .insert({
        company_id: companyId,
        payroll_run_id: payrollRunId,
        total_employees: totalEmployees,
        processed_count: 0,
        success_count: 0,
        failed_count: 0,
        status: 'PROCESSING',
        started_at: new Date().toISOString(),
        created_by: userId
      })
      .select()
      .single();

    if (jobErr) throw jobErr;

    // Async batch process in chunks of 50
    setTimeout(async () => {
      let success = 0;
      let failed = 0;
      const errors = [];

      for (let i = 0; i < (empRuns?.length || 0); i++) {
        const item = empRuns[i];
        try {
          await this.generatePayslipForEmployee(companyId, payrollRunId, item.employee_id, userId);
          success++;
        } catch (err) {
          failed++;
          errors.push({ employee_id: item.employee_id, error: err.message });
        }

        // Update progress
        await supabase
          .from('payslip_generation_jobs')
          .update({
            processed_count: i + 1,
            success_count: success,
            failed_count: failed
          })
          .eq('id', job.id);
      }

      await supabase
        .from('payslip_generation_jobs')
        .update({
          status: failed === 0 ? 'COMPLETED' : success > 0 ? 'PARTIALLY_COMPLETED' : 'FAILED',
          completed_at: new Date().toISOString(),
          error_log: errors
        })
        .eq('id', job.id);
    }, 100);

    return job;
  }

  /**
   * Generate Official Salary Certificate for Employee
   */
  static async generateSalaryCertificate(companyId, employeeId, purpose, userId) {
    const { data: emp } = await supabase
      .from('employees')
      .select('*, departments(name), designations(name), branches(name)')
      .eq('id', employeeId)
      .single();

    if (!emp) throw new Error('Employee not found.');

    const { data: comp } = await supabase
      .from('employee_salary_assignments')
      .select('*, salary_structures(*)')
      .eq('employee_id', employeeId)
      .order('effective_from', { ascending: false })
      .maybeSingle();

    const { data: company } = await supabase
      .from('companies')
      .select('*')
      .eq('id', companyId)
      .single();

    const docName = `Salary_Certificate_${emp.employee_code}_${Date.now()}`;
    const docPayload = { companyId, employeeId, purpose, comp, date: new Date().toISOString() };
    const hash = this.generateDocumentHash(docPayload);

    const { data: doc, error } = await supabase
      .from('payroll_documents')
      .insert({
        company_id: companyId,
        employee_id: employeeId,
        document_type: 'SALARY_CERTIFICATE',
        document_name: `Salary Certificate - ${purpose}`,
        period_description: 'Current Active CTC',
        document_hash: hash,
        status: 'GENERATED',
        generated_by: userId
      })
      .select()
      .single();

    if (error) throw error;

    return {
      document: doc,
      employee: emp,
      company,
      compensation: comp,
      purpose,
      issuedAt: new Date().toLocaleDateString()
    };
  }
}
