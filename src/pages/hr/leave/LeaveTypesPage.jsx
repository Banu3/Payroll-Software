import React, { useState, useEffect } from 'react';
import LeaveSubNav from '../../../components/layout/LeaveSubNav';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Card, CardHeader, CardBody } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Modal } from '../../../components/ui/Modal';
import { Plus, Settings, Check, X } from 'lucide-react';
import { api } from '../../../services/api';

export const LeaveTypesPage = () => {
  const [types, setTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [form, setForm] = useState({
    name: '',
    code: '',
    description: '',
    category: 'PAID',
    annualAllowance: 12.0,
    accrualFrequency: 'MONTHLY',
    allowCarryForward: true,
    maxCarryForward: 5.0,
    allowEncashment: false,
    maxEncashment: 0.0,
    allowHalfDay: true,
    allowNegativeBalance: false,
    maxConsecutiveDays: 10,
    minNoticeDays: 0,
    documentRequired: false,
    documentRequiredAfterDays: 3,
    probationEligibility: true,
    isActive: true,
  });

  useEffect(() => {
    fetchTypes();
  }, []);

  const fetchTypes = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/leave/types');
      if (res && res.success) {
        setTypes(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch leave types:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/leave/types', form);
      if (res && res.success) {
        setIsModalOpen(false);
        fetchTypes();
      }
    } catch (err) {
      alert(err.message || 'Failed to create leave type');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader
        title="Leave Types Configuration"
        subtitle="Configure company leave categories, annual allowances, accrual rules, and carry-forward limits"
        actions={
          <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)}>
            <Plus size={14} style={{ marginRight: '0.375rem' }} />
            Create Leave Type
          </Button>
        }
      />

      <LeaveSubNav />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
        {types.map((t) => (
          <Card key={t.id} style={{ borderTop: '3px solid var(--color-primary-600)' }}>
            <CardBody style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.125rem' }}>{t.name}</h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Code: {t.code}</span>
                </div>
                <Badge variant={t.category === 'PAID' ? 'success' : 'secondary'}>{t.category}</Badge>
              </div>

              <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Annual Allowance:</span>
                  <span style={{ fontWeight: 700 }}>{t.annual_allowance} days</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Accrual Frequency:</span>
                  <span>{t.accrual_frequency}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Max Carry Forward:</span>
                  <span>{t.allow_carry_forward ? `${t.max_carry_forward} days` : 'Disabled'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Document Required:</span>
                  <span>{t.document_required ? `After ${t.document_required_after_days} days` : 'No'}</span>
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Company Leave Type">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Leave Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Earned Leave"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Leave Code</label>
              <input
                type="text"
                required
                placeholder="e.g. EL"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
              >
                <option value="PAID">PAID</option>
                <option value="UNPAID">UNPAID (LOP)</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Annual Allowance (Days)</label>
              <input
                type="number"
                step="0.5"
                value={form.annualAllowance}
                onChange={(e) => setForm({ ...form, annualAllowance: parseFloat(e.target.value) })}
                style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Leave Type
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default LeaveTypesPage;
