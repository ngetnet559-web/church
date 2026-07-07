import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, MapPin, User, Users, Edit, XCircle, Trash2, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { ROLES } from '../../constants/roles.js';
import { eventService } from '../../services/event.service.js';
import RSVPButtons from '../../components/events/RSVPButtons.jsx';

const statusColors = {
  draft: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
  published: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  completed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
};

function DetailSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
        <div className="flex gap-2">
          <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded-full" />
          <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded-full" />
        </div>
        <div className="h-8 w-3/4 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="space-y-2">
          <div className="h-4 w-1/3 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-4 w-1/4 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
        <div className="h-20 w-full bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
    </div>
  );
}

export default function EventDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, hasRole } = useAuth();
  const canManage = hasRole(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEACHER);

  const [event, setEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rsvpLoading, setRsvpLoading] = useState(false);
  const [currentStatus, setCurrentStatus] = useState('');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const [eventRes, regRes] = await Promise.all([
        eventService.getEventById(id),
        eventService.getRegistrations(id),
      ]);
      setEvent(eventRes.data);
      setRegistrations(regRes.data || []);
      if (eventRes.data.userRegistration) {
        setCurrentStatus(eventRes.data.userRegistration.status);
      }
    } catch (err) {
      setError(err.message || 'Failed to load event');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRSVP = async (status) => {
    try {
      setRsvpLoading(true);
      await eventService.rsvpEvent(id, status);
      setCurrentStatus(status);
      const regRes = await eventService.getRegistrations(id);
      setRegistrations(regRes.data || []);
    } catch (err) {
      alert(err.message || 'Failed to update RSVP');
    } finally {
      setRsvpLoading(false);
    }
  };

  const handleCancel = async () => {
    const reason = window.prompt('Reason for cancellation:');
    if (reason === null) return;
    try {
      await eventService.cancelEvent(id, reason);
      fetchData();
    } catch (err) {
      alert(err.message || 'Failed to cancel event');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    try {
      await eventService.deleteEvent(id);
      navigate('/dashboard/events');
    } catch (err) {
      alert(err.message || 'Failed to delete event');
    }
  };

  const formatDate = (date) => new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  const formatTime = (date) => new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  if (loading) {
    return <DetailSkeleton />;
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="rounded-2xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950 p-8 text-center">
          <p className="text-lg font-semibold text-red-700 dark:text-red-400">{error}</p>
          <button onClick={fetchData} className="mt-4 rounded-xl bg-indigo-600 px-6 py-2 text-white hover:bg-indigo-700 transition-colors">
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!event) return null;

  const isMultiDay = new Date(event.endDate).toDateString() !== new Date(event.startDate).toDateString();

  return (
    <div className="space-y-6">
      <Link
        to="/dashboard/events"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
      >
        <ArrowLeft size={16} />
        Back to Events
      </Link>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="h-2" style={{ backgroundColor: event.color || '#6366f1' }} />

        <div className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-3">
                {event.category && (
                  <span
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    style={{ backgroundColor: `${event.category.color || '#6366f1'}20`, color: event.category.color || '#6366f1' }}
                  >
                    {event.category.name}
                  </span>
                )}
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[event.status] || statusColors.draft}`}>
                  {event.status}
                </span>
                {event.isCancelled && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                    Cancelled
                  </span>
                )}
              </div>

              <h1 className={`text-2xl font-bold text-gray-900 dark:text-white ${event.isCancelled ? 'line-through' : ''}`}>
                {event.title}
              </h1>

              {event.organizer && (
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Organized by {event.organizer}
                </p>
              )}
            </div>

            {canManage && (
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => navigate(`/dashboard/events/${id}/edit`)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <Edit size={15} />
                  Edit
                </button>
                {!event.isCancelled && (
                  <button
                    onClick={handleCancel}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-red-300 dark:border-red-600 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <XCircle size={15} />
                    Cancel
                  </button>
                )}
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-red-300 dark:border-red-600 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <Trash2 size={15} />
                  Delete
                </button>
              </div>
            )}
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
              <Calendar size={18} className="text-indigo-500 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Date</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {formatDate(event.startDate)}
                  {isMultiDay && ` - ${formatDate(event.endDate)}`}
                </p>
              </div>
            </div>

            {!event.allDay && (
              <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                <Clock size={18} className="text-indigo-500 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Time</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {formatTime(event.startDate)}
                    {!isMultiDay && ` - ${formatTime(event.endDate)}`}
                  </p>
                </div>
              </div>
            )}

            {event.location && (
              <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                <MapPin size={18} className="text-indigo-500 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Location</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{event.location}</p>
                </div>
              </div>
            )}

            {event.speaker && (
              <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                <User size={18} className="text-indigo-500 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Speaker</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{event.speaker}</p>
                </div>
              </div>
            )}
          </div>

          {event.description && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Description</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{event.description}</p>
            </div>
          )}

          {event.capacity > 0 && (
            <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              Capacity: {event.capacity}
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Your RSVP</h3>
            <RSVPButtons
              currentStatus={currentStatus}
              onRSVP={handleRSVP}
              loading={rsvpLoading}
              event={event}
            />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users size={18} className="text-gray-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Registrations ({registrations.length})
            </h3>
          </div>
        </div>

        {registrations.length === 0 ? (
          <div className="p-6 text-center text-sm text-gray-500 dark:text-gray-400">
            No registrations yet.
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {registrations.map((reg) => (
              <div key={reg._id} className="px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                    <User size={15} className="text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {reg.user?.name || reg.user?.email || 'Unknown'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{reg.user?.email}</p>
                  </div>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  reg.status === 'going'
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : reg.status === 'maybe'
                    ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                }`}>
                  {reg.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
