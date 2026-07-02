import { Link } from 'react-router-dom';
import ProfileAvatar from './ProfileAvatar.jsx';
import { ROLE_LABELS } from '../../constants/roles.js';

export default function ProfileCard({ profile, showActions = false, onDelete }) {
  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-md transition-all duration-300 hover:shadow-xl dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-start gap-4">
        <ProfileAvatar profile={profile} size="md" />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-lg font-semibold text-slate-900 dark:text-white">
            {profile.fullName || profile.user?.name}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {ROLE_LABELS[profile.user?.role] || profile.user?.role}
          </p>
          {profile.churchRole && (
            <p className="mt-1 text-sm text-indigo-600 dark:text-indigo-400">
              {profile.churchRole}
            </p>
          )}
          {profile.ministry && (
            <p className="text-sm text-slate-500 dark:text-slate-400">{profile.ministry}</p>
          )}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800">
          <p className="text-slate-500 dark:text-slate-400">Attendance</p>
          <p className="font-semibold text-slate-900 dark:text-white">
            {profile.attendanceScore ?? 0}%
          </p>
        </div>
        <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800">
          <p className="text-slate-500 dark:text-slate-400">Courses</p>
          <p className="font-semibold text-slate-900 dark:text-white">
            {profile.completedCourses ?? 0}
          </p>
        </div>
      </div>

      {showActions && (
        <div className="mt-4 flex gap-2">
          <Link
            to={`/dashboard/profiles/${profile.id}`}
            className="flex-1 rounded-xl bg-indigo-600 px-3 py-2 text-center text-sm font-medium text-white transition-all hover:bg-indigo-700"
          >
            View
          </Link>
          <Link
            to={`/dashboard/profiles/${profile.id}/edit`}
            className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-center text-sm font-medium text-slate-700 transition-all hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Edit
          </Link>
          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(profile)}
              className="rounded-xl border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition-all hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
            >
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
}
