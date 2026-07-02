export default function ProfileAchievements({ achievements = [], badges = [] }) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md dark:border-slate-700 dark:bg-slate-900">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Achievements</h3>
        {achievements.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">No achievements yet.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {achievements.map((item) => (
              <div
                key={item._id || item.title}
                className="rounded-xl border border-slate-100 bg-slate-50 p-4 transition-all hover:shadow-md dark:border-slate-700 dark:bg-slate-800"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">{item.title}</p>
                    {item.description && (
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        {item.description}
                      </p>
                    )}
                  </div>
                  <span className="shrink-0 rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-medium text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                    {item.category || 'General'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md dark:border-slate-700 dark:bg-slate-900">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Badges</h3>
        {badges.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">No badges earned yet.</p>
        ) : (
          <div className="mt-4 flex flex-wrap gap-3">
            {badges.map((badge) => (
              <div
                key={badge._id || badge.name}
                className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 px-4 py-3 shadow-sm transition-all hover:shadow-md dark:border-amber-800 dark:from-amber-950 dark:to-orange-950"
                title={badge.description}
              >
                <p className="font-medium text-amber-900 dark:text-amber-200">{badge.name}</p>
                {badge.description && (
                  <p className="mt-1 text-xs text-amber-700 dark:text-amber-400">
                    {badge.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
