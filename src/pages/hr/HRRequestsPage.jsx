import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { DataTable } from '../../components/ui/DataTable';
import { FileCheck, CheckCircle2, XCircle } from 'lucide-react';
import { api } from '../../services/api';

export const HRRequestsPage = () => {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await api.get('/hr/requests');
      if (res && res.success) {
        setRequests(res.data);
      }
    } catch (err) {
      console.warn('Requests fetch warning:', err);
    }
  };

  const handleAction = (id, status) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r))
    );
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-100">
      <PageHeader
        title="Employee Requests & Approval Queue"
        description="Profile update, bank details change, and document verification approvals"
        badge={<Badge variant="primary">APPROVAL QUEUE</Badge>}
      />

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader title="Pending HR Approvals" />
        <CardBody className="p-0">
          <DataTable
            columns={[
              { header: 'Employee', accessor: 'employee', render: (r) => <span className="font-semibold text-slate-100">{r.employee}</span> },
              { header: 'Request Category', accessor: 'request_type', render: (r) => <Badge variant="purple">{r.request_type}</Badge> },
              { header: 'Request Details', accessor: 'details', render: (r) => <span className="text-slate-300">{r.details}</span> },
              { header: 'Status', accessor: 'status', render: (r) => <Badge variant={r.status === 'APPROVED' ? 'success' : r.status === 'REJECTED' ? 'danger' : 'warning'}>{r.status}</Badge> },
              {
                header: 'Action',
                accessor: 'actions',
                render: (r) =>
                  r.status === 'PENDING' ? (
                    <div className="flex items-center gap-1.5">
                      <Button variant="primary" size="sm" icon={CheckCircle2} onClick={() => handleAction(r.id, 'APPROVED')}>
                        Approve
                      </Button>
                      <Button variant="outline" size="sm" icon={XCircle} onClick={() => handleAction(r.id, 'REJECTED')}>
                        Reject
                      </Button>
                    </div>
                  ) : (
                    <span className="text-[11px] text-slate-500 italic">Completed</span>
                  ),
              },
            ]}
            data={requests}
          />
        </CardBody>
      </Card>
    </div>
  );
};

export default HRRequestsPage;
