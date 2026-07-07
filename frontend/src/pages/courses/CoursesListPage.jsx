import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { ROLES } from '../../constants/roles.js';
import { courseService } from '../../services/course.service.js';
import CourseCard from '../../components/courses/CourseCard.jsx';

export default function CoursesListPage() {
  const { user, hasRole } = useAuth();
  const [courses, setCourses] = useState([]);
  const [available, setAvailable] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('enrolled');

  const canCreate = hasRole(ROLES.ADMIN, ROLES.TEACHER, ROLES.SUPER_ADMIN);
  const isStudent = user?.role === ROLES.STUDENT;

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        if (isStudent) {
          const [enrolledRes, availableRes] = await Promise.all([
            courseService.getMyCourses(),
            courseService.getAvailableCourses(),
          ]);
          setCourses(enrolledRes.data.courses);
          setAvailable(availableRes.data.courses);
        } else {
          const res = await courseService.getCourses();
          setCourses(res.data.courses);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isStudent]);

  const handleEnroll = async (courseId) => {
    try {
      await courseService.enroll(courseId);
      const [enrolledRes, availableRes] = await Promise.all([
        courseService.getMyCourses(),
        courseService.getAvailableCourses(),
      ]);
      setCourses(enrolledRes.data.courses);
      setAvailable(availableRes.data.courses);
      setTab('enrolled');
    } catch (err) {
      setError(err.message);
    }
  };

  const displayCourses = isStudent && tab === 'browse' ? available : courses;

  return (
    <div className="space-y-6 transition-colors">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {isStudent ? 'My Courses' : 'Courses'}
          </h1>
          <p className="mt-1 text-slate-600 dark:text-slate-300">
            {isStudent
              ? 'View your enrolled courses or browse available courses.'
              : 'Manage and view all courses.'}
          </p>
        </div>
        {canCreate && (
          <Link
            to="/dashboard/courses/create"
            className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Create Course
          </Link>
        )}
      </div>

      {isStudent && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setTab('enrolled')}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${
              tab === 'enrolled'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-700 dark:hover:bg-slate-800'
            }`}
          >
            Enrolled ({courses.length})
          </button>
          <button
            type="button"
            onClick={() => setTab('browse')}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${
              tab === 'browse'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-700 dark:hover:bg-slate-800'
            }`}
          >
            Browse ({available.length})
          </button>
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-400">{error}</div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
        </div>
      ) : displayCourses.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center dark:border-slate-600 dark:bg-slate-900">
          <p className="text-slate-600 dark:text-slate-300">
            {isStudent && tab === 'browse'
              ? 'No available courses to enroll in.'
              : 'No courses found.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {displayCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              showProgress={isStudent && tab === 'enrolled'}
              action={
                isStudent && tab === 'browse' ? (
                  <button
                    type="button"
                    onClick={() => handleEnroll(course.id)}
                    className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                  >
                    Enroll
                  </button>
                ) : null
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
