import React, { useState } from 'react';
import { User, Lock, BookOpen, CheckCircle2, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '@/core/context/AuthContext';
import { authService } from '@/core/services/authService';
import teachersData from '@/data/teachers.json';

function Field({ label, value, readOnly }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
      <div className={`w-full px-3 py-2.5 rounded-lg text-sm border ${readOnly ? 'bg-gray-50 border-gray-200 text-gray-700' : 'bg-white border-gray-300'}`}>
        {value || '—'}
      </div>
    </div>
  );
}

function PasswordInput({ label, value, onChange, placeholder }) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full px-3 py-2.5 pr-10 rounded-lg text-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-400"
        />
        <button
          type="button"
          onClick={() => setShow(v => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          tabIndex={-1}
        >
          {show ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { user, userProfile, teacherId } = useAuth();

  const teacher = teachersData.find(
    t => t.id === teacherId || t.email === user?.email
  );

  // Change password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwStatus, setPwStatus] = useState(null); // { type: 'success'|'error', msg }
  const [pwLoading, setPwLoading] = useState(false);

  const role = userProfile?.role || 'teacher';
  const roleLabel = { admin: 'Administrator', administrator: 'Administrator', principal: 'Principal', coordinator: 'Timetable Coordinator', teacher: 'Teacher' }[role] || role;
  const roleBadgeCls = {
    admin: 'bg-purple-100 text-purple-700',
    administrator: 'bg-purple-100 text-purple-700',
    principal: 'bg-blue-100 text-blue-700',
    coordinator: 'bg-indigo-100 text-indigo-700',
    teacher: 'bg-emerald-100 text-emerald-700',
  }[role] || 'bg-gray-100 text-gray-600';

  const handleChangePassword = async e => {
    e.preventDefault();
    setPwStatus(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPwStatus({ type: 'error', msg: 'All fields are required.' });
      return;
    }
    if (newPassword.length < 8) {
      setPwStatus({ type: 'error', msg: 'New password must be at least 8 characters.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwStatus({ type: 'error', msg: 'New passwords do not match.' });
      return;
    }
    if (newPassword === currentPassword) {
      setPwStatus({ type: 'error', msg: 'New password must differ from current password.' });
      return;
    }

    setPwLoading(true);
    try {
      await authService.changePassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPwStatus({ type: 'success', msg: 'Password changed successfully.' });
    } catch (err) {
      const msg = err.message === 'Current password is incorrect'
        ? 'Current password is incorrect.'
        : err.message?.includes('Session expired')
        ? 'Your session expired. Please log in again.'
        : 'Failed to change password. Please try again.';
      setPwStatus({ type: 'error', msg });
    }
    setPwLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your account details and security settings</p>
      </div>

      {/* Profile card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-5">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center text-white text-2xl font-bold shrink-0">
            {(user?.displayName || user?.email || 'U')[0].toUpperCase()}
          </div>
          <div>
            <div className="text-lg font-bold text-gray-900">{user?.displayName || '—'}</div>
            <div className="text-sm text-gray-500">{user?.email}</div>
            <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${roleBadgeCls}`}>
              {roleLabel}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Full Name"  value={user?.displayName} readOnly />
          <Field label="Email"      value={user?.email}       readOnly />
          <Field label="Role"       value={roleLabel}         readOnly />
          {teacher && <Field label="Subject" value={teacher.subject} readOnly />}
        </div>

        {teacher?.classes?.length > 0 && (
          <div className="mt-4">
            <div className="text-xs font-medium text-gray-500 mb-2">Assigned Classes</div>
            <div className="flex flex-wrap gap-2">
              {teacher.classes.map(cls => (
                <span key={cls} className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium px-2.5 py-1 rounded-lg">
                  <BookOpen size={11} /> {cls}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Change password card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-5">
          <Lock size={16} className="text-gray-500" />
          <h2 className="font-semibold text-gray-900">Change Password</h2>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-4">
          <PasswordInput
            label="Current Password"
            value={currentPassword}
            onChange={e => { setCurrentPassword(e.target.value); setPwStatus(null); }}
            placeholder="Enter your current password"
          />
          <PasswordInput
            label="New Password"
            value={newPassword}
            onChange={e => { setNewPassword(e.target.value); setPwStatus(null); }}
            placeholder="At least 8 characters"
          />
          <PasswordInput
            label="Confirm New Password"
            value={confirmPassword}
            onChange={e => { setConfirmPassword(e.target.value); setPwStatus(null); }}
            placeholder="Re-enter new password"
          />

          {pwStatus && (
            <div className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm ${
              pwStatus.type === 'success'
                ? 'bg-green-50 border border-green-200 text-green-700'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}>
              {pwStatus.type === 'success'
                ? <CheckCircle2 size={15} />
                : <AlertCircle size={15} />}
              {pwStatus.msg}
            </div>
          )}

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={pwLoading}
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-medium disabled:opacity-60"
            >
              {pwLoading ? 'Updating…' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
