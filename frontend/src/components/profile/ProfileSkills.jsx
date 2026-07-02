function ChipList({ title, items = [], color = 'indigo' }) {
  const colors = {
    indigo: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300',
    emerald: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
    purple: 'bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md dark:border-slate-700 dark:bg-slate-900">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
      {items.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Not specified.</p>
      ) : (
        <div className="mt-4 flex flex-wrap gap-2">
          {items.map((item) => (
            <span
              key={item}
              className={`rounded-full px-3 py-1.5 text-sm font-medium ${colors[color]}`}
            >
              {item}
            </span>
          ))}
        </div>
      )}
    </section>
  );
}

export default function ProfileSkills({ profile }) {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <ChipList title="Skills" items={profile.skills} color="indigo" />
      <ChipList title="Talents" items={profile.talents} color="emerald" />
      <ChipList title="Interests" items={profile.interests} color="purple" />
    </div>
  );
}
