-- Enterprise Payroll Management System Database Schema & RLS Policies
-- Part 1: Authentication, RBAC, Tenant Isolation & Security Audit

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==========================================
-- 1. COMPANIES / TENANTS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(255) UNIQUE,
    code VARCHAR(50) UNIQUE NOT NULL,
    tax_identifier VARCHAR(100),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================
-- 2. ROLES & PERMISSIONS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    is_system BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.role_permissions (
    role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (role_id, permission_id)
);

-- Seed System Roles
INSERT INTO public.roles (name, description, is_system) VALUES
('SUPER_ADMIN', 'Full system administration across all tenants', true),
('HR_ADMIN', 'Human resources and payroll administration for company', true),
('MANAGER', 'Team leadership and approval authority', true),
('EMPLOYEE', 'Standard employee portal access', true)
ON CONFLICT (name) DO NOTHING;

-- Seed System Permissions
INSERT INTO public.permissions (name, category, description) VALUES
-- Employee Self Permissions
('employee.view_self', 'employee', 'View own profile and employment data'),
('employee.edit_self', 'employee', 'Edit own personal profile data'),
('employee.view_payslip', 'payroll', 'View own payslips'),
('employee.download_payslip', 'payroll', 'Download own payslips'),
('employee.apply_leave', 'leave', 'Submit leave requests'),
('employee.view_leave_balance', 'leave', 'View own leave entitlement and balance'),
('employee.submit_expense', 'expense', 'Submit expense reimbursement requests'),

-- Manager Team Permissions
('employee.view_team', 'manager', 'View direct reports profile data'),
('attendance.view_team', 'attendance', 'View team attendance logs'),
('leave.approve_team', 'leave', 'Approve or reject team leave requests'),
('performance.view_team', 'manager', 'View team performance reviews'),

-- HR Admin Permissions
('employee.create', 'hr', 'Create new employee profiles'),
('employee.edit', 'hr', 'Modify any employee profile in company'),
('employee.deactivate', 'hr', 'Deactivate or terminate employee access'),
('employee.view_salary', 'hr', 'View sensitive salary and compensation data'),
('attendance.manage', 'attendance', 'Manage company-wide attendance and shifts'),
('leave.manage', 'leave', 'Manage leave policies and company calendars'),
('payroll.view', 'payroll', 'View company payroll statistics'),
('payroll.process', 'payroll', 'Run and calculate payroll'),
('payroll.finalize', 'payroll', 'Finalize payroll run and trigger disbursements'),
('reports.view', 'analytics', 'Access analytical HR and payroll reports'),

-- Super Admin System Permissions
('company.create', 'admin', 'Create new tenant company accounts'),
('company.manage', 'admin', 'Modify company settings and configurations'),
('users.manage', 'admin', 'Manage user accounts and role assignments'),
('roles.manage', 'admin', 'Configure system roles and permission sets'),
('permissions.manage', 'admin', 'Modify permission definitions'),
('audit.view', 'audit', 'View global security audit logs'),
('billing.manage', 'admin', 'Manage enterprise subscription billing'),
('system.settings', 'admin', 'Configure global application parameters')
ON CONFLICT (name) DO NOTHING;

-- Map Role Permissions
DO $$
DECLARE
    super_admin_id UUID;
    hr_admin_id UUID;
    manager_id UUID;
    employee_id UUID;
BEGIN
    SELECT id INTO super_admin_id FROM public.roles WHERE name = 'SUPER_ADMIN';
    SELECT id INTO hr_admin_id FROM public.roles WHERE name = 'HR_ADMIN';
    SELECT id INTO manager_id FROM public.roles WHERE name = 'MANAGER';
    SELECT id INTO employee_id FROM public.roles WHERE name = 'EMPLOYEE';

    -- Super Admin gets ALL permissions
    INSERT INTO public.role_permissions (role_id, permission_id)
    SELECT super_admin_id, id FROM public.permissions
    ON CONFLICT DO NOTHING;

    -- HR Admin Permissions
    INSERT INTO public.role_permissions (role_id, permission_id)
    SELECT hr_admin_id, id FROM public.permissions WHERE name IN (
        'employee.view_self', 'employee.edit_self', 'employee.view_payslip', 'employee.download_payslip',
        'employee.apply_leave', 'employee.view_leave_balance', 'employee.submit_expense',
        'employee.view_team', 'attendance.view_team', 'leave.approve_team', 'performance.view_team',
        'employee.create', 'employee.edit', 'employee.deactivate', 'employee.view_salary',
        'attendance.manage', 'leave.manage', 'payroll.view', 'payroll.process', 'payroll.finalize', 'reports.view'
    ) ON CONFLICT DO NOTHING;

    -- Manager Permissions
    INSERT INTO public.role_permissions (role_id, permission_id)
    SELECT manager_id, id FROM public.permissions WHERE name IN (
        'employee.view_self', 'employee.edit_self', 'employee.view_payslip', 'employee.download_payslip',
        'employee.apply_leave', 'employee.view_leave_balance', 'employee.submit_expense',
        'employee.view_team', 'attendance.view_team', 'leave.approve_team', 'performance.view_team'
    ) ON CONFLICT DO NOTHING;

    -- Employee Permissions
    INSERT INTO public.role_permissions (role_id, permission_id)
    SELECT employee_id, id FROM public.permissions WHERE name IN (
        'employee.view_self', 'employee.edit_self', 'employee.view_payslip', 'employee.download_payslip',
        'employee.apply_leave', 'employee.view_leave_balance', 'employee.submit_expense'
    ) ON CONFLICT DO NOTHING;
