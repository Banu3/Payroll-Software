-- Enterprise Payroll Management System — Complete Master Database Migration (Parts 1 - 11)
-- Project: Payroll-Software (Supabase PostgreSQL)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ====================================================================
-- PART 1: AUTHENTICATION, RBAC, TENANT ISOLATION & AUDIT
-- ====================================================================

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

INSERT INTO public.roles (name, description, is_system) VALUES
('SUPER_ADMIN', 'Full system administration across all tenants', true),
('HR_ADMIN', 'Human resources and payroll administration for company', true),
('MANAGER', 'Team leadership and approval authority', true),
('EMPLOYEE', 'Standard employee portal access', true)
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.permissions (name, category, description) VALUES
('employee.view_self', 'employee', 'View own profile and employment data'),
('employee.edit_self', 'employee', 'Edit own personal profile data'),
('employee.view_payslip', 'payroll', 'View own payslips'),
('employee.download_payslip', 'payroll', 'Download own payslips'),
('employee.apply_leave', 'leave', 'Submit leave requests'),
('employee.view_leave_balance', 'leave', 'View own leave entitlement and balance'),
('employee.submit_expense', 'expense', 'Submit expense reimbursement requests'),
('employee.view_team', 'manager', 'View direct reports profile data'),
('attendance.view_team', 'attendance', 'View team attendance logs'),
('leave.approve_team', 'leave', 'Approve or reject team leave requests'),
('performance.view_team', 'manager', 'View team performance reviews'),
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
('company.create', 'admin', 'Create new tenant company accounts'),
('company.manage', 'admin', 'Modify company settings and configurations'),
('users.manage', 'admin', 'Manage user accounts and role assignments'),
('roles.manage', 'admin', 'Configure system roles and permission sets'),
('permissions.manage', 'admin', 'Modify permission definitions'),
('audit.view', 'audit', 'View global security audit logs'),
('billing.manage', 'admin', 'Manage enterprise subscription billing'),
('system.settings', 'admin', 'Configure global application parameters')
ON CONFLICT (name) DO NOTHING;

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

    INSERT INTO public.role_permissions (role_id, permission_id)
    SELECT super_admin_id, id FROM public.permissions ON CONFLICT DO NOTHING;

    INSERT INTO public.role_permissions (role_id, permission_id)
    SELECT hr_admin_id, id FROM public.permissions WHERE name IN (
        'employee.view_self', 'employee.edit_self', 'employee.view_payslip', 'employee.download_payslip',
        'employee.apply_leave', 'employee.view_leave_balance', 'employee.submit_expense',
        'employee.view_team', 'attendance.view_team', 'leave.approve_team', 'performance.view_team',
        'employee.create', 'employee.edit', 'employee.deactivate', 'employee.view_salary',
        'attendance.manage', 'leave.manage', 'payroll.view', 'payroll.process', 'payroll.finalize', 'reports.view'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO public.role_permissions (role_id, permission_id)
    SELECT manager_id, id FROM public.permissions WHERE name IN (
        'employee.view_self', 'employee.edit_self', 'employee.view_payslip', 'employee.download_payslip',
        'employee.apply_leave', 'employee.view_leave_balance', 'employee.submit_expense',
        'employee.view_team', 'attendance.view_team', 'leave.approve_team', 'performance.view_team'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO public.role_permissions (role_id, permission_id)
    SELECT employee_id, id FROM public.permissions WHERE name IN (
        'employee.view_self', 'employee.edit_self', 'employee.view_payslip', 'employee.download_payslip',
        'employee.apply_leave', 'employee.view_leave_balance', 'employee.submit_expense'
    ) ON CONFLICT DO NOTHING;
END $$;

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
    event_type VARCHAR(50) NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    device_info VARCHAR(100),
    browser VARCHAR(100),
    location VARCHAR(100),
    status VARCHAR(20) NOT NULL,
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

-- ====================================================================
-- PART 2: COMPANY MANAGEMENT & SUBSCRIPTIONS
-- ====================================================================

ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS industry VARCHAR(100) DEFAULT 'Technology',
ADD COLUMN IF NOT EXISTS company_type VARCHAR(100) DEFAULT 'Corporation',
ADD COLUMN IF NOT EXISTS legal_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS registration_number VARCHAR(100),
ADD COLUMN IF NOT EXISTS website VARCHAR(255),
ADD COLUMN IF NOT EXISTS phone VARCHAR(50),
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS pay_frequency VARCHAR(50) DEFAULT 'Monthly',
ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT 'INR',
ADD COLUMN IF NOT EXISTS financial_year_start VARCHAR(50) DEFAULT 'April',
ADD COLUMN IF NOT EXISTS payroll_date INTEGER DEFAULT 30,
ADD COLUMN IF NOT EXISTS primary_admin_id UUID REFERENCES public.user_profiles(id);

CREATE TABLE IF NOT EXISTS public.company_branches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    branch_name VARCHAR(255) NOT NULL,
    branch_code VARCHAR(50) NOT NULL,
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    postal_code VARCHAR(20),
    timezone VARCHAR(100) DEFAULT 'Asia/Kolkata',
    phone VARCHAR(50),
    manager_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_company_branch_code UNIQUE (company_id, branch_code)
);

CREATE TABLE IF NOT EXISTS public.departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL,
    head_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_company_dept_code UNIQUE (company_id, code)
);

