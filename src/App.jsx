import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/reactQuery';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './components/ui/Toast';

// Auth Pages (Part 1)
import LoginPage from './pages/auth/LoginPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import FirstLoginProfileCompletion from './pages/auth/FirstLoginProfileCompletion';

// Super Admin Pages (Part 2)
import SuperAdminDashboardPage from './pages/superAdmin/SuperAdminDashboardPage';
import CompanyListPage from './pages/superAdmin/CompanyListPage';
import CreateCompanyPage from './pages/superAdmin/CreateCompanyPage';
import CompanyProfilePage from './pages/superAdmin/CompanyProfilePage';
import SubscriptionsPage from './pages/superAdmin/SubscriptionsPage';
import SystemActivityPage from './pages/superAdmin/SystemActivityPage';
import AuditLogsPage from './pages/superAdmin/AuditLogsPage';
import NotificationCenterPage from './pages/superAdmin/NotificationCenterPage';

import GlobalEmployeesPage from './pages/superAdmin/GlobalEmployeesPage';
import GlobalPayrollOverviewPage from './pages/superAdmin/GlobalPayrollOverviewPage';
import GlobalReportsPage from './pages/superAdmin/GlobalReportsPage';
import SystemSettingsPage from './pages/superAdmin/SystemSettingsPage';
import SupportTicketsPage from './pages/superAdmin/SupportTicketsPage';


// HR Admin Pages (Part 3)
import HRDashboardPage from './pages/hr/HRDashboardPage';
import CompanyOverviewPage from './pages/hr/CompanyOverviewPage';
import EmployeeListPage from './pages/hr/EmployeeListPage';
import CreateEmployeePage from './pages/hr/CreateEmployeePage';
import EmployeeProfilePage from './pages/hr/EmployeeProfilePage';
import BulkImportPage from './pages/hr/BulkImportPage';
import HRRequestsPage from './pages/hr/HRRequestsPage';


// Attendance Pages (Part 4)
import HRAttendanceDashboardPage from './pages/hr/attendance/HRAttendanceDashboardPage';
import AttendanceCalendarPage from './pages/hr/attendance/AttendanceCalendarPage';
import AttendanceImportPage from './pages/hr/attendance/AttendanceImportPage';
import ShiftManagementPage from './pages/hr/shifts/ShiftManagementPage';
import RosterManagementPage from './pages/hr/roster/RosterManagementPage';
import HolidayManagementPage from './pages/hr/holidays/HolidayManagementPage';
import OvertimeManagementPage from './pages/hr/overtime/OvertimeManagementPage';
import AttendanceReportsPage from './pages/hr/reports/AttendanceReportsPage';
import EmployeeAttendancePage from './pages/employee/EmployeeAttendancePage';
import ManagerAttendancePage from './pages/manager/ManagerAttendancePage';

// Leave Management Pages (Part 5)
import HRLeaveDashboardPage from './pages/hr/leave/HRLeaveDashboardPage';
import LeaveTypesPage from './pages/hr/leave/LeaveTypesPage';
import LeavePoliciesPage from './pages/hr/leave/LeavePoliciesPage';
import LeaveBalancesPage from './pages/hr/leave/LeaveBalancesPage';
import LeaveReportsPage from './pages/hr/leave/LeaveReportsPage';
import EmployeeLeavePage from './pages/employee/leave/EmployeeLeavePage';
import ManagerLeavePage from './pages/manager/leave/ManagerLeavePage';

// Compensation Management Pages (Part 6)
import HRCompensationDashboardPage from './pages/hr/compensation/HRCompensationDashboardPage';
import SalaryComponentsPage from './pages/hr/compensation/SalaryComponentsPage';
import SalaryStructuresPage from './pages/hr/compensation/SalaryStructuresPage';
import EmployeeCompensationPage from './pages/hr/compensation/EmployeeCompensationPage';
import SalaryRevisionsPage from './pages/hr/compensation/SalaryRevisionsPage';
import StatutoryConfigPage from './pages/hr/compensation/StatutoryConfigPage';
import SalaryCalculatorPage from './pages/hr/compensation/SalaryCalculatorPage';
import EmpCompPage from './pages/employee/compensation/EmployeeCompensationPage';

