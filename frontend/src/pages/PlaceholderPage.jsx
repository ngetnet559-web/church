export default function PlaceholderPage({ title, description }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm transition-colors dark:border-slate-600 dark:bg-slate-900">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{title}</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-300">{description}</p>
      <p className="mt-4 text-sm text-slate-400 dark:text-slate-500">This feature will be available in a future update.</p>
    </div>
  );
}
