import { useState, useEffect, useCallback } from 'react';
import {
  Mail, Plus, Search, Pencil, Trash2, X, Loader2,
  Calendar, Tag, AlertTriangle, CheckCircle2, User
} from 'lucide-react';
import {
  getMailboxMessages, createMailboxMessage, updateMailboxMessage, deleteMailboxMessage,
} from '@/modules/mailbox/services/mailboxService';

const CATEGORIES = ['General', 'Examination', 'Accounts', 'Sports', 'Library', 'Principal Office'];

const CATEGORY_COLORS = {
  General:          { bg: 'bg-gray-50',    text: 'text-gray-700',    border: 'border-gray-200' },
  Examination:      { bg: 'bg-red-50',     text: 'text-red-700',     border: 'border-red-200' },
  Accounts:         { bg: 'bg-green-50',   text: 'text-green-700',   border: 'border-green-200' },
  Sports:           { bg: 'bg-orange-50',  text: 'text-orange-700',  border: 'border-orange-200' },
  Library:          { bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-200' },
  'Principal Office': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
};

const EMPTY_FORM = { title: '', message: '', category: 'General' };

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

function MailboxFormModal({ initial, onClose, onSave }) {
  const [form, setForm] = useState(initial || EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.title.trim())       e.title       = 'Title is required';
    if (!form.message.trim())     e.message     = 'Message is required';
    if (!form.category)           e.category    = 'Category is required';
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">
            {initial ? 'Edit Notice' : 'New Notice'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              value={form.title}
              onChange={e => { setForm(f => ({ ...f, title: e.target.value })); setErrors(p => ({ ...p, title: '' })); }}
              placeholder="e.g. Welcome to New Academic Session"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              value={form.category}
              onChange={e => { setForm(f => ({ ...f, category: e.target.value })); setErrors(p => ({ ...p, category: '' })); }}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message <span className="text-red-500">*</span>
            </label>
            <textarea
              value={form.message}
              onChange={e => { setForm(f => ({ ...f, message: e.target.value })); setErrors(p => ({ ...p, message: '' })); }}
              rows={5}
              placeholder="Write the mailbox notice here..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            {errors.message && <p className="text-xs text-red-500 mt-1">{errors.message}</p>}
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
              {initial ? 'Save Changes' : 'Send to All Students'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteModal({ item, onClose, onConfirm, deleting }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-sm p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <AlertTriangle size={18} className="text-red-600" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Delete Notice</h3>
            <p className="text-xs text-gray-500">This action cannot be undone</p>
          </div>
        </div>
        <p className="text-sm text-gray-600 mb-5">
          Are you sure you want to delete <strong className="text-gray-900">"{item.title}"</strong>?
          It will be removed from all student mailboxes.
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

export default function MailboxManagementPage() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [query, setQuery]         = useState('');
  const [filterCat, setFilterCat] = useState('All');
  const [toast, setToast]         = useState({ msg: '', type: 'success' });

  const [createModal, setCreateModal] = useState(false);
  const [editTarget, setEditTarget]   = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting]         = useState(false);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: '', type: 'success' }), 3500);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getMailboxMessages();
      setMessages(Array.isArray(data) ? data : []);
    } catch {
      showToast('Failed to load mailbox messages', 'error');
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (form) => {
    try {
      await createMailboxMessage(form);
      setCreateModal(false);
      showToast('Message sent to all students successfully');
      load();
    } catch {
      showToast('Failed to send message', 'error');
    }
  };

  const handleEdit = async (form) => {
    try {
      await updateMailboxMessage(editTarget.id, form);
      setEditTarget(null);
      showToast('Message updated successfully');
      load();
    } catch {
      showToast('Failed to update message', 'error');
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteMailboxMessage(deleteTarget.id);
      setDeleteTarget(null);
      showToast('Message deleted');
      load();
    } catch {
      showToast('Failed to delete message', 'error');
    }
    setDeleting(false);
  };

  const filtered = messages.filter(m => {
    const q = query.toLowerCase();
    const matchQuery = m.title.toLowerCase().includes(q) || m.message.toLowerCase().includes(q) || m.senderName.toLowerCase().includes(q);
    const matchCat   = filterCat === 'All' || m.category === filterCat;
    return matchQuery && matchCat;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Toast msg={toast.msg} type={toast.type} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Mail className="text-blue-600" size={22} />
            Mailbox Management
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage notices and messages sent to students</p>
        </div>
        <button
          onClick={() => setCreateModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-colors"
        >
          <Plus size={16} /> New Notice
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search messages..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {['All', ...CATEGORIES].map(cat => (
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

      {/* Stats row */}
      <div className="text-xs text-gray-400 font-medium">
        {loading ? 'Loading...' : `Showing ${filtered.length} of ${messages.length} messages`}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 size={28} className="animate-spin text-blue-500" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400 bg-white border border-gray-100 rounded-2xl">
          <Mail size={36} className="mb-3 opacity-30" />
          <p className="text-sm">{messages.length === 0 ? 'No messages sent yet. Create the first one!' : 'No results match your filters.'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(message => {
            const colors = CATEGORY_COLORS[message.category] || CATEGORY_COLORS.General;
            const formattedDate = new Date(message.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
            });

            return (
              <div
                key={message.id}
                className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-all flex items-start gap-4 group"
              >
                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <User size={20} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-semibold text-sm text-gray-900">{message.senderName}</span>
                    <span className="text-xs text-gray-400">({message.senderRole})</span>
                    <span className="flex items-center gap-1 text-xs text-gray-400 ml-auto">
                      <Calendar size={11} /> {formattedDate}
                    </span>
                  </div>
                  <h2 className="text-sm font-semibold text-gray-900 group-hover:text-blue-700 transition-colors mb-1">
                    {message.title}
                  </h2>
                  <div className="mb-2">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold border ${colors.bg} ${colors.text} ${colors.border}`}>
                      {message.category}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{message.message}</p>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setEditTarget(message)}
                    className="p-2 rounded-lg text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    title="Edit"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(message)}
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
        <MailboxFormModal onClose={() => setCreateModal(false)} onSave={handleCreate} />
      )}

      {/* Edit Modal */}
      {editTarget && (
        <MailboxFormModal
          initial={{ title: editTarget.title, message: editTarget.message, category: editTarget.category }}
          onClose={() => setEditTarget(null)}
          onSave={handleEdit}
        />
      )}

      {/* Delete Confirm Modal */}
      {deleteTarget && (
        <DeleteModal
          item={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          deleting={deleting}
        />
      )}
    </div>
  );
}