// Payroll Processing Engine Pages (Part 7)
import HRPayrollDashboardPage from './pages/hr/payroll/HRPayrollDashboardPage';
import PayrollRunsListPage from './pages/hr/payroll/PayrollRunsListPage';
import CreatePayrollRunWizardPage from './pages/hr/payroll/CreatePayrollRunWizardPage';
import PayrollRunDetailsPage from './pages/hr/payroll/PayrollRunDetailsPage';
import PayrollRegisterPage from './pages/hr/payroll/PayrollRegisterPage';
import PayrollAdjustmentsPage from './pages/hr/payroll/PayrollAdjustmentsPage';
import PayrollReportsPage from './pages/hr/payroll/PayrollReportsPage';
import EmployeePayrollPage from './pages/employee/payroll/EmployeePayrollPage';

// Payslips & Document Center Pages (Part 8)
import HRPayslipsDashboardPage from './pages/hr/payslips/HRPayslipsDashboardPage';
import BulkPayslipGenerationPage from './pages/hr/payslips/BulkPayslipGenerationPage';
import PayslipTemplatesPage from './pages/hr/payslips/PayslipTemplatesPage';
import PayslipSettingsPage from './pages/hr/payslips/PayslipSettingsPage';
import HRPayrollDocumentsPage from './pages/hr/documents/HRPayrollDocumentsPage';
import EmployeeDocumentsPage from './pages/employee/documents/EmployeeDocumentsPage';

// Bank Transfers, Payments & Statutory Pages (Part 9)
import HRPaymentDashboardPage from './pages/hr/payments/HRPaymentDashboardPage';
import EmployeePaymentsPage from './pages/employee/payments/EmployeePaymentsPage';
import CreatePaymentBatchPage from './pages/hr/payments/CreatePaymentBatchPage';
import PaymentBatchDetailsPage from './pages/hr/payments/PaymentBatchDetailsPage';
import CompanyBankAccountsPage from './pages/hr/payments/CompanyBankAccountsPage';
import HRStatutoryDashboardPage from './pages/hr/statutory/HRStatutoryDashboardPage';
import HRLoansAdvancesPage from './pages/hr/financial/HRLoansAdvancesPage';
import HRReimbursementsPage from './pages/hr/financial/HRReimbursementsPage';
import EmployeeLoansAdvancesPage from './pages/employee/financial/EmployeeLoansAdvancesPage';
import EmployeeReimbursementsPage from './pages/employee/financial/EmployeeReimbursementsPage';

// Advanced Reports, Analytics & Management Dashboard (Part 10)
import ExecutiveAnalyticsDashboardPage from './pages/analytics/ExecutiveAnalyticsDashboardPage';
import ReportBuilderPage from './pages/reports/ReportBuilderPage';
import ReportsCenterPage from './pages/reports/ReportsCenterPage';
import ReportExportsPage from './pages/reports/ReportExportsPage';

// Automation, AI & Integrations Pages (Part 11)
import HRAutomationDashboardPage from './pages/automation/HRAutomationDashboardPage';
import HRAIAssistantPage from './pages/ai/HRAIAssistantPage';
import IntegrationCenterPage from './pages/integrations/IntegrationCenterPage';

// Dashboards (Part 1)
import ManagerDashboard from './pages/dashboards/ManagerDashboard';
import EmployeeDashboard from './pages/dashboards/EmployeeDashboard';

// Settings & Security
import SecuritySettingsPage from './pages/settings/SecuritySettingsPage';
import UnauthorizedPage from './pages/UnauthorizedPage';

// Layout & Guards
import AppLayout from './components/layout/AppLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import RoleRoute from './components/auth/RoleRoute';
import PermissionRoute from './components/auth/PermissionRoute';
import { ROLE_DASHBOARDS } from './config/permissions';

