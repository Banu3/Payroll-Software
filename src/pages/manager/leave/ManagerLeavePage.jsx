import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Card, CardHeader, CardBody } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Check, X, Calendar, Clock } from 'lucide-react';
import { api } from '../../../services/api';

export const ManagerLeavePage = () => {
  const STORAGE_KEY = 'payroll_team_leave_requests';

  const DEFAULT_TEAM_LEAVE_REQUESTS = [
    {
      id: 'm-req-1',
      employee: { first_name: 'Rajesh', last_name: 'Kumar', employee_id: 'EMP-001' },
      leave_type: { name: 'Casual Leave (CL)' },
      start_date: '2026-10-02',
      end_date: '2026-10-03',
      duration: 2,
      reason: 'Personal family event',
      status: 'PENDING'
    },
    {
      id: 'm-req-2',
      employee: { first_name: 'Sneha', last_name: 'Reddy', employee_id: 'EMP-004' },
      leave_type: { name: 'Earned Leave (EL)' },
      start_date: '2026-10-10',
      end_date: '2026-10-15',
      duration: 6,
      reason: 'Vacation travel',
      status: 'PENDING'
    }
  ];

  const getInitialRequests = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse saved leave requests:', e);
    }
    return DEFAULT_TEAM_LEAVE_REQUESTS;
  };

  const [requests, setRequests] = useState(getInitialRequests);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchTeamRequests();
  }, []);

  const fetchTeamRequests = async () => {
    try {
      const res = await api.get('/leave/requests');
      if (res && res.success && res.data && res.data.length > 0) {
        const saved = localStorage.getItem(STORAGE_KEY);
        const savedList = saved ? JSON.parse(saved) : [];
        const merged = res.data.map(item => {
          const s = savedList.find(x => x.id === item.id);
          return s ? { ...item, status: s.status } : item;
        });
        setRequests(merged);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
        return;
      }
    } catch (err) {
      console.warn('Team leave requests API fallback to local persistence:', err.message);
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.post(`/leave/requests/${id}/approve`, { comments: 'Approved by Manager' });
    } catch (err) {
      console.warn('Approve leave API fallback:', err.message);
    }
    setRequests(prev => {
      const updated = prev.map(r => r.id === id ? { ...r, status: 'APPROVED' } : r);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const handleReject = async (id) => {
    const reason = window.prompt('Enter rejection reason:');
    if (!reason) return;
    try {
      await api.post(`/leave/requests/${id}/reject`, { rejectionReason: reason });
    } catch (err) {
      console.warn('Reject leave API fallback:', err.message);
    }
    setRequests(prev => {
      const updated = prev.map(r => r.id === id ? { ...r, status: 'REJECTED' } : r);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader
        title="Team Leave Approvals & Availability"
        subtitle="Review and manage direct report leave requests and monitor team availability"
      />

      <Card>
        <CardHeader>
          <h3 style={{ margin: 0, fontSize: '1.125rem' }}>Team Leave Approvals Queue</h3>
        </CardHeader>
        <CardBody style={{ padding: 0 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ background: 'var(--bg-main)', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '0.75rem 1rem' }}>Employee</th>
                <th style={{ padding: '0.75rem 1rem' }}>Leave Type</th>
                <th style={{ padding: '0.75rem 1rem' }}>Dates</th>
                <th style={{ padding: '0.75rem 1rem' }}>Duration</th>
                <th style={{ padding: '0.75rem 1rem' }}>Reason</th>
                <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                <th style={{ padding: '0.75rem 1rem' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>
                    {r.employee?.first_name} {r.employee?.last_name} ({r.employee?.employee_id})
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>{r.leave_type?.name}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>{r.start_date} to {r.end_date}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>{r.duration} day(s)</td>
                  <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>{r.reason}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <Badge variant={r.status === 'APPROVED' ? 'success' : r.status === 'REJECTED' ? 'danger' : 'warning'}>
                      {r.status}
                    </Badge>
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleApprove(r.id)}
                        style={{ color: '#0F172A', backgroundColor: r.status === 'APPROVED' ? '#0F766E' : '#E6F4F1', borderColor: '#0F766E' }}
                        className={`h-8 px-3 rounded-lg text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer border ${
                          r.status === 'APPROVED'
                            ? 'bg-[#0F766E] text-white border-[#0F766E]'
                            : 'bg-[#E6F4F1] border-[#0F766E] hover:bg-[#D1ECE7] text-[#0F172A]'
                        }`}
                      >
                        <Check className={`w-3.5 h-3.5 shrink-0 ${r.status === 'APPROVED' ? 'text-white' : 'text-[#0F766E]'}`} />
                        <span style={{ color: r.status === 'APPROVED' ? '#FFFFFF' : '#0F172A', fontWeight: 700 }}>
                          {r.status === 'APPROVED' ? 'Approved' : 'Approve'}
                        </span>
                      </button>

                      <button
                        onClick={() => handleReject(r.id)}
                        style={{ color: '#0F172A', backgroundColor: r.status === 'REJECTED' ? '#E11D48' : '#FFF1F2', borderColor: '#F43F5E' }}
                        className={`h-8 px-3 rounded-lg text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer border ${
                          r.status === 'REJECTED'
                            ? 'bg-rose-600 text-white border-rose-700'
                            : 'bg-rose-50 border-rose-300 hover:bg-rose-100 text-[#0F172A]'
                        }`}
                      >
                        <X className={`w-3.5 h-3.5 shrink-0 ${r.status === 'REJECTED' ? 'text-white' : 'text-rose-600'}`} />
                        <span style={{ color: r.status === 'REJECTED' ? '#FFFFFF' : '#0F172A', fontWeight: 700 }}>
                          {r.status === 'REJECTED' ? 'Rejected' : 'Reject'}
                        </span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {requests.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No team leave requests pending approval.
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

export default ManagerLeavePage;
