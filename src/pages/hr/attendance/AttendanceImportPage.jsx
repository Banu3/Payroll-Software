import React, { useState } from 'react';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Card, CardHeader, CardBody } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Upload, FileSpreadsheet, CheckCircle, AlertTriangle, ArrowRight } from 'lucide-react';

export const AttendanceImportPage = () => {
  const [step, setStep] = useState(1);
  const [file, setFile] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [isImporting, setIsImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (!file) return;
    // Simulate parsed CSV data preview
    setPreviewData([
      { employee_id: 'EMP-1001', date: '2026-09-27', check_in: '09:00', check_out: '18:00', shift: 'General' },
      { employee_id: 'EMP-1002', date: '2026-09-27', check_in: '09:15', check_out: '18:05', shift: 'General' },
      { employee_id: 'EMP-1003', date: '2026-09-27', check_in: '22:00', check_out: '07:00', shift: 'Night Shift' },
    ]);
    setStep(2);
  };

  const handleImport = () => {
    setIsImporting(true);
    setTimeout(() => {
      setIsImporting(false);
      setImportSuccess(true);
      setStep(3);
    }, 1000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '900px', margin: '0 auto' }}>
      <PageHeader
        title="Import Attendance Logs"
        subtitle="Upload biometric raw logs or CSV/XLSX spreadsheets to bulk process employee attendance"
      />

      <Card style={{ borderTop: '4px solid var(--color-primary-600)' }}>
        <CardBody style={{ padding: '2rem' }}>
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', textAlign: 'center' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Upload size={32} style={{ color: 'var(--color-primary-600)' }} />
              </div>

              <div>
                <h3 style={{ margin: '0 0 0.5rem 0' }}>Upload CSV or XLSX File</h3>
                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  File must contain columns: Employee ID, Date, Check In, Check Out, Shift Code
                </p>
              </div>

              <input
                type="file"
                accept=".csv, .xlsx"
                onChange={handleFileChange}
                style={{ fontSize: '0.875rem' }}
              />

              <Button variant="primary" disabled={!file} onClick={handleUpload}>
                Next: Map & Preview <ArrowRight size={16} style={{ marginLeft: '0.375rem' }} />
              </Button>
            </div>
          )}

          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <h3 style={{ margin: 0 }}>Preview Parsed Records ({previewData.length} rows)</h3>

              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-main)', borderBottom: '1px solid var(--border-color)' }}>
                    <th style={{ padding: '0.75rem' }}>Employee ID</th>
                    <th style={{ padding: '0.75rem' }}>Date</th>
                    <th style={{ padding: '0.75rem' }}>Check In</th>
                    <th style={{ padding: '0.75rem' }}>Check Out</th>
                    <th style={{ padding: '0.75rem' }}>Shift</th>
                  </tr>
                </thead>
                <tbody>
                  {previewData.map((row, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '0.75rem', fontWeight: 600 }}>{row.employee_id}</td>
                      <td style={{ padding: '0.75rem' }}>{row.date}</td>
                      <td style={{ padding: '0.75rem' }}>{row.check_in}</td>
                      <td style={{ padding: '0.75rem' }}>{row.check_out}</td>
                      <td style={{ padding: '0.75rem' }}>{row.shift}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <Button variant="outline" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button variant="primary" disabled={isImporting} onClick={handleImport}>
                  {isImporting ? 'Processing...' : 'Confirm & Import Records'}
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', textAlign: 'center' }}>
              <CheckCircle size={48} style={{ color: 'var(--color-emerald-600)' }} />
              <h3 style={{ margin: 0 }}>Import Completed Successfully</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                3 attendance records have been calculated and inserted into the system.
              </p>
              <Button variant="primary" onClick={() => setStep(1)}>
                Import Another File
              </Button>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default AttendanceImportPage;