const RootRedirect = () => {
  const { isAuthenticated, role, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  const target = ROLE_DASHBOARDS[role] || '/employee/dashboard';
  return <Navigate to={target} replace />;
};

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Auth Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/unauthorized" element={<UnauthorizedPage />} />

              {/* First-time Login Profile Setup */}
              <Route
                path="/first-login"
                element={
                  <ProtectedRoute>
                    <FirstLoginProfileCompletion />
                  </ProtectedRoute>
                }
              />

              {/* Super Admin Routes (Part 2) */}
              <Route
                path="/super-admin/dashboard"
                element={
                  <RoleRoute allowedRoles={['SUPER_ADMIN']}>
                    <AppLayout>
                      <SuperAdminDashboardPage />
                    </AppLayout>
                  </RoleRoute>
                }
              />

              <Route
                path="/super-admin/companies"
                element={
                  <RoleRoute allowedRoles={['SUPER_ADMIN']}>
                    <AppLayout>
                      <CompanyListPage />
                    </AppLayout>
                  </RoleRoute>
                }
              />

              <Route
                path="/super-admin/companies/new"
                element={
                  <RoleRoute allowedRoles={['SUPER_ADMIN']}>
                    <AppLayout>
                      <CreateCompanyPage />
                    </AppLayout>
                  </RoleRoute>
                }
              />

              <Route
                path="/super-admin/companies/:companyId"
                element={
                  <RoleRoute allowedRoles={['SUPER_ADMIN']}>
                    <AppLayout>
                      <CompanyProfilePage />
                    </AppLayout>
                  </RoleRoute>
                }
              />

              <Route
                path="/super-admin/subscriptions"
                element={
                  <RoleRoute allowedRoles={['SUPER_ADMIN']}>
                    <AppLayout>
                      <SubscriptionsPage />
                    </AppLayout>
                  </RoleRoute>
                }
              />

              <Route
                path="/super-admin/activity"
                element={
                  <RoleRoute allowedRoles={['SUPER_ADMIN']}>
                    <AppLayout>
                      <SystemActivityPage />
                    </AppLayout>
                  </RoleRoute>
                }
              />

              <Route
                path="/super-admin/audit-logs"
                element={
                  <RoleRoute allowedRoles={['SUPER_ADMIN']}>
                    <AppLayout>
                      <AuditLogsPage />
                    </AppLayout>
                  </RoleRoute>
                }
              />


              <Route
                path="/super-admin/notifications"
                element={
                  <RoleRoute allowedRoles={['SUPER_ADMIN']}>
                    <AppLayout>
                      <NotificationCenterPage />
                    </AppLayout>
                  </RoleRoute>
                }
              />

              <Route
                path="/super-admin/employees"
                element={
                  <RoleRoute allowedRoles={['SUPER_ADMIN']}>
                    <AppLayout>
                      <GlobalEmployeesPage />
                    </AppLayout>
                  </RoleRoute>
                }
              />

              <Route
                path="/super-admin/payroll"
                element={
                  <RoleRoute allowedRoles={['SUPER_ADMIN']}>
                    <AppLayout>
                      <GlobalPayrollOverviewPage />
                    </AppLayout>
                  </RoleRoute>
                }
              />

              <Route
                path="/super-admin/reports"
                element={
                  <RoleRoute allowedRoles={['SUPER_ADMIN']}>
                    <AppLayout>
                      <GlobalReportsPage />
                    </AppLayout>
                  </RoleRoute>
                }
              />

              <Route
                path="/super-admin/settings"
                element={
                  <RoleRoute allowedRoles={['SUPER_ADMIN']}>
                    <AppLayout>
                      <SystemSettingsPage />
                    </AppLayout>
                  </RoleRoute>
                }
              />

              <Route
                path="/super-admin/support"
                element={
                  <RoleRoute allowedRoles={['SUPER_ADMIN']}>
                    <AppLayout>
                      <SupportTicketsPage />
                    </AppLayout>
                  </RoleRoute>
                }
              />


              {/* HR Admin Routes (Part 3) */}
              <Route
                path="/hr/dashboard"
                element={
                  <RoleRoute allowedRoles={['HR_ADMIN', 'SUPER_ADMIN']}>
                    <AppLayout>
                      <HRDashboardPage />
                    </AppLayout>
                  </RoleRoute>
                }
              />

              <Route
                path="/hr/employees"
                element={
                  <PermissionRoute permission="employee.view_team">
                    <AppLayout>
                      <EmployeeListPage />
                    </AppLayout>
                  </PermissionRoute>
                }
              />

              <Route
                path="/hr/employees/new"
                element={
                  <PermissionRoute permission="employee.create">
                    <AppLayout>
                      <CreateEmployeePage />
                    </AppLayout>
                  </PermissionRoute>
                }
              />

              <Route
                path="/hr/employees/import"
                element={
                  <PermissionRoute permission="employee.create">
                    <AppLayout>
                      <BulkImportPage />
                    </AppLayout>
                  </PermissionRoute>
                }
              />

              <Route
                path="/hr/employees/:employeeId"
                element={
                  <PermissionRoute permission="employee.view_team">
                    <AppLayout>
                      <EmployeeProfilePage />
                    </AppLayout>
                  </PermissionRoute>
                }
              />

              <Route
                path="/hr/requests"
                element={
                  <PermissionRoute permission="employee.edit">
                    <AppLayout>
                      <HRRequestsPage />
                    </AppLayout>
                  </PermissionRoute>
                }
              />

              {/* Attendance & Shift Management Routes (Part 4) */}
              <Route
                path="/hr/attendance"
                element={
                  <PermissionRoute permission="attendance.view_company">
                    <AppLayout>
                      <HRAttendanceDashboardPage />
                    </AppLayout>
                  </PermissionRoute>
                }
              />

              <Route
                path="/hr/attendance/calendar"
                element={
                  <PermissionRoute permission="attendance.view_company">
                    <AppLayout>
                      <AttendanceCalendarPage />
                    </AppLayout>
                  </PermissionRoute>
                }
              />

              <Route
                path="/hr/attendance/import"
                element={
                  <PermissionRoute permission="attendance.import">
                    <AppLayout>
                      <AttendanceImportPage />
                    </AppLayout>
                  </PermissionRoute>
                }
              />

              <Route
                path="/hr/shifts"
                element={
                  <PermissionRoute permission="attendance.manage_shifts">
                    <AppLayout>
                      <ShiftManagementPage />
                    </AppLayout>
                  </PermissionRoute>
                }
              />

              <Route
                path="/hr/roster"
                element={
                  <PermissionRoute permission="attendance.manage_roster">
                    <AppLayout>
                      <RosterManagementPage />
                    </AppLayout>
                  </PermissionRoute>
                }
              />

              <Route
                path="/hr/holidays"
                element={
                  <PermissionRoute permission="attendance.manage_holidays">
                    <AppLayout>
                      <HolidayManagementPage />
                    </AppLayout>
                  </PermissionRoute>
                }
              />

              <Route
                path="/hr/overtime"
                element={
                  <PermissionRoute permission="attendance.manage_overtime">
                    <AppLayout>
                      <OvertimeManagementPage />
                    </AppLayout>
                  </PermissionRoute>
                }
              />

              <Route
                path="/hr/reports/attendance"
                element={
                  <PermissionRoute permission="attendance.view_company">
                    <AppLayout>
                      <AttendanceReportsPage />
                    </AppLayout>
                  </PermissionRoute>
                }
              />

              {/* Leave Management Routes (Part 5) */}
              <Route
                path="/hr/leave"
                element={
                  <PermissionRoute permission="leave.view_company">
                    <AppLayout>
                      <HRLeaveDashboardPage />
                    </AppLayout>
                  </PermissionRoute>
                }
              />

              <Route
                path="/hr/leave/types"
                element={
                  <PermissionRoute permission="leave.manage_types">
                    <AppLayout>
                      <LeaveTypesPage />
                    </AppLayout>
                  </PermissionRoute>
                }
              />

              <Route
                path="/hr/leave/policies"
                element={
                  <PermissionRoute permission="leave.manage_policies">
                    <AppLayout>
                      <LeavePoliciesPage />
                    </AppLayout>
                  </PermissionRoute>
                }
              />

              <Route
                path="/hr/leave/balances"
                element={
                  <PermissionRoute permission="leave.manage_balances">
                    <AppLayout>
                      <LeaveBalancesPage />
                    </AppLayout>
                  </PermissionRoute>
                }
              />

              <Route
                path="/hr/leave/reports"
                element={
                  <PermissionRoute permission="leave.view_reports">
                    <AppLayout>
                      <LeaveReportsPage />
                    </AppLayout>
                  </PermissionRoute>
                }
              />

              {/* Compensation Management Routes (Part 6) */}
              <Route
                path="/hr/compensation"
                element={
                  <PermissionRoute permission="compensation.view_company">
                    <AppLayout>
                      <HRCompensationDashboardPage />
                    </AppLayout>
                  </PermissionRoute>
                }
              />

              <Route
                path="/hr/compensation/components"
                element={
                  <PermissionRoute permission="compensation.manage_components">
                    <AppLayout>
                      <SalaryComponentsPage />
                    </AppLayout>
                  </PermissionRoute>
                }
              />

              <Route
                path="/hr/compensation/structures"
                element={
                  <PermissionRoute permission="compensation.manage_structures">
                    <AppLayout>
                      <SalaryStructuresPage />
                    </AppLayout>
                  </PermissionRoute>
                }
              />

              <Route
                path="/hr/compensation/employees"
                element={
                  <PermissionRoute permission="compensation.view_company">
                    <AppLayout>
                      <EmployeeCompensationPage />
                    </AppLayout>
                  </PermissionRoute>
                }
              />

              <Route
                path="/hr/compensation/revisions"
                element={
                  <PermissionRoute permission="compensation.revise">
                    <AppLayout>
                      <SalaryRevisionsPage />
                    </AppLayout>
                  </PermissionRoute>
                }
              />

              <Route
                path="/hr/compensation/statutory"
                element={
                  <PermissionRoute permission="compensation.manage_statutory">
                    <AppLayout>
                      <StatutoryConfigPage />
                    </AppLayout>
                  </PermissionRoute>
                }
              />

              <Route
                path="/hr/compensation/calculator"
                element={
                  <PermissionRoute permission="compensation.view_company">
                    <AppLayout>
                      <SalaryCalculatorPage />
                    </AppLayout>
                  </PermissionRoute>
                }
              />

              {/* Payroll Processing Engine Routes (Part 7) */}
              <Route
                path="/hr/payroll"
                element={
                  <PermissionRoute permission="payroll.view">
                    <AppLayout>
                      <HRPayrollDashboardPage />
                    </AppLayout>
                  </PermissionRoute>
                }
              />
              <Route
                path="/hr/payroll/runs"
                element={
                  <PermissionRoute permission="payroll.view">
                    <AppLayout>
                      <PayrollRunsListPage />
                    </AppLayout>
                  </PermissionRoute>
                }
              />
              <Route
                path="/hr/payroll/runs/new"
                element={
                  <PermissionRoute permission="payroll.create">
                    <AppLayout>
                      <CreatePayrollRunWizardPage />
                    </AppLayout>
                  </PermissionRoute>
                }
              />
              <Route
                path="/hr/payroll/runs/:runId"
                element={
                  <PermissionRoute permission="payroll.view">
                    <AppLayout>
                      <PayrollRunDetailsPage />
                    </AppLayout>
                  </PermissionRoute>
                }
              />
              <Route
                path="/hr/payroll/runs/:runId/preview"
                element={
                  <PermissionRoute permission="payroll.view">
                    <AppLayout>
                      <PayrollRunDetailsPage />
                    </AppLayout>
                  </PermissionRoute>
                }
              />
              <Route
                path="/hr/payroll/register"
                element={
                  <PermissionRoute permission="payroll.view">
                    <AppLayout>
                      <PayrollRegisterPage />
                    </AppLayout>
                  </PermissionRoute>
                }
              />
              <Route
                path="/hr/payroll/adjustments"
                element={
                  <PermissionRoute permission="payroll.adjust">
                    <AppLayout>
                      <PayrollAdjustmentsPage />
                    </AppLayout>
                  </PermissionRoute>
                }
              />
              <Route
                path="/hr/payroll/reports"
                element={
                  <PermissionRoute permission="payroll.export">
                    <AppLayout>
                      <PayrollReportsPage />
                    </AppLayout>
                  </PermissionRoute>
                }
              />
              <Route
                path="/employee/payroll"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <EmployeePayrollPage />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/employee/payroll/:payrollId"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <EmployeePayrollPage />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route path="/payroll" element={<Navigate to="/hr/payroll" replace />} />
              <Route path="/payslips" element={<Navigate to="/employee/payroll" replace />} />

              {/* Enterprise Payslips & Document Center Routes (Part 8) */}
              <Route
                path="/hr/payslips"
                element={
                  <PermissionRoute permission="payslip.view">
                    <AppLayout>
                      <HRPayslipsDashboardPage />
                    </AppLayout>
                  </PermissionRoute>
                }
              />
              <Route
                path="/hr/payslips/bulk"
                element={
                  <PermissionRoute permission="payslip.generate_bulk">
                    <AppLayout>
                      <BulkPayslipGenerationPage />
                    </AppLayout>
                  </PermissionRoute>
                }
              />
              <Route
                path="/hr/payslips/templates"
                element={
                  <PermissionRoute permission="payslip.manage_templates">
                    <AppLayout>
                      <PayslipTemplatesPage />
                    </AppLayout>
                  </PermissionRoute>
                }
              />
              <Route
                path="/hr/payslips/settings"
                element={
                  <PermissionRoute permission="payslip.manage_settings">
                    <AppLayout>
                      <PayslipSettingsPage />
                    </AppLayout>
                  </PermissionRoute>
                }
              />
              <Route
                path="/hr/payroll-documents"
                element={
                  <PermissionRoute permission="payroll_document.view">
                    <AppLayout>
                      <HRPayrollDocumentsPage />
                    </AppLayout>
                  </PermissionRoute>
                }
              />
              <Route
                path="/employee/payslips"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <EmployeePayrollPage />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/employee/payslips/:payslipId"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <EmployeePayrollPage />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/employee/documents"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <EmployeeDocumentsPage />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />

              {/* Bank Transfers, Payment Batches & Statutory Hub Routes (Part 9) */}
              <Route
                path="/hr/payments"
                element={
                  <PermissionRoute permission="payment.view">
                    <AppLayout>
                      <HRPaymentDashboardPage />
                    </AppLayout>
                  </PermissionRoute>
                }
              />
              <Route
                path="/hr/payments/batches"
                element={
                  <PermissionRoute permission="payment.view">
                    <AppLayout>
                      <HRPaymentDashboardPage />
                    </AppLayout>
                  </PermissionRoute>
                }
              />
              <Route
                path="/hr/payments/batches/new"
                element={
                  <PermissionRoute permission="payment.create">
                    <AppLayout>
                      <CreatePaymentBatchPage />
                    </AppLayout>
                  </PermissionRoute>
                }
              />
              <Route
                path="/hr/payments/batches/:batchId"
                element={
                  <PermissionRoute permission="payment.view">
                    <AppLayout>
                      <PaymentBatchDetailsPage />
                    </AppLayout>
                  </PermissionRoute>
                }
              />
              <Route
                path="/hr/payments/batches/:batchId/review"
                element={
                  <PermissionRoute permission="payment.view">
                    <AppLayout>
                      <PaymentBatchDetailsPage />
                    </AppLayout>
                  </PermissionRoute>
                }
              />
              <Route
                path="/hr/payments/batches/:batchId/reconciliation"
                element={
                  <PermissionRoute permission="payment.reconcile">
                    <AppLayout>
                      <PaymentBatchDetailsPage />
                    </AppLayout>
                  </PermissionRoute>
                }
              />
              <Route
                path="/hr/payments/bank-accounts"
                element={
                  <PermissionRoute permission="bank_account.view">
                    <AppLayout>
                      <CompanyBankAccountsPage />
                    </AppLayout>
                  </PermissionRoute>
                }
              />
              <Route
                path="/hr/payments/failures"
                element={
                  <PermissionRoute permission="payment.retry">
                    <AppLayout>
                      <HRPaymentDashboardPage />
                    </AppLayout>
                  </PermissionRoute>
                }
              />
              <Route
                path="/hr/payments/history"
                element={
                  <PermissionRoute permission="payment.view">
                    <AppLayout>
                      <HRPaymentDashboardPage />
                    </AppLayout>
                  </PermissionRoute>
                }
              />
              <Route
                path="/hr/statutory"
                element={
                  <PermissionRoute permission="statutory.view">
                    <AppLayout>
                      <HRStatutoryDashboardPage />
                    </AppLayout>
                  </PermissionRoute>
                }
              />
              <Route
                path="/hr/statutory/pf"
                element={
                  <PermissionRoute permission="statutory.export">
                    <AppLayout>
                      <HRStatutoryDashboardPage />
                    </AppLayout>
                  </PermissionRoute>
                }
              />
              <Route
                path="/hr/statutory/esi"
                element={
                  <PermissionRoute permission="statutory.export">
                    <AppLayout>
                      <HRStatutoryDashboardPage />
                    </AppLayout>
                  </PermissionRoute>
                }
              />
              <Route
                path="/hr/statutory/pt"
                element={
                  <PermissionRoute permission="statutory.export">
                    <AppLayout>
                      <HRStatutoryDashboardPage />
                    </AppLayout>
                  </PermissionRoute>
                }
              />
              <Route
                path="/hr/statutory/tds"
                element={
                  <PermissionRoute permission="statutory.export">
                    <AppLayout>
                      <HRStatutoryDashboardPage />
                    </AppLayout>
                  </PermissionRoute>
                }
              />
              <Route
                path="/employee/payments"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <EmployeePaymentsPage />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/hr/loans-advances"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <HRLoansAdvancesPage />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/hr/reimbursements"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <HRReimbursementsPage />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/employee/loans-advances"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <EmployeeLoansAdvancesPage />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/employee/reimbursements"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <EmployeeReimbursementsPage />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />

              {/* Advanced Reports, Analytics & Management Dashboard Routes (Part 10) */}
              <Route
                path="/analytics"
                element={
                  <PermissionRoute permission="analytics.view">
                    <AppLayout>
                      <ExecutiveAnalyticsDashboardPage />
                    </AppLayout>
                  </PermissionRoute>
                }
              />
              <Route
                path="/analytics/hr"
                element={
                  <PermissionRoute permission="analytics.view">
                    <AppLayout>
                      <ExecutiveAnalyticsDashboardPage />
                    </AppLayout>
                  </PermissionRoute>
                }
              />
              <Route
                path="/analytics/payroll"
                element={
                  <PermissionRoute permission="analytics.view">
                    <AppLayout>
                      <ExecutiveAnalyticsDashboardPage />
                    </AppLayout>
                  </PermissionRoute>
                }
              />
              <Route
                path="/analytics/employees"
                element={
                  <PermissionRoute permission="analytics.view">
                    <AppLayout>
                      <ExecutiveAnalyticsDashboardPage />
                    </AppLayout>
                  </PermissionRoute>
                }
              />
              <Route
                path="/reports"
                element={
                  <PermissionRoute permission="reports.view">
                    <AppLayout>
                      <ReportsCenterPage />
                    </AppLayout>
                  </PermissionRoute>
                }
              />
              <Route
                path="/reports/builder"
                element={
                  <PermissionRoute permission="reports.create">
                    <AppLayout>
                      <ReportBuilderPage />
                    </AppLayout>
                  </PermissionRoute>
                }
              />
              <Route
                path="/reports/exports"
                element={
                  <PermissionRoute permission="reports.export">
                    <AppLayout>
                      <ReportExportsPage />
                    </AppLayout>
                  </PermissionRoute>
                }
              />

              {/* Enterprise HR Automation, AI & Integration Routes (Part 11) */}
              <Route
                path="/automation"
                element={
                  <PermissionRoute permission="automation.view">
                    <AppLayout>
                      <HRAutomationDashboardPage />
                    </AppLayout>
                  </PermissionRoute>
                }
              />
              <Route
                path="/automation/rules"
                element={
                  <PermissionRoute permission="automation.view">
                    <AppLayout>
                      <HRAutomationDashboardPage />
                    </AppLayout>
                  </PermissionRoute>
                }
              />
              <Route
                path="/automation/tasks"
                element={
                  <PermissionRoute permission="automation.view">
                    <AppLayout>
                      <HRAutomationDashboardPage />
                    </AppLayout>
                  </PermissionRoute>
                }
              />
              <Route
                path="/ai-assistant"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <HRAIAssistantPage />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/ai-assistant/payroll"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <HRAIAssistantPage />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/integrations"
                element={
                  <PermissionRoute permission="integrations.view">
                    <AppLayout>
                      <IntegrationCenterPage />
                    </AppLayout>
                  </PermissionRoute>
                }
              />
              <Route
                path="/integrations/webhooks"
                element={
                  <PermissionRoute permission="webhooks.manage">
                    <AppLayout>
                      <IntegrationCenterPage />
                    </AppLayout>
                  </PermissionRoute>
                }
              />
              <Route
                path="/integrations/api-keys"
                element={
                  <PermissionRoute permission="api_keys.manage">
                    <AppLayout>
                      <IntegrationCenterPage />
                    </AppLayout>
                  </PermissionRoute>
                }
              />

              {/* Manager Routes */}
              <Route
                path="/manager/dashboard"
                element={
                  <RoleRoute allowedRoles={['MANAGER', 'SUPER_ADMIN']}>
                    <AppLayout>
                      <ManagerDashboard />
                    </AppLayout>
                  </RoleRoute>
                }
              />

              <Route
                path="/manager/attendance"
                element={
                  <PermissionRoute permission="attendance.view_team">
                    <AppLayout>
                      <ManagerAttendancePage />
                    </AppLayout>
                  </PermissionRoute>
                }
              />

              <Route
                path="/manager/leave"
                element={
                  <PermissionRoute permission="leave.approve_team">
                    <AppLayout>
                      <ManagerLeavePage />
                    </AppLayout>
                  </PermissionRoute>
                }
              />

              {/* Employee Routes */}
              <Route
                path="/employee/dashboard"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <EmployeeDashboard />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/employee/compensation"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <EmpCompPage />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/employee/attendance"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <EmployeeAttendancePage />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/employee/leave"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <EmployeeLeavePage />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/employee/payments"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <EmployeePaymentsPage />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />

              {/* Security & Settings */}
              <Route
                path="/settings/security"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <SecuritySettingsPage />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />

              {/* Profile & Dropdown Common Routes */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <SecuritySettingsPage />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings/account"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <SecuritySettingsPage />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/company/settings"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <CompanyOverviewPage />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/hr/company"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <CompanyOverviewPage />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/notifications"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <NotificationCenterPage />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/support"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <SupportTicketsPage />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/audit-logs"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <AuditLogsPage />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />


              {/* Fallback & Root */}
              <Route path="/" element={<RootRedirect />} />

              <Route path="*" element={<RootRedirect />} />
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
