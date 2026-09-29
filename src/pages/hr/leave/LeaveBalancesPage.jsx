import React, { useState, useEffect } from 'react';
import LeaveSubNav from '../../../components/layout/LeaveSubNav';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Card, CardHeader, CardBody } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Modal } from '../../../components/ui/Modal';
import { Sliders, Plus, History } from 'lucide-react';
import { api } from '../../../services/api';

export const LeaveBalancesPage = () => {
  const [balances, setBalances] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Manual Adjustment Modal
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [adjustForm, setAdjustForm] = useState({
    employeeId: '',
    leaveTypeId: '',
    adjustmentDays: 1.0,
    reason: '',
  });

  useEffect(() => {
    fetchBalances();
    fetchLeaveTypes();
    fetchEmployees();
  }, []);

  const fetchBalances = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/leave/balances');
      if (res && res.success) {
        setBalances(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch balances:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLeaveTypes = async () => {
    try {
      const res = await api.get('/leave/types');
      if (res && res.success) setLeaveTypes(res.data);
    } catch (err) {}
  };

  const fetchEmployees = async () => {
    try {
      const res = await api.get('/hr/employees?limit=100');
      if (res && res.success) setEmployees(res.data.employees || []);
    } catch (err) {}
  };

  const handleAdjustSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/leave/adjustments', adjustForm);
      if (res && res.success) {
        setIsAdjustModalOpen(false);
        fetchBalances();
        setAdjustForm({
          employeeId: '',
          leaveTypeId: '',
          adjustmentDays: 1.0,
          reason: '',
        });
      }
    } catch (err) {
      alert(err.message || 'Adjustment failed');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader
        title="Leave Balances & Ledgers"
        subtitle="View real employee leave balance accounts and execute manual adjustments with ledger traceability"
        actions={
          <Button variant="primary" size="sm" onClick={() => setIsAdjustModalOpen(true)}>
            <Sliders size={14} style={{ marginRight: '0.375rem' }} />
            Manual Balance Adjustment
          </Button>
        }
      />

      <LeaveSubNav />

      <Card>
        <CardHeader>
          <h3 style={{ margin: 0, fontSize: '1.125rem' }}>Employee Leave Balance Accounts ({new Date().getFullYear()})</h3>
        </CardHeader>
        <CardBody style={{ padding: 0 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ background: 'var(--bg-main)', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '0.75rem 1rem' }}>Employee</th>
                <th style={{ padding: '0.75rem 1rem' }}>Leave Type</th>
                <th style={{ padding: '0.75rem 1rem' }}>Opening</th>
                <th style={{ padding: '0.75rem 1rem' }}>Accrued</th>
                <th style={{ padding: '0.75rem 1rem' }}>Used</th>
                <th style={{ padding: '0.75rem 1rem' }}>Adjusted</th>
                <th style={{ padding: '0.75rem 1rem' }}>Available Balance</th>
              </tr>
            </thead>
            <tbody>
              {balances.map((b) => (
                <tr key={b.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>
                    {b.employee?.first_name} {b.employee?.last_name} ({b.employee?.employee_id})
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>{b.leave_type?.name}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>{b.opening_balance}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>{b.accrued}</td>
                  <td style={{ padding: '0.75rem 1rem', color: 'var(--color-rose-600)' }}>{b.used}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>{b.adjusted || 0}</td>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 800, color: 'var(--color-emerald-600)' }}>
                    {b.available} days
                  </td>
                </tr>
              ))}
              {balances.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No balance records found for the current period.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardBody>
      </Card>

      {/* Adjustment Modal */}
      <Modal isOpen={isAdjustModalOpen} onClose={() => setIsAdjustModalOpen(false)} title="Manual Leave Balance Adjustment">
        <form onSubmit={handleAdjustSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Select Employee</label>
            <select
              required
              value={adjustForm.employeeId}
              onChange={(e) => setAdjustForm({ ...adjustForm, employeeId: e.target.value })}
              style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
            >
              <option value="">Select employee...</option>
              {employees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.first_name} {e.last_name} ({e.employee_id})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Select Leave Type</label>
            <select
              required
              value={adjustForm.leaveTypeId}
              onChange={(e) => setAdjustForm({ ...adjustForm, leaveTypeId: e.target.value })}
              style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
            >
              <option value="">Select leave type...</option>
              {leaveTypes.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Adjustment (+ to add, - to deduct)</label>
            <input
              type="number"
              step="0.5"
              required
              placeholder="e.g. +2.0 or -1.0"
              value={adjustForm.adjustmentDays}
              onChange={(e) => setAdjustForm({ ...adjustForm, adjustmentDays: parseFloat(e.target.value) })}
              style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Reason for Ledger Entry</label>
            <textarea
              required
              rows={2}
              placeholder="Audit reason for manual adjustment..."
              value={adjustForm.reason}
              onChange={(e) => setAdjustForm({ ...adjustForm, reason: e.target.value })}
              style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
            <Button variant="outline" type="button" onClick={() => setIsAdjustModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Execute Adjustment
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default LeaveBalancesPage;
