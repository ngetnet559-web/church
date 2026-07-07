import { useState, useEffect, useCallback, useRef } from 'react';
import { Search, ChevronLeft, ChevronRight, RefreshCw, AlertCircle, LogIn, CheckCircle, XCircle, Users } from 'lucide-react';
import { getLoginHistory } from '../../services/audit.service.js';
import LoginHistoryTable from '../../components/system/LoginHistoryTable.jsx';
import AuditSkeleton from '../../components/system/AuditSkeleton.jsx';

const DATE_RANGES = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
];

const STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'success', label: 'Success' },
  { value: 'failed', label: 'Failed' },
];

function AnimatedCounter({ value, label, icon: Icon, color, bg }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (value === display) return;
    const duration = 800;
    const steps = 20;
    const increment = (value - display) / steps;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      if (step >= steps) {
        setDisplay(value);
        clearInterval(timer);
      } else {
        setDisplay((prev) => prev + increment);
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [value]);

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm">
      <div className="flex items-center gap-4">
        <div className={`rounded-xl p-3 ${bg}`}>
          <Icon size={22} className={color} />
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {Math.round(display).toLocaleString()}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        </div>
      </div>
    </div>
  );
}

export default function LoginHistoryPage() {
  const [logins, setLogins] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [dateRange, setDateRange] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [stats, setStats] = useState({ total: 0, successful: 0, failedToday: 0, uniqueUsers: 0 });
  const mounted = useRef(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const params = { page: pagination.page, limit: 20 };
      if (search) params.search = search;
      if (dateRange !== 'all') {
        const now = new Date();
        if (dateRange === 'today') {
          params.startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
          params.endDate = now.toISOString();
        } else if (dateRange === 'week') {
          const weekAgo = new Date(now);
          weekAgo.setDate(weekAgo.getDate() - 7);
          params.startDate = weekAgo.toISOString();
          params.endDate = now.toISOString();
        } else if (dateRange === 'month') {
          const monthAgo = new Date(now);
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          params.startDate = monthAgo.toISOString();
          params.endDate = now.toISOString();
        }
      }
      if (statusFilter === 'success') params.success = true;
      else if (statusFilter === 'failed') params.success = false;

      const res = await getLoginHistory(params);
      if (!mounted.current) return;

      const data = res.data || res;
      const loginsData = data.records || [];
      const rawLogins = Array.isArray(loginsData) ? loginsData : [];
      setLogins(
        rawLogins.map((login) => ({
          id: login.id,
          user: login.user ? { name: login.user.name } : undefined,
          timestamp: login.loginTime,
          ip: login.ipAddress,
          userAgent: login.userAgent || [login.browser, login.operatingSystem, login.device].filter(Boolean).join(' '),
          status: login.success === true ? 'Success' : login.success === false ? 'Failed' : 'Unknown',
          failureReason: login.failureReason,
          logoutTime: login.logoutTime,
        }))
      );
      setPagination({
        page: data.page || data.pagination?.page || 1,
        totalPages: data.totalPages || data.pagination?.totalPages || 1,
        total: data.total || data.pagination?.total || 0,
      });

      if (data.stats) {
        setStats(data.stats);
      } else {
        const successful = rawLogins.filter(
          (l) => l.success === true
        ).length;
        setStats((prev) => ({
          ...prev,
          total: data.total || data.pagination?.total || 0,
          successful,
        }));
      }
    } catch (err) {
      if (!mounted.current) return;
      setError(err.message || 'Failed to load login history');
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, [pagination.page, search, dateRange, statusFilter]);

  useEffect(() => {
    mounted.current = true;
    fetchData();
    return () => { mounted.current = false; };
  }, [fetchData]);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleDateRangeChange = (value) => {
    setDateRange(value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleStatusChange = (value) => {
    setStatusFilter(value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const statCards = [
    { value: stats.total, label: 'Total Logins', icon: LogIn, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
    { value: stats.successful, label: 'Successful', icon: CheckCircle, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20' },
    { value: stats.failedToday, label: 'Failed Today', icon: XCircle, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20' },
    { value: stats.uniqueUsers, label: 'Unique Users', icon: Users, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Login History</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            View and monitor user login attempts
          </p>
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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <AnimatedCounter key={stat.label} {...stat} />
        ))}
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by user name or email..."
            value={search}
            onChange={handleSearch}
            className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 py-2.5 pl-10 pr-4 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:border-transparent focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex rounded-xl border border-gray-300 dark:border-gray-600 p-0.5 bg-gray-50 dark:bg-gray-800">
            {DATE_RANGES.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleDateRangeChange(opt.value)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  dateRange === opt.value
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <select
            value={statusFilter}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2.5 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

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
      ) : logins.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-700">
            <LogIn size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">No login history found</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {search || dateRange !== 'all' || statusFilter !== 'all'
              ? 'Try adjusting your filters.'
              : 'Login attempts will appear here as users sign in.'}
          </p>
        </div>
      ) : (
        <>
          <LoginHistoryTable logins={logins} />

          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Page {pagination.page} of {pagination.totalPages}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPagination((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                  disabled={pagination.page === 1}
                  className="inline-flex items-center gap-1 rounded-xl border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={16} />
                  Previous
                </button>
                <button
                  onClick={() => setPagination((prev) => ({ ...prev, page: Math.min(prev.totalPages, prev.page + 1) }))}
                  disabled={pagination.page === pagination.totalPages}
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
