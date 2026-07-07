import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LogIn, ArrowRight, CheckCircle, XCircle, Users, AlertTriangle } from 'lucide-react';

export default function LoginHistoryWidget({ stats, recentLogins = [], loading = false }) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Login Activity</h3>
        <div className="grid grid-cols-2 gap-3 mb-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse h-16 bg-gray-200 dark:bg-gray-700 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Logins', value: stats?.total || 0, icon: LogIn, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
    { label: 'Successful', value: stats?.successful || 0, icon: CheckCircle, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20' },
    { label: 'Failed Today', value: stats?.failedToday || 0, icon: XCircle, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20' },
    { label: 'Unique Users', value: stats?.uniqueUsers || 0, icon: Users, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20' },
  ];

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <LogIn size={18} className="text-indigo-500" />
          Login Activity
        </h3>
        <Link
          to="/dashboard/login-history"
          className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1"
        >
          View All <ArrowRight size={14} />
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        {statCards.map((s) => (
          <div key={s.label} className={`rounded-xl p-3 ${s.bg} border border-transparent`}>
            <div className="flex items-center gap-2">
              <s.icon size={16} className={s.color} />
              <span className="text-lg font-bold text-gray-900 dark:text-white">{s.value}</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>
      {recentLogins.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Latest Logins</p>
          <div className="space-y-1">
            {recentLogins.slice(0, 4).map((l) => (
              <div key={l.id || l._id} className="flex items-center gap-2 py-1.5 text-sm">
                {l.success ? (
                  <CheckCircle size={14} className="text-green-500 shrink-0" />
                ) : (
                  <XCircle size={14} className="text-red-500 shrink-0" />
                )}
                <span className="text-gray-700 dark:text-gray-300 truncate flex-1">
                  {l.user?.name || 'Unknown'}
                </span>
                <span className="text-xs text-gray-400">
                  {l.loginTime ? new Date(l.loginTime).toLocaleTimeString() : ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
      {stats?.failedToday > 0 && (
        <div className="mt-3 flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-lg px-3 py-2">
          <AlertTriangle size={14} />
          <span>{stats.failedToday} failed login attempt{stats.failedToday !== 1 ? 's' : ''} today</span>
        </div>
      )}
    </div>
  );
}
