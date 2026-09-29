import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Play,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowRight,
  ArrowLeft,
  Users,
  Calendar,
  Sparkles,
  ShieldAlert,
  Loader2
} from 'lucide-react';
import api from '../../../lib/axios';
import PageHeader from '../../../components/ui/PageHeader';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import Input from '../../../components/ui/Input';
import Badge from '../../../components/ui/Badge';

const STEPS = [
  { id: 1, title: 'Company & Month', subtitle: 'Select target payroll period' },
  { id: 2, title: 'Scope & Filtering', subtitle: 'Branch, Dept & Employee Group' },
  { id: 3, title: 'Pay Date', subtitle: 'Scheduled disbursement date' },
  { id: 4, title: 'Pre-Payroll Validation', subtitle: 'Run compliance checks' },
  { id: 5, title: 'Review & Create', subtitle: 'Initialize calculation run' }
];

export default function CreatePayrollRunWizardPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(1);

  const [formData, setFormData] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    payDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 5).toISOString().slice(0, 10),
    scope: 'ALL',
    branchId: '',
    departmentId: '',
    notes: ''
  });

  const [validationResults, setValidationResults] = useState(null);
  const [validating, setValidating] = useState(false);

  // Fetch departments & branches
  const { data: departments } = useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const res = await api.get('/hr/departments');
      return res.data?.data || res.data || [];
    }
  });

  const { data: branches } = useQuery({
    queryKey: ['branches'],
    queryFn: async () => {
      const res = await api.get('/hr/branches');
      return res.data?.data || res.data || [];
    }
  });

  // Run Pre-Payroll Validation
  const handleRunValidation = async () => {
    setValidating(true);
    try {
      const res = await api.post('/payroll-processing/validate', {
        year: parseInt(formData.year),
        month: parseInt(formData.month)
      });
      setValidationResults(res.data?.data || res.data);
    } catch (err) {
      console.error('Validation failed:', err);
      setValidationResults({
        summary: { blockingErrorsCount: 1, warningsCount: 0, passedCount: 0 },
        blockingErrors: [{ code: 'API_ERROR', message: err.response?.data?.message || 'Validation request failed' }],
        warnings: [],
        passedChecks: []
      });
    } finally {
      setValidating(false);
    }
  };

  // Create Payroll Run Mutation
  const createRunMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        year: parseInt(formData.year),
        month: parseInt(formData.month),
        payDate: formData.payDate,
        branchId: formData.branchId || null,
        departmentId: formData.departmentId || null,
        notes: formData.notes
      };
      const res = await api.post('/payroll-processing/runs', payload);
      return res.data?.data || res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['payroll-runs'] });
      navigate(`/hr/payroll/runs/${data.id || data.run?.id}`);
    }
  });

  const isBlockingErrorPresent = validationResults?.summary?.blockingErrorsCount > 0;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <PageHeader
        title="Create Enterprise Payroll Run"
        subtitle="Initialize period calculation, fetch attendance & leave data, and run statutory engine."
        icon={Sparkles}
        actions={
          <Button variant="secondary" onClick={() => navigate('/hr/payroll/runs')}>
            Cancel
          </Button>
        }
      />

      {/* Progress Steps */}
      <Card className="p-4">
        <div className="grid grid-cols-5 gap-2">
          {STEPS.map((step) => {
            const isDone = currentStep > step.id;
            const isCurrent = currentStep === step.id;
            return (
              <div
                key={step.id}
                className={`p-3 rounded-lg border text-left transition-all ${
                  isCurrent
                    ? 'bg-brand/10 border-brand text-brand'
                    : isDone
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                    : 'bg-subtle border-default text-muted'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider">Step 0{step.id}</span>
                  {isDone ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : null}
                </div>
                <div className="text-xs font-bold truncate">{step.title}</div>
                <div className="text-[10px] opacity-75 truncate">{step.subtitle}</div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Wizard Content Card */}
      <Card className="p-6 min-h-[380px] flex flex-col justify-between">
        {/* Step 1: Company & Month */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <h2 className="text-sm font-bold text-heading flex items-center gap-2">
              <Calendar className="w-5 h-5 text-brand" /> Select Payroll Period
            </h2>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-muted mb-2">Payroll Year</label>
                <Select
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                >
                  {[2024, 2025, 2026, 2027].map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted mb-2">Payroll Month</label>
                <Select
                  value={formData.month}
                  onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <option key={m} value={m}>
                      {new Date(2000, m - 1, 1).toLocaleString('default', { month: 'long' })}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
            <div className="p-4 bg-subtle border border-default rounded-lg text-xs text-body">
              Selected Period: <strong className="text-heading">{new Date(2000, formData.month - 1, 1).toLocaleString('default', { month: 'long' })} {formData.year}</strong>. This run will collect all approved attendance, leaves, overtime, and loan balances up to this period end.
            </div>
          </div>
        )}

        {/* Step 2: Scope & Filtering */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <h2 className="text-sm font-bold text-heading flex items-center gap-2">
              <Users className="w-5 h-5 text-brand" /> Select Employee Processing Scope
            </h2>

            <div className="grid grid-cols-3 gap-4">
              {['ALL', 'BRANCH', 'DEPARTMENT'].map((scopeType) => (
                <div
                  key={scopeType}
                  onClick={() => setFormData({ ...formData, scope: scopeType })}
                  className={`p-4 rounded-xl border cursor-pointer transition ${
                    formData.scope === scopeType
                      ? 'bg-brand/10 border-brand text-brand'
                      : 'bg-subtle border-default text-body hover:border-strong'
                  }`}
                >
                  <div className="font-bold text-sm mb-1">{scopeType === 'ALL' ? 'All Active Employees' : scopeType === 'BRANCH' ? 'By Specific Branch' : 'By Specific Department'}</div>
                  <div className="text-xs text-muted">
                    {scopeType === 'ALL' ? 'Process payroll for all active organization staff' : scopeType === 'BRANCH' ? 'Filter payroll calculation by location branch' : 'Filter payroll calculation by specific department'}
                  </div>
                </div>
              ))}
            </div>

            {formData.scope === 'BRANCH' && (
              <div>
                <label className="block text-xs font-semibold text-muted mb-2">Select Branch</label>
                <Select
                  value={formData.branchId}
                  onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                >
                  <option value="">Select Branch...</option>
                  {branches?.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </Select>
              </div>
            )}

            {formData.scope === 'DEPARTMENT' && (
              <div>
                <label className="block text-xs font-semibold text-muted mb-2">Select Department</label>
                <Select
                  value={formData.departmentId}
                  onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                >
                  <option value="">Select Department...</option>
                  {departments?.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </Select>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Pay Date */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <h2 className="text-sm font-bold text-heading flex items-center gap-2">
              <Calendar className="w-5 h-5 text-brand" /> Scheduled Disbursement Date
            </h2>
            <div>
              <label className="block text-xs font-semibold text-muted mb-2">Target Pay Date</label>
              <Input
                type="date"
                value={formData.payDate}
                onChange={(e) => setFormData({ ...formData, payDate: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted mb-2">Run Notes / Remarks (Optional)</label>
              <textarea
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="E.g. Regular monthly cycle including festival bonus adjustments..."
                className="w-full bg-card border border-strong rounded-lg p-3 text-sm text-heading focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
              />
            </div>
          </div>
        )}

        {/* Step 4: Pre-Payroll Validation */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-heading flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-brand" /> Pre-Payroll Validation Checks
                </h2>
                <p className="text-xs text-muted">Run mandatory statutory, bank account, and salary structure integrity checks.</p>
              </div>
              <Button
                onClick={handleRunValidation}
                loading={validating}
                icon={Play}
              >
                Run Compliance Engine
              </Button>
            </div>

            {validationResults ? (
              <div className="space-y-4">
                {/* Summary badges */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center justify-between">
                    <span className="text-xs text-rose-950 font-bold">Blocking Errors</span>
                    <span className="text-lg font-bold text-rose-700">{validationResults.summary?.blockingErrorsCount || 0}</span>
                  </div>
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between">
                    <span className="text-xs text-amber-950 font-bold">Warnings</span>
                    <span className="text-lg font-bold text-amber-700">{validationResults.summary?.warningsCount || 0}</span>
                  </div>
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between">
                    <span className="text-xs text-emerald-950 font-bold">Passed Checks</span>
                    <span className="text-lg font-bold text-emerald-700">{validationResults.summary?.passedCount || 0}</span>
                  </div>
                </div>

                {/* Blocking Errors list */}
                {validationResults.blockingErrors?.length > 0 && (
                  <div className="bg-rose-50 border border-rose-200 rounded-lg p-4 space-y-2">
                    <h3 className="text-xs font-bold text-rose-800 uppercase tracking-wider flex items-center gap-1.5">
                      <XCircle className="w-4 h-4 text-rose-700" /> Blocking Errors (Must Resolve)
                    </h3>
                    <ul className="space-y-1 text-xs text-rose-900">
                      {validationResults.blockingErrors.map((err, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="font-mono text-rose-700 font-bold">• [{err.code}]</span> {err.message}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Warnings list */}
                {validationResults.warnings?.length > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-2">
                    <h3 className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-700" /> Non-Blocking Warnings
                    </h3>
                    <ul className="space-y-1 text-xs text-amber-900">
                      {validationResults.warnings.map((warn, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="font-mono text-amber-700 font-bold">• [{warn.code}]</span> {warn.message}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 text-center border border-dashed border-default rounded-xl text-muted text-xs">
                Click "Run Compliance Engine" to perform validation checks before proceeding.
              </div>
            )}
          </div>
        )}

        {/* Step 5: Review & Create */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <h2 className="text-sm font-bold text-heading flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" /> Confirm & Execute Payroll Run
            </h2>

            <div className="bg-subtle border border-default rounded-xl p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-muted block mb-1">Payroll Month / Year:</span>
                  <p className="font-bold text-heading text-sm">{new Date(2000, formData.month - 1, 1).toLocaleString('default', { month: 'long' })} {formData.year}</p>
                </div>
                <div>
                  <span className="text-muted block mb-1">Scheduled Pay Date:</span>
                  <p className="font-bold text-heading text-sm">{formData.payDate}</p>
                </div>
                <div>
                  <span className="text-muted block mb-1">Target Scope:</span>
                  <p className="font-bold text-heading text-sm">{formData.scope}</p>
                </div>
                <div>
                  <span className="text-muted block mb-1">Validation Status:</span>
                  <Badge variant={isBlockingErrorPresent ? 'danger' : 'success'}>
                    {isBlockingErrorPresent ? 'BLOCKING ERRORS EXIST' : 'VALIDATION PASSED'}
                  </Badge>
                </div>
              </div>
            </div>

            {isBlockingErrorPresent && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800">
                ⚠️ You cannot create a payroll run while blocking errors exist. Please return to Step 4 or resolve data missing in Employee Compensation / Profiles.
              </div>
            )}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-default mt-6">
          <Button
            variant="secondary"
            onClick={() => setCurrentStep((prev) => Math.max(prev - 1, 1))}
            disabled={currentStep === 1}
            icon={ArrowLeft}
          >
            Previous
          </Button>

          {currentStep < 5 ? (
            <Button
              onClick={() => {
                if (currentStep === 4 && !validationResults) {
                  handleRunValidation();
                }
                setCurrentStep((prev) => Math.min(prev + 1, 5));
              }}
            >
              Next Step <ArrowRight className="w-4 h-4 ml-1 inline" />
            </Button>
          ) : (
            <Button
              variant="success"
              onClick={() => createRunMutation.mutate()}
              disabled={createRunMutation.isPending || isBlockingErrorPresent}
              loading={createRunMutation.isPending}
              icon={Play}
            >
              Initialize Calculation Run
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}

