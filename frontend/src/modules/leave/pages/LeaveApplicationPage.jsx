import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/core/context/AuthContext';
import { submitLeaveApplication } from '@/modules/leave/services/leaveFirebaseService';
import teachersData from '@/data/teachers.json';

const LEAVE_TYPES = ['sick', 'casual', 'emergency', 'other'];

export default function LeaveApplicationPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const teacher = teachersData.find(
    (t) => t.name === user?.displayName || t.email === user?.email
  );

  const [leaveType, setLeaveType] = useState('sick');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const today = new Date().toISOString().split('T')[0];

  const validate = () => {
    const e = {};
    if (!startDate) e.startDate = 'Start date is required';
    if (!endDate) e.endDate = 'End date is required';
    if (startDate && endDate && endDate < startDate) e.endDate = 'End date must be on or after start date';
    if (startDate && startDate < today) e.startDate = 'Start date cannot be in the past';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setSaving(true);
    try {
      await submitLeaveApplication({
        teacherId: teacher?.id || user?.uid,
        teacherName: user?.displayName || user?.email,
        leaveType,
        startDate,
        endDate,
        reason: reason.trim(),
      });
      navigate('/leave');
    } catch (err) {
      console.error(err);
    }
    setSaving(false);
  };

  const err = (field) =>
    errors[field] ? <p className="text-xs text-red-500 mt-1">{errors[field]}</p> : null;

  return (
    <div className="max-w-xl mx-auto">
      <button
        onClick={() => navigate('/leave')}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-5"
      >
        <ArrowLeft size={16} /> Back to Leave
      </button>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Apply for Leave</h1>
        <p className="text-sm text-gray-500 mt-1">Submit a leave request for administrator approval</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        {teacher && (
          <div className="flex items-center gap-3 bg-gray-50 rounded-lg px-4 py-3">
            <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-semibold text-sm">
              {teacher.name[0]}
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900">{teacher.name}</div>
              <div className="text-xs text-gray-400">{teacher.subject}</div>
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Leave Type</label>
          <div className="grid grid-cols-2 gap-2">
            {LEAVE_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setLeaveType(type)}
                className={`py-2.5 rounded-lg text-sm font-medium border transition-colors capitalize ${
                  leaveType === type
                    ? 'bg-emerald-500 text-white border-emerald-500'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-emerald-300'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={startDate}
              min={today}
              onChange={(e) => { setStartDate(e.target.value); setErrors((p) => ({ ...p, startDate: '' })); }}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
            {err('startDate')}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={endDate}
              min={startDate || today}
              onChange={(e) => { setEndDate(e.target.value); setErrors((p) => ({ ...p, endDate: '' })); }}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
            {err('endDate')}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Reason (optional)</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            placeholder="Briefly describe the reason for your leave..."
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none resize-none"
          />
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 text-xs text-yellow-800">
          Your leave application will be reviewed by the Administrator or Principal.
          You will be notified once a decision is made.
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/leave')}
            className="px-5 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-medium disabled:opacity-60"
          >
            {saving ? 'Submitting...' : 'Submit Application'}
          </button>
        </div>
      </form>
    </div>
  );
}
