import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, CalendarDays, ArrowRight } from 'lucide-react';
import { eventService } from '../../services/event.service.js';

function RegistrationSkeleton() {
  return (
    <div className="animate-pulse">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 mb-3">
          <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-5 w-3/4 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
          <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded-full" />
        </div>
      ))}
    </div>
  );
}

export default function MyEventsPage() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchRegistrations = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await eventService.getMyRegistrations();
      setRegistrations(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load your registrations');
      setRegistrations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRegistrations();
  }, [fetchRegistrations]);

  const formatDate = (date) => new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  const formatTime = (date) => new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  const statusBadge = (status) => {
    const colors = {
      going: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      maybe: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      'not-going': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Events</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Events you have registered for</p>
      </div>

      <Link
        to="/dashboard/events"
        className="inline-flex items-center gap-1.5 text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
      >
        Browse all events
        <ArrowRight size={14} />
      </Link>

      {error && (
        <div className="rounded-xl bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 p-4 text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {loading ? (
        <RegistrationSkeleton />
      ) : registrations.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-12 text-center">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-4">
            <CalendarDays size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">No registrations yet</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            You haven't registered for any events. Browse available events to get started.
          </p>
          <Link
            to="/dashboard/events"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 text-sm font-medium transition-colors"
          >
            Browse Events
            <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {registrations.map((reg) => {
            const event = reg.event || reg;
            return (
              <Link
                key={reg._id || event._id}
                to={`/dashboard/events/${event._id}`}
                className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200 group"
              >
                <div
                  className="flex-shrink-0 w-12 h-12 rounded-xl flex flex-col items-center justify-center text-white text-xs font-bold"
                  style={{ backgroundColor: event.color || '#6366f1' }}
                >
                  <span>{new Date(event.startDate).getDate()}</span>
                  <span>{new Date(event.startDate).toLocaleDateString('en-US', { month: 'short' })}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                    {event.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      {formatDate(event.startDate)}
                    </span>
                    {!event.allDay && (
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {formatTime(event.startDate)}
                      </span>
                    )}
                    {event.location && (
                      <span className="flex items-center gap-1">
                        <MapPin size={12} />
                        {event.location}
                      </span>
                    )}
                  </div>
                </div>
                {reg.status ? statusBadge(reg.status) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                    Registered
                  </span>
                )}
                <ArrowRight size={16} className="text-gray-300 dark:text-gray-600 group-hover:text-indigo-400 transition-colors flex-shrink-0" />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
