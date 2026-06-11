import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarOff, Info } from 'lucide-react';
import { submitLeaveApplication, getLeaveApplicationsForStudent } from '@/modules/leave/services/leaveService';

const LEAVE_TYPES = ['sick', 'casual', 'emergency', 'other'];

const STATUS_CONFIG = {
  pending: { label: 'Pending', cls: 'bg-yellow-100 text-yellow-700' },
  approved: { label: 'Approved', cls: 'bg-green-100 text-green-700' },
  rejected: { label: 'Rejected', cls: 'bg-red-100 text-red-700' },
};

const LEAVE_TYPE_CLS = {
  sick: 'bg-red-50 text-red-600',
  casual: 'bg-blue-50 text-blue-600',
  emergency: 'bg-orange-50 text-orange-600',
  other: 'bg-gray-50 text-gray-600',
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}

export default function StudentLeavePage() {
  const [leaveType, setLeaveType] = useState('sick');
  const [leaveDuration, setLeaveDuration] = useState('FULL_DAY');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  
  const [leaves, setLeaves] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

  const today = new Date().toISOString().split('T')[0];

  const loadHistory = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const data = await getLeaveApplicationsForStudent();
      setLeaves(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load leave history', err);
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const isWeekend = (dateStr) => {
    const day = new Date(dateStr).getDay();
    return day === 0 || day === 6;
  };

  const validate = () => {
    const e = {};
    if (!startDate) e.startDate = 'Start date is required';
    if (!endDate && leaveDuration === 'FULL_DAY') e.endDate = 'End date is required';
    
    if (leaveDuration === 'HALF_DAY') {
      if (startDate !== endDate && endDate) {
        e.endDate = 'Half-day leave must be for a single date';
      }
    }

    if (startDate && startDate < today) e.startDate = 'Start date cannot be in the past';
    if (startDate && isWeekend(startDate)) e.startDate = 'Leave cannot start on a weekend';
    if (endDate && isWeekend(endDate)) e.endDate = 'Leave cannot end on a weekend';
    if (startDate && endDate && endDate < startDate) e.endDate = 'End date must be on or after start date';

    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    const errs = validate();
    if (Object.keys(errs).length > 0) { 
      setErrors(errs); 
      return; 
    }

    setSaving(true);
    try {
      await submitLeaveApplication({
        leaveType,
        leaveDuration,
        startDate,
        endDate: leaveDuration === 'HALF_DAY' ? startDate : endDate,
        reason: reason.trim(),
      });
      
      // Reset form
      setLeaveType('sick');
      setLeaveDuration('FULL_DAY');
      setStartDate('');
      setEndDate('');
      setReason('');
      
      // Refresh history
      loadHistory();
    } catch (err) {
      console.error(err);
      setSubmitError(err.message || 'Failed to submit leave application.');
    }
    setSaving(false);
  };

  const err = (field) =>
    errors[field] ? <p className="text-xs text-red-500 mt-1">{errors[field]}</p> : null;

  const filtered = filterStatus === 'all'
    ? leaves
    : leaves.filter((l) => l.status === filterStatus);

  return (
    <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
      {/* Leave Application Form */}
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Apply for Leave</h1>
          <p className="text-sm text-gray-500 mt-1">Submit a leave request for administrator/principal approval</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5 shadow-sm">
          {submitError && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {submitError}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 text-center">Leave Duration</label>
            <div className="flex bg-gray-100 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => { setLeaveDuration('FULL_DAY'); setEndDate(''); }}
                className={`flex-1 py-2 rounded-md text-xs font-bold transition-all ${
                  leaveDuration === 'FULL_DAY' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Full Day
              </button>
              <button
                type="button"
                onClick={() => { 
                  setLeaveDuration('HALF_DAY'); 
                  if (startDate) setEndDate(startDate); 
                }}
                className={`flex-1 py-2 rounded-md text-xs font-bold transition-all ${
                  leaveDuration === 'HALF_DAY' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Half Day
              </button>
            </div>
          </div>

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
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
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
                {leaveDuration === 'HALF_DAY' ? 'Date' : 'Start Date'} <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={startDate}
                min={today}
                onChange={(e) => { 
                  setStartDate(e.target.value); 
                  if (leaveDuration === 'HALF_DAY') setEndDate(e.target.value);
                  setErrors((p) => ({ ...p, startDate: '' })); 
                }}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {err('startDate')}
            </div>
            {leaveDuration === 'FULL_DAY' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={endDate}
                  min={startDate || today}
                  onChange={(e) => { setEndDate(e.target.value); setErrors((p) => ({ ...p, endDate: '' })); }}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {err('endDate')}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason (optional)</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="Briefly describe the reason for your leave..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none resize-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-[10px] text-blue-800 flex gap-2 items-start">
            <Info size={14} className="shrink-0 mt-0.5" />
            <p>
              Your leave application will be reviewed by the administration.
            </p>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium disabled:opacity-60 shadow-md transition-colors"
            >
              {saving ? 'Submitting...' : 'Submit Leave Application'}
            </button>
          </div>
        </form>
      </div>

      {/* Leave History Section */}
      <div>
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Leave History</h2>
            <p className="text-sm text-gray-500 mt-1">Track your past leave applications</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="flex items-center gap-2 p-4 border-b border-gray-100 flex-wrap">
            {['all', 'pending', 'approved', 'rejected'].map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  filterStatus === s
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>

          {loadingHistory ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <CalendarOff size={32} className="mx-auto mb-2 opacity-40" />
              <div className="text-sm">No leave applications found</div>
            </div>
          ) : (
            <div className="divide-y max-h-[500px] overflow-y-auto">
              {filtered.map((leave) => {
                const submittedAt = leave.submittedAt?.toDate
                  ? leave.submittedAt.toDate()
                  : leave.submittedAt ? new Date(leave.submittedAt) : null;

                return (
                  <div key={leave.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${LEAVE_TYPE_CLS[leave.leaveType] || 'bg-gray-50 text-gray-600'}`}>
                          {leave.leaveType}
                        </span>
                        {leave.leaveDuration && (
                          <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded uppercase tracking-wider">
                            {leave.leaveDuration === 'HALF_DAY' ? 'Half Day' : 'Full Day'}
                          </span>
                        )}
                      </div>
                      <StatusBadge status={leave.status} />
                    </div>
                    
                    <div className="text-sm font-medium text-gray-900 mb-1">
                      {leave.startDate} {leave.startDate !== leave.endDate ? `→ ${leave.endDate}` : ''}
                    </div>
                    
                    {leave.reason && (
                      <div className="text-xs text-gray-600 mb-2">
                        {leave.reason}
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-50">
                      {submittedAt && (
                        <div className="text-[10px] text-gray-400">
                          Applied: {submittedAt.toLocaleDateString()}
                        </div>
                      )}
                      
                      {leave.remarks && (
                        <div className={`text-[10px] font-medium ${leave.status === 'approved' ? 'text-green-600' : leave.status === 'rejected' ? 'text-red-600' : 'text-gray-500'}`}>
                          Remark: {leave.remarks}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
