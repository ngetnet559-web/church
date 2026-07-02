import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { attendanceService } from '../../services/attendance.service.js';
import { courseService } from '../../services/course.service.js';

const PROGRAM_TYPES = [
  'Sunday Service',
  'Bible Study',
  'Worship Practice',
  'Youth Meeting',
  'Teacher Training',
  'Prayer Meeting',
  'Special Event',
  'Other',
];

const SESSION_STATUS = ['Upcoming', 'Ongoing', 'Completed', 'Cancelled'];

const EMPTY_FORM = {
  title: '',
  description: '',
  programType: 'Sunday Service',
  date: '',
  startTime: '',
  endTime: '',
  location: '',
  courseId: '',
  status: 'Upcoming',
};

export default function AttendanceSessionsPage() {
  const [sessions, setSessions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [filter, setFilter] = useState('all');

  const loadSessions = async () => {
    try {
      setLoading(true);
      const res = await attendanceService.getSessions();
      setSessions(res.data.sessions);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
    courseService.getCourses().then((res) => setCourses(res.data.courses)).catch(() => {});
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form };
      if (!payload.courseId) delete payload.courseId;
      await attendanceService.createSession(payload);
      setForm(EMPTY_FORM);
      setShowForm(false);
      await loadSessions();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this session and all attendance records?')) return;
    try {
      await attendanceService.deleteSession(id);
      await loadSessions();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await attendanceService.updateSession(id, { status });
      await loadSessions();
    } catch (err) {
      setError(err.message);
    }
  };

  const filtered = sessions.filter((s) => {
    if (filter === 'all') return true;
    return s.status === filter;
  });

  const statusColor = (status) => {
    const colors = {
      Upcoming: 'bg-blue-50 text-blue-700',
      Ongoing: 'bg-green-50 text-green-700',
      Completed: 'bg-slate-100 text-slate-700',
      Cancelled: 'bg-red-50 text-red-700',
    };
    return colors[status] || 'bg-slate-100 text-slate-700';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Attendance Sessions</h1>
          <p className="mt-1 text-slate-600">Create and manage attendance sessions.</p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/dashboard/attendance"
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Dashboard
          </Link>
          <button
            type="button"
            onClick={() => setShowForm(!showForm)}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            {showForm ? 'Cancel' : '+ New Session'}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {showForm && (
        <form onSubmit={handleCreate} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">Create Session</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <input
              required
              placeholder="Session title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <select
              value={form.programType}
              onChange={(e) => setForm({ ...form, programType: e.target.value })}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              {PROGRAM_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <input
              required
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <input
              required
              type="time"
              value={form.startTime}
              onChange={(e) => setForm({ ...form, startTime: e.target.value })}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <input
              required
              type="time"
              value={form.endTime}
              onChange={(e) => setForm({ ...form, endTime: e.target.value })}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <input
              placeholder="Location"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <select
              value={form.courseId}
              onChange={(e) => setForm({ ...form, courseId: e.target.value })}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="">No course (general session)</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              {SESSION_STATUS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <textarea
            placeholder="Description (optional)"
            rows={2}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <button
            type="submit"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Create Session
          </button>
        </form>
      )}

      <div className="flex flex-wrap gap-2">
        {['all', ...SESSION_STATUS].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setFilter(s)}
            className={`rounded-full px-3 py-1 text-sm font-medium ${
              filter === s ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {s === 'all' ? 'All' : s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-600">
          No sessions found. Create your first attendance session.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((session) => (
            <div
              key={session.id}
              className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusColor(session.status)}`}>
                    {session.status}
                  </span>
                  <span className="text-xs text-slate-500">{session.programType}</span>
                </div>
                <p className="mt-1 font-semibold text-slate-900">{session.title}</p>
                <p className="text-sm text-slate-500">
                  {new Date(session.date).toLocaleDateString()} · {session.startTime} - {session.endTime}
                  {session.location && ` · ${session.location}`}
                </p>
                {session.course && (
                  <p className="text-xs text-indigo-600">Course: {session.course.title}</p>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {session.status === 'Upcoming' && (
                  <button
                    type="button"
                    onClick={() => handleStatusChange(session.id, 'Ongoing')}
                    className="rounded-lg bg-green-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-green-700"
                  >
                    Open Session
                  </button>
                )}
                <Link
                  to={`/dashboard/attendance/${session.id}`}
                  className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-700"
                >
                  Take Attendance
                </Link>
                <button
                  type="button"
                  onClick={() => handleDelete(session.id)}
                  className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-semibold text-red-600 hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
