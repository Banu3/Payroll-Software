/**
 * leaveApprovalWorkflowService.js
 * Configurable multi-level leave approval workflow engine.
 * Integrates with Leave Ledger and Part 4 Attendance Engine upon final approval.
 */

import { supabaseAdmin } from '../config/supabase.js';
import { recordLedgerTransaction } from './leaveLedgerService.js';

export async function processLeaveApprovalAction({
  companyId,
  leaveRequestId,
  approverUser,
  action, // 'APPROVE' | 'REJECT'
  comments = '',
  rejectionReason = '',
}) {
  // Fetch leave request details
  const { data: request, error: reqErr } = await supabaseAdmin
    .from('leave_requests')
    .select('*, leave_type:leave_types(*), employee:employees(*)')
    .eq('id', leaveRequestId)
    .eq('company_id', companyId)
    .single();

  if (reqErr || !request) {
    throw new Error('Leave request not found');
  }

  if (request.status === 'APPROVED' || request.status === 'REJECTED' || request.status === 'CANCELLED') {
    throw new Error(`Leave request is already in final status: ${request.status}`);
  }

  const isHr = approverUser.roles.includes('HR_ADMIN') || approverUser.roles.includes('SUPER_ADMIN');
  const isManager = approverUser.roles.includes('MANAGER');

  let newStatus = request.status;

  if (action === 'REJECT') {
    newStatus = 'REJECTED';
  } else if (action === 'APPROVE') {
    if (isHr) {
      newStatus = 'APPROVED'; // HR approval is final
    } else if (isManager) {
      newStatus = 'APPROVED'; // Default 1-tier manager approval, or manager stage
    } else {
      newStatus = 'APPROVED';
    }
  }

  // Record Approval Step History
  await supabaseAdmin.from('leave_approvals').insert({
    company_id: companyId,
    leave_request_id: leaveRequestId,
    approver_id: approverUser.id,
    approver_role: isHr ? 'HR_ADMIN' : 'MANAGER',
    stage: isHr ? 2 : 1,
    action: action === 'APPROVE' ? 'APPROVED' : 'REJECTED',
    comments: comments || (action === 'REJECT' ? rejectionReason : 'Approved'),
  });

  // Update Request Status
  const updatePayload = {
    status: newStatus,
    updated_at: new Date().toISOString(),
  };

  if (action === 'REJECT') {
    updatePayload.rejection_reason = rejectionReason || comments || 'Rejected by approver';
  }

  const { data: updatedReq, error: updateErr } = await supabaseAdmin
    .from('leave_requests')
    .update(updatePayload)
    .eq('id', leaveRequestId)
    .select()
    .single();

  if (updateErr) throw updateErr;

  // On Final Approval -> Deduct Balance & Update Attendance
  if (newStatus === 'APPROVED' && request.leave_type.category === 'PAID') {
    await recordLedgerTransaction({
      companyId,
      employeeId: request.employee_id,
      leaveTypeId: request.leave_type_id,
      transactionType: 'LEAVE_USED',
      days: request.duration,
      referenceType: 'LEAVE_REQUEST',
      referenceId: leaveRequestId,
      reason: request.reason,
      createdBy: approverUser.id,
    });

    // Update Part 4 Attendance Records to ON_LEAVE
    await updateAttendanceForApprovedLeave({
      companyId,
      employeeId: request.employee_id,
      startDate: request.start_date,
      endDate: request.end_date,
      dayType: request.day_type,
    });
  }

  return updatedReq;
}

/**
 * Updates Part 4 Attendance records in range to ON_LEAVE or HALF_DAY
 */
async function updateAttendanceForApprovedLeave({ companyId, employeeId, startDate, endDate, dayType }) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0];

    const { data: existing } = await supabaseAdmin
      .from('attendance')
      .select('id')
      .eq('company_id', companyId)
      .eq('employee_id', employeeId)
      .eq('date', dateStr)
      .single();

    const attStatus = dayType === 'FULL_DAY' ? 'ON_LEAVE' : 'HALF_DAY';

    if (existing) {
      await supabaseAdmin
        .from('attendance')
        .update({ status: attStatus, is_leave: true, updated_at: new Date().toISOString() })
        .eq('id', existing.id);
    } else {
      await supabaseAdmin.from('attendance').insert({
        company_id: companyId,
        employee_id: employeeId,
        date: dateStr,
        status: attStatus,
        is_leave: true,
      });
    }
  }
}
