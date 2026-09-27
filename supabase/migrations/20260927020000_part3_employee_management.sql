-- Enterprise Payroll System Database Schema — Part 3
-- HR Admin Dashboard, Detailed Employee Profiles, 10-Step Onboarding, Documents, History, Import Jobs & Requests

-- 1. EXTEND EMPLOYEES TABLE WITH FULL PROFILE FIELDS
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
ADD COLUMN IF NOT EXISTS employment_type VARCHAR(50) DEFAULT 'Full Time', -- Full Time, Part Time, Contract, Intern, Consultant
ADD COLUMN IF NOT EXISTS employment_status VARCHAR(50) DEFAULT 'ACTIVE', -- ACTIVE, INACTIVE, ON_NOTICE, RESIGNED, TERMINATED, DRAFT
ADD COLUMN IF NOT EXISTS probation_period_months INTEGER DEFAULT 3,
ADD COLUMN IF NOT EXISTS probation_end_date DATE,
ADD COLUMN IF NOT EXISTS confirmation_date DATE,
ADD COLUMN IF NOT EXISTS notice_period_days INTEGER DEFAULT 30,
ADD COLUMN IF NOT EXISTS work_location VARCHAR(100) DEFAULT 'Main Office',
ADD COLUMN IF NOT EXISTS branch_id UUID REFERENCES public.company_branches(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS designation_id UUID REFERENCES public.designations(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS reporting_manager_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS onboarding_status VARCHAR(50) DEFAULT 'IN_PROGRESS'; -- DRAFT, INVITED, IN_PROGRESS, DOCUMENTS_PENDING, HR_REVIEW, COMPLETED, REJECTED

-- 2. EMPLOYEE ADDRESS CONTACTS
CREATE TABLE IF NOT EXISTS public.employee_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    address_line1 TEXT NOT NULL,
    address_line2 TEXT,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    is_permanent BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. SENSITIVE BANK ACCOUNTS (Field-Level Protected)
CREATE TABLE IF NOT EXISTS public.employee_bank_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID UNIQUE NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    account_holder_name VARCHAR(255) NOT NULL,
    bank_name VARCHAR(255) NOT NULL,
    account_number_encrypted TEXT NOT NULL,
    account_number_masked VARCHAR(50) NOT NULL, -- e.g. XXXX XXXX 4821
    ifsc_code VARCHAR(50) NOT NULL,
    branch_name VARCHAR(255),
    is_primary BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. STATUTORY DETAILS (PAN, Aadhaar Masked)
CREATE TABLE IF NOT EXISTS public.employee_statutory_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID UNIQUE NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    pan_masked VARCHAR(20), -- XXXXX1234X
    aadhaar_masked VARCHAR(20), -- XXXX XXXX 4821
    uan VARCHAR(50),
    esi_number VARCHAR(50),
    tax_regime VARCHAR(30) DEFAULT 'New Regime',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. EMERGENCY CONTACTS
CREATE TABLE IF NOT EXISTS public.employee_emergency_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    relationship VARCHAR(100) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    alternate_phone VARCHAR(30),
    email VARCHAR(255),
    address TEXT,
    is_primary BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. SALARY STRUCTURE CONFIGURATION (HR Permission Protected)
CREATE TABLE IF NOT EXISTS public.employee_salary_structures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
    annual_ctc NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    basic NUMERIC(12,2) DEFAULT 0.00,
    hra NUMERIC(12,2) DEFAULT 0.00,
    da NUMERIC(12,2) DEFAULT 0.00,
    special_allowance NUMERIC(12,2) DEFAULT 0.00,
    conveyance NUMERIC(12,2) DEFAULT 0.00,
    medical_allowance NUMERIC(12,2) DEFAULT 0.00,
    other_earnings NUMERIC(12,2) DEFAULT 0.00,
    variable_pay NUMERIC(12,2) DEFAULT 0.00,
    bonus NUMERIC(12,2) DEFAULT 0.00,
    pf_deduction NUMERIC(12,2) DEFAULT 0.00,
    esi_deduction NUMERIC(12,2) DEFAULT 0.00,
    professional_tax NUMERIC(12,2) DEFAULT 0.00,
    tds_deduction NUMERIC(12,2) DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. EMPLOYEE DOCUMENTS (Supabase Storage Metadata)
CREATE TABLE IF NOT EXISTS public.employee_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    document_type VARCHAR(100) NOT NULL, -- Offer Letter, ID Proof, Address Proof, PAN, Bank Proof, etc.
    file_name VARCHAR(255) NOT NULL,
    storage_path TEXT NOT NULL, -- company/{company_id}/employees/{employee_id}/documents/{file_name}
    file_size INTEGER DEFAULT 0,
    uploaded_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    verification_status VARCHAR(30) DEFAULT 'PENDING', -- PENDING, VERIFIED, REJECTED, EXPIRED
    verified_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    verified_at TIMESTAMPTZ,
    rejection_reason TEXT,
    expiry_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. EMPLOYEE HISTORY & TIMELINE (Transfers, Promotions, Salary Revisions)
CREATE TABLE IF NOT EXISTS public.employee_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    change_type VARCHAR(50) NOT NULL, -- TRANSFER, PROMOTION, SALARY_REVISION, STATUS_CHANGE, MANAGER_CHANGE
    old_value JSONB,
    new_value JSONB,
    effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
    reason TEXT,
    changed_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. HR APPROVAL REQUESTS (Profile Update & Bank Change Requests)
CREATE TABLE IF NOT EXISTS public.employee_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    request_type VARCHAR(50) NOT NULL, -- PROFILE_UPDATE, DOCUMENT_VERIFICATION, BANK_CHANGE, PERSONAL_INFO_CHANGE
    payload JSONB NOT NULL,
    status VARCHAR(30) DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED
    approver_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    decision_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- INDEXES FOR HIGH PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_employees_department_id ON public.employees(department_id);
CREATE INDEX IF NOT EXISTS idx_employees_branch_id ON public.employees(branch_id);
CREATE INDEX IF NOT EXISTS idx_employees_reporting_manager_id ON public.employees(reporting_manager_id);
CREATE INDEX IF NOT EXISTS idx_employees_status ON public.employees(employment_status);
CREATE INDEX IF NOT EXISTS idx_employee_documents_employee_id ON public.employee_documents(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_history_employee_id ON public.employee_history(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_requests_company_id ON public.employee_requests(company_id);

-- RLS POLICIES FOR PART 3
ALTER TABLE public.employee_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_statutory_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_salary_structures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_requests ENABLE ROW LEVEL SECURITY;

-- HR Admins can access all employee data in their company
CREATE POLICY "HR Admins access company employee contacts" ON public.employee_contacts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.employees e
            WHERE e.id = employee_id AND e.company_id = public.get_user_company_id(auth.uid())
        ) OR public.is_super_admin(auth.uid())
    );

CREATE POLICY "HR Admins access company employee bank details" ON public.employee_bank_accounts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.employees e
            WHERE e.id = employee_id AND e.company_id = public.get_user_company_id(auth.uid())
        ) OR public.is_super_admin(auth.uid())
    );

CREATE POLICY "HR Admins access company employee documents" ON public.employee_documents
    FOR ALL USING (
        company_id = public.get_user_company_id(auth.uid()) OR public.is_super_admin(auth.uid())
    );
