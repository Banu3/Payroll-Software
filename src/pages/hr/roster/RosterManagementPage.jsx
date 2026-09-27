import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Card, CardHeader, CardBody } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Modal } from '../../../components/ui/Modal';
import { CalendarCheck, Users, Copy, Check } from 'lucide-react';
import { api } from '../../../services/api';

export const RosterManagementPage = () => {
  const [rosters, setRosters] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Bulk Roster Modal
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [bulkForm, setBulkForm] = useState({
    shiftId: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    isWeeklyOff: false,
    selectedEmployeeIds: [],
  });

  useEffect(() => {
    fetchRosters();
    fetchShifts();
    fetchEmployees();
  }, []);

  const fetchRosters = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/attendance/rosters');
      if (res && res.success) {
        setRosters(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch rosters:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchShifts = async () => {
    try {
      const res = await api.get('/attendance/shifts');
      if (res && res.success) setShifts(res.data);
    } catch (err) {}
  };

  const fetchEmployees = async () => {
    try {
      const res = await api.get('/hr/employees?limit=100');
      if (res && res.success) setEmployees(res.data.employees || []);
    } catch (err) {}
  };

  const handleBulkSubmit = async () => {
    try {
      const res = await api.post('/attendance/rosters/bulk', {
        employeeIds: bulkForm.selectedEmployeeIds.length > 0 ? bulkForm.selectedEmployeeIds : employees.map(e => e.id),
        shiftId: bulkForm.shiftId,
        startDate: bulkForm.startDate,
        endDate: bulkForm.endDate,
        isWeeklyOff: bulkForm.isWeeklyOff,
      });

      if (res && res.success) {
        setIsBulkModalOpen(false);
        setIsPreviewMode(false);
        fetchRosters();
      }
    } catch (err) {
      alert(err.message || 'Failed to bulk assign roster');
    }
  };

  const toggleSelectAll = () => {
    if (bulkForm.selectedEmployeeIds.length === employees.length) {
      setBulkForm({ ...bulkForm, selectedEmployeeIds: [] });
    } else {
      setBulkForm({ ...bulkForm, selectedEmployeeIds: employees.map(e => e.id) });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader
        title="Roster Management"
        subtitle="Manage employee work schedules, weekly off allocations, and bulk roster assignments"
        actions={
          <Button variant="primary" size="sm" onClick={() => setIsBulkModalOpen(true)}>
            <Users size={14} style={{ marginRight: '0.375rem' }} />
            Bulk Assign Roster
          </Button>
        }
      />

      {/* Roster Table Grid */}
      <Card>
        <CardHeader>
          <h3 style={{ margin: 0, fontSize: '1.125rem' }}>Roster Schedule Overview</h3>
        </CardHeader>
        <CardBody style={{ padding: 0 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ background: 'var(--bg-main)', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '0.75rem 1rem' }}>Employee</th>
                <th style={{ padding: '0.75rem 1rem' }}>Date</th>
                <th style={{ padding: '0.75rem 1rem' }}>Assigned Shift</th>
                <th style={{ padding: '0.75rem 1rem' }}>Weekly Off</th>
              </tr>
            </thead>
            <tbody>
              {rosters.map((r) => (
                <tr key={r.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>
                    {r.employee?.first_name} {r.employee?.last_name} ({r.employee?.employee_id})
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>{r.date}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>{r.shift?.name} ({r.shift?.code})</td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    {r.is_weekly_off ? <Badge variant="secondary">Weekly Off</Badge> : <Badge variant="success">Working Day</Badge>}
                  </td>
                </tr>
              ))}
              {rosters.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No specific roster assignments found. Standard company shifts apply.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardBody>
      </Card>

      {/* Bulk Roster Assignment Modal */}
      <Modal isOpen={isBulkModalOpen} onClose={() => { setIsBulkModalOpen(false); setIsPreviewMode(false); }} title="Bulk Roster Assignment">
        {!isPreviewMode ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Target Shift</label>
              <select
                value={bulkForm.shiftId}
                onChange={(e) => setBulkForm({ ...bulkForm, shiftId: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
              >
                <option value="">Select a shift...</option>
                {shifts.map((s) => (
                  <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Start Date</label>
                <input
                  type="date"
                  value={bulkForm.startDate}
                  onChange={(e) => setBulkForm({ ...bulkForm, startDate: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>End Date</label>
                <input
                  type="date"
                  value={bulkForm.endDate}
                  onChange={(e) => setBulkForm({ ...bulkForm, endDate: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
                />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Select Employees ({bulkForm.selectedEmployeeIds.length} selected)</label>
                <Button size="sm" variant="ghost" type="button" onClick={toggleSelectAll}>
                  {bulkForm.selectedEmployeeIds.length === employees.length ? 'Deselect All' : 'Select All'}
                </Button>
              </div>
              <div style={{ maxHeight: '180px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '0.5rem' }}>
                {employees.map((e) => (
                  <label key={e.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.25rem 0', fontSize: '0.875rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={bulkForm.selectedEmployeeIds.includes(e.id)}
                      onChange={(evt) => {
                        if (evt.target.checked) {
                          setBulkForm({ ...bulkForm, selectedEmployeeIds: [...bulkForm.selectedEmployeeIds, e.id] });
                        } else {
                          setBulkForm({ ...bulkForm, selectedEmployeeIds: bulkForm.selectedEmployeeIds.filter(id => id !== e.id) });
                        }
                      }}
                    />
                    {e.first_name} {e.last_name} ({e.employee_id})
                  </label>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
              <Button variant="outline" type="button" onClick={() => setIsBulkModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="button" onClick={() => setIsPreviewMode(true)}>
                Preview Assignment
              </Button>
            </div>
          </div>
        ) : (
          /* Preview Mode Confirmation Step */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ background: 'var(--bg-main)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
              <h4 style={{ margin: '0 0 0.5rem 0' }}>Confirm Roster Bulk Assignment</h4>
              <p style={{ margin: '0.25rem 0', fontSize: '0.875rem' }}>
                <strong>Employees:</strong> {bulkForm.selectedEmployeeIds.length || employees.length} employees
              </p>
              <p style={{ margin: '0.25rem 0', fontSize: '0.875rem' }}>
                <strong>Period:</strong> {bulkForm.startDate} to {bulkForm.endDate}
              </p>
              <p style={{ margin: '0.25rem 0', fontSize: '0.875rem' }}>
                <strong>Shift:</strong> {shifts.find(s => s.id === bulkForm.shiftId)?.name || 'Default Shift'}
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
              <Button variant="outline" type="button" onClick={() => setIsPreviewMode(false)}>
                Back to Edit
              </Button>
              <Button variant="primary" type="button" onClick={handleBulkSubmit}>
                Confirm Assignment
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default RosterManagementPage;
