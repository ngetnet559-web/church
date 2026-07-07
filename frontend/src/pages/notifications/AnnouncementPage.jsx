import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { announcementService } from "../../services/announcement.service";
import { ROLES } from "../../constants/roles";
import AnnouncementList from "../../components/notifications/AnnouncementList";
import { Megaphone, Plus, Search } from "lucide-react";

export default function AnnouncementPage() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    content: "",
    targetRoles: [],
    isPinned: false,
  });
  const isAdmin = user?.role === ROLES.SUPER_ADMIN || user?.role === ROLES.ADMIN;

  useEffect(() => {
    loadAnnouncements();
  }, []);

  async function loadAnnouncements() {
    setLoading(true);
    try {
      const res = await announcementService.getAnnouncements({ search });
      setAnnouncements(res.data?.announcements || []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = setTimeout(loadAnnouncements, 300);
    return () => clearTimeout(timer);
  }, [search]);

  async function handleCreate(e) {
    e.preventDefault();
    try {
      await announcementService.createAnnouncement(form);
      setForm({ title: "", description: "", content: "", targetRoles: [], isPinned: false });
      setShowForm(false);
      loadAnnouncements();
    } catch {
      // silent
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this announcement?")) return;
    try {
      await announcementService.deleteAnnouncement(id);
      loadAnnouncements();
    } catch {
      // silent
    }
  }

  async function handleTogglePin(announcement) {
    try {
      await announcementService.updateAnnouncement(announcement._id, {
        isPinned: !announcement.isPinned,
      });
      loadAnnouncements();
    } catch {
      // silent
    }
  }

  function toggleRole(role) {
    setForm((prev) => ({
      ...prev,
      targetRoles: prev.targetRoles.includes(role)
        ? prev.targetRoles.filter((r) => r !== role)
        : [...prev.targetRoles, role],
    }));
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Announcements</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Stay updated with the latest announcements
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
          >
            <Plus size={16} />
            New Announcement
          </button>
        )}
      </div>

      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search announcements..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400"
        />
      </div>

      {showForm && isAdmin && (
        <form onSubmit={handleCreate} className="space-y-4 rounded-2xl border border-indigo-200 bg-indigo-50 p-6 dark:border-indigo-800 dark:bg-indigo-950">
          <h3 className="text-lg font-semibold text-indigo-900 dark:text-indigo-200">Create Announcement</h3>

          <input
            type="text"
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
          />

          <input
            type="text"
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
          />

          <textarea
            placeholder="Content (optional)"
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            rows={4}
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
          />

          <div>
            <p className="mb-2 text-sm font-medium text-indigo-900 dark:text-indigo-200">Target Roles</p>
            <div className="flex flex-wrap gap-2">
              {["STUDENT", "PARENT", "TEACHER", "ADMIN", "SUPER_ADMIN"].map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => toggleRole(role)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-medium transition ${
                    form.targetRoles.includes(role)
                      ? "bg-indigo-600 text-white"
                      : "bg-white text-gray-600 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-indigo-900 dark:text-indigo-200">
            <input
              type="checkbox"
              checked={form.isPinned}
              onChange={(e) => setForm({ ...form, isPinned: e.target.checked })}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            Pin this announcement
          </label>

          <div className="flex gap-2">
            <button
              type="submit"
              className="rounded-xl bg-indigo-600 px-6 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
            >
              Publish
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-xl border border-gray-300 bg-white px-6 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {isAdmin && !showForm && announcements.length > 0 && (
        <div className="rounded-2xl bg-white p-4 shadow-lg dark:bg-gray-800">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {announcements.map((a) => (
              <div
                key={a._id}
                className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900 dark:text-white">{a.title}</p>
                  <p className="text-xs text-gray-500">{a.isPinned ? "Pinned" : "Active"}</p>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleTogglePin(a)}
                    className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-indigo-600 dark:hover:bg-gray-700 dark:hover:text-indigo-400"
                    title={a.isPinned ? "Unpin" : "Pin"}
                  >
                    <Megaphone size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(a._id)}
                    className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-red-600 dark:hover:bg-gray-700 dark:hover:text-red-400"
                    title="Delete"
                  >
                    &times;
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <AnnouncementList announcements={announcements} loading={loading} />
    </div>
  );
}
