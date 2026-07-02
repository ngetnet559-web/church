const formatDate = (value) => {
  if (!value) return null;
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export default function ProfileTimeline({ profile }) {
  const events = [
    {
      label: 'Joined Church',
      date: formatDate(profile.joinedChurchDate),
      icon: '⛪',
    },
    {
      label: 'Baptism',
      date: profile.baptized ? formatDate(profile.baptismDate) : null,
      icon: '💧',
    },
    {
      label: 'Profile Created',
      date: formatDate(profile.createdAt),
      icon: '✨',
    },
    {
      label: 'Last Updated',
      date: formatDate(profile.updatedAt),
      icon: '📝',
    },
  ].filter((event) => event.date);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md dark:border-slate-700 dark:bg-slate-900">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Timeline</h3>
      {events.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">No timeline events yet.</p>
      ) : (
        <div className="mt-6 space-y-6">
          {events.map((event, index) => (
            <div key={event.label} className="relative flex gap-4 pl-2">
              {index < events.length - 1 && (
                <span className="absolute left-[1.15rem] top-10 h-full w-px bg-slate-200 dark:bg-slate-700" />
              )}
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-base dark:bg-indigo-950">
                {event.icon}
              </div>
              <div>
                <p className="font-medium text-slate-900 dark:text-white">{event.label}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{event.date}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
