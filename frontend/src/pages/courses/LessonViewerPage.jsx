import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { ROLES } from '../../constants/roles.js';
import { courseService } from '../../services/course.service.js';

export default function LessonViewerPage() {
  const { id: courseId, lessonId } = useParams();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [completing, setCompleting] = useState(false);

  const isStudent = user?.role === ROLES.STUDENT;
  const completedIds = (course?.enrollment?.completedLessons || []).map((l) =>
    typeof l === 'string' ? l : l.toString(),
  );
  const isCompleted = completedIds.includes(lessonId);

  useEffect(() => {
    const load = async () => {
      try {
        const [courseRes, lessonsRes] = await Promise.all([
          courseService.getCourse(courseId),
          courseService.getLessons(courseId),
        ]);
        setCourse(courseRes.data.course);
        setLessons(lessonsRes.data.lessons);
        const lesson = lessonsRes.data.lessons.find((l) => l.id === lessonId);
        setCurrentLesson(lesson);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [courseId, lessonId]);

  const handleMarkComplete = async () => {
    setCompleting(true);
    setError('');
    try {
      const res = await courseService.updateProgress(courseId, {
        lessonId,
        completed: !isCompleted,
      });
      setCourse((prev) => ({
        ...prev,
        enrollment: res.data.enrollment,
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setCompleting(false);
    }
  };

  const currentIndex = lessons.findIndex((l) => l.id === lessonId);
  const prevLesson = currentIndex > 0 ? lessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null;

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
      </div>
    );
  }

  if (!currentLesson) {
    return <div className="text-center text-slate-600">Lesson not found.</div>;
  }

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <aside className="w-full shrink-0 rounded-xl border border-slate-200 bg-white p-4 shadow-sm lg:w-72">
        <Link
          to={`/dashboard/courses/${courseId}`}
          className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
        >
          ← {course?.title}
        </Link>
        <h2 className="mt-4 text-sm font-semibold uppercase tracking-wider text-slate-500">
          Lessons
        </h2>
        <ul className="mt-2 space-y-1">
          {lessons.map((lesson, index) => {
            const done = completedIds.includes(lesson.id);
            const active = lesson.id === lessonId;
            return (
              <li key={lesson.id}>
                <Link
                  to={`/dashboard/courses/${courseId}/lessons/${lesson.id}`}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
                    active
                      ? 'bg-indigo-50 font-medium text-indigo-700'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-xs text-slate-400">{index + 1}</span>
                  <span className="flex-1 truncate">{lesson.title}</span>
                  {done && <span className="text-green-500">✓</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </aside>

      <main className="min-w-0 flex-1">
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">{currentLesson.title}</h1>
          <p className="mt-1 text-sm capitalize text-slate-500">{currentLesson.contentType} lesson</p>

          <div className="mt-6">
            {currentLesson.contentType === 'video' && currentLesson.videoUrl && (
              <div className="aspect-video overflow-hidden rounded-lg bg-slate-900">
                <iframe
                  src={currentLesson.videoUrl}
                  title={currentLesson.title}
                  className="h-full w-full"
                  allowFullScreen
                />
              </div>
            )}

            {currentLesson.contentType === 'pdf' && currentLesson.pdfUrl && (
              <div className="space-y-3">
                <iframe
                  src={currentLesson.pdfUrl}
                  title={currentLesson.title}
                  className="h-[600px] w-full rounded-lg border border-slate-200"
                />
                <a
                  href={currentLesson.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
                >
                  Open PDF in new tab
                </a>
              </div>
            )}

            {currentLesson.contentType === 'text' && (
              <div className="prose prose-slate max-w-none rounded-lg bg-slate-50 p-6">
                <p className="whitespace-pre-wrap text-slate-700">{currentLesson.textContent}</p>
              </div>
            )}
          </div>

          {isStudent && (
            <button
              type="button"
              onClick={handleMarkComplete}
              disabled={completing}
              className={`mt-6 rounded-lg px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60 ${
                isCompleted
                  ? 'bg-slate-600 hover:bg-slate-700'
                  : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {completing
                ? 'Saving...'
                : isCompleted
                  ? 'Mark as Incomplete'
                  : 'Mark as Completed'}
            </button>
          )}

          <div className="mt-8 flex justify-between border-t border-slate-100 pt-6">
            {prevLesson ? (
              <Link
                to={`/dashboard/courses/${courseId}/lessons/${prevLesson.id}`}
                className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
              >
                ← Previous
              </Link>
            ) : (
              <span />
            )}
            {nextLesson ? (
              <Link
                to={`/dashboard/courses/${courseId}/lessons/${nextLesson.id}`}
                className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
              >
                Next →
              </Link>
            ) : (
              <span />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
