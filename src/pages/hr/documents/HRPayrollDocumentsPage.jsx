import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  FileCheck,
  Plus,
  Download,
  Building,
  UserCheck,
  ShieldCheck,
  Eye,
  Printer,
  Loader2
} from 'lucide-react';
import api from '../../../lib/axios';

export default function HRPayrollDocumentsPage() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [previewCert, setPreviewCert] = useState(null);

  const [formData, setFormData] = useState({
    employeeId: '',
    purpose: 'Bank Loan Application',
    includeCTCBreakdown: true
  });

  // Fetch Documents
  const { data: docs, isLoading } = useQuery({
    queryKey: ['payroll-documents'],
    queryFn: async () => {
      const res = await api.get('/payslips/documents');
      return res.data?.data || res.data || [];
    }
  });

  // Fetch Employees for dropdown
  const { data: employees } = useQuery({
    queryKey: ['employees-light'],
    queryFn: async () => {
      const res = await api.get('/hr/employees');
      return res.data?.data || res.data || [];
    }
  });

  // Generate Salary Certificate Mutation
  const createCertMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/payslips/documents/salary-certificate', formData);
      return res.data?.data || res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['payroll-documents'] });
      setShowModal(false);
      setPreviewCert(data);
    }
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <FileCheck className="w-6 h-6 text-blue-400" /> HR Payroll Document Center
          </h1>
          <p className="text-sm text-slate-400">
            Generate official Salary Certificates, Employment Income Statements, and Form 16 documents.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Issue Salary Certificate
        </button>
      </div>

      {/* Documents Table */}
      {isLoading ? (
        <div className="p-12 text-center text-slate-400 flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-blue-400" /> Loading document center...
        </div>
      ) : !docs || docs.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-500 text-sm">
          No generated payroll documents issued yet.
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3">Document Name</th>
                <th className="p-3">Employee</th>
                <th className="p-3">Type</th>
                <th className="p-3">Period</th>
                <th className="p-3">Issued Date</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {docs.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-800/40 transition">
                  <td className="p-3 font-sans font-semibold text-slate-100">{doc.document_name}</td>
                  <td className="p-3 font-sans text-slate-300">
                    {doc.employees?.first_name} {doc.employees?.last_name}
                    <span className="block text-[10px] text-slate-500 font-mono">{doc.employees?.employee_code}</span>
                  </td>
                  <td className="p-3 font-sans text-blue-400 font-semibold">{doc.document_type}</td>
                  <td className="p-3 text-slate-400 font-sans">{doc.period_description}</td>
                  <td className="p-3 text-slate-400 font-sans">{new Date(doc.created_at).toLocaleDateString()}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800">
                      {doc.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal for Issuing Salary Certificate */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-md w-full space-y-4">
            <h2 className="text-lg font-bold text-slate-100">Issue Salary Certificate</h2>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Select Employee</label>
                <select
                  value={formData.employeeId}
                  onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100"
                >
                  <option value="">Select Employee...</option>
                  {employees?.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.first_name} {emp.last_name} ({emp.employee_code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Purpose / Declaration</label>
                <input
                  type="text"
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                  placeholder="E.g. Bank Home Loan Application"
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                onClick={() => setShowModal(false)}
                className="px-3 py-1.5 bg-slate-800 text-slate-300 text-xs font-semibold rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => createCertMutation.mutate()}
                disabled={!formData.employeeId || createCertMutation.isPending}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5"
              >
                {createCertMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Generate Certificate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Certificate Preview Modal */}
      {previewCert && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 max-w-2xl w-full space-y-6 text-slate-100">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <span className="font-bold text-xs text-blue-400 uppercase tracking-wider">OFFICIAL SALARY CERTIFICATE</span>
              <button onClick={() => setPreviewCert(null)} className="text-slate-400 text-xs font-bold">✕ Close</button>
            </div>

            <div className="space-y-4 text-xs font-sans leading-relaxed">
              <div className="text-center space-y-1">
                <h2 className="text-xl font-bold uppercase">{previewCert.company?.name || 'ENTERPRISE CORPORATION'}</h2>
                <p className="text-slate-400">TO WHOM IT MAY CONCERN</p>
              </div>

              <p className="pt-2">
                This is to certify that <strong>{previewCert.employee?.first_name} {previewCert.employee?.last_name}</strong> (Employee ID: <strong>{previewCert.employee?.employee_code}</strong>) is a permanent employee of <strong>{previewCert.company?.name}</strong>, serving as <strong>{previewCert.employee?.designations?.name || 'Staff'}</strong> in the <strong>{previewCert.employee?.departments?.name || 'General'}</strong> department since <strong>{previewCert.employee?.joining_date}</strong>.
              </p>

              <p>
                This certificate is issued upon the request of the employee for the purpose of <strong>{previewCert.purpose}</strong>.
              </p>

              <div className="pt-8 border-t border-slate-800 flex justify-between items-end">
                <div>
                  <p className="font-bold text-slate-200">Date: {previewCert.issuedAt}</p>
                  <p className="text-slate-500">Authorized Signatory</p>
                </div>
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4" /> Print Certificate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
