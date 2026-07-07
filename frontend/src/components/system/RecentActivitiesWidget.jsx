import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Activity, ArrowRight, Clock, User } from 'lucide-react';

const typeConfig = {
  course_created: { bg: 'bg-green-100 dark:bg-green-900/40', color: 'text-green-600 dark:text-green-400' },
  course_updated: { bg: 'bg-blue-100 dark:bg-blue-900/40', color: 'text-blue-600 dark:text-blue-400' },
  course_deleted: { bg: 'bg-red-100 dark:bg-red-900/40', color: 'text-red-600 dark:text-red-400' },
  enrollment: { bg: 'bg-cyan-100 dark:bg-cyan-900/40', color: 'text-cyan-600 dark:text-cyan-400' },
  attendance: { bg: 'bg-indigo-100 dark:bg-indigo-900/40', color: 'text-indigo-600 dark:text-indigo-400' },
  certificate_issued: { bg: 'bg-amber-100 dark:bg-amber-900/40', color: 'text-amber-600 dark:text-amber-400' },
  donation_created: { bg: 'bg-emerald-100 dark:bg-emerald-900/40', color: 'text-emerald-600 dark:text-emerald-400' },
  user_login: { bg: 'bg-purple-100 dark:bg-purple-900/40', color: 'text-purple-600 dark:text-purple-400' },
};

function TimeAgo({ timestamp }) {
  const [label, setLabel] = useState('');
  useEffect(() => {
    function update() {
      if (!timestamp) { setLabel(''); return; }
      const diff = Date.now() - new Date(timestamp).getTime();
      const s = Math.floor(diff / 1000);
      if (s < 60) { setLabel('just now'); return; }
      const m = Math.floor(s / 60);
      if (m < 60) { setLabel(`${m}m ago`); return; }
      const h = Math.floor(m / 60);
      if (h < 24) { setLabel(`${h}h ago`); return; }
      const d = Math.floor(h / 24);
      setLabel(`${d}d ago`);
    }
    update();
    const id = setInterval(update, 60000);
    return () => clearInterval(id);
  }, [timestamp]);
  return <span className="text-xs text-gray-400 dark:text-gray-500">{label}</span>;
}

function getInitials(name) {
  return name ? name.charAt(0).toUpperCase() : '?';
}

export default function RecentActivitiesWidget({ activities = [], loading = false }) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activities</h3>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="animate-pulse flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full" />
              <div className="flex-1">
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-1" />
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Activity size={18} className="text-indigo-500" />
          Recent Activities
        </h3>
        <Link
          to="/dashboard/activity"
          className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1"
        >
          View All <ArrowRight size={14} />
        </Link>
      </div>
      {activities.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400 py-4 text-center">No recent activities.</p>
      ) : (
        <div className="space-y-3">
          {activities.slice(0, 6).map((act) => {
            const cfg = typeConfig[act.activityType] || { bg: 'bg-gray-100 dark:bg-gray-700', color: 'text-gray-600 dark:text-gray-400' };
            return (
              <div key={act.id || act._id} className="flex items-start gap-3 group hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg p-2 -mx-2 transition-colors">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${cfg.bg}`}>
                  <User size={14} className={cfg.color} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-900 dark:text-gray-100 truncate">
                    <span className="font-medium">{act.user?.name || 'System'}</span>
                    {' '}{act.description}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <TimeAgo timestamp={act.createdAt || act.timestamp} />
                    <span className="text-xs text-gray-400 dark:text-gray-500">{act.module}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
