import { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import api from "../api/client";
import { Bell, X, Check, Stethoscope, Pill, Syringe, FlaskConical } from "lucide-react";
import { useAuth } from "../context/AuthContext";

// ── Constants ──────────────────────────────────────────────────────────────────
const POLL_MS        = 30_000;           // check every 30 seconds
const WINDOW_MS      = 2 * 60 * 1000;   // only notify if due within last 2 min
const STORAGE_KEY    = "notified_reminder_ids";

const typeIconMap = {
  checkup:     Stethoscope,
  medication:  Pill,
  vaccination: Syringe,
  test:        FlaskConical,
  general:     Bell,
};

// ── Web Audio ring tone ────────────────────────────────────────────────────────
function playRing() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const note = (freq, t, dur) => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.001, ctx.currentTime + t);
      gain.gain.exponentialRampToValueAtTime(0.35, ctx.currentTime + t + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + dur);
      osc.start(ctx.currentTime + t);
      osc.stop(ctx.currentTime + t + dur + 0.05);
    };
    // Bell chord: C6 + E6, three times
    note(1047, 0.00, 0.45); note(1319, 0.02, 0.40);
    note(1047, 0.60, 0.45); note(1319, 0.62, 0.40);
    note(1047, 1.20, 0.45); note(1319, 1.22, 0.40);
    setTimeout(() => ctx.close().catch(() => {}), 2200);
  } catch (_) { /* audio unavailable */ }
}

// ── Browser (OS-level) notification ───────────────────────────────────────────
function browserNotify(title, body) {
  if (Notification.permission === "granted") {
    new Notification(`⏰ ${title}`, {
      body: body || "Time for your scheduled reminder.",
      icon: "/favicon.ico",
      tag: "healthai-reminder",
    });
  }
}

// ── In-app popup ───────────────────────────────────────────────────────────────
function Popup({ reminder, queueSize, onDismiss, onDone }) {
  const Icon = typeIconMap[reminder.type] || Bell;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-4 pointer-events-none">
      {/* click-through backdrop just for visual dimming */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto" onClick={onDismiss} />

      <div
        className="relative w-full max-w-sm rounded-2xl p-5 pointer-events-auto"
        style={{
          background: "rgba(4,18,24,.97)",
          border: "1.5px solid #29a89c",
          boxShadow: "0 0 0 1px rgba(41,168,156,.25), 0 24px 64px rgba(0,0,0,.85)",
          animation: "reminderSlideUp .35s cubic-bezier(.21,1.02,.73,1) forwards",
        }}
      >
        {/* Glowing ring around the bell */}
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 relative"
            style={{
              background: "linear-gradient(135deg,#0a6e8a,#29a89c)",
              boxShadow: "0 0 24px rgba(41,168,156,.6)",
              animation: "reminderBell .5s ease-in-out 4",
            }}
          >
            <Bell className="w-6 h-6 text-white" />
            {/* pulse ring */}
            <span
              className="absolute inset-0 rounded-xl"
              style={{ animation: "reminderPulse 1.5s ease-out 3", border: "2px solid #29a89c" }}
            />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ color: "#29a89c" }}>
              Reminder
            </p>
            <h3 className="font-bold text-white text-sm leading-snug truncate">{reminder.title}</h3>
          </div>

          <button
            onClick={onDismiss}
            className="p-1.5 rounded-lg shrink-0 transition-colors"
            style={{ color: "#4a8a95" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#0a2530"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Description */}
        {reminder.description && (
          <p className="text-xs mb-3 pl-[60px]" style={{ color: "#7ab5c0" }}>
            {reminder.description}
          </p>
        )}

        {/* Meta row */}
        <div className="flex items-center gap-2 mb-4 pl-[60px]">
          <Icon className="w-3 h-3 shrink-0" style={{ color: "#29a89c" }} />
          <span className="text-xs capitalize" style={{ color: "#4a8a95" }}>{reminder.type}</span>
          <span style={{ color: "#1e5a6a" }}>·</span>
          <span className="text-xs" style={{ color: "#4a8a95" }}>
            {new Date(reminder.scheduledDate).toLocaleTimeString("en-IN", {
              hour: "2-digit", minute: "2-digit",
            })}
          </span>
          {queueSize > 1 && (
            <>
              <span style={{ color: "#1e5a6a" }}>·</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                style={{ background: "rgba(10,110,138,.25)", color: "#4abdc6" }}>
                +{queueSize - 1} more
              </span>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={onDismiss}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all"
            style={{ background: "#0a2530", border: "1px solid #164555", color: "#7ab5c0" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#0f3040"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "#0a2530"; }}
          >
            Dismiss
          </button>
          <button
            onClick={onDone}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 transition-all"
            style={{
              background: "linear-gradient(135deg,#0a6e8a,#0a5f7a)",
              color: "#fff",
              boxShadow: "0 4px 14px rgba(10,110,138,.4)",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 6px 20px rgba(10,110,138,.6)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 4px 14px rgba(10,110,138,.4)"; }}
          >
            <Check className="w-4 h-4" /> Mark Done
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function ReminderNotifier() {
  const { user } = useAuth();
  const [queue, setQueue]    = useState([]);
  const notifiedRef          = useRef(new Set());
  const audioUnlocked        = useRef(false);

  // Load previously notified IDs from localStorage on mount
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      notifiedRef.current = new Set(saved);
    } catch (_) {}
  }, []);

  // Unlock Web Audio on first user interaction (browser requires this)
  useEffect(() => {
    const unlock = () => { audioUnlocked.current = true; };
    window.addEventListener("click",   unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
    return () => {
      window.removeEventListener("click",   unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, []);

  // Ask for browser notification permission
  useEffect(() => {
    if (typeof Notification !== "undefined" && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  const checkDue = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await api.get("/reminders");
      const now = Date.now();

      const due = data.filter((r) => {
        if (r.isCompleted) return false;
        if (notifiedRef.current.has(r._id)) return false;
        const t = new Date(r.scheduledDate).getTime();
        // Fire only if it became due within the last WINDOW_MS
        return t <= now && t >= now - WINDOW_MS;
      });

      if (due.length === 0) return;

      // Mark notified before updating state to prevent race
      due.forEach((r) => notifiedRef.current.add(r._id));
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...notifiedRef.current]));
      } catch (_) {}

      setQueue((prev) => {
        const existing = new Set(prev.map((r) => r._id));
        return [...prev, ...due.filter((r) => !existing.has(r._id))];
      });

      if (audioUnlocked.current) playRing();
      due.forEach((r) => browserNotify(r.title, r.description));
    } catch (_) {}
  }, [user]);

  useEffect(() => {
    if (!user) return;
    checkDue();
    const id = setInterval(checkDue, POLL_MS);
    return () => clearInterval(id);
  }, [user, checkDue]);

  const dismiss  = (id) => setQueue((q) => q.filter((r) => r._id !== id));
  const markDone = async (id) => {
    try { await api.patch(`/reminders/${id}/complete`); } catch (_) {}
    dismiss(id);
  };

  if (queue.length === 0) return null;

  const current = queue[0];
  return (
    <Popup
      reminder={current}
      queueSize={queue.length}
      onDismiss={() => dismiss(current._id)}
      onDone={() => markDone(current._id)}
    />
  );
}
