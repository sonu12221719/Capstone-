import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/client";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

// ── Google SVG icon ───────────────────────────────────────────────────────────
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <path fill="#4285F4" d="M47.532 24.552c0-1.636-.138-3.2-.395-4.704H24v9.01h13.228c-.578 3.046-2.3 5.628-4.9 7.36v6.1h7.928c4.644-4.278 7.276-10.576 7.276-17.766z"/>
      <path fill="#34A853" d="M24 48c6.636 0 12.202-2.198 16.268-5.96l-7.928-6.1c-2.198 1.474-5.01 2.34-8.34 2.34-6.42 0-11.856-4.336-13.8-10.162H2.04v6.292C6.088 42.614 14.436 48 24 48z"/>
      <path fill="#FBBC05" d="M10.2 28.118A14.9 14.9 0 0 1 9.36 24c0-1.428.246-2.814.84-4.118v-6.292H2.04A23.99 23.99 0 0 0 0 24c0 3.874.928 7.544 2.04 10.41l8.16-6.292z"/>
      <path fill="#EA4335" d="M24 9.54c3.618 0 6.864 1.244 9.424 3.68l7.07-7.07C36.196 2.198 30.63 0 24 0 14.436 0 6.088 5.386 2.04 13.59l8.16 6.292C12.144 13.876 17.58 9.54 24 9.54z"/>
    </svg>
  );
}

// ── Load Google Identity Services once ───────────────────────────────────────
function loadGIS() {
  return new Promise((resolve) => {
    if (window.google?.accounts?.id) { resolve(); return; }
    const s = document.createElement("script");
    s.src = "https://accounts.google.com/gsi/client";
    s.async = true;
    s.onload = resolve;
    document.head.appendChild(s);
  });
}

// ── Custom Google Sign-In button ──────────────────────────────────────────────
function GoogleSignIn({ onSuccess, onError }) {
  const [gisReady, setGisReady] = useState(false);
  const [signingIn, setSigningIn] = useState(false);
  const { login: authLogin } = useAuth();

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID === "your_google_client_id_here") return;

    loadGIS().then(() => {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async ({ credential }) => {
          try {
            const { data } = await api.post("/auth/google", { idToken: credential });
            localStorage.setItem("token", data.token);
            onSuccess(data.user);
          } catch (err) {
            onError(err.response?.data?.message || "Google sign-in failed.");
          } finally {
            setSigningIn(false);
          }
        },
      });
      setGisReady(true);
    });
  }, []);

  const handleClick = () => {
    if (!gisReady) return;
    setSigningIn(true);
    window.google.accounts.id.prompt((notification) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        // Fallback to redirect flow
        window.location.href = "/api/auth/google";
      }
    });
  };

  if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID === "your_google_client_id_here") {
    return (
      <p className="text-xs text-center text-gray-400 dark:text-gray-500">
        (Add VITE_GOOGLE_CLIENT_ID to Client/.env to enable Google Sign-In)
      </p>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!gisReady || signingIn}
      className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600
                 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-sm font-medium
                 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150
                 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
    >
      <GoogleIcon />
      {signingIn ? "Signing in…" : "Continue with Google"}
    </button>
  );
}

// ── Main login page ───────────────────────────────────────────────────────────
export default function Login() {
  const { login, updateUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchParams.get("error") === "oauth_failed") {
      setError("Google sign-in failed. Please try again or use email/password.");
    }
  }, [searchParams]);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = (user) => {
    updateUser(user);
    navigate("/dashboard");
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
          <p className="text-gray-500 dark:text-gray-400 mt-1">Your personal health assistant</p>
        </div>

        <div className="card shadow-md">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Sign in to your account</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Google Sign-In */}
          <div className="mb-5">
            <GoogleSignIn
              onSuccess={handleGoogleSuccess}
              onError={(msg) => setError(msg)}
            />
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
            <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">or continue with email</span>
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
          </div>

          {/* Email / password form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="input-field"
                placeholder="you@example.com"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                <Link to="/forgot-password" className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                className="input-field"
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-2.5 mt-1"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-gray-600 dark:text-gray-400">
            Don&apos;t have an account?{" "}
            <Link to="/register" className="text-blue-600 dark:text-blue-400 font-medium hover:underline">
              Create one
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-gray-400 dark:text-gray-600 mt-6">
          HealthAI provides AI-assisted health guidance. Always consult a qualified medical professional.
        </p>
      </div>
    </div>
  );
}
