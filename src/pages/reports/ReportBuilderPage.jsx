import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  SlidersHorizontal,
  Play,
  Save,
  Download,
  Loader2
} from 'lucide-react';
import api from '../../lib/axios';
import { formatCurrency } from '../../services/financialCalculationService';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';

const DATA_SOURCES = [
  { id: 'EMPLOYEES', name: 'Employees Directory', fields: ['first_name', 'last_name', 'employee_code', 'email', 'status', 'joining_date'] },
  { id: 'PAYROLL', name: 'Payroll Run Calculations', fields: ['basic_salary', 'gross_earnings', 'total_deductions', 'net_salary', 'paid_days', 'lop_days'] },
  { id: 'ATTENDANCE', name: 'Attendance Records', fields: ['date', 'status', 'check_in', 'check_out', 'work_duration_minutes', 'overtime_minutes'] },
  { id: 'LEAVE', name: 'Leave Requests', fields: ['leave_type_id', 'start_date', 'end_date', 'total_days', 'status', 'reason'] },
  { id: 'PAYMENTS', name: 'Payment Transactions', fields: ['employee_name', 'bank_name', 'masked_account_number', 'amount', 'status'] }
];

export default function ReportBuilderPage() {
  const queryClient = useQueryClient();

  const [reportName, setReportName] = useState('Custom Workforce & Payroll Report');
  const [dataSource, setDataSource] = useState('PAYROLL');
  const [selectedFields, setSelectedFields] = useState([]);
  const [previewData, setPreviewData] = useState(null);

  // Execute Safe Query Mutation
  const executeMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/reports/builder/execute', {
        dataSource,
        selectedFields,
        filters: []
      });
      return res.data?.data || res.data || [];
    },
    onSuccess: (data) => {
      setPreviewData(data);
    }
  });

  // Save Report Config Mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/reports/reports-save', {
        name: reportName,
        dataSource,
        selectedFields: selectedFields.length > 0 ? selectedFields : DATA_SOURCES.find((d) => d.id === dataSource)?.fields || [],
        visibility: 'COMPANY'
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-reports'] });
      alert('Custom report saved successfully.');
    }
  });

  // Export CSV Mutation
  const exportMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/reports/export', {
        reportName,
        dataSource
      });
      return res.data?.data || res.data;
    },
    onSuccess: (data) => {
      const csvContent = data.csvContent;
      if (csvContent) {
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', data.fileName || 'Report_Export.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
  });

  const activeSourceObj = DATA_SOURCES.find((d) => d.id === dataSource);

  return (
    <div className="space-y-6 animate-fade-in text-[#12201A]">
      {/* Header */}
      <PageHeader
        title="Custom Report Builder"
        description="Build, preview, save, and export safe parameterized reports without raw SQL risks."
        badge={<Badge variant="primary">REPORT BUILDER</Badge>}
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              icon={Save}
              isLoading={saveMutation.isPending}
              onClick={() => saveMutation.mutate()}
            >
              Save Report
            </Button>
            <Button
              variant="primary"
              icon={Download}
              isLoading={exportMutation.isPending}
              onClick={() => exportMutation.mutate()}
            >
              Export CSV
            </Button>
          </div>
        }
      />

      {/* Builder Configuration Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Step 1: Select Data Source & Name */}
        <Card>
          <CardHeader title="1. Report Name & Data Source" description="Define dataset and report title" />
          <CardBody className="space-y-4">
            <Input
              label="Report Title"
              value={reportName}
              onChange={(e) => setReportName(e.target.value)}
            />

            <Select
              label="Data Source"
              value={dataSource}
              onChange={(e) => {
                setDataSource(e.target.value);
                setSelectedFields([]);
              }}
              options={DATA_SOURCES.map((d) => ({ value: d.id, label: d.name }))}
            />
          </CardBody>
        </Card>

        {/* Step 2: Select Fields */}
        <Card className="md:col-span-2">
          <CardHeader title="2. Choose Output Fields" description="Select columns for final report table" />
          <CardBody className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
              {activeSourceObj?.fields.map((f) => {
                const isChecked = selectedFields.includes(f);
                return (
                  <label key={f} className={`p-3 rounded-[10px] border cursor-pointer text-xs transition select-none flex items-center gap-2 ${
                    isChecked
                      ? 'bg-[#E5F4EE] border-[#CFE6DC] text-[#167C63] font-semibold'
                      : 'bg-[#F3F7F5] border-[#CBD8D1] text-[#33413A] hover:bg-[#F0F6F3]'
                  }`}>
                    <input
                      type="checkbox"
                      className="accent-[#167C63] w-3.5 h-3.5"
                      checked={isChecked}
                      onChange={() => {
                        if (isChecked) setSelectedFields(selectedFields.filter((item) => item !== f));
                        else setSelectedFields([...selectedFields, f]);
                      }}
                    />
                    <span className="font-mono text-[11px] truncate">{f}</span>
                  </label>
                );
              })}
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                variant="primary"
                icon={Play}
                isLoading={executeMutation.isPending}
                onClick={() => executeMutation.mutate()}
              >
                Execute Query Preview
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Query Preview Table */}
      {previewData && (
        <Card>
          <CardHeader title={`Query Preview Results (${previewData.length} records)`} description="First 10 records preview" />
          <CardBody className="p-0">
            {previewData.length === 0 ? (
              <div className="p-8 text-center text-[#5A6A61] text-xs">No records matched report parameters.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-[#12201A]">
                  <thead className="bg-[#F3F7F5] text-[#5A6A61] uppercase text-[11px] font-semibold tracking-wider border-b border-[#BCCBC3]">
                    <tr>
                      {Object.keys(previewData[0]).slice(0, 8).map((col) => (
                        <th key={col} className="px-4 py-3">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E1E9E4] font-mono">
                    {previewData.slice(0, 10).map((row, idx) => (
                      <tr key={idx} className="hover:bg-[#F4F8F5] transition h-11">
                        {Object.values(row).slice(0, 8).map((val, cIdx) => (
                          <td key={cIdx} className="px-4 py-2.5">
                            {typeof val === 'number' ? formatCurrency(val) : String(val ?? '')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardBody>
        </Card>
      )}
    </div>
  );
}
