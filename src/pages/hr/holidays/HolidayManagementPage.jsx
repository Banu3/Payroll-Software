import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Card, CardHeader, CardBody } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Modal } from '../../../components/ui/Modal';
import { Plus, Trash2, Calendar, FileSpreadsheet } from 'lucide-react';
import { api } from '../../../services/api';

export const HolidayManagementPage = () => {
  const [holidays, setHolidays] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [form, setForm] = useState({
    name: '',
    date: new Date().toISOString().split('T')[0],
    type: 'PUBLIC',
    description: '',
  });

  useEffect(() => {
    fetchHolidays();
  }, []);

  const fetchHolidays = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/attendance/holidays');
      if (res && res.success) {
        setHolidays(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch holidays:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateHoliday = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/attendance/holidays', form);
      if (res && res.success) {
        setIsModalOpen(false);
        fetchHolidays();
        setForm({
          name: '',
          date: new Date().toISOString().split('T')[0],
          type: 'PUBLIC',
          description: '',
        });
      }
    } catch (err) {
      alert(err.message || 'Failed to create holiday');
    }
  };

  const handleDeleteHoliday = async (id) => {
    if (!window.confirm('Are you sure you want to delete this holiday?')) return;
    try {
      await api.delete(`/attendance/holidays/${id}`);
      fetchHolidays();
    } catch (err) {
      alert(err.message || 'Failed to delete holiday');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader
        title="Holiday Management"
        subtitle="Configure public, company, and optional holidays across company branches"
        actions={
          <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)}>
            <Plus size={14} style={{ marginRight: '0.375rem' }} />
            Add Holiday
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <h3 style={{ margin: 0, fontSize: '1.125rem' }}>Company Holiday Calendar List</h3>
        </CardHeader>
        <CardBody style={{ padding: 0 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ background: 'var(--bg-main)', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '0.75rem 1rem' }}>Holiday Name</th>
                <th style={{ padding: '0.75rem 1rem' }}>Date</th>
                <th style={{ padding: '0.75rem 1rem' }}>Type</th>
                <th style={{ padding: '0.75rem 1rem' }}>Branch</th>
                <th style={{ padding: '0.75rem 1rem' }}>Description</th>
                <th style={{ padding: '0.75rem 1rem' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {holidays.map((h) => (
                <tr key={h.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>{h.name}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>{h.date}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <Badge variant={h.type === 'PUBLIC' ? 'primary' : h.type === 'COMPANY' ? 'purple' : 'secondary'}>
                      {h.type}
                    </Badge>
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>{h.branch?.name || 'All Branches'}</td>
                  <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>{h.description || '—'}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <Button size="sm" variant="ghost" onClick={() => handleDeleteHoliday(h.id)}>
                      <Trash2 size={14} style={{ color: 'var(--color-rose-600)' }} />
                    </Button>
                  </td>
                </tr>
              ))}
              {holidays.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No holidays configured yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardBody>
      </Card>

      {/* Create Holiday Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Company Holiday">
        <form onSubmit={handleCreateHoliday} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Holiday Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Independence Day"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Date</label>
              <input
                type="date"
                required
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Holiday Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
              >
                <option value="PUBLIC">Public Holiday</option>
                <option value="COMPANY">Company Holiday</option>
                <option value="OPTIONAL">Optional Holiday</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Description (Optional)</label>
            <textarea
              rows={2}
              placeholder="Notes or description..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Holiday
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default HolidayManagementPage;
