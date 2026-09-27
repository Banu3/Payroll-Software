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
  Building2,
  Calendar,
  Layers,
  Sparkles,
  ShieldAlert,
  Loader2
} from 'lucide-react';
import api from '../../../lib/axios';

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-blue-400" /> Create Enterprise Payroll Run
          </h1>
          <p className="text-sm text-slate-400">
            Initialize period calculation, fetch attendance & leave data, and run statutory engine.
          </p>
        </div>
        <button
          onClick={() => navigate('/hr/payroll/runs')}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg border border-slate-700 transition"
        >
          Cancel
        </button>
      </div>

      {/* Progress Steps */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
        <div className="grid grid-cols-5 gap-2">
          {STEPS.map((step) => {
            const isDone = currentStep > step.id;
            const isCurrent = currentStep === step.id;
            return (
              <div
                key={step.id}
                className={`p-3 rounded-lg border text-left transition-all ${
                  isCurrent
                    ? 'bg-blue-600/15 border-blue-500/40 text-blue-400'
                    : isDone
                    ? 'bg-slate-800/40 border-emerald-500/30 text-emerald-400'
                    : 'bg-slate-950/40 border-slate-800 text-slate-500'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider">Step 0{step.id}</span>
                  {isDone ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : null}
                </div>
                <div className="text-xs font-bold truncate">{step.title}</div>
                <div className="text-[10px] opacity-75 truncate">{step.subtitle}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Wizard Content Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 min-h-[380px] flex flex-col justify-between">
        {/* Step 1: Company & Month */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-400" /> Select Payroll Period
            </h2>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2">Payroll Year</label>
                <select
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                >
                  {[2024, 2025, 2026, 2027].map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2">Payroll Month</label>
                <select
                  value={formData.month}
                  onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <option key={m} value={m}>
                      {new Date(2000, m - 1, 1).toLocaleString('default', { month: 'Long' })}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="p-4 bg-blue-950/20 border border-blue-800/40 rounded-lg text-xs text-blue-300">
              Selected Period: <strong>{new Date(2000, formData.month - 1, 1).toLocaleString('default', { month: 'long' })} {formData.year}</strong>. This run will collect all approved attendance, leaves, overtime, and loan balances up to this period end.
            </div>
          </div>
        )}

        {/* Step 2: Scope & Filtering */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-400" /> Select Employee Processing Scope
            </h2>

            <div className="grid grid-cols-3 gap-4">
              {['ALL', 'BRANCH', 'DEPARTMENT'].map((scopeType) => (
                <div
                  key={scopeType}
                  onClick={() => setFormData({ ...formData, scope: scopeType })}
                  className={`p-4 rounded-xl border cursor-pointer transition ${
                    formData.scope === scopeType
                      ? 'bg-blue-600/15 border-blue-500 text-blue-300'
                      : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="font-bold text-sm mb-1">{scopeType === 'ALL' ? 'All Active Employees' : scopeType === 'BRANCH' ? 'By Specific Branch' : 'By Specific Department'}</div>
                  <div className="text-xs opacity-75">
                    {scopeType === 'ALL' ? 'Process payroll for all active organization staff' : scopeType === 'BRANCH' ? 'Filter payroll calculation by location branch' : 'Filter payroll calculation by specific department'}
                  </div>
                </div>
              ))}
            </div>

            {formData.scope === 'BRANCH' && (
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2">Select Branch</label>
                <select
                  value={formData.branchId}
                  onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100"
                >
                  <option value="">Select Branch...</option>
                  {branches?.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
            )}

            {formData.scope === 'DEPARTMENT' && (
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2">Select Department</label>
                <select
                  value={formData.departmentId}
                  onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100"
                >
                  <option value="">Select Department...</option>
                  {departments?.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Pay Date */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-400" /> Scheduled Disbursement Date
            </h2>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2">Target Pay Date</label>
              <input
                type="date"
                value={formData.payDate}
                onChange={(e) => setFormData({ ...formData, payDate: e.target.value })}
                className="bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2">Run Notes / Remarks (Optional)</label>
              <textarea
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="E.g. Regular monthly cycle including festival bonus adjustments..."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        )}

        {/* Step 4: Pre-Payroll Validation */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-blue-400" /> Pre-Payroll Validation Checks
                </h2>
                <p className="text-xs text-slate-400">Run mandatory statutory, bank account, and salary structure integrity checks.</p>
              </div>
              <button
                onClick={handleRunValidation}
                disabled={validating}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg flex items-center gap-2"
              >
                {validating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />} Run Compliance Engine
              </button>
            </div>

            {validationResults ? (
              <div className="space-y-4">
                {/* Summary badges */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-3 bg-rose-50 border border-rose-400 rounded-lg flex items-center justify-between">
                    <span className="text-xs text-rose-950 font-bold">Blocking Errors</span>
                    <span className="text-lg font-bold text-rose-700">{validationResults.summary?.blockingErrorsCount || 0}</span>
                  </div>
                  <div className="p-3 bg-amber-50 border border-amber-400 rounded-lg flex items-center justify-between">
                    <span className="text-xs text-amber-950 font-bold">Warnings</span>
                    <span className="text-lg font-bold text-amber-700">{validationResults.summary?.warningsCount || 0}</span>
                  </div>
                  <div className="p-3 bg-emerald-50 border border-emerald-400 rounded-lg flex items-center justify-between">
                    <span className="text-xs text-emerald-950 font-bold">Passed Checks</span>
                    <span className="text-lg font-bold text-emerald-700">{validationResults.summary?.passedCount || 0}</span>
                  </div>
                </div>

                {/* Blocking Errors list */}
                {validationResults.blockingErrors?.length > 0 && (
                  <div className="bg-red-950/30 border border-red-800/50 rounded-lg p-4 space-y-2">
                    <h3 className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                      <XCircle className="w-4 h-4" /> Blocking Errors (Must Resolve)
                    </h3>
                    <ul className="space-y-1 text-xs text-red-200">
                      {validationResults.blockingErrors.map((err, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="font-mono text-red-400">• [{err.code}]</span> {err.message}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Warnings list */}
                {validationResults.warnings?.length > 0 && (
                  <div className="bg-amber-950/30 border border-amber-800/50 rounded-lg p-4 space-y-2">
                    <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4" /> Non-Blocking Warnings
                    </h3>
                    <ul className="space-y-1 text-xs text-amber-200">
                      {validationResults.warnings.map((warn, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="font-mono text-amber-400">• [{warn.code}]</span> {warn.message}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 text-center border border-dashed border-slate-800 rounded-xl text-slate-500 text-sm">
                Click "Run Compliance Engine" to perform validation checks before proceeding.
              </div>
            )}
          </div>
        )}

        {/* Step 5: Review & Create */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" /> Confirm & Execute Payroll Run
            </h2>

            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-500">Payroll Month / Year:</span>
                  <p className="font-bold text-slate-200 text-sm">{new Date(2000, formData.month - 1, 1).toLocaleString('default', { month: 'long' })} {formData.year}</p>
                </div>
                <div>
                  <span className="text-slate-500">Scheduled Pay Date:</span>
                  <p className="font-bold text-slate-200 text-sm">{formData.payDate}</p>
                </div>
                <div>
                  <span className="text-slate-500">Target Scope:</span>
                  <p className="font-bold text-slate-200 text-sm">{formData.scope}</p>
                </div>
                <div>
                  <span className="text-slate-500">Validation Status:</span>
                  <p className={`font-bold text-sm ${isBlockingErrorPresent ? 'text-red-400' : 'text-emerald-400'}`}>
                    {isBlockingErrorPresent ? 'BLOCKING ERRORS EXIST' : 'VALIDATION PASSED'}
                  </p>
                </div>
              </div>
            </div>

            {isBlockingErrorPresent && (
              <div className="p-4 bg-red-950/40 border border-red-800/60 rounded-lg text-xs text-red-300">
                ⚠️ You cannot create a payroll run while blocking errors exist. Please return to Step 4 or resolve data missing in Employee Compensation / Profiles.
              </div>
            )}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-800 mt-6">
          <button
            onClick={() => setCurrentStep((prev) => Math.max(prev - 1, 1))}
            disabled={currentStep === 1}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 text-xs font-semibold rounded-lg flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Previous
          </button>

          {currentStep < 5 ? (
            <button
              onClick={() => {
                if (currentStep === 4 && !validationResults) {
                  handleRunValidation();
                }
                setCurrentStep((prev) => Math.min(prev + 1, 5));
              }}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg flex items-center gap-2"
            >
              Next Step <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => createRunMutation.mutate()}
              disabled={createRunMutation.isPending || isBlockingErrorPresent}
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg flex items-center gap-2"
            >
              {createRunMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-white" />} Initialize Calculation Run
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
