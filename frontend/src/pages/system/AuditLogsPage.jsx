import { useState, useEffect, useCallback, useRef } from 'react';
import { RefreshCw, Download, AlertCircle, ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import { getAuditLogs, getAuditStatistics, exportAuditLogs } from '../../services/audit.service.js';
import AuditTable from '../../components/system/AuditTable.jsx';
import AuditFilters from '../../components/system/AuditFilters.jsx';
import AuditStats from '../../components/system/AuditStats.jsx';
import AuditSkeleton from '../../components/system/AuditSkeleton.jsx';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    action: '',
    userId: '',
    resource: '',
    startDate: '',
    endDate: '',
  });
  const mounted = useRef(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const params = { page, limit: 20 };
      if (filters.action) params.action = filters.action;
      if (filters.userId) params.userId = filters.userId;
      if (filters.resource) params.resource = filters.resource;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;

      const [logsRes, statsRes] = await Promise.all([
        getAuditLogs(params),
        getAuditStatistics(),
      ]);

      if (!mounted.current) return;
      const audits = logsRes.data?.logs || [];
      const rawLogs = Array.isArray(audits) ? audits : [];
      setLogs(
        rawLogs.map((log) => ({
          id: log.id,
          user: log.user ? { name: log.user.name, role: log.user.role } : undefined,
          action: log.action,
          module: log.module,
          description: log.description,
          ip: log.ipAddress,
          status: log.success === true ? 'Success' : log.success === false ? 'Failed' : 'Unknown',
          timestamp: log.createdAt,
          userAgent: log.userAgent || [log.browser, log.operatingSystem, log.device].filter(Boolean).join(' '),
          metadata: log.metadata,
        }))
      );
      setTotalPages(logsRes.data?.totalPages || 1);
      setStats(statsRes.data || null);
    } catch (err) {
      if (!mounted.current) return;
      setError(err.message || 'Failed to load audit logs');
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => {
    mounted.current = true;
    fetchData();
    return () => { mounted.current = false; };
  }, [fetchData]);

  const handleFilterChange = useCallback((newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPage(1);
  }, []);

  const handleExport = async () => {
    try {
      setExporting(true);
      const params = {};
      if (filters.action) params.action = filters.action;
      if (filters.userId) params.userId = filters.userId;
      if (filters.resource) params.resource = filters.resource;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;

      const blob = await exportAuditLogs(params);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-logs-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message || 'Failed to export');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Audit Logs</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Track and review all system activities
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button
            onClick={handleExport}
            disabled={exporting || loading}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            <Download size={16} />
            {exporting ? 'Exporting...' : 'Export CSV'}
          </button>
        </div>
      </div>

      <AuditStats stats={stats} loading={loading} />

      <AuditFilters filters={filters} onChange={handleFilterChange} onFilterChange={handleFilterChange} />

      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950 p-4 text-sm text-red-700 dark:text-red-400">
          <AlertCircle size={18} className="shrink-0" />
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
      ) : logs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-700">
            <FileText size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">No audit logs found</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Try adjusting your filters or check back later.
          </p>
        </div>
      ) : (
        <>
          <AuditTable logs={logs} />

          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Page {page} of {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="inline-flex items-center gap-1 rounded-xl border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={16} />
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="inline-flex items-center gap-1 rounded-xl border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
