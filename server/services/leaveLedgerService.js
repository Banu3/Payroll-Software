/**
 * leaveLedgerService.js
 * Immutable leave ledger architecture.
 * Every balance change MUST create a ledger entry and update leave_balances transactionally.
 */

import { supabaseAdmin } from '../config/supabase.js';

export async function getOrCreateLeaveBalance(companyId, employeeId, leaveTypeId, year = new Date().getFullYear()) {
  const { data: existing, error } = await supabaseAdmin
    .from('leave_balances')
    .select('*')
    .eq('company_id', companyId)
    .eq('employee_id', employeeId)
    .eq('leave_type_id', leaveTypeId)
    .eq('year', year)
    .single();

  if (existing) return existing;

  // Get leave type for default allowance
  const { data: leaveType } = await supabaseAdmin
    .from('leave_types')
    .select('annual_allowance')
    .eq('id', leaveTypeId)
    .single();

  const initialAllowance = leaveType?.annual_allowance || 12.0;

  const { data: created, error: createErr } = await supabaseAdmin
    .from('leave_balances')
    .insert({
      company_id: companyId,
      employee_id: employeeId,
      leave_type_id: leaveTypeId,
      year,
      opening_balance: initialAllowance,
      accrued: 0.0,
      used: 0.0,
      pending: 0.0,
      carried_forward: 0.0,
      adjusted: 0.0,
      available: initialAllowance,
    })
    .select()
    .single();

  if (createErr) throw createErr;
  return created;
}

export async function recordLedgerTransaction({
  companyId,
  employeeId,
  leaveTypeId,
  transactionType, // 'OPENING_BALANCE' | 'ACCRUAL' | 'LEAVE_USED' | 'LEAVE_CANCELLED' | 'MANUAL_ADJUSTMENT' | 'CARRY_FORWARD' | 'ENCASHMENT' | 'EXPIRY'
  days,
  referenceType = null,
  referenceId = null,
  reason = null,
  createdBy = null,
}) {
  const year = new Date().getFullYear();
  const currentBalanceRecord = await getOrCreateLeaveBalance(companyId, employeeId, leaveTypeId, year);

  const balanceBefore = parseFloat(currentBalanceRecord.available || 0);
  let delta = parseFloat(days);

  // Determine direction based on transaction type
  if (transactionType === 'LEAVE_USED' || transactionType === 'ENCASHMENT' || transactionType === 'EXPIRY') {
    delta = -Math.abs(delta);
  } else {
    delta = Math.abs(delta);
  }

  const balanceAfter = Math.round((balanceBefore + delta) * 100) / 100;

  // 1. Create Ledger Record
  const { data: ledgerEntry, error: ledgerErr } = await supabaseAdmin
    .from('leave_ledger')
    .insert({
      company_id: companyId,
      employee_id: employeeId,
      leave_type_id: leaveTypeId,
      transaction_type: transactionType,
      days: Math.abs(days),
      balance_before: balanceBefore,
      balance_after: balanceAfter,
      reference_type: referenceType,
      reference_id: referenceId,
      reason,
      created_by: createdBy,
    })
    .select()
    .single();

  if (ledgerErr) throw ledgerErr;

  // 2. Update Leave Balance Record
  const updatePayload = {
    available: balanceAfter,
    updated_at: new Date().toISOString(),
  };

  if (transactionType === 'LEAVE_USED') {
    updatePayload.used = Math.round((parseFloat(currentBalanceRecord.used || 0) + Math.abs(days)) * 100) / 100;
  } else if (transactionType === 'LEAVE_CANCELLED') {
    updatePayload.used = Math.max(0, Math.round((parseFloat(currentBalanceRecord.used || 0) - Math.abs(days)) * 100) / 100);
  } else if (transactionType === 'MANUAL_ADJUSTMENT') {
    updatePayload.adjusted = Math.round((parseFloat(currentBalanceRecord.adjusted || 0) + delta) * 100) / 100;
  } else if (transactionType === 'ACCRUAL') {
    updatePayload.accrued = Math.round((parseFloat(currentBalanceRecord.accrued || 0) + Math.abs(days)) * 100) / 100;
  }

  await supabaseAdmin
    .from('leave_balances')
    .update(updatePayload)
    .eq('id', currentBalanceRecord.id);

  return { ledgerEntry, balanceAfter };
}
