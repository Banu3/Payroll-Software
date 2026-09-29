import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Badge } from '../../../components/ui/Badge';
import { Card, CardHeader, CardBody } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { DataTable } from '../../../components/ui/DataTable';
import { Fingerprint, Settings, Plus, RefreshCw, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { PermissionGate } from '../../../components/ui/PermissionGate';

export const BiometricSettingsPage = () => {
  const { company } = useAuth();
  const [devices, setDevices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState(null);

  useEffect(() => {
    // Simulated fetch - keeping it ready for real API
    setTimeout(() => {
      setDevices([
        { id: 'BIO-001', name: 'Main Gate Scanner', type: 'Fingerprint + Face', ipAddress: '192.168.1.50', port: '4370', branch: 'Chennai', status: 'ACTIVE', lastSync: new Date().toISOString() },
        { id: 'BIO-002', name: 'Floor 2 Terminal', type: 'Fingerprint', ipAddress: '192.168.1.51', port: '4370', branch: 'Chennai', status: 'INACTIVE', lastSync: null }
      ]);
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleSync = (deviceId) => {
    setSyncStatus('SYNCING');
    setTimeout(() => {
      setSyncStatus('FAILED'); // Real integration behavior as requested
    }, 1500);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Biometric Device Integration Architecture"
        description="Configure hardware biometric attendance devices and API integrations"
        badge={<Badge variant="primary">ATTENDANCE SETTINGS</Badge>}
        action={
          <PermissionGate permission="attendance.manage_settings">
            <Button variant="primary" icon={Plus}>Add Device</Button>
          </PermissionGate>
        }
      />

      {syncStatus === 'FAILED' && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 font-medium text-sm flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
          <span>Biometric device hardware is not configured or offline. Connection timed out.</span>
        </div>
      )}

      <Card>
        <CardHeader 
          title="Configured Biometric Devices" 
          description="Manage devices connected to your organization branches" 
        />
        <CardBody className="p-0">
          <DataTable
            columns={[
              { header: 'Device ID', accessor: 'id', render: (d) => <span className="font-mono text-xs font-semibold text-slate-700">{d.id}</span> },
              { header: 'Name', accessor: 'name', render: (d) => <span className="font-medium text-slate-900">{d.name}</span> },
              { header: 'Type', accessor: 'type' },
              { header: 'Branch', accessor: 'branch' },
              { header: 'Network', accessor: 'network', render: (d) => <span className="font-mono text-xs text-slate-500">{d.ipAddress}:{d.port}</span> },
              { header: 'Status', accessor: 'status', render: (d) => <Badge variant={d.status === 'ACTIVE' ? 'success' : 'neutral'}>{d.status}</Badge> },
              { 
                header: 'Actions', 
                accessor: 'actions',
                render: (d) => (
                  <Button variant="outline" size="xs" icon={RefreshCw} onClick={() => handleSync(d.id)}>
                    Sync Data
                  </Button>
                )
              }
            ]}
            data={devices}
            isLoading={isLoading}
          />
        </CardBody>
      </Card>
    </div>
  );
};

export default BiometricSettingsPage;
