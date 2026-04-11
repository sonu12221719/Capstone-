import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email });
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 rounded-2xl shadow-lg mb-4">
            <span className="text-white text-2xl">🏥</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">HealthAI</h1>
        </div>

        <div className="card shadow-md">
          {sent ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                📧
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Check your inbox</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">
                We sent a password reset link to <strong>{email}</strong>.
              </p>
              <p className="text-gray-400 dark:text-gray-500 text-xs mb-6">
                The link expires in 15 minutes. Check your spam folder if you don't see it.
              </p>
              <button
                className="btn-secondary w-full mb-3"
                onClick={() => { setSent(false); setEmail(""); }}
              >
                Try a different email
              </button>
              <Link to="/login" className="text-blue-600 dark:text-blue-400 text-sm hover:underline">
                Back to Sign In
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Forgot your password?</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                  Enter your email and we'll send you a reset link.
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email address
                  </label>
                  <input
                    type="email"
                    className="input-field"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                    autoComplete="email"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full py-2.5"
                >
                  {loading ? "Sending link..." : "Send Reset Link"}
                </button>
              </form>

              <p className="mt-5 text-center text-sm text-gray-600 dark:text-gray-400">
                Remember your password?{" "}
                <Link to="/login" className="text-blue-600 dark:text-blue-400 font-medium hover:underline">
                  Sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
