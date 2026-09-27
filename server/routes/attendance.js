import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { requirePermission, enforceTenantIsolation } from '../middleware/authorize.js';
import { supabaseAdmin } from '../config/supabase.js';
import { auditService } from '../services/auditService.js';
import {
  calculateAttendanceRecord,
  isWeeklyOff,
} from '../services/attendanceCalculationService.js';
import {
  calculateOvertimePay,
  getCompanyOvertimePolicy,
} from '../services/overtimeCalculationService.js';
import { getPayrollAttendanceSummary } from '../services/attendancePayrollService.js';
import { AttendanceDeviceProvider } from '../services/attendanceDeviceProvider.js';
import {
  punchSchema,
  correctionSchema,
  shiftSchema,
  holidaySchema,
  overtimePolicySchema,
  wfhRequestSchema,
} from '../validators/attendanceSchemas.js';

const router = express.Router();

router.use(authenticateToken);
router.use(enforceTenantIsolation);

/**
 * GET /api/attendance/dashboard
 * Return KPI widgets: Total Employees, Present Today, Absent Today, Late Today, On Leave, WFH, Missing Punches, Overtime Employees
 */
router.get('/dashboard', async (req, res, next) => {
  try {
    const companyId = req.targetCompanyId;
    const today = new Date().toISOString().split('T')[0];

    const { count: totalEmployees } = await supabaseAdmin
      .from('employees')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .eq('employment_status', 'ACTIVE');

    const { data: todayRecords } = await supabaseAdmin
      .from('attendance')
      .select('*')
      .eq('company_id', companyId)
      .eq('date', today);

    const records = todayRecords || [];

    const presentToday = records.filter(r => r.status === 'PRESENT').length;
    const absentToday = records.filter(r => r.status === 'ABSENT').length;
    const lateToday = records.filter(r => r.status === 'LATE').length;
    const onLeave = records.filter(r => r.status === 'ON_LEAVE').length;
    const wfh = records.filter(r => r.status === 'WFH').length;
    const missingPunches = records.filter(r => r.status === 'MISSED_PUNCH').length;
    const overtimeEmployees = records.filter(r => r.overtime_hours > 0).length;

    return res.status(200).json({
      success: true,
      data: {
        currentDate: today,
        currentPayrollPeriod: `${new Date().toLocaleString('default', { month: 'long' })} ${new Date().getFullYear()}`,
        totalEmployees: totalEmployees || 0,
        presentToday,
        absentToday,
        lateToday,
        onLeave,
        wfh,
        missingPunches,
        overtimeEmployees,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/attendance
 * Server-side search, filtering (date, employee, dept, branch, shift, status), sorting, pagination
 */
router.get('/', async (req, res, next) => {
  try {
    const companyId = req.targetCompanyId;
    const {
      search = '',
      date = new Date().toISOString().split('T')[0],
      departmentId,
      branchId,
      shiftId,
      status,
      page = 1,
      limit = 10,
      sortBy = 'date',
      sortOrder = 'desc',
    } = req.query;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const offset = (pageNum - 1) * limitNum;

    let query = supabaseAdmin
      .from('attendance')
      .select(`
        *,
        employee:employees!inner(
          id, employee_id, first_name, last_name, email, department_id, branch_id, designation_id,
          department:departments(name),
          branch:branches(name),
          designation:designations(title)
        ),
        shift:shifts(name, code, start_time, end_time)
      `, { count: 'exact' })
      .eq('company_id', companyId);

    if (date) {
      query = query.eq('date', date);
    }
    if (status) {
      query = query.eq('status', status);
    }
    if (shiftId) {
      query = query.eq('shift_id', shiftId);
    }

    if (departmentId) {
      query = query.eq('employee.department_id', departmentId);
    }
    if (branchId) {
      query = query.eq('employee.branch_id', branchId);
    }

    if (search.trim()) {
      const term = `%${search.trim()}%`;
      query = query.or(`employee_id.ilike.${term},first_name.ilike.${term},last_name.ilike.${term},email.ilike.${term}`, { foreignTable: 'employee' });
    }

    query = query.order(sortBy, { ascending: sortOrder === 'asc' });
    query = query.range(offset, offset + limitNum - 1);

    const { data, count, error } = await query;

    if (error) throw error;

    return res.status(200).json({
      success: true,
      data: data || [],
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalRecords: count || 0,
        totalPages: Math.ceil((count || 0) / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/attendance/check-in
 */
router.post('/check-in', async (req, res, next) => {
  try {
    const companyId = req.targetCompanyId;
    const userId = req.user.id;
    const validation = punchSchema.parse(req.body);

    // Get current employee
    const { data: employee, error: empErr } = await supabaseAdmin
      .from('employees')
      .select('id, company_id')
      .eq('user_id', userId)
      .eq('company_id', companyId)
      .single();

    if (empErr || !employee) {
      return res.status(404).json({ success: false, message: 'Employee profile not found' });
    }

    const today = new Date().toISOString().split('T')[0];
    const nowIso = new Date().toISOString();

    // Check if open session exists (prevent duplicate check-in)
    const { data: existing } = await supabaseAdmin
      .from('attendance')
      .select('*')
      .eq('company_id', companyId)
      .eq('employee_id', employee.id)
      .eq('date', today)
      .single();

    if (existing && existing.actual_check_in && !existing.actual_check_out) {
      return res.status(400).json({ success: false, message: 'Already checked in for today' });
    }

    // Get assigned shift or default shift
    const { data: shiftAssign } = await supabaseAdmin
      .from('shift_assignments')
      .select('shift:*')
      .eq('company_id', companyId)
      .eq('employee_id', employee.id)
      .lte('effective_from', today)
      .or(`effective_to.is.null,effective_to.gte.${today}`)
      .limit(1)
      .single();

    let shift = shiftAssign?.shift;

    if (!shift) {
      const { data: defaultShift } = await supabaseAdmin
        .from('shifts')
        .select('*')
        .eq('company_id', companyId)
        .eq('is_active', true)
        .limit(1)
        .single();
      shift = defaultShift;
    }

    const calc = calculateAttendanceRecord({
      date: today,
      shift,
      checkIn: nowIso,
      checkOut: existing?.actual_check_out || null,
    });

    let attRecord;
    if (existing) {
      const { data, error } = await supabaseAdmin
        .from('attendance')
        .update({
          actual_check_in: nowIso,
          scheduled_start: calc.scheduled_start,
          scheduled_end: calc.scheduled_end,
          status: calc.status,
          late_minutes: calc.late_minutes,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select()
        .single();
      if (error) throw error;
      attRecord = data;
    } else {
      const { data, error } = await supabaseAdmin
        .from('attendance')
        .insert({
          company_id: companyId,
          employee_id: employee.id,
          date: today,
          shift_id: shift?.id || null,
          scheduled_start: calc.scheduled_start,
          scheduled_end: calc.scheduled_end,
          actual_check_in: nowIso,
          status: calc.status,
          late_minutes: calc.late_minutes,
        })
        .select()
        .single();
      if (error) throw error;
      attRecord = data;
    }

    // Insert Raw Punch
    await supabaseAdmin.from('attendance_punches').insert({
      company_id: companyId,
      employee_id: employee.id,
      attendance_id: attRecord.id,
      punch_type: 'CHECK_IN',
      timestamp: nowIso,
      source: validation.source,
      device_id: validation.deviceId || null,
      latitude: validation.latitude || null,
      longitude: validation.longitude || null,
      accuracy: validation.accuracy || null,
    });

    await auditService.log({
      user: req.user,
      action: 'ATTENDANCE_CHECKIN',
      entity: 'attendance',
      entityId: attRecord.id,
      newValue: attRecord,
    });

    return res.status(200).json({
      success: true,
      message: 'Checked in successfully',
      data: attRecord,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/attendance/check-out
 */
router.post('/check-out', async (req, res, next) => {
  try {
    const companyId = req.targetCompanyId;
    const userId = req.user.id;
    const validation = punchSchema.parse(req.body);

    const { data: employee } = await supabaseAdmin
      .from('employees')
      .select('id')
      .eq('user_id', userId)
      .eq('company_id', companyId)
      .single();

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const today = new Date().toISOString().split('T')[0];
    const nowIso = new Date().toISOString();

    const { data: existing } = await supabaseAdmin
      .from('attendance')
      .select('*, shift:shifts(*)')
      .eq('company_id', companyId)
      .eq('employee_id', employee.id)
      .eq('date', today)
      .single();

    if (!existing || !existing.actual_check_in) {
      return res.status(400).json({ success: false, message: 'Cannot checkout without check-in' });
    }

    if (existing.actual_check_out) {
      return res.status(400).json({ success: false, message: 'Already checked out for today' });
    }

    // Fetch punches for break calculation
    const { data: punches } = await supabaseAdmin
      .from('attendance_punches')
      .select('*')
      .eq('attendance_id', existing.id)
      .order('timestamp', { ascending: true });

    const calc = calculateAttendanceRecord({
      date: today,
      shift: existing.shift,
      checkIn: existing.actual_check_in,
      checkOut: nowIso,
      punches: punches || [],
    });

    const { data: updated, error } = await supabaseAdmin
      .from('attendance')
      .update({
        actual_check_out: nowIso,
        gross_hours: calc.gross_hours,
        break_hours: calc.break_hours,
        net_hours: calc.net_hours,
        late_minutes: calc.late_minutes,
        early_exit_minutes: calc.early_exit_minutes,
        overtime_hours: calc.overtime_hours,
        status: calc.status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id)
      .select()
      .single();

    if (error) throw error;

    await supabaseAdmin.from('attendance_punches').insert({
      company_id: companyId,
      employee_id: employee.id,
      attendance_id: existing.id,
      punch_type: 'CHECK_OUT',
      timestamp: nowIso,
      source: validation.source,
      device_id: validation.deviceId || null,
      latitude: validation.latitude || null,
      longitude: validation.longitude || null,
      accuracy: validation.accuracy || null,
    });

    await auditService.log({
      user: req.user,
      action: 'ATTENDANCE_CHECKOUT',
      entity: 'attendance',
      entityId: updated.id,
      newValue: updated,
    });

    return res.status(200).json({
      success: true,
      message: 'Checked out successfully',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/attendance/break-start
 */
router.post('/break-start', async (req, res, next) => {
  try {
    const companyId = req.targetCompanyId;
    const userId = req.user.id;

    const { data: employee } = await supabaseAdmin
      .from('employees')
      .select('id')
      .eq('user_id', userId)
      .eq('company_id', companyId)
      .single();

    const today = new Date().toISOString().split('T')[0];
    const nowIso = new Date().toISOString();

    const { data: existing } = await supabaseAdmin
      .from('attendance')
      .select('*')
      .eq('company_id', companyId)
      .eq('employee_id', employee.id)
      .eq('date', today)
      .single();

    if (!existing || !existing.actual_check_in || existing.actual_check_out) {
      return res.status(400).json({ success: false, message: 'Must be checked in to start break' });
    }

    await supabaseAdmin.from('attendance_punches').insert({
      company_id: companyId,
      employee_id: employee.id,
      attendance_id: existing.id,
      punch_type: 'BREAK_START',
      timestamp: nowIso,
      source: 'WEB',
    });

    return res.status(200).json({ success: true, message: 'Break started' });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/attendance/break-end
 */
router.post('/break-end', async (req, res, next) => {
  try {
    const companyId = req.targetCompanyId;
    const userId = req.user.id;

    const { data: employee } = await supabaseAdmin
      .from('employees')
      .select('id')
      .eq('user_id', userId)
      .eq('company_id', companyId)
      .single();

    const today = new Date().toISOString().split('T')[0];
    const nowIso = new Date().toISOString();

    const { data: existing } = await supabaseAdmin
      .from('attendance')
      .select('*')
      .eq('company_id', companyId)
      .eq('employee_id', employee.id)
      .eq('date', today)
      .single();

    if (!existing || !existing.actual_check_in || existing.actual_check_out) {
      return res.status(400).json({ success: false, message: 'Invalid state to end break' });
    }

    await supabaseAdmin.from('attendance_punches').insert({
      company_id: companyId,
      employee_id: employee.id,
      attendance_id: existing.id,
      punch_type: 'BREAK_END',
      timestamp: nowIso,
      source: 'WEB',
    });

    return res.status(200).json({ success: true, message: 'Break ended' });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/attendance/employee/me or /api/attendance/:employeeId
 */
router.get('/employee/me', async (req, res, next) => {
  try {
    const companyId = req.targetCompanyId;
    const userId = req.user.id;

    const { data: employee } = await supabaseAdmin
      .from('employees')
      .select('*, department:departments(name), branch:branches(name), designation:designations(title)')
      .eq('user_id', userId)
      .eq('company_id', companyId)
      .single();

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee record not found' });
    }

    const today = new Date().toISOString().split('T')[0];
    const startOfMonth = `${today.substring(0, 7)}-01`;

    const { data: todayRec } = await supabaseAdmin
      .from('attendance')
      .select('*, shift:shifts(*)')
      .eq('company_id', companyId)
      .eq('employee_id', employee.id)
      .eq('date', today)
      .single();

    const { data: monthRecords } = await supabaseAdmin
      .from('attendance')
      .select('*')
      .eq('company_id', companyId)
      .eq('employee_id', employee.id)
      .gte('date', startOfMonth)
      .lte('date', today);

    const recs = monthRecords || [];
    const monthlySummary = {
      workingDays: recs.filter(r => r.status !== 'WEEKLY_OFF' && r.status !== 'HOLIDAY').length,
      present: recs.filter(r => r.status === 'PRESENT').length,
      absent: recs.filter(r => r.status === 'ABSENT').length,
      leave: recs.filter(r => r.status === 'ON_LEAVE').length,
      late: recs.filter(r => r.status === 'LATE').length,
      halfDays: recs.filter(r => r.status === 'HALF_DAY').length,
      overtimeHours: recs.reduce((acc, curr) => acc + (curr.overtime_hours || 0), 0),
    };

    return res.status(200).json({
      success: true,
      data: {
        employee,
        todayAttendance: todayRec || null,
        monthlySummary,
        history: recs,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * SHIFT MANAGEMENT
 * GET /api/attendance/shifts
 * POST /api/attendance/shifts
 * PATCH /api/attendance/shifts/:id
 */
router.get('/shifts', async (req, res, next) => {
  try {
    const companyId = req.targetCompanyId;
    const { data, error } = await supabaseAdmin
      .from('shifts')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return res.status(200).json({ success: true, data: data || [] });
  } catch (error) {
    next(error);
  }
});

router.post('/shifts', requirePermission('attendance.manage_shifts'), async (req, res, next) => {
  try {
    const companyId = req.targetCompanyId;
    const validated = shiftSchema.parse(req.body);

    const { data, error } = await supabaseAdmin
      .from('shifts')
      .insert({
        company_id: companyId,
        name: validated.name,
        code: validated.code,
        start_time: validated.startTime,
        end_time: validated.endTime,
        grace_period_mins: validated.gracePeriodMins,
        min_working_hours: validated.minWorkingHours,
        break_duration_mins: validated.breakDurationMins,
        overtime_threshold_hours: validated.overtimeThresholdHours,
        is_night_shift: validated.isNightShift,
        is_cross_midnight: validated.isCrossMidnight,
      })
      .select()
      .single();

    if (error) throw error;

    await auditService.log({
      user: req.user,
      action: 'SHIFT_CREATE',
      entity: 'shifts',
      entityId: data.id,
      newValue: data,
    });

    return res.status(201).json({ success: true, message: 'Shift created successfully', data });
  } catch (error) {
    next(error);
  }
});

router.patch('/shifts/:id', requirePermission('attendance.manage_shifts'), async (req, res, next) => {
  try {
    const companyId = req.targetCompanyId;
    const { id } = req.params;

    const { data, error } = await supabaseAdmin
      .from('shifts')
      .update({ ...req.body, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('company_id', companyId)
      .select()
      .single();

    if (error) throw error;

    return res.status(200).json({ success: true, message: 'Shift updated successfully', data });
  } catch (error) {
    next(error);
  }
});

/**
 * SHIFT ASSIGNMENT
 * GET /api/attendance/shift-assignments
 * POST /api/attendance/shift-assignments
 */
router.get('/shift-assignments', async (req, res, next) => {
  try {
    const companyId = req.targetCompanyId;
    const { data, error } = await supabaseAdmin
      .from('shift_assignments')
      .select('*, employee:employees(first_name, last_name, employee_id), shift:shifts(name, code)')
      .eq('company_id', companyId)
      .order('effective_from', { ascending: false });

    if (error) throw error;
    return res.status(200).json({ success: true, data: data || [] });
  } catch (error) {
    next(error);
  }
});

router.post('/shift-assignments', requirePermission('attendance.manage_shifts'), async (req, res, next) => {
  try {
    const companyId = req.targetCompanyId;
    const { employeeId, shiftId, effectiveFrom, effectiveTo, departmentId, branchId } = req.body;

    let targetEmployees = [];
    if (employeeId) {
      targetEmployees = [employeeId];
    } else if (departmentId || branchId) {
      let q = supabaseAdmin.from('employees').select('id').eq('company_id', companyId).eq('employment_status', 'ACTIVE');
      if (departmentId) q = q.eq('department_id', departmentId);
      if (branchId) q = q.eq('branch_id', branchId);
      const { data: emps } = await q;
      targetEmployees = (emps || []).map(e => e.id);
    }

    const payload = targetEmployees.map(empId => ({
      company_id: companyId,
      employee_id: empId,
      shift_id: shiftId,
      effective_from: effectiveFrom,
      effective_to: effectiveTo || null,
      assigned_by: req.user.id,
    }));

    const { data, error } = await supabaseAdmin.from('shift_assignments').insert(payload).select();

    if (error) throw error;

    return res.status(201).json({ success: true, message: `Assigned shift to ${payload.length} employee(s)`, data });
  } catch (error) {
    next(error);
  }
});

/**
 * ROSTER MANAGEMENT
 * GET /api/attendance/rosters
 * POST /api/attendance/rosters/bulk
 */
router.get('/rosters', async (req, res, next) => {
  try {
    const companyId = req.targetCompanyId;
    const { startDate, endDate } = req.query;

    let q = supabaseAdmin
      .from('rosters')
      .select('*, employee:employees(id, first_name, last_name, employee_id), shift:shifts(name, code)')
      .eq('company_id', companyId);

    if (startDate) q = q.gte('date', startDate);
    if (endDate) q = q.lte('date', endDate);

    const { data, error } = await q;

    if (error) throw error;
    return res.status(200).json({ success: true, data: data || [] });
  } catch (error) {
    next(error);
  }
});

router.post('/rosters/bulk', requirePermission('attendance.manage_roster'), async (req, res, next) => {
  try {
    const companyId = req.targetCompanyId;
    const { employeeIds, shiftId, startDate, endDate, isWeeklyOff = false } = req.body;

    const start = new Date(startDate);
    const end = new Date(endDate);

    const rows = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      employeeIds.forEach(empId => {
        rows.push({
          company_id: companyId,
          employee_id: empId,
          shift_id: shiftId,
          date: dateStr,
          is_weekly_off: isWeeklyOff,
        });
      });
    }

    const { data, error } = await supabaseAdmin
      .from('rosters')
      .upsert(rows, { onConflict: 'company_id,employee_id,date' })
      .select();

    if (error) throw error;

    return res.status(200).json({ success: true, message: `Roster assigned for ${rows.length} employee-days`, data });
  } catch (error) {
    next(error);
  }
});

/**
 * HOLIDAYS MANAGEMENT
 * GET /api/attendance/holidays
 * POST /api/attendance/holidays
 * PATCH /api/attendance/holidays/:id
 * DELETE /api/attendance/holidays/:id
 */
router.get('/holidays', async (req, res, next) => {
  try {
    const companyId = req.targetCompanyId;
    const { data, error } = await supabaseAdmin
      .from('holidays')
      .select('*, branch:branches(name)')
      .eq('company_id', companyId)
      .order('date', { ascending: true });

    if (error) throw error;
    return res.status(200).json({ success: true, data: data || [] });
  } catch (error) {
    next(error);
  }
});

router.post('/holidays', requirePermission('attendance.manage_holidays'), async (req, res, next) => {
  try {
    const companyId = req.targetCompanyId;
    const validated = holidaySchema.parse(req.body);

    const { data, error } = await supabaseAdmin
      .from('holidays')
      .insert({
        company_id: companyId,
        name: validated.name,
        date: validated.date,
        type: validated.type,
        branch_id: validated.branchId || null,
        description: validated.description || null,
      })
      .select()
      .single();

    if (error) throw error;

    return res.status(201).json({ success: true, message: 'Holiday created', data });
  } catch (error) {
    next(error);
  }
});

router.delete('/holidays/:id', requirePermission('attendance.manage_holidays'), async (req, res, next) => {
  try {
    const companyId = req.targetCompanyId;
    const { id } = req.params;

    const { error } = await supabaseAdmin
      .from('holidays')
      .delete()
      .eq('id', id)
      .eq('company_id', companyId);

    if (error) throw error;

    return res.status(200).json({ success: true, message: 'Holiday deleted successfully' });
  } catch (error) {
    next(error);
  }
});

/**
 * OVERTIME & POLICY MANAGEMENT
 */
router.get('/overtime/settings', async (req, res, next) => {
  try {
    const companyId = req.targetCompanyId;
    const policy = await getCompanyOvertimePolicy(companyId);
    return res.status(200).json({ success: true, data: policy });
  } catch (error) {
    next(error);
  }
});

router.post('/overtime/settings', requirePermission('attendance.manage_overtime'), async (req, res, next) => {
  try {
    const companyId = req.targetCompanyId;
    const validated = overtimePolicySchema.parse(req.body);

    const { data, error } = await supabaseAdmin
      .from('overtime_policies')
      .upsert({
        company_id: companyId,
        min_overtime_threshold_mins: validated.minOvertimeThresholdMins,
        max_daily_overtime_hours: validated.maxDailyOvertimeHours,
        max_monthly_overtime_hours: validated.maxMonthlyOvertimeHours,
        weekday_rate: validated.weekdayRate,
        weekend_rate: validated.weekendRate,
        holiday_rate: validated.holidayRate,
        require_approval: validated.requireApproval,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'company_id' })
      .select()
      .single();

    if (error) throw error;

    return res.status(200).json({ success: true, message: 'Overtime policy updated', data });
  } catch (error) {
    next(error);
  }
});

/**
 * ATTENDANCE CORRECTIONS (REGULARIZATION)
 */
router.get('/corrections', async (req, res, next) => {
  try {
    const companyId = req.targetCompanyId;
    const { data, error } = await supabaseAdmin
      .from('attendance_corrections')
      .select('*, employee:employees(first_name, last_name, employee_id, department:departments(name))')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return res.status(200).json({ success: true, data: data || [] });
  } catch (error) {
    next(error);
  }
});

router.post('/corrections', async (req, res, next) => {
  try {
    const companyId = req.targetCompanyId;
    const userId = req.user.id;
    const validated = correctionSchema.parse(req.body);

    const { data: employee } = await supabaseAdmin
      .from('employees')
      .select('id')
      .eq('user_id', userId)
      .eq('company_id', companyId)
      .single();

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const { data: existingAtt } = await supabaseAdmin
      .from('attendance')
      .select('*')
      .eq('company_id', companyId)
      .eq('employee_id', employee.id)
      .eq('date', validated.date)
      .single();

    const { data, error } = await supabaseAdmin
      .from('attendance_corrections')
      .insert({
        company_id: companyId,
        employee_id: employee.id,
        attendance_id: existingAtt?.id || null,
        date: validated.date,
        original_check_in: existingAtt?.actual_check_in || null,
        original_check_out: existingAtt?.actual_check_out || null,
        requested_check_in: validated.requestedCheckIn,
        requested_check_out: validated.requestedCheckOut,
        reason: validated.reason,
        status: 'PENDING',
      })
      .select()
      .single();

    if (error) throw error;

    return res.status(201).json({ success: true, message: 'Regularization request submitted', data });
  } catch (error) {
    next(error);
  }
});

router.patch('/corrections/:id', requirePermission('attendance.approve'), async (req, res, next) => {
  try {
    const companyId = req.targetCompanyId;
    const { id } = req.params;
    const { action, rejectionReason } = req.body; // 'APPROVE' or 'REJECT'

    const { data: correction } = await supabaseAdmin
      .from('attendance_corrections')
      .select('*')
      .eq('id', id)
      .eq('company_id', companyId)
      .single();

    if (!correction) {
      return res.status(404).json({ success: false, message: 'Correction request not found' });
    }

    if (action === 'APPROVE') {
      // Recalculate attendance record with new times
      const calc = calculateAttendanceRecord({
        date: correction.date,
        checkIn: correction.requested_check_in,
        checkOut: correction.requested_check_out,
      });

      if (correction.attendance_id) {
        await supabaseAdmin
          .from('attendance')
          .update({
            actual_check_in: correction.requested_check_in,
            actual_check_out: correction.requested_check_out,
            gross_hours: calc.gross_hours,
            net_hours: calc.net_hours,
            status: calc.status,
            updated_at: new Date().toISOString(),
          })
          .eq('id', correction.attendance_id);
      } else {
        await supabaseAdmin.from('attendance').insert({
          company_id: companyId,
          employee_id: correction.employee_id,
          date: correction.date,
          actual_check_in: correction.requested_check_in,
          actual_check_out: correction.requested_check_out,
          gross_hours: calc.gross_hours,
          net_hours: calc.net_hours,
          status: calc.status,
        });
      }

      await supabaseAdmin
        .from('attendance_corrections')
        .update({
          status: 'APPROVED',
          approved_by: req.user.id,
          approved_at: new Date().toISOString(),
        })
        .eq('id', id);
    } else {
      await supabaseAdmin
        .from('attendance_corrections')
        .update({
          status: 'REJECTED',
          rejection_reason: rejectionReason || 'Rejected by Manager/HR',
          approved_by: req.user.id,
          approved_at: new Date().toISOString(),
        })
        .eq('id', id);
    }

    return res.status(200).json({ success: true, message: `Request ${action.toLowerCase()}d successfully` });
  } catch (error) {
    next(error);
  }
});

/**
 * ATTENDANCE READINESS CHECK FOR PAYROLL
 */
router.get('/readiness', async (req, res, next) => {
  try {
    const companyId = req.targetCompanyId;
    const { startDate, endDate } = req.query;

    const { count: pendingCorrections } = await supabaseAdmin
      .from('attendance_corrections')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .eq('status', 'PENDING');

    const { count: missingPunches } = await supabaseAdmin
      .from('attendance')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .eq('status', 'MISSED_PUNCH');

    const issues = [];
    if (pendingCorrections > 0) {
      issues.push(`${pendingCorrections} pending attendance correction requests`);
    }
    if (missingPunches > 0) {
      issues.push(`${missingPunches} un-regularized missing punches`);
    }

    const isReady = issues.length === 0;

    return res.status(200).json({
      success: true,
      data: {
        status: isReady ? 'READY' : 'ISSUES_FOUND',
        isReady,
        issues,
        pendingCorrections,
        missingPunches,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
