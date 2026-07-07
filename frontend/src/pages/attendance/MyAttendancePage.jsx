import { useEffect, useMemo, useState } from "react";
import { attendanceService } from "../../services/attendance.service.js";
import TrendChart from "../../components/charts/TrendChart.jsx";

const STATUS_COLORS = {
  Present: "bg-green-500",
  Late: "bg-amber-500",
  Absent: "bg-red-500",
  Excused: "bg-blue-500",
};

export default function MyAttendancePage() {
  const [attendance, setAttendance] = useState(null);
  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [calendarMonth, setCalendarMonth] = useState(new Date());

  useEffect(() => {
    const load = async () => {
      try {
        const [attRes, upcomingRes] = await Promise.all([
          attendanceService.getMyAttendance(),
          attendanceService
            .getUpcomingSessions()
            .catch(() => ({ data: { sessions: [] } })),
        ]);
        setAttendance(attRes.data.attendance);
        setUpcoming(upcomingRes.data.sessions);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const calendarDays = useMemo(() => {
    if (!attendance) return [];
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPad = firstDay.getDay();
    const days = [];

    for (let i = 0; i < startPad; i += 1) days.push(null);
    for (let d = 1; d <= lastDay.getDate(); d += 1) {
      const date = new Date(year, month, d);
      const dateStr = date.toISOString().slice(0, 10);
      const records = attendance.history.filter(
        (r) =>
          r.sessionDate &&
          new Date(r.sessionDate).toISOString().slice(0, 10) === dateStr,
      );
      days.push({ day: d, date, records });
    }
    return days;
  }, [attendance, calendarMonth]);

  const trendData = useMemo(() => {
    if (!attendance?.history?.length) return [];
    const byWeek = {};
    attendance.history.forEach((record) => {
      if (!record.sessionDate) return;
      const d = new Date(record.sessionDate);
      const key = d.toISOString().slice(0, 10);
      if (!byWeek[key]) byWeek[key] = { total: 0, present: 0, date: key };
      byWeek[key].total += 1;
      if (record.status === "Present" || record.status === "Late")
        byWeek[key].present += 1;
    });
    return Object.values(byWeek)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-7)
      .map((entry) => ({
        date: entry.date,
        label: new Date(entry.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        attendancePercent:
          entry.total === 0
            ? 0
            : Math.round((entry.present / entry.total) * 100),
      }));
  }, [attendance]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6 transition-colors">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Attendance</h1>
        <p className="mt-1 text-slate-600 dark:text-slate-300">
          Your attendance summary, calendar, and upcoming meetings.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          label="Attendance %"
          value={`${attendance.attendancePercent}%`}
          highlight
        />
        <StatCard label="Present" value={attendance.presentCount} />
        <StatCard label="Late" value={attendance.lateCount} />
        <StatCard label="Absent" value={attendance.absentCount} />
        <StatCard label="Excused" value={attendance.excusedCount} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Calendar View
            </h2>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() =>
                  setCalendarMonth(
                    new Date(
                      calendarMonth.getFullYear(),
                      calendarMonth.getMonth() - 1,
                    ),
                  )
                }
                className="rounded px-2 py-1 text-sm text-slate-600 hover:bg-slate-100"
              >
                ←
              </button>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {calendarMonth.toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </span>
              <button
                type="button"
                onClick={() =>
                  setCalendarMonth(
                    new Date(
                      calendarMonth.getFullYear(),
                      calendarMonth.getMonth() + 1,
                    ),
                  )
                }
                className="rounded px-2 py-1 text-sm text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              >
                →
              </button>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-7 gap-1 text-center text-xs text-slate-500 dark:text-slate-400">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d} className="py-1 font-medium">
                {d}
              </div>
            ))}
            {calendarDays.map((cell, i) => (
              <div
                key={i}
                className={`min-h-12 rounded-lg p-1 ${
                  cell ? "border border-slate-100 bg-slate-50 dark:border-slate-700 dark:bg-slate-800" : ""
                }`}
              >
                {cell && (
                  <>
                    <span className="text-slate-700 dark:text-slate-300">{cell.day}</span>
                    <div className="mt-1 flex justify-center gap-0.5">
                      {cell.records.map((r) => (
                        <span
                          key={r.id}
                          className={`h-2 w-2 rounded-full ${STATUS_COLORS[r.status] || "bg-slate-300"}`}
                          title={`${r.sessionTitle}: ${r.status}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500 dark:text-slate-400">
            {Object.entries(STATUS_COLORS).map(([status, color]) => (
              <span key={status} className="flex items-center gap-1">
                <span className={`h-2 w-2 rounded-full ${color}`} />
                {status}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Upcoming Meetings
          </h2>
          {upcoming.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
              No upcoming sessions scheduled.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {upcoming.map((session) => (
                <li
                  key={session.id}
                  className="rounded-lg border border-slate-100 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800"
                >
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-400">
                      {session.status}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {session.programType}
                    </span>
                  </div>
                  <p className="mt-1 font-medium text-slate-900 dark:text-white">
                    {session.title}
                  </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                    {new Date(session.date).toLocaleDateString()} ·{" "}
                    {session.startTime} - {session.endTime}
                  </p>
                  {session.location && (
                    <p className="text-xs text-slate-500 dark:text-slate-400">{session.location}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {trendData.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Attendance Trend
          </h2>
          <div className="mt-4">
            <TrendChart data={trendData} />
          </div>
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          Attendance History
        </h2>
        {attendance.history.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
            No attendance history yet.
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {attendance.history.map((record) => (
              <div
                key={record.id}
                className="rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center">
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">
                      {record.sessionTitle}
                    </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                      {new Date(record.sessionDate).toLocaleDateString()}
                      {record.programType && ` · ${record.programType}`}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      record.status === "Present"
                        ? "bg-green-50 text-green-700"
                        : record.status === "Late"
                          ? "bg-amber-50 text-amber-700"
                          : record.status === "Excused"
                            ? "bg-blue-50 text-blue-700"
                            : "bg-red-50 text-red-700"
                    }`}
                  >
                    {record.status}
                  </span>
                </div>
                {record.notes && (
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    Notes: {record.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, highlight }) {
  return (
    <div
      className={`rounded-xl border p-6 shadow-sm transition-colors ${
        highlight
          ? "border-indigo-200 bg-indigo-50 dark:border-indigo-800 dark:bg-indigo-950"
          : "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
      }`}
    >
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
      <p
        className={`mt-3 text-3xl font-bold ${highlight ? "text-indigo-700 dark:text-indigo-300" : "text-slate-900 dark:text-white"}`}
      >
        {value}
      </p>
    </div>
  );
}
