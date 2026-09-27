-- ====================================================================
-- PART 6: ENTERPRISE SALARY STRUCTURE & COMPENSATION MANAGEMENT SCHEMA
-- ====================================================================

-- 1. SALARY COMPONENTS
CREATE TABLE IF NOT EXISTS public.salary_components (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(50) NOT NULL,
    type VARCHAR(30) NOT NULL CHECK (type IN ('EARNING', 'DEDUCTION', 'EMPLOYER_CONTRIBUTION', 'REIMBURSEMENT', 'BENEFIT')),
    category VARCHAR(30) NOT NULL DEFAULT 'ALLOWANCE' CHECK (category IN ('BASIC', 'ALLOWANCE', 'STATUTORY', 'TAX', 'REIMBURSEMENT', 'LOAN_DEDUCTION')),
    calculation_method VARCHAR(40) NOT NULL DEFAULT 'FIXED_AMOUNT' CHECK (calculation_method IN (
        'FIXED_AMOUNT', 'PERCENTAGE_OF_BASIC', 'PERCENTAGE_OF_GROSS', 'PERCENTAGE_OF_CTC', 'PERCENTAGE_OF_COMPONENT', 'FORMULA'
    )),
    value NUMERIC(12,2) DEFAULT 0.00,
    percentage NUMERIC(5,2) DEFAULT 0.00,
    base_component_id UUID REFERENCES public.salary_components(id),
    frequency VARCHAR(20) NOT NULL DEFAULT 'MONTHLY' CHECK (frequency IN ('MONTHLY', 'ANNUAL', 'ONE_TIME')),
    is_taxable BOOLEAN NOT NULL DEFAULT true,
    is_statutory BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    effective_from DATE DEFAULT CURRENT_DATE,
    effective_to DATE,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_company_component_code UNIQUE(company_id, code)
);

-- 2. SALARY STRUCTURES
CREATE TABLE IF NOT EXISTS public.salary_structures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(50) NOT NULL,
    description TEXT,
    version INT NOT NULL DEFAULT 1,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('DRAFT', 'ACTIVE', 'INACTIVE', 'ARCHIVED')),
    effective_from DATE NOT NULL DEFAULT CURRENT_DATE,
    effective_to DATE,
    branch_id UUID REFERENCES public.branches(id) ON DELETE CASCADE,
    department_id UUID REFERENCES public.departments(id) ON DELETE CASCADE,
    designation_id UUID REFERENCES public.designations(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_company_structure_code UNIQUE(company_id, code, version)
);

