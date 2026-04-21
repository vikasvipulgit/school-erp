import React, { useEffect, useState, useMemo } from 'react';
import {
  Users, BookOpen, ClipboardList, CalendarOff, AlertCircle,
  CheckCircle2, Clock, BookMarked, UserCheck, BarChart3,
  RefreshCw, ShieldCheck, CalendarDays,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/core/context/AuthContext';
import { getAllAssignmentsWithTasks, getAssignmentsForTeacher } from '@/modules/tasks/services/tasksFirebaseService';
import { getLeaveApplications, getLeaveApplicationsForTeacher, getProxyAssignments, approveLeave, approveProxy } from '@/modules/leave/services/leaveFirebaseService';
import teachersData from '@/data/teachers.json';
import classesData from '@/data/classes.json';
import { days, periods } from '@/modules/timetable/pages/TimetablePage';

// ─── Shared atoms ──────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, color, sub, onClick, alert }) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border p-5 flex items-start gap-4 transition-shadow
        ${onClick ? 'cursor-pointer hover:shadow-md' : ''}
        ${alert ? 'border-red-200 bg-red-50' : 'border-gray-200'}`}
    >
      <div className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
        <Icon size={20} className="text-white" />
      </div>
      <div>
        <div className={`text-2xl font-bold ${alert ? 'text-red-700' : 'text-gray-900'}`}>{value}</div>
        <div className="text-sm text-gray-500 mt-0.5">{label}</div>
        {sub && <div className={`text-xs mt-1 ${alert ? 'text-red-400' : 'text-gray-400'}`}>{sub}</div>}
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    not_started: 'bg-gray-100 text-gray-600',
    in_progress:  'bg-blue-100 text-blue-700',
    completed:    'bg-green-100 text-green-700',
    overdue:      'bg-red-100 text-red-700',
    cancelled:    'bg-gray-100 text-gray-500',
    pending:      'bg-yellow-100 text-yellow-700',
    approved:     'bg-green-100 text-green-700',
    rejected:     'bg-red-100 text-red-700',
  };
  const label = status?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${map[status] || 'bg-gray-100 text-gray-600'}`}>
      {label}
    </span>
  );
}

function SectionCard({ title, linkTo, linkLabel, navigate, children }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <h2 className="font-semibold text-gray-900 text-sm">{title}</h2>
        {linkTo && <button onClick={() => navigate(linkTo)} className="text-xs text-emerald-600 hover:underline">{linkLabel}</button>}
      </div>
      <div className="divide-y divide-gray-50">{children}</div>
    </div>
  );
}

function Empty({ text }) {
  return <div className="px-5 py-8 text-center text-sm text-gray-400">{text}</div>;
}

function Spinner() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function TeacherName({ id, name }) {
  return teachersData.find(t => t.id === id)?.name || name || id || '—';
}

// ─── Admin Dashboard ───────────────────────────────────────────────────────────

