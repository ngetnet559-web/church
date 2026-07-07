import { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { eventService } from '../../services/event.service.js';

export default function EventDashboardWidget({ limit = 5, showViewAll = true }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await eventService.getUpcomingEvents(limit);
        setEvents(res.data || []);
      } catch {
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [limit]);

  const formatTime = (date) => new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const formatDate = (date) => new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Upcoming Events</h3>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="animate-pulse flex gap-3">
              <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl" />
              <div className="flex-1">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Upcoming Events</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">No upcoming events.</p>
        {showViewAll && (
          <Link to="/dashboard/calendar" className="inline-flex items-center gap-1 mt-3 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
            View Calendar <ArrowRight size={14} />
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Upcoming Events</h3>
        {showViewAll && (
          <Link to="/dashboard/calendar" className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
            View All
          </Link>
        )}
      </div>

      <div className="space-y-3">
        {events.map((event) => (
          <Link
            key={event._id}
            to={`/dashboard/events/${event._id}`}
            className="flex items-start gap-3 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
          >
            <div
              className="flex-shrink-0 w-12 h-12 rounded-xl flex flex-col items-center justify-center text-white text-xs font-bold"
              style={{ backgroundColor: event.color || '#6366f1' }}
            >
              <span>{new Date(event.startDate).getDate()}</span>
              <span>{new Date(event.startDate).toLocaleDateString('en-US', { month: 'short' })}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                {event.title}
              </p>
              <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                {!event.allDay && (
                  <span className="flex items-center gap-1">
                    <Clock size={11} />
                    {formatTime(event.startDate)}
                  </span>
                )}
                {event.location && (
                  <span className="flex items-center gap-1">
                    <MapPin size={11} />
                    {event.location}
                  </span>
                )}
              </div>
            </div>
            <Calendar size={16} className="text-gray-300 dark:text-gray-600 group-hover:text-indigo-400 transition-colors" />
          </Link>
        ))}
      </div>
    </div>
  );
}
