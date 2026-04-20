import React, { useEffect, useState } from 'react';
import { Plus, CalendarOff, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/core/context/AuthContext';
import {
  getLeaveApplications,
  getLeaveApplicationsForTeacher,
  approveLeave,
  rejectLeave,
} from '@/modules/leave/services/leaveFirebaseService';
import teachersData from '@/data/teachers.json';

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

export default function LeaveListPage() {
  const navigate = useNavigate();
  const { canApproveLeave, user } = useAuth();
  const canApprove = canApproveLeave;
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [actionId, setActionId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      if (canApprove) {
        setLeaves(await getLeaveApplications());
      } else {
        const teacher = teachersData.find(
          (t) => t.name === user?.displayName || t.email === user?.email
        );
        if (teacher) {
          setLeaves(await getLeaveApplicationsForTeacher(teacher.id));
        }
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { load(); }, [canApprove]);

  const handleApprove = async (id) => {
    setActionId(id);
    await approveLeave(id, user?.uid);
    await load();
    setActionId(null);
  };

  const handleReject = async (id) => {
    const remarks = window.prompt('Reason for rejection (optional):') ?? '';
    setActionId(id);
    await rejectLeave(id, user?.uid, remarks);
    await load();
    setActionId(null);
  };

  const filtered = filterStatus === 'all'
    ? leaves
    : leaves.filter((l) => l.status === filterStatus);

  const pendingCount = leaves.filter((l) => l.status === 'pending').length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leave Management</h1>
          <p className="text-sm text-gray-500 mt-1">
            {canApprove ? 'Review and manage teacher leave applications' : 'Your leave applications'}
          </p>
        </div>
        <button
          onClick={() => navigate('/leave/apply')}
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          <Plus size={16} /> Apply for Leave
        </button>
      </div>

      {canApprove && pendingCount > 0 && (
        <div className="mb-4 flex items-center gap-3 bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 text-sm text-yellow-800">
          <Clock size={16} className="shrink-0" />
          <span><strong>{pendingCount}</strong> leave application{pendingCount > 1 ? 's' : ''} awaiting your approval.</span>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="flex items-center gap-3 p-4 border-b border-gray-100">
          {['all', 'pending', 'approved', 'rejected'].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === s
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
              }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
              {s === 'pending' && pendingCount > 0 && (
                <span className="ml-1.5 bg-yellow-400 text-white text-xs rounded-full px-1.5 py-0.5">
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <CalendarOff size={32} className="mx-auto mb-2 opacity-40" />
            <div className="text-sm">No leave applications found</div>
          </div>
        ) : (
          <div className="divide-y">
            {filtered.map((leave) => {
              const teacher = teachersData.find((t) => t.id === leave.teacherId);
              const submittedAt = leave.submittedAt?.toDate
                ? leave.submittedAt.toDate()
                : leave.submittedAt ? new Date(leave.submittedAt) : null;

              return (
                <div key={leave.id} className="px-5 py-4 flex items-start gap-4">
                  <div className="w-9 h-9 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center text-sm font-semibold shrink-0">
                    {(teacher?.name || leave.teacherName || 'T')[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-gray-900 text-sm">
                        {teacher?.name || leave.teacherName || 'Unknown Teacher'}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${LEAVE_TYPE_CLS[leave.leaveType] || 'bg-gray-50 text-gray-600'}`}>
                        {leave.leaveType?.charAt(0).toUpperCase() + leave.leaveType?.slice(1)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {leave.startDate} → {leave.endDate}
                      {submittedAt && (
                        <span className="ml-2 text-gray-400">
                          · Applied {submittedAt.toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    {leave.reason && (
                      <div className="text-xs text-gray-500 mt-1 line-clamp-1">
                        {leave.reason}
                      </div>
                    )}
                    {leave.status === 'rejected' && leave.remarks && (
                      <div className="text-xs text-red-500 mt-1">Rejected: {leave.remarks}</div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <StatusBadge status={leave.status} />
                    {canApprove && leave.status === 'pending' && (
                      <>
                        <button
                          disabled={actionId === leave.id}
                          onClick={() => handleApprove(leave.id)}
                          className="flex items-center gap-1 text-xs text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 px-2.5 py-1 rounded"
                        >
                          <CheckCircle2 size={12} /> Approve
                        </button>
                        <button
                          disabled={actionId === leave.id}
                          onClick={() => handleReject(leave.id)}
                          className="flex items-center gap-1 text-xs text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 px-2.5 py-1 rounded"
                        >
                          <XCircle size={12} /> Reject
                        </button>
                      </>
                    )}
                    {leave.status === 'approved' && canApprove && (
                      <button
                        onClick={() => navigate(`/leave/${leave.id}/proxy`)}
                        className="text-xs text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2.5 py-1 rounded"
                      >
                        Assign Proxy
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
