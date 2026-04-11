import { useState, useEffect } from "react";
import api from "../api/client";

function DoctorCard({ doctor }) {
  return (
    <div className="card hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start gap-4 mb-3">
        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-2xl shrink-0">
          👨‍⚕️
        </div>
        <div className="min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-white">{doctor.name}</h3>
          <p className="text-sm text-blue-600 dark:text-blue-400">{doctor.specialization}</p>
          {doctor.hospital && (
            <p className="text-xs text-gray-500 dark:text-gray-400">{doctor.hospital}</p>
          )}
        </div>
        <span className={`shrink-0 text-xs px-2 py-1 rounded-full ${
          doctor.availability ? "badge-green" : "badge-red"
        }`}>
          {doctor.availability ? "Available" : "Unavailable"}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        {doctor.location?.city && (
          <div>
            <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide">Location</p>
            <p className="text-gray-700 dark:text-gray-300">{doctor.location.city}, {doctor.location.state}</p>
          </div>
        )}
        {doctor.experience?.years && (
          <div>
            <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide">Experience</p>
            <p className="text-gray-700 dark:text-gray-300">{doctor.experience.years} years</p>
          </div>
        )}
        {doctor.fees?.initial && (
          <div>
            <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide">Consultation Fee</p>
            <p className="text-gray-700 dark:text-gray-300">₹{doctor.fees.initial} / ₹{doctor.fees.followUp} follow-up</p>
          </div>
        )}
        {doctor.rating?.average > 0 && (
          <div>
            <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide">Rating</p>
            <p className="text-gray-700 dark:text-gray-300">⭐ {doctor.rating.average.toFixed(1)} ({doctor.rating.count})</p>
          </div>
        )}
      </div>

      {doctor.qualifications?.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {doctor.qualifications.map((q) => (
            <span key={q} className="badge-blue">{q}</span>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [filters, setFilters] = useState({ specialization: "", city: "", available: "" });
  const [symptomInput, setSymptomInput] = useState("");
  const [recommended, setRecommended] = useState(null);
  const [recLoading, setRecLoading] = useState(false);

  const fetchDoctors = (p = 1, f = filters) => {
    setLoading(true);
    const params = new URLSearchParams({ page: p, limit: 9 });
    if (f.specialization) params.set("specialization", f.specialization);
    if (f.city) params.set("city", f.city);
    if (f.available) params.set("available", f.available);

    api.get(`/doctor?${params}`)
      .then(({ data }) => {
        setDoctors(data.doctors || []);
        setPagination(data.pagination);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDoctors();
    api.get("/doctor/specializations").then(({ data }) => setSpecializations(data));
  }, []);

  const applyFilters = () => {
    setPage(1);
    setRecommended(null);
    fetchDoctors(1, filters);
  };

  const getRecommendation = async () => {
    if (!symptomInput.trim()) return;
    setRecLoading(true);
    try {
      const { data } = await api.post("/doctor/recommend", { symptoms: symptomInput });
      setRecommended(data);
    } catch {
      alert("Could not get recommendation. Please try again.");
    } finally {
      setRecLoading(false);
    }
  };

  const seedDoctors = () => {
    api.post("/doctor/seed").then(() => fetchDoctors());
  };

  return (
    <div className="space-y-5">
      {/* AI Recommendation */}
      <div className="card bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-100 dark:border-blue-800">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">🤖 Get AI Doctor Recommendation</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Describe your symptoms and we'll recommend the right specialist.</p>
        <div className="flex gap-2">
          <input
            className="input-field flex-1"
            placeholder="e.g. chest pain, shortness of breath"
            value={symptomInput}
            onChange={(e) => setSymptomInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && getRecommendation()}
          />
          <button className="btn-primary" onClick={getRecommendation} disabled={recLoading}>
            {recLoading ? "..." : "Recommend"}
          </button>
        </div>
        {recommended && (
          <div className="mt-3 p-3 bg-white dark:bg-gray-700 rounded-lg border border-blue-200 dark:border-blue-700">
            <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
              Recommended: <strong>{recommended.recommended?.specialization}</strong>
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{recommended.recommended?.reason}</p>
            {recommended.doctors?.length > 0 && (
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                {recommended.doctors.length} matching doctor(s) found below.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <select
            className="input-field"
            value={filters.specialization}
            onChange={(e) => setFilters((f) => ({ ...f, specialization: e.target.value }))}
          >
            <option value="">All Specializations</option>
            {specializations.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <input
            className="input-field"
            placeholder="Filter by city"
            value={filters.city}
            onChange={(e) => setFilters((f) => ({ ...f, city: e.target.value }))}
          />
          <div className="flex gap-2">
            <select
              className="input-field flex-1"
              value={filters.available}
              onChange={(e) => setFilters((f) => ({ ...f, available: e.target.value }))}
            >
              <option value="">Any availability</option>
              <option value="true">Available only</option>
            </select>
            <button className="btn-primary px-5" onClick={applyFilters}>Filter</button>
          </div>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : doctors.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-400 dark:text-gray-500 mb-4">No doctors found.</p>
          <button className="btn-secondary" onClick={seedDoctors}>Load Sample Doctors</button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {doctors.map((d) => <DoctorCard key={d._id} doctor={d} />)}
          </div>
          {pagination && pagination.pages > 1 && (
            <div className="flex justify-center gap-2">
              <button
                className="btn-secondary px-4"
                disabled={page === 1}
                onClick={() => { setPage(page - 1); fetchDoctors(page - 1); }}
              >
                ← Prev
              </button>
              <span className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                Page {pagination.page} of {pagination.pages}
              </span>
              <button
                className="btn-secondary px-4"
                disabled={page === pagination.pages}
                onClick={() => { setPage(page + 1); fetchDoctors(page + 1); }}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
