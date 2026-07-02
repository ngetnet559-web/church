import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { memberProfileService } from '../../services/memberProfile.service.js';
import { ALL_ROLES, ROLE_LABELS, ROLES } from '../../constants/roles.js';
import ProfileCard from '../../components/profile/ProfileCard.jsx';
import ProfileAvatar from '../../components/profile/ProfileAvatar.jsx';
import ProfileSkeleton from '../../components/profile/ProfileSkeleton.jsx';
import { AdminStatsCards } from '../../components/profile/ProfileStats.jsx';

export default function ProfilesPage() {
  const { hasRole } = useAuth();
  const [profiles, setProfiles] = useState([]);
  const [stats, setStats] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('table');
  const [filters, setFilters] = useState({
    search: '',
    role: '',
    churchRole: '',
    ministry: '',
    minAttendance: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    page: 1,
    limit: 10,
  });

  const canDelete = hasRole(ROLES.SUPER_ADMIN);

  const loadProfiles = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await memberProfileService.getProfiles(filters);
      setProfiles(response.data.profiles || []);
      setPagination(response.data.pagination || { page: 1, pages: 1, total: 0 });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const loadStats = useCallback(async () => {
    try {
      const response = await memberProfileService.getStatistics();
      setStats(response.data);
    } catch {
      // Stats are optional for the page
    }
  }, []);

  useEffect(() => {
    loadProfiles();
  }, [loadProfiles]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value, page: 1 }));
  };

  const handleDelete = async (profile) => {
    if (!window.confirm(`Delete profile for ${profile.fullName || profile.user?.name}?`)) {
      return;
    }

    try {
      await memberProfileService.deleteProfile(profile.id);
      await loadProfiles();
      await loadStats();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Member Profiles</h1>
          <p className="mt-1 text-slate-600 dark:text-slate-400">
            Search, filter, and manage church member profiles.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setViewMode('table')}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition-all ${
              viewMode === 'table'
                ? 'bg-indigo-600 text-white'
                : 'border border-slate-200 text-slate-700 dark:border-slate-700 dark:text-slate-200'
            }`}
          >
            Table
          </button>
          <button
            type="button"
            onClick={() => setViewMode('cards')}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition-all ${
              viewMode === 'cards'
                ? 'bg-indigo-600 text-white'
                : 'border border-slate-200 text-slate-700 dark:border-slate-700 dark:text-slate-200'
            }`}
          >
            Cards
          </button>
        </div>
      </div>

      {stats && <AdminStatsCards stats={stats} />}

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md dark:border-slate-700 dark:bg-slate-900">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <FilterInput
            label="Search"
            name="search"
            value={filters.search}
            onChange={handleFilterChange}
            placeholder="Name or email"
          />
          <FilterSelect label="Role" name="role" value={filters.role} onChange={handleFilterChange}>
            <option value="">All Roles</option>
            {ALL_ROLES.map((role) => (
              <option key={role} value={role}>
                {ROLE_LABELS[role]}
              </option>
            ))}
          </FilterSelect>
          <FilterInput
            label="Church Role"
            name="churchRole"
            value={filters.churchRole}
            onChange={handleFilterChange}
            placeholder="e.g. Deacon"
          />
          <FilterInput
            label="Ministry"
            name="ministry"
            value={filters.ministry}
            onChange={handleFilterChange}
            placeholder="e.g. Worship"
          />
          <FilterInput
            label="Min Attendance %"
            name="minAttendance"
            value={filters.minAttendance}
            onChange={handleFilterChange}
            placeholder="0"
          />
          <FilterSelect label="Sort By" name="sortBy" value={filters.sortBy} onChange={handleFilterChange}>
            <option value="createdAt">Created Date</option>
            <option value="attendanceScore">Attendance</option>
            <option value="volunteerHours">Volunteer Hours</option>
            <option value="firstName">First Name</option>
          </FilterSelect>
          <FilterSelect
            label="Sort Order"
            name="sortOrder"
            value={filters.sortOrder}
            onChange={handleFilterChange}
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </FilterSelect>
        </div>
      </section>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
          {error}
        </div>
      )}

      {loading ? (
        <ProfileSkeleton />
      ) : profiles.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center dark:border-slate-700 dark:bg-slate-900">
          <p className="text-lg font-medium text-slate-900 dark:text-white">No profiles found</p>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            Try adjusting your search or filter criteria.
          </p>
        </div>
      ) : viewMode === 'cards' ? (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {profiles.map((profile) => (
            <ProfileCard
              key={profile.id}
              profile={profile}
              showActions
              onDelete={canDelete ? handleDelete : undefined}
            />
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md dark:border-slate-700 dark:bg-slate-900">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
              <thead className="bg-slate-50 dark:bg-slate-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Member
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Church Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Ministry
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Attendance
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {profiles.map((profile) => (
                  <tr key={profile.id} className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <ProfileAvatar profile={profile} size="sm" />
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">
                            {profile.fullName || profile.user?.name}
                          </p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            {profile.user?.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                      {ROLE_LABELS[profile.user?.role] || profile.user?.role}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                      {profile.churchRole || '—'}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                      {profile.ministry || '—'}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                      {profile.attendanceScore ?? 0}%
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <Link
                          to={`/dashboard/profiles/${profile.id}`}
                          className="rounded-lg px-3 py-1.5 text-sm font-medium text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950"
                        >
                          View
                        </Link>
                        <Link
                          to={`/dashboard/profiles/${profile.id}/edit`}
                          className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                        >
                          Edit
                        </Link>
                        {canDelete && (
                          <button
                            type="button"
                            onClick={() => handleDelete(profile)}
                            className="rounded-lg px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {pagination.pages > 1 && (
        <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-6 py-4 dark:border-slate-700 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Page {pagination.page} of {pagination.pages} · {pagination.total} members
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={filters.page <= 1}
              onClick={() => setFilters((prev) => ({ ...prev, page: prev.page - 1 }))}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium disabled:opacity-50 dark:border-slate-700"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={filters.page >= pagination.pages}
              onClick={() => setFilters((prev) => ({ ...prev, page: prev.page + 1 }))}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium disabled:opacity-50 dark:border-slate-700"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function FilterInput({ label, name, value, onChange, placeholder }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}
      </span>
      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-white"
      />
    </label>
  );
}

function FilterSelect({ label, name, value, onChange, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}
      </span>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-white"
      >
        {children}
      </select>
    </label>
  );
}
