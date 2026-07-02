export default function ProgressBar({ value, className = '' }) {
  const percent = Math.min(100, Math.max(0, value || 0));

  return (
    <div className={`w-full ${className}`}>
      <div className="mb-1 flex justify-between text-xs text-slate-500">
        <span>Progress</span>
        <span>{percent}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-indigo-600 transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
