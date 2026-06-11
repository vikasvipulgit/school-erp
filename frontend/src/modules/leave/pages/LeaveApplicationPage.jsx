import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Info } from 'lucide-react';
import { useAuth } from '@/core/context/AuthContext';
import { submitLeaveApplication, getLeaveStats } from '@/modules/leave/services/leaveService';
import { useTeachers } from '@/core/hooks/useTeachers';

const LEAVE_TYPES = ['sick', 'casual', 'emergency', 'other'];

export default function LeaveApplicationPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { teachers } = useTeachers();

  const teacher = teachers.find(
    (t) => t.name === user?.displayName || t.email === user?.email
  );

  const [leaveType, setLeaveType] = useState('sick');
  const [leaveDuration, setLeaveDuration] = useState('FULL_DAY');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    async function fetchStats() {
      try {
        const data = await getLeaveStats();
        setStats(data);
      } catch (err) {
        console.error('Failed to fetch leave stats', err);
      } finally {
        setStatsLoading(false);
      }
    }
    fetchStats();
  }, []);

  const isWeekend = (dateStr) => {
    const day = new Date(dateStr).getDay();
    return day === 0 || day === 6;
  };

  const calculateDeduction = () => {
    if (leaveDuration === 'HALF_DAY') return 0.5;
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && end >= start) {
        const diffTime = end.getTime() - start.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays + 1;
      }
    }
    return 1;
  };

  const validate = () => {
    const e = {};
    if (!startDate) e.startDate = 'Start date is required';
    if (!endDate) e.endDate = 'End date is required';
    
    if (leaveDuration === 'HALF_DAY') {
      if (startDate !== endDate) {
        e.endDate = 'Half-day leave must be for a single date';
      }
    }

    if (startDate && startDate < today) e.startDate = 'Start date cannot be in the past';
    if (startDate && isWeekend(startDate)) e.startDate = 'Leave cannot start on a weekend';
    if (endDate && isWeekend(endDate)) e.endDate = 'Leave cannot end on a weekend';
    if (startDate && endDate && endDate < startDate) e.endDate = 'End date must be on or after start date';
    
    const deduction = calculateDeduction();
    if (stats && stats.remainingLeaves < deduction) {
      e.submit = 'Insufficient leave balance';
    }

    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    const errs = validate();
    if (Object.keys(errs).length > 0) { 
      setErrors(errs); 
      if (errs.submit) setSubmitError(errs.submit);
      return; 
    }

    setSaving(true);
    try {
      await submitLeaveApplication({
        leaveType,
        leaveDuration,
        startDate,
        endDate,
        reason: reason.trim(),
      });
      navigate('/leave');
    } catch (err) {
      console.error(err);
      setSubmitError(err.message || 'Failed to submit leave application.');
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

      {/* Stats Card */}
      {!statsLoading && stats && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6 grid grid-cols-3 gap-4 shadow-sm">
          <div className="text-center">
            <div className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-1">Total</div>
            <div className="text-xl font-bold text-gray-900">{stats.totalLeaves}</div>
          </div>
          <div className="text-center border-x border-gray-100">
            <div className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-1">Used</div>
            <div className="text-xl font-bold text-orange-600">{stats.usedLeaves}</div>
          </div>
          <div className="text-center">
            <div className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-1">Remaining</div>
            <div className="text-xl font-bold text-emerald-600">{stats.remainingLeaves}</div>
          </div>
          <div className="col-span-3 mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-500" 
              style={{ width: `${(stats.usedLeaves / stats.totalLeaves) * 100}%` }}
            />
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
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
              Half Day (0.5)
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
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
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
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
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
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none resize-none"
          />
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 text-[10px] text-yellow-800 flex gap-2 items-start">
          <Info size={14} className="shrink-0 mt-0.5" />
          <p>
            Your leave application will be reviewed by the Administrator or Principal.
            {leaveDuration === 'HALF_DAY' ? ' Half-day leave will deduct 0.5 from your balance.' : ` This leave will deduct ${calculateDeduction()} days from your balance.`}
          </p>
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
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-medium disabled:opacity-60 shadow-md shadow-emerald-500/20"
          >
            {saving ? 'Submitting...' : 'Submit Application'}
          </button>
        </div>
      </form>
    </div>
  );
}
