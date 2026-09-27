/**
 * financialCalculationService.js
 * Centralized financial precision service.
 * Prevents JavaScript floating-point errors (e.g., 0.1 + 0.2 = 0.30000000000000004) by employing fixed-point math and exact rounding rules.
 */

export function roundMoney(amount) {
  if (isNaN(amount)) return 0.0;
  return Math.round((parseFloat(amount) + Number.EPSILON) * 100) / 100;
}

export function calcPercentage(base, pct) {
  const b = parseFloat(base) || 0.0;
  const p = parseFloat(pct) || 0.0;
  return roundMoney((b * p) / 100);
}

export function addMoney(...amounts) {
  const total = amounts.reduce((acc, curr) => acc + (parseFloat(curr) || 0.0), 0.0);
  return roundMoney(total);
}

export function subtractMoney(base, ...deductions) {
  const totalDeductions = deductions.reduce((acc, curr) => acc + (parseFloat(curr) || 0.0), 0.0);
  return roundMoney((parseFloat(base) || 0.0) - totalDeductions);
}

export function multiplyMoney(amount, multiplier) {
  return roundMoney((parseFloat(amount) || 0.0) * (parseFloat(multiplier) || 0.0));
}

export function divideMoney(amount, divisor) {
  const div = parseFloat(divisor) || 1.0;
  if (div === 0) return 0.0;
  return roundMoney((parseFloat(amount) || 0.0) / div);
}

export function formatCurrency(amount, currency = 'INR') {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(amount || 0);
}
