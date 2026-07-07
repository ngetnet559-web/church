import { useState, useEffect } from "react";
import { X, Megaphone } from "lucide-react";
import { announcementService } from "../../services/announcement.service";

export default function AnnouncementBanner() {
  const [announcements, setAnnouncements] = useState([]);
  const [dismissed, setDismissed] = useState(new Set());

  useEffect(() => {
    loadAnnouncements();
  }, []);

  async function loadAnnouncements() {
    try {
      const res = await announcementService.getActiveAnnouncements();
      const pinned = (res.data || []).filter((a) => a.isPinned);
      setAnnouncements(pinned.slice(0, 3));
    } catch {
      // silent
    }
  }

  const visible = announcements.filter((a) => !dismissed.has(a._id));

  if (visible.length === 0) return null;

  return (
    <div className="space-y-2">
      {visible.map((a) => (
        <div
          key={a._id}
          className="flex items-start gap-3 rounded-2xl border border-indigo-200 bg-indigo-50 p-4 dark:border-indigo-800 dark:bg-indigo-950"
        >
          <Megaphone size={20} className="mt-0.5 shrink-0 text-indigo-600 dark:text-indigo-400" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-indigo-900 dark:text-indigo-200">
              {a.title}
            </p>
            <p className="mt-0.5 text-sm text-indigo-700 dark:text-indigo-300">
              {a.description}
            </p>
          </div>
          <button
            onClick={() => setDismissed((prev) => new Set([...prev, a._id]))}
            className="shrink-0 rounded-lg p-1 text-indigo-400 transition hover:bg-indigo-100 hover:text-indigo-600 dark:hover:bg-indigo-900 dark:hover:text-indigo-300"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
