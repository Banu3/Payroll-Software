-- ====================================================================
-- PART 7: ENTERPRISE PAYROLL PROCESSING ENGINE SCHEMA
-- ====================================================================

-- 1. PAYROLL PERIODS
CREATE TABLE IF NOT EXISTS public.payroll_periods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    month_year VARCHAR(20) NOT NULL, -- e.g. "2026-09"
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    pay_date DATE NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'OPEN' CHECK (status IN (
        'OPEN', 'PROCESSING', 'REVIEW', 'APPROVAL_PENDING', 'APPROVED', 'FINALIZED', 'CANCELLED', 'LOCKED'
    )),
    created_by UUID REFERENCES auth.users(id),
    finalized_by UUID REFERENCES auth.users(id),
    finalized_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_company_payroll_period UNIQUE(company_id, month_year)
);

-- 2. PAYROLL RUNS
CREATE TABLE IF NOT EXISTS public.payroll_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    payroll_period_id UUID NOT NULL REFERENCES public.payroll_periods(id) ON DELETE CASCADE,
    run_number VARCHAR(50) NOT NULL,
    branch_id UUID REFERENCES public.branches(id) ON DELETE CASCADE,
    department_id UUID REFERENCES public.departments(id) ON DELETE CASCADE,
    total_employees INT NOT NULL DEFAULT 0,
    processed_employees INT NOT NULL DEFAULT 0,
    status VARCHAR(30) NOT NULL DEFAULT 'DRAFT' CHECK (status IN (
        'DRAFT', 'PROCESSING', 'REVIEW', 'APPROVAL_PENDING', 'APPROVED', 'FINALIZED', 'LOCKED', 'CANCELLED'
    )),
    total_gross NUMERIC(14,2) NOT NULL DEFAULT 0.00,
    total_deductions NUMERIC(14,2) NOT NULL DEFAULT 0.00,
    total_employer_cost NUMERIC(14,2) NOT NULL DEFAULT 0.00,
    total_net_pay NUMERIC(14,2) NOT NULL DEFAULT 0.00,
    total_lop NUMERIC(14,2) NOT NULL DEFAULT 0.00,
    total_overtime NUMERIC(14,2) NOT NULL DEFAULT 0.00,
    total_pf NUMERIC(14,2) NOT NULL DEFAULT 0.00,
    total_esi NUMERIC(14,2) NOT NULL DEFAULT 0.00,
    total_pt NUMERIC(14,2) NOT NULL DEFAULT 0.00,
    total_tds NUMERIC(14,2) NOT NULL DEFAULT 0.00,
    created_by UUID REFERENCES auth.users(id),
    approved_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. PAYROLL RUN EMPLOYEES (Per-employee calculation summary)
CREATE TABLE IF NOT EXISTS public.payroll_run_employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    payroll_run_id UUID NOT NULL REFERENCES public.payroll_runs(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    calendar_days INT NOT NULL DEFAULT 30,
    working_days INT NOT NULL DEFAULT 26,
    paid_days NUMERIC(5,2) NOT NULL DEFAULT 26.0,
    lop_days NUMERIC(5,2) NOT NULL DEFAULT 0.0,
    overtime_hours NUMERIC(6,2) NOT NULL DEFAULT 0.0,
    basic_salary NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    gross_earnings NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    total_deductions NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    employer_contributions NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    net_salary NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    status VARCHAR(20) NOT NULL DEFAULT 'CALCULATED' CHECK (status IN ('CALCULATED', 'ERROR', 'OVERRIDDEN')),
    calculation_snapshot JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_run_employee UNIQUE(payroll_run_id, employee_id)
);

-- 4. PAYROLL LINE ITEMS (Component level granular detail)
CREATE TABLE IF NOT EXISTS public.payroll_line_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    payroll_run_employee_id UUID NOT NULL REFERENCES public.payroll_run_employees(id) ON DELETE CASCADE,
    component_name VARCHAR(150) NOT NULL,
    component_code VARCHAR(50) NOT NULL,
    type VARCHAR(30) NOT NULL CHECK (type IN ('EARNING', 'DEDUCTION', 'EMPLOYER_CONTRIBUTION')),
    category VARCHAR(30) NOT NULL DEFAULT 'ALLOWANCE',
    amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    taxable_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    sequence_order INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. PAYROLL VALIDATION RESULTS
CREATE TABLE IF NOT EXISTS public.payroll_validation_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    payroll_run_id UUID NOT NULL REFERENCES public.payroll_runs(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('BLOCKING', 'WARNING', 'INFO')),
    code VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. PAYROLL APPROVALS HISTORY
CREATE TABLE IF NOT EXISTS public.payroll_approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    payroll_run_id UUID NOT NULL REFERENCES public.payroll_runs(id) ON DELETE CASCADE,
    approver_id UUID NOT NULL REFERENCES auth.users(id),
    role VARCHAR(50) NOT NULL,
    action VARCHAR(20) NOT NULL CHECK (action IN ('APPROVED', 'REJECTED')),
    comments TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. PAYROLL ADJUSTMENTS (Post-finalization or manual overrides)
CREATE TABLE IF NOT EXISTS public.payroll_adjustments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    payroll_run_id UUID REFERENCES public.payroll_runs(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN (
        'ARREARS', 'RECOVERY', 'BONUS_ADJUSTMENT', 'DEDUCTION_ADJUSTMENT', 'OVERTIME_CORRECTION', 'TAX_ADJUSTMENT'
    )),
    amount NUMERIC(12,2) NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    created_by UUID REFERENCES auth.users(id),
    approved_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_payroll_runs_company_status ON public.payroll_runs(company_id, status);
CREATE INDEX IF NOT EXISTS idx_payroll_run_emp_run ON public.payroll_run_employees(payroll_run_id, employee_id);
CREATE INDEX IF NOT EXISTS idx_payroll_line_items_emp ON public.payroll_line_items(payroll_run_employee_id);

-- ROW LEVEL SECURITY
ALTER TABLE public.payroll_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_run_employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_validation_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_adjustments ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES FOR TENANT ISOLATION
CREATE POLICY "Company isolation for payroll_periods" ON public.payroll_periods FOR ALL USING (
  company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
);
CREATE POLICY "Company isolation for payroll_runs" ON public.payroll_runs FOR ALL USING (
  company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
);
CREATE POLICY "Company isolation for payroll_run_employees" ON public.payroll_run_employees FOR ALL USING (
  company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
);
CREATE POLICY "Company isolation for payroll_line_items" ON public.payroll_line_items FOR ALL USING (
  company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
);
