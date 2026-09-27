import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Card, CardHeader, CardBody } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Select } from '../../../components/ui/Select';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { api } from '../../../services/api';

export const AttendanceCalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('Month'); // 'Month' | 'Week' | 'Day'
  const [attendanceEvents, setAttendanceEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  useEffect(() => {
    fetchCalendarData();
  }, [currentDate, viewMode]);

  const fetchCalendarData = async () => {
    setIsLoading(true);
    try {
      const firstDay = new Date(year, month, 1).toISOString().split('T')[0];
      const lastDay = new Date(year, month + 1, 0).toISOString().split('T')[0];
      const res = await api.get(`/attendance/rosters?startDate=${firstDay}&endDate=${lastDay}`);
      if (res && res.success) {
        setAttendanceEvents(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch calendar events:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getDaysInMonth = () => {
    const days = [];
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < firstDayIndex; i++) {
      days.push(null);
    }
    for (let d = 1; d <= totalDays; d++) {
      days.push(d);
    }
    return days;
  };

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader
        title="Attendance Calendar View"
        subtitle="Visual month/week/day attendance status breakdown"
        actions={
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Select value={viewMode} onChange={(e) => setViewMode(e.target.value)}>
              <option value="Month">Month View</option>
              <option value="Week">Week View</option>
              <option value="Day">Day View</option>
            </Select>
            <Button variant="outline" size="sm" onClick={prevMonth}>
              <ChevronLeft size={16} />
            </Button>
            <span style={{ fontWeight: 600, minWidth: '130px', textAlign: 'center' }}>
              {monthName} {year}
            </span>
            <Button variant="outline" size="sm" onClick={nextMonth}>
              <ChevronRight size={16} />
            </Button>
          </div>
        }
      />

      {/* Status Legend */}
      <Card>
        <CardBody style={{ padding: '0.75rem 1rem', display: 'flex', gap: '1.25rem', flexWrap: 'wrap', alignItems: 'center', fontSize: '0.8125rem' }}>
          <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Status Indicators:</span>
          <span><Badge variant="success">✓ Present</Badge></span>
          <span><Badge variant="danger">× Absent</Badge></span>
          <span><Badge variant="warning">L Late</Badge></span>
          <span><Badge variant="secondary">H Holiday</Badge></span>
          <span><Badge variant="purple">O Overtime</Badge></span>
          <span><Badge variant="info">WFH Work From Home</Badge></span>
          <span><Badge variant="info">LVE Leave</Badge></span>
        </CardBody>
      </Card>

      {/* Calendar Grid */}
      <Card>
        <CardBody style={{ padding: 0 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', background: 'var(--bg-main)', borderBottom: '1px solid var(--border-color)', textAlign: 'center', fontWeight: 600, padding: '0.75rem 0' }}>
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px', background: 'var(--border-color)' }}>
            {getDaysInMonth().map((day, idx) => (
              <div
                key={idx}
                style={{
                  minHeight: '100px',
                  background: day ? 'var(--bg-card)' : 'var(--bg-main)',
                  padding: '0.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.25rem',
                }}
              >
                {day && (
                  <>
                    <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>{day}</span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                      {/* Sample indicators per date */}
                      {day % 7 === 0 ? (
                        <Badge variant="secondary">Weekly Off</Badge>
                      ) : day === 15 ? (
                        <Badge variant="secondary">H Holiday</Badge>
                      ) : (
                        <Badge variant="success">✓ Present</Badge>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default AttendanceCalendarPage;
