import { useState, useEffect } from "react";
import api from "../api/client";

const sourceIcon = { chat: "💬", prescription: "💊", report: "📄" };
const sourceColor = {
  chat: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300",
  prescription: "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300",
  report: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300",
};

function RiskCard({ risk }) {
  if (!risk) return null;
  const color = risk.score < 30 ? "text-green-600 dark:text-green-400" : risk.score < 60 ? "text-yellow-600 dark:text-yellow-400" : "text-red-600 dark:text-red-400";
  const barColor = risk.score < 30 ? "bg-green-500" : risk.score < 60 ? "bg-yellow-500" : "bg-red-500";

  return (
    <div className="card mb-6">
      <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Current Risk Assessment</h3>
      <div className="flex items-center gap-4 mb-4">
        <div>
          <p className={`text-4xl font-bold ${color}`}>{risk.score}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{risk.level}</p>
        </div>
        <div className="flex-1">
          <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-3">
            <div className={`${barColor} h-3 rounded-full`} style={{ width: `${risk.score}%` }} />
          </div>
        </div>
      </div>
      {risk.factors?.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Risk Factors:</p>
          {risk.factors.map((f, i) => (
            <div key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
              <span className="text-orange-500 mt-0.5">⚠</span>
              <span>{f.factor} — {f.recommendation}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MemoryCard({ memory, onClear }) {
  const [confirming, setConfirming] = useState(false);

  return (
    <div className="card mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900 dark:text-white">AI Health Memory</h3>
        {confirming ? (
          <div className="flex gap-2">
            <button className="text-xs text-red-600 dark:text-red-400 font-medium hover:underline" onClick={onClear}>Confirm clear</button>
            <button className="text-xs text-gray-500 dark:text-gray-400 hover:underline" onClick={() => setConfirming(false)}>Cancel</button>
          </div>
        ) : (
          <button
            className="text-xs text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
            onClick={() => setConfirming(true)}
          >
            Clear memory
          </button>
        )}
      </div>
      <div className="grid grid-cols-2 gap-4 text-sm">
        {[
          { label: "Frequent Symptoms", data: memory?.frequentSymptoms, color: "badge-blue" },
          { label: "Past Diagnoses", data: memory?.pastDiagnoses, color: "badge-yellow" },
          { label: "Medications", data: memory?.medicationsHistory, color: "badge-green" },
          { label: "Risk Patterns", data: memory?.riskPatterns, color: "badge-red" },
        ].map(({ label, data, color }) => (
          <div key={label}>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">{label}</p>
            <div className="flex flex-wrap gap-1">
              {data?.length > 0
                ? data.slice(0, 6).map((item) => (
                    <span key={item} className={color}>{item}</span>
                  ))
                : <span className="text-gray-400 dark:text-gray-500 text-xs">None recorded</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function HealthTimeline() {
  const [records, setRecords] = useState([]);
  const [risk, setRisk] = useState(null);
  const [memory, setMemory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const fetchData = () => {
    Promise.all([
      api.get("/health/timeline"),
      api.get("/health/risk-score"),
      api.get("/health/memory"),
    ])
      .then(([r, risk, mem]) => {
        setRecords(r.data || []);
        setRisk(risk.data);
        setMemory(mem.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const clearMemory = async () => {
    await api.delete("/health/memory");
    setMemory({ frequentSymptoms: [], pastDiagnoses: [], medicationsHistory: [], riskPatterns: [] });
  };

  const filtered = filter === "all" ? records : records.filter((r) => r.source === filter);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <RiskCard risk={risk} />
      <MemoryCard memory={memory} onClear={clearMemory} />

      {/* Timeline */}
      <div className="card">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h3 className="font-semibold text-gray-900 dark:text-white">Health Timeline</h3>
          <div className="flex gap-2 flex-wrap">
            {["all", "chat", "prescription", "report"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`text-xs px-3 py-1 rounded-full border transition-colors capitalize ${
                  filter === f
                    ? "bg-blue-600 text-white border-blue-600"
                    : "text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className="text-center text-gray-400 dark:text-gray-500 py-12">No health records found.</p>
        ) : (
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />
            <div className="space-y-4">
              {filtered.map((record) => (
                <div key={record._id} className="relative flex gap-4 pl-10">
                  <div className="absolute left-2 w-5 h-5 rounded-full bg-white dark:bg-gray-800 border-2 border-blue-400 flex items-center justify-center text-xs">
                    {sourceIcon[record.source] || "📋"}
                  </div>
                  <div className={`flex-1 border rounded-xl p-4 ${sourceColor[record.source] || "bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600"}`}>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium text-sm">
                          {record.diagnosis || "No diagnosis recorded"}
                        </p>
                        <p className="text-xs opacity-70 mt-0.5">
                          {new Date(record.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
                          })}
                        </p>
                      </div>
                      <span className="text-xs px-2 py-0.5 rounded-full border capitalize">
                        {record.source}
                      </span>
                    </div>

                    {record.symptoms?.length > 0 && (
                      <div className="mb-2">
                        <p className="text-xs font-medium opacity-70 mb-1">Symptoms:</p>
                        <div className="flex flex-wrap gap-1">
                          {record.symptoms.map((s) => (
                            <span key={s} className="text-xs bg-white/60 dark:bg-black/20 px-2 py-0.5 rounded-full border border-current/20">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {record.medicines?.length > 0 && (
                      <div>
                        <p className="text-xs font-medium opacity-70 mb-1">Medicines:</p>
                        <div className="space-y-1">
                          {record.medicines.map((m, i) => (
                            <p key={i} className="text-xs">
                              💊 {m.name}
                              {m.dosage && ` — ${m.dosage}`}
                              {m.duration && ` (${m.duration})`}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
