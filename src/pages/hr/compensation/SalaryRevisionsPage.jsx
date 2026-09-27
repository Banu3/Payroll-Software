import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Card, CardHeader, CardBody } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Modal } from '../../../components/ui/Modal';
import { Plus, Check, X, TrendingUp } from 'lucide-react';
import { api } from '../../../services/api';
import { formatCurrency } from '../../../services/financialCalculationService';

export const SalaryRevisionsPage = () => {
  const [revisions, setRevisions] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [form, setForm] = useState({
    employeeId: '',
    proposedCtc: 700000,
    effectiveDate: new Date().toISOString().split('T')[0],
    revisionType: 'ANNUAL_INCREMENT',
    reason: '',
    comments: '',
  });

  useEffect(() => {
    fetchRevisions();
    fetchEmployees();
  }, []);

  const fetchRevisions = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/compensation/revisions');
      if (res && res.success) {
        setRevisions(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch revisions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await api.get('/hr/employees?limit=100');
      if (res && res.success) setEmployees(res.data.employees || []);
    } catch (err) {}
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/compensation/revisions', form);
      if (res && res.success) {
        setIsModalOpen(false);
        fetchRevisions();
      }
    } catch (err) {
      alert(err.message || 'Failed to submit revision');
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.post(`/compensation/revisions/${id}/approve`, {});
      fetchRevisions();
    } catch (err) {
      alert(err.message || 'Approval failed');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader
        title="Salary Revision Workflow"
        subtitle="Submit, review, and approve annual increments, promotions, and probation salary revisions"
        actions={
          <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)}>
            <Plus size={14} style={{ marginRight: '0.375rem' }} />
            Create Salary Revision Request
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <h3 style={{ margin: 0, fontSize: '1.125rem' }}>Salary Revisions Queue</h3>
        </CardHeader>
        <CardBody style={{ padding: 0 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ background: 'var(--bg-main)', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '0.75rem 1rem' }}>Employee</th>
                <th style={{ padding: '0.75rem 1rem' }}>Revision Type</th>
                <th style={{ padding: '0.75rem 1rem' }}>Current CTC</th>
                <th style={{ padding: '0.75rem 1rem' }}>Proposed CTC</th>
                <th style={{ padding: '0.75rem 1rem' }}>Increase %</th>
                <th style={{ padding: '0.75rem 1rem' }}>Effective Date</th>
                <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                <th style={{ padding: '0.75rem 1rem' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {revisions.map((r) => (
                <tr key={r.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>
                    {r.employee?.first_name} {r.employee?.last_name} ({r.employee?.employee_id})
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>{r.revision_type}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>{formatCurrency(r.current_ctc)}</td>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--color-emerald-600)' }}>
                    {formatCurrency(r.proposed_ctc)}
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>+{r.percentage_increase}%</td>
                  <td style={{ padding: '0.75rem 1rem' }}>{r.effective_date}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <Badge variant={r.status === 'APPROVED' ? 'success' : r.status === 'REJECTED' ? 'danger' : 'warning'}>
                      {r.status}
                    </Badge>
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    {r.status === 'PENDING_APPROVAL' && (
                      <Button
                        size="sm"
                        variant="primary"
                        style={{ background: 'var(--color-emerald-600)', borderColor: 'var(--color-emerald-600)' }}
                        onClick={() => handleApprove(r.id)}
                      >
                        <Check size={14} style={{ marginRight: '0.25rem' }} /> Approve
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
              {revisions.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No salary revision requests recorded.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardBody>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Salary Revision Request">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Select Employee</label>
            <select
              required
              value={form.employeeId}
              onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Proposed Annual CTC (₹)</label>
              <input
                type="number"
                required
                value={form.proposedCtc}
                onChange={(e) => setForm({ ...form, proposedCtc: parseFloat(e.target.value) })}
                style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Revision Type</label>
              <select
                value={form.revisionType}
                onChange={(e) => setForm({ ...form, revisionType: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
              >
                <option value="ANNUAL_INCREMENT">Annual Increment</option>
                <option value="PROMOTION">Promotion</option>
                <option value="PERFORMANCE_REVISION">Performance Revision</option>
                <option value="MARKET_ADJUSTMENT">Market Adjustment</option>
                <option value="PROBATION_COMPLETION">Probation Completion</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Effective Date</label>
            <input
              type="date"
              required
              value={form.effectiveDate}
              onChange={(e) => setForm({ ...form, effectiveDate: e.target.value })}
              style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Reason for Revision</label>
            <textarea
              required
              rows={2}
              placeholder="e.g. Excellent annual appraisal performance..."
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Submit Revision
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SalaryRevisionsPage;
