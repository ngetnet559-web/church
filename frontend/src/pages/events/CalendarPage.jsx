import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, Calendar, Clock, MapPin, Filter, SlidersHorizontal, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { ROLES } from '../../constants/roles.js';
import { eventService } from '../../services/event.service.js';
import { calendarService } from '../../services/calendar.service.js';
import { api } from '../../services/api.js';
import CalendarView from '../../components/events/CalendarView.jsx';
import EventModal from '../../components/events/EventModal.jsx';

const statusOptions = ['all', 'draft', 'published', 'cancelled', 'completed'];

export default function CalendarPage() {
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const canCreate = hasRole(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEACHER);

  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [modalOpen, setModalOpen] = useState(false);
  const [prefillDate, setPrefillDate] = useState(null);
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
      const params = {};
      if (categoryFilter) params.category = categoryFilter;
      if (statusFilter !== 'all') params.status = statusFilter;
      const res = await calendarService.getCalendarEvents(params);
      setEvents(res.data?.events || []);
    } catch (err) {
      setError(err.message || 'Failed to load events');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [categoryFilter, statusFilter]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleDateClick = (date) => {
    if (canCreate) {
      setPrefillDate(date);
      setModalOpen(true);
    }
  };

  const handleEventClick = (event) => {
    navigate(`/dashboard/events/${event._id}`);
  };

  const handleCreateClick = () => {
    setPrefillDate(null);
    setModalOpen(true);
  };

  const handleModalSubmit = async (formData) => {
    try {
      setModalLoading(true);
      await eventService.createEvent(formData);
      setModalOpen(false);
      setPrefillDate(null);
      fetchEvents();
    } catch (err) {
      alert(err.message || 'Failed to create event');
    } finally {
      setModalLoading(false);
    }
  };

  const formatDate = (date) => new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  const formatTime = (date) => new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  const upcomingEvents = (Array.isArray(events) ? events : [])
    .filter((e) => new Date(e.startDate) >= new Date() && e.status !== 'cancelled')
    .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Calendar</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">View and manage events on a calendar</p>
        </div>
        {canCreate && (
          <button
            onClick={handleCreateClick}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 text-sm font-medium transition-colors"
          >
            <Plus size={18} />
            Create Event
          </button>
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative">
          <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
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
            onChange={(e) => setStatusFilter(e.target.value)}
            className="pl-9 pr-8 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm appearance-none cursor-pointer focus:ring-2 focus:ring-indigo-500"
          >
            {statusOptions.map((s) => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 p-4 text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-4">
        <div className="lg:col-span-3">
          <CalendarView
            events={events}
            onDateClick={handleDateClick}
            onEventClick={handleEventClick}
            onCreateClick={canCreate ? handleCreateClick : undefined}
            loading={loading}
          />
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Upcoming Events</h3>

            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="animate-pulse flex gap-3">
                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-xl flex-shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 w-3/4 bg-gray-200 dark:bg-gray-700 rounded" />
                      <div className="h-3 w-1/2 bg-gray-200 dark:bg-gray-700 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : upcomingEvents.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">No upcoming events.</p>
            ) : (
              <div className="space-y-3">
                {upcomingEvents.map((event) => (
                  <Link
                    key={event._id}
                    to={`/dashboard/events/${event._id}`}
                    className="flex items-start gap-3 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
                  >
                    <div
                      className="flex-shrink-0 w-10 h-10 rounded-xl flex flex-col items-center justify-center text-white text-[10px] font-bold"
                      style={{ backgroundColor: event.color || '#6366f1' }}
                    >
                      <span>{new Date(event.startDate).getDate()}</span>
                      <span>{new Date(event.startDate).toLocaleDateString('en-US', { month: 'short' })}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                        {event.title}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 text-[10px] text-gray-500 dark:text-gray-400">
                        {!event.allDay && (
                          <span className="flex items-center gap-0.5">
                            <Clock size={10} />
                            {formatTime(event.startDate)}
                          </span>
                        )}
                        {event.location && (
                          <span className="flex items-center gap-0.5 truncate">
                            <MapPin size={10} />
                            {event.location}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Quick Stats</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Total Events</span>
                <span className="font-medium text-gray-900 dark:text-white">{events.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Upcoming</span>
                <span className="font-medium text-gray-900 dark:text-white">{upcomingEvents.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <EventModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setPrefillDate(null); }}
        onSubmit={handleModalSubmit}
        event={prefillDate ? { startDate: prefillDate.toISOString(), endDate: new Date(prefillDate.getTime() + 3600000).toISOString() } : null}
        rooms={[]}
        categories={categories}
        loading={modalLoading}
      />
    </div>
  );
}
