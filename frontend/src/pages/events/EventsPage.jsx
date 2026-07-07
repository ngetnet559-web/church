import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, Plus, Filter, SlidersHorizontal, RefreshCw, ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { ROLES } from '../../constants/roles.js';
import { eventService } from '../../services/event.service.js';
import { api } from '../../services/api.js';
import EventCard from '../../components/events/EventCard.jsx';
import EventModal from '../../components/events/EventModal.jsx';

const statusOptions = ['all', 'draft', 'published', 'cancelled', 'completed'];

function EventCardSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm animate-pulse">
      <div className="h-1.5 rounded-t-2xl bg-gray-200 dark:bg-gray-700" />
      <div className="p-5 space-y-3">
        <div className="flex gap-2">
          <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded-full" />
          <div className="h-5 w-14 bg-gray-200 dark:bg-gray-700 rounded-full" />
        </div>
        <div className="h-6 w-3/4 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="pt-3 border-t border-gray-100 dark:border-gray-700 space-y-2">
          <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-4 w-1/3 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </div>
    </div>
  );
}

export default function EventsPage() {
  const navigate = useNavigate();
  const { user, hasRole } = useAuth();
  const canCreate = hasRole(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEACHER);

  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await api('/api/events/categories');
      setCategories(res.data || []);
    } catch {
      setCategories([]);
    }
  }, []);

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const params = { page, limit: 12 };
      if (search) params.search = search;
      if (categoryFilter) params.category = categoryFilter;
      if (statusFilter !== 'all') params.status = statusFilter;
      const res = await eventService.getEvents(params);
      setEvents(res.data?.events || []);
      setTotalPages(res.data?.totalPages || 1);
    } catch (err) {
      setError(err.message || 'Failed to load events');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, categoryFilter, statusFilter]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleCreate = () => {
    setSelectedEvent(null);
    setModalOpen(true);
  };

  const handleEdit = (event) => {
    setSelectedEvent(event);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    try {
      await eventService.deleteEvent(id);
      fetchEvents();
    } catch (err) {
      alert(err.message || 'Failed to delete event');
    }
  };

  const handleDuplicate = async (id) => {
    try {
      await eventService.duplicateEvent(id);
      fetchEvents();
    } catch (err) {
      alert(err.message || 'Failed to duplicate event');
    }
  };

  const handleCancel = async (id) => {
    const reason = window.prompt('Reason for cancellation:');
    if (reason === null) return;
    try {
      await eventService.cancelEvent(id, reason);
      fetchEvents();
    } catch (err) {
      alert(err.message || 'Failed to cancel event');
    }
  };

  const handleModalSubmit = async (formData) => {
    try {
      setModalLoading(true);
      if (selectedEvent) {
        await eventService.updateEvent(selectedEvent._id, formData);
      } else {
        await eventService.createEvent(formData);
      }
      setModalOpen(false);
      setSelectedEvent(null);
      fetchEvents();
    } catch (err) {
      alert(err.message || 'Failed to save event');
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Events</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage and browse all church events</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchEvents}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium transition-colors"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
          {canCreate && (
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 text-sm font-medium transition-colors"
            >
              <Plus size={18} />
              Create Event
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search events..."
            value={search}
            onChange={handleSearch}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
              className="pl-9 pr-8 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm appearance-none cursor-pointer focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div className="relative">
            <SlidersHorizontal size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="pl-9 pr-8 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm appearance-none cursor-pointer focus:ring-2 focus:ring-indigo-500"
            >
              {statusOptions.map((s) => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 p-4 text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <EventCardSkeleton key={i} />
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-12 text-center">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-4">
            <CalendarDays size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">No events found</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            {search || categoryFilter || statusFilter !== 'all'
              ? 'Try adjusting your filters.'
              : 'Get started by creating your first event.'}
          </p>
          {canCreate && !search && !categoryFilter && statusFilter === 'all' && (
            <button
              onClick={handleCreate}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 text-sm font-medium transition-colors"
            >
              <Plus size={18} />
              Create Event
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <EventCard
                key={event._id}
                event={event}
                showActions={canCreate}
                onEdit={canCreate ? handleEdit : undefined}
                onDelete={canCreate ? handleDelete : undefined}
                onDuplicate={canCreate ? handleDuplicate : undefined}
                onCancel={canCreate ? handleCancel : undefined}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex items-center gap-1 px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} />
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-9 h-9 rounded-xl text-sm font-medium transition-colors ${
                    p === page
                      ? 'bg-indigo-600 text-white'
                      : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="flex items-center gap-1 px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}

      <EventModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setSelectedEvent(null); }}
        onSubmit={handleModalSubmit}
        event={selectedEvent}
        rooms={[]}
        categories={categories}
        loading={modalLoading}
      />
    </div>
  );
}
