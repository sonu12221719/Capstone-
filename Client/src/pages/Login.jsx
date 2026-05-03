import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { HeartPulse, Mail, Lock, ArrowRight } from "lucide-react";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4"
      style={{ background: "linear-gradient(135deg,#020c0f 0%,#040d10 40%,#051218 100%)" }}
    >
      {/* ── Ambient glow orbs ─────────────────────────────────────────────── */}
      <div className="absolute pointer-events-none"
        style={{
          top: "-15%", left: "-10%",
          width: 600, height: 600,
          borderRadius: "50%",
          background: "radial-gradient(circle,rgba(10,110,138,.4) 0%,transparent 70%)",
          filter: "blur(60px)",
        }}
      />
      <div className="absolute pointer-events-none"
        style={{
          bottom: "-15%", right: "-10%",
          width: 500, height: 500,
          borderRadius: "50%",
          background: "radial-gradient(circle,rgba(41,168,156,.28) 0%,transparent 70%)",
          filter: "blur(60px)",
        }}
      />
      <div className="absolute pointer-events-none"
        style={{
          top: "40%", left: "55%",
          width: 400, height: 400,
          borderRadius: "50%",
          background: "radial-gradient(circle,rgba(12,205,214,.12) 0%,transparent 70%)",
          filter: "blur(80px)",
        }}
      />

      {/* ── Card ──────────────────────────────────────────────────────────── */}
      <div className="w-full max-w-md relative z-10">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-5 relative"
            style={{
              background: "linear-gradient(135deg,#0a6e8a,#0a5f7a)",
              boxShadow: "0 8px 32px rgba(10,110,138,.6), 0 0 0 1px rgba(255,255,255,.1)",
            }}
          >
            <HeartPulse className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-1">HealthAI</h1>
          <p style={{ color: "#7ab5c0" }} className="text-sm">Your intelligent health companion</p>
        </div>

        {/* Form card */}
        <div className="rounded-2xl p-7"
          style={{
            background: "rgba(4,18,24,.78)",
            border: "1px solid #164555",
            backdropFilter: "blur(20px)",
            boxShadow: "0 24px 64px rgba(0,0,0,.7), inset 0 1px 0 rgba(41,168,156,.15)",
          }}
        >
          <h2 className="text-xl font-bold text-white mb-6">Welcome back</h2>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl text-sm flex items-start gap-2"
              style={{ background: "rgba(244,63,94,.12)", border: "1px solid rgba(244,63,94,.3)", color: "#fb7185" }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold mb-1.5 uppercase tracking-widest"
                style={{ color: "#4a8a95" }}>Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4"
                  style={{ color: "#4a8a95" }} />
                <input
                  type="email" name="email"
                  value={form.email} onChange={handleChange}
                  className="input-field pl-10"
                  placeholder="you@example.com"
                  required autoComplete="email"
                  style={{ background: "#051218", borderColor: "#164555", color: "#e0f5f8" }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-widest"
                  style={{ color: "#4a8a95" }}>Password</label>
                <Link to="/forgot-password"
                  className="text-xs font-medium hover:underline"
                  style={{ color: "#29a89c" }}>
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4"
                  style={{ color: "#4a8a95" }} />
                <input
                  type="password" name="password"
                  value={form.password} onChange={handleChange}
                  className="input-field pl-10"
                  placeholder="••••••••"
                  required autoComplete="current-password"
                  style={{ background: "#051218", borderColor: "#164555", color: "#e0f5f8" }}
                />
              </div>
            </div>

            <button
              type="submit" disabled={loading}
              className="btn-primary w-full py-3 mt-2 text-sm"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in…
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Sign In <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm" style={{ color: "#4a8a95" }}>
              Don&apos;t have an account?{" "}
              <Link to="/register" className="font-semibold hover:underline"
                style={{ color: "#29a89c" }}>
                Create one
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: "#1e5a6a" }}>
          AI guidance only — always consult a qualified medical professional.
        </p>
      </div>
    </div>
  );
}
