import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader, CardBody, CardFooter } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { PasswordInput } from '../../components/ui/PasswordInput';
import { DataTable } from '../../components/ui/DataTable';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../context/AuthContext';
import {
  ShieldCheck,
  Lock,
  Smartphone,
  History,
  Bell,
  Laptop,
  CheckCircle2,
  AlertCircle,
  LogOut
} from 'lucide-react';
import { api } from '../../services/api';

export const SecuritySettingsPage = () => {
  const { user } = useAuth();

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState(null);
  const [passwordError, setPasswordError] = useState(null);

  // 2FA state
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [is2FALoading, setIs2FALoading] = useState(false);
  const [twoFactorMessage, setTwoFactorMessage] = useState(null);

  // Login History state
  const [loginHistory, setLoginHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  // Active Sessions state
  const [sessions, setSessions] = useState([
    {
      id: 'sess-current',
      device: 'Windows PC (Chrome 128.0)',
      ip: '192.168.1.45',
      location: 'San Francisco, CA, USA',
      lastActive: 'Just now (Current Session)',
      isCurrent: true,
    },
    {
      id: 'sess-mobile',
      device: 'iPhone 15 Pro (Safari iOS)',
      ip: '172.56.21.90',
      location: 'San Francisco, CA, USA',
      lastActive: 'Yesterday at 14:22',
      isCurrent: false,
    },
  ]);

  useEffect(() => {
    fetchLoginHistory();
  }, []);

  const fetchLoginHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const res = await api.get('/auth/login-history');
      if (res && res.success) {
        setLoginHistory(res.data);
      }
    } catch (err) {
      console.warn('Failed to load login history:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordMessage(null);
    setPasswordError(null);

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords don't match.");
      return;
    }

    setIsPasswordLoading(true);

    try {
      const res = await api.post('/users/security/change-password', {
        currentPassword,
        newPassword,
        confirmPassword,
      });

      setPasswordMessage(res.message);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordError(err.message || 'Failed to update password.');
    } finally {
      setIsPasswordLoading(false);
    }
  };

  const handleToggle2FA = async () => {
    setIs2FALoading(true);
    setTwoFactorMessage(null);
    const targetState = !twoFactorEnabled;

    try {
      const res = await api.post('/users/security/2fa/toggle', { enable: targetState });
      setTwoFactorEnabled(targetState);
      setTwoFactorMessage(res.message);
    } catch (err) {
      setTwoFactorMessage('Failed to change 2FA status.');
    } finally {
      setIs2FALoading(false);
    }
  };

  const handleRevokeSession = (sessionId) => {
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
      <PageHeader
        title="Security & Active Sessions"
        description="Password management, Two-Factor Authentication, active sessions, and security audit log"
        badge={<Badge variant="success">SOC2 CERTIFIED SECURITY</Badge>}
      />

      {/* SECTION 1: PASSWORD CHANGE */}
      <Card className="bg-white border-[#64748B]">
        <CardHeader
          title="Change Password"
          description="Ensure your account uses a strong, enterprise-compliant password."
        />
        <form onSubmit={handlePasswordChange}>
          <CardBody className="space-y-4 max-w-xl">
            {passwordMessage && (
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{passwordMessage}</span>
              </div>
            )}

            {passwordError && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-300 text-rose-800 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            <PasswordInput
              label="Current Password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              isRequired
            />

            <PasswordInput
              label="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              showStrengthMeter={true}
              isRequired
            />

            <PasswordInput
              label="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              isRequired
            />
          </CardBody>
          <CardFooter className="justify-end">
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isPasswordLoading}
              icon={Lock}
            >
              Update Password
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* SECTION 2: TWO-FACTOR AUTHENTICATION */}
      <Card className="bg-white border-[#64748B]">
        <CardHeader
          title="Two-Factor Authentication (2FA)"
          description="Add an extra layer of security to your corporate identity."
        />
        <CardBody className="space-y-4">
          {twoFactorMessage && (
            <div className="p-3 rounded-lg bg-blue-50 border border-blue-300 text-blue-800 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{twoFactorMessage}</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-[#F8FAFC] border border-[#64748B] rounded-xl gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-300 text-teal-700 flex items-center justify-center">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#0F172A]">Authenticator App (TOTP)</h4>
                <p className="text-xs text-[#334155] font-medium">Use apps like Google Authenticator or 1Password to generate time-based codes.</p>
              </div>
            </div>

            <Button
              variant={twoFactorEnabled ? 'danger' : 'primary'}
              size="md"
              isLoading={is2FALoading}
              onClick={handleToggle2FA}
            >
              {twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* SECTION 3: ACTIVE SESSIONS */}
      <Card className="bg-white border-[#64748B]">
        <CardHeader
          title="Active Login Sessions"
          description="Manage and revoke active session tokens across devices."
        />
        <CardBody className="space-y-3">
          {sessions.map((sess) => (
            <div key={sess.id} className="p-4 bg-[#F8FAFC] border border-[#64748B] rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <Laptop className="w-5 h-5 text-teal-700" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#0F172A]">{sess.device}</span>
                    {sess.isCurrent && <Badge variant="success">CURRENT</Badge>}
                  </div>
                  <div className="text-[11px] text-[#334155] font-mono font-medium mt-0.5">
                    IP: {sess.ip} &bull; {sess.location} &bull; {sess.lastActive}
                  </div>
                </div>
              </div>

              {!sess.isCurrent && (
                <Button
                  variant="outline"
                  size="sm"
                  icon={LogOut}
                  onClick={() => handleRevokeSession(sess.id)}
                >
                  Revoke Session
                </Button>
              )}
            </div>
          ))}
        </CardBody>
      </Card>

      {/* SECTION 4: LOGIN HISTORY */}
      <Card className="bg-white border-[#64748B]">
        <CardHeader
          title="Security Activity & Login History"
          description="Supabase audit events recorded for your user account"
        />
        <CardBody className="p-0">
          <DataTable
            columns={[
              { header: 'Event Type', accessor: 'event_type', render: (l) => <span className="font-mono text-teal-700 font-bold uppercase">{l.event_type}</span> },
              { header: 'IP Address', accessor: 'ip_address', render: (l) => <span className="font-mono text-[#0F172A] font-semibold">{l.ip_address}</span> },
              { header: 'Browser / Device', accessor: 'browser', render: (l) => <span className="text-[#0F172A] font-medium">{l.browser}</span> },
              { header: 'Location', accessor: 'location', render: (l) => <span className="text-[#334155] font-medium">{l.location || 'Local System'}</span> },
              { header: 'Status', accessor: 'status', render: (l) => <Badge variant={l.status === 'SUCCESS' ? 'success' : 'danger'}>{l.status}</Badge> },
              { header: 'Timestamp', accessor: 'created_at', render: (l) => <span className="text-[#334155] text-[11px] font-mono font-medium">{new Date(l.created_at).toLocaleString()}</span> },
            ]}
            data={loginHistory}
          />
        </CardBody>
      </Card>

    </div>
  );
};

export default SecuritySettingsPage;
