import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Send, 
  Trash2, 
  Edit2, 
  MessageSquare, 
  Star, 
  AlertCircle, 
  ThumbsUp, 
  Info,
  ChevronDown,
  X
} from 'lucide-react';
import { feedbackService } from '../services/feedbackService';
import { apiRequest } from '@/core/api/client';
import { API_ENDPOINTS } from '@/core/api/endpoints';

const FEEDBACK_TYPES = [
  { value: 'appreciation', label: 'Appreciation', icon: ThumbsUp, color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  { value: 'warning', label: 'Warning', icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200' },
  { value: 'suggestion', label: 'Suggestion', icon: Info, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-200' },
  { value: 'general', label: 'General Feedback', icon: MessageSquare, color: 'text-gray-500', bg: 'bg-gray-50', border: 'border-gray-200' },
];

export default function PrincipalFeedbackPage() {
  const [teachers, setTeachers] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({
    teacherId: '',
    type: 'general',
    title: '',
    message: '',
    rating: 5
  });

  const loadData = async () => {
    setLoading(true);
    try {
      console.log('[DEBUG] Fetching teachers...');
      const teachersList = await feedbackService.getFeedbackTeachers();
      console.log('[DEBUG] Teachers response:', teachersList);
      setTeachers(teachersList || []);

      console.log('[DEBUG] Fetching sent feedback...');
      const sentFeedbacks = await feedbackService.getSentFeedback();
      console.log('[DEBUG] Sent feedback response:', sentFeedbacks);
      setFeedbacks(sentFeedbacks || []);
    } catch (error) {
      console.error('Failed to load feedback data', error);
      alert('Error loading feedback data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await feedbackService.updateFeedback(editingId, formData);
      } else {
        await feedbackService.createFeedback(formData);
      }
      setShowForm(false);
      setEditingId(null);
      setFormData({ teacherId: '', type: 'general', title: '', message: '', rating: 5 });
      loadData();
    } catch (error) {
      alert('Failed to save feedback');
    }
  };

  const handleEdit = (fb) => {
    setFormData({
      teacherId: fb.teacherId,
      type: fb.type,
      title: fb.title,
      message: fb.message,
      rating: fb.rating || 5
    });
    setEditingId(fb.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this feedback?')) {
      try {
        await feedbackService.deleteFeedback(id);
        loadData();
      } catch (error) {
        alert('Failed to delete feedback');
      }
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Teacher Feedback & Appreciation</h1>
          <p className="text-sm text-gray-500 mt-1">Send appreciation or feedback to your teaching staff</p>
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingId(null);
            setFormData({ teacherId: '', type: 'general', title: '', message: '', rating: 5 });
          }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={16} /> New Feedback
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-gray-900">{editingId ? 'Edit Feedback' : 'Create Feedback'}</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Select Teacher</label>
                <select
                  required
                  value={formData.teacherId}
                  onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  <option value="">
                    {loading ? 'Loading teachers...' : teachers.length === 0 ? 'No teachers found' : 'Choose a teacher...'}
                  </option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Feedback Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    {FEEDBACK_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Rating (1-5)</label>
                  <div className="flex items-center gap-2 h-[42px]">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFormData({ ...formData, rating: star })}
                        className={`transition-colors ${star <= formData.rating ? 'text-amber-400' : 'text-gray-200'}`}
                      >
                        <Star size={20} fill={star <= formData.rating ? 'currentColor' : 'none'} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Title</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Excellent Work on Annual Day"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Message</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Provide detailed feedback here..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Send size={16} /> {editingId ? 'Update Feedback' : 'Send Feedback'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-48 bg-white rounded-xl border border-gray-100 animate-pulse" />
          ))}
        </div>
      ) : feedbacks.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
          <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare size={32} />
          </div>
          <h3 className="text-lg font-bold text-gray-900">No feedback sent yet</h3>
          <p className="text-gray-500 mt-1 max-w-xs mx-auto">Start by sending appreciation or constructive feedback to your teachers.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {feedbacks.map((fb) => {
            const config = FEEDBACK_TYPES.find(t => t.value === fb.type) || FEEDBACK_TYPES[3];
            const Icon = config.icon;
            return (
              <div key={fb.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow group">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-2 rounded-lg ${config.bg} ${config.color}`}>
                    <Icon size={20} />
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEdit(fb)} className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(fb.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${config.bg} ${config.color}`}>
                    {config.label}
                  </span>
                  <div className="flex items-center gap-0.5 text-amber-400">
                    {[...Array(fb.rating || 0)].map((_, i) => <Star key={i} size={10} fill="currentColor" />)}
                  </div>
                </div>

                <h3 className="font-bold text-gray-900 mb-1">{fb.title}</h3>
                <p className="text-sm text-gray-600 line-clamp-2 mb-4">{fb.message}</p>
                
                <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-bold">
                      {fb.teacher?.name?.[0]}
                    </div>
                    <span className="text-xs font-medium text-gray-700">{fb.teacher?.name}</span>
                  </div>
                  <span className="text-[10px] text-gray-400 font-medium">
                    {new Date(fb.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
