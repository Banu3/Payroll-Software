import React, { useState, useEffect } from 'react';
import LeaveSubNav from '../../../components/layout/LeaveSubNav';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Card, CardHeader, CardBody } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Modal } from '../../../components/ui/Modal';
import { Plus, Sliders } from 'lucide-react';
import { api } from '../../../services/api';

export const LeavePoliciesPage = () => {
  const [policies, setPolicies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [form, setForm] = useState({
    name: '',
    description: '',
    effectiveFrom: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/leave/policies');
      if (res && res.success) {
        setPolicies(res.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch policies:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/leave/policies', form);
      if (res && res.success) {
        setIsModalOpen(false);
        fetchPolicies();
      }
    } catch (err) {
      alert(err.message || 'Failed to create policy');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader
        title="Leave Policy Management"
        subtitle="Create custom leave policies and deterministic assignment priority matrices"
        actions={
          <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)}>
            <Plus size={14} style={{ marginRight: '0.375rem' }} />
            Create Leave Policy
          </Button>
        }
      />

      <LeaveSubNav />

      <Card>
        <CardHeader>
          <h3 style={{ margin: 0, fontSize: '1.125rem' }}>Active Company Leave Policies</h3>
        </CardHeader>
        <CardBody style={{ padding: 0 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ background: 'var(--bg-main)', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '0.75rem 1rem' }}>Policy Name</th>
                <th style={{ padding: '0.75rem 1rem' }}>Description</th>
                <th style={{ padding: '0.75rem 1rem' }}>Effective From</th>
                <th style={{ padding: '0.75rem 1rem' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {policies.map((p) => (
                <tr key={p.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>{p.name}</td>
                  <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>{p.description || '—'}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>{p.effective_from}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <Badge variant={p.is_active ? 'success' : 'secondary'}>{p.is_active ? 'Active' : 'Inactive'}</Badge>
                  </td>
                </tr>
              ))}
              {policies.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    Standard company default leave policy active.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardBody>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Leave Policy">
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Policy Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Executive Leave Policy"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Effective From</label>
            <input
              type="date"
              required
              value={form.effectiveFrom}
              onChange={(e) => setForm({ ...form, effectiveFrom: e.target.value })}
              style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Description</label>
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
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

export default LeavePoliciesPage;
