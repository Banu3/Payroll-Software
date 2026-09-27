import { supabaseAdmin } from '../config/supabase.js';

export const ROLE_PERMISSIONS = {
  SUPER_ADMIN: [
    'company.create', 'company.manage', 'users.manage', 'roles.manage',
    'permissions.manage', 'audit.view', 'billing.manage', 'system.settings',
    'employee.create', 'employee.edit', 'employee.deactivate', 'employee.view_salary',
    'attendance.manage', 'leave.manage', 'payroll.view', 'payroll.process', 'payroll.finalize', 'reports.view',
    'employee.view_team', 'attendance.view_team', 'leave.approve_team', 'performance.view_team',
    'employee.view_self', 'employee.edit_self', 'employee.view_payslip', 'employee.download_payslip',
    'employee.apply_leave', 'employee.view_leave_balance', 'employee.submit_expense'
  ],
  HR_ADMIN: [
    'employee.create', 'employee.edit', 'employee.deactivate', 'employee.view_salary',
    'attendance.manage', 'leave.manage', 'payroll.view', 'payroll.process', 'payroll.finalize', 'reports.view',
    'employee.view_team', 'attendance.view_team', 'leave.approve_team', 'performance.view_team',
    'employee.view_self', 'employee.edit_self', 'employee.view_payslip', 'employee.download_payslip',
    'employee.apply_leave', 'employee.view_leave_balance', 'employee.submit_expense'
  ],
  MANAGER: [
    'employee.view_team', 'attendance.view_team', 'leave.approve_team', 'performance.view_team',
    'employee.view_self', 'employee.edit_self', 'employee.view_payslip', 'employee.download_payslip',
    'employee.apply_leave', 'employee.view_leave_balance', 'employee.submit_expense'
  ],
  EMPLOYEE: [
    'employee.view_self', 'employee.edit_self', 'employee.view_payslip', 'employee.download_payslip',
    'employee.apply_leave', 'employee.view_leave_balance', 'employee.submit_expense'
  ]
};

export const getPermissionsForUser = async (userId, companyId) => {
  try {
    // Attempt DB query
    const { data: userRoles, error } = await supabaseAdmin
      .from('user_roles')
      .select('roles(name)')
      .eq('user_id', userId);

    let roles = [];
    if (!error && userRoles && userRoles.length > 0) {
      roles = userRoles.map((ur) => ur.roles?.name).filter(Boolean);
    }

    // Default to EMPLOYEE role if no role mapped in DB
    if (roles.length === 0) {
      roles = ['EMPLOYEE'];
    }

    // Collect permissions for all user roles
    const permissionSet = new Set();
    roles.forEach((role) => {
      const perms = ROLE_PERMISSIONS[role] || [];
      perms.forEach((p) => permissionSet.add(p));
    });

    return {
      roles,
      permissions: Array.from(permissionSet),
    };
  } catch (err) {
    console.error('[PermissionService Error]:', err);
    return {
      roles: ['EMPLOYEE'],
      permissions: ROLE_PERMISSIONS.EMPLOYEE,
    };
  }
};
