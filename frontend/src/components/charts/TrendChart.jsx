import { memo } from 'react';

const TrendChart = memo(function TrendChart({ data = [], valueKey = 'attendancePercent' }) {
  if (data.length === 0) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">No trend data available.</p>;
  }

  const max = 100;
  const points = data.map((item, index) => {
    const x = (index / Math.max(data.length - 1, 1)) * 100;
    const y = 100 - ((item[valueKey] || 0) / max) * 100;
    return `${x},${y}`;
  });

  return (
    <div className="space-y-2">
      <svg viewBox="0 0 100 100" className="h-40 w-full" preserveAspectRatio="none">
        <polyline
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-indigo-500"
          points={points.join(' ')}
        />
        {data.map((item, index) => {
          const x = (index / Math.max(data.length - 1, 1)) * 100;
          const y = 100 - ((item[valueKey] || 0) / max) * 100;
          return (
            <circle
              key={item.date || index}
              cx={x}
              cy={y}
              r="2"
              className="fill-indigo-600"
            />
          );
        })}
      </svg>
      <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400">
        {data.map((item) => (
          <span key={item.date || item.label}>{item.label}</span>
        ))}
      </div>
    </div>
  );
});

export default TrendChart;
