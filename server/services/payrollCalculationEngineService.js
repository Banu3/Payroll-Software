/**
 * payrollCalculationEngineService.js
 * Centralized Enterprise Payroll Calculation Engine.
 * Integrates Attendance (Part 4), Leave/LOP (Part 5), Compensation (Part 6), Financial Precision, and Proration.
 */

import { supabaseAdmin } from '../config/supabase.js';
import { getPayrollAttendanceSummary } from './attendancePayrollService.js';
import { getPayrollLeaveSummary } from './leavePayrollService.js';
import { getPayrollCompensation } from './compensationPayrollService.js';
import {
  roundMoney,
  calcPercentage,
  addMoney,
  subtractMoney,
  divideMoney,
  multiplyMoney,
} from './financialCalculationService.js';
import { calculateProratedSalary } from './salaryProrationService.js';

export async function calculateSingleEmployeePayroll({ companyId, employeeId, startDate, endDate, monthYear }) {
  // 1. Fetch Compensation Contract (Part 6)
  const compContract = await getPayrollCompensation(companyId, employeeId, monthYear);

  // 2. Fetch Attendance Summary (Part 4)
  const attSummary = await getPayrollAttendanceSummary(companyId, employeeId, startDate, endDate);

  // 3. Fetch Leave/LOP Summary (Part 5)
  const leaveSummary = await getPayrollLeaveSummary(companyId, employeeId, startDate, endDate);

  // 4. Days Calculation
  const calendarDays = 30;
  const lopDays = leaveSummary.lopDays || 0;
  const paidDays = Math.max(0, calendarDays - lopDays);
  const overtimeHours = attSummary.overtimeHours || 0;

  // Daily rate for proration & LOP
  const monthlyGross = compContract.grossEarnings;
  const dailyRate = divideMoney(monthlyGross, calendarDays);
  const lopDeduction = multiplyMoney(dailyRate, lopDays);

  // 5. Earnings Breakdown
  const basicSalary = compContract.basicSalary;
  const proratedBasic = roundMoney((basicSalary / calendarDays) * paidDays);

  // Overtime pay (1.5x hourly rate)
  const hourlyRate = divideMoney(dailyRate, 8);
  const overtimePay = multiplyMoney(hourlyRate * 1.5, overtimeHours);

  // Reimbursements & Bonuses
  const reimbursementsAmount = compContract.payrollEligibleReimbursements.reduce((acc, r) => acc + parseFloat(r.amount || 0), 0);
  const grossEarnings = Math.max(0, roundMoney(monthlyGross - lopDeduction + overtimePay + reimbursementsAmount));

  // 6. Deductions Breakdown
  // PF
  const pfConfig = compContract.statutoryConfiguration.pf;
  const pfWage = Math.min(proratedBasic, pfConfig.wage_ceiling || 15000);
  const employeePf = pfConfig.is_enabled ? calcPercentage(pfWage, pfConfig.employee_contribution_pct || 12.0) : 0;
  const employerPf = pfConfig.is_enabled ? calcPercentage(pfWage, pfConfig.employer_contribution_pct || 12.0) : 0;

  // ESI
  const esiConfig = compContract.statutoryConfiguration.esi;
  const isEsiEligible = esiConfig.is_enabled && grossEarnings <= (esiConfig.eligibility_wage_threshold || 21000);
  const employeeEsi = isEsiEligible ? calcPercentage(grossEarnings, esiConfig.employee_contribution_pct || 0.75) : 0;
  const employerEsi = isEsiEligible ? calcPercentage(grossEarnings, esiConfig.employer_contribution_pct || 3.25) : 0;

  // Professional Tax (PT)
  const ptAmount = grossEarnings > 15000 ? 200.0 : 0.0;

  // TDS / Income Tax (Estimated monthly portion)
  const annualTaxable = grossEarnings * 12;
  let estimatedMonthlyTds = 0;
  if (annualTaxable > 700000) {
    estimatedMonthlyTds = roundMoney((annualTaxable * 0.05) / 12);
  }

  // Loans EMI
  const loanEmi = compContract.payrollEligibleLoans.reduce((acc, l) => acc + parseFloat(l.emi_amount || 0), 0);

  const totalDeductions = addMoney(employeePf, employeeEsi, ptAmount, estimatedMonthlyTds, loanEmi);
  const netSalary = Math.max(0, subtractMoney(grossEarnings, totalDeductions));
  const employerContributions = addMoney(employerPf, employerEsi);

  // Line Items snapshot array
  const lineItems = [
    { component_name: 'Basic Salary', component_code: 'BASIC', type: 'EARNING', category: 'BASIC', amount: proratedBasic, sequence_order: 1 },
    { component_name: 'HRA & Allowances', component_code: 'ALLOWANCES', type: 'EARNING', category: 'ALLOWANCE', amount: roundMoney(grossEarnings - proratedBasic), sequence_order: 2 },
    ...(overtimePay > 0 ? [{ component_name: 'Overtime Pay', component_code: 'OT', type: 'EARNING', category: 'OVERTIME', amount: overtimePay, sequence_order: 3 }] : []),
    ...(reimbursementsAmount > 0 ? [{ component_name: 'Reimbursements', component_code: 'REIMB', type: 'EARNING', category: 'REIMBURSEMENT', amount: reimbursementsAmount, sequence_order: 4 }] : []),
    { component_name: 'Employee PF', component_code: 'EPF', type: 'DEDUCTION', category: 'STATUTORY', amount: employeePf, sequence_order: 5 },
    { component_name: 'Employee ESI', component_code: 'EESI', type: 'DEDUCTION', category: 'STATUTORY', amount: employeeEsi, sequence_order: 6 },
    { component_name: 'Professional Tax', component_code: 'PT', type: 'DEDUCTION', category: 'STATUTORY', amount: ptAmount, sequence_order: 7 },
    { component_name: 'TDS Income Tax', component_code: 'TDS', type: 'DEDUCTION', category: 'TAX', amount: estimatedMonthlyTds, sequence_order: 8 },
    ...(loanEmi > 0 ? [{ component_name: 'Loan EMI Deduction', component_code: 'LOAN', type: 'DEDUCTION', category: 'LOAN_DEDUCTION', amount: loanEmi, sequence_order: 9 }] : []),
    { component_name: 'Employer PF', component_code: 'ER_PF', type: 'EMPLOYER_CONTRIBUTION', category: 'STATUTORY', amount: employerPf, sequence_order: 10 },
    { component_name: 'Employer ESI', component_code: 'ER_ESI', type: 'EMPLOYER_CONTRIBUTION', category: 'STATUTORY', amount: employerEsi, sequence_order: 11 },
  ];

  const calculationSnapshot = {
    calculatedAt: new Date().toISOString(),
    engineVersion: '2.4.0-PROD',
    attendanceSummary: attSummary,
    leaveSummary,
    compensationContract: compContract,
    calendarDays,
    paidDays,
    lopDays,
    lopDeduction,
    overtimeHours,
    overtimePay,
    grossEarnings,
    totalDeductions,
    employerContributions,
    netSalary,
  };

  return {
    calendarDays,
    workingDays: 26,
    paidDays,
    lopDays,
    overtimeHours,
    basicSalary: proratedBasic,
    grossEarnings,
    totalDeductions,
    employerContributions,
    netSalary,
    calculationSnapshot,
    lineItems,
  };
}
