import supabase from '../lib/supabase.js';

export class StatutoryReportService {

  /**
   * Generate Provident Fund (PF) ECR Schedule Report
   */
  static async generatePFReport(companyId, year, month, userId) {
    const monthYear = `${year}-${String(month).padStart(2, '0')}`;

    // 1. Fetch Finalized Payroll Runs for this month
    const { data: period } = await supabase
      .from('payroll_periods')
      .select('id')
      .eq('company_id', companyId)
      .eq('month_year', monthYear)
      .maybeSingle();

    if (!period) {
      throw new Error(`No payroll period found for ${monthYear}.`);
    }

    const { data: runs } = await supabase
      .from('payroll_runs')
      .select('id')
      .eq('company_id', companyId)
      .eq('payroll_period_id', period.id)
      .in('status', ['FINALIZED', 'APPROVED']);

    if (!runs || runs.length === 0) {
      throw new Error(`No finalized payroll runs found for ${monthYear}.`);
    }

    const runIds = runs.map((r) => r.id);

    // 2. Fetch Employee Payroll Calculation Summaries from Part 7
    const { data: empRuns } = await supabase
      .from('payroll_run_employees')
      .select('*, employees(*)')
      .in('payroll_run_id', runIds);

    let totalEmployeePF = 0;
    let totalEmployerPF = 0;
    let missingUANCount = 0;

    const pfRows = (empRuns || []).map((emp) => {
      const snapshot = emp.calculation_snapshot || {};
      const pfWages = Number(snapshot.basic_amount || emp.basic_salary || 0);
      const eePF = Number(snapshot.pf_employee || 0);
      const erPF = Number(snapshot.pf_employer || 0);
      const uan = emp.employees?.uan_number || null;

      if (!uan) missingUANCount++;

      totalEmployeePF += eePF;
      totalEmployerPF += erPF;

      return {
        employee_id: emp.employee_id,
        employee_code: emp.employees?.employee_code,
        employee_name: `${emp.employees?.first_name || ''} ${emp.employees?.last_name || ''}`.trim(),
        uan_number: uan || 'MISSING',
        pf_wages: pfWages,
        employee_pf: eePF,
        employer_pf: erPF,
        eps_amount: Math.round(erPF * 0.694), // EPS 8.33% split ratio where capped
        total_pf: eePF + erPF
      };
    });

    const snapshotData = {
      monthYear,
      totalEmployees: pfRows.length,
      missingUANCount,
      totalEmployeePF,
      totalEmployerPF,
      grandTotalPF: totalEmployeePF + totalEmployerPF,
      rows: pfRows
    };

    // Save Immutable Statutory Report Record
    const { data: report, error } = await supabase
      .from('statutory_reports')
      .insert({
        company_id: companyId,
        report_type: 'PF_ECR',
        month_year: monthYear,
        version: 1,
        total_employees_covered: pfRows.length,
        total_amount: totalEmployeePF + totalEmployerPF,
        snapshot_data: snapshotData,
        status: 'GENERATED',
        generated_by: userId
      })
      .select()
      .single();

    if (error) throw error;
    return { report, snapshotData };
  }

  /**
   * Generate ESI Monthly Return Report
   */
  static async generateESIReport(companyId, year, month, userId) {
    const monthYear = `${year}-${String(month).padStart(2, '0')}`;

    const { data: period } = await supabase
      .from('payroll_periods')
      .select('id')
      .eq('company_id', companyId)
      .eq('month_year', monthYear)
      .maybeSingle();

    if (!period) throw new Error(`No payroll period found for ${monthYear}.`);

    const { data: runs } = await supabase
      .from('payroll_runs')
      .select('id')
      .eq('company_id', companyId)
      .eq('payroll_period_id', period.id)
      .in('status', ['FINALIZED', 'APPROVED']);

    if (!runs || runs.length === 0) throw new Error(`No finalized payroll runs found for ${monthYear}.`);

    const runIds = runs.map((r) => r.id);

    const { data: empRuns } = await supabase
      .from('payroll_run_employees')
      .select('*, employees(*)')
      .in('payroll_run_id', runIds);

    let totalEE_ESI = 0;
    let totalER_ESI = 0;
    let missingESICount = 0;

    const esiRows = (empRuns || []).map((emp) => {
      const snapshot = emp.calculation_snapshot || {};
      const esiWages = Number(emp.gross_earnings || 0);
      const eeESI = Number(snapshot.esi_employee || 0);
      const erESI = Number(snapshot.esi_employer || 0);
      const esiNum = emp.employees?.esi_number || null;

      if (!esiNum) missingESICount++;

      totalEE_ESI += eeESI;
      totalER_ESI += erESI;

      return {
        employee_id: emp.employee_id,
        employee_code: emp.employees?.employee_code,
        employee_name: `${emp.employees?.first_name || ''} ${emp.employees?.last_name || ''}`.trim(),
        esi_number: esiNum || 'MISSING',
        paid_days: emp.paid_days,
        esi_wages: esiWages,
        employee_esi: eeESI,
        employer_esi: erESI,
        total_esi: eeESI + erESI
      };
    });

    const snapshotData = {
      monthYear,
      totalEmployees: esiRows.length,
      missingESICount,
      totalEE_ESI,
      totalER_ESI,
      grandTotalESI: totalEE_ESI + totalER_ESI,
      rows: esiRows
    };

    const { data: report, error } = await supabase
      .from('statutory_reports')
      .insert({
        company_id: companyId,
        report_type: 'ESI_RETURN',
        month_year: monthYear,
        version: 1,
        total_employees_covered: esiRows.length,
        total_amount: totalEE_ESI + totalER_ESI,
        snapshot_data: snapshotData,
        status: 'GENERATED',
        generated_by: userId
      })
      .select()
      .single();

    if (error) throw error;
    return { report, snapshotData };
  }
}
