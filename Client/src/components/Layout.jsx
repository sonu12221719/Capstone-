import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Menu } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import Sidebar from "./Sidebar";
import ReminderNotifier from "./ReminderNotifier";

const pageTitles = {
  "/dashboard": "Dashboard",
  "/chat":      "AI Health Chat",
  "/health":    "Health Records",
  "/doctors":   "Find Doctors",
  "/pharmacy":  "Nearby Pharmacy",
  "/reminders": "Reminders",
  "/reports":   "Prescription Reports",
  "/profile":   "My Profile",
};

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { dark } = useTheme();
  const title = pageTitles[location.pathname] || "HealthAI";

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: dark ? "#040d10" : "#f0f9f7" }}
    >
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <ReminderNotifier />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header
          className="px-4 py-3 flex items-center gap-4 shrink-0"
          style={{
            background: dark
              ? "rgba(6,15,19,.88)"
              : "rgba(255,255,255,.88)",
            backdropFilter: "blur(12px)",
            borderBottom: dark ? "1px solid #0f2a35" : "1px solid #b8e4de",
          }}
        >
          <button
            className="lg:hidden p-2 rounded-xl transition-colors"
            style={{
              color: dark ? "#7ab5c0" : "#3a7a85",
              background: "transparent",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = dark ? "#0a2530" : "#f0f9f7"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1
            className="text-lg font-bold tracking-tight"
            style={{ color: dark ? "#e0f5f8" : "#0a3340" }}
          >
            {title}
          </h1>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
