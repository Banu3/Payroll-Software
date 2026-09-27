import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Card, CardHeader, CardBody } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Modal } from '../../../components/ui/Modal';
import { Settings, Clock, DollarSign } from 'lucide-react';
import { api } from '../../../services/api';

export const OvertimeManagementPage = () => {
  const [overtimeRecords, setOvertimeRecords] = useState([]);
  const [policy, setPolicy] = useState({
    minOvertimeThresholdMins: 30,
    maxDailyOvertimeHours: 4.0,
    maxMonthlyOvertimeHours: 40.0,
    weekdayRate: 1.5,
    weekendRate: 2.0,
    holidayRate: 2.0,
    requireApproval: true,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  useEffect(() => {
    fetchPolicy();
    fetchOvertimeRecords();
  }, []);

  const fetchPolicy = async () => {
    try {
      const res = await api.get('/attendance/overtime/settings');
      if (res && res.success && res.data) {
        setPolicy({
          minOvertimeThresholdMins: res.data.min_overtime_threshold_mins || 30,
          maxDailyOvertimeHours: res.data.max_daily_overtime_hours || 4.0,
          maxMonthlyOvertimeHours: res.data.max_monthly_overtime_hours || 40.0,
          weekdayRate: res.data.weekday_rate || 1.5,
          weekendRate: res.data.weekend_rate || 2.0,
          holidayRate: res.data.holiday_rate || 2.0,
          requireApproval: res.data.require_approval ?? true,
        });
      }
    } catch (err) {
      console.error('Failed to fetch overtime policy:', err);
    }
  };

  const fetchOvertimeRecords = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/attendance?limit=50&status=PRESENT');
      if (res && res.success) {
        setOvertimeRecords(res.data.filter((r) => r.overtime_hours > 0));
      }
    } catch (err) {
      console.error('Failed to fetch overtime records:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePolicy = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/attendance/overtime/settings', policy);
      if (res && res.success) {
        setIsSettingsModalOpen(false);
        fetchPolicy();
      }
    } catch (err) {
      alert(err.message || 'Failed to update overtime policy');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader
        title="Overtime Management"
        subtitle="Configure company overtime rate multipliers, threshold caps, and approval workflows"
        actions={
          <Button variant="primary" size="sm" onClick={() => setIsSettingsModalOpen(true)}>
            <Settings size={14} style={{ marginRight: '0.375rem' }} />
            Policy Settings
          </Button>
        }
      />

      {/* Policy Summary Banner */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <Card>
          <CardBody style={{ padding: '1rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Weekday Overtime Rate</span>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '0.25rem' }}>{policy.weekdayRate}x</div>
          </CardBody>
        </Card>

        <Card>
          <CardBody style={{ padding: '1rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Weekend Overtime Rate</span>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '0.25rem', color: 'var(--color-purple-600)' }}>{policy.weekendRate}x</div>
          </CardBody>
        </Card>

        <Card>
          <CardBody style={{ padding: '1rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Holiday Overtime Rate</span>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '0.25rem', color: 'var(--color-emerald-600)' }}>{policy.holidayRate}x</div>
          </CardBody>
        </Card>

        <Card>
          <CardBody style={{ padding: '1rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Max Daily Cap</span>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '0.25rem' }}>{policy.maxDailyOvertimeHours} hrs</div>
          </CardBody>
        </Card>
      </div>

      {/* Overtime Records Table */}
      <Card>
        <CardHeader>
          <h3 style={{ margin: 0, fontSize: '1.125rem' }}>Employee Overtime Log</h3>
        </CardHeader>
        <CardBody style={{ padding: 0 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ background: 'var(--bg-main)', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '0.75rem 1rem' }}>Employee</th>
                <th style={{ padding: '0.75rem 1rem' }}>Date</th>
                <th style={{ padding: '0.75rem 1rem' }}>Net Hours</th>
                <th style={{ padding: '0.75rem 1rem' }}>Overtime Hours</th>
                <th style={{ padding: '0.75rem 1rem' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {overtimeRecords.map((r) => (
                <tr key={r.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>
                    {r.employee?.first_name} {r.employee?.last_name} ({r.employee?.employee_id})
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>{r.date}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>{r.net_hours} hrs</td>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--color-purple-600)' }}>
                    {r.overtime_hours} hrs
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <Badge variant="purple">Approved OT</Badge>
                  </td>
                </tr>
              ))}
              {overtimeRecords.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No overtime records found in the current period.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardBody>
      </Card>

      {/* Settings Modal */}
      <Modal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} title="Configure Overtime Policy">
        <form onSubmit={handleSavePolicy} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Min Threshold (Mins)</label>
              <input
                type="number"
                value={policy.minOvertimeThresholdMins}
                onChange={(e) => setPolicy({ ...policy, minOvertimeThresholdMins: parseInt(e.target.value, 10) })}
                style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Max Daily Cap (Hours)</label>
              <input
                type="number"
                step="0.5"
                value={policy.maxDailyOvertimeHours}
                onChange={(e) => setPolicy({ ...policy, maxDailyOvertimeHours: parseFloat(e.target.value) })}
                style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Weekday Rate Multiplier</label>
              <input
                type="number"
                step="0.1"
                value={policy.weekdayRate}
                onChange={(e) => setPolicy({ ...policy, weekdayRate: parseFloat(e.target.value) })}
                style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Weekend Rate Multiplier</label>
              <input
                type="number"
                step="0.1"
                value={policy.weekendRate}
                onChange={(e) => setPolicy({ ...policy, weekendRate: parseFloat(e.target.value) })}
                style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
            <Button variant="outline" type="button" onClick={() => setIsSettingsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Policy
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default OvertimeManagementPage;
