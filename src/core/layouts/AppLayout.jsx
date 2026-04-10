import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Building2,
  BookOpen,
  Users,
  GraduationCap,
  LayoutGrid,
  BookMarked,
  FileText,
  CalendarDays,
  Settings,
  Languages,
} from "lucide-react";

const navSections = [
  {
    label: "ORGANIZATION",
    items: [
      { label: "Organization", icon: Building2, path: "/organization" },
    ],
  },
  {
    label: "MANAGEMENT",
    items: [
      { label: "Classes", icon: BookOpen, path: "/class-time" },
      { label: "Teachers", icon: Users, path: "/teachers" },
      { label: "Subjects", icon: GraduationCap, path: "/subjects" },
      { label: "Rooms", icon: LayoutGrid, active: false },
      { label: "Lessons", icon: BookMarked, active: false },
      { label: "Templates", icon: FileText, active: false },
      { label: "Timetables", icon: CalendarDays, path: "/" },
    ],
  },
];

export default function AppLayout({ children }) {
  const location = useLocation();

  return (
    <div>
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-[260px] bg-white border-r border-gray-200 flex flex-col justify-between z-30">
        <div>
          <div className="pt-6 pl-5 pb-8">
            <span className="font-bold text-xl">School Timetable</span>
          </div>
          <nav className="flex flex-col gap-6">
            {navSections.map((section) => (
              <div key={section.label}>
                <div className="px-5 mb-2 text-xs text-gray-400 tracking-widest font-semibold uppercase">
                  {section.label}
                </div>
                <div className="flex flex-col gap-1">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = item.path
                      ? location.pathname === item.path
                      : false;
                    const baseClass =
                      "flex items-center gap-3 rounded-lg px-3 py-2 w-full";
                    const activeClass =
                      "bg-gray-100 font-medium text-gray-900";
                    const inactiveClass =
                      "text-sm text-gray-700 hover:bg-gray-50 cursor-pointer";
                    return (
                      item.path ? (
                        <NavLink
                          key={item.label}
                          to={item.path}
                          className={`${baseClass} ${
                            isActive ? activeClass : inactiveClass
                          }`}
                        >
                          <Icon size={18} className="text-gray-500" />
                          <span className="text-sm">{item.label}</span>
                        </NavLink>
                      ) : (
                        <div
                          key={item.label}
                          className={`${baseClass} text-sm text-gray-400 cursor-not-allowed`}
                        >
                          <Icon size={18} className="text-gray-300" />
                          <span className="text-sm">{item.label}</span>
                        </div>
                      )
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>
        {/* Settings pinned to bottom */}
        <div className="mb-6 px-3">
          <div className="flex items-center gap-3 px-3 py-2 w-full text-sm text-gray-700 hover:bg-gray-50 rounded-lg cursor-pointer">
            <Settings size={18} className="text-gray-500" />
            <span className="text-sm">Settings</span>
          </div>
        </div>
      </aside>

      {/* Top bar */}
      <header className="fixed left-[260px] top-0 right-0 h-[56px] bg-white border-b border-gray-200 flex items-center justify-between px-6 z-20">
        <div></div>
        <div className="flex items-center gap-6">
          <Languages size={20} className="text-gray-500" />
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-orange-500 flex items-center justify-center text-white font-semibold text-base" style={{fontSize: 18}}>
              TE
            </div>
            <span className="text-gray-900 font-medium">test</span>
          </div>
        </div>
      </header>

      {/* Main content area */}
      <main className="ml-[260px] mt-[56px] bg-gray-50 min-h-screen p-8">
        {children}
      </main>
    </div>
  );
}
