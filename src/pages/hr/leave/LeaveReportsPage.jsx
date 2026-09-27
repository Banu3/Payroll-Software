import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Card, CardHeader, CardBody } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Download, FileText, Calendar } from 'lucide-react';
import { api } from '../../../services/api';

export const LeaveReportsPage = () => {
  const [reportType, setReportType] = useState('balances'); // 'balances' | 'lop'
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchReportData();
  }, [reportType]);

  const fetchReportData = async () => {
    setIsLoading(true);
    try {
      if (reportType === 'balances') {
        const res = await api.get('/leave/balances');
        if (res && res.success) setData(res.data);
      } else {
        const res = await api.get('/leave/requests?status=APPROVED');
        if (res && res.success) setData(res.data.filter(r => r.leave_type?.category === 'UNPAID'));
      }
    } catch (err) {
      console.error('Failed to fetch leave report:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const exportCSV = () => {
    if (!data || data.length === 0) return;
    const headers = reportType === 'balances' 
      ? ['Employee ID', 'Name', 'Leave Type', 'Opening', 'Accrued', 'Used', 'Available']
      : ['Employee ID', 'Name', 'Start Date', 'End Date', 'LOP Days', 'Reason'];

    const rows = reportType === 'balances'
      ? data.map(r => [r.employee?.employee_id || '', `"${r.employee?.first_name} ${r.employee?.last_name}"`, r.leave_type?.name || '', r.opening_balance, r.accrued, r.used, r.available])
      : data.map(r => [r.employee?.employee_id || '', `"${r.employee?.first_name} ${r.employee?.last_name}"`, r.start_date, r.end_date, r.duration, `"${r.reason || ''}"`]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Leave_${reportType}_Report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader
        title="Leave & LOP Reports"
        subtitle="Generate and export leave balance summaries and Loss of Pay (LOP) deduction reports"
        actions={
          <Button variant="primary" size="sm" onClick={exportCSV}>
            <Download size={14} style={{ marginRight: '0.375rem' }} />
            Export CSV
          </Button>
        }
      />

      <Card>
        <CardBody style={{ padding: '0.75rem 1rem', display: 'flex', gap: '0.5rem' }}>
          <Button
            variant={reportType === 'balances' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setReportType('balances')}
          >
            Leave Balances Summary
          </Button>
          <Button
            variant={reportType === 'lop' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setReportType('lop')}
          >
            Loss of Pay (LOP) Report
          </Button>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h3 style={{ margin: 0, fontSize: '1.125rem' }}>
            {reportType === 'balances' ? 'Employee Balances Directory' : 'Loss of Pay (LOP) Unpaid Leave Log'}
          </h3>
        </CardHeader>
        <CardBody style={{ padding: 0 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ background: 'var(--bg-main)', borderBottom: '1px solid var(--border-color)' }}>
                {reportType === 'balances' ? (
                  <>
                    <th style={{ padding: '0.75rem 1rem' }}>Employee</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Leave Type</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Opening</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Accrued</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Used</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Available</th>
                  </>
                ) : (
                  <>
                    <th style={{ padding: '0.75rem 1rem' }}>Employee</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Start Date</th>
                    <th style={{ padding: '0.75rem 1rem' }}>End Date</th>
                    <th style={{ padding: '0.75rem 1rem' }}>LOP Days</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Reason</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {reportType === 'balances' ? (
                data.map(r => (
                  <tr key={r.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>{r.employee?.first_name} {r.employee?.last_name}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>{r.leave_type?.name}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>{r.opening_balance}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>{r.accrued}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>{r.used}</td>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--color-emerald-600)' }}>{r.available}</td>
                  </tr>
                ))
              ) : (
                data.map(r => (
                  <tr key={r.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>{r.employee?.first_name} {r.employee?.last_name}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>{r.start_date}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>{r.end_date}</td>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--color-rose-600)' }}>{r.duration} LOP days</td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>{r.reason}</td>
                  </tr>
                ))
              )}
              {data.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No report records available.
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

export default LeaveReportsPage;
