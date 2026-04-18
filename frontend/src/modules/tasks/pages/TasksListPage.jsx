import React, { useEffect, useState } from 'react';
import { Plus, Search, AlertCircle, Clock, CheckCircle2, XCircle, ClipboardList } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/core/context/AuthContext';
import {
  getTasks,
  getAllAssignmentsWithTasks,
  getAssignmentsForTeacher,
  updateAssignmentStatus,
  cancelTask,
  checkAndMarkOverdueTasks,
} from '@/modules/tasks/services/tasksFirebaseService';
import teachersData from '@/data/teachers.json';

const STATUS_CONFIG = {
  not_started: { label: 'Not Started', cls: 'bg-gray-100 text-gray-600', icon: Clock },
  in_progress: { label: 'In Progress', cls: 'bg-blue-100 text-blue-700', icon: Clock },
  completed: { label: 'Completed', cls: 'bg-green-100 text-green-700', icon: CheckCircle2 },
  overdue: { label: 'Overdue', cls: 'bg-red-100 text-red-700', icon: AlertCircle },
  cancelled: { label: 'Cancelled', cls: 'bg-gray-100 text-gray-400 line-through', icon: XCircle },
};

const PRIORITY_CONFIG = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low: 'bg-green-100 text-green-700',
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.not_started;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}

function PriorityBadge({ priority }) {
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${PRIORITY_CONFIG[priority] || 'bg-gray-100 text-gray-600'}`}>
      {priority?.charAt(0).toUpperCase() + priority?.slice(1)}
    </span>
  );
}

const STATUS_TRANSITIONS = {
  not_started: ['in_progress'],
  in_progress: ['completed'],
  completed: [],
  overdue: ['completed'],
  cancelled: [],
};

export default function TasksListPage() {
  const navigate = useNavigate();
  const { canManageTasks, user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      await checkAndMarkOverdueTasks();
      if (canManageTasks) {
        const all = await getAllAssignmentsWithTasks();
        setItems(all);
      } else {
        const teacherRecord = teachersData.find(
          (t) => t.name === user?.displayName || t.email === user?.email
        );
        if (teacherRecord) {
          const mine = await getAssignmentsForTeacher(teacherRecord.id);
          const tasks = await getTasks();
          const taskMap = Object.fromEntries(tasks.map((t) => [t.id, t]));
          setItems(mine.map((a) => ({ ...a, task: taskMap[a.taskId] || null })));
        }
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, [canManageTasks]);

  const handleStatusChange = async (assignmentId, newStatus) => {
    setUpdatingId(assignmentId);
    try {
      await updateAssignmentStatus(assignmentId, newStatus);
      await load();
    } catch {}
    setUpdatingId(null);
  };

  const handleCancel = async (taskId) => {
    if (!window.confirm('Cancel this task for all assignees?')) return;
    await cancelTask(taskId);
    await load();
  };

  const filtered = items.filter((a) => {
    if (filterStatus !== 'all' && a.status !== filterStatus) return false;
    if (filterPriority !== 'all' && a.task?.priority !== filterPriority) return false;
    if (search && !a.task?.title?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const overdueCount = items.filter((a) => a.status === 'overdue').length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Task Management</h1>
          <p className="text-sm text-gray-500 mt-1">
            {canManageTasks ? 'Assign and monitor teacher tasks' : 'View your assigned tasks'}
          </p>
        </div>
        {canManageTasks && (
          <button
            onClick={() => navigate('/tasks/create')}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            <Plus size={16} /> Create Task
          </button>
        )}
      </div>

      {overdueCount > 0 && (
        <div className="mb-4 flex items-center gap-3 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-800">
          <AlertCircle size={16} className="shrink-0" />
          <span><strong>{overdueCount}</strong> task{overdueCount > 1 ? 's are' : ' is'} overdue and require immediate attention.</span>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="flex items-center gap-3 p-4 border-b border-gray-100 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none"
          >
            <option value="all">All Status</option>
            {Object.entries(STATUS_CONFIG).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none"
          >
            <option value="all">All Priority</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <ClipboardList size={32} className="mx-auto mb-2 opacity-40" />
            <div className="text-sm">No tasks found</div>
          </div>
        ) : (
          <div className="divide-y">
            {filtered.map((a) => {
              const teacher = teachersData.find((t) => t.id === a.teacherId);
              const dueDate = a.task?.dueDate?.toDate
                ? a.task.dueDate.toDate()
                : a.task?.dueDate ? new Date(a.task.dueDate) : null;
              const isOverdue = a.status === 'overdue';
              const transitions = STATUS_TRANSITIONS[a.status] || [];

              return (
                <div
                  key={a.id}
                  className={`px-5 py-4 flex items-start gap-4 hover:bg-gray-50 ${isOverdue ? 'bg-red-50/40' : ''}`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className="font-medium text-gray-900 cursor-pointer hover:text-emerald-700"
                        onClick={() => navigate(`/tasks/${a.taskId}`)}
                      >
                        {a.task?.title || 'Unknown Task'}
                      </span>
                      <PriorityBadge priority={a.task?.priority} />
                      {isOverdue && (
                        <span className="flex items-center gap-1 text-xs text-red-600">
                          <AlertCircle size={12} /> Overdue
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-1 line-clamp-1">
                      {a.task?.description}
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-400 flex-wrap">
                      {canManageTasks && teacher && (
                        <span className="flex items-center gap-1">
                          <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-semibold">
                            {teacher.name[0]}
                          </span>
                          {teacher.name}
                        </span>
                      )}
                      {dueDate && (
                        <span className={isOverdue ? 'text-red-500 font-medium' : ''}>
                          Due: {dueDate.toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <StatusBadge status={a.status} />
                    {transitions.length > 0 && (
                      <select
                        disabled={updatingId === a.id}
                        onChange={(e) => handleStatusChange(a.id, e.target.value)}
                        value=""
                        className="border border-gray-200 rounded px-2 py-1 text-xs text-gray-600 focus:outline-none cursor-pointer"
                      >
                        <option value="" disabled>Update</option>
                        {transitions.map((s) => (
                          <option key={s} value={s}>{STATUS_CONFIG[s]?.label}</option>
                        ))}
                      </select>
                    )}
                    {canManageTasks && a.status !== 'cancelled' && a.status !== 'completed' && (
                      <button
                        onClick={() => handleCancel(a.taskId)}
                        className="text-xs text-red-500 hover:text-red-700 px-2 py-1 border border-red-200 rounded hover:bg-red-50"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
