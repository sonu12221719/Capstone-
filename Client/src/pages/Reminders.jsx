import { useState, useEffect } from "react";
import api from "../api/client";
import { Stethoscope, Pill, Syringe, FlaskConical, Bell, AlertTriangle, Check, X } from "lucide-react";

const typeIconMap = {
  checkup:     Stethoscope,
  medication:  Pill,
  vaccination: Syringe,
  test:        FlaskConical,
  general:     Bell,
};

const typeColor = {
  checkup: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
  medication: "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800",
  vaccination: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800",
  test: "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800",
  general: "bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600",
};

function TypeIcon({ type, className = "w-5 h-5" }) {
  const Icon = typeIconMap[type] || Bell;
  return <Icon className={className} />;
}

function ReminderCard({ reminder, onComplete, onDelete }) {
  const isOverdue = !reminder.isCompleted && new Date(reminder.scheduledDate) < new Date();

  return (
    <div className={`border rounded-xl p-4 ${typeColor[reminder.type] || "bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600"} ${
      reminder.isCompleted ? "opacity-60" : ""
    }`}>
      <div className="flex items-start gap-3">
        <span className="shrink-0 mt-0.5">
          <TypeIcon type={reminder.type} />
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className={`font-medium text-sm ${reminder.isCompleted ? "line-through text-gray-400 dark:text-gray-500" : "text-gray-900 dark:text-white"}`}>
                {reminder.title}
              </p>
              {reminder.description && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{reminder.description}</p>
              )}
            </div>
            <div className="flex gap-1 shrink-0">
              {!reminder.isCompleted && (
                <button
                  onClick={() => onComplete(reminder._id)}
                  className="text-xs bg-white dark:bg-gray-700 border border-green-300 dark:border-green-700 text-green-700 dark:text-green-400 px-2 py-1 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 flex items-center gap-1"
                >
                  <Check className="w-3 h-3" /> Done
                </button>
              )}
              <button
                onClick={() => onDelete(reminder._id)}
                className="text-xs bg-white dark:bg-gray-700 border border-red-200 dark:border-red-800 text-red-500 dark:text-red-400 px-2 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className={`text-xs flex items-center gap-1 ${isOverdue ? "text-red-600 dark:text-red-400 font-medium" : "text-gray-400 dark:text-gray-500"}`}>
              {isOverdue && <AlertTriangle className="w-3 h-3" />}
              {isOverdue ? "Overdue · " : ""}
              {new Date(reminder.scheduledDate).toLocaleDateString("en-IN", {
                day: "numeric", month: "short", year: "numeric"
              })}
            </span>
            {reminder.recurring?.enabled && (
              <span className="badge-blue capitalize">{reminder.recurring.interval}</span>
            )}
            {reminder.isCompleted && <span className="badge-green">Completed</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

const defaultForm = {
  title: "", type: "general", description: "",
  scheduledDate: "", recurringEnabled: false, recurringInterval: "weekly",
};

export default function Reminders() {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState("upcoming");

  const fetchReminders = (f = filter) => {
    const params = f === "upcoming" ? "?upcoming=true" : f === "completed" ? "?completed=true" : "";
    api.get(`/reminders${params}`)
      .then(({ data }) => setReminders(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchReminders(); }, []);

  const changeFilter = (f) => {
    setFilter(f);
    setLoading(true);
    fetchReminders(f);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/reminders", {
        title: form.title,
        type: form.type,
        description: form.description,
        scheduledDate: form.scheduledDate,
        recurring: form.recurringEnabled
          ? { enabled: true, interval: form.recurringInterval }
          : { enabled: false },
      });
      setShowForm(false);
      setForm(defaultForm);
      fetchReminders();
    } catch {
      alert("Failed to create reminder.");
    } finally {
      setSaving(false);
    }
  };

  const handleComplete = async (id) => {
    await api.patch(`/reminders/${id}/complete`);
    fetchReminders();
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this reminder?")) return;
    await api.delete(`/reminders/${id}`);
    fetchReminders();
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {["upcoming", "all", "completed"].map((f) => (
            <button
              key={f}
              onClick={() => changeFilter(f)}
              className={`text-sm px-4 py-1.5 rounded-full border capitalize transition-colors ${
                filter === f
                  ? "bg-blue-600 text-white border-blue-600"
                  : "text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <button className="btn-primary flex items-center gap-1.5" onClick={() => setShowForm(true)}>
          + Add Reminder
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="card border-blue-100 dark:border-blue-800">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">New Reminder</h3>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label>
                <input
                  className="input-field"
                  required
                  placeholder="e.g. Blood sugar check"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                <select
                  className="input-field"
                  value={form.type}
                  onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                >
                  {Object.keys(typeIconMap).map((t) => (
                    <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Date *</label>
                <input
                  type="datetime-local"
                  className="input-field"
                  required
                  value={form.scheduledDate}
                  onChange={(e) => setForm((f) => ({ ...f, scheduledDate: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <input
                  className="input-field"
                  placeholder="Optional note"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.recurringEnabled}
                  onChange={(e) => setForm((f) => ({ ...f, recurringEnabled: e.target.checked }))}
                  className="rounded"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Recurring</span>
              </label>
              {form.recurringEnabled && (
                <select
                  className="input-field w-auto"
                  value={form.recurringInterval}
                  onChange={(e) => setForm((f) => ({ ...f, recurringInterval: e.target.value }))}
                >
                  {["daily", "weekly", "monthly", "yearly"].map((i) => (
                    <option key={i} value={i}>{i.charAt(0).toUpperCase() + i.slice(1)}</option>
                  ))}
                </select>
              )}
            </div>
            <div className="flex gap-2 pt-1">
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? "Saving..." : "Create Reminder"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : reminders.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-400 dark:text-gray-500">No reminders found.</p>
          <button className="btn-primary mt-3" onClick={() => setShowForm(true)}>Create your first reminder</button>
        </div>
      ) : (
        <div className="space-y-3">
          {reminders.map((r) => (
            <ReminderCard key={r._id} reminder={r} onComplete={handleComplete} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
