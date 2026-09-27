-- ====================================================================
-- PART 5: ENTERPRISE LEAVE MANAGEMENT SYSTEM SCHEMA
-- ====================================================================

-- 1. LEAVE TYPES
CREATE TABLE IF NOT EXISTS public.leave_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) NOT NULL,
    description TEXT,
    category VARCHAR(20) NOT NULL DEFAULT 'PAID' CHECK (category IN ('PAID', 'UNPAID')),
    annual_allowance NUMERIC(5,2) NOT NULL DEFAULT 12.00,
    accrual_frequency VARCHAR(20) NOT NULL DEFAULT 'MONTHLY' CHECK (accrual_frequency IN ('MONTHLY', 'QUARTERLY', 'ANNUAL')),
    allow_carry_forward BOOLEAN NOT NULL DEFAULT true,
    max_carry_forward NUMERIC(5,2) DEFAULT 5.00,
    allow_encashment BOOLEAN NOT NULL DEFAULT false,
    max_encashment NUMERIC(5,2) DEFAULT 0.00,
    allow_half_day BOOLEAN NOT NULL DEFAULT true,
    allow_negative_balance BOOLEAN NOT NULL DEFAULT false,
    max_consecutive_days INT DEFAULT 10,
    min_notice_days INT DEFAULT 0,
    document_required BOOLEAN NOT NULL DEFAULT false,
    document_required_after_days INT DEFAULT 3,
    gender_eligibility VARCHAR(20) DEFAULT 'ALL' CHECK (gender_eligibility IN ('ALL', 'MALE', 'FEMALE', 'OTHER')),
    probation_eligibility BOOLEAN NOT NULL DEFAULT true,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_company_leave_code UNIQUE(company_id, code)
);

-- 2. LEAVE POLICIES
CREATE TABLE IF NOT EXISTS public.leave_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    effective_from DATE NOT NULL,
    effective_to DATE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. LEAVE POLICY ASSIGNMENTS
CREATE TABLE IF NOT EXISTS public.leave_policy_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    policy_id UUID REFERENCES public.leave_policies(id) ON DELETE CASCADE,
    leave_type_id UUID NOT NULL REFERENCES public.leave_types(id) ON DELETE CASCADE,
    allowance_days NUMERIC(5,2) NOT NULL,
    branch_id UUID REFERENCES public.branches(id) ON DELETE CASCADE,
    department_id UUID REFERENCES public.departments(id) ON DELETE CASCADE,
    designation_id UUID REFERENCES public.designations(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
    priority INT NOT NULL DEFAULT 1, -- 100 for individual, 50 for dept/branch, 10 for company
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. LEAVE BALANCES
CREATE TABLE IF NOT EXISTS public.leave_balances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    leave_type_id UUID NOT NULL REFERENCES public.leave_types(id) ON DELETE CASCADE,
    year INT NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
    opening_balance NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    accrued NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    used NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    pending NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    carried_forward NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    adjusted NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    available NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_employee_leave_year UNIQUE(company_id, employee_id, leave_type_id, year)
);

-- 5. LEAVE LEDGER (Immutable audit log of all balance changes)
CREATE TABLE IF NOT EXISTS public.leave_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    leave_type_id UUID NOT NULL REFERENCES public.leave_types(id) ON DELETE CASCADE,
    transaction_type VARCHAR(30) NOT NULL CHECK (transaction_type IN (
        'OPENING_BALANCE', 'ACCRUAL', 'LEAVE_USED', 'LEAVE_CANCELLED', 'MANUAL_ADJUSTMENT', 'CARRY_FORWARD', 'ENCASHMENT', 'EXPIRY'
    )),
    days NUMERIC(5,2) NOT NULL,
    balance_before NUMERIC(5,2) NOT NULL,
    balance_after NUMERIC(5,2) NOT NULL,
    reference_type VARCHAR(50),
    reference_id UUID,
    reason TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. LEAVE REQUESTS
