export default function BarChart({ data = [], valueKey = 'count', labelKey = 'label', color = 'bg-indigo-500' }) {
  const max = Math.max(...data.map((d) => d[valueKey] || 0), 1);

  if (data.length === 0) {
    return <p className="text-sm text-slate-500">No data available.</p>;
  }

  return (
    <div className="flex h-48 items-end gap-2">
      {data.map((item) => {
        const height = Math.max(((item[valueKey] || 0) / max) * 100, 4);
        return (
          <div key={item[labelKey]} className="flex flex-1 flex-col items-center gap-1">
            <span className="text-xs font-medium text-slate-600">{item[valueKey]}</span>
            <div
              className={`w-full rounded-t-md ${color} transition-all`}
              style={{ height: `${height}%` }}
            />
            <span className="text-[10px] text-slate-500 text-center leading-tight">
              {item[labelKey]}
            </span>
          </div>
        );
      })}
    </div>
  );
}