function AdminDashboard() {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([getAllAssignmentsWithTasks(), getLeaveApplications()]).then(([a, l]) => {
      if (a.status === 'fulfilled') setAssignments(a.value);
      if (l.status === 'fulfilled') setLeaves(l.value);
      setLoading(false);
    });
  }, []);

  const totalClasses   = classesData.reduce((n, c) => n + c.sections.length, 0);
  const activeTasks    = assignments.filter(a => !['cancelled', 'completed'].includes(a.status)).length;
  const overdueTasks   = assignments.filter(a => a.status === 'overdue').length;
  const completedTasks = assignments.filter(a => a.status === 'completed').length;
  const pendingLeaves  = leaves.filter(l => l.status === 'pending').length;

  if (loading) return <Spinner />;

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Users}        label="Teachers"        value={teachersData.length} color="bg-blue-500"    sub="Active staff" />
        <StatCard icon={BookOpen}     label="Classes"         value={totalClasses}         color="bg-indigo-500"  sub="All sections" />
        <StatCard icon={ClipboardList} label="Active Tasks"  value={activeTasks}           color="bg-emerald-500" sub={`${overdueTasks} overdue`} alert={overdueTasks > 0} onClick={() => navigate('/tasks')} />
        <StatCard icon={CalendarOff}  label="Pending Leaves"  value={pendingLeaves}        color="bg-orange-500"  sub="Awaiting approval" onClick={() => navigate('/leave')} />
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { icon: CheckCircle2, val: completedTasks,                                                      label: 'Completed Tasks', cls: 'text-green-500' },
          { icon: AlertCircle,  val: overdueTasks,                                                        label: 'Overdue Tasks',   cls: 'text-red-500'   },
          { icon: Clock,        val: assignments.filter(a => a.status === 'in_progress').length, label: 'In Progress',     cls: 'text-blue-500'  },
        ].map(({ icon: Icon, val, label, cls }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
            <Icon size={28} className={`${cls} shrink-0`} />
            <div>
              <div className="text-xl font-bold text-gray-900">{val}</div>
              <div className="text-sm text-gray-500">{label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <SectionCard title="Recent Task Assignments" linkTo="/tasks" linkLabel="View all" navigate={navigate}>
          {assignments.length === 0 ? <Empty text="No tasks yet" /> :
            [...assignments].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 6).map(a => (
              <div key={a.id} className="px-5 py-3 flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-medium text-gray-900 truncate max-w-[180px]">{a.task?.title || '—'}</div>
                  <div className="text-xs text-gray-400"><TeacherName id={a.teacherId} /></div>
                </div>
                <StatusBadge status={a.status} />
              </div>
            ))
          }
        </SectionCard>

        <SectionCard title="Leave Applications" linkTo="/leave" linkLabel="View all" navigate={navigate}>
          {leaves.length === 0 ? <Empty text="No leave applications" /> :
            leaves.slice(0, 6).map(l => (
              <div key={l.id} className="px-5 py-3 flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-medium text-gray-900"><TeacherName id={l.teacherId} name={l.teacherName} /></div>
                  <div className="text-xs text-gray-400 capitalize">{l.leaveType} · {l.startDate} – {l.endDate}</div>
                </div>
                <StatusBadge status={l.status} />
              </div>
            ))
          }
        </SectionCard>
      </div>
    </>
  );
}

// ─── Coordinator Dashboard ─────────────────────────────────────────────────────

function CoordinatorDashboard() {
  const navigate = useNavigate();
  const [leaves, setLeaves] = useState([]);
  const [proxies, setProxies] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([getLeaveApplications(), getProxyAssignments(), getAllAssignmentsWithTasks()]).then(([l, p, a]) => {
      if (l.status === 'fulfilled') setLeaves(l.value);
      if (p.status === 'fulfilled') setProxies(p.value);
      if (a.status === 'fulfilled') setAssignments(a.value);
      setLoading(false);
    });
  }, []);

  const pendingLeaves      = leaves.filter(l => l.status === 'pending');
  const approvedNoProxy    = leaves.filter(l => l.status === 'approved' && !proxies.some(p => p.leaveApplicationId === l.id));
  const pendingProxies     = proxies.filter(p => p.status === 'pending');
  const overdueTasks       = assignments.filter(a => a.status === 'overdue').length;

  if (loading) return <Spinner />;

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={CalendarOff}  label="Pending Leaves"       value={pendingLeaves.length}   color="bg-orange-500"  sub="Awaiting approval"    onClick={() => navigate('/leave')} />
        <StatCard icon={UserCheck}    label="Needs Proxy"          value={approvedNoProxy.length} color="bg-red-500"     sub="Approved, no cover"  alert={approvedNoProxy.length > 0} onClick={() => navigate('/leave')} />
        <StatCard icon={RefreshCw}    label="Pending Proxies"      value={pendingProxies.length}  color="bg-indigo-500"  sub="Awaiting principal"   onClick={() => navigate('/leave')} />
        <StatCard icon={AlertCircle}  label="Overdue Tasks"        value={overdueTasks}           color="bg-emerald-500" sub="Need attention"       alert={overdueTasks > 0} onClick={() => navigate('/tasks')} />
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Approved leaves needing proxy */}
        <SectionCard title="Approved Leaves — No Proxy Yet" linkTo="/leave" linkLabel="View all" navigate={navigate}>
          {approvedNoProxy.length === 0
            ? <div className="px-5 py-8 text-center text-sm text-green-600 font-medium">All approved leaves have proxy cover ✓</div>
            : approvedNoProxy.slice(0, 6).map(l => (
              <div key={l.id} className="px-5 py-3 flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-medium text-gray-900"><TeacherName id={l.teacherId} name={l.teacherName} /></div>
                  <div className="text-xs text-gray-400">{l.startDate} – {l.endDate} · {l.leaveType}</div>
                </div>
                <button
                  onClick={() => navigate(`/leave/${l.id}/proxy`)}
                  className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-1 rounded-lg hover:bg-indigo-100"
                >
                  Assign Proxy
                </button>
              </div>
            ))
          }
        </SectionCard>

        {/* Pending leave approvals */}
        <SectionCard title="Pending Leave Requests" linkTo="/leave" linkLabel="View all" navigate={navigate}>
          {pendingLeaves.length === 0
            ? <Empty text="No pending leave requests" />
            : pendingLeaves.slice(0, 6).map(l => (
              <div key={l.id} className="px-5 py-3 flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-medium text-gray-900"><TeacherName id={l.teacherId} name={l.teacherName} /></div>
                  <div className="text-xs text-gray-400 capitalize">{l.leaveType} · {l.startDate} – {l.endDate}</div>
                </div>
                <StatusBadge status={l.status} />
              </div>
            ))
          }
        </SectionCard>
      </div>

      {/* Quick links */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        {[
          { icon: CalendarDays, label: 'Manage Timetable',    path: '/timetable',    color: 'bg-blue-500' },
          { icon: ClipboardList, label: 'Create Task',        path: '/tasks/create', color: 'bg-emerald-500' },
          { icon: BarChart3,    label: 'View Reports',        path: '/reports',      color: 'bg-purple-500' },
        ].map(({ icon: Icon, label, path, color }) => (
          <button key={path} onClick={() => navigate(path)}
            className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3 hover:shadow-md transition-shadow"
          >
            <div className={`w-9 h-9 rounded-lg ${color} flex items-center justify-center shrink-0`}>
              <Icon size={16} className="text-white" />
            </div>
            <span className="text-sm font-medium text-gray-800">{label}</span>
          </button>
        ))}
      </div>
    </>
  );
}

