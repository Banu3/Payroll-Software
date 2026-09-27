export const PERMISSIONS = {
  // Employee Self
  EMPLOYEE_VIEW_SELF: 'employee.view_self',
  EMPLOYEE_EDIT_SELF: 'employee.edit_self',
  EMPLOYEE_VIEW_PAYSLIP: 'employee.view_payslip',
  EMPLOYEE_DOWNLOAD_PAYSLIP: 'employee.download_payslip',
  EMPLOYEE_APPLY_LEAVE: 'employee.apply_leave',
  EMPLOYEE_VIEW_LEAVE_BALANCE: 'employee.view_leave_balance',
  EMPLOYEE_SUBMIT_EXPENSE: 'employee.submit_expense',

  // Manager
  EMPLOYEE_VIEW_TEAM: 'employee.view_team',
  ATTENDANCE_VIEW_TEAM: 'attendance.view_team',
  LEAVE_APPROVE_TEAM: 'leave.approve_team',
  PERFORMANCE_VIEW_TEAM: 'performance.view_team',

  // HR Admin
  EMPLOYEE_CREATE: 'employee.create',
  EMPLOYEE_EDIT: 'employee.edit',
  EMPLOYEE_DEACTIVATE: 'employee.deactivate',
  EMPLOYEE_VIEW_SALARY: 'employee.view_salary',
  ATTENDANCE_MANAGE: 'attendance.manage',
  LEAVE_MANAGE: 'leave.manage',
  PAYROLL_VIEW: 'payroll.view',
  PAYROLL_PROCESS: 'payroll.process',
  PAYROLL_FINALIZE: 'payroll.finalize',
  REPORTS_VIEW: 'reports.view',

  // Super Admin
  COMPANY_CREATE: 'company.create',
  COMPANY_MANAGE: 'company.manage',
  USERS_MANAGE: 'users.manage',
  ROLES_MANAGE: 'roles.manage',
  PERMISSIONS_MANAGE: 'permissions.manage',
  AUDIT_VIEW: 'audit.view',
  BILLING_MANAGE: 'billing.manage',
  SYSTEM_SETTINGS: 'system.settings',
};

export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  HR_ADMIN: 'HR_ADMIN',
  MANAGER: 'MANAGER',
  EMPLOYEE: 'EMPLOYEE',
};

export const ROLE_DASHBOARDS = {
  SUPER_ADMIN: '/super-admin/dashboard',
  HR_ADMIN: '/hr/dashboard',
  MANAGER: '/manager/dashboard',
  EMPLOYEE: '/employee/dashboard',
};
