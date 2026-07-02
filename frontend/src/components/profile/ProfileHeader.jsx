import { Link } from 'react-router-dom';
import ProfileAvatar from './ProfileAvatar.jsx';
import { ROLE_LABELS } from '../../constants/roles.js';

export default function ProfileHeader({ profile, canEdit = false, editPath }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900">
      <div className="h-32 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700" />
      <div className="relative px-6 pb-6">
        <div className="-mt-16 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <ProfileAvatar profile={profile} size="xl" className="border-4 border-white dark:border-slate-900" />
            <div className="pb-1">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                {profile.fullName || profile.user?.name}
              </h1>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                  {ROLE_LABELS[profile.user?.role] || profile.user?.role}
                </span>
                {profile.churchRole && (
                  <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                    {profile.churchRole}
                  </span>
                )}
                {profile.ministry && (
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    {profile.ministry}
                  </span>
                )}
              </div>
            </div>
          </div>

          {canEdit && editPath && (
            <Link
              to={editPath}
              className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-md transition-all duration-300 hover:bg-indigo-700 hover:shadow-lg"
            >
              Edit Profile
            </Link>
          )}
        </div>

        {profile.bio && (
          <p className="mt-6 text-slate-600 dark:text-slate-300">{profile.bio}</p>
        )}
      </div>
    </div>
  );
}
