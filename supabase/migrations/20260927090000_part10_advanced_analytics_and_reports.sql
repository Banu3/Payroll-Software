-- ====================================================================
-- PART 10: ADVANCED REPORTS, ANALYTICS & MANAGEMENT DASHBOARD SCHEMA
-- ====================================================================

-- 1. SAVED CUSTOM REPORTS
CREATE TABLE IF NOT EXISTS public.saved_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    data_source VARCHAR(50) NOT NULL CHECK (data_source IN (
        'EMPLOYEES', 'ATTENDANCE', 'LEAVE', 'PAYROLL', 'COMPENSATION', 'PAYMENTS', 'STATUTORY', 'OVERTIME'
    )),
    selected_fields JSONB NOT NULL DEFAULT '[]'::jsonb,
    filters JSONB DEFAULT '[]'::jsonb,
    grouping VARCHAR(50),
    sorting JSONB DEFAULT '{}'::jsonb,
    visibility VARCHAR(20) NOT NULL DEFAULT 'PRIVATE' CHECK (visibility IN ('PRIVATE', 'TEAM', 'HR', 'COMPANY')),
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. REPORT SCHEDULES
CREATE TABLE IF NOT EXISTS public.report_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    report_id UUID NOT NULL REFERENCES public.saved_reports(id) ON DELETE CASCADE,
    frequency VARCHAR(30) NOT NULL DEFAULT 'MONTHLY' CHECK (frequency IN ('DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY')),
    format VARCHAR(20) NOT NULL DEFAULT 'CSV' CHECK (format IN ('CSV', 'XLSX', 'PDF')),
    recipients JSONB NOT NULL DEFAULT '[]'::jsonb,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
    last_run_at TIMESTAMPTZ,
    next_run_at TIMESTAMPTZ,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. REPORT EXPORT JOBS
CREATE TABLE IF NOT EXISTS public.report_export_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    report_id UUID REFERENCES public.saved_reports(id) ON DELETE SET NULL,
    export_name VARCHAR(200) NOT NULL,
    file_type VARCHAR(20) NOT NULL DEFAULT 'CSV' CHECK (file_type IN ('CSV', 'XLSX', 'PDF')),
    file_path VARCHAR(255),
    file_hash VARCHAR(128),
    status VARCHAR(30) NOT NULL DEFAULT 'QUEUED' CHECK (status IN ('QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED', 'EXPIRED')),
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- 4. USER DASHBOARD LAYOUTS
CREATE TABLE IF NOT EXISTS public.dashboard_layouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    layout_name VARCHAR(50) NOT NULL DEFAULT 'DEFAULT',
    widgets JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_user_company_dashboard UNIQUE(user_id, company_id)
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_saved_reports_company ON public.saved_reports(company_id, data_source);
CREATE INDEX IF NOT EXISTS idx_report_export_jobs_company ON public.report_export_jobs(company_id, status);

-- ROW LEVEL SECURITY
ALTER TABLE public.saved_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_export_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dashboard_layouts ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES FOR TENANT & ACCESS ISOLATION
CREATE POLICY "Company isolation for saved_reports" ON public.saved_reports FOR ALL USING (
  company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "Company isolation for report_schedules" ON public.report_schedules FOR ALL USING (
  company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "Company isolation for report_export_jobs" ON public.report_export_jobs FOR ALL USING (
  company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "User isolation for dashboard_layouts" ON public.dashboard_layouts FOR ALL USING (
  user_id = auth.uid()
);
