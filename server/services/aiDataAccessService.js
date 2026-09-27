import supabase from '../lib/supabase.js';

export class AIDataAccessService {

  /**
   * Process Natural Language AI Queries with Permission Enforcement
   */
  static async processAIQuery(user, queryText, contextType = 'GENERAL') {
    const companyId = user.company_id;
    const role = user.role;
    const lowerQuery = queryText.toLowerCase();

    // Defensive Check against prompt injection & raw SQL attempts
    if (lowerQuery.includes('select ') || lowerQuery.includes('drop ') || lowerQuery.includes('delete ') || lowerQuery.includes('truncate ')) {
      return {
        answer: "I cannot execute database modification queries or custom SQL scripts. Please use the safe query controls.",
        source: 'Security Filter'
      };
    }

    // Role-based permission guard for payroll queries
    if ((lowerQuery.includes('salary') || lowerQuery.includes('payroll') || lowerQuery.includes('net pay')) && role === 'EMPLOYEE') {
      // Employee asking about their own salary
      const { data: emp } = await supabase
        .from('employees')
        .select('id, first_name, last_name')
        .eq('user_id', user.id)
        .single();

      if (!emp) return { answer: 'Employee profile not found.', source: 'System' };

      const { data: latestPayslip } = await supabase
        .from('payslips')
        .select('*')
        .eq('employee_id', emp.id)
        .order('pay_period_start', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!latestPayslip) {
        return {
          answer: `Hello ${emp.first_name}, no finalized payslips are available for your account yet.`,
          source: 'Employee Payslips'
        };
      }

      return {
        answer: `Hello ${emp.first_name}, your latest finalized Net Salary for period ${latestPayslip.pay_period_start} is ₹${Number(latestPayslip.net_salary).toLocaleString()} (Gross: ₹${Number(latestPayslip.gross_earnings).toLocaleString()}, Deductions: ₹${Number(latestPayslip.total_deductions).toLocaleString()}).`,
        dataCard: {
          period: latestPayslip.pay_period_start,
          gross: latestPayslip.gross_earnings,
          deductions: latestPayslip.total_deductions,
          net: latestPayslip.net_salary
        },
        source: 'Self-Service Payslip Data'
      };
    }

    // Executive/HR Analytics Query
    if (lowerQuery.includes('how many employees') || lowerQuery.includes('active employees') || lowerQuery.includes('workforce')) {
      const { count: activeCount } = await supabase
        .from('employees')
        .select('id', { count: 'exact', head: true })
        .eq('company_id', companyId)
        .eq('status', 'ACTIVE');

      const { count: totalCount } = await supabase
        .from('employees')
        .select('id', { count: 'exact', head: true })
        .eq('company_id', companyId);

      return {
        answer: `Your organization currently has ${activeCount || 0} active employees out of ${totalCount || 0} total registered workforce records.`,
        dataCard: { activeEmployees: activeCount, totalWorkforce: totalCount },
        source: 'Workforce Records'
      };
    }

    // Payroll Summary Query for HR/Admins
    if (lowerQuery.includes('payroll') || lowerQuery.includes('gross') || lowerQuery.includes('net salary')) {
      if (role !== 'HR_ADMIN' && role !== 'SUPER_ADMIN') {
        return { answer: 'You do not have permission to access company-wide payroll statistics.', source: 'Permission Guard' };
      }

      const { data: latestRun } = await supabase
        .from('payroll_runs')
        .select('*, payroll_periods(month_year)')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!latestRun) {
        return { answer: 'No payroll runs recorded for your company yet.', source: 'Payroll Engine' };
      }

      return {
        answer: `For the latest payroll run #${latestRun.run_number} (${latestRun.payroll_periods?.month_year || 'Current'}), the Total Gross Payroll is ₹${Number(latestRun.total_gross || 0).toLocaleString()}, Total Deductions are ₹${Number(latestRun.total_deductions || 0).toLocaleString()}, and Total Net Payable is ₹${Number(latestRun.total_net_pay || 0).toLocaleString()} across ${latestRun.total_employees} employees.`,
        dataCard: {
          runNumber: latestRun.run_number,
          employees: latestRun.total_employees,
          gross: latestRun.total_gross,
          net: latestRun.total_net_pay
        },
        source: 'Finalized Payroll Engine Data'
      };
    }

    // Default AI response backed by facts
    return {
      answer: `I am your Enterprise HR AI Assistant. I can answer questions about active employee counts, payroll summaries, attendance rates, leave requests, and statutory compliance status based on verified database data.`,
      suggestedQuestions: [
        'How many active employees are there?',
        'What was the latest payroll gross and net total?',
        'Show active HR tasks'
      ],
      source: 'Enterprise AI Knowledge Base'
    };
  }
}
