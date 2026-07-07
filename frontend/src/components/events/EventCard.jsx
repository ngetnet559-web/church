import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, Users, User, MoreHorizontal, Edit, Copy, XCircle, Trash2 } from 'lucide-react';
import { useState } from 'react';

const statusColors = {
  draft: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
  published: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  completed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
};

export default function EventCard({ event, onEdit, onDelete, onDuplicate, onCancel, showActions }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const isMultiDay = new Date(event.endDate).toDateString() !== new Date(event.startDate).toDateString();
  const isOngoing = new Date(event.startDate) <= new Date() && new Date(event.endDate) >= new Date();

  return (
    <div className={`relative rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all duration-200 ${event.isCancelled ? 'opacity-60' : ''}`}>
      <div className="h-1.5 rounded-t-2xl" style={{ backgroundColor: event.color || '#6366f1' }} />

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              {event.category && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                  style={{ backgroundColor: `${event.category.color || '#6366f1'}20`, color: event.category.color || '#6366f1' }}
                >
                  {event.category.name}
                </span>
              )}
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[event.status] || statusColors.draft}`}>
                {event.status}
              </span>
              {isOngoing && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 animate-pulse">
                  Ongoing
                </span>
              )}
            </div>

            <Link to={`/dashboard/events/${event._id}`} className="block">
              <h3 className={`text-lg font-semibold text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors ${event.isCancelled ? 'line-through' : ''}`}>
                {event.title}
              </h3>
            </Link>

            {event.description && (
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{event.description}</p>
            )}
          </div>

          {showActions && (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <MoreHorizontal size={18} />
              </button>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-1 z-20 w-44 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-1">
                    {onEdit && <button onClick={() => { onEdit(event); setMenuOpen(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"><Edit size={15} /> Edit</button>}
                    {onDuplicate && <button onClick={() => { onDuplicate(event._id); setMenuOpen(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"><Copy size={15} /> Duplicate</button>}
                    {onCancel && !event.isCancelled && <button onClick={() => { onCancel(event._id); setMenuOpen(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"><XCircle size={15} /> Cancel Event</button>}
                    {onDelete && <button onClick={() => { onDelete(event._id); setMenuOpen(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"><Trash2 size={15} /> Delete</button>}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1.5">
            <Calendar size={14} />
            <span>{formatDate(event.startDate)}</span>
          </div>
          {!event.allDay && (
            <div className="flex items-center gap-1.5">
              <Clock size={14} />
              <span>
                {formatTime(event.startDate)}
                {!isMultiDay && ` - ${formatTime(event.endDate)}`}
              </span>
            </div>
          )}
          {event.location && (
            <div className="flex items-center gap-1.5">
              <MapPin size={14} />
              <span className="truncate max-w-[150px]">{event.location}</span>
            </div>
          )}
          {event.speaker && (
            <div className="flex items-center gap-1.5">
              <User size={14} />
              <span>{event.speaker}</span>
            </div>
          )}
        </div>

        {event.registrationCounts && (
          <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1"><Users size={13} /> <span className="font-medium text-green-600 dark:text-green-400">{event.registrationCounts.going || 0}</span> going</span>
            <span><span className="font-medium text-yellow-600 dark:text-yellow-400">{event.registrationCounts.maybe || 0}</span> maybe</span>
            {event.capacity > 0 && <span>Capacity: {event.capacity}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
