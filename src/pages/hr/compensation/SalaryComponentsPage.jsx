import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Card, CardHeader, CardBody } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Modal } from '../../../components/ui/Modal';
import { Plus, Settings } from 'lucide-react';
import { api } from '../../../services/api';

export const SalaryComponentsPage = () => {
  const [components, setComponents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [form, setForm] = useState({
    name: '',
    code: '',
    type: 'EARNING',
    category: 'ALLOWANCE',
    calculationMethod: 'FIXED_AMOUNT',
    value: 0.0,
    percentage: 0.0,
    frequency: 'MONTHLY',
    isTaxable: true,
    isStatutory: false,
    isActive: true,
    description: '',
  });

  useEffect(() => {
    fetchComponents();
  }, []);

  const fetchComponents = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/compensation/components');
      if (res && res.success) {
        setComponents(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch components:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/compensation/components', form);
      if (res && res.success) {
        setIsModalOpen(false);
        fetchComponents();
        setForm({
          name: '',
          code: '',
          type: 'EARNING',
          category: 'ALLOWANCE',
          calculationMethod: 'FIXED_AMOUNT',
          value: 0.0,
          percentage: 0.0,
          frequency: 'MONTHLY',
          isTaxable: true,
          isStatutory: false,
          isActive: true,
          description: '',
        });
      }
    } catch (err) {
      alert(err.message || 'Failed to create component');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader
        title="Salary Component Library"
        subtitle="Configure reusable earnings, deductions, employer contributions, and statutory components"
        actions={
          <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)}>
            <Plus size={14} style={{ marginRight: '0.375rem' }} />
            Create Salary Component
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <h3 style={{ margin: 0, fontSize: '1.125rem' }}>Master Salary Components</h3>
        </CardHeader>
        <CardBody style={{ padding: 0 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ background: 'var(--bg-main)', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '0.75rem 1rem' }}>Component Name</th>
                <th style={{ padding: '0.75rem 1rem' }}>Code</th>
                <th style={{ padding: '0.75rem 1rem' }}>Type</th>
                <th style={{ padding: '0.75rem 1rem' }}>Calculation Method</th>
                <th style={{ padding: '0.75rem 1rem' }}>Taxable</th>
                <th style={{ padding: '0.75rem 1rem' }}>Statutory</th>
                <th style={{ padding: '0.75rem 1rem' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {components.map((c) => (
                <tr key={c.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>{c.name}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>{c.code}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <Badge variant={c.type === 'EARNING' ? 'success' : c.type === 'DEDUCTION' ? 'danger' : 'purple'}>
                      {c.type}
                    </Badge>
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>{c.calculation_method}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>{c.is_taxable ? 'Yes' : 'No'}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>{c.is_statutory ? 'Yes' : 'No'}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <Badge variant={c.is_active ? 'success' : 'secondary'}>{c.is_active ? 'Active' : 'Inactive'}</Badge>
                  </td>
                </tr>
              ))}
              {components.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No custom components created yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardBody>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Salary Component">
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Component Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Special Allowance"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Component Code</label>
              <input
                type="text"
                required
                placeholder="e.g. SA"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
              >
                <option value="EARNING">EARNING</option>
                <option value="DEDUCTION">DEDUCTION</option>
                <option value="EMPLOYER_CONTRIBUTION">EMPLOYER CONTRIBUTION</option>
                <option value="REIMBURSEMENT">REIMBURSEMENT</option>
                <option value="BENEFIT">BENEFIT</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Calculation Method</label>
              <select
                value={form.calculationMethod}
                onChange={(e) => setForm({ ...form, calculationMethod: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
              >
                <option value="FIXED_AMOUNT">FIXED AMOUNT</option>
                <option value="PERCENTAGE_OF_BASIC">PERCENTAGE OF BASIC</option>
                <option value="PERCENTAGE_OF_GROSS">PERCENTAGE OF GROSS</option>
                <option value="PERCENTAGE_OF_CTC">PERCENTAGE OF CTC</option>
                <option value="FORMULA">FORMULA</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Component
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SalaryComponentsPage;