-- 3. SALARY STRUCTURE COMPONENTS
CREATE TABLE IF NOT EXISTS public.salary_structure_components (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    structure_id UUID NOT NULL REFERENCES public.salary_structures(id) ON DELETE CASCADE,
    component_id UUID NOT NULL REFERENCES public.salary_components(id) ON DELETE CASCADE,
    calculation_method VARCHAR(40) NOT NULL DEFAULT 'FIXED_AMOUNT',
    value NUMERIC(12,2) DEFAULT 0.00,
    percentage NUMERIC(5,2) DEFAULT 0.00,
    formula TEXT,
    sequence_order INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. EMPLOYEE COMPENSATION ASSIGNMENTS
CREATE TABLE IF NOT EXISTS public.employee_compensation (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    structure_id UUID REFERENCES public.salary_structures(id),
    annual_ctc NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    monthly_ctc NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    monthly_gross NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    basic_salary NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    total_deductions NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    employer_contributions NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    estimated_net_salary NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    effective_from DATE NOT NULL DEFAULT CURRENT_DATE,
    effective_to DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SUPERSEDED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. EMPLOYEE COMPENSATION BREAKDOWN COMPONENTS
CREATE TABLE IF NOT EXISTS public.employee_compensation_components (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    employee_compensation_id UUID NOT NULL REFERENCES public.employee_compensation(id) ON DELETE CASCADE,
    component_id UUID NOT NULL REFERENCES public.salary_components(id) ON DELETE CASCADE,
    amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    annual_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    calculation_snapshot JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. SALARY REVISIONS
CREATE TABLE IF NOT EXISTS public.salary_revisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    current_compensation_id UUID REFERENCES public.employee_compensation(id),
    current_ctc NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    proposed_ctc NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    current_gross NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    proposed_gross NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    percentage_increase NUMERIC(5,2) DEFAULT 0.00,
    effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
    revision_type VARCHAR(50) NOT NULL CHECK (revision_type IN (
        'ANNUAL_INCREMENT', 'PROMOTION', 'PERFORMANCE_REVISION', 'MARKET_ADJUSTMENT', 'PROBATION_COMPLETION', 'JOINING_REVISION', 'CORRECTION', 'TRANSFER', 'SPECIAL_REVISION'
    )),
    reason TEXT NOT NULL,
    comments TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING_APPROVAL' CHECK (status IN (
        'DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'CANCELLED'
    )),
    requested_by UUID REFERENCES auth.users(id),
    approved_by UUID REFERENCES auth.users(id),
    approval_date TIMESTAMPTZ,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. IMMUTABLE COMPENSATION HISTORY
CREATE TABLE IF NOT EXISTS public.compensation_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    previous_ctc NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    new_ctc NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    previous_gross NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    new_gross NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    effective_date DATE NOT NULL,
    revision_type VARCHAR(50) NOT NULL,
    reason TEXT,
    approved_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. PF CONFIGURATION
CREATE TABLE IF NOT EXISTS public.pf_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    is_enabled BOOLEAN NOT NULL DEFAULT true,
    employee_contribution_pct NUMERIC(5,2) NOT NULL DEFAULT 12.00,
    employer_contribution_pct NUMERIC(5,2) NOT NULL DEFAULT 12.00,
    wage_ceiling NUMERIC(12,2) NOT NULL DEFAULT 15000.00,
    allow_higher_pf BOOLEAN NOT NULL DEFAULT false,
    effective_from DATE DEFAULT CURRENT_DATE,
    effective_to DATE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. ESI CONFIGURATION
CREATE TABLE IF NOT EXISTS public.esi_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    is_enabled BOOLEAN NOT NULL DEFAULT true,
    employee_contribution_pct NUMERIC(5,2) NOT NULL DEFAULT 0.75,
    employer_contribution_pct NUMERIC(5,2) NOT NULL DEFAULT 3.25,
    eligibility_wage_threshold NUMERIC(12,2) NOT NULL DEFAULT 21000.00,
    effective_from DATE DEFAULT CURRENT_DATE,
    effective_to DATE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. PROFESSIONAL TAX CONFIGURATION
CREATE TABLE IF NOT EXISTS public.professional_tax_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    state VARCHAR(100) NOT NULL,
    min_salary NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    max_salary NUMERIC(12,2) NOT NULL DEFAULT 9999999.00,
    pt_amount NUMERIC(10,2) NOT NULL DEFAULT 200.00,
    effective_from DATE DEFAULT CURRENT_DATE,
    effective_to DATE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. TAX / TDS CONFIGURATION
CREATE TABLE IF NOT EXISTS public.tax_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    financial_year VARCHAR(20) NOT NULL DEFAULT '2026-2027',
    regime VARCHAR(20) NOT NULL DEFAULT 'NEW' CHECK (regime IN ('OLD', 'NEW', 'BOTH')),
    standard_deduction NUMERIC(12,2) NOT NULL DEFAULT 75000.00,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. EMPLOYEE TAX DECLARATIONS
CREATE TABLE IF NOT EXISTS public.employee_tax_declarations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    financial_year VARCHAR(20) NOT NULL DEFAULT '2026-2027',
    regime VARCHAR(10) NOT NULL DEFAULT 'NEW' CHECK (regime IN ('OLD', 'NEW')),
    declared_80c NUMERIC(12,2) DEFAULT 0.00,
    declared_80d NUMERIC(12,2) DEFAULT 0.00,
    hra_rent_paid NUMERIC(12,2) DEFAULT 0.00,
    other_exemptions NUMERIC(12,2) DEFAULT 0.00,
    status VARCHAR(20) NOT NULL DEFAULT 'SUBMITTED' CHECK (status IN ('DRAFT', 'SUBMITTED', 'VERIFIED', 'REJECTED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_emp_financial_tax UNIQUE(company_id, employee_id, financial_year)
);

-- 13. REIMBURSEMENTS
CREATE TABLE IF NOT EXISTS public.employee_reimbursements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    type VARCHAR(30) NOT NULL CHECK (type IN ('TRAVEL', 'MEDICAL', 'FOOD', 'COMMUNICATION', 'OTHER')),
    amount NUMERIC(12,2) NOT NULL,
    description TEXT,
    is_taxable BOOLEAN NOT NULL DEFAULT false,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'PROCESSED')),
    approved_by UUID REFERENCES auth.users(id),
    effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. LOAN PAYROLL DEDUCTIONS
CREATE TABLE IF NOT EXISTS public.loan_payroll_deductions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    loan_name VARCHAR(150) NOT NULL,
    principal_amount NUMERIC(12,2) NOT NULL,
    outstanding_amount NUMERIC(12,2) NOT NULL,
    emi_amount NUMERIC(12,2) NOT NULL,
    total_installments INT NOT NULL,
    remaining_installments INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'COMPLETED', 'PAUSED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 15. BONUS CONFIGURATIONS
CREATE TABLE IF NOT EXISTS public.bonus_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    bonus_name VARCHAR(150) NOT NULL,
    amount NUMERIC(12,2) NOT NULL,
    is_taxable BOOLEAN NOT NULL DEFAULT true,
    effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'PROCESSED')),
    approved_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_emp_compensation_emp ON public.employee_compensation(company_id, employee_id, status);
CREATE INDEX IF NOT EXISTS idx_salary_revisions_status ON public.salary_revisions(company_id, status);

-- ENABLE ROW LEVEL SECURITY
ALTER TABLE public.salary_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salary_structures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salary_structure_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_compensation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_compensation_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salary_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compensation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pf_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.esi_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professional_tax_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tax_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_tax_declarations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_reimbursements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loan_payroll_deductions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bonus_configurations ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES FOR TENANT ISOLATION
CREATE POLICY "Company isolation for salary_components" ON public.salary_components FOR ALL USING (
  company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
);
CREATE POLICY "Company isolation for salary_structures" ON public.salary_structures FOR ALL USING (
  company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
);
CREATE POLICY "Company isolation for employee_compensation" ON public.employee_compensation FOR ALL USING (
  company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
);
CREATE POLICY "Company isolation for salary_revisions" ON public.salary_revisions FOR ALL USING (
  company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
);