// ─── Principal Dashboard ───────────────────────────────────────────────────────

function PrincipalDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [proxies, setProxies] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);

  const load = () => {
    Promise.allSettled([getLeaveApplications(), getProxyAssignments(), getAllAssignmentsWithTasks()]).then(([l, p, a]) => {
      if (l.status === 'fulfilled') setLeaves(l.value);
      if (p.status === 'fulfilled') setProxies(p.value);
      if (a.status === 'fulfilled') setAssignments(a.value);
      setLoading(false);
    });
  };

  useEffect(() => { load(); }, []);

  const pendingLeaves   = leaves.filter(l => l.status === 'pending');
  const pendingProxies  = proxies.filter(p => p.status === 'pending');
  const overdueTasks    = assignments.filter(a => a.status === 'overdue').length;
  const completedTasks  = assignments.filter(a => a.status === 'completed').length;

  const handleApproveLeave = async (id) => {
    setActionId(id);
    await approveLeave(id, user?.id);
    load();
    setActionId(null);
  };

  const handleApproveProxy = async (id) => {
    setActionId(id);
    await approveProxy(id, user?.id);
    load();
    setActionId(null);
  };

  if (loading) return <Spinner />;

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={CalendarOff}  label="Pending Leaves"   value={pendingLeaves.length}   color="bg-orange-500" sub="Require approval"   alert={pendingLeaves.length > 0}  onClick={() => navigate('/leave')} />
        <StatCard icon={ShieldCheck}  label="Pending Proxies"  value={pendingProxies.length}  color="bg-indigo-500" sub="Require approval"   alert={pendingProxies.length > 0} onClick={() => navigate('/leave')} />
        <StatCard icon={AlertCircle}  label="Overdue Tasks"    value={overdueTasks}           color="bg-red-500"    sub="Needs attention"    alert={overdueTasks > 0}          onClick={() => navigate('/tasks')} />
        <StatCard icon={CheckCircle2} label="Completed Tasks"  value={completedTasks}         color="bg-green-500"  sub="This period" />
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Pending leave approvals — with inline approve */}
        <SectionCard title="Leave Awaiting Approval" linkTo="/leave" linkLabel="View all" navigate={navigate}>
          {pendingLeaves.length === 0
            ? <div className="px-5 py-8 text-center text-sm text-green-600 font-medium">No pending leave requests ✓</div>
            : pendingLeaves.slice(0, 5).map(l => (
              <div key={l.id} className="px-5 py-3 flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-medium text-gray-900"><TeacherName id={l.teacherId} name={l.teacherName} /></div>
                  <div className="text-xs text-gray-400 capitalize">{l.leaveType} · {l.startDate} – {l.endDate}</div>
                </div>
                <div className="flex gap-1.5">
                  <button
                    disabled={actionId === l.id}
                    onClick={() => handleApproveLeave(l.id)}
                    className="text-xs bg-green-50 text-green-700 border border-green-200 px-2.5 py-1 rounded-lg hover:bg-green-100 disabled:opacity-50"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => navigate('/leave')}
                    className="text-xs bg-gray-50 text-gray-600 border border-gray-200 px-2.5 py-1 rounded-lg hover:bg-gray-100"
                  >
                    Review
                  </button>
                </div>
              </div>
            ))
          }
        </SectionCard>

        {/* Pending proxy approvals — with inline approve */}
        <SectionCard title="Proxy Assignments Awaiting Approval" linkTo="/leave" linkLabel="View all" navigate={navigate}>
          {pendingProxies.length === 0
            ? <div className="px-5 py-8 text-center text-sm text-green-600 font-medium">No pending proxy approvals ✓</div>
            : pendingProxies.slice(0, 5).map(p => {
              const orig = teachersData.find(t => t.id === p.originalTeacherId);
              const proxy = teachersData.find(t => t.id === p.proxyTeacherId);
              return (
                <div key={p.id} className="px-5 py-3 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {proxy?.name || p.proxyTeacherId} <span className="text-gray-400 font-normal">covers</span> {orig?.name || p.originalTeacherId}
                    </div>
                    <div className="text-xs text-gray-400">{p.date} · {p.classId} · {p.subjectId}</div>
                  </div>
                  <button
                    disabled={actionId === p.id}
                    onClick={() => handleApproveProxy(p.id)}
                    className="text-xs bg-green-50 text-green-700 border border-green-200 px-2.5 py-1 rounded-lg hover:bg-green-100 disabled:opacity-50"
                  >
                    Approve
                  </button>
                </div>
              );
            })
          }
        </SectionCard>
      </div>

      {/* Quick links */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        {[
          { icon: BarChart3,    label: 'View Reports',     path: '/reports',    color: 'bg-purple-500' },
          { icon: CalendarDays, label: 'View Timetable',   path: '/timetable',  color: 'bg-blue-500'   },
          { icon: Users,        label: 'Staff Overview',   path: '/teachers',   color: 'bg-indigo-500' },
        ].map(({ icon: Icon, label, path, color }) => (
          <button key={path} onClick={() => navigate(path)}
            className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3 hover:shadow-md transition-shadow"
          >
            <div className={`w-9 h-9 rounded-lg ${color} flex items-center justify-center shrink-0`}>
              <Icon size={16} className="text-white" />
            </div>
            <span className="text-sm font-medium text-gray-800">{label}</span>
          </button>
        ))}
      </div>
    </>
  );
}

