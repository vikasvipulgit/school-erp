import React, { useEffect, useState, useCallback } from 'react';
import { Plus, CalendarOff, CheckCircle2, XCircle, Clock, AlertCircle, UserCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/core/context/AuthContext';
import {
  getLeaveApplications, getLeaveApplicationsForTeacher, approveLeave, rejectLeave,
} from '@/modules/leave/services/leaveService';

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
  const { canApproveLeave, user, role } = useAuth();
  const canApprove = canApproveLeave;
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState('teacher'); // 'teacher' or 'student'
  const [filterStatus, setFilterStatus] = useState('all');
  
  const [actionId, setActionId] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [approveModal, setApproveModal] = useState(null); // leave id being approved
  const [approveRemarks, setApproveRemarks] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      if (canApprove) {
        const data = await getLeaveApplications();
        setLeaves(Array.isArray(data) ? data : []);
      } else {
        const data = await getLeaveApplicationsForTeacher();
        setLeaves(Array.isArray(data) ? data : []);
      }
    } catch (e) { console.error(e); setLeaves([]); }
    setLoading(false);
  }, [canApprove]);

  useEffect(() => { load(); }, [load]);

  const handleApprove = (id) => {
    setApproveRemarks('');
    setApproveModal(id);
  };

  const confirmApprove = async () => {
    setActionId(approveModal);
    setApproveModal(null);
    await approveLeave(approveModal, user?.uid, approveRemarks.trim());
    await load();
    setActionId(null);
  };

  const handleReject = (id) => {
    setRejectReason('');
    setRejectModal(id);
  };

  const confirmReject = async () => {
    setActionId(rejectModal);
    setRejectModal(null);
    await rejectLeave(rejectModal, user?.uid, rejectReason.trim());
    await load();
    setActionId(null);
  };

  // Split leaves by type
  const teacherLeaves = leaves.filter(l => l.leaveOwnerType !== 'student');
  const studentLeaves = leaves.filter(l => l.leaveOwnerType === 'student');

  const currentTypeLeaves = canApprove ? (activeTab === 'teacher' ? teacherLeaves : studentLeaves) : teacherLeaves;

  const filtered = filterStatus === 'all'
    ? currentTypeLeaves
    : currentTypeLeaves.filter((l) => l.status === filterStatus);

  const pendingCount = currentTypeLeaves.filter((l) => l.status === 'pending').length;
  
  const totalPendingTeacher = teacherLeaves.filter(l => l.status === 'pending').length;
  const totalPendingStudent = studentLeaves.filter(l => l.status === 'pending').length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leave Management</h1>
          <p className="text-sm text-gray-500 mt-1">
            {canApprove ? 'Review and manage leave applications' : 'Your leave applications'}
          </p>
        </div>
        {!canApprove && (
          <button
            onClick={() => navigate('/leave/apply')}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            <Plus size={16} /> Apply for Leave
          </button>
        )}
      </div>

      {canApprove && (totalPendingTeacher > 0 || totalPendingStudent > 0) && (
        <div className="mb-4 flex items-center gap-3 bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 text-sm text-yellow-800">
          <Clock size={16} className="shrink-0" />
          <span>
            <strong>{totalPendingTeacher + totalPendingStudent}</strong> leave application{(totalPendingTeacher + totalPendingStudent) > 1 ? 's' : ''} awaiting your approval
            {totalPendingStudent > 0 && ` (${totalPendingTeacher} Teacher, ${totalPendingStudent} Student)`}.
          </span>
        </div>
      )}

      {canApprove && (
        <div className="flex gap-4 mb-4 border-b border-gray-200">
          <button
            onClick={() => { setActiveTab('teacher'); setFilterStatus('all'); }}
            className={`pb-2.5 px-2 text-sm font-medium transition-colors relative ${
              activeTab === 'teacher' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Teacher Leaves
            {totalPendingTeacher > 0 && (
              <span className="ml-2 bg-yellow-100 text-yellow-700 py-0.5 px-2 rounded-full text-[10px] font-bold">
                {totalPendingTeacher}
              </span>
            )}
            {activeTab === 'teacher' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 rounded-t-full" />}
          </button>
          <button
            onClick={() => { setActiveTab('student'); setFilterStatus('all'); }}
            className={`pb-2.5 px-2 text-sm font-medium transition-colors relative ${
              activeTab === 'student' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Student Leaves
            {totalPendingStudent > 0 && (
              <span className="ml-2 bg-yellow-100 text-yellow-700 py-0.5 px-2 rounded-full text-[10px] font-bold">
                {totalPendingStudent}
              </span>
            )}
            {activeTab === 'student' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 rounded-t-full" />}
          </button>
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
              const isStudent = leave.leaveOwnerType === 'student';
              const applicantName = isStudent 
                ? (leave.studentName || leave.student?.full_name || leave.student?.name || 'Unknown Student')
                : (leave.teacherName || leave.teacher?.full_name || leave.teacher?.name || 'Unknown Teacher');
                
              const applicantCode = isStudent
                ? (leave.student?.studentId || 'N/A')
                : (leave.teacher?.id || 'N/A');

              const submittedAt = leave.submittedAt?.toDate
                ? leave.submittedAt.toDate()
                : leave.submittedAt ? new Date(leave.submittedAt) : null;

              return (
                <div key={leave.id} className="px-5 py-4 flex items-start gap-4">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 ${isStudent ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                    {applicantName[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-medium text-gray-900 text-sm">
                        {applicantName}
                      </span>
                      
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider ${isStudent ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-orange-50 text-orange-700 border border-orange-200'}`}>
                        {isStudent ? 'Student Leave' : 'Teacher Leave'}
                      </span>
                      
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${LEAVE_TYPE_CLS[leave.leaveType] || 'bg-gray-50 text-gray-600'}`}>
                        {leave.leaveType}
                      </span>
                      
                      {leave.leaveDuration && (
                        <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded uppercase tracking-wider">
                          {leave.leaveDuration === 'HALF_DAY' ? 'Half Day' : 'Full Day'}
                          {!isStudent && leave.deductedLeaves && ` (${Number(leave.deductedLeaves)})`}
                        </span>
                      )}
                    </div>
                    
                    {isStudent && leave.student?.className && (
                      <div className="text-xs text-gray-500 mb-1">
                        Class: <span className="font-medium">{leave.student.className} {leave.student.section}</span> · ID: {applicantCode}
                      </div>
                    )}
                    
                    <div className="text-xs text-gray-500 mt-0.5">
                      {leave.startDate} {leave.startDate !== leave.endDate ? `→ ${leave.endDate}` : ''}
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
                    {leave.remarks && (
                      <div className={`text-xs mt-1 font-medium ${leave.status === 'approved' ? 'text-green-700' : leave.status === 'rejected' ? 'text-red-500' : 'text-gray-500'}`}>
                        Remark: {leave.remarks}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <StatusBadge status={leave.status} />
                    {canApprove && role !== 'coordinator' && leave.status === 'pending' && (
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
                    {!isStudent && leave.status === 'approved' && canApprove && !leave.proxyAssigned && (
                      <button
                        onClick={() => navigate(`/leave/${leave.id}/proxy`)}
                        className="text-xs text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-2.5 py-1 rounded"
                      >
                        Assign Proxy
                      </button>
                    )}
                    {!isStudent && leave.proxyAssigned && (
                      <button
                        onClick={() => navigate(`/leave/${leave.id}/proxy`)}
                        className="flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded"
                      >
                        <UserCheck size={12} /> Proxy Assigned
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl border border-gray-200 shadow-2xl p-6 max-w-sm w-full mx-4">
            <div className="flex items-center gap-3 mb-3">
              <AlertCircle size={20} className="text-red-500 shrink-0" />
              <h3 className="font-semibold text-gray-900">Reject Leave Application</h3>
            </div>
            <p className="text-sm text-gray-500 mb-3">Provide a reason for rejection (optional).</p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
              placeholder="e.g. Insufficient leave balance, staffing constraints..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 resize-none"
            />
            <div className="flex gap-2 justify-end mt-4">
              <button
                onClick={() => setRejectModal(null)}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmReject}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Approve Modal */}
      {approveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl border border-gray-200 shadow-2xl p-6 max-w-sm w-full mx-4">
            <div className="flex items-center gap-3 mb-3">
              <CheckCircle2 size={20} className="text-green-600 shrink-0" />
              <h3 className="font-semibold text-gray-900">Approve Leave Application</h3>
            </div>
            <p className="text-sm text-gray-500 mb-3">Add a remark (optional).</p>
            <textarea
              value={approveRemarks}
              onChange={(e) => setApproveRemarks(e.target.value)}
              rows={3}
              placeholder="e.g. Approved. Please ensure proxy coverage."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-300 resize-none"
            />
            <div className="flex gap-2 justify-end mt-4">
              <button
                onClick={() => setApproveModal(null)}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmApprove}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium"
              >
                Confirm Approve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
