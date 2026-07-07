import { Users, Award, BookOpen, CheckCircle } from 'lucide-react';

export default function ActiveUsersWidget({ users = [], loading = false }) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Most Active Users</h3>
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full" />
              <div className="flex-1">
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-1" />
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Most Active Users</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">No data available yet.</p>
      </div>
    );
  }

  const getIcon = (index) => {
    if (index === 0) return <Award size={16} className="text-yellow-500" />;
    if (index === 1) return <Award size={16} className="text-gray-400" />;
    if (index === 2) return <Award size={16} className="text-amber-600" />;
    return <Users size={14} className="text-gray-400" />;
  };

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
      <div className="flex items-center gap-2 mb-4">
        <Users size={18} className="text-indigo-500" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Most Active Users</h3>
      </div>
      <div className="space-y-2">
        {users.slice(0, 5).map((u, i) => (
          <div key={u.id || u._id || i} className="flex items-center gap-3 py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
            <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-xs font-bold text-blue-700 dark:text-blue-300">
              {u.name ? u.name.charAt(0).toUpperCase() : '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{u.name || 'Unknown'}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{u.role || ''}</p>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <CheckCircle size={12} className="text-green-500" />
              <span>{u.actionCount || u.count || 0} actions</span>
            </div>
            {getIcon(i)}
          </div>
        ))}
      </div>
    </div>
  );
}
