import React from 'react';

function SkeletonRow({ width }) {
  return (
    <tr className="animate-pulse border-b border-gray-200 dark:border-gray-700">
      <td className="px-4 py-3">
        <div className={`h-4 bg-gray-300 dark:bg-gray-600 rounded ${width}`} />
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full" />
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-24" />
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded-full w-16" />
      </td>
      <td className="px-4 py-3">
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-20" />
      </td>
      <td className="px-4 py-3">
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-40" />
      </td>
      <td className="px-4 py-3">
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-28" />
      </td>
      <td className="px-4 py-3">
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-14" />
      </td>
    </tr>
  );
}

function AuditSkeleton({ rows = 5 }) {
  const widths = ['w-32', 'w-28', 'w-20', 'w-24', 'w-36', 'w-28', 'w-16'];
  return (
    <div className="w-full overflow-x-auto" role="status" aria-label="Loading audit logs">
      <table className="w-full min-w-[700px]">
        <thead>
          <tr className="border-b border-gray-300 dark:border-gray-600">
            {['Timestamp', 'User', 'Action', 'Module', 'Description', 'IP', 'Status'].map((h) => (
              <th
                key={h}
                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }, (_, i) => (
            <SkeletonRow key={i} width={widths[i % widths.length]} />
          ))}
        </tbody>
      </table>
      <span className="sr-only">Loading...</span>
    </div>
  );
}

export default React.memo(AuditSkeleton);
