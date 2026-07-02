import { useState } from 'react';
import { attendanceService } from '../../services/attendance.service.js';

export default function ParentAttendancePage() {
  const [studentId, setStudentId] = useState('');
  const [attendance, setAttendance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadAttendance = async () => {
    if (!studentId.trim()) return;
    try {
      setLoading(true);
      setError('');
      const res = await attendanceService.getMyAttendance(studentId.trim());
      setAttendance(res.data.attendance);
    } catch (err) {
      setError(err.message);
      setAttendance(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Child Attendance</h1>
        <p className="mt-1 text-slate-600">View read-only attendance for your linked child.</p>
      </div>
      <div className="flex gap-2">
        <input
          placeholder="Enter student ID"
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
          className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
        <button
          type="button"
          onClick={loadAttendance}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          View Attendance
        </button>
      </div>
      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}
      {loading && (
        <div className="flex justify-center py-8">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
        </div>
      )}
      {attendance && !loading && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid gap-4 sm:grid-cols-4">
            <div>
              <p className="text-sm text-slate-500">Attendance %</p>
              <p className="text-2xl font-bold">{attendance.attendancePercent}%</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Present</p>
              <p className="text-2xl font-bold">{attendance.presentCount}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Late</p>
              <p className="text-2xl font-bold">{attendance.lateCount}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Absent</p>
              <p className="text-2xl font-bold">{attendance.absentCount}</p>
            </div>
          </div>
          <div className="mt-6 space-y-2">
            {attendance.history.map((record) => (
              <div key={record.id} className="flex justify-between rounded-lg bg-slate-50 px-4 py-2 text-sm">
                <span>
                  {record.sessionTitle} — {new Date(record.sessionDate).toLocaleDateString()}
                </span>
                <span className="font-medium">{record.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