// ─── Teacher Dashboard ─────────────────────────────────────────────────────────

function TeacherDashboard() {
  const navigate = useNavigate();
  const { teacherId, userProfile } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  const teacher = useMemo(
    () => teachersData.find(t => t.id === teacherId || t.email === userProfile?.email),
    [teacherId, userProfile?.email]
  );

  useEffect(() => {
    if (!teacher) { setLoading(false); return; }
    Promise.allSettled([getAssignmentsForTeacher(teacher.id), getLeaveApplicationsForTeacher(teacher.id)]).then(([a, l]) => {
      if (a.status === 'fulfilled') setAssignments(a.value);
      if (l.status === 'fulfilled') setLeaves(l.value);
      setLoading(false);
    });
  }, [teacher]);

  const { mySchedule, assignedClasses } = useMemo(() => {
    if (!teacher) return { mySchedule: [], assignedClasses: [] };
    let saved = {};
    try { saved = JSON.parse(localStorage.getItem('erp_timetable') || '{}'); } catch {}
    const slots = [];
    const classSet = new Set();
    Object.entries(saved).forEach(([classKey, grid]) => {
      grid?.forEach((row, pi) => {
        row?.forEach((cell, di) => {
          if (cell?.teacher === teacher.name && !periods[pi]?.break) {
            slots.push({ classKey, subject: cell.subject, day: days[di], period: periods[pi]?.label, time: periods[pi]?.time });
            classSet.add(classKey);
          }
        });
      });
    });
    return { mySchedule: slots, assignedClasses: Array.from(classSet) };
  }, [teacher]);

  const overdueTasks   = assignments.filter(a => a.status === 'overdue').length;
  const pendingTasks   = assignments.filter(a => ['not_started', 'in_progress'].includes(a.status)).length;
  const completedTasks = assignments.filter(a => a.status === 'completed').length;
  const pendingLeaves  = leaves.filter(l => l.status === 'pending').length;

  if (loading) return <Spinner />;

  return (
    <>
      {overdueTasks > 0 && (
        <div className="mb-5 flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-800">
          <AlertCircle size={16} className="shrink-0" />
          You have <strong className="mx-1">{overdueTasks}</strong> overdue task{overdueTasks !== 1 ? 's' : ''}.
          <button onClick={() => navigate('/tasks')} className="ml-auto text-xs underline">View</button>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={BookOpen}     label="My Classes"      value={assignedClasses.length} color="bg-indigo-500" sub={assignedClasses.slice(0, 2).join(', ') || 'Not in timetable yet'} onClick={() => navigate('/timetable')} />
        <StatCard icon={ClipboardList} label="Pending Tasks"  value={pendingTasks}           color="bg-emerald-500" sub={`${overdueTasks} overdue`} alert={overdueTasks > 0} onClick={() => navigate('/tasks')} />
        <StatCard icon={CheckCircle2} label="Completed Tasks" value={completedTasks}         color="bg-green-500" />
        <StatCard icon={CalendarOff}  label="My Leaves"       value={leaves.length}          color="bg-orange-500" sub={`${pendingLeaves} pending`} onClick={() => navigate('/leave')} />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <SectionCard title="My Timetable" linkTo="/timetable" linkLabel="Full view" navigate={navigate}>
          {mySchedule.length === 0 ? <Empty text="No periods assigned yet" /> :
            mySchedule.slice(0, 7).map((slot, i) => (
              <div key={i} className="px-5 py-2.5 flex items-center gap-3 border-b border-gray-50 last:border-0">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex flex-col items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-blue-700">{slot.day}</span>
                  <span className="text-[10px] text-blue-500">{slot.period}</span>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">{slot.subject}</div>
                  <div className="text-xs text-gray-400">{slot.classKey} · {slot.time}</div>
                </div>
              </div>
            ))
          }
        </SectionCard>

        <SectionCard title="My Tasks" linkTo="/tasks" linkLabel="View all" navigate={navigate}>
          {assignments.length === 0 ? <Empty text="No tasks assigned yet" /> :
            assignments.slice(0, 6).map(a => (
              <div key={a.id} className="px-5 py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">{a.task?.title || '—'}</div>
                  {a.task?.dueDate && (
                    <div className="text-xs text-gray-400">Due: {new Date(a.task.dueDate).toLocaleDateString()}</div>
                  )}
                </div>
                <StatusBadge status={a.status} />
              </div>
            ))
          }
        </SectionCard>
      </div>

      {assignedClasses.length > 0 && (
        <div className="mt-6 bg-white rounded-xl border border-gray-200 p-5">
          <div className="font-semibold text-gray-900 mb-3">My Timetable Classes</div>
          <div className="flex flex-wrap gap-2">
            {assignedClasses.map(cls => (
              <span key={cls} className="inline-flex items-center gap-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 text-sm font-medium px-3 py-1.5 rounded-lg">
                <BookMarked size={13} /> {cls}
              </span>
            ))}
          </div>
          {teacher?.subject && (
            <div className="mt-3 text-xs text-gray-400">Subject: <span className="text-gray-600 font-medium">{teacher.subject}</span></div>
          )}
        </div>
      )}
    </>
  );
}

// ─── Page entry ────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { userProfile, role, isAdmin, isPrincipal, isCoordinator } = useAuth();
  const name = userProfile?.name || userProfile?.email || 'User';

  const roleLabel = {
    admin: 'Administrator',
    principal: 'Principal',
    coordinator: 'Timetable Coordinator',
    teacher: 'Teacher',
  }[role] || role;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Welcome back, {name} · <span className="capitalize">{roleLabel}</span></p>
      </div>

      {isAdmin      && <AdminDashboard />}
      {isPrincipal  && <PrincipalDashboard />}
      {isCoordinator && <CoordinatorDashboard />}
      {!isAdmin && !isPrincipal && !isCoordinator && <TeacherDashboard />}
    </div>
  );
}
