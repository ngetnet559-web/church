import { Check, HelpCircle, X } from 'lucide-react';

const statuses = [
  { value: 'going', label: 'Going', icon: Check, color: 'green' },
  { value: 'maybe', label: 'Maybe', icon: HelpCircle, color: 'yellow' },
  { value: 'not-going', label: 'Not Going', icon: X, color: 'red' },
];

export default function RSVPButtons({ currentStatus, onRSVP, loading, event }) {
  const isPast = new Date(event?.endDate) < new Date();
  const isCancelled = event?.isCancelled || event?.status === 'cancelled';

  if (isPast || isCancelled) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {statuses.map((s) => {
        const isActive = currentStatus === s.value;
        const Icon = s.icon;
        const colorMap = {
          green: isActive
            ? 'bg-green-600 text-white border-green-600'
            : 'bg-white dark:bg-gray-700 text-green-600 border-green-300 dark:border-green-600 hover:bg-green-50 dark:hover:bg-green-900/20',
          yellow: isActive
            ? 'bg-yellow-500 text-white border-yellow-500'
            : 'bg-white dark:bg-gray-700 text-yellow-600 border-yellow-300 dark:border-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20',
          red: isActive
            ? 'bg-red-600 text-white border-red-600'
            : 'bg-white dark:bg-gray-700 text-red-600 border-red-300 dark:border-red-600 hover:bg-red-50 dark:hover:bg-red-900/20',
        };

        return (
          <button
            key={s.value}
            onClick={() => onRSVP(s.value)}
            disabled={loading}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${colorMap[s.color]} disabled:opacity-50`}
          >
            <Icon size={16} />
            {s.label}
          </button>
        );
      })}
    </div>
  );
}