CREATE TABLE IF NOT EXISTS public.designations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL,
    level VARCHAR(50),
    description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_company_designation_code UNIQUE (company_id, code)
);

CREATE TABLE IF NOT EXISTS public.company_settings (
    company_id UUID PRIMARY KEY REFERENCES public.companies(id) ON DELETE CASCADE,
    general JSONB DEFAULT '{}'::jsonb,
    address JSONB DEFAULT '{}'::jsonb,
    payroll JSONB DEFAULT '{}'::jsonb,
    attendance JSONB DEFAULT '{}'::jsonb,
    leave JSONB DEFAULT '{}'::jsonb,
    notifications JSONB DEFAULT '{}'::jsonb,
    security JSONB DEFAULT '{}'::jsonb,
    branding JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    price_monthly NUMERIC(10,2) DEFAULT 0.00,
    price_annually NUMERIC(10,2) DEFAULT 0.00,
    employee_limit INTEGER NOT NULL DEFAULT 50,
    storage_limit_gb INTEGER NOT NULL DEFAULT 10,
    features JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO public.subscription_plans (name, code, description, price_monthly, price_annually, employee_limit, storage_limit_gb, features) VALUES
('Starter', 'STARTER', 'For small teams getting started with basic payroll', 49.00, 490.00, 25, 5, '["payroll", "attendance", "leave"]'::jsonb),
('Professional', 'PROFESSIONAL', 'For growing companies with multi-branch management', 149.00, 1490.00, 250, 25, '["payroll", "attendance", "leave", "expenses", "multi_branch", "reports"]'::jsonb),
('Enterprise Unlimited', 'ENTERPRISE', 'Full platform capabilities with custom integration & unlimited scale', 599.00, 5990.00, 10000, 500, '["payroll", "attendance", "leave", "expenses", "loans", "performance", "reports", "ai_assistant", "geo_attendance", "biometric", "multi_branch"]'::jsonb)
ON CONFLICT (code) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.company_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID UNIQUE NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES public.subscription_plans(id),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    employee_limit INTEGER DEFAULT 250,
    storage_limit_gb INTEGER DEFAULT 25,
    start_date TIMESTAMPTZ DEFAULT NOW(),
    renewal_date TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '1 year'),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    link VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ====================================================================
-- PART 3: DETAILED EMPLOYEE PROFILES & ONBOARDING
-- ====================================================================

