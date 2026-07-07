import { useState, useEffect } from 'react';
import { Building, Users, Calendar, DoorOpen, Plus, Save, Edit, Trash2, Monitor } from 'lucide-react';
import { roomService } from '../../services/room.service.js';

export default function AdminRoomsPage() {
  const [rooms, setRooms] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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

  const loadData = async () => {
    try {
      setLoading(true);
      const [roomsRes, statsRes] = await Promise.all([
        roomService.getRooms(),
        roomService.getRoomStats(),
      ]);
      setRooms(roomsRes.data.rooms || roomsRes.data || []);
      setStats(statsRes.data || null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
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
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this room? This action cannot be undone.')) return;
    try {
      await roomService.deleteRoom(id);
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const statCards = [
    { label: 'Total Rooms', value: stats?.totalRooms ?? rooms.length, icon: DoorOpen, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
    { label: 'Available', value: stats?.availableRooms ?? rooms.filter((r) => r.isAvailable).length, icon: Building, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20' },
    { label: 'Active Bookings', value: stats?.activeBookings ?? 0, icon: Calendar, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Room Management</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">Manage rooms, equipment, and availability.</p>
        </div>
        <button
          type="button"
          onClick={showForm ? () => { setShowForm(false); resetForm(); } : openCreateForm}
          className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
        >
          {showForm ? null : <Plus size={18} />}
          {showForm ? 'Cancel' : 'Add Room'}
        </button>
      </div>

      {error && (
        <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-400">{error}</div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        {statCards.map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${stat.bg}`}>
                <stat.icon size={24} className={stat.color} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

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

      {loading ? (
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="p-8 space-y-4 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded-xl" />
            ))}
          </div>
        </div>
      ) : rooms.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-12 text-center">
          <DoorOpen size={48} className="mx-auto mb-3 text-gray-300 dark:text-gray-600" />
          <p className="text-gray-500 dark:text-gray-400">No rooms created yet.</p>
          <button type="button" onClick={openCreateForm} className="mt-3 text-sm font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-400">
            Create your first room
          </button>
        </div>
      ) : (
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                  <th className="px-6 py-4 text-left font-medium text-gray-600 dark:text-gray-400">Name</th>
                  <th className="px-6 py-4 text-left font-medium text-gray-600 dark:text-gray-400">Location</th>
                  <th className="px-6 py-4 text-left font-medium text-gray-600 dark:text-gray-400">Capacity</th>
                  <th className="px-6 py-4 text-left font-medium text-gray-600 dark:text-gray-400">Equipment</th>
                  <th className="px-6 py-4 text-left font-medium text-gray-600 dark:text-gray-400">Status</th>
                  <th className="px-6 py-4 text-right font-medium text-gray-600 dark:text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {rooms.map((room) => (
                  <tr key={room._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{room.name}</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                      {room.building || '—'}{room.floor ? ` (Floor ${room.floor})` : ''}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 text-gray-700 dark:text-gray-300">
                        <Users size={14} /> {room.capacity}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {room.equipment?.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {room.equipment.slice(0, 3).map((eq, i) => (
                            <span key={i} className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                              <Monitor size={11} /> {eq}
                            </span>
                          ))}
                          {room.equipment.length > 3 && <span className="text-xs text-gray-400">+{room.equipment.length - 3}</span>}
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        room.isAvailable ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {room.isAvailable ? 'Available' : 'Unavailable'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEditForm(room)}
                          className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(room._id)}
                          className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
