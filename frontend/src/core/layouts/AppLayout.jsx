import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  BookOpen,
  Users,
  GraduationCap,
  LayoutGrid,
  CalendarDays,
  ClipboardList,
  CalendarOff,
  BarChart3,
  ChevronRight,
  LogOut,
  UserCircle,
} from "lucide-react";
import { authService } from "@/core/services/authService";
import { useAuth } from "@/core/context/AuthContext";

const navSections = [
  {
    label: "OVERVIEW",
    items: [
      { label: "Dashboard", icon: LayoutDashboard, path: "/" },
    ],
  },
  {
    label: "TIMETABLE",
    items: [
      { label: "Organization", icon: Building2, path: "/organization" },
      { label: "Classes", icon: BookOpen, path: "/class-time" },
      { label: "Teachers", icon: Users, path: "/teachers" },
      { label: "Subjects", icon: GraduationCap, path: "/subjects" },
      { label: "Rooms", icon: LayoutGrid, path: "/rooms" },
      { label: "Timetables", icon: CalendarDays, path: "/timetable" },
    ],
  },
  {
    label: "OPERATIONS",
    items: [
      { label: "Tasks", icon: ClipboardList, path: "/tasks" },
      { label: "Leave", icon: CalendarOff, path: "/leave" },
    ],
  },
  {
    label: "ANALYTICS",
    items: [
      { label: "Reports", icon: BarChart3, path: "/reports" },
    ],
  },
];

export default function AppLayout({ children }) {
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = React.useState(false);

  const displayName = user?.displayName || user?.email || "User";
  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleLogout = async () => {
    await authService.logout();
    setMenuOpen(false);
  };

  return (
    <div>
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-[240px] bg-white border-r border-gray-100 flex flex-col z-30">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
              <GraduationCap size={16} className="text-white" />
            </div>
            <div>
              <div className="font-bold text-gray-900 text-sm leading-tight">School ERP</div>
              <div className="text-xs text-gray-400">Management System</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-5">
          {navSections.map((section) => (
            <div key={section.label}>
              <div className="px-2 mb-1.5 text-[10px] text-gray-400 tracking-widest font-semibold uppercase">
                {section.label}
              </div>
              <div className="flex flex-col gap-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.label}
                      to={item.path}
                      end={item.path === "/"}
                      className={({ isActive }) =>
                        `flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors ${
                          isActive
                            ? "bg-emerald-50 text-emerald-700 font-medium"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <Icon size={16} className={isActive ? "text-emerald-600" : "text-gray-400"} />
                          <span>{item.label}</span>
                        </>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User footer */}
        <div className="border-t border-gray-100 px-3 py-3">
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center text-white font-semibold text-xs shrink-0">
                {initials}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <div className="text-sm font-medium text-gray-900 truncate">{displayName}</div>
              </div>
              <ChevronRight size={14} className="text-gray-400 shrink-0" />
            </button>
            {menuOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-1 rounded-lg border border-gray-200 bg-white shadow-lg overflow-hidden">
                <NavLink
                  to="/profile"
                  onClick={() => setMenuOpen(false)}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <UserCircle size={14} />
                  My Profile
                </NavLink>
                <div className="border-t border-gray-100" />
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut size={14} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Top bar */}
      <header className="fixed left-[240px] top-0 right-0 h-[56px] bg-white border-b border-gray-100 flex items-center px-6 z-20">
        <div className="flex-1">
          {/* breadcrumb could go here */}
        </div>
      </header>

      {/* Main content */}
      <main className="ml-[240px] mt-[56px] bg-gray-50 min-h-screen p-7">
        {children ?? <Outlet />}
      </main>
    </div>
  );
}
