import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, User } from 'lucide-react';
import { useAuth } from '@/core/context/AuthContext';
import { createTask } from '@/modules/tasks/services/tasksFirebaseService';
import teachersData from '@/data/teachers.json';
import { Timestamp } from 'firebase/firestore';

const SCOPE_OPTIONS = [
  { value: 'individual', label: 'Individual Teachers' },
  { value: 'all', label: 'All Teachers' },
];

export default function CreateTaskPage() {
  const navigate = useNavigate();
  const { user, canManageTasks } = useAuth();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [remarks, setRemarks] = useState('');
  const [scope, setScope] = useState('individual');
  const [selectedTeachers, setSelectedTeachers] = useState([]);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  if (!canManageTasks) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        You don't have permission to create tasks.
      </div>
    );
  }

  const today = new Date().toISOString().split('T')[0];

  const validate = () => {
    const e = {};
    if (!title.trim()) e.title = 'Title is required';
    if (!description.trim()) e.description = 'Description is required';
    if (!priority) e.priority = 'Priority is required';
    if (!startDate) e.startDate = 'Start date is required';
    if (!dueDate) e.dueDate = 'Due date is required';
    if (dueDate && dueDate <= startDate) e.dueDate = 'Due date must be after start date';
    if (dueDate && dueDate < today) e.dueDate = 'Due date cannot be in the past';
    const assignees = getAssignees();
    if (assignees.length === 0) e.assignees = 'At least one teacher must be selected';
    return e;
  };

  const getAssignees = () => {
    if (scope === 'all') return teachersData.map((t) => t.id);
    return selectedTeachers;
  };

  const toggleTeacher = (id) => {
    setSelectedTeachers((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setSaving(true);
    try {
      const assignees = getAssignees();
      await createTask(
        {
          title: title.trim(),
          description: description.trim(),
          priority,
          startDate,
          dueDate,
          remarks: remarks.trim(),
          createdBy: user?.uid,
          createdByName: user?.displayName || user?.email,
        },
        assignees
      );
      navigate('/tasks');
    } catch (err) {
      console.error(err);
    }
    setSaving(false);
  };

  const err = (field) =>
    errors[field] ? (
      <p className="text-xs text-red-500 mt-1">{errors[field]}</p>
    ) : null;

  return (
    <div className="max-w-2xl mx-auto">
      <button
        onClick={() => navigate('/tasks')}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-5"
      >
        <ArrowLeft size={16} /> Back to Tasks
      </button>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Create New Task</h1>
        <p className="text-sm text-gray-500 mt-1">Assign a task to one or more teachers</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-5">
          <h2 className="font-semibold text-gray-800 text-sm uppercase tracking-wide">Task Details</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              value={title}
              onChange={(e) => { setTitle(e.target.value); setErrors((p) => ({ ...p, title: '' })); }}
              placeholder="e.g. Submit lesson plans for Term 2"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
            {err('title')}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => { setDescription(e.target.value); setErrors((p) => ({ ...p, description: '' })); }}
              rows={3}
              placeholder="Detailed description of what needs to be done..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 resize-none"
            />
            {err('description')}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority <span className="text-red-500">*</span>
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none"
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              {err('priority')}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={startDate}
                min={today}
                onChange={(e) => { setStartDate(e.target.value); setErrors((p) => ({ ...p, startDate: '' })); }}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none"
              />
              {err('startDate')}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Due Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={dueDate}
                min={startDate || today}
                onChange={(e) => { setDueDate(e.target.value); setErrors((p) => ({ ...p, dueDate: '' })); }}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none"
              />
              {err('dueDate')}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Remarks (optional)</label>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              rows={2}
              placeholder="Any additional notes..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none resize-none"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <h2 className="font-semibold text-gray-800 text-sm uppercase tracking-wide">Assignment</h2>

          <div className="flex gap-3">
            {SCOPE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => { setScope(opt.value); setSelectedTeachers([]); setErrors((p) => ({ ...p, assignees: '' })); }}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                  scope === opt.value
                    ? 'bg-emerald-500 text-white border-emerald-500'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-emerald-300'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {scope === 'all' && (
            <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-800">
              This task will be assigned to all <strong>{teachersData.length}</strong> teachers. Each will track status independently.
            </div>
          )}

          {scope === 'individual' && (
            <div>
              <div className="text-xs text-gray-500 mb-2">{selectedTeachers.length} selected</div>
              <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg divide-y">
                {teachersData.map((t) => (
                  <label
                    key={t.id}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedTeachers.includes(t.id)}
                      onChange={() => { toggleTeacher(t.id); setErrors((p) => ({ ...p, assignees: '' })); }}
                      className="rounded accent-emerald-500"
                    />
                    <div>
                      <div className="text-sm font-medium text-gray-900">{t.name}</div>
                      <div className="text-xs text-gray-400">{t.subject}</div>
                    </div>
                  </label>
                ))}
              </div>
              {err('assignees')}
            </div>
          )}

          {scope === 'all' && err('assignees')}
        </div>

        <div className="flex justify-end gap-3 pb-6">
          <button
            type="button"
            onClick={() => navigate('/tasks')}
            className="px-5 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-medium disabled:opacity-60"
          >
            {saving ? 'Creating...' : 'Create Task'}
          </button>
        </div>
      </form>
    </div>
  );
}