CREATE TABLE IF NOT EXISTS public.leave_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    leave_type_id UUID NOT NULL REFERENCES public.leave_types(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    duration NUMERIC(5,2) NOT NULL,
    day_type VARCHAR(20) NOT NULL DEFAULT 'FULL_DAY' CHECK (day_type IN ('FULL_DAY', 'FIRST_HALF', 'SECOND_HALF')),
    reason TEXT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING' CHECK (status IN (
        'DRAFT', 'PENDING', 'MANAGER_APPROVED', 'HR_APPROVED', 'APPROVED', 'REJECTED', 'WITHDRAWN', 'CANCELLATION_PENDING', 'CANCELLED'
    )),
    rejection_reason TEXT,
    cancellation_reason TEXT,
    is_emergency BOOLEAN NOT NULL DEFAULT false,
    document_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. LEAVE APPROVAL HISTORY
CREATE TABLE IF NOT EXISTS public.leave_approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    leave_request_id UUID NOT NULL REFERENCES public.leave_requests(id) ON DELETE CASCADE,
    approver_id UUID NOT NULL REFERENCES auth.users(id),
    approver_role VARCHAR(50) NOT NULL,
    stage INT NOT NULL DEFAULT 1,
    action VARCHAR(20) NOT NULL CHECK (action IN ('APPROVED', 'REJECTED')),
    comments TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. MANUAL LEAVE ADJUSTMENTS
CREATE TABLE IF NOT EXISTS public.leave_adjustments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    leave_type_id UUID NOT NULL REFERENCES public.leave_types(id) ON DELETE CASCADE,
    adjustment_days NUMERIC(5,2) NOT NULL,
    effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
    reason TEXT NOT NULL,
    adjusted_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. LEAVE ENCASHMENTS
CREATE TABLE IF NOT EXISTS public.leave_encashments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    leave_type_id UUID NOT NULL REFERENCES public.leave_types(id) ON DELETE CASCADE,
    days NUMERIC(5,2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'PROCESSED')),
    approved_by UUID REFERENCES auth.users(id),
    rejection_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. COMPENSATORY OFF RECORDS
CREATE TABLE IF NOT EXISTS public.comp_off_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    earned_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    days NUMERIC(5,2) NOT NULL DEFAULT 1.0,
    used_days NUMERIC(5,2) NOT NULL DEFAULT 0.0,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'EXPIRED')),
    reason TEXT NOT NULL,
    approved_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. LEAVE BLACKOUT PERIODS
CREATE TABLE IF NOT EXISTS public.leave_blackout_periods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    department_id UUID REFERENCES public.departments(id) ON DELETE CASCADE,
    branch_id UUID REFERENCES public.branches(id) ON DELETE CASCADE,
    reason TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- INDEXES FOR ENTERPRISE PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_leave_requests_emp_date ON public.leave_requests(company_id, employee_id, start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_leave_requests_status ON public.leave_requests(company_id, status);
CREATE INDEX IF NOT EXISTS idx_leave_balances_emp ON public.leave_balances(company_id, employee_id, year);
CREATE INDEX IF NOT EXISTS idx_leave_ledger_emp ON public.leave_ledger(company_id, employee_id);

-- ENABLE ROW LEVEL SECURITY
ALTER TABLE public.leave_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_policy_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_encashments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comp_off_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_blackout_periods ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES
CREATE POLICY "Super admin full access on leave_types" ON public.leave_types FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user_roles ur JOIN public.roles r ON ur.role_id = r.id WHERE ur.user_id = auth.uid() AND r.name = 'SUPER_ADMIN')
);
CREATE POLICY "Company isolation for leave_types" ON public.leave_types FOR ALL USING (
  company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "Super admin full access on leave_requests" ON public.leave_requests FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user_roles ur JOIN public.roles r ON ur.role_id = r.id WHERE ur.user_id = auth.uid() AND r.name = 'SUPER_ADMIN')
);
CREATE POLICY "Company isolation for leave_requests" ON public.leave_requests FOR ALL USING (
  company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "Company isolation for leave_balances" ON public.leave_balances FOR ALL USING (
  company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
);
