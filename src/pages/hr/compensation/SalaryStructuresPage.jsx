import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Card, CardHeader, CardBody } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Modal } from '../../../components/ui/Modal';
import { Plus, Layers } from 'lucide-react';
import { api } from '../../../services/api';

export const SalaryStructuresPage = () => {
  const [structures, setStructures] = useState([]);
  const [components, setComponents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [form, setForm] = useState({
    name: '',
    code: '',
    description: '',
    effectiveFrom: new Date().toISOString().split('T')[0],
    selectedComponents: [],
  });

  useEffect(() => {
    fetchStructures();
    fetchComponents();
  }, []);

  const fetchStructures = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/compensation/structures');
      if (res && res.success) {
        setStructures(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch structures:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchComponents = async () => {
    try {
      const res = await api.get('/compensation/components');
      if (res && res.success) setComponents(res.data);
    } catch (err) {}
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: form.name,
        code: form.code,
        description: form.description,
        effectiveFrom: form.effectiveFrom,
        components: components.slice(0, 3).map((c, i) => ({
          componentId: c.id,
          calculationMethod: c.calculation_method,
          value: c.value || 0,
          percentage: c.percentage || 0,
          sequenceOrder: i + 1,
        })),
      };

      const res = await api.post('/compensation/structures', payload);
      if (res && res.success) {
        setIsModalOpen(false);
        fetchStructures();
      }
    } catch (err) {
      alert(err.message || 'Failed to create structure');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader
        title="Salary Structures"
        subtitle="Design versioned, reusable CTC breakdown templates for departments and designations"
        actions={
          <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)}>
            <Plus size={14} style={{ marginRight: '0.375rem' }} />
            Create Structure Template
          </Button>
        }
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
        {structures.map((s) => (
          <Card key={s.id} style={{ borderTop: '3px solid var(--color-primary-600)' }}>
            <CardBody style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.125rem' }}>{s.name}</h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Code: {s.code} (v{s.version})</span>
                </div>
                <Badge variant={s.status === 'ACTIVE' ? 'success' : 'secondary'}>{s.status}</Badge>
              </div>

              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
                {s.description || 'Standard CTC salary breakdown template'}
              </p>

              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
                Effective From: {s.effective_from}
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Salary Structure Template">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Structure Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Standard Executive CTC Structure"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Structure Code</label>
              <input
                type="text"
                required
                placeholder="e.g. CTC-EXEC"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
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
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Structure
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SalaryStructuresPage;
