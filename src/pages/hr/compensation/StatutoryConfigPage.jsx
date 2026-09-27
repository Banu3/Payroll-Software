import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Card, CardHeader, CardBody } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { ShieldCheck, Save } from 'lucide-react';
import { api } from '../../../services/api';

export const StatutoryConfigPage = () => {
  const [config, setConfig] = useState({
    pf: { is_enabled: true, employee_contribution_pct: 12.0, employer_contribution_pct: 12.0, wage_ceiling: 15000 },
    esi: { is_enabled: true, employee_contribution_pct: 0.75, employer_contribution_pct: 3.25, eligibility_wage_threshold: 21000 },
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetchStatutory();
  }, []);

  const fetchStatutory = async () => {
    try {
      const res = await api.get('/compensation/statutory');
      if (res && res.success) {
        setConfig(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch statutory config:', err);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMsg('');
    try {
      const res = await api.put('/compensation/statutory', config);
      if (res && res.success) {
        setMsg('Statutory configurations updated successfully!');
      }
    } catch (err) {
      setMsg(err.message || 'Update failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '900px', margin: '0 auto' }}>
      <PageHeader
        title="Statutory PF & ESI Configuration"
        subtitle="Configure company Provident Fund (PF), Employee State Insurance (ESI), and wage ceilings"
      />

      {msg && (
        <div style={{ padding: '0.75rem 1rem', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 'var(--radius-md)', color: '#065f46', fontSize: '0.875rem' }}>
          {msg}
        </div>
      )}

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* PF Configuration Card */}
        <Card>
          <CardHeader>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.125rem' }}>Provident Fund (PF) Settings</h3>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={config.pf.is_enabled}
                  onChange={(e) => setConfig({ ...config, pf: { ...config.pf, is_enabled: e.target.checked } })}
                />
                PF Deduction Enabled
              </label>
            </div>
          </CardHeader>
          <CardBody style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Employee Contribution %</label>
                <input
                  type="number"
                  step="0.1"
                  value={config.pf.employee_contribution_pct}
                  onChange={(e) => setConfig({ ...config, pf: { ...config.pf, employee_contribution_pct: parseFloat(e.target.value) } })}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Employer Contribution %</label>
                <input
                  type="number"
                  step="0.1"
                  value={config.pf.employer_contribution_pct}
                  onChange={(e) => setConfig({ ...config, pf: { ...config.pf, employer_contribution_pct: parseFloat(e.target.value) } })}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>PF Wage Ceiling (₹)</label>
                <input
                  type="number"
                  value={config.pf.wage_ceiling}
                  onChange={(e) => setConfig({ ...config, pf: { ...config.pf, wage_ceiling: parseFloat(e.target.value) } })}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
                />
              </div>
            </div>
          </CardBody>
        </Card>

        {/* ESI Configuration Card */}
        <Card>
          <CardHeader>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.125rem' }}>Employee State Insurance (ESI) Settings</h3>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={config.esi.is_enabled}
                  onChange={(e) => setConfig({ ...config, esi: { ...config.esi, is_enabled: e.target.checked } })}
                />
                ESI Deduction Enabled
              </label>
            </div>
          </CardHeader>
          <CardBody style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Employee Contribution %</label>
                <input
                  type="number"
                  step="0.05"
                  value={config.esi.employee_contribution_pct}
                  onChange={(e) => setConfig({ ...config, esi: { ...config.esi, employee_contribution_pct: parseFloat(e.target.value) } })}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Employer Contribution %</label>
                <input
                  type="number"
                  step="0.05"
                  value={config.esi.employer_contribution_pct}
                  onChange={(e) => setConfig({ ...config, esi: { ...config.esi, employer_contribution_pct: parseFloat(e.target.value) } })}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Eligibility Wage Limit (₹)</label>
                <input
                  type="number"
                  value={config.esi.eligibility_wage_threshold}
                  onChange={(e) => setConfig({ ...config, esi: { ...config.esi, eligibility_wage_threshold: parseFloat(e.target.value) } })}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
                />
              </div>
            </div>
          </CardBody>
        </Card>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="primary" type="submit" disabled={isSubmitting}>
            <Save size={16} style={{ marginRight: '0.375rem' }} /> Save Statutory Rules
          </Button>
        </div>
      </form>
    </div>
  );
};

export default StatutoryConfigPage;
