import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { ROLES } from '../../constants/roles.js';
import { courseService } from '../../services/course.service.js';
import { attendanceService } from '../../services/attendance.service.js';
import ProgressBar from '../../components/courses/ProgressBar.jsx';

const CONTENT_TYPES = [
  { value: 'video', label: 'Video' },
  { value: 'pdf', label: 'PDF' },
  { value: 'text', label: 'Text' },
];

const DEFAULT_THUMBNAIL =
  'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=400&fit=crop';

export default function CourseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, hasRole } = useAuth();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [attendanceSessions, setAttendanceSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [lessonForm, setLessonForm] = useState({
    title: '',
    contentType: 'text',
    videoUrl: '',
    pdfUrl: '',
    textContent: '',
  });

  const isStudent = user?.role === ROLES.STUDENT;
  const canManage =
    hasRole(ROLES.SUPER_ADMIN, ROLES.ADMIN) ||
    (user?.role === ROLES.TEACHER && course?.createdBy?.id === user?.id);
  const canDelete = hasRole(ROLES.SUPER_ADMIN, ROLES.ADMIN);
  const isEnrolled = course?.isEnrolled || course?.enrollment;

  const loadData = async () => {
    try {
      setLoading(true);
      const courseRes = await courseService.getCourse(id);
      setCourse(courseRes.data.course);

      if (courseRes.data.course.isEnrolled || !isStudent) {
        try {
          const lessonsRes = await courseService.getLessons(id);
          setLessons(lessonsRes.data.lessons);
        } catch {
          setLessons([]);
        }
      }

      const courseData = courseRes.data.course;
      const userCanManage =
        hasRole(ROLES.SUPER_ADMIN, ROLES.ADMIN) ||
        (user?.role === ROLES.TEACHER && courseData.createdBy?.id === user?.id);

      if (userCanManage || hasRole(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEACHER)) {
        try {
          const enrollRes = await courseService.getEnrollments(id);
          setEnrollments(enrollRes.data.enrollments);
        } catch {
          setEnrollments([]);
        }
      }

      if (userCanManage) {
        try {
          const attRes = await attendanceService.getSessions({ courseId: id });
          setAttendanceSessions(attRes.data.sessions);
        } catch {
          setAttendanceSessions([]);
        }
      } else if (courseRes.data.course.isEnrolled) {
        try {
          const attRes = await attendanceService.getCourseAttendance(id);
          setAttendanceSessions(attRes.data.sessions);
        } catch {
          setAttendanceSessions([]);
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleEnroll = async () => {
    try {
      await courseService.enroll(id);
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteCourse = async () => {
    if (!window.confirm('Delete this course and all its lessons?')) return;
    try {
      await courseService.deleteCourse(id);
      navigate('/dashboard/courses');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAddLesson = async (e) => {
    e.preventDefault();
    try {
      await courseService.createLesson(id, lessonForm);
      setLessonForm({ title: '', contentType: 'text', videoUrl: '', pdfUrl: '', textContent: '' });
      setShowLessonForm(false);
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteLesson = async (lessonId) => {
    if (!window.confirm('Delete this lesson?')) return;
    try {
      await courseService.deleteLesson(lessonId);
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
      </div>
    );
  }

  if (!course) {
    return <div className="text-center text-slate-600">Course not found.</div>;
  }

  const thumbnail = course.thumbnail || DEFAULT_THUMBNAIL;
  const completedLessonIds = (course.enrollment?.completedLessons || []).map((l) =>
    typeof l === 'string' ? l : l.toString(),
  );

  return (
    <div className="space-y-6">
      <Link to="/dashboard/courses" className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
        ← Back to courses
      </Link>

      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <img
          src={thumbnail}
          alt={course.title}
          className="h-48 w-full object-cover sm:h-64"
          onError={(e) => {
            e.target.src = DEFAULT_THUMBNAIL;
          }}
        />
        <div className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{course.title}</h1>
              <p className="mt-2 text-slate-600">{course.description || 'No description'}</p>
              <p className="mt-2 text-sm text-slate-500">
                by {course.createdBy?.name} · {course.lessonCount ?? lessons.length} lessons
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {isStudent && !isEnrolled && (
                <button
                  type="button"
                  onClick={handleEnroll}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                >
                  Enroll Now
                </button>
              )}
              {canDelete && (
                <button
                  type="button"
                  onClick={handleDeleteCourse}
                  className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                >
                  Delete Course
                </button>
              )}
            </div>
          </div>

          {isEnrolled && course.enrollment && (
            <div className="mt-6 max-w-md">
              <ProgressBar value={course.enrollment.progress} />
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Lessons</h2>
              {canManage && (
                <button
                  type="button"
                  onClick={() => setShowLessonForm(!showLessonForm)}
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
                >
                  {showLessonForm ? 'Cancel' : '+ Add Lesson'}
                </button>
              )}
            </div>

            {showLessonForm && (
              <form onSubmit={handleAddLesson} className="mt-4 space-y-3 rounded-lg bg-slate-50 p-4">
                <input
                  required
                  placeholder="Lesson title"
                  value={lessonForm.title}
                  onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
                <select
                  value={lessonForm.contentType}
                  onChange={(e) => setLessonForm({ ...lessonForm, contentType: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                >
                  {CONTENT_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
                {lessonForm.contentType === 'video' && (
                  <input
                    required
                    placeholder="Video URL"
                    value={lessonForm.videoUrl}
                    onChange={(e) => setLessonForm({ ...lessonForm, videoUrl: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                )}
                {lessonForm.contentType === 'pdf' && (
                  <input
                    required
                    placeholder="PDF URL"
                    value={lessonForm.pdfUrl}
                    onChange={(e) => setLessonForm({ ...lessonForm, pdfUrl: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                )}
                {lessonForm.contentType === 'text' && (
                  <textarea
                    required
                    placeholder="Text content"
                    rows={3}
                    value={lessonForm.textContent}
                    onChange={(e) => setLessonForm({ ...lessonForm, textContent: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                )}
                <button
                  type="submit"
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                >
                  Add Lesson
                </button>
              </form>
            )}

            {lessons.length === 0 ? (
              <p className="mt-4 text-sm text-slate-500">No lessons yet.</p>
            ) : (
              <ul className="mt-4 divide-y divide-slate-100">
                {lessons.map((lesson, index) => {
                  const isCompleted = completedLessonIds.includes(lesson.id);
                  const canView = isEnrolled || canManage || hasRole(ROLES.PARENT);

                  return (
                    <li key={lesson.id} className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-sm font-medium text-slate-600">
                          {index + 1}
                        </span>
                        <div>
                          <p className="font-medium text-slate-900">{lesson.title}</p>
                          <p className="text-xs capitalize text-slate-500">{lesson.contentType}</p>
                        </div>
                        {isCompleted && (
                          <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs text-green-700">
                            Done
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {canView && (isEnrolled || canManage) && (
                          <Link
                            to={`/dashboard/courses/${id}/lessons/${lesson.id}`}
                            className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
                          >
                            {isStudent ? 'Start' : 'View'}
                          </Link>
                        )}
                        {canManage && (
                          <button
                            type="button"
                            onClick={() => handleDeleteLesson(lesson.id)}
                            className="text-sm text-red-600 hover:text-red-800"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        {enrollments.length > 0 && canManage && (
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Enrolled Students</h2>
            <ul className="mt-4 space-y-3">
              {enrollments.map((e) => (
                <li key={e.id} className="text-sm">
                  <p className="font-medium text-slate-900">{e.user.name}</p>
                  <ProgressBar value={e.progress} className="mt-1" />
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {attendanceSessions.length > 0 && (canManage || isEnrolled) && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Course Attendance</h2>
            {canManage && (
              <Link
                to="/dashboard/attendance/sessions"
                className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
              >
                Manage Sessions
              </Link>
            )}
          </div>
          <ul className="mt-4 divide-y divide-slate-100">
            {attendanceSessions.map((session) => (
              <li key={session.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-slate-900">{session.title}</p>
                  <p className="text-sm text-slate-500">
                    {new Date(session.date).toLocaleDateString()} · {session.programType}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                    session.status === 'Completed' ? 'bg-slate-100 text-slate-700' :
                    session.status === 'Ongoing' ? 'bg-green-50 text-green-700' :
                    session.status === 'Cancelled' ? 'bg-red-50 text-red-700' :
                    'bg-blue-50 text-blue-700'
                  }`}>
                    {session.status}
                  </span>
                  {session.myAttendance && (
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      session.myAttendance.status === 'Present' ? 'bg-green-50 text-green-700' :
                      session.myAttendance.status === 'Late' ? 'bg-amber-50 text-amber-700' :
                      session.myAttendance.status === 'Excused' ? 'bg-blue-50 text-blue-700' :
                      'bg-red-50 text-red-700'
                    }`}>
                      {session.myAttendance.status}
                    </span>
                  )}
                  {canManage && (
                    <Link
                      to={`/dashboard/attendance/${session.id}`}
                      className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
                    >
                      Take Attendance
                    </Link>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
