import React, { memo } from 'react';

function StatusBadge({ status }) {
  if (status === 'Success') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300">
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
        Success
      </span>
    );
  }
  if (status === 'Failed') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300">
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
        Failed
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
      {status || 'Unknown'}
    </span>
  );
}

function formatDate(ts) {
  if (!ts) return '—';
  try {
    return new Date(ts).toLocaleString();
  } catch {
    return ts;
  }
}

function getBrowser(ua) {
  if (!ua) return '—';
  if (ua.includes('Chrome') && !ua.includes('Edg')) return 'Chrome';
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
  if (ua.includes('Edg')) return 'Edge';
  if (ua.includes('MSIE') || ua.includes('Trident')) return 'Internet Explorer';
  return 'Unknown';
}

function getOS(ua) {
  if (!ua) return '—';
  if (ua.includes('Windows')) return 'Windows';
  if (ua.includes('Mac OS')) return 'macOS';
  if (ua.includes('Linux') && !ua.includes('Android')) return 'Linux';
  if (ua.includes('Android')) return 'Android';
  if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
  if (ua.includes('CrOS')) return 'ChromeOS';
  return 'Unknown';
}

function LoginRow({ login }) {
  return (
    <tr className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors">
      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
        {formatDate(login.timestamp)}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-xs font-bold text-blue-700 dark:text-blue-300 flex-shrink-0">
            {login.user?.name ? login.user.name.charAt(0).toUpperCase() : '?'}
          </div>
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {login.user?.name || 'Unknown'}
          </span>
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 font-mono">
        {login.ip || '—'}
      </td>
      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
        {getBrowser(login.userAgent)}
      </td>
      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
        {getOS(login.userAgent)}
      </td>
      <td className="px-4 py-3">
        <StatusBadge status={login.status} />
      </td>
      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 max-w-[150px] truncate" title={login.failureReason}>
        {login.status === 'Failed' ? (login.failureReason || '—') : '—'}
      </td>
      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
        {login.status === 'Success' && login.logoutTime ? formatDuration(login.timestamp, login.logoutTime) : '—'}
      </td>
    </tr>
  );
}

const MemoizedLoginRow = memo(LoginRow);

function formatDuration(start, end) {
  if (!start || !end) return '—';
  try {
    const diff = new Date(end).getTime() - new Date(start).getTime();
    if (diff < 0) return '—';
    const mins = Math.floor(diff / 60000);
    const secs = Math.floor((diff % 60000) / 1000);
    if (mins === 0) return `${secs}s`;
    if (mins < 60) return `${mins}m ${secs}s`;
    const hours = Math.floor(mins / 60);
    const remMins = mins % 60;
    return `${hours}h ${remMins}m`;
  } catch {
    return '—';
  }
}

function LoginHistoryTable({ logins = [], loading = false, error = null, onRetry }) {
  if (loading) {
    return (
      <div className="w-full overflow-x-auto" role="status" aria-label="Loading login history">
        <table className="w-full min-w-[900px]">
          <thead>
            <tr className="border-b border-gray-300 dark:border-gray-600">
              {['Timestamp', 'User', 'IP Address', 'Browser', 'OS', 'Status', 'Failure Reason', 'Duration'].map((h) => (
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
            {Array.from({ length: 5 }, (_, i) => (
              <tr key={i} className="animate-pulse border-b border-gray-200 dark:border-gray-700">
                <td className="px-4 py-3"><div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-32" /></td>
                <td className="px-4 py-3"><div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-24" /></td>
                <td className="px-4 py-3"><div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-28" /></td>
                <td className="px-4 py-3"><div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-16" /></td>
                <td className="px-4 py-3"><div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-16" /></td>
                <td className="px-4 py-3"><div className="h-5 bg-gray-300 dark:bg-gray-600 rounded-full w-16" /></td>
                <td className="px-4 py-3"><div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-20" /></td>
                <td className="px-4 py-3"><div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-14" /></td>
              </tr>
            ))}
          </tbody>
        </table>
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center" role="alert">
        <svg className="w-12 h-12 text-red-400 dark:text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
        <p className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">Failed to load login history</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{error}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  if (!logins || logins.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <svg className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
        </svg>
        <p className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">No login history found</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">Login records will appear here.</p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
      <table className="w-full min-w-[900px]">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-600">
            {['Timestamp', 'User', 'IP Address', 'Browser', 'OS', 'Status', 'Failure Reason', 'Duration'].map((h) => (
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
          {logins.map((login) => (
            <MemoizedLoginRow key={login.id} login={login} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default memo(LoginHistoryTable);
