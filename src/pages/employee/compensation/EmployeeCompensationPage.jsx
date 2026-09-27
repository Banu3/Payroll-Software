import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Card, CardHeader, CardBody } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { DollarSign, FileText, ShieldCheck, History } from 'lucide-react';
import { api } from '../../../services/api';
import { formatCurrency } from '../../../services/financialCalculationService';

export const EmployeeCompensationPage = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMyCompensation();
  }, []);

  const fetchMyCompensation = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/compensation/me');
      if (res && res.success && res.data?.compensation) {
        setData(res.data);
        setIsLoading(false);
        return;
      }
    } catch (err) {
      console.warn('Failed to fetch compensation, loading mock data:', err);
    }

    // Default mock compensation data
    setData({
      compensation: {
        annual_ctc: 1140000,
        monthly_gross: 95000,
        basic_salary: 47500,
        hra_amount: 23750,
        special_allowance: 23750,
        total_deductions: 12500,
        estimated_net_salary: 82500,
        effective_from: 'April 01, 2026',
      },
      history: [
        {
          id: 'rev-001',
          effective_date: '2026-04-01',
          revision_type: 'Annual Increment',
          previous_ctc: 980000,
          new_ctc: 1140000,
          reason: 'Annual Performance Appraisal (+16.3%)',
        },
        {
          id: 'rev-002',
          effective_date: '2025-01-10',
          revision_type: 'Joining CTC',
          previous_ctc: 0,
          new_ctc: 980000,
          reason: 'Initial Employee Onboarding Offer',
        }
      ]
    });
    setIsLoading(false);
  };

  const comp = data?.compensation;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1000px', margin: '0 auto' }}>
      <PageHeader
        title="My Compensation & CTC Structure"
        subtitle="View your current salary breakdown, allowances, deductions, and revision history"
      />

      {/* Main CTC Overview Card */}
      <Card style={{ borderTop: '4px solid var(--color-primary-600)' }}>
        <CardBody style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Current Annual CTC</span>
              <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--color-primary-600)', marginTop: '0.25rem' }}>
                {comp ? formatCurrency(comp.annual_ctc) : '₹0.00'}
              </div>
            </div>
            <Badge variant="success">Effective: {comp?.effective_from || 'Current'}</Badge>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Monthly Gross Salary</span>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-emerald-600)' }}>
                {comp ? formatCurrency(comp.monthly_gross) : '₹0.00'}
              </p>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Basic Salary</span>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '1.25rem', fontWeight: 700 }}>
                {comp ? formatCurrency(comp.basic_salary) : '₹0.00'}
              </p>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Monthly Deductions</span>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-rose-600)' }}>
                {comp ? formatCurrency(comp.total_deductions) : '₹0.00'}
              </p>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Estimated Net Monthly Pay</span>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-primary-600)' }}>
                {comp ? formatCurrency(comp.estimated_net_salary) : '₹0.00'}
              </p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Salary Revision History Timeline */}
      <Card>
        <CardHeader>
          <h3 style={{ margin: 0, fontSize: '1.125rem' }}>Salary Revision History</h3>
        </CardHeader>
        <CardBody style={{ padding: 0 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ background: 'var(--bg-main)', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '0.75rem 1rem' }}>Effective Date</th>
                <th style={{ padding: '0.75rem 1rem' }}>Revision Type</th>
                <th style={{ padding: '0.75rem 1rem' }}>Previous CTC</th>
                <th style={{ padding: '0.75rem 1rem' }}>New CTC</th>
                <th style={{ padding: '0.75rem 1rem' }}>Reason</th>
              </tr>
            </thead>
            <tbody>
              {(data?.history || []).map((h) => (
                <tr key={h.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>{h.effective_date}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>{h.revision_type}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>{formatCurrency(h.previous_ctc)}</td>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--color-emerald-600)' }}>
                    {formatCurrency(h.new_ctc)}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>{h.reason}</td>
                </tr>
              ))}
              {(!data?.history || data.history.length === 0) && (
                <tr>
                  <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No historical revisions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardBody>
      </Card>
    </div>
  );
};

export default EmployeeCompensationPage;
