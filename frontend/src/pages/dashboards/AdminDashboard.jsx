import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardPage from '../../components/dashboard/DashboardPage.jsx';
import { attendanceService } from '../../services/attendance.service.js';
import { certificateService } from '../../services/certificate.service.js';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [certStats, setCertStats] = useState(null);

  useEffect(() => {
    attendanceService.getStats().then((res) => setStats(res.data.stats)).catch(() => {});
    certificateService.getStats().then((res) => setCertStats(res.data.stats)).catch(() => {});
  }, []);

  return (
    <DashboardPage
      title="Admin Dashboard"
      subtitle="Manage teachers, students, and school operations."
      stats={[
        { label: "Today's Attendance", value: stats ? `${stats.today.attendancePercent}%` : '—', description: stats ? `${stats.today.total} records today` : 'Loading...' },
        { label: 'Weekly Average', value: stats ? `${stats.weekly.attendancePercent}%` : '—', description: stats ? `${stats.weekly.total} records this week` : 'Loading...' },
        { label: 'Certificates Issued', value: certStats ? certStats.thisMonth : '—', description: certStats ? `${certStats.total} total certificates` : 'Loading...' },
      ]}
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Attendance Overview</h2>
          {stats ? (
            <div className="mt-4 space-y-2 text-sm text-slate-600">
              <p>Monthly average: <strong>{stats.averageAttendancePercent}%</strong></p>
              <p>Students absent today: <strong>{stats.studentsAbsentToday.length}</strong></p>
            </div>
          ) : (
            <p className="mt-2 text-sm text-slate-600">Loading attendance data...</p>
          )}
          <Link to="/dashboard/attendance" className="mt-4 inline-flex text-sm font-medium text-indigo-600 hover:text-indigo-800">
            View Attendance Dashboard →
          </Link>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Quick Actions</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link to="/dashboard/attendance/sessions" className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-700">
              Manage Sessions
            </Link>
            <Link to="/dashboard/courses" className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              View Courses
            </Link>
          </div>
        </div>
      </div>
    </DashboardPage>
  );
}
