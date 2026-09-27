import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Building,
  Plus,
  CheckCircle2,
  Shield,
  CreditCard,
  Loader2
} from 'lucide-react';
import api from '../../../lib/axios';

export default function CompanyBankAccountsPage() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    bank_name: 'HDFC Bank',
    account_name: 'Enterprise Corporate Payroll Account',
    account_number: '50200012345678',
    ifsc_code: 'HDFC0000123',
    branch_name: 'Financial Center Branch',
    account_type: 'CURRENT',
    currency: 'INR',
    is_default: true
  });

  const { data: accounts, isLoading } = useQuery({
    queryKey: ['company-bank-accounts'],
    queryFn: async () => {
      const res = await api.get('/payments/bank-accounts');
      return res.data?.data || res.data || [];
    }
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/payments/bank-accounts', formData);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-bank-accounts'] });
      setShowModal(false);
    }
  });

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Building className="w-6 h-6 text-blue-400" /> Company Corporate Bank Accounts
          </h1>
          <p className="text-sm text-slate-400">
            Configure primary debit accounts used for corporate NEFT/RTGS salary disbursements.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Corporate Account
        </button>
      </div>

      {/* Accounts Grid */}
      {isLoading ? (
        <div className="p-12 text-center text-slate-400 flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-blue-400" /> Loading bank accounts...
        </div>
      ) : !accounts || accounts.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-500 text-sm">
          No corporate bank accounts configured yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {accounts.map((acc) => (
            <div key={acc.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-100 text-base">{acc.bank_name}</h3>
                  <p className="text-xs text-slate-400">{acc.account_name}</p>
                </div>
                {acc.is_default && (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                    Primary Default
                  </span>
                )}
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs space-y-1 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Account Number:</span>
                  <span className="text-slate-200 font-bold">{acc.account_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">IFSC Code:</span>
                  <span className="text-blue-400 font-bold">{acc.ifsc_code}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Branch / Type:</span>
                  <span className="text-slate-300 font-sans">{acc.branch_name} ({acc.account_type})</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-md w-full space-y-4">
            <h2 className="text-lg font-bold text-slate-100">Add Corporate Bank Account</h2>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Bank Name</label>
                <input
                  type="text"
                  value={formData.bank_name}
                  onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Account Holder Name</label>
                <input
                  type="text"
                  value={formData.account_name}
                  onChange={(e) => setFormData({ ...formData, account_name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Account Number</label>
                  <input
                    type="text"
                    value={formData.account_number}
                    onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">IFSC Code</label>
                  <input
                    type="text"
                    value={formData.ifsc_code}
                    onChange={(e) => setFormData({ ...formData, ifsc_code: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100 font-mono"
                  />
                </div>
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
                onClick={() => createMutation.mutate()}
                disabled={createMutation.isPending}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5"
              >
                {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Save Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
