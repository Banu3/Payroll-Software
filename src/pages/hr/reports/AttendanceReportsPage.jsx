import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Card, CardHeader, CardBody } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Download, FileText, Calendar, Clock, AlertTriangle } from 'lucide-react';
import { api } from '../../../services/api';

export const AttendanceReportsPage = () => {
  const [reportType, setReportType] = useState('summary'); // 'summary' | 'daily' | 'late-early' | 'overtime'
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchReportData();
  }, [reportType, date]);

  const fetchReportData = async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`/attendance?limit=100&date=${date}`);
      if (res && res.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch report:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const exportToCSV = () => {
    if (!data || data.length === 0) return;
    const headers = ['Employee ID', 'Name', 'Department', 'Date', 'Check In', 'Check Out', 'Working Hours', 'Late Mins', 'Overtime', 'Status'];
    const rows = data.map((r) => [
      r.employee?.employee_id || '',
      `"${r.employee?.first_name || ''} ${r.employee?.last_name || ''}"`,
      `"${r.employee?.department?.name || ''}"`,
      r.date || '',
      r.actual_check_in || '',
      r.actual_check_out || '',
      r.net_hours || 0,
      r.late_minutes || 0,
      r.overtime_hours || 0,
      r.status || '',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Attendance_Report_${reportType}_${date}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader
        title="Attendance & Overtime Reports"
        subtitle="Generate, filter, and export detailed daily punch, late arrival, and overtime reports"
        actions={
          <Button variant="primary" size="sm" onClick={exportToCSV}>
            <Download size={14} style={{ marginRight: '0.375rem' }} />
            Export CSV
          </Button>
        }
      />

      {/* Report Type Filters */}
      <Card>
        <CardBody style={{ padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button
              variant={reportType === 'summary' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setReportType('summary')}
            >
              Attendance Summary
            </Button>
            <Button
              variant={reportType === 'daily' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setReportType('daily')}
            >
              Daily Punch Log
            </Button>
            <Button
              variant={reportType === 'late-early' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setReportType('late-early')}
            >
              Late / Early Exit
            </Button>
            <Button
              variant={reportType === 'overtime' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setReportType('overtime')}
            >
              Overtime Report
            </Button>
          </div>

          <div>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', fontSize: '0.875rem' }}
            />
          </div>
        </CardBody>
      </Card>

      {/* Report Table */}
      <Card>
        <CardHeader>
          <h3 style={{ margin: 0, fontSize: '1.125rem' }}>Report Data Table</h3>
        </CardHeader>
        <CardBody style={{ padding: 0 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ background: 'var(--bg-main)', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '0.75rem 1rem' }}>Employee ID</th>
                <th style={{ padding: '0.75rem 1rem' }}>Employee</th>
                <th style={{ padding: '0.75rem 1rem' }}>Department</th>
                <th style={{ padding: '0.75rem 1rem' }}>Check In</th>
                <th style={{ padding: '0.75rem 1rem' }}>Check Out</th>
                <th style={{ padding: '0.75rem 1rem' }}>Working Hours</th>
                <th style={{ padding: '0.75rem 1rem' }}>Late Minutes</th>
                <th style={{ padding: '0.75rem 1rem' }}>Overtime</th>
                <th style={{ padding: '0.75rem 1rem' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.map((r) => (
                <tr key={r.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>{r.employee?.employee_id || 'N/A'}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>{r.employee?.first_name} {r.employee?.last_name}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>{r.employee?.department?.name || 'Unassigned'}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>{r.actual_check_in ? new Date(r.actual_check_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>{r.actual_check_out ? new Date(r.actual_check_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>{r.net_hours || 0} hrs</td>
                  <td style={{ padding: '0.75rem 1rem', color: r.late_minutes > 0 ? 'var(--color-amber-600)' : 'inherit' }}>{r.late_minutes || 0} mins</td>
                  <td style={{ padding: '0.75rem 1rem', color: 'var(--color-purple-600)' }}>{r.overtime_hours || 0} hrs</td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <Badge variant={r.status === 'PRESENT' ? 'success' : 'warning'}>{r.status}</Badge>
                  </td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr>
                  <td colSpan={9} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No records found for the selected date and filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardBody>
      </Card>
    </div>
  );
};

export default AttendanceReportsPage;
