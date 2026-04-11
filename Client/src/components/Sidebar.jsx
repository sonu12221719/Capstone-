import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const nav = [
  { to: "/dashboard", label: "Dashboard",     icon: "🏠" },
  { to: "/chat",      label: "AI Chat",        icon: "🤖" },
  { to: "/health",    label: "Health Records", icon: "📋" },
  { to: "/doctors",   label: "Doctors",        icon: "👨‍⚕️" },
  { to: "/pharmacy",  label: "Pharmacy",       icon: "💊" },
  { to: "/reminders", label: "Reminders",      icon: "🔔" },
  { to: "/reports",   label: "Reports",        icon: "📄" },
  { to: "/profile",   label: "Profile",        icon: "👤" },
];

function SunIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="5" />
      <path strokeLinecap="round" d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
    </svg>
  );
}

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const { dark, toggle } = useTheme();

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 bg-black/40 z-20 lg:hidden" onClick={onClose} />
      )}

      <aside className={`
        fixed top-0 left-0 h-full w-64
        bg-white dark:bg-gray-900
        border-r border-gray-200 dark:border-gray-700
        z-30 flex flex-col transition-transform duration-300
        ${open ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0 lg:static lg:z-auto
      `}>
        {/* Logo */}
        <div className="flex items-center gap-2 px-5 py-5 border-b border-gray-100 dark:border-gray-700">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0">
            H
          </div>
          <span className="font-bold text-gray-900 dark:text-white text-lg">HealthAI</span>
        </div>

        {/* User chip */}
        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold shrink-0">
              {user?.name?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {nav.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                }`
              }
            >
              <span className="text-base">{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Bottom: theme toggle + logout */}
        <div className="px-3 py-4 border-t border-gray-100 dark:border-gray-700 space-y-1">
          {/* Dark / Light toggle */}
          <button
            onClick={toggle}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium
                       text-gray-600 dark:text-gray-300
                       hover:bg-gray-100 dark:hover:bg-gray-800
                       transition-colors duration-150"
          >
            <span className="flex items-center gap-3">
              {dark ? <MoonIcon /> : <SunIcon />}
              {dark ? "Dark Mode" : "Light Mode"}
            </span>
            {/* Toggle pill */}
            <span className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 ${dark ? "bg-blue-600" : "bg-gray-300"}`}>
              <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform duration-200 ${dark ? "translate-x-4" : "translate-x-1"}`} />
            </span>
          </button>

          {/* Logout */}
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                       text-red-600 dark:text-red-400
                       hover:bg-red-50 dark:hover:bg-red-900/20
                       transition-colors duration-150"
          >
            <span>🚪</span> Logout
          </button>
        </div>
      </aside>
    </>
  );
}
