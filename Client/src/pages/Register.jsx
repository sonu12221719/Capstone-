import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { HeartPulse, User, Mail, Lock, ChevronRight, ChevronLeft, Check } from "lucide-react";

const CHRONIC  = ["Diabetes","Hypertension","Asthma","Heart Disease","Arthritis","Thyroid","COPD","Kidney Disease"];
const ALLERGIES = ["Penicillin","Aspirin","Sulfa drugs","Pollen","Dust","Nuts","Latex","Ibuprofen"];

const inputStyle = {
  background: "#051218", borderColor: "#164555", color: "#e0f5f8",
};

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
      className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-150"
      style={
        active
          ? { background: "linear-gradient(135deg,#0a6e8a,#0a5f7a)", color: "#fff", border: "1px solid transparent", boxShadow: "0 2px 8px rgba(10,110,138,.4)" }
          : { background: "#051218", color: "#4a8a95", border: "1px solid #164555" }
      }
    >
      {active && <Check className="inline w-3 h-3 mr-1" />}{label}
    </button>
  );

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4"
      style={{ background: "linear-gradient(135deg,#020c0f 0%,#040d10 40%,#051218 100%)" }}
    >
      {/* Glow orbs */}
      <div className="absolute pointer-events-none"
        style={{ top: "-15%", left: "-10%", width: 600, height: 600, borderRadius: "50%",
          background: "radial-gradient(circle,rgba(10,110,138,.35) 0%,transparent 70%)", filter: "blur(60px)" }}
      />
      <div className="absolute pointer-events-none"
        style={{ bottom: "-15%", right: "-10%", width: 500, height: 500, borderRadius: "50%",
          background: "radial-gradient(circle,rgba(41,168,156,.22) 0%,transparent 70%)", filter: "blur(60px)" }}
      />

      <div className="w-full max-w-lg relative z-10">

        {/* Logo */}
        <div className="text-center mb-7">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{ background: "linear-gradient(135deg,#0a6e8a,#0a5f7a)",
              boxShadow: "0 8px 32px rgba(10,110,138,.55), 0 0 0 1px rgba(255,255,255,.1)" }}
          >
            <HeartPulse className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-1">Join HealthAI</h1>
          <p className="text-sm" style={{ color: "#7ab5c0" }}>Create your health profile</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-3 mb-6">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300"
                style={
                  s < step
                    ? { background: "linear-gradient(135deg,#0a6e8a,#0a5f7a)", color: "#fff", boxShadow: "0 4px 12px rgba(10,110,138,.4)" }
                    : s === step
                    ? { background: "linear-gradient(135deg,#0d8aaa,#0a6e8a)", color: "#fff", boxShadow: "0 4px 16px rgba(10,110,138,.5)" }
                    : { background: "#071a20", color: "#2e6070", border: "1px solid #164555" }
                }
              >
                {s < step ? <Check className="w-4 h-4" /> : s}
              </div>
              {s < 2 && (
                <div className="w-14 h-0.5 rounded transition-all duration-300"
                  style={{ background: step >= 2 ? "linear-gradient(90deg,#0a6e8a,#29a89c)" : "#071a20" }}
                />
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="rounded-2xl p-7"
          style={{ background: "rgba(4,18,24,.78)", border: "1px solid #164555",
            backdropFilter: "blur(20px)", boxShadow: "0 24px 64px rgba(0,0,0,.65), inset 0 1px 0 rgba(41,168,156,.12)" }}
        >
          {error && (
            <div className="mb-5 p-3.5 rounded-xl text-sm"
              style={{ background: "rgba(244,63,94,.12)", border: "1px solid rgba(244,63,94,.3)", color: "#fb7185" }}
            >
              {error}
            </div>
          )}

          {/* ── Step 1 ── */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white mb-4">Basic Information</h2>

              <div>
                <label className="block text-xs font-semibold mb-1.5 uppercase tracking-widest" style={{ color: "#4a8a95" }}>Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#4a8a95" }} />
                  <input className="input-field pl-10" placeholder="John Doe"
                    value={form.name} onChange={(e) => set("name", e.target.value)} required style={inputStyle} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1.5 uppercase tracking-widest" style={{ color: "#4a8a95" }}>Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#4a8a95" }} />
                  <input type="email" className="input-field pl-10" placeholder="you@example.com"
                    value={form.email} onChange={(e) => set("email", e.target.value)} required style={inputStyle} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1.5 uppercase tracking-widest" style={{ color: "#4a8a95" }}>Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#4a8a95" }} />
                  <input type="password" className="input-field pl-10" placeholder="Min. 8 characters"
                    value={form.password} onChange={(e) => set("password", e.target.value)} required style={inputStyle} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1.5 uppercase tracking-widest" style={{ color: "#4a8a95" }}>Age</label>
                  <input type="number" min="13" max="120" className="input-field" placeholder="Age"
                    value={form.age} onChange={(e) => set("age", e.target.value)} required style={inputStyle} />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5 uppercase tracking-widest" style={{ color: "#4a8a95" }}>Gender</label>
                  <select className="input-field" value={form.gender} onChange={(e) => set("gender", e.target.value)} required style={inputStyle}>
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <button type="button" className="btn-primary w-full py-3 mt-1 text-sm"
                onClick={() => {
                  if (!form.name || !form.email || !form.password || !form.age || !form.gender) {
                    setError("Please fill in all fields."); return;
                  }
                  setError(""); setStep(2);
                }}
              >
                Continue <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* ── Step 2 ── */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-white">Medical Profile</h2>
                <p className="text-sm mt-1" style={{ color: "#4a8a95" }}>
                  Helps our AI give you personalised insights.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-2 uppercase tracking-widest" style={{ color: "#4a8a95" }}>Known Allergies</label>
                <div className="flex flex-wrap gap-2">
                  {ALLERGIES.map((a) => <Chip key={a} label={a} field="allergies" active={form.allergies.includes(a)} />)}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-2 uppercase tracking-widest" style={{ color: "#4a8a95" }}>Chronic Conditions</label>
                <div className="flex flex-wrap gap-2">
                  {CHRONIC.map((c) => <Chip key={c} label={c} field="chronicConditions" active={form.chronicConditions.includes(c)} />)}
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                <button type="button" className="btn-secondary flex-1 py-3 text-sm"
                  onClick={() => setStep(1)}>
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
                <button type="submit" className="btn-primary flex-1 py-3 text-sm" disabled={loading}>
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating…
                    </span>
                  ) : "Create Account"}
                </button>
              </div>
            </form>
          )}

          <p className="mt-6 text-center text-sm" style={{ color: "#4a8a95" }}>
            Already have an account?{" "}
            <Link to="/login" className="font-semibold hover:underline" style={{ color: "#29a89c" }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
