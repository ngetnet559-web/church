import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardPage from '../../components/dashboard/DashboardPage.jsx';
import { attendanceService } from '../../services/attendance.service.js';

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

  useEffect(() => {
    let cancelled = false;

    const loadStats = async () => {
      setLoading(true);
      setError('');

      try {
        const res = await attendanceService.getStats();
        if (cancelled) return;
        setStats(normalizeStats(res?.data?.stats));
      } catch (err) {
        if (cancelled) return;
        setStats(DEFAULT_STATS);
        setError(err?.message || 'Failed to load attendance statistics.');
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadStats();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <DashboardPage title="Teacher Dashboard" subtitle="Manage your courses, attendance, and students.">
        <div className="flex justify-center py-12">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
        </div>
      </DashboardPage>
    );
  }

  if (error) {
    return (
      <DashboardPage title="Teacher Dashboard" subtitle="Manage your courses, attendance, and students.">
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
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
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Today&apos;s Schedule</h2>
          {absentToday.length > 0 ? (
            <ul className="mt-4 space-y-2">
              {absentToday.slice(0, 5).map((s, index) => (
                <li key={s?.id ?? `absent-${index}`} className="text-sm text-slate-600">
                  {s?.name ?? 'Unknown student'} — Absent
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-slate-600">No absences recorded today.</p>
          )}
          <Link
            to="/dashboard/attendance/sessions"
            className="mt-4 inline-flex text-sm font-medium text-indigo-600 hover:text-indigo-800"
          >
            Manage Sessions →
          </Link>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Top Attendance</h2>
          {topStudents.length > 0 ? (
            <ul className="mt-4 space-y-2">
              {topStudents.map((s, index) => (
                <li key={s?.id ?? `top-${index}`} className="flex justify-between text-sm">
                  <span>{s?.name ?? 'Unknown student'}</span>
                  <span className="font-semibold text-indigo-600">{s?.attendancePercent ?? 0}%</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-slate-600">No attendance data yet.</p>
          )}
        </div>
      </div>
    </DashboardPage>
  );
}
