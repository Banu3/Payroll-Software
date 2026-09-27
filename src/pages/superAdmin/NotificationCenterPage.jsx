import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Bell, CheckCircle2, AlertTriangle, ShieldAlert, Building2 } from 'lucide-react';
import { api } from '../../services/api';

const MOCK_NOTIFICATIONS = [
  { id: 'notif_1', title: 'New Tenant Registration Pending Approval', message: 'Nexus Global Solutions has completed trial onboarding and submitted verification documents.', is_read: false, created_at: '2026-09-27T14:30:00Z', type: 'INFO' },
  { id: 'notif_2', title: 'High-Volume Payroll Sign-off Required', message: 'Vanguard Financial has submitted $420,000 September payroll run for platform audit.', is_read: false, created_at: '2026-09-27T11:15:00Z', type: 'WARNING' },
  { id: 'notif_3', title: 'Automated Nightly Backup Successful', message: 'All tenant PostgreSQL database snapshots verified and saved to S3 encrypted bucket.', is_read: true, created_at: '2026-09-27T00:00:00Z', type: 'SUCCESS' },
  { id: 'notif_4', title: 'Multiple Failed Login Attempts Triggered', message: '5 failed login attempts detected from IP 185.220.101.4 targeting TechFlow Labs portal.', is_read: false, created_at: '2026-09-26T22:10:00Z', type: 'ALERT' },
];

export const NotificationCenterPage = () => {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/super-admin/notifications');
      if (res && res.success && Array.isArray(res.data?.notifications) && res.data.notifications.length > 0) {
        setNotifications(res.data.notifications);
      } else {
        setNotifications(MOCK_NOTIFICATIONS);
      }
    } catch {
      setNotifications(MOCK_NOTIFICATIONS);
    }
  };

  const handleMarkRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in text-slate-900">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E7EB]">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Notification Center</h1>
            <Badge variant="purple">{notifications.filter((n) => !n.is_read).length} UNREAD</Badge>
          </div>
          <p className="text-xs text-slate-700 mt-1">System warnings, company onboarding alerts, and security notifications.</p>
        </div>

        <Button variant="outline" size="sm" icon={CheckCircle2} onClick={handleMarkAllRead}>
          Mark All Read
        </Button>
      </div>

      <Card>
        <CardHeader title="Super Admin System Alerts" />
        <CardBody className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`p-4 rounded-xl border transition-all flex items-start justify-between text-xs gap-4 ${
                n.is_read
                  ? 'bg-slate-50 border-slate-200 text-slate-700'
                  : 'bg-white border-teal-500/40 text-slate-900 shadow-xs'
              }`}
            >
              <div className="flex items-start gap-3">
                {n.type === 'ALERT' ? (
                  <ShieldAlert className="w-5 h-5 text-rose-600 mt-0.5 shrink-0" />
                ) : n.type === 'WARNING' ? (
                  <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                ) : (
                  <Bell className={`w-5 h-5 mt-0.5 shrink-0 ${n.is_read ? 'text-slate-400' : 'text-teal-600'}`} />
                )}
                <div>
                  <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <span>{n.title}</span>
                    {!n.is_read && <Badge variant="primary">New</Badge>}
                  </div>
                  <p className="mt-1 text-slate-800 leading-relaxed font-medium">{n.message}</p>
                  <span className="block mt-1 font-mono text-[10px] text-slate-500 font-medium">
                    {new Date(n.created_at).toLocaleString()}
                  </span>
                </div>
              </div>

              {!n.is_read && (
                <Button
                  variant="ghost"
                  size="sm"
                  icon={CheckCircle2}
                  onClick={() => handleMarkRead(n.id)}
                >
                  Dismiss
                </Button>
              )}
            </div>
          ))}
        </CardBody>
      </Card>
    </div>
  );
};

export default NotificationCenterPage;
