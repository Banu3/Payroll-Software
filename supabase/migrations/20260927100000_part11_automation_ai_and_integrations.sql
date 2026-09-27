-- ====================================================================
-- PART 11: ENTERPRISE HR AUTOMATION, AI & INTEGRATIONS SCHEMA
-- ====================================================================

-- 1. AUTOMATION RULES
CREATE TABLE IF NOT EXISTS public.automation_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    trigger_type VARCHAR(50) NOT NULL CHECK (trigger_type IN ('EVENT_BASED', 'TIME_BASED', 'CONDITION_BASED', 'MANUAL')),
    trigger_event VARCHAR(100) NOT NULL,
    conditions JSONB DEFAULT '[]'::jsonb,
    actions JSONB NOT NULL DEFAULT '[]'::jsonb,
    schedule VARCHAR(50) DEFAULT '0 0 * * *',
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('DRAFT', 'ACTIVE', 'PAUSED', 'DISABLED', 'ERROR')),
    last_run_at TIMESTAMPTZ,
    next_run_at TIMESTAMPTZ,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. AUTOMATION TASKS
CREATE TABLE IF NOT EXISTS public.automation_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    task_name VARCHAR(200) NOT NULL,
    description TEXT,
    assigned_to UUID REFERENCES auth.users(id),
    priority VARCHAR(20) NOT NULL DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
    due_date DATE,
    related_employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
    related_payroll_run_id UUID REFERENCES public.payroll_runs(id) ON DELETE CASCADE,
    status VARCHAR(30) NOT NULL DEFAULT 'TODO' CHECK (status IN ('TODO', 'IN_PROGRESS', 'WAITING', 'COMPLETED', 'CANCELLED', 'OVERDUE')),
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. AUTOMATION RUN LOGS
CREATE TABLE IF NOT EXISTS public.automation_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    automation_rule_id UUID REFERENCES public.automation_rules(id) ON DELETE SET NULL,
    trigger_name VARCHAR(100) NOT NULL,
    action_summary TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'SUCCESS' CHECK (status IN ('QUEUED', 'RUNNING', 'SUCCESS', 'PARTIAL_SUCCESS', 'FAILED', 'SKIPPED', 'CANCELLED')),
    error_message TEXT,
    retry_count INT NOT NULL DEFAULT 0,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- 4. AI USAGE LOGS & AUDIT
CREATE TABLE IF NOT EXISTS public.ai_usage_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    query_type VARCHAR(50) NOT NULL DEFAULT 'GENERAL_QUERY',
    prompt_tokens INT NOT NULL DEFAULT 0,
    completion_tokens INT NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'SUCCESS',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. WEBHOOKS
CREATE TABLE IF NOT EXISTS public.webhooks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    endpoint_url VARCHAR(255) NOT NULL,
    secret_hash VARCHAR(128) NOT NULL,
    subscribed_events JSONB NOT NULL DEFAULT '[]'::jsonb,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'DISABLED')),
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. WEBHOOK DELIVERIES
CREATE TABLE IF NOT EXISTS public.webhook_deliveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    webhook_id UUID NOT NULL REFERENCES public.webhooks(id) ON DELETE CASCADE,
    event_name VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL,
    response_code INT,
    status VARCHAR(20) NOT NULL DEFAULT 'DELIVERED' CHECK (status IN ('QUEUED', 'SENT', 'DELIVERED', 'FAILED', 'RETRYING')),
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. API KEYS
CREATE TABLE IF NOT EXISTS public.api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    key_prefix VARCHAR(20) NOT NULL,
    key_hash VARCHAR(128) NOT NULL,
    scopes JSONB NOT NULL DEFAULT '[]'::jsonb,
    last_used_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'REVOKED', 'EXPIRED')),
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. INTEGRATION CONNECTIONS
CREATE TABLE IF NOT EXISTS public.integration_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    provider_code VARCHAR(50) NOT NULL,
    provider_name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'NOT_CONFIGURED' CHECK (status IN ('CONNECTED', 'NOT_CONFIGURED', 'DISCONNECTED', 'FAILED')),
    config_metadata JSONB DEFAULT '{}'::jsonb,
    last_sync_at TIMESTAMPTZ,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_company_provider UNIQUE(company_id, provider_code)
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_automation_rules_company ON public.automation_rules(company_id, status);
CREATE INDEX IF NOT EXISTS idx_automation_tasks_company ON public.automation_tasks(company_id, status);
CREATE INDEX IF NOT EXISTS idx_webhooks_company ON public.webhooks(company_id, status);
CREATE INDEX IF NOT EXISTS idx_api_keys_company ON public.api_keys(company_id, key_prefix);

-- ROW LEVEL SECURITY
ALTER TABLE public.automation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_connections ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES FOR TENANT ISOLATION
CREATE POLICY "Company isolation for automation_rules" ON public.automation_rules FOR ALL USING (
  company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "Company isolation for automation_tasks" ON public.automation_tasks FOR ALL USING (
  company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "Company isolation for webhooks" ON public.webhooks FOR ALL USING (
  company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "Company isolation for api_keys" ON public.api_keys FOR ALL USING (
  company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "Company isolation for integration_connections" ON public.integration_connections FOR ALL USING (
  company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
);
