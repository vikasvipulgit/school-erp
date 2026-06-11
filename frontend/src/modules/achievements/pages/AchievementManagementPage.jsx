import { useState, useEffect, useCallback } from 'react';
import {
  Trophy, Plus, Search, Pencil, Trash2, X, Loader2,
  Calendar, Tag, AlertTriangle, CheckCircle2, Users,
} from 'lucide-react';
import {
  getAchievements, createAchievement, updateAchievement, deleteAchievement,
} from '@/modules/achievements/services/achievementService';

const CATEGORIES = ['Academic', 'Sports', 'Science', 'Attendance', 'Competition', 'School', 'Arts'];
const LEVELS     = ['School', 'District', 'State', 'National', 'International', 'Inter School'];

const CATEGORY_COLORS = {
  Academic:    { bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-200',    dot: 'bg-blue-400'    },
  Sports:      { bg: 'bg-orange-50',  text: 'text-orange-700',  border: 'border-orange-200',  dot: 'bg-orange-400'  },
  Science:     { bg: 'bg-purple-50',  text: 'text-purple-700',  border: 'border-purple-200',  dot: 'bg-purple-400'  },
  Attendance:  { bg: 'bg-green-50',   text: 'text-green-700',   border: 'border-green-200',   dot: 'bg-green-400'   },
  Competition: { bg: 'bg-red-50',     text: 'text-red-700',     border: 'border-red-200',     dot: 'bg-red-400'     },
  School:      { bg: 'bg-indigo-50',  text: 'text-indigo-700',  border: 'border-indigo-200',  dot: 'bg-indigo-400'  },
  Arts:        { bg: 'bg-pink-50',    text: 'text-pink-700',    border: 'border-pink-200',    dot: 'bg-pink-400'    },
};

const EMPTY_FORM = {
  title: '',
  description: '',
  category: 'Academic',
  level: 'School',
  badge: '',
  studentId: '',
  awardedOn: '',
};

function Toast({ msg, type }) {
  if (!msg) return null;
  return (
    <div className={`fixed top-5 right-5 z-[999] flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium transition-all
      ${type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-700'}`}>
      {type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
      {msg}
    </div>
  );
}

function AchievementFormModal({ initial, onClose, onSave }) {
  const [form, setForm]     = useState(initial || EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.title.trim())       e.title       = 'Title is required';
    if (!form.description.trim()) e.description = 'Description is required';
    if (!form.category)           e.category    = 'Category is required';
    if (!form.studentId.trim())   e.studentId   = 'Student ID is required';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  const field = (key) => ({
    value: form[key],
    onChange: (e) => {
      setForm((f) => ({ ...f, [key]: e.target.value }));
      setErrors((p) => ({ ...p, [key]: '' }));
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h2 className="text-base font-bold text-gray-900">
            {initial ? 'Edit Achievement' : 'Award New Achievement'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Student ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Student ID <span className="text-red-500">*</span>
            </label>
            <input
              {...field('studentId')}
              placeholder="Enter student user ID"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.studentId && <p className="text-xs text-red-500 mt-1">{errors.studentId}</p>}
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              {...field('title')}
              placeholder="e.g. First Rank in Mathematics Olympiad"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
          </div>

          {/* Category & Level */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                {...field('category')}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
              <select
                {...field('level')}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {LEVELS.map((lvl) => (
                  <option key={lvl} value={lvl}>{lvl}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Badge & Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Badge / Award</label>
              <input
                {...field('badge')}
                placeholder="e.g. Gold Medal"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Awarded On</label>
              <input
                type="date"
                {...field('awardedOn')}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              {...field('description')}
              rows={3}
              placeholder="Describe the achievement..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium disabled:opacity-60 flex items-center gap-2"
            >
              {saving && <Loader2 size={14} className="animate-spin" />}
              {initial ? 'Save Changes' : 'Award Achievement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteModal({ achievement, onClose, onConfirm, deleting }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-sm p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <AlertTriangle size={18} className="text-red-600" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Delete Achievement</h3>
            <p className="text-xs text-gray-500">This action cannot be undone</p>
          </div>
        </div>
        <p className="text-sm text-gray-600 mb-5">
          Are you sure you want to delete <strong className="text-gray-900">"{achievement.title}"</strong>?
          It will be removed from the student's profile immediately.
        </p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium disabled:opacity-60 flex items-center gap-2"
          >
            {deleting && <Loader2 size={14} className="animate-spin" />}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AchievementManagementPage() {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [query, setQuery]               = useState('');
  const [filterCat, setFilterCat]       = useState('All');
  const [toast, setToast]               = useState({ msg: '', type: 'success' });

  const [createModal, setCreateModal]   = useState(false);
  const [editTarget, setEditTarget]     = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting]         = useState(false);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: '', type: 'success' }), 3500);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAchievements();
      setAchievements(Array.isArray(data) ? data : []);
    } catch {
      showToast('Failed to load achievements', 'error');
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (form) => {
    try {
      await createAchievement(form);
      setCreateModal(false);
      showToast('Achievement awarded successfully!');
      load();
    } catch {
      showToast('Failed to award achievement', 'error');
    }
  };

  const handleEdit = async (form) => {
    try {
      await updateAchievement(editTarget.id, form);
      setEditTarget(null);
      showToast('Achievement updated successfully');
      load();
    } catch {
      showToast('Failed to update achievement', 'error');
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteAchievement(deleteTarget.id);
      setDeleteTarget(null);
      showToast('Achievement deleted');
      load();
    } catch {
      showToast('Failed to delete achievement', 'error');
    }
    setDeleting(false);
  };

  const filtered = achievements.filter((a) => {
    const q = query.toLowerCase();
    const matchQuery = a.title?.toLowerCase().includes(q) || a.description?.toLowerCase().includes(q);
    const matchCat   = filterCat === 'All' || a.category === filterCat;
    return matchQuery && matchCat;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Toast msg={toast.msg} type={toast.type} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Trophy className="text-yellow-500" size={22} />
            Achievements Management
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Award and manage student achievements</p>
        </div>
        <button
          onClick={() => setCreateModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-colors"
        >
          <Plus size={16} /> Award Achievement
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total',       value: achievements.length,                                          color: 'bg-yellow-50 text-yellow-700 border-yellow-100' },
          { label: 'Academic',    value: achievements.filter((a) => a.category === 'Academic').length, color: 'bg-blue-50 text-blue-700 border-blue-100'       },
          { label: 'Sports',      value: achievements.filter((a) => a.category === 'Sports').length,   color: 'bg-orange-50 text-orange-700 border-orange-100' },
          { label: 'Competition', value: achievements.filter((a) => a.category === 'Competition').length, color: 'bg-red-50 text-red-700 border-red-100'      },
        ].map((stat) => (
          <div key={stat.label} className={`p-4 rounded-xl border ${stat.color} flex items-center justify-between`}>
            <span className="text-sm font-medium">{stat.label}</span>
            <span className="text-2xl font-bold">{stat.value}</span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search achievements..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {['All', ...CATEGORIES].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCat(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                filterCat === cat
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="text-xs text-gray-400 font-medium">
        {loading ? 'Loading...' : `Showing ${filtered.length} of ${achievements.length} achievements`}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 size={28} className="animate-spin text-blue-500" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400 bg-white border border-gray-100 rounded-2xl">
          <Trophy size={36} className="mb-3 opacity-30" />
          <p className="text-sm">
            {achievements.length === 0 ? 'No achievements awarded yet. Start awarding students!' : 'No results match your filters.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((achievement) => {
            const colors = CATEGORY_COLORS[achievement.category] || CATEGORY_COLORS.Academic;
            const formattedDate = achievement.awardedOn
              ? new Date(achievement.awardedOn).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
              : new Date(achievement.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

            return (
              <div
                key={achievement.id}
                className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-all flex items-start gap-4 group"
              >
                {/* Category accent */}
                <div className={`mt-0.5 w-1.5 h-16 rounded-full shrink-0 ${colors.dot}`} />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colors.bg} ${colors.text} ${colors.border}`}>
                      <Tag size={10} /> {achievement.category}
                    </span>
                    {achievement.level && (
                      <span className="text-xs font-medium text-gray-500 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">
                        {achievement.level}
                      </span>
                    )}
                    {achievement.badge && (
                      <span className="text-xs font-medium text-yellow-700 bg-yellow-50 border border-yellow-100 px-2 py-0.5 rounded-md">
                        🏅 {achievement.badge}
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-xs text-gray-400 ml-auto">
                      <Calendar size={11} /> {formattedDate}
                    </span>
                  </div>
                  <h2 className="text-sm font-semibold text-gray-900 group-hover:text-blue-700 transition-colors mb-1">
                    {achievement.title}
                  </h2>
                  <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{achievement.description}</p>
                  {achievement.studentId && (
                    <div className="mt-2 flex items-center gap-1.5 text-xs text-gray-400">
                      <Users size={11} />
                      <span>Student ID: <span className="font-mono text-gray-600">{achievement.studentId}</span></span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setEditTarget(achievement)}
                    className="p-2 rounded-lg text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    title="Edit"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(achievement)}
                    className="p-2 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      {createModal && (
        <AchievementFormModal onClose={() => setCreateModal(false)} onSave={handleCreate} />
      )}

      {/* Edit Modal */}
      {editTarget && (
        <AchievementFormModal
          initial={{
            title: editTarget.title,
            description: editTarget.description,
            category: editTarget.category,
            level: editTarget.level || 'School',
            badge: editTarget.badge || '',
            studentId: editTarget.studentId || '',
            awardedOn: editTarget.awardedOn ? editTarget.awardedOn.split('T')[0] : '',
          }}
          onClose={() => setEditTarget(null)}
          onSave={handleEdit}
        />
      )}

      {/* Delete Confirm Modal */}
      {deleteTarget && (
        <DeleteModal
          achievement={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          deleting={deleting}
        />
      )}
    </div>
  );
}
