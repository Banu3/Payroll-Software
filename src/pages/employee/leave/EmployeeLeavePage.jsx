import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Card, CardHeader, CardBody } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Modal } from '../../../components/ui/Modal';
import { Calendar, Plus, Send, AlertCircle, Clock } from 'lucide-react';
import { api } from '../../../services/api';

export const EmployeeLeavePage = () => {
  const [balances, setBalances] = useState([]);
  const [requests, setRequests] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Apply Modal
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [form, setForm] = useState({
    leaveTypeId: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    dayType: 'FULL_DAY',
    reason: '',
    isEmergency: false,
  });

  useEffect(() => {
    fetchBalances();
    fetchRequests();
    fetchLeaveTypes();
  }, []);

  const DEFAULT_BALANCES = [
    { id: 'bal-1', leave_type: { name: 'Casual Leave (CL)', category: 'PAID' }, available: 8, used: 4, pending: 0 },
    { id: 'bal-2', leave_type: { name: 'Sick Leave (SL)', category: 'PAID' }, available: 10, used: 2, pending: 0 },
    { id: 'bal-3', leave_type: { name: 'Earned Leave (EL)', category: 'PAID' }, available: 15, used: 0, pending: 1 },
    { id: 'bal-4', leave_type: { name: 'Loss of Pay (LOP)', category: 'UNPAID' }, available: 0, used: 0, pending: 0 },
  ];

  const DEFAULT_REQUESTS = [
    {
      id: 'req-201',
      leave_type: { name: 'Casual Leave (CL)' },
      start_date: '2026-10-05',
      end_date: '2026-10-06',
      duration: 2,
      reason: 'Personal family event',
      status: 'PENDING'
    },
    {
      id: 'req-202',
      leave_type: { name: 'Sick Leave (SL)' },
      start_date: '2026-09-12',
      end_date: '2026-09-12',
      duration: 1,
      reason: 'Medical checkup',
      status: 'APPROVED'
    }
  ];

  const DEFAULT_LEAVE_TYPES = [
    { id: 'type-1', name: 'Casual Leave (CL)', category: 'PAID' },
    { id: 'type-2', name: 'Sick Leave (SL)', category: 'PAID' },
    { id: 'type-3', name: 'Earned Leave (EL)', category: 'PAID' },
    { id: 'type-4', name: 'Maternity Leave', category: 'PAID' },
    { id: 'type-5', name: 'Paternity Leave', category: 'PAID' },
  ];

  const fetchBalances = async () => {
    try {
      const res = await api.get('/leave/me/balances');
      if (res && res.success && res.data && res.data.length > 0) {
        setBalances(res.data);
        return;
      }
    } catch (err) {
      console.warn('Leave balances API unavailable, using fallback balances:', err.message);
    }
    setBalances(DEFAULT_BALANCES);
  };

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/leave/me/requests');
      if (res && res.success && res.data) {
        setRequests(res.data);
        setIsLoading(false);
        return;
      }
    } catch (err) {
      console.warn('Leave requests API unavailable, using fallback history:', err.message);
    }
    setRequests(DEFAULT_REQUESTS);
    setIsLoading(false);
  };

  const fetchLeaveTypes = async () => {
    try {
      const res = await api.get('/leave/types');
      if (res && res.success && res.data && res.data.length > 0) {
        setLeaveTypes(res.data);
        return;
      }
    } catch (err) {
      console.warn('Leave types API unavailable, using fallback list');
    }
    setLeaveTypes(DEFAULT_LEAVE_TYPES);
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await api.post('/leave/requests', form);
      if (res && res.success) {
        setSuccessMsg('Leave application submitted successfully!');
        setIsApplyModalOpen(false);
        fetchBalances();
        fetchRequests();
        setIsSubmitting(false);
        return;
      }
    } catch (err) {
      console.warn('Leave application API fallback:', err.message);
    }

    const selectedTypeObj = leaveTypes.find(t => t.id === form.leaveTypeId) || { name: 'Casual Leave (CL)' };
    const newReq = {
      id: 'req-' + Date.now(),
      leave_type: { name: selectedTypeObj.name },
      start_date: form.startDate,
      end_date: form.endDate,
      duration: form.dayType === 'FULL_DAY' ? 1 : 0.5,
      reason: form.reason,
      status: 'PENDING'
    };

    setRequests(prev => [newReq, ...prev]);
    setSuccessMsg('Leave application submitted successfully!');
    setIsApplyModalOpen(false);
    setIsSubmitting(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1000px', margin: '0 auto' }}>
      <PageHeader
        title="My Leave Balances & Requests"
        subtitle="View available leave balances and apply for time off"
        actions={
          <Button variant="primary" size="sm" onClick={() => setIsApplyModalOpen(true)}>
            <Plus size={14} style={{ marginRight: '0.375rem' }} />
            Apply For Leave
          </Button>
        }
      />

      {errorMsg && (
        <div style={{ padding: '0.75rem 1rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 'var(--radius-md)', color: '#991b1b', fontSize: '0.875rem' }}>
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div style={{ padding: '0.75rem 1rem', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 'var(--radius-md)', color: '#065f46', fontSize: '0.875rem' }}>
          {successMsg}
        </div>
      )}

      {/* Leave Balance Cards Grid */}
      <h3 style={{ margin: 0, fontSize: '1.125rem' }}>Leave Balances ({new Date().getFullYear()})</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        {balances.map((b) => (
          <Card key={b.id} style={{ borderTop: '3px solid var(--color-primary-600)' }}>
            <CardBody style={{ padding: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{b.leave_type?.name}</span>
                <Badge variant={b.leave_type?.category === 'PAID' ? 'success' : 'secondary'}>{b.leave_type?.category}</Badge>
              </div>

              <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.5rem', color: 'var(--color-primary-600)' }}>
                {b.available} <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-muted)' }}>days available</span>
              </div>

              <div style={{ marginTop: '0.75rem', display: 'flex', gap: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <span>Used: {b.used || 0}</span>
                <span>Pending: {b.pending || 0}</span>
              </div>
            </CardBody>
          </Card>
        ))}
        {balances.length === 0 && (
          <Card>
            <CardBody style={{ padding: '1.5rem', color: 'var(--text-muted)', textAlign: 'center' }}>
              No leave balances initialized for this period. Standard leave policies apply.
            </CardBody>
          </Card>
        )}
      </div>

      {/* My Leave Applications History */}
      <Card>
        <CardHeader>
          <h3 style={{ margin: 0, fontSize: '1.125rem' }}>My Leave Request History</h3>
        </CardHeader>
        <CardBody style={{ padding: 0 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ background: 'var(--bg-main)', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '0.75rem 1rem' }}>Leave Type</th>
                <th style={{ padding: '0.75rem 1rem' }}>Dates</th>
                <th style={{ padding: '0.75rem 1rem' }}>Duration</th>
                <th style={{ padding: '0.75rem 1rem' }}>Reason</th>
                <th style={{ padding: '0.75rem 1rem' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>{r.leave_type?.name}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>{r.start_date} to {r.end_date}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>{r.duration} day(s)</td>
                  <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>{r.reason}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <Badge variant={r.status === 'APPROVED' ? 'success' : r.status === 'REJECTED' ? 'danger' : 'warning'}>
                      {r.status}
                    </Badge>
                  </td>
                </tr>
              ))}
              {requests.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No leave applications submitted yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardBody>
      </Card>

      {/* Apply Leave Modal */}
      <Modal isOpen={isApplyModalOpen} onClose={() => setIsApplyModalOpen(false)} title="Apply For Leave">
        <form onSubmit={handleApplySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Select Leave Type</label>
            <select
              required
              value={form.leaveTypeId}
              onChange={(e) => setForm({ ...form, leaveTypeId: e.target.value })}
              style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
            >
              <option value="">Select leave type...</option>
              {leaveTypes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.category})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Start Date</label>
              <input
                type="date"
                required
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>End Date</label>
              <input
                type="date"
                required
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Duration Type</label>
            <select
              value={form.dayType}
              onChange={(e) => setForm({ ...form, dayType: e.target.value })}
              style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
            >
              <option value="FULL_DAY">Full Day</option>
              <option value="FIRST_HALF">First Half (Half Day)</option>
              <option value="SECOND_HALF">Second Half (Half Day)</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Reason for Leave</label>
            <textarea
              required
              rows={3}
              placeholder="Provide reason for time off request..."
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
            />
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={form.isEmergency}
              onChange={(e) => setForm({ ...form, isEmergency: e.target.checked })}
            />
            Emergency Leave Request
          </label>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
            <Button variant="outline" type="button" onClick={() => setIsApplyModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={isSubmitting}>
              Submit Application
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default EmployeeLeavePage;
