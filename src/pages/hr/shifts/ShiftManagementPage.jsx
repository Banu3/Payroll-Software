import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Card, CardHeader, CardBody } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Modal } from '../../../components/ui/Modal';
import { Clock, Plus, Users, Check, Edit2, ShieldAlert } from 'lucide-react';
import { api } from '../../../services/api';

export const ShiftManagementPage = () => {
  const [shifts, setShifts] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal states
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  const [shiftForm, setShiftForm] = useState({
    name: '',
    code: '',
    startTime: '09:00',
    endTime: '18:00',
    gracePeriodMins: 15,
    minWorkingHours: 8.0,
    breakDurationMins: 60,
    overtimeThresholdHours: 8.0,
    isNightShift: false,
    isCrossMidnight: false,
  });

  const [assignForm, setAssignForm] = useState({
    shiftId: '',
    effectiveFrom: new Date().toISOString().split('T')[0],
    effectiveTo: '',
    departmentId: '',
    branchId: '',
  });

  useEffect(() => {
    fetchShifts();
    fetchAssignments();
  }, []);

  const fetchShifts = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/attendance/shifts');
      if (res && res.success) {
        setShifts(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch shifts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAssignments = async () => {
    try {
      const res = await api.get('/attendance/shift-assignments');
      if (res && res.success) {
        setAssignments(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch shift assignments:', err);
    }
  };

  const handleCreateShift = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/attendance/shifts', shiftForm);
      if (res && res.success) {
        setIsShiftModalOpen(false);
        fetchShifts();
        setShiftForm({
          name: '',
          code: '',
          startTime: '09:00',
          endTime: '18:00',
          gracePeriodMins: 15,
          minWorkingHours: 8.0,
          breakDurationMins: 60,
          overtimeThresholdHours: 8.0,
          isNightShift: false,
          isCrossMidnight: false,
        });
      }
    } catch (err) {
      alert(err.message || 'Failed to create shift');
    }
  };

  const handleAssignShift = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/attendance/shift-assignments', assignForm);
      if (res && res.success) {
        setIsAssignModalOpen(false);
        fetchAssignments();
      }
    } catch (err) {
      alert(err.message || 'Failed to assign shift');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader
        title="Shift Management"
        subtitle="Configure work shifts, cross-midnight timings, grace periods, and shift assignments"
        actions={
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button variant="outline" size="sm" onClick={() => setIsAssignModalOpen(true)}>
              <Users size={14} style={{ marginRight: '0.375rem' }} />
              Assign Shift
            </Button>
            <Button variant="primary" size="sm" onClick={() => setIsShiftModalOpen(true)}>
              <Plus size={14} style={{ marginRight: '0.375rem' }} />
              Create Shift
            </Button>
          </div>
        }
      />

      {/* Shifts List Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
        {shifts.map((s) => (
          <Card key={s.id} style={{ borderTop: '3px solid var(--color-primary-600)' }}>
            <CardBody style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.125rem' }}>{s.name}</h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Code: {s.code}</span>
                </div>
                {s.is_cross_midnight ? (
                  <Badge variant="purple">Cross Midnight</Badge>
                ) : s.is_night_shift ? (
                  <Badge variant="secondary">Night Shift</Badge>
                ) : (
                  <Badge variant="success">Day Shift</Badge>
                )}
              </div>

              <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Timings:</span>
                  <span style={{ fontWeight: 600 }}>{s.start_time} – {s.end_time}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Grace Period:</span>
                  <span>{s.grace_period_mins} mins</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Min Working Hours:</span>
                  <span>{s.min_working_hours} hrs</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>OT Threshold:</span>
                  <span>{s.overtime_threshold_hours} hrs</span>
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Active Shift Assignments Table */}
      <Card>
        <CardHeader>
          <h3 style={{ margin: 0, fontSize: '1.125rem' }}>Active Shift Assignments</h3>
        </CardHeader>
        <CardBody style={{ padding: 0 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ background: 'var(--bg-main)', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '0.75rem 1rem' }}>Employee</th>
                <th style={{ padding: '0.75rem 1rem' }}>Shift</th>
                <th style={{ padding: '0.75rem 1rem' }}>Effective From</th>
                <th style={{ padding: '0.75rem 1rem' }}>Effective To</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map((a) => (
                <tr key={a.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>
                    {a.employee?.first_name} {a.employee?.last_name} ({a.employee?.employee_id})
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>{a.shift?.name} ({a.shift?.code})</td>
                  <td style={{ padding: '0.75rem 1rem' }}>{a.effective_from}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>{a.effective_to || 'Ongoing'}</td>
                </tr>
              ))}
              {assignments.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No custom shift assignments found. Employees use company default shift.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardBody>
      </Card>

      {/* Create Shift Modal */}
      <Modal isOpen={isShiftModalOpen} onClose={() => setIsShiftModalOpen(false)} title="Create New Work Shift">
        <form onSubmit={handleCreateShift} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Shift Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Morning Shift"
                value={shiftForm.name}
                onChange={(e) => setShiftForm({ ...shiftForm, name: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Shift Code</label>
              <input
                type="text"
                required
                placeholder="e.g. S-GEN"
                value={shiftForm.code}
                onChange={(e) => setShiftForm({ ...shiftForm, code: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Start Time</label>
              <input
                type="time"
                required
                value={shiftForm.startTime}
                onChange={(e) => setShiftForm({ ...shiftForm, startTime: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>End Time</label>
              <input
                type="time"
                required
                value={shiftForm.endTime}
                onChange={(e) => setShiftForm({ ...shiftForm, endTime: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Grace Period (Mins)</label>
              <input
                type="number"
                value={shiftForm.gracePeriodMins}
                onChange={(e) => setShiftForm({ ...shiftForm, gracePeriodMins: parseInt(e.target.value, 10) })}
                style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Min Working Hours</label>
              <input
                type="number"
                step="0.5"
                value={shiftForm.minWorkingHours}
                onChange={(e) => setShiftForm({ ...shiftForm, minWorkingHours: parseFloat(e.target.value) })}
                style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={shiftForm.isNightShift}
                onChange={(e) => setShiftForm({ ...shiftForm, isNightShift: e.target.checked })}
              />
              Night Shift
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={shiftForm.isCrossMidnight}
                onChange={(e) => setShiftForm({ ...shiftForm, isCrossMidnight: e.target.checked })}
              />
              Cross Midnight (e.g. 22:00 to 07:00 next day)
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
            <Button variant="outline" type="button" onClick={() => setIsShiftModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Shift
            </Button>
          </div>
        </form>
      </Modal>

      {/* Assign Shift Modal */}
      <Modal isOpen={isAssignModalOpen} onClose={() => setIsAssignModalOpen(false)} title="Assign Shift to Employees">
        <form onSubmit={handleAssignShift} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Select Shift</label>
            <select
              required
              value={assignForm.shiftId}
              onChange={(e) => setAssignForm({ ...assignForm, shiftId: e.target.value })}
              style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
            >
              <option value="">Select a shift...</option>
              {shifts.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.start_time} - {s.end_time})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Effective From</label>
              <input
                type="date"
                required
                value={assignForm.effectiveFrom}
                onChange={(e) => setAssignForm({ ...assignForm, effectiveFrom: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Effective To (Optional)</label>
              <input
                type="date"
                value={assignForm.effectiveTo}
                onChange={(e) => setAssignForm({ ...assignForm, effectiveTo: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
            <Button variant="outline" type="button" onClick={() => setIsAssignModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Assign Shift
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ShiftManagementPage;
