-- ====================================================================
-- PART 9: ENTERPRISE BANK TRANSFERS, PAYMENTS & STATUTORY SCHEMA
-- ====================================================================

-- 1. COMPANY BANK ACCOUNTS
CREATE TABLE IF NOT EXISTS public.company_bank_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    bank_name VARCHAR(100) NOT NULL,
    account_name VARCHAR(150) NOT NULL,
    account_number VARCHAR(50) NOT NULL,
    ifsc_code VARCHAR(20) NOT NULL,
    branch_name VARCHAR(100),
    account_type VARCHAR(30) NOT NULL DEFAULT 'CURRENT' CHECK (account_type IN ('CURRENT', 'SAVINGS', 'SALARY')),
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    is_default BOOLEAN NOT NULL DEFAULT false,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. PAYMENT BATCHES
CREATE TABLE IF NOT EXISTS public.payment_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    payroll_run_id UUID NOT NULL REFERENCES public.payroll_runs(id) ON DELETE CASCADE,
    company_bank_account_id UUID REFERENCES public.company_bank_accounts(id) ON DELETE SET NULL,
    batch_number VARCHAR(50) NOT NULL,
    total_employees INT NOT NULL DEFAULT 0,
    valid_bank_count INT NOT NULL DEFAULT 0,
    invalid_bank_count INT NOT NULL DEFAULT 0,
    total_net_amount NUMERIC(14,2) NOT NULL DEFAULT 0.00,
    status VARCHAR(30) NOT NULL DEFAULT 'DRAFT' CHECK (status IN (
        'DRAFT', 'READY', 'SUBMITTED', 'PROCESSING', 'PARTIALLY_COMPLETED', 'COMPLETED', 'FAILED', 'RECONCILIATION_PENDING', 'RECONCILED', 'CANCELLED'
    )),
    notes TEXT,
    created_by UUID REFERENCES auth.users(id),
    approved_by UUID REFERENCES auth.users(id),
    approved_at TIMESTAMPTZ,
    submitted_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_company_payment_batch UNIQUE(company_id, batch_number)
);

-- 3. PAYMENT BATCH ITEMS (Instruction per employee)
CREATE TABLE IF NOT EXISTS public.payment_batch_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    payment_batch_id UUID NOT NULL REFERENCES public.payment_batches(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    payroll_run_employee_id UUID NOT NULL REFERENCES public.payroll_run_employees(id) ON DELETE CASCADE,
    employee_name VARCHAR(150) NOT NULL,
    bank_name VARCHAR(100),
    masked_account_number VARCHAR(50),
    ifsc_code VARCHAR(20),
    amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING' CHECK (status IN (
        'PENDING', 'READY', 'SUBMITTED', 'PROCESSING', 'SUCCESS', 'FAILED', 'REJECTED', 'CANCELLED', 'RECONCILED'
    )),
    failure_reason TEXT,
    external_reference VARCHAR(100),
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. PAYMENT TRANSFER FILES
CREATE TABLE IF NOT EXISTS public.payment_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    payment_batch_id UUID NOT NULL REFERENCES public.payment_batches(id) ON DELETE CASCADE,
    file_name VARCHAR(200) NOT NULL,
    file_format VARCHAR(20) NOT NULL DEFAULT 'CSV' CHECK (file_format IN ('CSV', 'TXT', 'XLSX')),
    file_path VARCHAR(255),
    file_hash VARCHAR(128) NOT NULL,
    generated_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. PAYMENT RECONCILIATION RECORDS
CREATE TABLE IF NOT EXISTS public.payment_reconciliation_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    payment_batch_id UUID NOT NULL REFERENCES public.payment_batches(id) ON DELETE CASCADE,
    payment_batch_item_id UUID NOT NULL REFERENCES public.payment_batch_items(id) ON DELETE CASCADE,
    payroll_net_amount NUMERIC(12,2) NOT NULL,
    instruction_amount NUMERIC(12,2) NOT NULL,
    bank_amount NUMERIC(12,2) NOT NULL,
    discrepancy_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    status VARCHAR(30) NOT NULL DEFAULT 'MATCHED' CHECK (status IN (
        'MATCHED', 'AMOUNT_MISMATCH', 'MISSING_BANK_RESULT', 'DUPLICATE_TRANSACTION', 'FAILED_PAYMENT'
    )),
    reconciled_by UUID REFERENCES auth.users(id),
    reconciled_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. STATUTORY REPORT RUNS (PF, ESI, PT, TDS)
CREATE TABLE IF NOT EXISTS public.statutory_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    report_type VARCHAR(50) NOT NULL CHECK (report_type IN (
        'PF_ECR', 'ESI_RETURN', 'PT_SLAB_REPORT', 'TDS_FORM_24Q', 'PAYROLL_REGISTER'
    )),
    month_year VARCHAR(20) NOT NULL,
    version INT NOT NULL DEFAULT 1,
    total_employees_covered INT NOT NULL DEFAULT 0,
    total_amount NUMERIC(14,2) NOT NULL DEFAULT 0.00,
    snapshot_data JSONB NOT NULL,
    document_path VARCHAR(255),
    status VARCHAR(20) NOT NULL DEFAULT 'GENERATED' CHECK (status IN (
        'OPEN', 'GENERATED', 'REVIEWED', 'APPROVED', 'SUBMITTED', 'CLOSED'
    )),
    generated_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_pay_batches_company_status ON public.payment_batches(company_id, status);
CREATE INDEX IF NOT EXISTS idx_pay_items_batch ON public.payment_batch_items(payment_batch_id);
CREATE INDEX IF NOT EXISTS idx_statutory_reports_type ON public.statutory_reports(company_id, report_type);

-- ROW LEVEL SECURITY
ALTER TABLE public.company_bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_batch_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_reconciliation_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.statutory_reports ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES FOR TENANT ISOLATION
CREATE POLICY "Company isolation for company_bank_accounts" ON public.company_bank_accounts FOR ALL USING (
  company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "Company isolation for payment_batches" ON public.payment_batches FOR ALL USING (
  company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "Company isolation for payment_batch_items" ON public.payment_batch_items FOR ALL USING (
  company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "Company isolation for payment_files" ON public.payment_files FOR ALL USING (
  company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "Company isolation for statutory_reports" ON public.statutory_reports FOR ALL USING (
  company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
);
