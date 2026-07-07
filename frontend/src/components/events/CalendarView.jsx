import { useRef, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';

export default function CalendarView({ events, onDateClick, onEventClick, onCreateClick, loading }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('month');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startPad = firstDay.getDay();
  const daysInMonth = lastDay.getDate();

  const today = new Date();
  const isToday = (d) => d.toDateString() === today.toDateString();

  const navigate = (dir) => {
    const d = new Date(currentDate);
    if (view === 'month') d.setMonth(d.getMonth() + dir);
    else if (view === 'week') d.setDate(d.getDate() + 7 * dir);
    else d.setDate(d.getDate() + dir);
    setCurrentDate(d);
  };

  const getEventsForDay = (day) => {
    const dayStart = new Date(year, month, day);
    const dayEnd = new Date(year, month, day + 1);
    return (Array.isArray(events) ? events : []).filter((e) => {
      const eStart = new Date(e.startDate);
      const eEnd = new Date(e.endDate);
      return eStart < dayEnd && eEnd > dayStart;
    });
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500">
            <ChevronLeft size={20} />
          </button>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {monthNames[month]} {year}
          </h3>
          <button onClick={() => navigate(1)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500">
            <ChevronRight size={20} />
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-3 py-1 text-xs font-medium rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            Today
          </button>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden text-xs">
            {['month', 'week', 'day'].map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3 py-1.5 font-medium capitalize ${view === v ? 'bg-indigo-600 text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              >
                {v}
              </button>
            ))}
          </div>
          {onCreateClick && (
            <button
              onClick={onCreateClick}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-700"
            >
              <Plus size={14} /> New
            </button>
          )}
        </div>
      </div>

      {view === 'month' && (
        <div>
          <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700">
            {dayNames.map((d) => (
              <div key={d} className="p-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {Array.from({ length: startPad }).map((_, i) => (
              <div key={`pad-${i}`} className="min-h-[80px] md:min-h-[100px] p-1 bg-gray-50/50 dark:bg-gray-800/50" />
            ))}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
              const dayEvents = getEventsForDay(day);
              const d = new Date(year, month, day);
              return (
                <div
                  key={day}
                  onClick={() => onDateClick && onDateClick(d)}
                  className={`min-h-[80px] md:min-h-[100px] p-1 border-b border-r border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${isToday(d) ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : ''}`}
                >
                  <div className={`text-xs font-medium mb-1 px-1 ${isToday(d) ? 'bg-indigo-600 text-white rounded-full w-6 h-6 flex items-center justify-center' : 'text-gray-600 dark:text-gray-400'}`}>
                    {day}
                  </div>
                  <div className="space-y-0.5">
                    {dayEvents.slice(0, 3).map((event) => (
                      <div
                        key={event._id}
                        onClick={(e) => { e.stopPropagation(); onEventClick && onEventClick(event); }}
                        className="text-xs px-1 py-0.5 rounded truncate text-white cursor-pointer hover:opacity-80"
                        style={{ backgroundColor: event.color || '#6366f1' }}
                      >
                        {event.allDay ? '' : new Date(event.startDate).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) + ' '}
                        {event.title}
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-xs text-gray-400 dark:text-gray-500 px-1">+{dayEvents.length - 3} more</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {(view === 'week' || view === 'day') && (
        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
          {view === 'week' ? 'Week view is not yet implemented. Switch to Month or Day view.' : 'Day view is not yet implemented. Switch to Month view.'}
        </div>
      )}
    </div>
  );
}
