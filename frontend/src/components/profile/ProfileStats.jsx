const statItems = [
  { key: 'attendanceScore', label: 'Attendance Score', suffix: '%', color: 'indigo' },
  { key: 'completedCourses', label: 'Completed Courses', color: 'emerald' },
  { key: 'certificatesEarned', label: 'Certificates', color: 'amber' },
  { key: 'volunteerHours', label: 'Volunteer Hours', color: 'purple' },
];

const colorClasses = {
  indigo: 'from-indigo-500 to-indigo-600',
  emerald: 'from-emerald-500 to-emerald-600',
  amber: 'from-amber-500 to-amber-600',
  purple: 'from-purple-500 to-purple-600',
};

export default function ProfileStats({ profile, stats }) {
  const data = stats || profile;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {statItems.map((item) => (
        <div
          key={item.key}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md transition-all duration-300 hover:shadow-lg dark:border-slate-700 dark:bg-slate-900"
        >
          <div
            className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${colorClasses[item.color]} text-white shadow-md`}
          >
            <span className="text-sm font-bold">
              {item.suffix ? '%' : '#'}
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">{item.label}</p>
          <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
            {data?.[item.key] ?? 0}
            {item.suffix || ''}
          </p>
        </div>
      ))}
    </div>
  );
}

export function AdminStatsCards({ stats }) {
  if (!stats) return null;

  const items = [
    { label: 'Total Members', value: stats.totalMembers },
    { label: 'Teachers', value: stats.teachers },
    { label: 'Students', value: stats.students },
    { label: 'Parents', value: stats.parents },
    { label: 'Admins', value: stats.admins },
    { label: 'Male Members', value: stats.maleMembers },
    { label: 'Female Members', value: stats.femaleMembers },
    { label: 'Volunteer Hours', value: stats.volunteerHours },
    { label: 'Attendance Avg', value: `${stats.attendanceAverage ?? 0}%` },
    { label: 'Certificates', value: stats.certificatesIssued },
    { label: 'Completed Courses', value: stats.completedCourses },
    { label: 'Donations', value: stats.totalDonationsCount },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-md transition-all duration-300 hover:shadow-lg dark:border-slate-700 dark:bg-slate-900"
        >
          <p className="text-sm text-slate-500 dark:text-slate-400">{item.label}</p>
          <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{item.value ?? 0}</p>
        </div>
      ))}
    </div>
  );
}
