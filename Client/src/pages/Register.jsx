import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const CHRONIC = ["Diabetes", "Hypertension", "Asthma", "Heart Disease", "Arthritis", "Thyroid", "COPD", "Kidney Disease"];
const ALLERGIES = ["Penicillin", "Aspirin", "Sulfa drugs", "Pollen", "Dust", "Nuts", "Latex", "Ibuprofen"];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: "", email: "", password: "", age: "", gender: "",
    allergies: [], chronicConditions: [],
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const toggleArray = (field, value) =>
    setForm((f) => ({
      ...f,
      [field]: f[field].includes(value)
        ? f[field].filter((v) => v !== value)
        : [...f[field], value],
    }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(form);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  const Chip = ({ label, field, active }) => (
    <button
      type="button"
      onClick={() => toggleArray(field, label)}
      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
        active
          ? "bg-blue-600 text-white border-blue-600"
          : "bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 rounded-2xl shadow-lg mb-4">
            <span className="text-white text-2xl">🏥</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">HealthAI</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Create your health profile</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-6 justify-center">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                  s <= step ? "bg-blue-600 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                }`}
              >
                {s}
              </div>
              {s < 2 && <div className={`w-12 h-0.5 ${step >= 2 ? "bg-blue-600" : "bg-gray-200 dark:bg-gray-700"}`} />}
            </div>
          ))}
        </div>

        <div className="card shadow-md">
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Basic Information</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                <input
                  className="input-field"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                <input
                  type="email"
                  className="input-field"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
                <input
                  type="password"
                  className="input-field"
                  placeholder="Min. 8 characters"
                  value={form.password}
                  onChange={(e) => set("password", e.target.value)}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Age</label>
                  <input
                    type="number"
                    min="13"
                    max="120"
                    className="input-field"
                    placeholder="Age"
                    value={form.age}
                    onChange={(e) => set("age", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Gender</label>
                  <select
                    className="input-field"
                    value={form.gender}
                    onChange={(e) => set("gender", e.target.value)}
                    required
                  >
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <button
                type="button"
                className="btn-primary w-full py-2.5"
                onClick={() => {
                  if (!form.name || !form.email || !form.password || !form.age || !form.gender) {
                    setError("Please fill in all fields.");
                    return;
                  }
                  setError("");
                  setStep(2);
                }}
              >
                Next →
              </button>
            </div>
          )}

          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Medical Profile</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 -mt-2">
                This helps our AI provide better, personalized health insights.
              </p>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Known Allergies</label>
                <div className="flex flex-wrap gap-2">
                  {ALLERGIES.map((a) => (
                    <Chip key={a} label={a} field="allergies" active={form.allergies.includes(a)} />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Chronic Conditions</label>
                <div className="flex flex-wrap gap-2">
                  {CHRONIC.map((c) => (
                    <Chip key={c} label={c} field="chronicConditions" active={form.chronicConditions.includes(c)} />
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button type="button" className="btn-secondary flex-1 py-2.5" onClick={() => setStep(1)}>
                  ← Back
                </button>
                <button type="submit" className="btn-primary flex-1 py-2.5" disabled={loading}>
                  {loading ? "Creating account..." : "Create Account"}
                </button>
              </div>
            </form>
          )}

          <p className="mt-5 text-center text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-600 dark:text-blue-400 font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
