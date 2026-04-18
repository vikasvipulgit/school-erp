import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle, CheckCircle2, Clock, User } from 'lucide-react';
import { useAuth } from '@/core/context/AuthContext';
import {
  getTask,
  getAssignmentsForTask,
  updateAssignmentStatus,
  cancelTask,
} from '@/modules/tasks/services/tasksFirebaseService';
import teachersData from '@/data/teachers.json';

const STATUS_CONFIG = {
  not_started: { label: 'Not Started', cls: 'bg-gray-100 text-gray-600' },
  in_progress: { label: 'In Progress', cls: 'bg-blue-100 text-blue-700' },
  completed: { label: 'Completed', cls: 'bg-green-100 text-green-700' },
  overdue: { label: 'Overdue', cls: 'bg-red-100 text-red-700' },
  cancelled: { label: 'Cancelled', cls: 'bg-gray-100 text-gray-400' },
};

const PRIORITY_CLS = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low: 'bg-green-100 text-green-700',
};

const STATUS_TRANSITIONS = {
  not_started: ['in_progress'],
  in_progress: ['completed'],
  overdue: ['completed'],
};

export default function TaskDetailPage() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const { canManageTasks } = useAuth();
  const [task, setTask] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const load = async () => {
    setLoading(true);
    const [t, a] = await Promise.all([getTask(taskId), getAssignmentsForTask(taskId)]);
    setTask(t);
    setAssignments(a);
    setLoading(false);
  };

  useEffect(() => { load(); }, [taskId]);

  const handleStatusChange = async (assignmentId, newStatus) => {
    setUpdatingId(assignmentId);
    await updateAssignmentStatus(assignmentId, newStatus);
    await load();
    setUpdatingId(null);
  };

  const handleCancel = async () => {
    if (!window.confirm('Cancel this task for all assignees?')) return;
    await cancelTask(taskId);
    navigate('/tasks');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!task) {
    return <div className="text-gray-500 text-center py-16">Task not found.</div>;
  }

  const dueDate = task.dueDate?.toDate ? task.dueDate.toDate() : task.dueDate ? new Date(task.dueDate) : null;
  const startDate = task.startDate?.toDate ? task.startDate.toDate() : task.startDate ? new Date(task.startDate) : null;

  const completedCount = assignments.filter((a) => a.status === 'completed').length;
  const overdueCount = assignments.filter((a) => a.status === 'overdue').length;

  return (
    <div className="max-w-3xl mx-auto">
      <button
        onClick={() => navigate('/tasks')}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-5"
      >
        <ArrowLeft size={16} /> Back to Tasks
      </button>

      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-5">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{task.title}</h1>
            {task.createdByName && (
              <p className="text-xs text-gray-400 mt-1">Created by {task.createdByName}</p>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className={`px-2.5 py-0.5 rounded text-xs font-medium ${PRIORITY_CLS[task.priority] || 'bg-gray-100 text-gray-600'}`}>
              {task.priority?.charAt(0).toUpperCase() + task.priority?.slice(1)} Priority
            </span>
            {canManageTasks && task.status !== 'cancelled' && (
              <button
                onClick={handleCancel}
                className="text-xs text-red-500 hover:text-red-700 px-3 py-1 border border-red-200 rounded hover:bg-red-50"
              >
                Cancel Task
              </button>
            )}
          </div>
        </div>

        <p className="text-sm text-gray-700 mb-5">{task.description}</p>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="bg-gray-50 rounded-lg px-4 py-3">
            <div className="text-xs text-gray-400 mb-1">Start Date</div>
            <div className="font-medium text-gray-800">{startDate?.toLocaleDateString() || '—'}</div>
          </div>
          <div className="bg-gray-50 rounded-lg px-4 py-3">
            <div className="text-xs text-gray-400 mb-1">Due Date</div>
            <div className={`font-medium ${overdueCount > 0 ? 'text-red-600' : 'text-gray-800'}`}>
              {dueDate?.toLocaleDateString() || '—'}
            </div>
          </div>
        </div>

        {task.remarks && (
          <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 text-sm text-yellow-800">
            <span className="font-medium">Remarks:</span> {task.remarks}
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">
            Assignments <span className="text-gray-400 font-normal text-sm">({assignments.length})</span>
          </h2>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <CheckCircle2 size={12} className="text-green-500" /> {completedCount} completed
            </span>
            {overdueCount > 0 && (
              <span className="flex items-center gap-1 text-red-500">
                <AlertCircle size={12} /> {overdueCount} overdue
              </span>
            )}
          </div>
        </div>

        <div className="divide-y">
          {assignments.map((a) => {
            const teacher = teachersData.find((t) => t.id === a.teacherId);
            const cfg = STATUS_CONFIG[a.status] || STATUS_CONFIG.not_started;
            const transitions = STATUS_TRANSITIONS[a.status] || [];
            const completedAt = a.completedAt?.toDate ? a.completedAt.toDate() : null;

            return (
              <div key={a.id} className="px-5 py-3.5 flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm font-semibold shrink-0">
                  {teacher?.name?.[0] || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900">{teacher?.name || a.teacherId}</div>
                  <div className="text-xs text-gray-400">{teacher?.subject}</div>
                  {completedAt && (
                    <div className="text-xs text-gray-400 mt-0.5">
                      Completed {completedAt.toLocaleDateString()}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.cls}`}>
                    {cfg.label}
                  </span>
                  {transitions.length > 0 && (
                    <select
                      disabled={updatingId === a.id}
                      onChange={(e) => handleStatusChange(a.id, e.target.value)}
                      value=""
                      className="border border-gray-200 rounded px-2 py-1 text-xs text-gray-600 focus:outline-none cursor-pointer"
                    >
                      <option value="" disabled>Update →</option>
                      {transitions.map((s) => (
                        <option key={s} value={s}>{STATUS_CONFIG[s]?.label}</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
            );
          })}
          {assignments.length === 0 && (
            <div className="px-5 py-8 text-center text-sm text-gray-400">No assignments found.</div>
          )}
        </div>
      </div>
    </div>
  );
}
