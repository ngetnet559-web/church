import React, { useState, useCallback, memo } from 'react';
import AuditSkeleton from './AuditSkeleton';

const actionColors = {
  Create: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  Update: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  Delete: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
  Approve: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
  Issue: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
  Enroll: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300',
  Complete: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
  Login: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300',
  Logout: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  default: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
};

function ActionBadge({ action }) {
  const colorClass = actionColors[action] || actionColors.default;
  return (
    <span
      className={`inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full ${colorClass}`}
    >
      {action}
    </span>
  );
}

function StatusIcon({ status }) {
  if (status === 'Success') {
    return (
      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/40" title="Success">
        <svg className="w-3.5 h-3.5 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </span>
    );
  }
  if (status === 'Failed') {
    return (
      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-100 dark:bg-red-900/40" title="Failed">
        <svg className="w-3.5 h-3.5 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-xs">
      ?
    </span>
  );
}

function DetailRow({ audit }) {
  return (
    <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
      <td colSpan={7} className="px-6 py-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
          <div>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">User Agent</span>
            <p className="text-gray-900 dark:text-gray-100 break-words font-mono text-xs mt-0.5">
              {audit.userAgent || 'N/A'}
            </p>
          </div>
          <div>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Full Description</span>
            <p className="text-gray-900 dark:text-gray-100 mt-0.5">{audit.description}</p>
          </div>
          <div>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Metadata</span>
            <pre className="text-gray-900 dark:text-gray-100 mt-0.5 font-mono text-xs whitespace-pre-wrap">
              {audit.metadata ? JSON.stringify(audit.metadata, null, 2) : 'N/A'}
            </pre>
          </div>
        </div>
      </td>
    </tr>
  );
}

function AuditRow({ audit, isExpanded, onToggle }) {
  const truncate = (text, max = 50) =>
    text && text.length > max ? `${text.slice(0, max)}...` : text;

  const getInitials = (name) => (name ? name.charAt(0).toUpperCase() : '?');

  const formatDate = (ts) => {
    if (!ts) return '—';
    try {
      const d = new Date(ts);
      return d.toLocaleString();
    } catch {
      return ts;
    }
  };

  return (
    <>
      <tr
        onClick={() => onToggle(audit.id)}
        className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/60 cursor-pointer transition-colors"
      >
        <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
          {formatDate(audit.timestamp)}
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-xs font-bold text-blue-700 dark:text-blue-300 flex-shrink-0">
              {getInitials(audit.user?.name)}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {audit.user?.name || 'Unknown'}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {audit.user?.role || ''}
              </span>
            </div>
          </div>
        </td>
        <td className="px-4 py-3">
          <ActionBadge action={audit.action} />
        </td>
        <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{audit.module || '—'}</td>
        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 max-w-[200px] truncate" title={audit.description}>
          {truncate(audit.description)}
        </td>
        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 font-mono">{audit.ip || '—'}</td>
        <td className="px-4 py-3">
          <StatusIcon status={audit.status} />
        </td>
      </tr>
      {isExpanded && <DetailRow audit={audit} />}
    </>
  );
}

const MemoizedAuditRow = memo(AuditRow);

function AuditTable({ audits = [], logs, loading = false, error = null, onRetry }) {
  const items = logs || audits;
  const [expandedId, setExpandedId] = useState(null);

  const handleToggle = useCallback((id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  }, []);

  if (loading) {
    return <AuditSkeleton rows={6} />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center" role="alert">
        <svg className="w-12 h-12 text-red-400 dark:text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
        <p className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">Failed to load audit logs</p>
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

  if (!items || items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <svg className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
        </svg>
        <p className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">No audit logs found</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">Try adjusting your filters.</p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
      <table className="w-full min-w-[800px]">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-600">
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
          {items.map((audit) => (
            <MemoizedAuditRow
              key={audit.id}
              audit={audit}
              isExpanded={expandedId === audit.id}
              onToggle={handleToggle}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default memo(AuditTable);
