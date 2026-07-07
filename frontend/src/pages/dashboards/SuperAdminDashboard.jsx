import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import DashboardPage from '../../components/dashboard/DashboardPage.jsx';
import { attendanceService } from '../../services/attendance.service.js';
import { certificateService } from '../../services/certificate.service.js';
import { notificationService } from '../../services/notification.service.js';
import AnnouncementBanner from '../../components/notifications/AnnouncementBanner.jsx';
import EventDashboardWidget from '../../components/events/EventDashboardWidget.jsx';
import RecentActivitiesWidget from '../../components/system/RecentActivitiesWidget.jsx';
import LoginHistoryWidget from '../../components/system/LoginHistoryWidget.jsx';
import ActiveUsersWidget from '../../components/system/ActiveUsersWidget.jsx';

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState(null);
  const [certStats, setCertStats] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activities, setActivities] = useState([]);
  const [loginStats, setLoginStats] = useState({ total: 0, successful: 0, failedToday: 0, uniqueUsers: 0 });
  const [recentLogins, setRecentLogins] = useState([]);
  const [activeUsers, setActiveUsers] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(true);
  const [loadingLogin, setLoadingLogin] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);

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
    const fetchActiveUsers = async () => {
      try {
        const res = await import('../../services/audit.service.js').then(m => m.getAuditStatistics());
        const data = res.data || {};
        setActiveUsers(data.recentLogs?.reduce((acc, l) => {
          if (l.user) {
            const existing = acc.find(u => u.name === l.user.name);
            if (existing) existing.actionCount = (existing.actionCount || 0) + 1;
            else acc.push({ name: l.user.name, role: '', actionCount: 1 });
          }
          return acc;
        }, []).sort((a, b) => (b.actionCount || 0) - (a.actionCount || 0)) || []);
      } catch { /* silent */ }
      setLoadingUsers(false);
    };
    fetchActivities();
    fetchLoginHistory();
    fetchActiveUsers();
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
      <AnnouncementBanner />
      <div className="grid gap-6 lg:grid-cols-3 transition-colors">
        <RecentActivitiesWidget activities={activities} loading={loadingActivities} />
        <LoginHistoryWidget stats={loginStats} recentLogins={recentLogins} loading={loadingLogin} />
        <ActiveUsersWidget users={activeUsers} loading={loadingUsers} />
      </div>
      <EventDashboardWidget />
      <div className="grid gap-6 lg:grid-cols-3 transition-colors">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-colors dark:border-slate-700 dark:bg-slate-900">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Notifications</h2>
          <p className="mt-2 text-3xl font-bold text-indigo-600 dark:text-indigo-400">{unreadCount}</p>
          <p className="text-sm text-slate-600 dark:text-slate-400">unread notifications</p>
          <div className="mt-4 flex gap-2">
            <Link to="/dashboard/notifications" className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-700">
              View All
            </Link>
            <Link to="/dashboard/notifications/send" className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800">
              Send
            </Link>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-colors dark:border-slate-700 dark:bg-slate-900">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Quick Actions</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Use the Users section to create admin accounts, assign roles, and deactivate users.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link to="/dashboard/users" className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-700">
              Manage Users
            </Link>
            <Link to="/dashboard/attendance" className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800">
              Attendance Dashboard
            </Link>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-colors dark:border-slate-700 dark:bg-slate-900">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Audit & Monitoring</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Track system activity, user actions, and login history.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link to="/dashboard/audit-logs" className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-700">
              Audit Logs
            </Link>
            <Link to="/dashboard/activity" className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800">
              Activity Timeline
            </Link>
            <Link to="/dashboard/login-history" className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800">
              Login History
            </Link>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-colors dark:border-slate-700 dark:bg-slate-900">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">System Status</h2>
          <p className="mt-2 text-sm text-green-600 font-medium dark:text-green-400">All services operational</p>
          {stats && (
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              {stats.studentsAbsentToday.length} students absent today across all sessions.
            </p>
          )}
        </div>
      </div>
    </DashboardPage>
  );
}
