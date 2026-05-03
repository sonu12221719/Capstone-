import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/client";
import {
  Bot, ClipboardList, Bell, Stethoscope, Pill,
  MessageCircle, FileText, Upload, Heart,
} from "lucide-react";

function StatCard({ label, value, sub, color, icon }) {
  return (
    <div className="card flex items-start gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value ?? "—"}</p>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</p>
        {sub && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function RiskMeter({ score, level }) {
  const color =
    score < 30 ? "bg-green-500" : score < 60 ? "bg-yellow-500" : "bg-red-500";
  const textColor =
    score < 30 ? "text-green-700 dark:text-green-400" : score < 60 ? "text-yellow-700 dark:text-yellow-400" : "text-red-700 dark:text-red-400";
  const bgColor =
    score < 30 ? "bg-green-50 dark:bg-green-900/20" : score < 60 ? "bg-yellow-50 dark:bg-yellow-900/20" : "bg-red-50 dark:bg-red-900/20";
  const heartColor =
    score < 30 ? "text-green-500" : score < 60 ? "text-yellow-500" : "text-red-500";

  return (
    <div className={`card border-none ${bgColor}`}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Health Risk Score</p>
          <p className={`text-3xl font-bold ${textColor}`}>{score}<span className="text-base font-normal text-gray-400 dark:text-gray-500">/100</span></p>
        </div>
        <Heart className={`w-9 h-9 fill-current ${heartColor}`} />
      </div>
      <div className="w-full bg-white/60 dark:bg-gray-700/60 rounded-full h-2.5 mb-2">
        <div
          className={`${color} h-2.5 rounded-full transition-all duration-700`}
          style={{ width: `${score}%` }}
        />
      </div>
      <p className={`text-xs font-medium ${textColor}`}>{level}</p>
    </div>
  );
}

function SourceIcon({ source }) {
  if (source === "chat") return <MessageCircle className="w-5 h-5 text-blue-500" />;
  if (source === "prescription") return <Pill className="w-5 h-5 text-purple-500" />;
  return <FileText className="w-5 h-5 text-green-500" />;
}

function ReminderTypeIcon({ type }) {
  if (type === "medication") return <Pill className="w-5 h-5 text-purple-500" />;
  if (type === "checkup") return <Stethoscope className="w-5 h-5 text-blue-500" />;
  return <Bell className="w-5 h-5 text-gray-500" />;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [risk, setRisk] = useState(null);
  const [records, setRecords] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [memory, setMemory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/health/risk-score"),
      api.get("/health/timeline"),
      api.get("/reminders?upcoming=true"),
      api.get("/health/memory"),
    ])
      .then(([r, rec, rem, mem]) => {
        setRisk(r.data);
        setRecords(rec.data?.slice(0, 5) || []);
        setReminders(rem.data?.slice(0, 5) || []);
        setMemory(mem.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const upcomingReminders = reminders.filter(
    (r) => !r.isCompleted && new Date(r.scheduledDate) >= new Date()
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Hello, {user?.name?.split(" ")[0]}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">Here's your health overview for today.</p>
        </div>
        <Link to="/chat" className="btn-primary flex items-center gap-2">
          <Bot className="w-4 h-4" /> Chat with AI
        </Link>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Health Records"
          value={records.length}
          sub="Recent entries"
          icon={<ClipboardList className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
          color="bg-blue-100 dark:bg-blue-900/30"
        />
        <StatCard
          label="Upcoming Reminders"
          value={upcomingReminders.length}
          sub="Scheduled"
          icon={<Bell className="w-5 h-5 text-purple-600 dark:text-purple-400" />}
          color="bg-purple-100 dark:bg-purple-900/30"
        />
        <StatCard
          label="Symptoms Tracked"
          value={memory?.frequentSymptoms?.length ?? 0}
          sub="In AI memory"
          icon={<Stethoscope className="w-5 h-5 text-green-600 dark:text-green-400" />}
          color="bg-green-100 dark:bg-green-900/30"
        />
        <StatCard
          label="Known Conditions"
          value={user?.chronicConditions?.length ?? 0}
          sub="In profile"
          icon={<Pill className="w-5 h-5 text-orange-600 dark:text-orange-400" />}
          color="bg-orange-100 dark:bg-orange-900/30"
        />
      </div>

      {/* Risk + Quick info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {risk && <RiskMeter score={risk.score} level={risk.level} />}

        <div className="card lg:col-span-2">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Your Medical Profile</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-400 dark:text-gray-500 text-xs uppercase tracking-wide mb-1">Age / Gender</p>
              <p className="font-medium text-gray-800 dark:text-gray-200">{user?.age} yrs / {user?.gender}</p>
            </div>
            <div>
              <p className="text-gray-400 dark:text-gray-500 text-xs uppercase tracking-wide mb-1">Allergies</p>
              <div className="flex flex-wrap gap-1">
                {user?.allergies?.length > 0
                  ? user.allergies.map((a) => <span key={a} className="badge-red">{a}</span>)
                  : <span className="text-gray-400 dark:text-gray-500">None listed</span>}
              </div>
            </div>
            <div className="col-span-2">
              <p className="text-gray-400 dark:text-gray-500 text-xs uppercase tracking-wide mb-1">Chronic Conditions</p>
              <div className="flex flex-wrap gap-1">
                {user?.chronicConditions?.length > 0
                  ? user.chronicConditions.map((c) => <span key={c} className="badge-yellow">{c}</span>)
                  : <span className="text-gray-400 dark:text-gray-500">None listed</span>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent records + Reminders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Recent Health Records</h3>
            <Link to="/health" className="text-blue-600 dark:text-blue-400 text-sm hover:underline">View all</Link>
          </div>
          {records.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-6">No records yet. Start chatting with AI!</p>
          ) : (
            <div className="space-y-3">
              {records.map((r) => (
                <div key={r._id} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <span className="shrink-0 mt-0.5">
                    <SourceIcon source={r.source} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                      {r.diagnosis || "No diagnosis recorded"}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {new Date(r.createdAt).toLocaleDateString()} · {r.source}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Upcoming Reminders</h3>
            <Link to="/reminders" className="text-blue-600 dark:text-blue-400 text-sm hover:underline">View all</Link>
          </div>
          {upcomingReminders.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-6">No upcoming reminders.</p>
          ) : (
            <div className="space-y-3">
              {upcomingReminders.map((r) => (
                <div key={r._id} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <span className="shrink-0 mt-0.5">
                    <ReminderTypeIcon type={r.type} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{r.title}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {new Date(r.scheduledDate).toLocaleDateString()} ·{" "}
                      <span className="capitalize">{r.type}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { to: "/chat",      Icon: Bot,         label: "AI Chat" },
          { to: "/doctors",   Icon: Stethoscope,  label: "Find Doctors" },
          { to: "/reports",   Icon: Upload,       label: "Upload Report" },
          { to: "/reminders", Icon: Bell,         label: "Set Reminder" },
        ].map(({ to, Icon, label }) => (
          <Link
            key={to}
            to={to}
            className="card hover:shadow-md hover:border-blue-200 dark:hover:border-blue-700 transition-all duration-200 text-center cursor-pointer"
          >
            <div className="flex justify-center mb-2">
              <Icon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
