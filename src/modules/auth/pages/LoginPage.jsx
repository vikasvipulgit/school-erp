import { useEffect, useState } from 'react'
import { authService } from '@/core/services/authService'
import { useNavigate } from 'react-router-dom'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const unsubscribe = authService.onAuthChange((currentUser) => {
      if (currentUser) {
        navigate('/', { replace: true })
      }
    })
    return () => unsubscribe()
  }, [navigate])

  const handleLogin = async () => {
    setLoading(true)
    setError('')
    try {
      await authService.login(email, password)
      navigate('/', { replace: true })
    } catch (err) {
      setError('Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center 
                    justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl 
                      border border-gray-200 w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-1">
          School Timetable
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          Sign in to your account
        </p>

        {error && (
          <p className="text-sm text-red-500 mb-4">{error}</p>
        )}

        <div className="mb-4">
          <label className="text-sm font-medium 
                            text-gray-700 block mb-1">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full bg-gray-100 rounded-lg 
                       px-4 py-2.5 text-sm border-0 
                       outline-none focus:ring-2 
                       focus:ring-emerald-500"
            placeholder="you@school.com"
          />
        </div>

        <div className="mb-6">
          <label className="text-sm font-medium 
                            text-gray-700 block mb-1">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full bg-gray-100 rounded-lg 
                       px-4 py-2.5 text-sm border-0 
                       outline-none focus:ring-2 
                       focus:ring-emerald-500"
            placeholder="••••••••"
          />
        </div>

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-emerald-500 
                     hover:bg-emerald-600 text-white 
                     rounded-lg py-2.5 text-sm 
                     font-medium disabled:opacity-50"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </div>
    </div>
  )
}
