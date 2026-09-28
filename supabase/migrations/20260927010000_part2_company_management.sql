-- Enterprise Payroll System Database Schema — Part 2
-- Super Admin, Company/Tenant Management, Subscriptions, Branches, Departments, Designations, Feature Flags & Notifications

-- 1. EXTEND COMPANIES TABLE
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

-- 2. COMPANY BRANCHES
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
    timezone VARCHAR(100) DEFAULT 'UTC',
    phone VARCHAR(50),
    manager_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_company_branch_code UNIQUE (company_id, branch_code)
);

-- 3. DEPARTMENTS
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

-- 4. DESIGNATIONS
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

-- 5. COMPANY SETTINGS
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

-- 6. COMPANY INVITATIONS
CREATE TABLE IF NOT EXISTS public.company_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'HR_ADMIN',
    token_hash VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING', -- PENDING, ACCEPTED, EXPIRED, REVOKED
    invited_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. SUBSCRIPTION PLANS
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

-- Seed Subscription Plans
INSERT INTO public.subscription_plans (name, code, description, price_monthly, price_annually, employee_limit, storage_limit_gb, features) VALUES
('Starter', 'STARTER', 'For small teams getting started with basic payroll', 49.00, 490.00, 25, 5, '["payroll", "attendance", "leave"]'::jsonb),
('Professional', 'PROFESSIONAL', 'For growing companies with multi-branch management', 149.00, 1490.00, 250, 25, '["payroll", "attendance", "leave", "expenses", "multi_branch", "reports"]'::jsonb),
('Business', 'BUSINESS', 'For established enterprises requiring advanced approvals & loans', 299.00, 2990.00, 1000, 100, '["payroll", "attendance", "leave", "expenses", "loans", "performance", "multi_branch", "reports"]'::jsonb),
('Enterprise Unlimited', 'ENTERPRISE', 'Full platform capabilities with custom integration & unlimited scale', 599.00, 5990.00, 10000, 500, '["payroll", "attendance", "leave", "expenses", "loans", "performance", "reports", "ai_assistant", "geo_attendance", "biometric", "multi_branch"]'::jsonb)
ON CONFLICT (code) DO NOTHING;

-- 8. COMPANY SUBSCRIPTIONS
CREATE TABLE IF NOT EXISTS public.company_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID UNIQUE NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES public.subscription_plans(id),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE', -- TRIAL, ACTIVE, PAST_DUE, SUSPENDED, CANCELLED
    employee_limit INTEGER DEFAULT 250,
    storage_limit_gb INTEGER DEFAULT 25,
    start_date TIMESTAMPTZ DEFAULT NOW(),
    renewal_date TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '1 year'),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. FEATURE FLAGS
CREATE TABLE IF NOT EXISTS public.company_feature_flags (
    company_id UUID PRIMARY KEY REFERENCES public.companies(id) ON DELETE CASCADE,
    features JSONB DEFAULT '{"payroll": true, "attendance": true, "leave": true, "expenses": true, "loans": true, "performance": true, "reports": true, "ai_assistant": false, "geo_attendance": false, "biometric": false, "multi_branch": true}'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. NOTIFICATIONS
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

-- 11. COMPANY STATUS HISTORY
CREATE TABLE IF NOT EXISTS public.company_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    performed_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    old_status VARCHAR(20),
    new_status VARCHAR(20) NOT NULL,
    reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_companies_status ON public.companies(status);
CREATE INDEX IF NOT EXISTS idx_companies_created_at ON public.companies(created_at);
CREATE INDEX IF NOT EXISTS idx_company_branches_company_id ON public.company_branches(company_id);
CREATE INDEX IF NOT EXISTS idx_departments_company_id ON public.departments(company_id);
CREATE INDEX IF NOT EXISTS idx_designations_company_id ON public.designations(company_id);
CREATE INDEX IF NOT EXISTS idx_company_invitations_company_id ON public.company_invitations(company_id);
CREATE INDEX IF NOT EXISTS idx_company_invitations_email ON public.company_invitations(email);
CREATE INDEX IF NOT EXISTS idx_company_subscriptions_company_id ON public.company_subscriptions(company_id);
CREATE INDEX IF NOT EXISTS idx_company_subscriptions_status ON public.company_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_company_id ON public.notifications(company_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);

-- RLS POLICIES FOR PART 2
ALTER TABLE public.company_branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.designations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Super Admin can manage everything across system
CREATE POLICY "Super Admins access all company branches" ON public.company_branches FOR ALL USING (public.is_super_admin(auth.uid()));
CREATE POLICY "Super Admins access all departments" ON public.departments FOR ALL USING (public.is_super_admin(auth.uid()));
CREATE POLICY "Super Admins access all designations" ON public.designations FOR ALL USING (public.is_super_admin(auth.uid()));
CREATE POLICY "Super Admins access all company settings" ON public.company_settings FOR ALL USING (public.is_super_admin(auth.uid()));
CREATE POLICY "Super Admins access all company invitations" ON public.company_invitations FOR ALL USING (public.is_super_admin(auth.uid()));
CREATE POLICY "Super Admins access all subscriptions" ON public.company_subscriptions FOR ALL USING (public.is_super_admin(auth.uid()));
CREATE POLICY "Super Admins access all feature flags" ON public.company_feature_flags FOR ALL USING (public.is_super_admin(auth.uid()));

-- Company Admins access only their own tenant company data
CREATE POLICY "Company Admins read company branches" ON public.company_branches FOR SELECT USING (company_id = public.get_user_company_id(auth.uid()));
CREATE POLICY "Company Admins read departments" ON public.departments FOR SELECT USING (company_id = public.get_user_company_id(auth.uid()));
CREATE POLICY "Company Admins read designations" ON public.designations FOR SELECT USING (company_id = public.get_user_company_id(auth.uid()));
CREATE POLICY "Users read own notifications" ON public.notifications FOR ALL USING (user_id = auth.uid() OR public.is_super_admin(auth.uid()));
