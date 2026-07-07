import { useState, useEffect, useCallback, useRef } from 'react';
import { RefreshCw, Activity, Timeline, List, BarChart3 } from 'lucide-react';
import { getActivities, getRecentActivities, getActivityTimeline, getActivityStats } from '../../services/activity.service.js';
import ActivityTimeline from '../../components/system/ActivityTimeline.jsx';
import ActivityCard from '../../components/system/ActivityCard.jsx';
import AuditSkeleton from '../../components/system/AuditSkeleton.jsx';

export default function ActivityPage() {
  const [view, setView] = useState('recent');
  const [activities, setActivities] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const mounted = useRef(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      if (view === 'recent') {
        const [recentRes, statsRes] = await Promise.all([
          getRecentActivities(),
          getActivityStats().catch(() => null),
        ]);
        if (!mounted.current) return;
        const rawActivities = recentRes.data?.activities || recentRes.data || [];
        setActivities(
          (Array.isArray(rawActivities) ? rawActivities : []).map((act) => ({
            id: act.id,
            user: act.user ? { name: act.user.name, role: act.user.role } : undefined,
            action: act.activityType || act.action,
            module: act.module,
            description: act.description,
            timestamp: act.createdAt || act.timestamp,
          }))
        );
        setStats(statsRes?.data || null);
      } else {
        const timelineRes = await getActivityTimeline();
        if (!mounted.current) return;
        const rawTimeline = timelineRes.data?.timeline || timelineRes.data || [];
        setTimeline(
          (Array.isArray(rawTimeline) ? rawTimeline : []).map((act) => ({
            id: act.id,
            user: act.user ? { name: act.user.name, role: act.user.role } : undefined,
            action: act.activityType || act.action,
            module: act.module,
            description: act.description,
            timestamp: act.createdAt || act.timestamp,
          }))
        );
      }
    } catch (err) {
      if (!mounted.current) return;
      setError(err.message || 'Failed to load activities');
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, [view]);

  useEffect(() => {
    mounted.current = true;
    fetchData();
    return () => { mounted.current = false; };
  }, [fetchData]);

  const statsCards = stats
    ? [
        { label: 'Total Activities', value: stats.totalActivities ?? 0, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
        { label: 'Active Users', value: stats.activeUsers ?? 0, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20' },
        { label: 'Today', value: stats.todayCount ?? 0, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20' },
        { label: 'This Week', value: stats.weekCount ?? 0, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Activity</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Monitor system activity and user actions
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex rounded-xl border border-gray-300 dark:border-gray-600 p-0.5 bg-gray-50 dark:bg-gray-800">
            <button
              onClick={() => setView('recent')}
              className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                view === 'recent'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <List size={16} />
              Recent Activities
            </button>
            <button
              onClick={() => setView('timeline')}
              className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                view === 'timeline'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <Timeline size={16} />
              Timeline
            </button>
          </div>
          <button
            onClick={fetchData}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {view === 'recent' && statsCards.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statsCards.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className={`rounded-xl p-3 ${stat.bg}`}>
                  <BarChart3 size={22} className={stat.color} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950 p-4 text-sm text-red-700 dark:text-red-400">
          <span className="flex-1">{error}</span>
          <button
            onClick={fetchData}
            className="shrink-0 rounded-lg bg-red-100 dark:bg-red-900 px-3 py-1.5 font-medium text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <AuditSkeleton />
      ) : view === 'recent' ? (
        activities.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-700">
              <Activity size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">No recent activities</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Activities will appear here as users interact with the system.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {activities.map((activity) => (
              <ActivityCard key={activity._id || activity.id} activity={activity} />
            ))}
          </div>
        )
      ) : (
        timeline.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-700">
              <Timeline size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">No timeline data</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Timeline will populate as activities are recorded.
            </p>
          </div>
        ) : (
          <ActivityTimeline activities={timeline} />
        )
      )}
    </div>
  );
}
