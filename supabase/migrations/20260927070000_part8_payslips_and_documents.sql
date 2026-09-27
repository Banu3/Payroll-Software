-- ====================================================================
-- PART 8: ENTERPRISE PAYSLIP, PAYROLL DOCUMENTS & SELF-SERVICE SCHEMA
-- ====================================================================

-- 1. PAYSLIP TEMPLATES
CREATE TABLE IF NOT EXISTS public.payslip_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL DEFAULT 'Corporate Standard',
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('DRAFT', 'ACTIVE', 'ARCHIVED')),
    show_company_logo BOOLEAN NOT NULL DEFAULT true,
    show_employer_contributions BOOLEAN NOT NULL DEFAULT true,
    show_attendance_summary BOOLEAN NOT NULL DEFAULT true,
    show_tax_details BOOLEAN NOT NULL DEFAULT true,
    show_bank_details BOOLEAN NOT NULL DEFAULT true,
    mask_bank_account BOOLEAN NOT NULL DEFAULT true,
    mask_pan BOOLEAN NOT NULL DEFAULT true,
    header_text TEXT DEFAULT 'CONFIDENTIAL PAYSLIP STATEMENT',
    footer_text TEXT DEFAULT 'This is a computer-generated document and does not require a physical signature.',
    primary_color VARCHAR(20) NOT NULL DEFAULT '#2563eb',
    secondary_color VARCHAR(20) NOT NULL DEFAULT '#1e293b',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. PAYSLIP SETTINGS
CREATE TABLE IF NOT EXISTS public.payslip_settings (
    company_id UUID PRIMARY KEY REFERENCES public.companies(id) ON DELETE CASCADE,
    default_template_id UUID REFERENCES public.payslip_templates(id) ON DELETE SET NULL,
    auto_generate BOOLEAN NOT NULL DEFAULT false,
    auto_email BOOLEAN NOT NULL DEFAULT false,
    email_attachment BOOLEAN NOT NULL DEFAULT true,
    employee_download_enabled BOOLEAN NOT NULL DEFAULT true,
    employee_print_enabled BOOLEAN NOT NULL DEFAULT true,
    retention_years INT NOT NULL DEFAULT 7,
    number_format VARCHAR(50) NOT NULL DEFAULT 'PS-{YYYY}-{MM}-{6DIGITS}',
    watermark_enabled BOOLEAN NOT NULL DEFAULT false,
    watermark_text VARCHAR(100) DEFAULT 'CONFIDENTIAL',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. PAYSLIPS (Official generated employee payslips)
CREATE TABLE IF NOT EXISTS public.payslips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    payroll_run_id UUID NOT NULL REFERENCES public.payroll_runs(id) ON DELETE CASCADE,
    payroll_run_employee_id UUID NOT NULL REFERENCES public.payroll_run_employees(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    payslip_number VARCHAR(50) NOT NULL,
    version INT NOT NULL DEFAULT 1,
    pay_period_start DATE NOT NULL,
    pay_period_end DATE NOT NULL,
    pay_date DATE NOT NULL,
    gross_earnings NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    total_deductions NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    net_salary NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    document_path VARCHAR(255),
    document_hash VARCHAR(128) NOT NULL,
    document_status VARCHAR(30) NOT NULL DEFAULT 'GENERATED' CHECK (document_status IN (
        'PENDING', 'GENERATING', 'GENERATED', 'FAILED', 'SENT', 'ARCHIVED'
    )),
    generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    generated_by UUID REFERENCES auth.users(id),
    sent_at TIMESTAMPTZ,
    email_status VARCHAR(30) NOT NULL DEFAULT 'PENDING' CHECK (email_status IN (
        'PENDING', 'QUEUED', 'SENT', 'FAILED', 'BOUNCED'
    )),
    email_failure_reason TEXT,
    download_count INT NOT NULL DEFAULT 0,
    last_downloaded_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_company_payslip_number UNIQUE(company_id, payslip_number)
);

-- 4. PAYROLL DOCUMENTS (Salary certificates, Statements, Form 16)
CREATE TABLE IF NOT EXISTS public.payroll_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL CHECK (document_type IN (
        'SALARY_CERTIFICATE', 'PAYROLL_STATEMENT', 'TAX_STATEMENT', 'FORM_16', 'BONUS_STATEMENT'
    )),
    document_name VARCHAR(200) NOT NULL,
    period_description VARCHAR(50) NOT NULL,
    document_path VARCHAR(255),
    document_hash VARCHAR(128) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'GENERATED' CHECK (status IN ('GENERATED', 'ARCHIVED')),
    generated_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. PAYSLIP GENERATION BATCH JOBS
CREATE TABLE IF NOT EXISTS public.payslip_generation_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    payroll_run_id UUID NOT NULL REFERENCES public.payroll_runs(id) ON DELETE CASCADE,
    total_employees INT NOT NULL DEFAULT 0,
    processed_count INT NOT NULL DEFAULT 0,
    success_count INT NOT NULL DEFAULT 0,
    failed_count INT NOT NULL DEFAULT 0,
    status VARCHAR(30) NOT NULL DEFAULT 'QUEUED' CHECK (status IN (
        'QUEUED', 'PROCESSING', 'COMPLETED', 'PARTIALLY_COMPLETED', 'FAILED', 'CANCELLED'
    )),
    error_log JSONB DEFAULT '[]'::jsonb,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_payslips_company_emp ON public.payslips(company_id, employee_id);
CREATE INDEX IF NOT EXISTS idx_payslips_run ON public.payslips(payroll_run_id);
CREATE INDEX IF NOT EXISTS idx_payroll_docs_emp ON public.payroll_documents(company_id, employee_id);
CREATE INDEX IF NOT EXISTS idx_payslip_jobs_status ON public.payslip_generation_jobs(company_id, status);

-- ROW LEVEL SECURITY
ALTER TABLE public.payslip_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payslip_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payslips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payslip_generation_jobs ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES FOR TENANT & EMPLOYEE ISOLATION
CREATE POLICY "Company isolation for payslip_templates" ON public.payslip_templates FOR ALL USING (
  company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "Company isolation for payslip_settings" ON public.payslip_settings FOR ALL USING (
  company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
);

-- Employees can ONLY view their OWN payslips; HR/Admins can view company payslips
CREATE POLICY "Employee own or HR company access for payslips" ON public.payslips FOR SELECT USING (
  employee_id IN (SELECT id FROM public.employees WHERE user_id = auth.uid())
  OR company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "Employee own or HR company access for payroll_documents" ON public.payroll_documents FOR SELECT USING (
  employee_id IN (SELECT id FROM public.employees WHERE user_id = auth.uid())
  OR company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
);
