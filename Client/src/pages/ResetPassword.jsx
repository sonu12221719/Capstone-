import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api/client";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const passwordsMatch = form.password === form.confirm;
  const strongEnough = form.password.length >= 8;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!passwordsMatch) { setError("Passwords do not match."); return; }
    if (!strongEnough) { setError("Password must be at least 8 characters."); return; }

    setError("");
    setLoading(true);
    try {
      await api.post(`/auth/reset-password/${token}`, { password: form.password });
      setDone(true);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Reset failed. The link may have expired.");
    } finally {
      setLoading(false);
    }
  };

  const getStrength = (pwd) => {
    if (!pwd) return { level: 0, label: "", color: "" };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    const map = [
      { label: "Too short", color: "bg-red-400" },
      { label: "Weak", color: "bg-red-400" },
      { label: "Fair", color: "bg-yellow-400" },
      { label: "Good", color: "bg-blue-400" },
      { label: "Strong", color: "bg-green-500" },
    ];
    return { level: score, ...map[score] };
  };
  const strength = getStrength(form.password);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 rounded-2xl shadow-lg mb-4">
            <span className="text-white text-2xl">🏥</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">HealthAI</h1>
        </div>

        <div className="card shadow-md">
          {done ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                ✅
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Password Reset!</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">Your password has been updated successfully.</p>
              <p className="text-gray-400 dark:text-gray-500 text-xs mb-6">Redirecting you to sign in...</p>
              <Link to="/login" className="btn-primary inline-block">Go to Sign In</Link>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Set a new password</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Choose a strong password for your account.</p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
                  <input
                    type="password"
                    className="input-field"
                    placeholder="Min. 8 characters"
                    value={form.password}
                    onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                    required
                    autoFocus
                    autoComplete="new-password"
                  />
                  {form.password && (
                    <div className="mt-2">
                      <div className="flex gap-1 mb-1">
                        {[1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            className={`flex-1 h-1.5 rounded-full transition-colors ${
                              i <= strength.level ? strength.color : "bg-gray-200 dark:bg-gray-600"
                            }`}
                          />
                        ))}
                      </div>
                      <p className={`text-xs ${
                        strength.level <= 1 ? "text-red-500" :
                        strength.level === 2 ? "text-yellow-600" :
                        strength.level === 3 ? "text-blue-600" : "text-green-600"
                      }`}>
                        {strength.label}
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm Password</label>
                  <input
                    type="password"
                    className="input-field"
                    placeholder="Re-enter your password"
                    value={form.confirm}
                    onChange={(e) => setForm((f) => ({ ...f, confirm: e.target.value }))}
                    required
                    autoComplete="new-password"
                  />
                  {form.confirm && !passwordsMatch && (
                    <p className="text-xs text-red-500 mt-1">Passwords do not match.</p>
                  )}
                  {form.confirm && passwordsMatch && form.password && (
                    <p className="text-xs text-green-600 mt-1">✓ Passwords match</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || !passwordsMatch || !strongEnough}
                  className="btn-primary w-full py-2.5"
                >
                  {loading ? "Resetting..." : "Reset Password"}
                </button>
              </form>

              <p className="mt-5 text-center text-sm text-gray-500 dark:text-gray-400">
                Link expired?{" "}
                <Link to="/forgot-password" className="text-blue-600 dark:text-blue-400 font-medium hover:underline">
                  Request a new one
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
