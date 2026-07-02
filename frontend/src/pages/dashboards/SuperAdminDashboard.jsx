import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardPage from '../../components/dashboard/DashboardPage.jsx';
import { attendanceService } from '../../services/attendance.service.js';
import { certificateService } from '../../services/certificate.service.js';

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState(null);
  const [certStats, setCertStats] = useState(null);

  useEffect(() => {
    attendanceService.getStats().then((res) => setStats(res.data.stats)).catch(() => {});
    certificateService.getStats().then((res) => setCertStats(res.data.stats)).catch(() => {});
  }, []);

  return (
    <DashboardPage
      title="Super Admin Dashboard"
      subtitle="Full system control — manage users, roles, and platform settings."
      stats={[
        { label: "Today's Attendance", value: stats ? `${stats.today.attendancePercent}%` : '—', description: 'System-wide today' },
        { label: 'Monthly Average', value: stats ? `${stats.averageAttendancePercent}%` : '—', description: 'All sessions this month' },
        { label: 'Certificates', value: certStats ? certStats.total : '—', description: certStats ? `${certStats.thisMonth} this month` : 'Loading...' },
      ]}
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Quick Actions</h2>
          <p className="mt-2 text-sm text-slate-600">
            Use the Users section to create admin accounts, assign roles, and deactivate users.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link to="/dashboard/users" className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-700">
              Manage Users
            </Link>
            <Link to="/dashboard/attendance" className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              Attendance Dashboard
            </Link>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">System Status</h2>
          <p className="mt-2 text-sm text-green-600 font-medium">All services operational</p>
          {stats && (
            <p className="mt-2 text-sm text-slate-600">
              {stats.studentsAbsentToday.length} students absent today across all sessions.
            </p>
          )}
        </div>
      </div>
    </DashboardPage>
  );
}
