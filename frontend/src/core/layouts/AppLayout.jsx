import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
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
  Settings,
  MessageSquare,
  Megaphone,
  Mail,
  ClipboardCheck,
  Trophy,
  FileText,
} from "lucide-react";
import { useAuth } from "@/core/context/AuthContext";
import { useAcademicYear } from "@/core/context/AcademicYearContext";
import NotificationBell from "@/core/components/NotificationBell";
import { requestNotificationPermission } from "@/utils/firebaseNotifications";
import logo from "@/assets/logo.png";
import { messageService } from "@/modules/mailbox/services/messageService";


// roles: allowlist — omit to show to everyone
const navSections = [
  {
    label: "OVERVIEW",
    items: [
      { label: "Dashboard", icon: LayoutDashboard, path: "/" },
    ],
  },
  {
    label: "TIMETABLE SETUP",
    items: [
      { label: "Organization", icon: Building2,     path: "/organization", roles: ["admin"] },
      { label: "Classes",      icon: BookOpen,      path: "/class-time",   roles: ["admin", "coordinator"] },
      { label: "Teachers",     icon: Users,         path: "/teachers",     roles: ["admin", "coordinator"] },
      { label: "Subjects",     icon: GraduationCap, path: "/subjects",     roles: ["admin", "coordinator"] },
      { label: "Rooms",        icon: LayoutGrid,    path: "/rooms",        roles: ["admin", "coordinator"] },
    ],
  },
  {
    label: "TIMETABLE",
    items: [
      { label: "Timetables", icon: CalendarDays, path: "/timetable" },
    ],
  },
  {
    label: "OPERATIONS",
    items: [
      { label: "Tasks",      icon: ClipboardList,  path: "/tasks" },
      { label: "Leave",      icon: CalendarOff,    path: "/leave" },
      { label: "Circulars",  icon: Megaphone,      path: "/circulars", roles: ["admin", "principal"] },
      { label: "Mailbox",    icon: Mail,           path: "/mailbox",   roles: ["admin", "principal"] },
      { label: "Mailbox",    icon: Mail,           path: "/teacher/mailbox", roles: ["teacher"] },
      { label: "Attendance", icon: ClipboardCheck, path: "/attendance/mark", roles: ["admin", "principal", "teacher"] },
      { label: "Achievements", icon: Trophy,       path: "/achievements", roles: ["admin", "principal"] },
      { label: "Feedback",   icon: MessageSquare,  path: "/feedback",  roles: ["principal", "teacher"] },
    ],
  },
  {
    label: "ANALYTICS",
    items: [
      { label: "Reports", icon: BarChart3, path: "/reports", roles: ["admin", "principal", "coordinator"] },
    ],
  },
  {
    label: "SETTINGS",
    items: [
      { label: "Academic Years", icon: Settings, path: "/academic-years", roles: ["admin", "principal"] },
    ],
  },
];

export default function AppLayout({ children }) {
  const { userProfile, isTeacher, role, logout } = useAuth();
  const { activeYear, loading: yearLoading } = useAcademicYear();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [unreadMailCount, setUnreadMailCount] = React.useState(0);
  const navigate = useNavigate();

  React.useEffect(() => {
    // Poll for mailbox unread count
    if (role === 'teacher' || role === 'student') {
      const fetchCount = () => {
        messageService.getUnreadCount().then((res) => {
          setUnreadMailCount(res.unreadCount || 0);
        }).catch(() => {});
      };
      fetchCount();
      const interval = setInterval(fetchCount, 30000);
      return () => clearInterval(interval);
    }
  }, [role]);

  React.useEffect(() => {
    // Check and request permission for returning users
    if (userProfile) {
      requestNotificationPermission().catch(console.error);
    }
  }, [userProfile]);

  const displayName = userProfile?.fullName || userProfile?.name || userProfile?.email || "User";
  const initials = (displayName || "User")
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "U";

  const handleLogout = async () => {
    await logout();
    setMenuOpen(false);
    navigate("/login", { replace: true });
  };

  const roleBadge = role ? role.charAt(0).toUpperCase() + role.slice(1) : null;

  return (
    <div>
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-[240px] bg-white border-r border-gray-100 flex flex-col z-30">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden">
              <img src={logo} alt="Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="font-bold text-gray-900 text-[10px] leading-tight opacity-60">Welcome to</div>
              <div className="font-extrabold text-gray-900 text-sm leading-tight">Javiya Schooling System</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-5">
          {(role === 'student' ? [
            {
              label: "OVERVIEW",
              items: [
                { label: "Dashboard", icon: LayoutDashboard, path: "/" },
              ],
            },
            {
              label: "ACADEMICS",
              items: [
                { label: "Timetable", icon: CalendarDays, path: "/timetable" },
                { label: "Assignments", icon: ClipboardList, path: "/tasks" },
                { label: "Circulars", icon: Megaphone, path: "/student/circulars" },
                { label: "Mailbox", icon: Mail, path: "/student/mailbox" },
                { label: "Attendance", icon: ClipboardCheck, path: "/student/attendance" },
                { label: "Homework", icon: BookOpen, path: "/student/homework" },
                { label: "Achievements", icon: Trophy, path: "/student/achievements" },
                { label: "Syllabus", icon: FileText, path: "/student/syllabus" },
                { label: "Performance", icon: BarChart3, path: "/student/performance" },
                { label: "Leave", icon: CalendarOff, path: "/student/leave" },
              ],
            }
          ] : navSections).map((section) => {
            const visibleItems = section.items.filter(
              (item) => !item.roles || item.roles.includes(role)
            );
            if (visibleItems.length === 0) return null;
            return (
              <div key={section.label}>
                <div className="px-2 mb-1.5 text-[10px] text-gray-400 tracking-widest font-semibold uppercase">
                  {section.label}
                </div>
                <div className="flex flex-col gap-0.5">
                  {visibleItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.label}
                        to={item.path}
                        end={item.path === "/"}
                        className={({ isActive }) =>
                          `flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors ${
                            isActive
                              ? "bg-blue-50 text-blue-700 font-medium"
                              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                          }`
                        }
                      >
                        {({ isActive }) => (
                          <>
                            <Icon size={16} className={isActive ? "text-blue-600" : "text-gray-400"} />
                            <span className="flex-1 text-left">{item.label}</span>
                            {item.path.includes('mailbox') && unreadMailCount > 0 && (
                              <span className="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                                {unreadMailCount}
                              </span>
                            )}
                          </>
                        )}
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* User footer */}
        <div className="border-t border-gray-100 px-3 py-3">
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-xs shrink-0">
                {initials}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <div className="text-sm font-medium text-gray-900 truncate">{displayName}</div>
                {roleBadge && (
                  <div className="text-xs text-gray-400">{roleBadge}</div>
                )}
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
        <div className="flex-1 flex items-center gap-4">
          {activeYear ? (
            <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-100 rounded-full text-blue-700 text-xs font-semibold">
              <CalendarDays size={14} />
              Session: {activeYear.name}
            </div>
          ) : !yearLoading ? (
            <div className="text-xs text-red-500 font-medium">No active academic year</div>
          ) : null}
        </div>
        <NotificationBell />
      </header>

      {/* Main content */}
      <main className="ml-[240px] mt-[56px] bg-gray-50 min-h-screen p-7">
        {children ?? <Outlet />}
      </main>
    </div>
  );
}
