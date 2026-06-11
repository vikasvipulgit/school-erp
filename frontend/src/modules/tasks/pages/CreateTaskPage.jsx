import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/core/context/AuthContext';
import { createTask } from '@/modules/tasks/services/tasksService';
import { getTeachers } from '@/modules/timetable/services/teachersService';
import { useClasses } from '@/core/context/ClassesContext';
import { useSubjects } from '@/core/hooks/useSubjects';

const SCOPE_OPTIONS = [
  { value: 'individual', label: 'Individual Teachers' },
  { value: 'class', label: 'By Class' },
  { value: 'subject', label: 'By Subject' },
  { value: 'all', label: 'All Teachers' },
];

export default function CreateTaskPage() {
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const { classes } = useClasses();
  const { subjects } = useSubjects();
  const canManageAllTasks = ['admin', 'principal', 'coordinator'].includes(role);

  const [teachers, setTeachers] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [remarks, setRemarks] = useState('');
  const [scope, setScope] = useState('individual');
  const [selectedTeachers, setSelectedTeachers] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    getTeachers().then(setTeachers).catch(() => {});
  }, []);

  if (!canManageAllTasks || ['principal', 'coordinator'].includes(role)) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        You don't have permission to create tasks.
      </div>
    );
  }

  const today = new Date().toISOString().split('T')[0];
  const classOptions = useMemo(
    () => classes.map((entry) => entry.class).filter(Boolean).sort((a, b) => a.localeCompare(b)),
    [classes]
  );
  const subjectOptions = useMemo(() => {
    const names = subjects.map((subject) => subject.name).filter(Boolean);
    const fallback = teachers.map((teacher) => teacher.subject).filter(Boolean);
    return [...new Set([...names, ...fallback])].sort((a, b) => a.localeCompare(b));
  }, [subjects, teachers]);

  const classTeachers = useMemo(() => {
    if (!selectedClass) return [];
    return teachers.filter((teacher) => (teacher.classes || []).includes(selectedClass));
  }, [selectedClass, teachers]);

  const subjectTeachers = useMemo(() => {
    if (!selectedSubject) return [];
    return teachers.filter((teacher) => teacher.subject === selectedSubject);
  }, [selectedSubject, teachers]);

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
    if (scope === 'all') return teachers.map((t) => t.id);
    if (scope === 'class') return classTeachers.map((t) => t.id);
    if (scope === 'subject') return subjectTeachers.map((t) => t.id);
    return selectedTeachers;
  };

  const toggleTeacher = (id) => {
    setSelectedTeachers((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setSaving(true);
    try {
      const assignees = getAssignees();
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('priority', priority);
      formData.append('startDate', startDate);
      formData.append('dueDate', dueDate);
      formData.append('remarks', remarks.trim());
      formData.append('createdByName', user?.name || user?.displayName || user?.email);
      if (file) formData.append('file', file);

      await createTask(formData, assignees);
      navigate('/tasks');
    } catch (err) {
      console.error(err);
      setSubmitError(err.message || 'Failed to create task.');
    }
    setSaving(false);
  };

  const err = (field) =>
    errors[field] ? (
      <p className="text-xs text-red-500 mt-1">{errors[field]}</p>
    ) : null;

  const assignmentPreview = useMemo(() => {
    if (scope === 'all') return teachers;
    if (scope === 'class') return classTeachers;
    if (scope === 'subject') return subjectTeachers;
    return teachers.filter((teacher) => selectedTeachers.includes(teacher.id));
  }, [scope, teachers, classTeachers, subjectTeachers, selectedTeachers]);

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
          {submitError && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {submitError}
            </div>
          )}
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Attachment (PDF only, max 5MB)</label>
            <div className="mt-1 flex items-center gap-4">
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => setFile(e.target.files[0])}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-lg file:border-0
                  file:text-sm file:font-semibold
                  file:bg-emerald-50 file:text-emerald-700
                  hover:file:bg-emerald-100"
              />
              {file && (
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  className="text-xs text-red-500 hover:text-red-700 underline"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <h2 className="font-semibold text-gray-800 text-sm uppercase tracking-wide">Assignment</h2>

          <div className="grid grid-cols-2 gap-3">
            {SCOPE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  setScope(opt.value);
                  setSelectedTeachers([]);
                  setSelectedClass('');
                  setSelectedSubject('');
                  setErrors((p) => ({ ...p, assignees: '' }));
                }}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-colors ${scope === opt.value
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
              This task will be assigned to all <strong>{teachers.length}</strong> teachers. Each will track status independently.
            </div>
          )}

          {scope === 'class' && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select class</label>
                <select
                  value={selectedClass}
                  onChange={(e) => {
                    setSelectedClass(e.target.value);
                    setErrors((p) => ({ ...p, assignees: '' }));
                  }}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none"
                >
                  <option value="">Choose a class</option>
                  {classOptions.map((className) => (
                    <option key={className} value={className}>
                      {className}
                    </option>
                  ))}
                </select>
              </div>
              <div className="rounded-lg bg-slate-50 border border-slate-200 px-4 py-3 text-sm text-slate-700">
                {selectedClass
                  ? `This will assign the task to all ${classTeachers.length} teachers mapped to ${selectedClass}.`
                  : 'Choose a class to target every teacher assigned to that class.'}
              </div>
            </div>
          )}

          {scope === 'subject' && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select subject</label>
                <select
                  value={selectedSubject}
                  onChange={(e) => {
                    setSelectedSubject(e.target.value);
                    setErrors((p) => ({ ...p, assignees: '' }));
                  }}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none"
                >
                  <option value="">Choose a subject</option>
                  {subjectOptions.map((subjectName) => (
                    <option key={subjectName} value={subjectName}>
                      {subjectName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="rounded-lg bg-slate-50 border border-slate-200 px-4 py-3 text-sm text-slate-700">
                {selectedSubject
                  ? `This will assign the task to all ${subjectTeachers.length} teachers who teach ${selectedSubject}.`
                  : 'Choose a subject to target all teachers mapped to that subject.'}
              </div>
            </div>
          )}

          {scope === 'individual' && (
            <div>
              <div className="text-xs text-gray-500 mb-2">{selectedTeachers.length} selected</div>
              <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg divide-y">
                {teachers.map((t) => (
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

          {scope !== 'individual' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{assignmentPreview.length} selected</span>
                {scope !== 'all' && assignmentPreview.length === 0 && (
                  <span>No matching teachers yet</span>
                )}
              </div>
              <div className="max-h-56 overflow-y-auto border border-gray-200 rounded-lg divide-y">
                {assignmentPreview.length > 0 ? (
                  assignmentPreview.map((teacher) => (
                    <div key={teacher.id} className="px-4 py-2.5">
                      <div className="text-sm font-medium text-gray-900">{teacher.name}</div>
                      <div className="text-xs text-gray-400">
                        {[teacher.subject, ...(teacher.classes || []).slice(0, 2)].filter(Boolean).join(' • ') || 'No metadata'}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-3 text-sm text-gray-500">
                    No teachers match this assignment rule yet.
                  </div>
                )}
              </div>
              {err('assignees')}
            </div>
          )}
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