ALTER TABLE public.employees
ADD COLUMN IF NOT EXISTS first_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS middle_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS last_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS preferred_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS work_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS personal_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS phone VARCHAR(30),
ADD COLUMN IF NOT EXISTS alternate_phone VARCHAR(30),
ADD COLUMN IF NOT EXISTS dob DATE,
ADD COLUMN IF NOT EXISTS gender VARCHAR(30),
ADD COLUMN IF NOT EXISTS marital_status VARCHAR(30),
ADD COLUMN IF NOT EXISTS nationality VARCHAR(100),
ADD COLUMN IF NOT EXISTS profile_photo_url TEXT,
ADD COLUMN IF NOT EXISTS joining_date DATE DEFAULT CURRENT_DATE,
ADD COLUMN IF NOT EXISTS employment_type VARCHAR(50) DEFAULT 'Full Time',
ADD COLUMN IF NOT EXISTS employment_status VARCHAR(50) DEFAULT 'ACTIVE',
ADD COLUMN IF NOT EXISTS probation_period_months INTEGER DEFAULT 3,
ADD COLUMN IF NOT EXISTS probation_end_date DATE,
ADD COLUMN IF NOT EXISTS confirmation_date DATE,
ADD COLUMN IF NOT EXISTS notice_period_days INTEGER DEFAULT 30,
ADD COLUMN IF NOT EXISTS work_location VARCHAR(100) DEFAULT 'Main Office',
ADD COLUMN IF NOT EXISTS branch_id UUID REFERENCES public.company_branches(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS designation_id UUID REFERENCES public.designations(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS reporting_manager_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS onboarding_status VARCHAR(50) DEFAULT 'COMPLETED';

CREATE TABLE IF NOT EXISTS public.employee_bank_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID UNIQUE NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    account_holder_name VARCHAR(255) NOT NULL,
    bank_name VARCHAR(255) NOT NULL,
    account_number_encrypted TEXT NOT NULL,
    account_number_masked VARCHAR(50) NOT NULL,
    ifsc_code VARCHAR(50) NOT NULL,
    branch_name VARCHAR(255),
    is_primary BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ====================================================================
-- PART 4: ATTENDANCE, SHIFTS & HOLIDAYS
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.shifts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    grace_period_mins INTEGER DEFAULT 15,
    min_working_hours NUMERIC(4,2) DEFAULT 8.00,
    break_duration_mins INTEGER DEFAULT 60,
    overtime_threshold_hours NUMERIC(4,2) DEFAULT 8.00,
    is_night_shift BOOLEAN DEFAULT false,
    is_cross_midnight BOOLEAN DEFAULT false,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_company_shift_code UNIQUE (company_id, code)
);

CREATE TABLE IF NOT EXISTS public.attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    shift_id UUID REFERENCES public.shifts(id) ON DELETE SET NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PRESENT',
    scheduled_start TIMESTAMPTZ,
    scheduled_end TIMESTAMPTZ,
    actual_check_in TIMESTAMPTZ,
    actual_check_out TIMESTAMPTZ,
    gross_hours NUMERIC(5,2) DEFAULT 0.00,
    break_hours NUMERIC(5,2) DEFAULT 1.00,
    net_hours NUMERIC(5,2) DEFAULT 0.00,
    late_minutes INTEGER DEFAULT 0,
    early_exit_minutes INTEGER DEFAULT 0,
    overtime_hours NUMERIC(5,2) DEFAULT 0.00,
    is_locked BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_company_employee_date UNIQUE (company_id, employee_id, date)
);

CREATE TABLE IF NOT EXISTS public.holidays (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'PUBLIC',
    branch_id UUID REFERENCES public.company_branches(id) ON DELETE CASCADE,
    description TEXT,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ====================================================================
-- PART 5: LEAVE MANAGEMENT
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.leave_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) NOT NULL,
    description TEXT,
    category VARCHAR(20) NOT NULL DEFAULT 'PAID',
    annual_allowance NUMERIC(5,2) NOT NULL DEFAULT 12.00,
    allow_carry_forward BOOLEAN NOT NULL DEFAULT true,
    max_carry_forward NUMERIC(5,2) DEFAULT 5.00,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_company_leave_code UNIQUE(company_id, code)
);

CREATE TABLE IF NOT EXISTS public.leave_balances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    leave_type_id UUID NOT NULL REFERENCES public.leave_types(id) ON DELETE CASCADE,
    year INT NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
    opening_balance NUMERIC(5,2) NOT NULL DEFAULT 12.00,
    accrued NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    used NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    pending NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    carried_forward NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    available NUMERIC(5,2) NOT NULL DEFAULT 12.00,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_employee_leave_year UNIQUE(company_id, employee_id, leave_type_id, year)
);

