import React, { useMemo, memo } from 'react';

const activityIcons = {
  Create: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  ),
  Update: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.992 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
    </svg>
  ),
  Delete: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
  ),
  Approve: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Login: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
    </svg>
  ),
  Logout: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
    </svg>
  ),
  default: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
    </svg>
  ),
};

const iconBg = {
  Create: 'bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400',
  Update: 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400',
  Delete: 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400',
  Approve: 'bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400',
  Login: 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400',
  Logout: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400',
  default: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400',
};

function ActivityItem({ activity }) {
  const icon = activityIcons[activity.action] || activityIcons.default;
  const iconBgClass = iconBg[activity.action] || iconBg.default;
  const initials = activity.user?.name ? activity.user.name.charAt(0).toUpperCase() : '?';

  const formatTime = (ts) => {
    if (!ts) return '';
    try {
      const d = new Date(ts);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div className="flex gap-4 pb-8 relative group">
      <div className="flex flex-col items-center">
        <div className="relative z-10">
          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-sm font-bold text-blue-700 dark:text-blue-300 border-2 border-white dark:border-gray-900">
            {initials}
          </div>
          <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center ${iconBgClass} border-2 border-white dark:border-gray-900`}>
            {icon}
          </div>
        </div>
        <div className="w-0.5 flex-1 bg-gray-200 dark:bg-gray-700 absolute top-10 group-last:hidden" />
      </div>
      <div className="flex-1 min-w-0 pt-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">{formatTime(activity.timestamp)}</span>
          <span className="inline-block px-2 py-0.5 text-xs font-medium rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
            {activity.module || 'General'}
          </span>
        </div>
        <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
          <span className="font-semibold">{activity.user?.name || 'Unknown'}</span>{' '}
          {activity.description}
        </p>
      </div>
    </div>
  );
}

const MemoizedActivityItem = memo(ActivityItem);

function ActivityTimeline({ activities = [], loading = false, error = null, onRetry }) {
  const grouped = useMemo(() => {
    if (!activities || activities.length === 0) return {};
    const map = {};
    activities.forEach((a) => {
      if (!a.timestamp) {
        const key = 'Unknown Date';
        if (!map[key]) map[key] = [];
        map[key].push(a);
        return;
      }
      try {
        const d = new Date(a.timestamp);
        const key = d.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        if (!map[key]) map[key] = [];
        map[key].push(a);
      } catch {
        const key = 'Unknown Date';
        if (!map[key]) map[key] = [];
        map[key].push(a);
      }
    });
    return map;
  }, [activities]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse" role="status" aria-label="Loading timeline">
        {[1, 2, 3].map((group) => (
          <div key={group}>
            <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-48 mb-4" />
            {[1, 2].map((item) => (
              <div key={item} className="flex gap-4 pb-6">
                <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-32" />
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ))}
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
        <p className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">Failed to load activities</p>
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

  const dates = Object.keys(grouped);
  if (dates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <svg className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">No activities found</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">Activities will appear here when they occur.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {dates.map((date) => (
        <div key={date} className="mb-2">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 sticky top-0 bg-white dark:bg-gray-900 py-2 z-10">
            {date}
          </h3>
          <div className="pl-1">
            {grouped[date].map((activity) => (
              <MemoizedActivityItem key={activity.id} activity={activity} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default memo(ActivityTimeline);
