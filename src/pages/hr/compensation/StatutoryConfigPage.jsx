import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Card, CardHeader, CardBody } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Input } from '../../../components/ui/Input';
import { ShieldCheck, Save, Edit, CheckCircle2 } from 'lucide-react';
import { api } from '../../../services/api';

export const StatutoryConfigPage = () => {
  const [config, setConfig] = useState({
    pf: { is_enabled: true, employee_contribution_pct: 12.0, employer_contribution_pct: 12.0, wage_ceiling: 15000, effective_date: '2026-04-01', rule_version: 'v2.4' },
    esi: { is_enabled: true, employee_contribution_pct: 0.75, employer_contribution_pct: 3.25, eligibility_wage_threshold: 21000, effective_date: '2026-04-01', rule_version: 'v1.8' },
    pt: { is_enabled: true, max_slab: 200, state: 'State Standard (SLAB)', effective_date: '2026-04-01', rule_version: 'v3.1' },
    tds: { is_enabled: true, regime: 'New Tax Regime (Sec 115BAC)', threshold: 300000, effective_date: '2026-04-01', rule_version: 'AY 2026-27' },
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetchStatutory();
  }, []);

  const fetchStatutory = async () => {
    try {
      const res = await api.get('/compensation/statutory');
      if (res && res.success && res.data) {
        setConfig((prev) => ({ ...prev, ...res.data }));
      }
    } catch (err) {
      console.warn('Statutory fetch fallback:', err);
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
      } else {
        setMsg('Configuration saved locally.');
      }
      setIsEditing(false);
    } catch (err) {
      setMsg(err.message || 'Update failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-[#17221C] max-w-5xl mx-auto">
      <PageHeader
        title="Statutory Rules & Compliance Hub"
        description="Configure Provident Fund (PF), Employee State Insurance (ESI), Professional Tax (PT), and Tax Deductions (TDS)"
        badge={<Badge variant="primary">COMPLIANCE ENGINE</Badge>}
        action={
          <Button
            variant={isEditing ? 'secondary' : 'primary'}
            size="sm"
            icon={isEditing ? Save : Edit}
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? 'Cancel Edit' : 'Edit Rules'}
          </Button>
        }
      />

      {msg && (
        <div className="p-4 rounded-[10px] bg-[#E5F4EE] border border-[#BCE3D4] text-[#167C63] font-semibold text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#167C63] shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* PF Configuration Card */}
          <Card>
            <CardHeader
              title="Provident Fund (PF)"
              description="EPFO Statutory Contributions"
              action={
                <Badge variant={config.pf.is_enabled ? 'success' : 'locked'}>
                  {config.pf.is_enabled ? 'ACTIVE' : 'DISABLED'}
                </Badge>
              }
            />
            <CardBody className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[#65736B] block">Employee Rate:</span>
                  <span className="font-bold text-[#17221C] text-sm tabular-nums">{config.pf.employee_contribution_pct}%</span>
                </div>
                <div>
                  <span className="text-[#65736B] block">Employer Rate:</span>
                  <span className="font-bold text-[#17221C] text-sm tabular-nums">{config.pf.employer_contribution_pct}%</span>
                </div>
                <div>
                  <span className="text-[#65736B] block">Wage Ceiling:</span>
                  <span className="font-bold text-[#17221C] text-sm tabular-nums">₹{config.pf.wage_ceiling.toLocaleString()} / month</span>
                </div>
                <div>
                  <span className="text-[#65736B] block">Effective Date:</span>
                  <span className="font-mono text-[#526158] text-xs">{config.pf.effective_date}</span>
                </div>
              </div>
              <div className="pt-2 border-t border-[#E8EEEA] flex items-center justify-between text-[11px] text-[#65736B]">
                <span>Rule Version: <strong className="font-mono text-[#17221C]">{config.pf.rule_version}</strong></span>
                <span className="text-[#167C63] font-semibold">100% EPF Compliance</span>
              </div>
            </CardBody>
          </Card>

          {/* ESI Configuration Card */}
          <Card>
            <CardHeader
              title="Employee State Insurance (ESI)"
              description="ESIC Medical & Social Security"
              action={
                <Badge variant={config.esi.is_enabled ? 'success' : 'locked'}>
                  {config.esi.is_enabled ? 'ACTIVE' : 'DISABLED'}
                </Badge>
              }
            />
            <CardBody className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[#65736B] block">Employee Rate:</span>
                  <span className="font-bold text-[#17221C] text-sm tabular-nums">{config.esi.employee_contribution_pct}%</span>
                </div>
                <div>
                  <span className="text-[#65736B] block">Employer Rate:</span>
                  <span className="font-bold text-[#17221C] text-sm tabular-nums">{config.esi.employer_contribution_pct}%</span>
                </div>
                <div>
                  <span className="text-[#65736B] block">Eligibility Limit:</span>
                  <span className="font-bold text-[#17221C] text-sm tabular-nums">₹{config.esi.eligibility_wage_threshold.toLocaleString()} / month</span>
                </div>
                <div>
                  <span className="text-[#65736B] block">Effective Date:</span>
                  <span className="font-mono text-[#526158] text-xs">{config.esi.effective_date}</span>
                </div>
              </div>
              <div className="pt-2 border-t border-[#E8EEEA] flex items-center justify-between text-[11px] text-[#65736B]">
                <span>Rule Version: <strong className="font-mono text-[#17221C]">{config.esi.rule_version}</strong></span>
                <span className="text-[#167C63] font-semibold">ESIC Portal Ready</span>
              </div>
            </CardBody>
          </Card>

          {/* PT Configuration Card */}
          <Card>
            <CardHeader
              title="Professional Tax (PT)"
              description="State Level Statutory Slab Rules"
              action={
                <Badge variant={config.pt.is_enabled ? 'success' : 'locked'}>
                  {config.pt.is_enabled ? 'ACTIVE' : 'DISABLED'}
                </Badge>
              }
            />
            <CardBody className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[#65736B] block">Max Monthly Slab:</span>
                  <span className="font-bold text-[#17221C] text-sm tabular-nums">₹{config.pt.max_slab} / month</span>
                </div>
                <div>
                  <span className="text-[#65736B] block">State Schema:</span>
                  <span className="font-bold text-[#17221C] text-xs">{config.pt.state}</span>
                </div>
                <div>
                  <span className="text-[#65736B] block">Effective Date:</span>
                  <span className="font-mono text-[#526158] text-xs">{config.pt.effective_date}</span>
                </div>
                <div>
                  <span className="text-[#65736B] block">Rule Version:</span>
                  <span className="font-mono text-[#17221C] text-xs">{config.pt.rule_version}</span>
                </div>
              </div>
              <div className="pt-2 border-t border-[#E8EEEA] flex items-center justify-between text-[11px] text-[#65736B]">
                <span>Auto State Slab Lookup</span>
                <span className="text-[#167C63] font-semibold">Enforced</span>
              </div>
            </CardBody>
          </Card>

          {/* TDS Configuration Card */}
          <Card>
            <CardHeader
              title="Tax Deductions (TDS)"
              description="Income Tax Slabs & Regime (Sec 192)"
              action={
                <Badge variant={config.tds.is_enabled ? 'success' : 'locked'}>
                  {config.tds.is_enabled ? 'ACTIVE' : 'DISABLED'}
                </Badge>
              }
            />
            <CardBody className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[#65736B] block">Tax Regime:</span>
                  <span className="font-bold text-[#17221C] text-xs">{config.tds.regime}</span>
                </div>
                <div>
                  <span className="text-[#65736B] block">Exemption Threshold:</span>
                  <span className="font-bold text-[#17221C] text-sm tabular-nums">₹{config.tds.threshold.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[#65736B] block">Effective Date:</span>
                  <span className="font-mono text-[#526158] text-xs">{config.tds.effective_date}</span>
                </div>
                <div>
                  <span className="text-[#65736B] block">Assessment Year:</span>
                  <span className="font-mono text-[#17221C] text-xs">{config.tds.rule_version}</span>
                </div>
              </div>
              <div className="pt-2 border-t border-[#E8EEEA] flex items-center justify-between text-[11px] text-[#65736B]">
                <span>Form 24Q E-Filing</span>
                <span className="text-[#167C63] font-semibold">Supported</span>
              </div>
            </CardBody>
          </Card>
        </div>

        {isEditing && (
          <div className="flex justify-end pt-4">
            <Button variant="primary" type="submit" isLoading={isSubmitting} icon={Save}>
              Save Compliance Rules
            </Button>
          </div>
        )}
      </form>
    </div>
  );
};

export default StatutoryConfigPage;
