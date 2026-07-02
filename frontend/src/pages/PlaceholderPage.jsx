export default function PlaceholderPage({ title, description }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
      <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
      <p className="mt-2 text-slate-600">{description}</p>
      <p className="mt-4 text-sm text-slate-400">This feature will be available in a future update.</p>
    </div>
  );
}
