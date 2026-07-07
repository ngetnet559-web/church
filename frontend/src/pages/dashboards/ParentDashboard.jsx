import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardPage from '../../components/dashboard/DashboardPage.jsx';
import { notificationService } from '../../services/notification.service.js';
import AnnouncementBanner from '../../components/notifications/AnnouncementBanner.jsx';
import EventDashboardWidget from '../../components/events/EventDashboardWidget.jsx';

export default function ParentDashboard() {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    notificationService.getUnreadCount().then((res) => setUnreadCount(res.data?.count || 0)).catch(() => {});
  }, []);

  return (
    <DashboardPage
      title="Parent Dashboard"
      subtitle="Monitor your children's attendance and learning progress."
      stats={[
        { label: 'Children', value: '—', description: 'Coming soon' },
        { label: 'Attendance', value: '—', description: 'Coming soon' },
        { label: 'Progress', value: '—', description: 'Coming soon' },
      ]}
    >
      <AnnouncementBanner />
      <EventDashboardWidget />
      <div className="grid gap-6 lg:grid-cols-2 transition-colors">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-colors dark:border-slate-700 dark:bg-slate-900">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Notifications</h2>
          <p className="mt-2 text-3xl font-bold text-indigo-600 dark:text-indigo-400">{unreadCount}</p>
          <p className="text-sm text-slate-600 dark:text-slate-400">unread notifications</p>
          <Link to="/dashboard/notifications" className="mt-4 inline-flex text-sm font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300">
            View All →
          </Link>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-colors dark:border-slate-700 dark:bg-slate-900">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Family Overview</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Your children&apos;s attendance and progress reports will appear here.
          </p>
        </div>
      </div>
    </DashboardPage>
  );
}