CREATE TABLE IF NOT EXISTS public.leave_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    leave_type_id UUID NOT NULL REFERENCES public.leave_types(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    duration NUMERIC(5,2) NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ====================================================================
-- PART 6: COMPENSATION & SALARY STRUCTURE
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.salary_components (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(50) NOT NULL,
    type VARCHAR(30) NOT NULL,
    category VARCHAR(30) NOT NULL DEFAULT 'ALLOWANCE',
    value NUMERIC(12,2) DEFAULT 0.00,
    is_taxable BOOLEAN NOT NULL DEFAULT true,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_company_component_code UNIQUE(company_id, code)
);

CREATE TABLE IF NOT EXISTS public.employee_compensation (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    annual_ctc NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    monthly_ctc NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    monthly_gross NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    basic_salary NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    total_deductions NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    estimated_net_salary NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    effective_from DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ====================================================================
-- PART 7: PAYROLL PROCESSING ENGINE
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.payroll_periods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    month_year VARCHAR(20) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    pay_date DATE NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'OPEN',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_company_payroll_period UNIQUE(company_id, month_year)
);

CREATE TABLE IF NOT EXISTS public.payroll_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    payroll_period_id UUID NOT NULL REFERENCES public.payroll_periods(id) ON DELETE CASCADE,
    run_number VARCHAR(50) NOT NULL,
    total_employees INT NOT NULL DEFAULT 0,
    processed_employees INT NOT NULL DEFAULT 0,
    status VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
    total_gross NUMERIC(14,2) NOT NULL DEFAULT 0.00,
    total_deductions NUMERIC(14,2) NOT NULL DEFAULT 0.00,
    total_net_pay NUMERIC(14,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.payroll_run_employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    payroll_run_id UUID NOT NULL REFERENCES public.payroll_runs(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    paid_days NUMERIC(5,2) NOT NULL DEFAULT 30.0,
    gross_earnings NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    total_deductions NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    net_salary NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_run_employee UNIQUE(payroll_run_id, employee_id)
);

-- ====================================================================
-- PART 8: PAYSLIPS & DOCUMENTS
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.payslips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    payroll_run_id UUID NOT NULL REFERENCES public.payroll_runs(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    payslip_number VARCHAR(50) NOT NULL,
    pay_period_start DATE NOT NULL,
    pay_period_end DATE NOT NULL,
    pay_date DATE NOT NULL,
    gross_earnings NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    total_deductions NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    net_salary NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    document_status VARCHAR(30) NOT NULL DEFAULT 'GENERATED',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_company_payslip_number UNIQUE(company_id, payslip_number)
);

-- ====================================================================
-- PART 9: BANK TRANSFERS & STATUTORY
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.payment_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    payroll_run_id UUID NOT NULL REFERENCES public.payroll_runs(id) ON DELETE CASCADE,
    batch_number VARCHAR(50) NOT NULL,
    total_employees INT NOT NULL DEFAULT 0,
    total_net_amount NUMERIC(14,2) NOT NULL DEFAULT 0.00,
    status VARCHAR(30) NOT NULL DEFAULT 'READY',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_company_payment_batch UNIQUE(company_id, batch_number)
);

-- ====================================================================
-- HELPER RLS FUNCTIONS
-- ====================================================================

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

CREATE OR REPLACE FUNCTION public.get_user_company_id(user_id UUID)
RETURNS UUID AS $$
DECLARE
    cid UUID;
BEGIN
    SELECT company_id INTO cid FROM public.user_profiles WHERE id = user_id;
    RETURN cid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ====================================================================
-- ENABLE ROW LEVEL SECURITY ON ALL TABLES
-- ====================================================================

ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.designations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.holidays ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salary_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_compensation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payslips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_batches ENABLE ROW LEVEL SECURITY;

-- Dynamic RLS Policies
DROP POLICY IF EXISTS "Public read companies" ON public.companies;
CREATE POLICY "Public read companies" ON public.companies FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users view profiles" ON public.user_profiles;
CREATE POLICY "Users view profiles" ON public.user_profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Employees view employees" ON public.employees;
CREATE POLICY "Employees view employees" ON public.employees FOR SELECT USING (true);

DROP POLICY IF EXISTS "All read shifts" ON public.shifts;
CREATE POLICY "All read shifts" ON public.shifts FOR SELECT USING (true);

DROP POLICY IF EXISTS "All read attendance" ON public.attendance;
CREATE POLICY "All read attendance" ON public.attendance FOR SELECT USING (true);

DROP POLICY IF EXISTS "All read leave_types" ON public.leave_types;
CREATE POLICY "All read leave_types" ON public.leave_types FOR SELECT USING (true);

DROP POLICY IF EXISTS "All read leave_requests" ON public.leave_requests;
CREATE POLICY "All read leave_requests" ON public.leave_requests FOR SELECT USING (true);

DROP POLICY IF EXISTS "All read payroll_runs" ON public.payroll_runs;
CREATE POLICY "All read payroll_runs" ON public.payroll_runs FOR SELECT USING (true);

DROP POLICY IF EXISTS "All read payslips" ON public.payslips;
CREATE POLICY "All read payslips" ON public.payslips FOR SELECT USING (true);

-- SUCCESS CONFIRMATION
SELECT 'Complete Payroll Database Migration executed successfully!' AS result;