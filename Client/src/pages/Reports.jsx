import { useState, useEffect, useRef } from "react";
import api from "../api/client";

// ── AI Analysis result panel ──────────────────────────────────────────────────
function AnalysisPanel({ result }) {
  const { analysis, diagnosis, medicines, symptoms } = result;

  if (!analysis && !diagnosis) return null;

  const a = analysis || {};

  return (
    <div className="card border-green-200 dark:border-green-800 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center text-xl shrink-0">🤖</div>
        <div>
          <h3 className="font-bold text-gray-900 dark:text-white">AI Analysis Complete</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">Powered by Gemini AI · Results saved to your Health Records</p>
        </div>
      </div>

      {/* Summary */}
      {a.summary && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl p-4">
          <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-1">Summary</p>
          <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">{a.summary}</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Patient Info */}
        {a.patientInfo && Object.values(a.patientInfo).some(Boolean) && (
          <div className="bg-gray-50 dark:bg-gray-700/40 rounded-xl p-4">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Patient</p>
            <div className="space-y-1 text-sm">
              {a.patientInfo.name && <p><span className="text-gray-400 dark:text-gray-500">Name:</span> <span className="text-gray-800 dark:text-gray-200 font-medium">{a.patientInfo.name}</span></p>}
              {a.patientInfo.age && <p><span className="text-gray-400 dark:text-gray-500">Age:</span> <span className="text-gray-800 dark:text-gray-200 font-medium">{a.patientInfo.age}</span></p>}
              {a.patientInfo.gender && <p><span className="text-gray-400 dark:text-gray-500">Gender:</span> <span className="text-gray-800 dark:text-gray-200 font-medium">{a.patientInfo.gender}</span></p>}
              {a.patientInfo.date && <p><span className="text-gray-400 dark:text-gray-500">Date:</span> <span className="text-gray-800 dark:text-gray-200 font-medium">{a.patientInfo.date}</span></p>}
            </div>
          </div>
        )}

        {/* Doctor Info */}
        {a.doctorInfo && Object.values(a.doctorInfo).some(Boolean) && (
          <div className="bg-gray-50 dark:bg-gray-700/40 rounded-xl p-4">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Doctor</p>
            <div className="space-y-1 text-sm">
              {a.doctorInfo.name && <p><span className="text-gray-400 dark:text-gray-500">Name:</span> <span className="text-gray-800 dark:text-gray-200 font-medium">{a.doctorInfo.name}</span></p>}
              {a.doctorInfo.specialization && <p><span className="text-gray-400 dark:text-gray-500">Specialization:</span> <span className="text-gray-800 dark:text-gray-200 font-medium">{a.doctorInfo.specialization}</span></p>}
              {a.doctorInfo.hospital && <p><span className="text-gray-400 dark:text-gray-500">Hospital:</span> <span className="text-gray-800 dark:text-gray-200 font-medium">{a.doctorInfo.hospital}</span></p>}
            </div>
          </div>
        )}
      </div>

      {/* Diagnosis */}
      {diagnosis && diagnosis !== "Pending review" && (
        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800 rounded-xl p-4">
          <p className="text-xs font-semibold text-orange-600 dark:text-orange-400 uppercase tracking-wide mb-1">Diagnosis</p>
          <p className="text-sm font-medium text-gray-900 dark:text-white">{diagnosis}</p>
        </div>
      )}

      {/* Symptoms */}
      {symptoms?.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Symptoms Noted</p>
          <div className="flex flex-wrap gap-2">
            {symptoms.map((s, i) => <span key={i} className="badge-blue">{s}</span>)}
          </div>
        </div>
      )}

      {/* Medicines */}
      {a.medicines?.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Prescribed Medicines</p>
          <div className="space-y-2">
            {a.medicines.map((m, i) => (
              <div key={i} className="bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span>💊</span>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">{m.name}</p>
                  {m.dosage && <span className="badge-blue">{m.dosage}</span>}
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-gray-600 dark:text-gray-400 ml-6">
                  {m.frequency && <span>🕐 {m.frequency}</span>}
                  {m.duration && <span>📅 {m.duration}</span>}
                  {m.instructions && <span>📌 {m.instructions}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lab Results */}
      {a.labResults?.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Lab Results</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-gray-200 dark:border-gray-700">
                  <th className="pb-2 text-xs text-gray-500 dark:text-gray-400 font-medium">Test</th>
                  <th className="pb-2 text-xs text-gray-500 dark:text-gray-400 font-medium">Value</th>
                  <th className="pb-2 text-xs text-gray-500 dark:text-gray-400 font-medium">Normal Range</th>
                  <th className="pb-2 text-xs text-gray-500 dark:text-gray-400 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {a.labResults.map((r, i) => (
                  <tr key={i}>
                    <td className="py-2 text-gray-800 dark:text-gray-200 font-medium">{r.test}</td>
                    <td className="py-2 text-gray-700 dark:text-gray-300">{r.value}</td>
                    <td className="py-2 text-gray-500 dark:text-gray-400">{r.normalRange || "—"}</td>
                    <td className="py-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        r.status === "normal" ? "badge-green" :
                        r.status === "abnormal" ? "badge-red" : "badge-yellow"
                      }`}>{r.status || "—"}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Instructions */}
      {a.instructions?.length > 0 && (
        <div className="bg-gray-50 dark:bg-gray-700/40 rounded-xl p-4">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Doctor's Instructions</p>
          <ul className="space-y-1">
            {a.instructions.map((ins, i) => (
              <li key={i} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                <span className="text-blue-500 mt-0.5 shrink-0">•</span> {ins}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Warnings */}
      {a.warnings?.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl p-4">
          <p className="text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-wide mb-2">⚠️ Warnings / Precautions</p>
          <ul className="space-y-1">
            {a.warnings.map((w, i) => (
              <li key={i} className="text-sm text-red-700 dark:text-red-300 flex items-start gap-2">
                <span className="shrink-0">•</span> {w}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Follow-up */}
      {a.followUp && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-xl p-4">
          <p className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wide mb-1">Follow-up</p>
          <p className="text-sm text-gray-700 dark:text-gray-300">{a.followUp}</p>
        </div>
      )}
    </div>
  );
}

// ── Individual saved report card ──────────────────────────────────────────────
function ReportCard({ report, onDelete }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="card">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center text-xl shrink-0">
          📄
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-medium text-sm text-gray-900 dark:text-white">
                {report.diagnosis || "Pending review"}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                {new Date(report.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric", month: "short", year: "numeric"
                })} · {report.source}
              </p>
            </div>
            <div className="flex gap-1 shrink-0">
              <button
                onClick={() => setExpanded((x) => !x)}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
              >
                {expanded ? "Less" : "Details"}
              </button>
              <button
                onClick={() => onDelete(report._id)}
                className="text-xs text-red-500 dark:text-red-400 hover:underline ml-2"
              >
                Delete
              </button>
            </div>
          </div>

          {expanded && (
            <div className="mt-3 space-y-2">
              {report.symptoms?.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Symptoms</p>
                  <div className="flex flex-wrap gap-1">
                    {report.symptoms.map((s) => <span key={s} className="badge-blue">{s}</span>)}
                  </div>
                </div>
              )}
              {report.medicines?.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Medicines</p>
                  <div className="space-y-1">
                    {report.medicines.map((m, i) => (
                      <div key={i} className="text-xs bg-purple-50 dark:bg-purple-900/20 rounded px-2 py-1 text-purple-700 dark:text-purple-300">
                        💊 <strong>{m.name}</strong>
                        {m.dosage && ` — ${m.dosage}`}
                        {m.duration && ` (${m.duration})`}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function Reports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef(null);

  const fetchReports = () => {
    api.get("/reports")
      .then(({ data }) => setReports(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchReports(); }, []);

  const handleUpload = async (file) => {
    if (!file) return;

    const allowed = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!allowed.includes(file.type)) {
      setUploadResult({ success: false, message: "Unsupported file type. Please upload JPEG, PNG, WebP, or PDF." });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadResult({ success: false, message: "File too large. Maximum size is 5 MB." });
      return;
    }

    setUploading(true);
    setUploadResult(null);

    const fd = new FormData();
    fd.append("file", file); // ← must match upload.single("file") on server

    try {
      const { data } = await api.post("/reports/upload", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUploadResult({ success: true, data });
      fetchReports();
    } catch (err) {
      setUploadResult({
        success: false,
        message: err.response?.data?.message || "Upload failed. Please try again.",
      });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleUpload(file);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this report?")) return;
    await api.delete(`/reports/${id}`);
    fetchReports();
  };

  return (
    <div className="space-y-5">
      {/* Upload zone */}
      <div
        className={`card border-2 border-dashed transition-colors cursor-pointer text-center py-10 ${
          dragOver
            ? "border-blue-500 bg-blue-100 dark:bg-blue-900/30"
            : "border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/10 hover:border-blue-400 dark:hover:border-blue-600"
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !uploading && fileRef.current?.click()}
      >
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,application/pdf"
          className="hidden"
          onChange={(e) => handleUpload(e.target.files?.[0])}
        />
        {uploading ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <div>
              <p className="text-sm text-blue-600 dark:text-blue-400 font-semibold">Analyzing your document...</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Extracting text and running AI analysis. This may take 15–30 seconds.</p>
            </div>
          </div>
        ) : (
          <div>
            <div className="text-5xl mb-3">📤</div>
            <p className="text-blue-700 dark:text-blue-300 font-semibold text-lg">Upload Prescription or Lab Report</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Click to browse or drag & drop</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
              Supports: JPEG, PNG, WebP, <strong>PDF</strong> · Max 5 MB
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              AI will extract diagnosis, medicines, lab results and more
            </p>
          </div>
        )}
      </div>

      {/* Upload result */}
      {uploadResult && (
        <div>
          {uploadResult.success ? (
            <AnalysisPanel result={uploadResult.data.ocrResult} />
          ) : (
            <div className="card border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
              <p className="text-red-700 dark:text-red-400 text-sm">❌ {uploadResult.message}</p>
            </div>
          )}
          {uploadResult.success && uploadResult.data.ocrResult?.error && (
            <div className="card border border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20 mt-2">
              <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                ⚠️ Partial extraction: {uploadResult.data.ocrResult.error}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Reports list */}
      <div>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
          Saved Reports ({reports.length})
        </h3>
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : reports.length === 0 ? (
          <div className="card text-center py-12">
            <div className="text-4xl mb-3">📋</div>
            <p className="text-gray-400 dark:text-gray-500">No reports uploaded yet.</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              Upload a prescription or lab report above and AI will analyze it instantly.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {reports.map((r) => <ReportCard key={r._id} report={r} onDelete={handleDelete} />)}
          </div>
        )}
      </div>
    </div>
  );
}
