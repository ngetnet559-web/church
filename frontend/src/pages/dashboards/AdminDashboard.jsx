import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardPage from '../../components/dashboard/DashboardPage.jsx';
import { attendanceService } from '../../services/attendance.service.js';
import { certificateService } from '../../services/certificate.service.js';
import { notificationService } from '../../services/notification.service.js';
import AnnouncementBanner from '../../components/notifications/AnnouncementBanner.jsx';
import EventDashboardWidget from '../../components/events/EventDashboardWidget.jsx';
import RecentActivitiesWidget from '../../components/system/RecentActivitiesWidget.jsx';
import LoginHistoryWidget from '../../components/system/LoginHistoryWidget.jsx';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [certStats, setCertStats] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activities, setActivities] = useState([]);
  const [loginStats, setLoginStats] = useState({ total: 0, successful: 0, failedToday: 0, uniqueUsers: 0 });
  const [recentLogins, setRecentLogins] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(true);
  const [loadingLogin, setLoadingLogin] = useState(true);

  useEffect(() => {
    attendanceService.getStats().then((res) => setStats(res.data.stats)).catch(() => {});
    certificateService.getStats().then((res) => setCertStats(res.data.stats)).catch(() => {});
    notificationService.getUnreadCount().then((res) => setUnreadCount(res.data?.count || 0)).catch(() => {});
  }, []);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const res = await import('../../services/activity.service.js').then(m => m.getRecentActivities());
        const data = res.data?.activities || res.data || [];
        setActivities(Array.isArray(data) ? data : []);
      } catch { /* silent */ }
      setLoadingActivities(false);
    };
    const fetchLoginHistory = async () => {
      try {
        const res = await import('../../services/audit.service.js').then(m => m.getLoginHistory({ page: 1, limit: 5 }));
        const data = res.data || res;
        const logins = data.logins || data.loginHistory || data.records || [];
        setRecentLogins(Array.isArray(logins) ? logins : []);
        if (data.stats) {
          setLoginStats(data.stats);
        } else {
          const successful = (Array.isArray(logins) ? logins : []).filter(l => l.success === true).length;
          setLoginStats(prev => ({ ...prev, total: data.total || 0, successful }));
        }
      } catch { /* silent */ }
      setLoadingLogin(false);
    };
    fetchActivities();
    fetchLoginHistory();
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
      <AnnouncementBanner />
      <div className="grid gap-6 lg:grid-cols-2 transition-colors">
        <RecentActivitiesWidget activities={activities} loading={loadingActivities} />
        <LoginHistoryWidget stats={loginStats} recentLogins={recentLogins} loading={loadingLogin} />
      </div>
      <EventDashboardWidget />
      <div className="grid gap-6 lg:grid-cols-3 transition-colors">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-colors dark:border-slate-700 dark:bg-slate-900">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Notifications</h2>
          <p className="mt-2 text-3xl font-bold text-indigo-600 dark:text-indigo-400">{unreadCount}</p>
          <p className="text-sm text-slate-600 dark:text-slate-400">unread notifications</p>
          <div className="mt-4 flex gap-2">
            <Link to="/dashboard/notifications" className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-700">View All</Link>
            <Link to="/dashboard/notifications/send" className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800">Send</Link>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-colors dark:border-slate-700 dark:bg-slate-900">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Attendance Overview</h2>
          {stats ? (
            <div className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-300">
              <p>Monthly average: <strong>{stats.averageAttendancePercent}%</strong></p>
              <p>Students absent today: <strong>{stats.studentsAbsentToday.length}</strong></p>
            </div>
          ) : (
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Loading attendance data...</p>
          )}
          <Link to="/dashboard/attendance" className="mt-4 inline-flex text-sm font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300">
            View Attendance Dashboard →
          </Link>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-colors dark:border-slate-700 dark:bg-slate-900">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Quick Actions</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link to="/dashboard/attendance/sessions" className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-700">
              Manage Sessions
            </Link>
            <Link to="/dashboard/courses" className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800">
              View Courses
            </Link>
            <Link to="/dashboard/activity" className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800">
              Activity
            </Link>
          </div>
        </div>
      </div>
    </DashboardPage>
  );
}
