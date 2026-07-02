import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { attendanceService } from '../../services/attendance.service.js';

const ATTENDANCE_STATUS = ['Present', 'Late', 'Absent', 'Excused'];

export default function TakeAttendancePage() {
  const { id } = useParams();
  const [session, setSession] = useState(null);
  const [attendanceMap, setAttendanceMap] = useState({});
  const [notesMap, setNotesMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [bulkStatus, setBulkStatus] = useState('Present');

  const loadSession = async () => {
    try {
      setLoading(true);
      const res = await attendanceService.getSession(id);
      setSession(res.data.session);
      const initial = {};
      const notes = {};
      res.data.session.enrolledStudents?.forEach((student) => {
        initial[student.id] = student.attendance?.status || 'Absent';
        notes[student.id] = student.attendance?.notes || '';
      });
      setAttendanceMap(initial);
      setNotesMap(notes);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSession();
  }, [id]);

  const filteredStudents = useMemo(() => {
    if (!session?.enrolledStudents) return [];
    return session.enrolledStudents.filter((student) => {
      const matchesSearch =
        !search ||
        student.name.toLowerCase().includes(search.toLowerCase()) ||
        student.email.toLowerCase().includes(search.toLowerCase());
      const status = attendanceMap[student.id] || 'Absent';
      const matchesFilter = statusFilter === 'all' || status === statusFilter;
      return matchesSearch && matchesFilter;
    });
  }, [session, search, statusFilter, attendanceMap]);

  const handleAttendanceChange = (studentId, status) => {
    setAttendanceMap((current) => ({ ...current, [studentId]: status }));
  };

  const handleBulkApply = () => {
    const updated = { ...attendanceMap };
    filteredStudents.forEach((student) => {
      updated[student.id] = bulkStatus;
    });
    setAttendanceMap(updated);
  };

  const handleMarkAllPresent = () => {
    const updated = { ...attendanceMap };
    session.enrolledStudents.forEach((student) => {
      updated[student.id] = 'Present';
    });
    setAttendanceMap(updated);
  };

  const handleMarkAllAbsent = () => {
    const updated = { ...attendanceMap };
    session.enrolledStudents.forEach((student) => {
      updated[student.id] = 'Absent';
    });
    setAttendanceMap(updated);
  };

  const handleSave = async () => {
    if (!session) return;
    try {
      setSaving(true);
      setError('');
      const records = session.enrolledStudents.map((student) => ({
        studentId: student.id,
        status: attendanceMap[student.id] || 'Absent',
        notes: notesMap[student.id] || '',
      }));
      await attendanceService.recordBulkAttendance({ sessionId: session.id, records });
      await loadSession();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
      </div>
    );
  }

  if (!session) {
    return <div className="text-center text-slate-600">Session not found.</div>;
  }

  const counts = { Present: 0, Late: 0, Absent: 0, Excused: 0 };
  session.enrolledStudents?.forEach((s) => {
    const status = attendanceMap[s.id] || 'Absent';
    counts[status] = (counts[status] || 0) + 1;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link to="/dashboard/attendance/sessions" className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
            ← Back to sessions
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">Take Attendance</h1>
          <p className="mt-1 text-slate-600">Record attendance for {session.title}.</p>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Attendance'}
        </button>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
              {session.status}
            </span>
            <span className="text-sm text-slate-500">{session.programType}</span>
          </div>
          <p className="mt-2 text-lg font-semibold text-slate-900">{session.title}</p>
          <p className="mt-1 text-sm text-slate-500">
            {new Date(session.date).toLocaleDateString()} · {session.startTime} - {session.endTime}
            {session.location && ` · ${session.location}`}
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            {ATTENDANCE_STATUS.map((s) => (
              <span key={s} className="text-sm text-slate-600">
                {s}: <strong>{counts[s]}</strong>
              </span>
            ))}
          </div>
        </div>

        <div className="border-b border-slate-200 p-4 space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              type="search"
              placeholder="Search students..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <div className="flex flex-wrap gap-2">
              {['all', ...ATTENDANCE_STATUS].map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setStatusFilter(f)}
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    statusFilter === f ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {f === 'all' ? 'All' : f}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={bulkStatus}
              onChange={(e) => setBulkStatus(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
            >
              {ATTENDANCE_STATUS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleBulkApply}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Apply to filtered
            </button>
            <button
              type="button"
              onClick={handleMarkAllPresent}
              className="rounded-lg border border-green-200 px-3 py-1.5 text-sm font-medium text-green-700 hover:bg-green-50"
            >
              Mark all Present
            </button>
            <button
              type="button"
              onClick={handleMarkAllAbsent}
              className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50"
            >
              Mark all Absent
            </button>
          </div>
        </div>

        <div className="p-6">
          {session.enrolledStudents?.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-500">
              No students found for this session.
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-500">
              No students match your search or filter.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredStudents.map((student) => (
                <div
                  key={student.id}
                  className="flex flex-col gap-3 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium text-slate-900">{student.name}</p>
                    <p className="text-sm text-slate-500">{student.email}</p>
                  </div>
                  <div className="flex flex-col gap-2 sm:items-end">
                    <div className="flex flex-wrap items-center gap-2">
                      {ATTENDANCE_STATUS.map((value) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => handleAttendanceChange(student.id, value)}
                          className={`rounded-full px-3 py-1 text-sm font-medium ${
                            attendanceMap[student.id] === value
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {value}
                        </button>
                      ))}
                    </div>
                    <input
                      placeholder="Notes (optional)"
                      value={notesMap[student.id] || ''}
                      onChange={(e) =>
                        setNotesMap((prev) => ({ ...prev, [student.id]: e.target.value }))
                      }
                      className="w-full rounded-lg border border-slate-200 px-2 py-1 text-xs sm:w-48"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
