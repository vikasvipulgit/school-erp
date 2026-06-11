import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { authService } from '@/core/services/authService';
import { useAuth } from '@/core/context/AuthContext';
import logo from '@/assets/logo.png';


import { requestNotificationPermission } from '@/utils/firebaseNotifications';

export default function LoginPage() {
  const [loginMode, setLoginMode] = useState('staff'); // 'staff' | 'student'
  const [email, setEmail] = useState('');
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      let user;
      if (loginMode === 'staff') {
        user = await authService.login(email.trim(), password);
      } else {
        user = await authService.studentLogin(studentId.trim(), password);
      }
      login(user);
      
      // Request FCM permission (non-blocking)
      requestNotificationPermission().catch(console.error);
      
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl border border-gray-200 w-full max-w-sm shadow-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <img src={logo} alt="Logo" className="w-16 h-16 object-contain mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 leading-tight">Welcome to <br /> Javiya Schooling System</h1>
          <p className="text-sm text-gray-500 mt-1">
            Sign in to your account.{' '}
            <Link to="/signup" className="text-emerald-600 hover:underline font-medium">
              Create account
            </Link>
          </p>
        </div>

        <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
          <button
            type="button"
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
              loginMode === 'staff' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => { setLoginMode('staff'); setError(''); }}
          >
            Staff Login
          </button>
          <button
            type="button"
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
              loginMode === 'student' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => { setLoginMode('student'); setError(''); }}
          >
            Student Login
          </button>
        </div>

        <form onSubmit={handleLogin} noValidate>
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {loginMode === 'staff' ? (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="you@school.com"
                className="w-full bg-gray-100 rounded-lg px-4 py-2.5 text-sm border-0 outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          ) : (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Student ID
              </label>
              <input
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value.toUpperCase())}
                required
                maxLength={5}
                placeholder="ST101"
                className="w-full bg-gray-100 rounded-lg px-4 py-2.5 text-sm border-0 outline-none focus:ring-2 focus:ring-emerald-500 uppercase"
              />
            </div>
          )}

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full bg-gray-100 rounded-lg px-4 py-2.5 pr-11 text-sm border-0 outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || (!email && loginMode === 'staff') || (!studentId && loginMode === 'student') || !password}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg py-2.5 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
