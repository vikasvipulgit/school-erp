import React, { useEffect, useState } from 'react';
import { BarChart3, Download, Users, BookOpen, CalendarOff, ClipboardList, AlertCircle } from 'lucide-react';
import { getAllAssignmentsWithTasks, getTasks } from '@/modules/tasks/services/tasksFirebaseService';
import { getLeaveApplications, getProxyAssignments } from '@/modules/leave/services/leaveFirebaseService';
import teachersData from '@/data/teachers.json';
import classesData from '@/data/classes.json';
import { days, periods } from '@/modules/timetable/pages/TimetablePage';

const REPORT_TABS = [
  { id: 'teacher_timetable', label: 'Teacher Timetable', icon: Users },
  { id: 'class_timetable', label: 'Class Timetable', icon: BookOpen },
  { id: 'leave_summary', label: 'Leave Summary', icon: CalendarOff },
  { id: 'task_summary', label: 'Task Summary', icon: ClipboardList },
  { id: 'workload', label: 'Workload Report', icon: BarChart3 },
];

function TeacherTimetableReport() {
  const [selectedTeacher, setSelectedTeacher] = useState('');
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem('erp_timetable') || '{}'); } catch {}

  const grid = React.useMemo(() => {
    if (!selectedTeacher) return null;
    const base = periods.map(() => days.map(() => null));
    Object.entries(saved).forEach(([classKey, classGrid]) => {
      classGrid?.forEach((row, pi) => {
        row?.forEach((cell, di) => {
          if (cell?.teacher === selectedTeacher) {
            base[pi][di] = { ...cell, classKey };
          }
        });
      });
    });
    return base;
  }, [selectedTeacher]);

  return (
    <div>
      <div className="mb-4 flex items-end gap-3">
        <div className="flex-1 max-w-xs">
          <label className="block text-xs font-medium text-gray-600 mb-1">Select Teacher</label>
          <select
            value={selectedTeacher}
            onChange={(e) => setSelectedTeacher(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none"
          >
            <option value="">-- Choose Teacher --</option>
            {teachersData.map((t) => (
              <option key={t.id} value={t.name}>{t.name} ({t.subject})</option>
            ))}
          </select>
        </div>
      </div>

      {grid && (
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 w-24">Period</th>
                {days.map((d) => (
                  <th key={d} className="px-4 py-2 text-center text-xs font-semibold text-gray-500">{d}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {periods.map((period, pi) => (
                <tr key={pi} className={period.break ? 'bg-amber-50' : 'bg-white'}>
                  <td className="px-4 py-2 text-xs text-gray-500 font-medium whitespace-nowrap">
                    {period.break ? 'Break' : <>{period.label}<br /><span className="font-normal text-gray-400">{period.time}</span></>}
                  </td>
                  {days.map((_, di) => {
                    const cell = grid[pi]?.[di];
                    if (period.break) return <td key={di} className="px-4 py-2 text-center text-xs text-amber-500">—</td>;
                    return (
                      <td key={di} className="px-4 py-2 text-center">
                        {cell ? (
                          <div className="inline-block bg-blue-50 text-blue-700 rounded px-2 py-1 text-xs">
                            <div className="font-medium">{cell.subject}</div>
                            <div className="text-blue-500">{cell.classKey}</div>
                          </div>
                        ) : <span className="text-gray-300">—</span>}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ClassTimetableReport() {
  const classOptions = classesData.flatMap((c) =>
    c.sections.map((s) => ({ value: `${c.class}-${s}`, label: `${c.class} - ${s}` }))
  );
  const [selectedClass, setSelectedClass] = useState('');
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem('erp_timetable') || '{}'); } catch {}
  const grid = selectedClass ? saved[selectedClass] : null;

  return (
    <div>
      <div className="mb-4">
        <label className="block text-xs font-medium text-gray-600 mb-1">Select Class</label>
        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none max-w-xs w-full"
        >
          <option value="">-- Choose Class --</option>
          {classOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
      {grid && (
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 w-24">Period</th>
                {days.map((d) => <th key={d} className="px-4 py-2 text-center text-xs font-semibold text-gray-500">{d}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {periods.map((period, pi) => (
                <tr key={pi} className={period.break ? 'bg-amber-50' : 'bg-white'}>
                  <td className="px-4 py-2 text-xs text-gray-500 font-medium whitespace-nowrap">
                    {period.break ? 'Break' : <>{period.label}<br /><span className="font-normal text-gray-400">{period.time}</span></>}
                  </td>
                  {days.map((_, di) => {
                    const cell = grid[pi]?.[di];
                    if (period.break) return <td key={di} className="px-4 py-2 text-center text-xs text-amber-500">—</td>;
                    return (
                      <td key={di} className="px-4 py-2 text-center">
                        {cell?.type === 'filled' || cell?.type === 'proxy' ? (
                          <div className={`inline-block rounded px-2 py-1 text-xs ${cell.type === 'proxy' ? 'bg-yellow-50 text-yellow-700' : 'bg-emerald-50 text-emerald-700'}`}>
                            <div className="font-medium">{cell.subject}</div>
                            <div className="opacity-70">{cell.teacher}</div>
                          </div>
                        ) : <span className="text-gray-300">—</span>}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function LeaveSummaryReport({ leaves }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50">
            {['Teacher', 'Leave Type', 'Start Date', 'End Date', 'Status', 'Reason'].map((h) => (
              <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {leaves.map((l) => {
            const teacher = teachersData.find((t) => t.id === l.teacherId);
            const statusCls = { pending: 'bg-yellow-100 text-yellow-700', approved: 'bg-green-100 text-green-700', rejected: 'bg-red-100 text-red-700' };
            return (
              <tr key={l.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{teacher?.name || l.teacherName || '—'}</td>
                <td className="px-4 py-3 capitalize text-gray-600">{l.leaveType}</td>
                <td className="px-4 py-3 text-gray-600">{l.startDate}</td>
                <td className="px-4 py-3 text-gray-600">{l.endDate}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusCls[l.status] || 'bg-gray-100 text-gray-600'}`}>
                    {l.status?.charAt(0).toUpperCase() + l.status?.slice(1)}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs max-w-[200px] truncate">{l.reason || '—'}</td>
              </tr>
            );
          })}
          {leaves.length === 0 && (
            <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No leave applications found</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function TaskSummaryReport({ assignments }) {
  const STATUS_CLS = {
    not_started: 'bg-gray-100 text-gray-600',
    in_progress: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
    overdue: 'bg-red-100 text-red-700',
    cancelled: 'bg-gray-100 text-gray-400',
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50">
            {['Task', 'Teacher', 'Priority', 'Due Date', 'Status'].map((h) => (
              <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {assignments.map((a) => {
            const teacher = teachersData.find((t) => t.id === a.teacherId);
            const due = a.task?.dueDate?.toDate ? a.task.dueDate.toDate() : a.task?.dueDate ? new Date(a.task.dueDate) : null;
            const prioCls = { high: 'bg-red-100 text-red-700', medium: 'bg-yellow-100 text-yellow-700', low: 'bg-green-100 text-green-700' };
            return (
              <tr key={a.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900 max-w-[200px] truncate">{a.task?.title || '—'}</td>
                <td className="px-4 py-3 text-gray-600">{teacher?.name || a.teacherId}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${prioCls[a.task?.priority] || 'bg-gray-100 text-gray-600'}`}>
                    {a.task?.priority || '—'}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{due?.toLocaleDateString() || '—'}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_CLS[a.status] || 'bg-gray-100 text-gray-600'}`}>
                    {a.status?.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                  </span>
                </td>
              </tr>
            );
          })}
          {assignments.length === 0 && (
            <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No task assignments found</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function WorkloadReport() {
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem('erp_timetable') || '{}'); } catch {}

  const workload = teachersData.map((t) => {
    let total = 0;
    const byDay = {};
    days.forEach((d) => { byDay[d] = 0; });
    Object.values(saved).forEach((grid) => {
      grid?.forEach((row, pi) => {
        if (periods[pi]?.break) return;
        row?.forEach((cell, di) => {
          if (cell?.teacher === t.name) {
            total++;
            byDay[days[di]] = (byDay[days[di]] || 0) + 1;
          }
        });
      });
    });
    const maxDay = Math.max(...Object.values(byDay));
    return { ...t, total, byDay, maxDay };
  }).sort((a, b) => b.total - a.total);

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50">
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Teacher</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Subject</th>
            {days.map((d) => <th key={d} className="px-4 py-3 text-center text-xs font-semibold text-gray-500">{d}</th>)}
            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500">Weekly Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {workload.map((t) => (
            <tr key={t.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 font-medium text-gray-900">{t.name}</td>
              <td className="px-4 py-3 text-gray-500 text-xs">{t.subject}</td>
              {days.map((d) => (
                <td key={d} className="px-4 py-3 text-center">
                  <span className={`text-xs font-medium ${t.byDay[d] > 5 ? 'text-red-600' : t.byDay[d] > 0 ? 'text-gray-700' : 'text-gray-300'}`}>
                    {t.byDay[d] || 0}
                  </span>
                </td>
              ))}
              <td className="px-4 py-3 text-center">
                <span className={`px-2 py-0.5 rounded text-xs font-semibold ${t.total > 25 ? 'bg-red-100 text-red-700' : t.total > 15 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                  {t.total}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('teacher_timetable');
  const [assignments, setAssignments] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [a, l] = await Promise.all([getAllAssignmentsWithTasks(), getLeaveApplications()]);
        setAssignments(a);
        setLeaves(l);
      } catch {}
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="text-sm text-gray-500 mt-1">View timetable, leave, and task analytics</p>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {REPORT_TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                activeTab === tab.id
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
              }`}
            >
              <Icon size={15} />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {activeTab === 'teacher_timetable' && <TeacherTimetableReport />}
            {activeTab === 'class_timetable' && <ClassTimetableReport />}
            {activeTab === 'leave_summary' && <LeaveSummaryReport leaves={leaves} />}
            {activeTab === 'task_summary' && <TaskSummaryReport assignments={assignments} />}
            {activeTab === 'workload' && <WorkloadReport />}
          </>
        )}
      </div>
    </div>
  );
}
