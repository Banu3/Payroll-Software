import React, { useState } from 'react';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Card, CardHeader, CardBody } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Calculator, AlertTriangle } from 'lucide-react';
import { api } from '../../../services/api';
import { formatCurrency } from '../../../services/financialCalculationService';

export const SalaryCalculatorPage = () => {
  const [annualCtc, setAnnualCtc] = useState(600000);
  const [result, setResult] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const handleCalculate = async () => {
    setIsCalculating(true);
    try {
      const res = await api.post('/compensation/calculator', { annualCtc });
      if (res && res.success) {
        setResult(res.data);
      }
    } catch (err) {
      console.error('Calculation failed:', err);
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '900px', margin: '0 auto' }}>
      <PageHeader
        title="Interactive Salary CTC Calculator"
        subtitle="Simulate and preview annual/monthly CTC, basic, allowances, deductions, and estimated net pay"
      />

      {/* Warning Banner */}
      <div style={{ padding: '0.75rem 1rem', background: '#fffbeb', border: '1px solid #fef3c7', borderRadius: 'var(--radius-md)', color: '#92400e', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <AlertTriangle size={18} />
        <span><strong>ESTIMATE / PREVIEW ONLY:</strong> Calculator results do not create finalized payroll records or binding salary structures.</span>
      </div>

      <Card>
        <CardBody style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Enter Target Annual CTC (₹)</label>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
              <input
                type="number"
                step="10000"
                value={annualCtc}
                onChange={(e) => setAnnualCtc(parseFloat(e.target.value))}
                style={{ flex: 1, padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', fontSize: '1.125rem', fontWeight: 700 }}
              />
              <Button variant="primary" onClick={handleCalculate} disabled={isCalculating}>
                <Calculator size={16} style={{ marginRight: '0.375rem' }} /> Calculate Breakdown
              </Button>
            </div>
          </div>

          {result && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
              <h3 style={{ margin: 0 }}>Salary Breakdown Preview</h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                <div style={{ background: 'var(--bg-main)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Monthly CTC</span>
                  <p style={{ margin: '0.25rem 0 0 0', fontSize: '1.25rem', fontWeight: 800 }}>{formatCurrency(result.monthlyCtc)}</p>
                </div>

                <div style={{ background: 'var(--bg-main)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Monthly Gross Salary</span>
                  <p style={{ margin: '0.25rem 0 0 0', fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-emerald-600)' }}>{formatCurrency(result.monthlyGross)}</p>
                </div>

                <div style={{ background: 'var(--bg-main)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Employee Deductions</span>
                  <p style={{ margin: '0.25rem 0 0 0', fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-rose-600)' }}>{formatCurrency(result.totalDeductions)}</p>
                </div>

                <div style={{ background: 'var(--bg-main)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Estimated Net Salary</span>
                  <p style={{ margin: '0.25rem 0 0 0', fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-primary-600)' }}>{formatCurrency(result.estimatedNetSalary)}</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.5rem', fontSize: '0.875rem' }}>
                <div>
                  <h4 style={{ margin: '0 0 0.5rem 0' }}>Earnings Breakdown</h4>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.375rem 0' }}><span>Basic Salary (50%):</span><strong>{formatCurrency(result.basicSalary)}</strong></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.375rem 0' }}><span>HRA Allowance:</span><strong>{formatCurrency(result.hra)}</strong></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.375rem 0' }}><span>Special Allowance:</span><strong>{formatCurrency(result.specialAllowance)}</strong></div>
                </div>

                <div>
                  <h4 style={{ margin: '0 0 0.5rem 0' }}>Deductions & Statutory</h4>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.375rem 0' }}><span>Employee PF (12%):</span><strong>{formatCurrency(result.employeePf)}</strong></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.375rem 0' }}><span>Employee ESI:</span><strong>{formatCurrency(result.employeeEsi)}</strong></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.375rem 0' }}><span>Professional Tax:</span><strong>{formatCurrency(result.professionalTax)}</strong></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.375rem 0' }}><span>Employer PF Contribution:</span><strong>{formatCurrency(result.employerPf)}</strong></div>
                </div>
              </div>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default SalaryCalculatorPage;
