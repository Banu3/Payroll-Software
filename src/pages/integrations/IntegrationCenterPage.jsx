import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Layers,
  Key,
  Webhook,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  Copy,
  Loader2
} from 'lucide-react';
import api from '../../lib/axios';

export default function IntegrationCenterPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('CONNECTORS'); // CONNECTORS, WEBHOOKS, API_KEYS

  const [webhookForm, setWebhookForm] = useState({
    name: 'Payroll Finalized Webhook',
    endpointUrl: 'https://api.company.com/webhooks/payroll',
    subscribedEvents: ['payroll.finalized', 'payment.completed']
  });

  const [keyForm, setKeyForm] = useState({
    name: 'External HR Reporting Key',
    scopes: ['employees.read', 'payroll.read'],
    expiresInDays: 90
  });

  const [generatedKey, setGeneratedKey] = useState(null);

  // Fetch Integrations Data
  const { data: overview, isLoading } = useQuery({
    queryKey: ['integrations-overview'],
    queryFn: async () => {
      const res = await api.get('/integrations/overview');
      return res.data?.data || res.data;
    }
  });

  // Create Webhook Mutation
  const createWebhookMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/integrations/webhooks', webhookForm);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations-overview'] });
      alert('Webhook configured successfully.');
    }
  });

  // Create API Key Mutation
  const createKeyMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/integrations/api-keys', keyForm);
      return res.data?.data || res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['integrations-overview'] });
      setGeneratedKey(data.apiKey);
    }
  });

  if (isLoading) {
    return (
      <div className="p-12 text-center text-slate-400 flex items-center justify-center gap-2">
        <Loader2 className="w-5 h-5 animate-spin text-blue-400" /> Loading integration center...
      </div>
    );
  }

  const { webhooks = [], apiKeys = [], connections = [] } = overview || {};

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Layers className="w-6 h-6 text-blue-400" /> Enterprise Integration & Developer Platform
          </h1>
          <p className="text-sm text-slate-400">
            Manage external connectors, outbound webhooks, and scoped REST API developer keys.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-800 flex items-center gap-6">
        {[
          { id: 'CONNECTORS', label: `External Connectors (${connections.length})`, icon: Layers },
          { id: 'WEBHOOKS', label: `Webhooks (${webhooks.length})`, icon: Webhook },
          { id: 'API_KEYS', label: `API Keys (${apiKeys.length})`, icon: Key }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-3 text-xs font-bold flex items-center gap-2 border-b-2 transition ${
              activeTab === tab.id
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: CONNECTORS */}
      {activeTab === 'CONNECTORS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {connections.map((conn, idx) => (
            <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">{conn.category}</span>
                <h3 className="font-bold text-slate-100 text-sm">{conn.provider_name}</h3>
                <span className="text-xs text-slate-400 block">{conn.status === 'CONNECTED' ? 'Active Sync' : 'Not Configured'}</span>
              </div>
              <span className={`px-2.5 py-1 rounded text-[10px] font-semibold border ${
                conn.status === 'CONNECTED' ? 'bg-emerald-950 text-emerald-400 border-emerald-800' : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}>
                {conn.status}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: WEBHOOKS */}
      {activeTab === 'WEBHOOKS' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-bold text-slate-100">Register Outbound Webhook</h2>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Webhook Name</label>
                <input
                  type="text"
                  value={webhookForm.name}
                  onChange={(e) => setWebhookForm({ ...webhookForm, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Endpoint URL (HTTPS)</label>
                <input
                  type="text"
                  value={webhookForm.endpointUrl}
                  onChange={(e) => setWebhookForm({ ...webhookForm, endpointUrl: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100 font-mono"
                />
              </div>
            </div>

            <button
              onClick={() => createWebhookMutation.mutate()}
              disabled={createWebhookMutation.isPending}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg flex items-center gap-2"
            >
              {createWebhookMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Register Webhook Endpoint
            </button>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-3">Webhook Name</th>
                  <th className="p-3">Endpoint URL</th>
                  <th className="p-3">Events</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {webhooks.map((w) => (
                  <tr key={w.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-3 font-sans font-semibold text-slate-100">{w.name}</td>
                    <td className="p-3 text-blue-400">{w.endpoint_url}</td>
                    <td className="p-3 font-sans text-slate-400">{(w.subscribed_events || []).join(', ')}</td>
                    <td className="p-3 font-sans">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800">
                        {w.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: API KEYS */}
      {activeTab === 'API_KEYS' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-bold text-slate-100">Generate Developer API Key</h2>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Key Description</label>
                <input
                  type="text"
                  value={keyForm.name}
                  onChange={(e) => setKeyForm({ ...keyForm, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Expires In (Days)</label>
                <input
                  type="number"
                  value={keyForm.expiresInDays}
                  onChange={(e) => setKeyForm({ ...keyForm, expiresInDays: parseInt(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100 font-mono"
                />
              </div>
            </div>

            <button
              onClick={() => createKeyMutation.mutate()}
              disabled={createKeyMutation.isPending}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg flex items-center gap-2"
            >
              {createKeyMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
              Generate API Key
            </button>
          </div>

          {generatedKey && (
            <div className="p-4 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-xs space-y-2">
              <span className="font-bold text-emerald-400 uppercase tracking-wider block">API Key Secret (Copy Now — Shown Only Once)</span>
              <div className="p-3 bg-slate-950 rounded border border-slate-800 font-mono text-emerald-300 font-bold select-all">
                {generatedKey}
              </div>
            </div>
          )}

          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-3">Key Name</th>
                  <th className="p-3">Prefix</th>
                  <th className="p-3">Scopes</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Created Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {apiKeys.map((k) => (
                  <tr key={k.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-3 font-sans font-semibold text-slate-100">{k.name}</td>
                    <td className="p-3 text-blue-400">{k.key_prefix}...</td>
                    <td className="p-3 font-sans text-slate-400">{(k.scopes || []).join(', ')}</td>
                    <td className="p-3 font-sans">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800">
                        {k.status}
                      </span>
                    </td>
                    <td className="p-3 text-slate-500 font-sans text-[11px]">{new Date(k.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
