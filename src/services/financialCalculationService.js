export const CURRENCY_CONFIG = {
  currency: 'INR',
  currencyCode: 'INR',
  currencySymbol: '₹',
  locale: 'en-IN',
};

/**
 * Formats a numeric value into INR format using Indian numbering system.
 * Example: 1250000 -> ₹12,50,000
 * @param {number|string} amount 
 * @param {Object|string} optionsOrSymbol 
 * @returns {string}
 */
export const formatCurrency = (amount = 0, optionsOrSymbol = {}) => {
  const num = Number(amount);
  const safeNum = isNaN(num) ? 0 : num;

  let options = {};
  if (typeof optionsOrSymbol === 'string') {
    options = { currencySymbol: optionsOrSymbol };
  } else if (typeof optionsOrSymbol === 'object' && optionsOrSymbol !== null) {
    options = optionsOrSymbol;
  }

  const {
    maximumFractionDigits = 0,
    minimumFractionDigits = 0,
    currencySymbol = CURRENCY_CONFIG.currencySymbol,
  } = options;

  const formatted = safeNum.toLocaleString('en-IN', {
    maximumFractionDigits,
    minimumFractionDigits,
  });

  return `${currencySymbol}${formatted}`;
};


/**
 * Calculates Provident Fund (PF) contribution based on basic salary
 */
export const calculatePF = (basicSalary = 0, pfRate = 0.12, cap = 15000) => {
  const base = Math.min(basicSalary, cap);
  return Math.round(base * pfRate);
};

/**
 * Calculates Employee State Insurance (ESI) contribution
 */
export const calculateESI = (grossSalary = 0, esiRate = 0.0075, cap = 21000) => {
  if (grossSalary > cap) return 0;
  return Math.round(grossSalary * esiRate);
};

/**
 * Calculates Professional Tax (PT) based on standard slab rules
 */
export const calculatePT = (grossSalary = 0) => {
  if (grossSalary > 20000) return 200;
  if (grossSalary > 15000) return 150;
  return 0;
};

/**
 * Calculates Total Gross Salary from earnings components
 */
export const calculateGrossSalary = (earnings = []) => {
  return earnings.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
};

/**
 * Calculates Net Salary (Gross - Deductions)
 */
export const calculateNetSalary = (grossSalary = 0, totalDeductions = 0) => {
  return Math.max(0, grossSalary - totalDeductions);
};

export default {
  formatCurrency,
  calculatePF,
  calculateESI,
  calculatePT,
  calculateGrossSalary,
  calculateNetSalary,
};
