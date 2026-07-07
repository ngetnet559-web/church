import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardPage from '../../components/dashboard/DashboardPage.jsx';
import { attendanceService } from '../../services/attendance.service.js';
import { notificationService } from '../../services/notification.service.js';
import AnnouncementBanner from '../../components/notifications/AnnouncementBanner.jsx';
import EventDashboardWidget from '../../components/events/EventDashboardWidget.jsx';

const DEFAULT_STATS = {
  today: { attendancePercent: 0, present: 0, late: 0, total: 0 },
  weekly: { attendancePercent: 0, total: 0 },
  monthly: { attendancePercent: 0, total: 0 },
  studentsAbsentToday: [],
  topAttendanceStudents: [],
};

function normalizeStats(raw) {
  if (!raw || typeof raw !== 'object') {
    return DEFAULT_STATS;
  }

  if (raw.today && typeof raw.today === 'object') {
    return {
      today: {
        attendancePercent: raw.today?.attendancePercent ?? 0,
        present: raw.today?.present ?? 0,
        late: raw.today?.late ?? 0,
        total: raw.today?.total ?? 0,
      },
      weekly: {
        attendancePercent: raw.weekly?.attendancePercent ?? 0,
        total: raw.weekly?.total ?? 0,
      },
      monthly: {
        attendancePercent: raw.monthly?.attendancePercent ?? 0,
        total: raw.monthly?.total ?? 0,
      },
      studentsAbsentToday: Array.isArray(raw.studentsAbsentToday) ? raw.studentsAbsentToday : [],
      topAttendanceStudents: Array.isArray(raw.topAttendanceStudents) ? raw.topAttendanceStudents : [],
    };
  }

  const present = raw.present ?? 0;
  const late = raw.late ?? 0;
  const total = raw.total ?? 0;
  const attendancePercent = raw.attendancePercent ?? 0;

  return {
    today: { attendancePercent, present, late, total },
    weekly: { attendancePercent, total },
    monthly: { attendancePercent, total },
    studentsAbsentToday: [],
    topAttendanceStudents: [],
  };
}

export default function TeacherDashboard() {
  const [stats, setStats] = useState(DEFAULT_STATS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      setLoading(true);
      setError('');

      try {
        const [statsRes, notifRes] = await Promise.all([
          attendanceService.getStats(),
          notificationService.getUnreadCount().catch(() => ({ data: { count: 0 } })),
        ]);
        if (cancelled) return;
        setStats(normalizeStats(statsRes?.data?.stats));
        setUnreadCount(notifRes?.data?.count || 0);
      } catch (err) {
        if (cancelled) return;
        setStats(DEFAULT_STATS);
        setError(err?.message || 'Failed to load data.');
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <DashboardPage title="Teacher Dashboard" subtitle="Manage your courses, attendance, and students.">
        <div className="flex justify-center py-12">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600 dark:border-indigo-800 dark:border-t-indigo-400" />
        </div>
      </DashboardPage>
    );
  }

  if (error) {
    return (
      <DashboardPage title="Teacher Dashboard" subtitle="Manage your courses, attendance, and students.">
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">{error}</div>
      </DashboardPage>
    );
  }

  const todayPresent = (stats?.today?.present ?? 0) + (stats?.today?.late ?? 0);
  const absentToday = Array.isArray(stats?.studentsAbsentToday) ? stats.studentsAbsentToday : [];
  const topStudents = Array.isArray(stats?.topAttendanceStudents) ? stats.topAttendanceStudents : [];

  return (
    <DashboardPage
      title="Teacher Dashboard"
      subtitle="Manage your courses, attendance, and students."
      stats={[
        {
          label: "Today's Attendance",
          value: `${stats?.today?.attendancePercent ?? 0}%`,
          description: `${todayPresent} present today`,
        },
        {
          label: 'Weekly Average',
          value: `${stats?.weekly?.attendancePercent ?? 0}%`,
          description: 'Your sessions this week',
        },
        {
          label: 'Monthly Average',
          value: `${stats?.monthly?.attendancePercent ?? 0}%`,
          description: 'Your sessions this month',
        },
      ]}
    >
      <AnnouncementBanner />
      <EventDashboardWidget />
      <div className="grid gap-6 lg:grid-cols-3 transition-colors">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-colors dark:border-slate-700 dark:bg-slate-900">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Notifications</h2>
          <p className="mt-2 text-3xl font-bold text-indigo-600 dark:text-indigo-400">{unreadCount}</p>
          <p className="text-sm text-slate-600 dark:text-slate-400">unread notifications</p>
          <Link to="/dashboard/notifications" className="mt-4 inline-flex text-sm font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300">
            View All →
          </Link>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-colors dark:border-slate-700 dark:bg-slate-900">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Today&apos;s Schedule</h2>
          {absentToday.length > 0 ? (
            <ul className="mt-4 space-y-2">
              {absentToday.slice(0, 5).map((s, index) => (
                <li key={s?.id ?? `absent-${index}`} className="text-sm text-slate-600 dark:text-slate-300">
                  {s?.name ?? 'Unknown student'} — Absent
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">No absences recorded today.</p>
          )}
          <Link
            to="/dashboard/attendance/sessions"
            className="mt-4 inline-flex text-sm font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            Manage Sessions →
          </Link>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-colors dark:border-slate-700 dark:bg-slate-900">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Top Attendance</h2>
          {topStudents.length > 0 ? (
            <ul className="mt-4 space-y-2">
              {topStudents.map((s, index) => (
                <li key={s?.id ?? `top-${index}`} className="flex justify-between text-sm">
                  <span>{s?.name ?? 'Unknown student'}</span>
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400">{s?.attendancePercent ?? 0}%</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">No attendance data yet.</p>
          )}
        </div>
      </div>
    </DashboardPage>
  );
}