END $$;

-- ==========================================
-- 3. USER PROFILES & USER ROLES
-- ==========================================
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    company_id UUID REFERENCES public.companies(id) ON DELETE RESTRICT,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(30),
    avatar_url TEXT,
    job_title VARCHAR(100),
    department_name VARCHAR(100),
    manager_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    is_first_login BOOLEAN DEFAULT true,
    profile_completed BOOLEAN DEFAULT false,
    two_factor_enabled BOOLEAN DEFAULT false,
    two_factor_secret TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_roles (
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, role_id)
);

-- ==========================================
-- 4. DETAILED EMPLOYEE PROFILE DATA (Tenant isolated)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    user_id UUID UNIQUE REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    employee_code VARCHAR(50) NOT NULL,
    personal_info JSONB DEFAULT '{}'::jsonb,
    contact_info JSONB DEFAULT '{}'::jsonb,
    bank_info JSONB DEFAULT '{}'::jsonb,
    emergency_contact JSONB DEFAULT '{}'::jsonb,
    documents JSONB DEFAULT '[]'::jsonb,
    security_setup JSONB DEFAULT '{}'::jsonb,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_company_employee_code UNIQUE (company_id, employee_code)
);

-- ==========================================
-- 5. SECURITY SESSIONS & LOGIN AUDIT
-- ==========================================
CREATE TABLE IF NOT EXISTS public.security_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    session_token TEXT UNIQUE NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    device_info VARCHAR(100),
    browser VARCHAR(100),
    location VARCHAR(100),
    is_revoked BOOLEAN DEFAULT false,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.login_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
    email VARCHAR(255) NOT NULL,
    event_type VARCHAR(50) NOT NULL, -- login_success, login_failed, logout, password_reset_request, etc.
    ip_address VARCHAR(45),
    user_agent TEXT,
    device_info VARCHAR(100),
    browser VARCHAR(100),
    location VARCHAR(100),
    status VARCHAR(20) NOT NULL, -- SUCCESS, FAILED, WARNING
    failure_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity VARCHAR(100) NOT NULL,
    entity_id TEXT,
    old_value JSONB,
    new_value JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================
-- 6. INDEXES FOR HIGH PERFORMANCE
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_user_profiles_company_id ON public.user_profiles(company_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_employees_company_id ON public.employees(company_id);
CREATE INDEX IF NOT EXISTS idx_employees_user_id ON public.employees(user_id);
CREATE INDEX IF NOT EXISTS idx_security_sessions_user_id ON public.security_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_security_sessions_token ON public.security_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_login_events_user_id ON public.login_events(user_id);
CREATE INDEX IF NOT EXISTS idx_login_events_created_at ON public.login_events(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_company_id ON public.audit_logs(company_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at);

-- ==========================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.login_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to check super admin status
CREATE OR REPLACE FUNCTION public.is_super_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_roles ur
        JOIN public.roles r ON ur.role_id = r.id
        WHERE ur.user_id = $1 AND r.name = 'SUPER_ADMIN'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to get current user company_id
CREATE OR REPLACE FUNCTION public.get_user_company_id(user_id UUID)
RETURNS UUID AS $$
DECLARE
    cid UUID;
BEGIN
    SELECT company_id INTO cid FROM public.user_profiles WHERE id = user_id;
    RETURN cid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS: user_profiles
CREATE POLICY "Users can read own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = id OR public.is_super_admin(auth.uid()));

CREATE POLICY "HR Admins can read company profiles" ON public.user_profiles
    FOR SELECT USING (company_id = public.get_user_company_id(auth.uid()));

CREATE POLICY "Users can update own non-sensitive profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = id);

-- RLS: employees
CREATE POLICY "Employees can read own record" ON public.employees
    FOR SELECT USING (user_id = auth.uid() OR public.is_super_admin(auth.uid()));

CREATE POLICY "Managers can read direct report employees" ON public.employees
    FOR SELECT USING (
        user_id IN (
            SELECT id FROM public.user_profiles WHERE manager_id = auth.uid()
        )
    );

CREATE POLICY "HR Admins can manage company employees" ON public.employees
    FOR ALL USING (company_id = public.get_user_company_id(auth.uid()));

-- RLS: security_sessions & login_events
CREATE POLICY "Users can view own security sessions" ON public.security_sessions
    FOR SELECT USING (user_id = auth.uid() OR public.is_super_admin(auth.uid()));

CREATE POLICY "Users can view own login events" ON public.login_events
    FOR SELECT USING (user_id = auth.uid() OR public.is_super_admin(auth.uid()));

CREATE POLICY "Admins can view company audit logs" ON public.audit_logs
    FOR SELECT USING (company_id = public.get_user_company_id(auth.uid()) OR public.is_super_admin(auth.uid()));
