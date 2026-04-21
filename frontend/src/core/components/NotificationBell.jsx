import React, { useState, useEffect, useRef, useCallback } from "react";
import { Bell, CheckCheck, CalendarOff, ClipboardList, UserCheck } from "lucide-react";
import { useAuth } from "@/core/context/AuthContext";
import { getLeaveApplications, getProxyAssignments } from "@/modules/leave/services/leaveFirebaseService";
import { getAllAssignmentsWithTasks } from "@/modules/tasks/services/tasksFirebaseService";
import { useNavigate } from "react-router-dom";

function useNotifications() {
  const { role, teacherId, canApproveLeave, canApproveProxy, canAssignProxy } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!role) return;
    const next = [];
    try {
      if (canApproveLeave || canAssignProxy || canApproveProxy) {
        const leaves = await getLeaveApplications();
        const proxies = await getProxyAssignments();

        if (canApproveLeave) {
          const pending = leaves.filter((l) => l.status === "pending");
          if (pending.length) {
            next.push({
              id: "leaves-pending",
              icon: CalendarOff,
              color: "text-amber-500",
              label: `${pending.length} leave${pending.length > 1 ? "s" : ""} awaiting approval`,
              path: "/leave",
            });
          }
        }

        if (canAssignProxy) {
          const assignedLeaveIds = new Set(proxies.map((p) => p.leaveApplicationId).filter(Boolean));
          const needsProxy = leaves.filter(
            (l) => l.status === "approved" && !assignedLeaveIds.has(l.id)
          );
          if (needsProxy.length) {
            next.push({
              id: "proxy-needed",
              icon: UserCheck,
              color: "text-blue-500",
              label: `${needsProxy.length} approved leave${needsProxy.length > 1 ? "s" : ""} need proxy`,
              path: "/leave",
            });
          }
        }

        if (canApproveProxy) {
          const pendingProxies = proxies.filter((p) => p.status === "pending");
          if (pendingProxies.length) {
            next.push({
              id: "proxies-pending",
              icon: UserCheck,
              color: "text-purple-500",
              label: `${pendingProxies.length} proxy assignment${pendingProxies.length > 1 ? "s" : ""} to approve`,
              path: "/leave",
            });
          }
        }
      }

      const assignments = await getAllAssignmentsWithTasks();
      const now = new Date();
      if (role === "teacher" && teacherId) {
        const myOverdue = assignments.filter(
          (a) =>
            a.assignedTo === teacherId &&
            a.status !== "completed" &&
            a.dueDate &&
            new Date(a.dueDate) < now
        );
        if (myOverdue.length) {
          next.push({
            id: "tasks-overdue-mine",
            icon: ClipboardList,
            color: "text-red-500",
            label: `${myOverdue.length} overdue task${myOverdue.length > 1 ? "s" : ""} assigned to you`,
            path: "/tasks",
          });
        }
      } else {
        const overdue = assignments.filter(
          (a) =>
            a.status !== "completed" &&
            a.dueDate &&
            new Date(a.dueDate) < now
        );
        if (overdue.length) {
          next.push({
            id: "tasks-overdue",
            icon: ClipboardList,
            color: "text-red-500",
            label: `${overdue.length} overdue task${overdue.length > 1 ? "s" : ""}`,
            path: "/tasks",
          });
        }
      }
    } catch {
      // silently ignore network errors
    }
    setItems(next);
    setLoading(false);
  }, [role, teacherId, canApproveLeave, canApproveProxy, canAssignProxy]);

  useEffect(() => {
    load();
    const timer = setInterval(load, 60_000);
    return () => clearInterval(timer);
  }, [load]);

  return { items, loading, refresh: load };
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const { items, loading } = useNotifications();
  const ref = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const count = items.length;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="relative w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
        aria-label="Notifications"
      >
        <Bell size={18} className="text-gray-500" />
        {count > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl border border-gray-200 shadow-lg z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-800">Notifications</span>
            {count > 0 && (
              <span className="text-xs bg-red-100 text-red-600 rounded-full px-2 py-0.5 font-medium">
                {count}
              </span>
            )}
          </div>

          <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
            {loading ? (
              <div className="px-4 py-6 text-center text-sm text-gray-400">Loading…</div>
            ) : count === 0 ? (
              <div className="px-4 py-8 flex flex-col items-center gap-2 text-gray-400">
                <CheckCheck size={24} />
                <span className="text-sm">All caught up!</span>
              </div>
            ) : (
              items.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      navigate(item.path);
                    }}
                    className="w-full flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                  >
                    <Icon size={16} className={`mt-0.5 shrink-0 ${item.color}`} />
                    <span className="text-sm text-gray-700">{item.label}</span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
