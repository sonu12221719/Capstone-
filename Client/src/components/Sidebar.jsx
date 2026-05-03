import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import {
  LayoutDashboard, Bot, ClipboardList, Stethoscope,
  Pill, Bell, FileText, User, LogOut, Sun, Moon, Activity,
} from "lucide-react";

const nav = [
  { to: "/dashboard", label: "Dashboard",     Icon: LayoutDashboard },
  { to: "/chat",      label: "AI Chat",        Icon: Bot },
  { to: "/health",    label: "Health Records", Icon: ClipboardList },
  { to: "/doctors",   label: "Doctors",        Icon: Stethoscope },
  { to: "/pharmacy",  label: "Pharmacy",       Icon: Pill },
  { to: "/reminders", label: "Reminders",      Icon: Bell },
  { to: "/reports",   label: "Reports",        Icon: FileText },
  { to: "/profile",   label: "Profile",        Icon: User },
];

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const { dark, toggle } = useTheme();

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-20 lg:hidden"
          style={{ background: "rgba(2,12,15,.75)", backdropFilter: "blur(4px)" }}
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full w-64 z-30 flex flex-col
          transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:static lg:z-auto
        `}
        style={{
          background: dark ? "#060f13" : "#ffffff",
          borderRight: dark ? "1px solid #0f2a35" : "1px solid #b8e4de",
        }}
      >
        {/* ── Logo ──────────────────────────────────────────────────────── */}
        <div
          className="flex items-center gap-3 px-5 py-[18px]"
          style={{ borderBottom: dark ? "1px solid #0f2a35" : "1px solid #b8e4de" }}
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{
              background: "linear-gradient(135deg,#0a6e8a,#0a5f7a)",
              boxShadow: "0 4px 14px rgba(10,110,138,.45)",
            }}
          >
            <Activity className="w-5 h-5 text-white" />
          </div>
          <span
            className="font-bold text-lg tracking-tight"
            style={{ color: dark ? "#e0f5f8" : "#0a3340" }}
          >
            HealthAI
          </span>
        </div>

        {/* ── User chip ─────────────────────────────────────────────────── */}
        <div
          className="px-4 py-3"
          style={{ borderBottom: dark ? "1px solid #0f2a35" : "1px solid #b8e4de" }}
        >
          <div
            className="flex items-center gap-3 rounded-xl px-3 py-2.5"
            style={{
              background: dark ? "#0a2530" : "#f0f9f7",
              border: dark ? "1px solid #164555" : "1px solid #b8e4de",
            }}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
              style={{ background: "linear-gradient(135deg,#0d8aaa,#0a5f7a)" }}
            >
              {user?.name?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="overflow-hidden">
              <p
                className="text-sm font-semibold truncate"
                style={{ color: dark ? "#e0f5f8" : "#0a3340" }}
              >
                {user?.name}
              </p>
              <p
                className="text-xs truncate"
                style={{ color: dark ? "#4a8a95" : "#5a9aa5" }}
              >
                {user?.email}
              </p>
            </div>
          </div>
        </div>

        {/* ── Nav links ─────────────────────────────────────────────────── */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {nav.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) => isActive ? "nav-active" : "nav-idle"}
              style={({ isActive }) =>
                isActive
                  ? {
                      display: "flex", alignItems: "center", gap: "12px",
                      padding: "10px 12px", borderRadius: "12px",
                      fontSize: "14px", fontWeight: 600, color: "#ffffff",
                      background: "linear-gradient(135deg,#0a6e8a,#0a5f7a)",
                      boxShadow: "0 4px 16px rgba(10,110,138,.4)",
                      textDecoration: "none",
                    }
                  : {
                      display: "flex", alignItems: "center", gap: "12px",
                      padding: "10px 12px", borderRadius: "12px",
                      fontSize: "14px", fontWeight: 500, textDecoration: "none",
                      color: dark ? "#7ab5c0" : "#3a7a85",
                      transition: "all .15s ease",
                    }
              }
              onMouseEnter={(e) => {
                if (!e.currentTarget.className.includes("nav-active")) {
                  e.currentTarget.style.background = dark ? "#0a2530" : "#f0f9f7";
                  e.currentTarget.style.color = dark ? "#4abdc6" : "#0a6e8a";
                }
              }}
              onMouseLeave={(e) => {
                if (!e.currentTarget.className.includes("nav-active")) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = dark ? "#7ab5c0" : "#3a7a85";
                }
              }}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* ── Bottom bar ────────────────────────────────────────────────── */}
        <div
          className="px-3 py-4 space-y-1"
          style={{ borderTop: dark ? "1px solid #0f2a35" : "1px solid #b8e4de" }}
        >
          {/* Theme toggle */}
          <button
            onClick={toggle}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150"
            style={{ color: dark ? "#7ab5c0" : "#3a7a85" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = dark ? "#0a2530" : "#f0f9f7";
              e.currentTarget.style.color = dark ? "#4abdc6" : "#0a6e8a";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = dark ? "#7ab5c0" : "#3a7a85";
            }}
          >
            <span className="flex items-center gap-3">
              {dark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              {dark ? "Dark Mode" : "Light Mode"}
            </span>
            <span
              className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200"
              style={{ background: dark ? "#0a6e8a" : "#d1d5db" }}
            >
              <span
                className="inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform duration-200"
                style={{ transform: dark ? "translateX(18px)" : "translateX(4px)" }}
              />
            </span>
          </button>

          {/* Logout */}
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150"
            style={{ color: "#e11d48" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = dark ? "rgba(225,29,72,.1)" : "#fff1f2";
            }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
          >
            <LogOut className="w-4 h-4 shrink-0" /> Logout
          </button>
        </div>
      </aside>
    </>
  );
}
