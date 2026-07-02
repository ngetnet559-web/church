import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { attendanceService } from '../../services/attendance.service.js';
import { certificateService } from '../../services/certificate.service.js';
import BarChart from '../../components/charts/BarChart.jsx';
import TrendChart from '../../components/charts/TrendChart.jsx';

const DEFAULT_STATS = {
  today: { attendancePercent: 0, present: 0, late: 0, total: 0 },
  weekly: { attendancePercent: 0, total: 0 },
  monthly: { attendancePercent: 0, total: 0 },
  averageAttendancePercent: 0,
  trend: [],
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
      averageAttendancePercent: raw.averageAttendancePercent ?? raw.monthly?.attendancePercent ?? raw.attendancePercent ?? 0,
      trend: Array.isArray(raw.trend) ? raw.trend : [],
      studentsAbsentToday: Array.isArray(raw.studentsAbsentToday) ? raw.studentsAbsentToday : [],
      topAttendanceStudents: Array.isArray(raw.topAttendanceStudents) ? raw.topAttendanceStudents : [],
    };
  }

  const present = raw.present ?? 0;
  const late = raw.late ?? 0;
  const total = raw.total ?? 0;
  const attendancePercent = raw.attendancePercent ?? 0;
  const period = { attendancePercent, present, late, total };

  return {
    today: period,
    weekly: { attendancePercent, total },
    monthly: { attendancePercent, total },
    averageAttendancePercent: attendancePercent,
    trend: [],
    studentsAbsentToday: [],
    topAttendanceStudents: [],
  };
}

function normalizeCertStats(raw) {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  return {
    total: raw.total ?? 0,
    thisMonth: raw.thisMonth ?? 0,
    thisYear: raw.thisYear ?? 0,
    monthlyBreakdown: Array.isArray(raw.monthlyBreakdown) ? raw.monthlyBreakdown : [],
  };
}

function getErrorMessage(err) {
  if (err?.status === 403) {
    return 'Access denied. You do not have permission to view this data.';
  }
  return err?.message || 'Unable to load attendance data.';
}

export default function AttendanceDashboardPage() {
  const [stats, setStats] = useState(DEFAULT_STATS);
  const [certStats, setCertStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError('');

      try {
        const [attRes, certRes] = await Promise.all([
          attendanceService.getStats(),
          certificateService.getStats().catch(() => null),
        ]);

        if (cancelled) return;

        setStats(normalizeStats(attRes?.data?.stats));
        setCertStats(normalizeCertStats(certRes?.data?.stats));
      } catch (err) {
        if (cancelled) return;
        setStats(DEFAULT_STATS);
        setCertStats(null);
        setError(getErrorMessage(err));
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Attendance Dashboard</h1>
          <p className="mt-1 text-slate-600">Overview of attendance and certificates.</p>
        </div>
        <div className="flex justify-center py-12">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Attendance Dashboard</h1>
          <p className="mt-1 text-slate-600">Overview of attendance and certificates.</p>
        </div>
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        <Link
          to="/dashboard/attendance/sessions"
          className="inline-flex rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          Manage Sessions
        </Link>
      </div>
    );
  }

  const todayPresent = (stats?.today?.present ?? 0) + (stats?.today?.late ?? 0);
  const absentToday = Array.isArray(stats?.studentsAbsentToday) ? stats.studentsAbsentToday : [];
  const topStudents = Array.isArray(stats?.topAttendanceStudents) ? stats.topAttendanceStudents : [];
  const trend = Array.isArray(stats?.trend) ? stats.trend : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Attendance Dashboard</h1>
          <p className="mt-1 text-slate-600">Overview of attendance and certificates.</p>
        </div>
        <Link
          to="/dashboard/attendance/sessions"
          className="inline-flex rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          Manage Sessions
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Today's Attendance"
          value={`${stats?.today?.attendancePercent ?? 0}%`}
          sub={`${todayPresent} present / ${stats?.today?.total ?? 0} total`}
        />
        <StatCard
          label="Weekly Average"
          value={`${stats?.weekly?.attendancePercent ?? 0}%`}
          sub={`${stats?.weekly?.total ?? 0} records this week`}
        />
        <StatCard
          label="Monthly Average"
          value={`${stats?.monthly?.attendancePercent ?? 0}%`}
          sub={`${stats?.monthly?.total ?? 0} records this month`}
        />
        <StatCard
          label="Overall Average"
          value={`${stats?.averageAttendancePercent ?? 0}%`}
          sub="Monthly attendance rate"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Attendance Trend (7 Days)</h2>
          <div className="mt-4">
            <TrendChart data={trend} />
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Certificates Issued</h2>
          {certStats ? (
            <div className="mt-4">
              <div className="mb-4 grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-slate-900">{certStats.total ?? 0}</p>
                  <p className="text-xs text-slate-500">Total</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{certStats.thisMonth ?? 0}</p>
                  <p className="text-xs text-slate-500">This Month</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{certStats.thisYear ?? 0}</p>
                  <p className="text-xs text-slate-500">This Year</p>
                </div>
              </div>
              <BarChart data={certStats.monthlyBreakdown ?? []} color="bg-emerald-500" />
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-500">Certificate stats unavailable.</p>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Students Absent Today</h2>
          {absentToday.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">No absences recorded today.</p>
          ) : (
            <ul className="mt-4 space-y-2">
              {absentToday.map((student, index) => (
                <li
                  key={student?.id ?? `absent-${index}`}
                  className="flex items-center justify-between rounded-lg bg-red-50 px-4 py-2 text-sm"
                >
                  <span className="font-medium text-slate-900">{student?.name ?? 'Unknown student'}</span>
                  <span className="text-slate-500">{student?.email ?? '—'}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Top Attendance Students</h2>
          {topStudents.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">No attendance data yet.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {topStudents.map((student, index) => (
                <li key={student?.id ?? `top-${index}`} className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">{student?.name ?? 'Unknown student'}</p>
                    <div className="mt-1 h-2 rounded-full bg-slate-100">
                      <div
                        className="h-2 rounded-full bg-indigo-500"
                        style={{ width: `${student?.attendancePercent ?? 0}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-indigo-600">
                    {student?.attendancePercent ?? 0}%
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
      {sub && <p className="mt-1 text-xs text-slate-500">{sub}</p>}
    </div>
  );
}
