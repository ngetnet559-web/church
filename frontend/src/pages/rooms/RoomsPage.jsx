import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, SlidersHorizontal, X, Plus, Save } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { ROLES } from '../../constants/roles.js';
import { roomService } from '../../services/room.service.js';
import RoomCard from '../../components/rooms/RoomCard.jsx';

export default function RoomsPage() {
  const { user, hasRole } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [capacityFilter, setCapacityFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '',
    building: '',
    floor: '',
    capacity: '',
    description: '',
    equipment: '',
    isAvailable: true,
  });

  const canManage = hasRole(ROLES.SUPER_ADMIN, ROLES.ADMIN);

  const loadRooms = async () => {
    try {
      setLoading(true);
      const res = await roomService.getRooms();
      setRooms(res.data.rooms || res.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRooms();
  }, []);

  const resetForm = () => {
    setForm({ name: '', building: '', floor: '', capacity: '', description: '', equipment: '', isAvailable: true });
    setEditingRoom(null);
  };

  const openCreateForm = () => {
    resetForm();
    setShowForm(true);
  };

  const openEditForm = (room) => {
    setForm({
      name: room.name || '',
      building: room.building || '',
      floor: room.floor?.toString() || '',
      capacity: room.capacity?.toString() || '',
      description: room.description || '',
      equipment: (room.equipment || []).join(', '),
      isAvailable: room.isAvailable ?? true,
    });
    setEditingRoom(room);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const data = {
        ...form,
        floor: form.floor ? parseInt(form.floor, 10) : undefined,
        capacity: form.capacity ? parseInt(form.capacity, 10) : undefined,
        equipment: form.equipment ? form.equipment.split(',').map((s) => s.trim()).filter(Boolean) : [],
      };
      if (editingRoom) {
        await roomService.updateRoom(editingRoom._id, data);
      } else {
        await roomService.createRoom(data);
      }
      resetForm();
      setShowForm(false);
      await loadRooms();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this room?')) return;
    try {
      await roomService.deleteRoom(id);
      await loadRooms();
    } catch (err) {
      setError(err.message);
    }
  };

  const filtered = rooms.filter((room) => {
    if (search) {
      const q = search.toLowerCase();
      if (!room.name?.toLowerCase().includes(q) && !room.building?.toLowerCase().includes(q) && !room.description?.toLowerCase().includes(q)) return false;
    }
    if (availabilityFilter === 'available' && !room.isAvailable) return false;
    if (availabilityFilter === 'unavailable' && room.isAvailable) return false;
    if (capacityFilter && (room.capacity || 0) < parseInt(capacityFilter, 10)) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Rooms</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">Browse and book available rooms.</p>
        </div>
        {canManage && (
          <button
            type="button"
            onClick={showForm ? () => { setShowForm(false); resetForm(); } : openCreateForm}
            className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
          >
            {showForm ? <X size={18} /> : <Plus size={18} />}
            {showForm ? 'Cancel' : 'Add Room'}
          </button>
        )}
      </div>

      {error && (
        <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-400">{error}</div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {editingRoom ? 'Edit Room' : 'New Room'}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name *</label>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Building</label>
              <input value={form.building} onChange={(e) => setForm({ ...form, building: e.target.value })}
                className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Floor</label>
              <input type="number" min="0" value={form.floor} onChange={(e) => setForm({ ...form, floor: e.target.value })}
                className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Capacity *</label>
              <input required type="number" min="1" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
              <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Equipment (comma-separated)</label>
              <input value={form.equipment} onChange={(e) => setForm({ ...form, equipment: e.target.value })}
                className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div className="flex items-end pb-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isAvailable} onChange={(e) => setForm({ ...form, isAvailable: e.target.checked })}
                  className="rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Available for booking</span>
              </label>
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button type="button" onClick={() => { setShowForm(false); resetForm(); }}
              className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm">Cancel</button>
            <button type="submit" disabled={submitting}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 text-sm">
              <Save size={16} /> {submitting ? 'Saving...' : editingRoom ? 'Update Room' : 'Create Room'}
            </button>
          </div>
        </form>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text" placeholder="Search rooms by name, building..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 pl-10 pr-4 py-2.5 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500" />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X size={16} />
            </button>
          )}
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <SlidersHorizontal size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select value={availabilityFilter} onChange={(e) => setAvailabilityFilter(e.target.value)}
              className="appearance-none rounded-2xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 pl-9 pr-8 py-2.5 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500">
              <option value="all">All Rooms</option>
              <option value="available">Available</option>
              <option value="unavailable">Unavailable</option>
            </select>
          </div>
          <select value={capacityFilter} onChange={(e) => setCapacityFilter(e.target.value)}
            className="rounded-2xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2.5 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500">
            <option value="">Min Capacity</option>
            <option value="10">10+</option>
            <option value="20">20+</option>
            <option value="50">50+</option>
            <option value="100">100+</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 animate-pulse">
              <div className="h-5 w-3/4 bg-gray-200 dark:bg-gray-700 rounded mb-3" />
              <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded mb-3" />
              <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded mb-2" />
              <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-12 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            {search || availabilityFilter !== 'all' || capacityFilter
              ? 'No rooms match your filters.'
              : 'No rooms found.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((room) => (
            <RoomCard
              key={room._id}
              room={room}
              showActions={canManage}
              onEdit={canManage ? openEditForm : undefined}
              onDelete={canManage ? handleDelete : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}
