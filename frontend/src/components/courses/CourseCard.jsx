import { Link } from "react-router-dom";
import ProgressBar from "./ProgressBar.jsx";

const DEFAULT_THUMBNAIL =
  "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=240&fit=crop";

export default function CourseCard({ course, showProgress = false, action }) {
  const thumbnail = course.thumbnail || DEFAULT_THUMBNAIL;
  const progress = course.enrollment?.progress ?? course.progress ?? 0;

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      <Link
        to={`/dashboard/courses/${course.courseId || course.id}`}
        className="block"
      >
        <img
          src={thumbnail}
          alt={course.title}
          className="h-40 w-full object-cover"
          onError={(e) => {
            e.target.src = DEFAULT_THUMBNAIL;
          }}
        />
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <Link to={`/dashboard/courses/${course.courseId || course.id}`}>
          <h3 className="font-semibold text-slate-900 hover:text-indigo-600">
            {course.title}
          </h3>
        </Link>
        <p className="mt-1 line-clamp-2 flex-1 text-sm text-slate-600">
          {course.description || "No description"}
        </p>

        <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
          <span>{course.lessonCount ?? 0} lessons</span>
          {course.createdBy?.name && <span>by {course.createdBy.name}</span>}
        </div>

        {showProgress && (
          <div className="mt-3">
            <ProgressBar value={progress} />
          </div>
        )}

        {course.enrollment?.completed && (
          <span className="mt-2 inline-flex w-fit rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
            Completed
          </span>
        )}

        {action && <div className="mt-4">{action}</div>}
      </div>
    </div>
  );
}
