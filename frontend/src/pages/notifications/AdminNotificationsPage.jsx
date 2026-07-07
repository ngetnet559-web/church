import { useState } from "react";
import { notificationService } from "../../services/notification.service";
import { ROLES } from "../../constants/roles";
import { ALL_ROLES } from "../../constants/roles";
import {
  NOTIFICATION_TYPES,
  NOTIFICATION_CATEGORIES,
  NOTIFICATION_PRIORITIES,
} from "../../constants/notifications";
import { Send, Users, Bell } from "lucide-react";

export default function AdminNotificationsPage() {
  const [mode, setMode] = useState("single");
  const [form, setForm] = useState({
    recipient: "",
    role: "",
    title: "",
    message: "",
    type: "info",
    category: "System",
    priority: "normal",
  });
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setSending(true);
    setResult(null);

    try {
      let res;
      if (mode === "single") {
        res = await notificationService.createNotification({
          recipient: form.recipient,
          title: form.title,
          message: form.message,
          type: form.type,
          category: form.category,
          priority: form.priority,
        });
      } else {
        res = await notificationService.createBulkNotification({
          role: form.role || undefined,
          title: form.title,
          message: form.message,
          type: form.type,
          category: form.category,
          priority: form.priority,
        });
      }
      setResult({ type: "success", message: `Notification sent successfully!` });
      setForm({ ...form, title: "", message: "" });
    } catch (err) {
      setResult({ type: "error", message: err.message || "Failed to send notification" });
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Send Notification</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Send notifications to users or roles
        </p>
      </div>

      <div className="flex gap-2 rounded-2xl bg-white p-2 shadow-lg dark:bg-gray-800">
        <button
          onClick={() => setMode("single")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
            mode === "single"
              ? "bg-indigo-600 text-white shadow"
              : "bg-transparent text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
          }`}
        >
          <Send size={16} /> Single User
        </button>
        <button
          onClick={() => setMode("bulk")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
            mode === "bulk"
              ? "bg-indigo-600 text-white shadow"
              : "bg-transparent text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
          }`}
        >
          <Users size={16} /> Bulk / Role
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-800">
        {mode === "single" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Recipient ID
            </label>
            <input
              type="text"
              value={form.recipient}
              onChange={(e) => setForm({ ...form, recipient: e.target.value })}
              placeholder="User ObjectId"
              required
              className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
            />
          </div>
        )}

        {mode === "bulk" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Target Role (optional — sends to all if empty)
            </label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
            >
              <option value="">All Users</option>
              {ALL_ROLES.map((role) => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Notification title"
            required
            className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Message</label>
          <textarea
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            placeholder="Notification message"
            required
            rows={3}
            className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Type</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
            >
              {Object.values(NOTIFICATION_TYPES).map((t) => (
                <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
            >
              {Object.values(NOTIFICATION_CATEGORIES).map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Priority</label>
            <select
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
              className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
            >
              {Object.values(NOTIFICATION_PRIORITIES).map((p) => (
                <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
              ))}
            </select>
          </div>
        </div>

        {result && (
          <div className={`rounded-xl p-4 text-sm font-medium ${
            result.type === "success"
              ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300"
              : "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300"
          }`}>
            {result.message}
          </div>
        )}

        <button
          type="submit"
          disabled={sending}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {sending ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <Send size={18} />
          )}
          {sending ? "Sending..." : "Send Notification"}
        </button>
      </form>
    </div>
  );
}
