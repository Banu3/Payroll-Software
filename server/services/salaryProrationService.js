/**
 * salaryProrationService.js
 * Calculates prorated payable compensation for mid-month salary revisions, joiners, and leavers.
 */

import { roundMoney, divideMoney, multiplyMoney } from './financialCalculationService.js';

export function calculateProratedSalary({
  daysInMonth = 30,
  effectiveDate,
  oldMonthlyGross = 0.0,
  newMonthlyGross = 0.0,
  lopDays = 0,
}) {
  const effDate = new Date(effectiveDate);
  const dayOfMonth = effDate.getDate(); // e.g. 16th

  const oldSalaryDays = Math.max(0, dayOfMonth - 1);
  const newSalaryDays = Math.max(0, daysInMonth - oldSalaryDays);

  const oldDailyRate = divideMoney(oldMonthlyGross, daysInMonth);
  const newDailyRate = divideMoney(newMonthlyGross, daysInMonth);

  const oldPeriodPayable = multiplyMoney(oldDailyRate, oldSalaryDays);
  const newPeriodPayable = multiplyMoney(newDailyRate, newSalaryDays);

  const totalBeforeLop = roundMoney(oldPeriodPayable + newPeriodPayable);
  const lopDeduction = multiplyMoney(newDailyRate, lopDays);
  const finalProratedPayable = Math.max(0, roundMoney(totalBeforeLop - lopDeduction));

  return {
    daysInMonth,
    oldSalaryDays,
    newSalaryDays,
    oldDailyRate,
    newDailyRate,
    oldPeriodPayable,
    newPeriodPayable,
    totalBeforeLop,
    lopDays,
    lopDeduction,
    finalProratedPayable,
  };
}
