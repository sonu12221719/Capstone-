import { useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/client";

const CHRONIC = ["Diabetes", "Hypertension", "Asthma", "Heart Disease", "Arthritis", "Thyroid", "COPD", "Kidney Disease"];
const ALLERGIES = ["Penicillin", "Aspirin", "Sulfa drugs", "Pollen", "Dust", "Nuts", "Latex", "Ibuprofen"];

function Chip({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
        active
          ? "bg-blue-600 text-white border-blue-600"
          : "bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500"
      }`}
    >
      {label}
    </button>
  );
}

export default function Profile() {
  const { user, updateUser } = useAuth();
  const fileRef = useRef(null);
  const [form, setForm] = useState({
    name: user?.name || "",
    age: user?.age || "",
    gender: user?.gender || "",
    allergies: user?.allergies || [],
    chronicConditions: user?.chronicConditions || [],
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  const toggleArray = (field, value) =>
    setForm((f) => ({
      ...f,
      [field]: f[field].includes(value)
        ? f[field].filter((v) => v !== value)
        : [...f[field], value],
    }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess(false);
    try {
      const { data } = await api.put("/auth/me", form);
      updateUser(data);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handlePhoto = async (file) => {
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("photo", file);
    try {
      const { data } = await api.post("/user/upload-photo", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      updateUser({ profilePic: data.profilePic });
    } catch {
      alert("Photo upload failed.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-5">
      {/* Profile picture */}
      <div className="card flex items-center gap-5">
        <div className="relative shrink-0">
          <div
            className="w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-3xl cursor-pointer overflow-hidden border-4 border-white dark:border-gray-700 shadow-md"
            onClick={() => fileRef.current?.click()}
          >
            {user?.profilePic ? (
              <img src={user.profilePic} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="text-blue-600 dark:text-blue-400 font-bold">
                {user?.name?.[0]?.toUpperCase() || "?"}
              </span>
            )}
          </div>
          <div
            className="absolute bottom-0 right-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs cursor-pointer shadow"
            onClick={() => fileRef.current?.click()}
          >
            ✏
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handlePhoto(e.target.files?.[0])}
          />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{user?.name}</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">{user?.email}</p>
          {uploading && <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Uploading photo...</p>}
        </div>
      </div>

      {/* Edit form */}
      <form onSubmit={handleSave} className="card space-y-5">
        <h3 className="font-semibold text-gray-900 dark:text-white">Personal Information</h3>

        {success && (
          <div className="p-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-400 text-sm">
            ✅ Profile updated successfully!
          </div>
        )}
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
          <input
            className="input-field"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
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
              value={form.age}
              onChange={(e) => setForm((f) => ({ ...f, age: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Gender</label>
            <select
              className="input-field"
              value={form.gender}
              onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value }))}
            >
              <option value="">Select</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Known Allergies</label>
          <div className="flex flex-wrap gap-2">
            {ALLERGIES.map((a) => (
              <Chip
                key={a}
                label={a}
                active={form.allergies.includes(a)}
                onClick={() => toggleArray("allergies", a)}
              />
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Chronic Conditions</label>
          <div className="flex flex-wrap gap-2">
            {CHRONIC.map((c) => (
              <Chip
                key={c}
                label={c}
                active={form.chronicConditions.includes(c)}
                onClick={() => toggleArray("chronicConditions", c)}
              />
            ))}
          </div>
        </div>

        <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>

      {/* Account info */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Account Information</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">Email</span>
            <span className="text-gray-900 dark:text-white">{user?.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">Member since</span>
            <span className="text-gray-900 dark:text-white">
              {user?.createdAt
                ? new Date(user.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" })
                : "—"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
