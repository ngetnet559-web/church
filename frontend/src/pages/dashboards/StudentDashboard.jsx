import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardPage from '../../components/dashboard/DashboardPage.jsx';
import { attendanceService } from '../../services/attendance.service.js';
import { courseService } from '../../services/course.service.js';
import { certificateService } from '../../services/certificate.service.js';
import { notificationService } from '../../services/notification.service.js';
import AnnouncementBanner from '../../components/notifications/AnnouncementBanner.jsx';
import EventDashboardWidget from '../../components/events/EventDashboardWidget.jsx';

export default function StudentDashboard() {
  const [attendance, setAttendance] = useState(null);
  const [courses, setCourses] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    attendanceService.getMyAttendance().then((res) => setAttendance(res.data.attendance)).catch(() => {});
    courseService.getMyCourses().then((res) => setCourses(res.data.courses)).catch(() => {});
    certificateService.getMyCertificates().then((res) => setCertificates(res.data.certificates)).catch(() => {});
    notificationService.getUnreadCount().then((res) => setUnreadCount(res.data?.count || 0)).catch(() => {});
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
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">My Learning</h2>
          {courses.length > 0 ? (
            <ul className="mt-4 space-y-2">
              {courses.slice(0, 5).map((c) => (
                <li key={c.id} className="flex justify-between text-sm">
                  <Link to={`/dashboard/courses/${c.course?.id || c.courseId}`} className="font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300">
                    {c.course?.title || 'Course'}
                  </Link>
                  <span className="text-slate-500 dark:text-slate-400">{c.progress}%</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">No enrolled courses yet.</p>
          )}
          <Link to="/dashboard/courses" className="mt-4 inline-flex text-sm font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300">
            Browse Courses →
          </Link>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-colors dark:border-slate-700 dark:bg-slate-900">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Quick Links</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link to="/dashboard/my-attendance" className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-700">
              My Attendance
            </Link>
            <Link to="/dashboard/certificates" className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800">
              My Certificates
            </Link>
          </div>
        </div>
      </div>
    </DashboardPage>
  );
}
