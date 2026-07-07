import React, { useEffect, useState, useRef, useCallback, memo } from 'react';

function AnimatedCounter({ value, duration = 800, suffix = '', decimals = 0 }) {
  const [display, setDisplay] = useState(0);
  const startRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    const numValue = Number(value) || 0;
    if (numValue === 0) {
      setDisplay('0');
      return;
    }

    const startTime = performance.now();
    const startVal = 0;

    function step(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = startVal + (numValue - startVal) * eased;
      setDisplay(current.toFixed(decimals));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step);
      }
    }

    rafRef.current = requestAnimationFrame(step);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [value, duration, decimals]);

  return (
    <span>
      {display}{suffix}
    </span>
  );
}

const statCards = [
  { key: 'total', label: 'Total Logs', color: 'blue' },
  { key: 'successRate', label: 'Success Rate', suffix: '%', decimals: 1 },
  { key: 'uniqueUsers', label: 'Unique Users', color: 'purple' },
  { key: 'modulesTracked', label: 'Modules Tracked', color: 'amber' },
  { key: 'today', label: 'Today', color: 'emerald' },
  { key: 'thisWeek', label: 'This Week', color: 'rose' },
];

const colorMap = {
  blue: 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300',
  purple: 'bg-purple-50 dark:bg-purple-900/30 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300',
  amber: 'bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300',
  emerald: 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300',
  rose: 'bg-rose-50 dark:bg-rose-900/30 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300',
};

function StatCard({ stat, value }) {
  const bg = colorMap[stat.color] || colorMap.blue;
  return (
    <div className={`rounded-lg border p-4 ${bg}`}>
      <p className="text-xs font-medium uppercase tracking-wider opacity-75">{stat.label}</p>
      <p className="text-2xl font-bold mt-1 tabular-nums">
        {stat.key === 'successRate' ? (
          <AnimatedCounter value={value} suffix={stat.suffix} decimals={stat.decimals} />
        ) : (
          <AnimatedCounter value={value} />
        )}
      </p>
    </div>
  );
}

const MemoizedStatCard = memo(StatCard);

function AuditStats({ stats, loading = false }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((s) => (
          <div
            key={s.key}
            className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 animate-pulse"
          >
            <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-20 mb-3" />
            <div className="h-7 bg-gray-300 dark:bg-gray-600 rounded w-12" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
      {statCards.map((s) => (
        <MemoizedStatCard
          key={s.key}
          stat={s}
          value={stats?.[s.key] ?? 0}
        />
      ))}
    </div>
  );
}

export default memo(AuditStats);
