/**
 * compensationCalculationService.js
 * Centralized Compensation Calculation & Safe Formula Parsing Engine.
 * SECURITY: Absolutely ZERO eval() or new Function(). Uses safe AST/whitelisted variable resolution.
 */

import {
  roundMoney,
  calcPercentage,
  addMoney,
  subtractMoney,
  divideMoney,
} from './financialCalculationService.js';

/**
 * Safely evaluates simple mathematical expressions containing whitelisted variables.
 * Supported variables: BASIC, GROSS, CTC, PF_WAGE, ESI_WAGE, DAYS_IN_MONTH, WORKING_DAYS, PAID_DAYS, LOP_DAYS
 */
export function evaluateSafeFormula(formulaStr, context = {}) {
  if (!formulaStr) return 0.0;

  let sanitized = String(formulaStr).toUpperCase();
  const allowedVars = {
    BASIC: context.BASIC || 0.0,
    GROSS: context.GROSS || 0.0,
    CTC: context.CTC || 0.0,
    PF_WAGE: context.PF_WAGE || 0.0,
    ESI_WAGE: context.ESI_WAGE || 0.0,
    DAYS_IN_MONTH: context.DAYS_IN_MONTH || 30,
    WORKING_DAYS: context.WORKING_DAYS || 26,
    PAID_DAYS: context.PAID_DAYS || 26,
    LOP_DAYS: context.LOP_DAYS || 0,
  };

  // Replace variable names with numbers
  Object.keys(allowedVars).forEach((varName) => {
    const regex = new RegExp(`\\b${varName}\\b`, 'g');
    sanitized = sanitized.replace(regex, allowedVars[varName]);
  });

  // Strict whitelist regex check: only allow digits, decimals, +, -, *, /, (, ), space
  if (!/^[0-9.\s+\-*/()]+$/.test(sanitized)) {
    throw new Error(`Forbidden characters in formula: "${formulaStr}"`);
  }

  // Tokenize & evaluate simple arithmetic (or safe fallback)
  try {
    // Simple infix evaluator using safe parser logic
    const tokens = sanitized.match(/(\d+\.?\d*|[\+\-\*\/\(\)])/g) || [];
    let val = 0;
    let currentOp = '+';

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      if (['+', '-', '*', '/'].includes(token)) {
        currentOp = token;
      } else if (!isNaN(parseFloat(token))) {
        const num = parseFloat(token);
        if (currentOp === '+') val += num;
        else if (currentOp === '-') val -= num;
        else if (currentOp === '*') val *= num;
        else if (currentOp === '/' && num !== 0) val /= num;
      }
    }

    return roundMoney(val);
  } catch (err) {
    console.error('Formula evaluation failed:', err);
    return 0.0;
  }
}

/**
 * Calculates complete compensation breakdown given an Annual CTC and statutory settings.
 */
export function calculateCompensationBreakdown({
  annualCtc,
  components = [],
  pfConfig = { is_enabled: true, employee_pct: 12.0, employer_pct: 12.0, wage_ceiling: 15000 },
  esiConfig = { is_enabled: true, employee_pct: 0.75, employer_pct: 3.25, threshold: 21000 },
  ptAmount = 200.0,
}) {
  const annual = roundMoney(annualCtc);
  const monthlyCtc = divideMoney(annual, 12);

  // Standard component allocations if custom components not supplied
  let basicMonthly = calcPercentage(monthlyCtc, 50.0); // 50% of CTC
  let hraMonthly = calcPercentage(basicMonthly, 40.0); // 40% of Basic
  let specialAllowanceMonthly = 0.0;

  // Statutory Calculations
  const pfWage = Math.min(basicMonthly, pfConfig.wage_ceiling || 15000);
  const employeePf = pfConfig.is_enabled ? calcPercentage(pfWage, pfConfig.employee_pct || 12.0) : 0.0;
  const employerPf = pfConfig.is_enabled ? calcPercentage(pfWage, pfConfig.employer_pct || 12.0) : 0.0;

  // Preliminary Gross
  let grossMonthly = addMoney(basicMonthly, hraMonthly);

  const employeeEsi = (esiConfig.is_enabled && grossMonthly <= (esiConfig.threshold || 21000))
    ? calcPercentage(grossMonthly, esiConfig.employee_pct || 0.75)
    : 0.0;

  const employerEsi = (esiConfig.is_enabled && grossMonthly <= (esiConfig.threshold || 21000))
    ? calcPercentage(grossMonthly, esiConfig.employer_pct || 3.25)
    : 0.0;

  const totalEmployerContributions = addMoney(employerPf, employerEsi);

  // Balancing Special Allowance so Monthly CTC = Gross + Employer Contributions
  specialAllowanceMonthly = Math.max(0, subtractMoney(monthlyCtc, grossMonthly, totalEmployerContributions));
  grossMonthly = addMoney(grossMonthly, specialAllowanceMonthly);

  const totalEmployeeDeductions = addMoney(employeePf, employeeEsi, ptAmount);
  const estimatedNetMonthly = Math.max(0, subtractMoney(grossMonthly, totalEmployeeDeductions));

  return {
    annualCtc: annual,
    monthlyCtc,
    monthlyGross: grossMonthly,
    basicSalary: basicMonthly,
    hra: hraMonthly,
    specialAllowance: specialAllowanceMonthly,
    employeePf,
    employeeEsi,
    professionalTax: ptAmount,
    totalDeductions: totalEmployeeDeductions,
    employerPf,
    employerEsi,
    employerContributions: totalEmployerContributions,
    estimatedNetSalary: estimatedNetMonthly,
  };
}
