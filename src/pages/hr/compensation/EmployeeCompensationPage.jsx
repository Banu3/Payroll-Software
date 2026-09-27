import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Card, CardHeader, CardBody } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Modal } from '../../../components/ui/Modal';
import { Users, DollarSign, Plus } from 'lucide-react';
import { api } from '../../../services/api';
import { formatCurrency } from '../../../services/financialCalculationService';

export const EmployeeCompensationPage = () => {
  const [employees, setEmployees] = useState([]);
  const [structures, setStructures] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Assign Modal State
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assignForm, setAssignForm] = useState({
    employeeId: '',
    structureId: '',
    annualCtc: 600000,
    effectiveFrom: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchEmployees();
    fetchStructures();
  }, []);

  const fetchEmployees = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/hr/employees?limit=100');
      if (res && res.success) {
        setEmployees(res.data.employees || []);
      }
    } catch (err) {
      console.error('Failed to fetch employees:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStructures = async () => {
    try {
      const res = await api.get('/compensation/structures');
      if (res && res.success) setStructures(res.data);
    } catch (err) {}
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post(`/compensation/employees/${assignForm.employeeId}/assign`, assignForm);
      if (res && res.success) {
        setIsAssignModalOpen(false);
        fetchEmployees();
      }
    } catch (err) {
      alert(err.message || 'Failed to assign salary');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader
        title="Employee Compensation Directory"
        subtitle="Manage employee annual CTC assignments, salary components, and compensation records"
        actions={
          <Button variant="primary" size="sm" onClick={() => setIsAssignModalOpen(true)}>
            <Plus size={14} style={{ marginRight: '0.375rem' }} />
            Assign Salary CTC
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <h3 style={{ margin: 0, fontSize: '1.125rem' }}>Employee CTC & Compensation List</h3>
        </CardHeader>
        <CardBody style={{ padding: 0 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ background: 'var(--bg-main)', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '0.75rem 1rem' }}>Employee</th>
                <th style={{ padding: '0.75rem 1rem' }}>Department</th>
                <th style={{ padding: '0.75rem 1rem' }}>Joining Date</th>
                <th style={{ padding: '0.75rem 1rem' }}>Employment Status</th>
                <th style={{ padding: '0.75rem 1rem' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((e) => (
                <tr key={e.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>
                    {e.first_name} {e.last_name} ({e.employee_id})
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>{e.department?.name || 'Unassigned'}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>{e.joining_date}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <Badge variant={e.employment_status === 'ACTIVE' ? 'success' : 'secondary'}>
                      {e.employment_status}
                    </Badge>
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setAssignForm({ ...assignForm, employeeId: e.id });
                        setIsAssignModalOpen(true);
                      }}
                    >
                      Assign / Edit CTC
                    </Button>
                  </td>
                </tr>
              ))}
              {employees.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No employees found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardBody>
      </Card>

      {/* Assign Modal */}
      <Modal isOpen={isAssignModalOpen} onClose={() => setIsAssignModalOpen(false)} title="Assign Salary CTC Structure">
        <form onSubmit={handleAssignSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Select Employee</label>
            <select
              required
              value={assignForm.employeeId}
              onChange={(e) => setAssignForm({ ...assignForm, employeeId: e.target.value })}
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
            <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Select Structure Template</label>
            <select
              value={assignForm.structureId}
              onChange={(e) => setAssignForm({ ...assignForm, structureId: e.target.value })}
              style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
            >
              <option value="">Default Company Structure</option>
              {structures.map((s) => (
                <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Annual CTC (₹)</label>
              <input
                type="number"
                required
                placeholder="e.g. 600000"
                value={assignForm.annualCtc}
                onChange={(e) => setAssignForm({ ...assignForm, annualCtc: parseFloat(e.target.value) })}
                style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
              />
            </div>

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
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
            <Button variant="outline" type="button" onClick={() => setIsAssignModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Confirm & Assign CTC
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default EmployeeCompensationPage;
