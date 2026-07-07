import { Link } from 'react-router-dom';
import { Building, Users, Monitor, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { useState } from 'react';

export default function RoomCard({ room, onEdit, onDelete, showActions }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="relative rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <Link to={`/dashboard/rooms/${room._id}`} className="block">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                {room.name}
              </h3>
            </Link>
            <div className="flex items-center gap-2 mt-1 text-sm text-gray-500 dark:text-gray-400">
              <Building size={14} />
              <span>{room.building || 'No building'}{room.floor ? `, Floor ${room.floor}` : ''}</span>
            </div>
          </div>

          {showActions && (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400"
              >
                <MoreHorizontal size={18} />
              </button>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-1 z-20 w-36 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-1">
                    {onEdit && <button onClick={() => { onEdit(room); setMenuOpen(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"><Edit size={15} /> Edit</button>}
                    {onDelete && <button onClick={() => { onDelete(room._id); setMenuOpen(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"><Trash2 size={15} /> Delete</button>}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {room.description && (
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{room.description}</p>
        )}

        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1.5">
            <Users size={14} />
            <span>Capacity: <strong>{room.capacity}</strong></span>
          </div>
        </div>

        {room.equipment && room.equipment.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
            <div className="flex flex-wrap gap-1.5">
              {room.equipment.map((eq, i) => (
                <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                  <Monitor size={12} />
                  {eq}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${room.isAvailable ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
            {room.isAvailable ? 'Available' : 'Unavailable'}
          </span>
        </div>
      </div>
    </div>
  );
}
