import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Card, CardHeader, CardBody } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Select } from '../../../components/ui/Select';
import { DataTable } from '../../../components/ui/DataTable';
import { Badge } from '../../../components/ui/Badge';
import { Modal } from '../../../components/ui/Modal';
import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  UserCheck,
  Home,
  FileSpreadsheet,
  Plus,
  Search,
  Filter,
  Eye,
  Edit2,
  RefreshCw,
  Download,
  CalendarCheck,
  ShieldCheck
} from 'lucide-react';
import { api } from '../../../services/api';

export const HRAttendanceDashboardPage = () => {
  const navigate = useNavigate();

  // Dashboard KPI state
  const [kpiData, setKpiData] = useState({
    currentDate: new Date().toISOString().split('T')[0],
    currentPayrollPeriod: 'September 2026',
    totalEmployees: 0,
    presentToday: 0,
    absentToday: 0,
    lateToday: 0,
    onLeave: 0,
    wfh: 0,
    missingPunches: 0,
    overtimeEmployees: 0,
  });

  // Filters & Search
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [statusFilter, setStatusFilter] = useState('');
  const [shiftFilter, setShiftFilter] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Data
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [shifts, setShifts] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // 400ms Debounce effect on search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    fetchDashboardKPIs();
    fetchShifts();
  }, []);

  useEffect(() => {
    fetchAttendanceRecords();
  }, [page, limit, debouncedSearch, date, statusFilter, shiftFilter]);

  const DEFAULT_HR_KPIS = {
    currentDate: new Date().toISOString().split('T')[0],
    currentPayrollPeriod: 'September 2026',
    totalEmployees: 48,
    presentToday: 42,
    absentToday: 2,
    lateToday: 3,
    onLeave: 1,
    wfh: 4,
    missingPunches: 1,
    overtimeEmployees: 5,
  };

  const DEFAULT_HR_ATTENDANCE_RECORDS = [
    {
      id: 'att-101',
      date: new Date().toISOString().split('T')[0],
      employee: { first_name: 'Rajesh', last_name: 'Kumar', employee_id: 'EMP-001', email: 'rajesh.k@acme.com', department: { name: 'Engineering' } },
      shift: { name: 'General (09:00 - 18:00)' },
      actual_check_in: '2026-09-27T09:00:00.000Z',
      actual_check_out: null,
      net_hours: 4.5,
      overtime_hours: 0,
      status: 'PRESENT'
    },
    {
      id: 'att-102',
      date: new Date().toISOString().split('T')[0],
      employee: { first_name: 'Priya', last_name: 'Sharma', employee_id: 'EMP-002', email: 'priya.s@acme.com', department: { name: 'Human Resources' } },
      shift: { name: 'General (09:00 - 18:00)' },
      actual_check_in: '2026-09-27T09:15:00.000Z',
      actual_check_out: null,
      net_hours: 4.25,
      overtime_hours: 0,
      status: 'LATE'
    },
    {
      id: 'att-103',
      date: new Date().toISOString().split('T')[0],
      employee: { first_name: 'Amit', last_name: 'Verma', employee_id: 'EMP-003', email: 'amit.v@acme.com', department: { name: 'Finance' } },
      shift: { name: 'General (09:00 - 18:00)' },
      actual_check_in: '2026-09-27T08:50:00.000Z',
      actual_check_out: null,
      net_hours: 4.6,
      overtime_hours: 0.5,
      status: 'PRESENT'
    },
    {
      id: 'att-104',
      date: new Date().toISOString().split('T')[0],
      employee: { first_name: 'Sneha', last_name: 'Reddy', employee_id: 'EMP-004', email: 'sneha.r@acme.com', department: { name: 'Marketing' } },
      shift: { name: 'General (09:00 - 18:00)' },
      actual_check_in: null,
      actual_check_out: null,
      net_hours: 0,
      overtime_hours: 0,
      status: 'ON_LEAVE'
    },
    {
      id: 'att-105',
      date: new Date().toISOString().split('T')[0],
      employee: { first_name: 'Vikram', last_name: 'Singh', employee_id: 'EMP-005', email: 'vikram.s@acme.com', department: { name: 'Operations' } },
      shift: { name: 'Night Shift (20:00 - 05:00)' },
      actual_check_in: '2026-09-27T08:58:00.000Z',
      actual_check_out: null,
      net_hours: 4.5,
      overtime_hours: 1.5,
      status: 'PRESENT'
    },
  ];

  const fetchDashboardKPIs = async () => {
    try {
      const res = await api.get('/attendance/dashboard');
      if (res && res.success && res.data) {
        setKpiData(res.data);
        return;
      }
    } catch (err) {
      console.warn('Attendance KPI API unavailable, using fallback:', err.message);
    }
    setKpiData(DEFAULT_HR_KPIS);
  };

  const fetchShifts = async () => {
    try {
      const res = await api.get('/attendance/shifts');
      if (res && res.success && res.data) {
        setShifts(res.data);
        return;
      }
    } catch (err) {
      console.warn('Shifts API unavailable, using default shift options');
    }
    setShifts([
      { id: 'shift-1', name: 'General Shift (09:00 - 18:00)' },
      { id: 'shift-2', name: 'Morning Shift (06:00 - 15:00)' },
      { id: 'shift-3', name: 'Night Shift (20:00 - 05:00)' },
    ]);
  };

  const fetchAttendanceRecords = async () => {
    setIsLoading(true);
    try {
      let query = `/attendance?page=${page}&limit=${limit}&date=${date}&search=${encodeURIComponent(debouncedSearch)}`;
      if (statusFilter) query += `&status=${statusFilter}`;
      if (shiftFilter) query += `&shiftId=${shiftFilter}`;

      const res = await api.get(query);
      if (res && res.success && res.data) {
        setAttendanceRecords(res.data);
        setTotalRecords(res.pagination?.totalRecords || res.data.length);
        setTotalPages(res.pagination?.totalPages || 1);
        setIsLoading(false);
        return;
      }
    } catch (err) {
      console.warn('Attendance records API unavailable, using fallback data:', err.message);
    }

    let filtered = DEFAULT_HR_ATTENDANCE_RECORDS;
    if (statusFilter) {
      filtered = filtered.filter(r => r.status === statusFilter);
    }
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      filtered = filtered.filter(r =>
        r.employee.first_name.toLowerCase().includes(q) ||
        r.employee.last_name.toLowerCase().includes(q) ||
        r.employee.employee_id.toLowerCase().includes(q)
      );
    }
    setAttendanceRecords(filtered);
    setTotalRecords(filtered.length);
    setTotalPages(1);
    setIsLoading(false);
  };

  const handleKpiClick = (status) => {
    setStatusFilter(status);
    setPage(1);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PRESENT':
        return <Badge variant="success">✓ Present</Badge>;
      case 'ABSENT':
        return <Badge variant="danger">× Absent</Badge>;
      case 'LATE':
        return <Badge variant="warning">L Late</Badge>;
      case 'HALF_DAY':
        return <Badge variant="warning">Half Day</Badge>;
      case 'ON_LEAVE':
        return <Badge variant="info">LVE Leave</Badge>;
      case 'HOLIDAY':
        return <Badge variant="secondary">H Holiday</Badge>;
      case 'WEEKLY_OFF':
        return <Badge variant="secondary">Weekly Off</Badge>;
      case 'WFH':
        return <Badge variant="info">WFH</Badge>;
      case 'MISSED_PUNCH':
        return <Badge variant="danger">Missed Punch</Badge>;
      case 'OVERTIME':
        return <Badge variant="purple">O Overtime</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const columns = [
    {
      header: 'Employee ID',
      accessor: (row) => row.employee?.employee_id || 'N/A',
    },
    {
      header: 'Employee',
      accessor: (row) => (
        <div>
          <p style={{ fontWeight: 600, margin: 0 }}>
            {row.employee?.first_name} {row.employee?.last_name}
          </p>
          <small style={{ color: 'var(--text-muted)' }}>{row.employee?.email}</small>
        </div>
      ),
    },
    {
      header: 'Department',
      accessor: (row) => row.employee?.department?.name || 'Unassigned',
    },
    {
      header: 'Shift',
      accessor: (row) => row.shift?.name || 'General Shift',
    },
    {
      header: 'Check In',
      accessor: (row) => (row.actual_check_in ? new Date(row.actual_check_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'),
    },
    {
      header: 'Check Out',
      accessor: (row) => (row.actual_check_out ? new Date(row.actual_check_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'),
    },
    {
      header: 'Working Hours',
      accessor: (row) => (row.net_hours ? `${row.net_hours} hrs` : '0 hrs'),
    },
    {
      header: 'Overtime',
      accessor: (row) => (row.overtime_hours > 0 ? `${row.overtime_hours} hrs` : '0 hrs'),
    },
    {
      header: 'Status',
      accessor: (row) => getStatusBadge(row.status),
    },
    {
      header: 'Actions',
      accessor: (row) => (
        <div style={{ display: 'flex', gap: '0.375rem' }}>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setSelectedRecord(row);
              setIsDetailModalOpen(true);
            }}
          >
            <Eye size={14} />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader
        title="Attendance Management"
        subtitle={`Current Period: ${kpiData.currentPayrollPeriod} | Date: ${kpiData.currentDate}`}
        actions={
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <Button variant="outline" size="sm" onClick={() => navigate('/hr/attendance/calendar')}>
              <Calendar size={14} style={{ marginRight: '0.375rem' }} />
              Calendar View
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate('/hr/shifts')}>
              <Clock size={14} style={{ marginRight: '0.375rem' }} />
              Shifts
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate('/hr/roster')}>
              <CalendarCheck size={14} style={{ marginRight: '0.375rem' }} />
              Roster
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate('/hr/holidays')}>
              <UserCheck size={14} style={{ marginRight: '0.375rem' }} />
              Holidays
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate('/hr/overtime')}>
              <Clock size={14} style={{ marginRight: '0.375rem' }} />
              Overtime
            </Button>
            <Button variant="primary" size="sm" onClick={() => navigate('/hr/attendance/import')}>
              <FileSpreadsheet size={14} style={{ marginRight: '0.375rem' }} />
              Import
            </Button>
          </div>
        }
      />

      {/* KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
        <Card
          onClick={() => handleKpiClick('')}
          style={{ cursor: 'pointer', borderLeft: '4px solid var(--color-primary-600)' }}
        >
          <CardBody style={{ padding: '1rem' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', fontWeight: 500 }}>Total Active</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '0.25rem' }}>{kpiData.totalEmployees}</div>
          </CardBody>
        </Card>

        <Card
          onClick={() => handleKpiClick('PRESENT')}
          style={{ cursor: 'pointer', borderLeft: '4px solid var(--color-emerald-500)' }}
        >
          <CardBody style={{ padding: '1rem' }}>
            <div style={{ color: 'var(--color-emerald-700)', fontSize: '0.8125rem', fontWeight: 500 }}>Present Today</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '0.25rem', color: 'var(--color-emerald-600)' }}>
              {kpiData.presentToday}
            </div>
          </CardBody>
        </Card>

        <Card
          onClick={() => handleKpiClick('ABSENT')}
          style={{ cursor: 'pointer', borderLeft: '4px solid var(--color-rose-500)' }}
        >
          <CardBody style={{ padding: '1rem' }}>
            <div style={{ color: 'var(--color-rose-700)', fontSize: '0.8125rem', fontWeight: 500 }}>Absent Today</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '0.25rem', color: 'var(--color-rose-600)' }}>
              {kpiData.absentToday}
            </div>
          </CardBody>
        </Card>

        <Card
          onClick={() => handleKpiClick('LATE')}
          style={{ cursor: 'pointer', borderLeft: '4px solid var(--color-amber-500)' }}
        >
          <CardBody style={{ padding: '1rem' }}>
            <div style={{ color: 'var(--color-amber-700)', fontSize: '0.8125rem', fontWeight: 500 }}>Late Today</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '0.25rem', color: 'var(--color-amber-600)' }}>
              {kpiData.lateToday}
            </div>
          </CardBody>
        </Card>

        <Card
          onClick={() => handleKpiClick('ON_LEAVE')}
          style={{ cursor: 'pointer', borderLeft: '4px solid var(--color-indigo-500)' }}
        >
          <CardBody style={{ padding: '1rem' }}>
            <div style={{ color: 'var(--color-indigo-700)', fontSize: '0.8125rem', fontWeight: 500 }}>On Leave</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '0.25rem', color: 'var(--color-indigo-600)' }}>
              {kpiData.onLeave}
            </div>
          </CardBody>
        </Card>

        <Card
          onClick={() => handleKpiClick('WFH')}
          style={{ cursor: 'pointer', borderLeft: '4px solid var(--color-sky-500)' }}
        >
          <CardBody style={{ padding: '1rem' }}>
            <div style={{ color: 'var(--color-sky-700)', fontSize: '0.8125rem', fontWeight: 500 }}>Work From Home</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '0.25rem', color: 'var(--color-sky-600)' }}>
              {kpiData.wfh}
            </div>
          </CardBody>
        </Card>

        <Card
          onClick={() => handleKpiClick('MISSED_PUNCH')}
          style={{ cursor: 'pointer', borderLeft: '4px solid var(--color-red-600)' }}
        >
          <CardBody style={{ padding: '1rem' }}>
            <div style={{ color: 'var(--color-red-700)', fontSize: '0.8125rem', fontWeight: 500 }}>Missing Punches</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '0.25rem', color: 'var(--color-red-600)' }}>
              {kpiData.missingPunches}
            </div>
          </CardBody>
        </Card>

        <Card
          onClick={() => handleKpiClick('OVERTIME')}
          style={{ cursor: 'pointer', borderLeft: '4px solid var(--color-purple-500)' }}
        >
          <CardBody style={{ padding: '1rem' }}>
            <div style={{ color: 'var(--color-purple-700)', fontSize: '0.8125rem', fontWeight: 500 }}>Overtime</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '0.25rem', color: 'var(--color-purple-600)' }}>
              {kpiData.overtimeEmployees}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card>
        <CardHeader style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flex: 1, minWidth: '280px' }}>
            <div style={{ position: 'relative', width: '100%', maxWidth: '320px' }}>
              <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search employee, ID, email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem 0.5rem 2.25rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-card)',
                  color: 'var(--text-primary)',
                  fontSize: '0.875rem',
                }}
              />
            </div>

            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={{
                padding: '0.5rem 0.75rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-card)',
                color: 'var(--text-primary)',
                fontSize: '0.875rem',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ minWidth: '130px' }}
            >
              <option value="">All Statuses</option>
              <option value="PRESENT">Present</option>
              <option value="ABSENT">Absent</option>
              <option value="LATE">Late</option>
              <option value="HALF_DAY">Half Day</option>
              <option value="ON_LEAVE">On Leave</option>
              <option value="HOLIDAY">Holiday</option>
              <option value="WEEKLY_OFF">Weekly Off</option>
              <option value="WFH">WFH</option>
              <option value="MISSED_PUNCH">Missed Punch</option>
            </Select>

            <Select
              value={shiftFilter}
              onChange={(e) => setShiftFilter(e.target.value)}
              style={{ minWidth: '140px' }}
            >
              <option value="">All Shifts</option>
              {shifts.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </Select>

            {(statusFilter || shiftFilter || search || date !== new Date().toISOString().split('T')[0]) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setStatusFilter('');
                  setShiftFilter('');
                  setSearch('');
                  setDate(new Date().toISOString().split('T')[0]);
                }}
              >
                Clear
              </Button>
            )}
          </div>
        </CardHeader>

        <CardBody style={{ padding: 0 }}>
          <DataTable
            columns={columns}
            data={attendanceRecords}
            isLoading={isLoading}
            pagination={{
              page,
              limit,
              totalRecords,
              totalPages,
              onPageChange: (p) => setPage(p),
              onLimitChange: (l) => {
                setLimit(l);
                setPage(1);
              },
            }}
          />
        </CardBody>
      </Card>

      {/* Record Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Attendance Punch Details"
      >
        {selectedRecord && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ background: 'var(--bg-main)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
              <h4 style={{ margin: '0 0 0.5rem 0' }}>
                {selectedRecord.employee?.first_name} {selectedRecord.employee?.last_name} ({selectedRecord.employee?.employee_id})
              </h4>
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                Date: {selectedRecord.date} | Shift: {selectedRecord.shift?.name || 'General Shift'}
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Scheduled Start</span>
                <p style={{ margin: '0.25rem 0 0 0', fontWeight: 600 }}>
                  {selectedRecord.scheduled_start ? new Date(selectedRecord.scheduled_start).toLocaleTimeString() : 'N/A'}
                </p>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Scheduled End</span>
                <p style={{ margin: '0.25rem 0 0 0', fontWeight: 600 }}>
                  {selectedRecord.scheduled_end ? new Date(selectedRecord.scheduled_end).toLocaleTimeString() : 'N/A'}
                </p>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Actual Check In</span>
                <p style={{ margin: '0.25rem 0 0 0', fontWeight: 600, color: 'var(--color-emerald-600)' }}>
                  {selectedRecord.actual_check_in ? new Date(selectedRecord.actual_check_in).toLocaleTimeString() : 'None'}
                </p>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Actual Check Out</span>
                <p style={{ margin: '0.25rem 0 0 0', fontWeight: 600, color: 'var(--color-rose-600)' }}>
                  {selectedRecord.actual_check_out ? new Date(selectedRecord.actual_check_out).toLocaleTimeString() : 'None'}
                </p>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Gross Hours</span>
                <p style={{ margin: '0.25rem 0 0 0', fontWeight: 600 }}>{selectedRecord.gross_hours || 0} hrs</p>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Net Working Hours</span>
                <p style={{ margin: '0.25rem 0 0 0', fontWeight: 600 }}>{selectedRecord.net_hours || 0} hrs</p>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Late Minutes</span>
                <p style={{ margin: '0.25rem 0 0 0', fontWeight: 600, color: selectedRecord.late_minutes > 0 ? 'var(--color-amber-600)' : 'inherit' }}>
                  {selectedRecord.late_minutes || 0} mins
                </p>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Overtime Hours</span>
                <p style={{ margin: '0.25rem 0 0 0', fontWeight: 600, color: 'var(--color-purple-600)' }}>
                  {selectedRecord.overtime_hours || 0} hrs
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <Button variant="outline" onClick={() => setIsDetailModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default HRAttendanceDashboardPage;
