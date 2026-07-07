import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { courseService } from '../../services/course.service.js';
import CourseCard from '../../components/courses/CourseCard.jsx';

export default function MyCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await courseService.getMyCourses();
        setCourses(res.data.courses);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="space-y-6 transition-colors">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Courses</h1>
        <p className="mt-1 text-slate-600 dark:text-slate-300">Track your learning progress across enrolled courses.</p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-400">{error}</div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
        </div>
      ) : courses.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center dark:border-slate-600 dark:bg-slate-900">
          <p className="text-slate-600 dark:text-slate-300">You are not enrolled in any courses yet.</p>
          <Link
            to="/dashboard/courses"
            className="mt-4 inline-block text-sm font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-400"
          >
            Browse available courses
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              course={{
                ...course.course,
                id: course.course?.id || course.courseId,
                enrollment: course,
                progress: course.progress,
                lessonCount: course.lessonCount,
              }}
              showProgress
            />
          ))}
        </div>
      )}
    </div>
  );
}
