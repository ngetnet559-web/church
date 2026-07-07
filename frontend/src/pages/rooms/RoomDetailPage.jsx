import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Building, Users, Monitor, Calendar, CheckCircle, XCircle, Clock, Mail } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { ROLES } from '../../constants/roles.js';
import { roomService } from '../../services/room.service.js';
import { bookingService } from '../../services/booking.service.js';
import RoomBookingModal from '../../components/rooms/RoomBookingModal.jsx';

const STATUS_STYLES = {
  pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  approved: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  cancelled: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
};

export default function RoomDetailPage() {
  const { id } = useParams();
  const { user, hasRole } = useAuth();
  const [room, setRoom] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);

  const canManage = hasRole(ROLES.SUPER_ADMIN, ROLES.ADMIN);

  const loadData = async () => {
    try {
      setLoading(true);
      const roomRes = await roomService.getRoomById(id);
      setRoom(roomRes.data.room || roomRes.data);
      let bookingsRes;
      try {
        bookingsRes = await roomService.getRoomSchedule(id, new Date().toISOString().slice(0, 10));
      } catch {
        bookingsRes = await bookingService.getBookings({ room: id });
      }
      const rawBookings = bookingsRes.data?.bookings || bookingsRes.data?.schedule || bookingsRes.data || [];
      setBookings(rawBookings);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleBookingSubmit = async (data) => {
    try {
      setBookingLoading(true);
      await bookingService.createBooking(data);
      setShowBookingModal(false);
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setBookingLoading(false);
    }
  };

  const handleApprove = async (bookingId) => {
    try {
      await bookingService.approveBooking(bookingId);
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleReject = async (bookingId) => {
    const reason = window.prompt('Reason for rejection:');
    if (!reason) return;
    try {
      await bookingService.rejectBooking(bookingId, reason);
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const formatDate = (d) => {
    if (!d) return '';
    const date = new Date(d);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 animate-pulse">
          <div className="h-7 w-2/3 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
          <div className="h-4 w-1/3 bg-gray-200 dark:bg-gray-700 rounded mb-3" />
          <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded mb-3" />
          <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 animate-pulse">
          <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
          ))}
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-12 text-center">
        <p className="text-gray-500 dark:text-gray-400">Room not found.</p>
        <Link to="/dashboard/rooms" className="mt-2 inline-block text-sm font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-400">← Back to rooms</Link>
      </div>
    );
  }

  const upcomingBookings = bookings.filter((b) => {
    if (!b.startDate) return true;
    return new Date(b.startDate) >= new Date(Date.now() - 86400000);
  }).sort((a, b) => new Date(a.startDate || 0) - new Date(b.startDate || 0));

  return (
    <div className="space-y-6">
      <Link to="/dashboard/rooms" className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-400">
        ← Back to rooms
      </Link>

      {error && (
        <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-400">{error}</div>
      )}

      <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{room.name}</h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2 text-sm text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1.5"><Building size={16} /> {room.building || 'No building'}{room.floor ? `, Floor ${room.floor}` : ''}</span>
                <span className="flex items-center gap-1.5"><Users size={16} /> Capacity: {room.capacity}</span>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  room.isAvailable ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                }`}>
                  {room.isAvailable ? 'Available' : 'Unavailable'}
                </span>
              </div>
              {room.description && (
                <p className="mt-4 text-gray-600 dark:text-gray-300">{room.description}</p>
              )}
              {room.equipment && room.equipment.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {room.equipment.map((eq, i) => (
                    <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                      <Monitor size={14} /> {eq}
                    </span>
                  ))}
                </div>
              )}
            </div>
            {room.isAvailable && (
              <button
                type="button"
                onClick={() => setShowBookingModal(true)}
                className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors shrink-0"
              >
                <Calendar size={18} /> Book This Room
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Upcoming Bookings ({upcomingBookings.length})
          </h2>
        </div>
        {upcomingBookings.length === 0 ? (
          <div className="p-12 text-center text-gray-500 dark:text-gray-400">
            <Calendar size={40} className="mx-auto mb-3 opacity-40" />
            <p>No upcoming bookings for this room.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                  <th className="px-6 py-3 text-left font-medium text-gray-600 dark:text-gray-400">Date Range</th>
                  <th className="px-6 py-3 text-left font-medium text-gray-600 dark:text-gray-400">Booked By</th>
                  <th className="px-6 py-3 text-left font-medium text-gray-600 dark:text-gray-400">Status</th>
                  {canManage && <th className="px-6 py-3 text-left font-medium text-gray-600 dark:text-gray-400">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {upcomingBookings.map((booking) => (
                  <tr key={booking._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                        <Clock size={14} className="text-gray-400 shrink-0" />
                        <span className="font-medium">{formatDate(booking.startDate)}</span>
                        <span className="text-gray-400">—</span>
                        <span>{formatDate(booking.endDate)}</span>
                      </div>
                      {booking.title && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{booking.title}</p>}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Mail size={14} className="text-gray-400 shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300">
                          {booking.bookedBy?.name || booking.user?.name || 'N/A'}
                        </span>
                        <span className="text-gray-400 text-xs">
                          ({booking.bookedBy?.email || booking.user?.email || ''})
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[booking.status] || STATUS_STYLES.pending}`}>
                        {booking.status?.charAt(0).toUpperCase() + booking.status?.slice(1) || 'Pending'}
                      </span>
                    </td>
                    {canManage && (
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {booking.status === 'pending' && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleApprove(booking._id)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/40 text-xs font-medium transition-colors"
                              >
                                <CheckCircle size={14} /> Approve
                              </button>
                              <button
                                type="button"
                                onClick={() => handleReject(booking._id)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 text-xs font-medium transition-colors"
                              >
                                <XCircle size={14} /> Reject
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <RoomBookingModal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        onSubmit={handleBookingSubmit}
        room={room}
        loading={bookingLoading}
      />
    </div>
  );
}
