-- Enterprise Payroll System Database Schema — Part 4
-- Attendance, Shift, Roster, Overtime & Holiday Management Engine

-- 1. SHIFTS
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

-- Seed Default Shifts
INSERT INTO public.shifts (name, code, start_time, end_time, grace_period_mins, min_working_hours, break_duration_mins, overtime_threshold_hours, is_night_shift, is_cross_midnight, status) VALUES
('General Day Shift', 'GEN-DAY', '09:00:00', '18:00:00', 15, 8.00, 60, 8.00, false, false, 'ACTIVE'),
('Morning Shift', 'MORN-SHIFT', '07:00:00', '16:00:00', 15, 8.00, 60, 8.00, false, false, 'ACTIVE'),
('Evening Shift', 'EVE-SHIFT', '14:00:00', '23:00:00', 15, 8.00, 60, 8.00, false, false, 'ACTIVE'),
('Cross-Midnight Night Shift', 'NIGHT-SHIFT', '22:00:00', '07:00:00', 15, 8.00, 60, 8.00, true, true, 'ACTIVE')
ON CONFLICT DO NOTHING;

-- 2. SHIFT ASSIGNMENTS
CREATE TABLE IF NOT EXISTS public.shift_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    shift_id UUID NOT NULL REFERENCES public.shifts(id) ON DELETE CASCADE,
    effective_from DATE NOT NULL DEFAULT CURRENT_DATE,
    effective_to DATE,
    assigned_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. ATTENDANCE RECORDS (Core Engine Output)
CREATE TABLE IF NOT EXISTS public.attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    shift_id UUID REFERENCES public.shifts(id) ON DELETE SET NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PRESENT', -- PRESENT, ABSENT, LATE, HALF_DAY, ON_LEAVE, HOLIDAY, WEEKLY_OFF, WFH, MISSED_PUNCH, OVERTIME
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

-- 4. RAW ATTENDANCE PUNCHES (Immutable Audit Event Trail)
CREATE TABLE IF NOT EXISTS public.attendance_punches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    attendance_id UUID REFERENCES public.attendance(id) ON DELETE CASCADE,
    punch_type VARCHAR(30) NOT NULL, -- CHECK_IN, CHECK_OUT, BREAK_START, BREAK_END
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    source VARCHAR(30) NOT NULL DEFAULT 'WEB', -- WEB, MOBILE, BIOMETRIC, IMPORT, ADMIN
    device_id VARCHAR(100),
    latitude NUMERIC(10,7),
    longitude NUMERIC(10,7),
    accuracy NUMERIC(8,2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. ATTENDANCE CORRECTIONS / REGULARIZATION REQUESTS
CREATE TABLE IF NOT EXISTS public.attendance_corrections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    attendance_id UUID REFERENCES public.attendance(id) ON DELETE SET NULL,
    date DATE NOT NULL,
    requested_check_in TIMESTAMPTZ NOT NULL,
    requested_check_out TIMESTAMPTZ NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED
    approver_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    decision_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. HOLIDAYS
CREATE TABLE IF NOT EXISTS public.holidays (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'PUBLIC', -- PUBLIC, COMPANY, OPTIONAL
    branch_id UUID REFERENCES public.company_branches(id) ON DELETE CASCADE,
    description TEXT,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. ROSTERS
CREATE TABLE IF NOT EXISTS public.rosters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    shift_id UUID REFERENCES public.shifts(id) ON DELETE CASCADE,
    is_weekly_off BOOLEAN DEFAULT false,
    is_holiday BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_company_employee_roster_date UNIQUE (company_id, employee_id, date)
);

-- 8. OVERTIME POLICIES
CREATE TABLE IF NOT EXISTS public.overtime_policies (
    company_id UUID PRIMARY KEY REFERENCES public.companies(id) ON DELETE CASCADE,
    min_overtime_threshold_mins INTEGER DEFAULT 30,
    max_daily_overtime_hours NUMERIC(4,2) DEFAULT 4.00,
    max_monthly_overtime_hours NUMERIC(5,2) DEFAULT 40.00,
    weekday_rate NUMERIC(3,2) DEFAULT 1.50,
    weekend_rate NUMERIC(3,2) DEFAULT 2.00,
    holiday_rate NUMERIC(3,2) DEFAULT 2.00,
    require_approval BOOLEAN DEFAULT true,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. OVERTIME REQUESTS
CREATE TABLE IF NOT EXISTS public.overtime_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    hours NUMERIC(4,2) NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(30) DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED
    approver_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. WORK FROM HOME (WFH) REQUESTS
CREATE TABLE IF NOT EXISTS public.work_from_home_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(30) DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED
    approver_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. ATTENDANCE PERIODS
CREATE TABLE IF NOT EXISTS public.attendance_periods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    period_name VARCHAR(100) NOT NULL, -- e.g. September 2026
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(30) DEFAULT 'OPEN', -- OPEN, UNDER_REVIEW, CLOSED, LOCKED
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. BIOMETRIC DEVICE CONFIGS
CREATE TABLE IF NOT EXISTS public.attendance_device_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    device_name VARCHAR(100) NOT NULL,
    device_code VARCHAR(50) NOT NULL,
    vendor VARCHAR(100) DEFAULT 'ZKTeco',
    location VARCHAR(255),
    status VARCHAR(20) DEFAULT 'ACTIVE',
    last_sync_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_attendance_company_id ON public.attendance(company_id);
CREATE INDEX IF NOT EXISTS idx_attendance_employee_id ON public.attendance(employee_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON public.attendance(date);
CREATE INDEX IF NOT EXISTS idx_attendance_status ON public.attendance(status);
CREATE INDEX IF NOT EXISTS idx_attendance_punches_attendance_id ON public.attendance_punches(attendance_id);
CREATE INDEX IF NOT EXISTS idx_rosters_employee_id ON public.rosters(employee_id);
CREATE INDEX IF NOT EXISTS idx_holidays_company_id ON public.holidays(company_id);

-- RLS POLICIES FOR PART 4
ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shift_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_punches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_corrections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.holidays ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rosters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.overtime_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.overtime_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_from_home_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_device_configs ENABLE ROW LEVEL SECURITY;

-- Super Admins and HR Admins have company-wide access
CREATE POLICY "HR Admins access company attendance" ON public.attendance
    FOR ALL USING (company_id = public.get_user_company_id(auth.uid()) OR public.is_super_admin(auth.uid()));

CREATE POLICY "HR Admins access company shifts" ON public.shifts
    FOR ALL USING (company_id = public.get_user_company_id(auth.uid()) OR public.is_super_admin(auth.uid()));

CREATE POLICY "HR Admins access company holidays" ON public.holidays
    FOR ALL USING (company_id = public.get_user_company_id(auth.uid()) OR public.is_super_admin(auth.uid()));

-- Employees access ONLY their own attendance
CREATE POLICY "Employees access own attendance" ON public.attendance
    FOR SELECT USING (employee_id = auth.uid() OR public.is_super_admin(auth.uid()));

-- Managers access ONLY their team attendance
CREATE POLICY "Managers access team attendance" ON public.attendance
    FOR SELECT USING (
        employee_id IN (
            SELECT id FROM public.employees WHERE reporting_manager_id = auth.uid()
        )
    );
