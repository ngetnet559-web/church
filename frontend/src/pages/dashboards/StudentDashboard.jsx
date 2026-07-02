import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardPage from '../../components/dashboard/DashboardPage.jsx';
import { attendanceService } from '../../services/attendance.service.js';
import { courseService } from '../../services/course.service.js';
import { certificateService } from '../../services/certificate.service.js';

export default function StudentDashboard() {
  const [attendance, setAttendance] = useState(null);
  const [courses, setCourses] = useState([]);
  const [certificates, setCertificates] = useState([]);

  useEffect(() => {
    attendanceService.getMyAttendance().then((res) => setAttendance(res.data.attendance)).catch(() => {});
    courseService.getMyCourses().then((res) => setCourses(res.data.courses)).catch(() => {});
    certificateService.getMyCertificates().then((res) => setCertificates(res.data.certificates)).catch(() => {});
  }, []);

  const inProgress = courses.filter((c) => !c.completed).length;

  return (
    <DashboardPage
      title="Student Dashboard"
      subtitle="View your courses and track your learning progress."
      stats={[
        { label: 'Enrolled Courses', value: courses.length || '—', description: `${inProgress} in progress` },
        { label: 'Attendance', value: attendance ? `${attendance.attendancePercent}%` : '—', description: attendance ? `${attendance.presentCount} present sessions` : 'Loading...' },
        { label: 'Certificates', value: certificates.length || '0', description: 'Earned certificates' },
      ]}
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">My Learning</h2>
          {courses.length > 0 ? (
            <ul className="mt-4 space-y-2">
              {courses.slice(0, 5).map((c) => (
                <li key={c.id} className="flex justify-between text-sm">
                  <Link to={`/dashboard/courses/${c.course?.id || c.courseId}`} className="font-medium text-indigo-600 hover:text-indigo-800">
                    {c.course?.title || 'Course'}
                  </Link>
                  <span className="text-slate-500">{c.progress}%</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-slate-600">No enrolled courses yet.</p>
          )}
          <Link to="/dashboard/courses" className="mt-4 inline-flex text-sm font-medium text-indigo-600 hover:text-indigo-800">
            Browse Courses →
          </Link>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Quick Links</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link to="/dashboard/my-attendance" className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-700">
              My Attendance
            </Link>
            <Link to="/dashboard/certificates" className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              My Certificates
            </Link>
          </div>
        </div>
      </div>
    </DashboardPage>
  );
}
