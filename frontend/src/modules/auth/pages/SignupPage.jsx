import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, CheckCircle2, XCircle } from 'lucide-react';
import { authService } from '@/core/services/authService';

// ─── Firebase error map ───────────────────────────────────────────────────────
const FIREBASE_ERRORS = {
  'auth/email-already-in-use': 'An account with this email already exists.',
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/weak-password': 'Password must be at least 6 characters.',
  'auth/network-request-failed': 'Network error. Check your connection.',
};

function getFirebaseError(err) {
  return FIREBASE_ERRORS[err?.code] ?? 'Something went wrong. Please try again.';
}

// ─── Validation rules ─────────────────────────────────────────────────────────
const ROLES = ['student', 'parent', 'teacher', 'admin'];

function validateName(v) {
  if (!v.trim()) return 'Full name is required.';
  if (v.trim().length < 2) return 'Name must be at least 2 characters.';
  return '';
}

function validateEmail(v) {
  if (!v.trim()) return 'Email is required.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())) return 'Enter a valid email address.';
  return '';
}

function validateRole(v) {
  if (!v) return 'Please select a role.';
  return '';
}

function validatePassword(v) {
  if (!v) return 'Password is required.';
  if (v.length < 8) return 'Password must be at least 8 characters.';
  if (!/[A-Z]/.test(v)) return 'Include at least one uppercase letter.';
  if (!/[0-9]/.test(v)) return 'Include at least one number.';
  return '';
}

function validateConfirm(password, confirm) {
  if (!confirm) return 'Please confirm your password.';
  if (confirm !== password) return 'Passwords do not match.';
  return '';
}

// ─── Password strength indicator ─────────────────────────────────────────────
function PasswordStrength({ password }) {
  const checks = [
    { label: 'At least 8 characters', ok: password.length >= 8 },
    { label: 'One uppercase letter', ok: /[A-Z]/.test(password) },
    { label: 'One number', ok: /[0-9]/.test(password) },
  ];

  if (!password) return null;

  return (
    <ul className="mt-2 space-y-1">
      {checks.map(({ label, ok }) => (
        <li key={label} className="flex items-center gap-1.5 text-xs">
          {ok
            ? <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
            : <XCircle size={13} className="text-gray-300 shrink-0" />}
          <span className={ok ? 'text-emerald-700' : 'text-gray-400'}>{label}</span>
        </li>
      ))}
    </ul>
  );
}

// ─── Field error helper ───────────────────────────────────────────────────────
function FieldError({ msg }) {
  if (!msg) return null;
  return <p className="mt-1 text-xs text-red-600">{msg}</p>;
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function SignupPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', role: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (field) => (e) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
    // Clear the error for this field as the user types
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const next = {
      name: validateName(form.name),
      email: validateEmail(form.email),
      role: validateRole(form.role),
      password: validatePassword(form.password),
      confirm: validateConfirm(form.password, form.confirm),
    };
    setErrors(next);
    return Object.values(next).every((e) => !e);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    if (!validate()) return;

    setLoading(true);
    try {
      await authService.signup(form.name.trim(), form.email.trim(), form.password, form.role);
      navigate('/', { replace: true });
    } catch (err) {
      setSubmitError(getFirebaseError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-10">
      <div className="bg-white p-8 rounded-xl border border-gray-200 w-full max-w-md shadow-sm">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Create an account</h1>
          <p className="text-sm text-gray-500 mt-1">
            Already have an account?{' '}
            <Link to="/login" className="text-emerald-600 hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>

        {/* Submit-level error */}
        {submitError && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {submitError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={form.name}
              onChange={set('name')}
              placeholder="Jane Smith"
              autoComplete="name"
              className={`w-full bg-gray-100 rounded-lg px-4 py-2.5 text-sm border-0 outline-none focus:ring-2 ${errors.name ? 'ring-2 ring-red-400' : 'focus:ring-emerald-500'}`}
            />
            <FieldError msg={errors.name} />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={form.email}
              onChange={set('email')}
              placeholder="jane@school.com"
              autoComplete="email"
              className={`w-full bg-gray-100 rounded-lg px-4 py-2.5 text-sm border-0 outline-none focus:ring-2 ${errors.email ? 'ring-2 ring-red-400' : 'focus:ring-emerald-500'}`}
            />
            <FieldError msg={errors.email} />
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              value={form.role}
              onChange={set('role')}
              className={`w-full bg-gray-100 rounded-lg px-4 py-2.5 text-sm border-0 outline-none focus:ring-2 capitalize ${errors.role ? 'ring-2 ring-red-400' : 'focus:ring-emerald-500'}`}
            >
              <option value="">Select a role</option>
              {ROLES.map((r) => (
                <option key={r} value={r} className="capitalize">
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </option>
              ))}
            </select>
            <FieldError msg={errors.role} />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={set('password')}
                placeholder="••••••••"
                autoComplete="new-password"
                className={`w-full bg-gray-100 rounded-lg px-4 py-2.5 pr-11 text-sm border-0 outline-none focus:ring-2 ${errors.password ? 'ring-2 ring-red-400' : 'focus:ring-emerald-500'}`}
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <FieldError msg={errors.password} />
            <PasswordStrength password={form.password} />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                value={form.confirm}
                onChange={set('confirm')}
                placeholder="••••••••"
                autoComplete="new-password"
                className={`w-full bg-gray-100 rounded-lg px-4 py-2.5 pr-11 text-sm border-0 outline-none focus:ring-2 ${errors.confirm ? 'ring-2 ring-red-400' : 'focus:ring-emerald-500'}`}
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <FieldError msg={errors.confirm} />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg py-2.5 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors mt-2"
          >
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
}
