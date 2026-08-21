import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, Mail, Lock, ArrowRight, UserPlus, Key, Eye, EyeOff, Check, AlertCircle, Loader2 } from 'lucide-react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'

type AuthMode = 'login' | 'signup'

export default function Login() {
  const [mode, setMode] = useState<AuthMode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [needsVerification, setNeedsVerification] = useState(false)
  const { signIn, signUp, resendVerification } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    try {
      if (mode === 'login') {
        const { error } = await signIn(email, password)
        if (error) throw error
        navigate(from, { replace: true })
      } else {
        const { error, needsVerification } = await signUp(email, password, fullName)
        if (error) throw error
        if (needsVerification) {
          setNeedsVerification(true)
          setSuccess('Account created! Please check your email to verify your account.')
        } else {
          setSuccess('Account created! You can now sign in.')
          setMode('login')
          setPassword('')
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Authentication failed'
      setError(msg)
      if (msg.toLowerCase().includes('email') && msg.toLowerCase().includes('confirm')) {
        setNeedsVerification(true)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (!email) return
    setLoading(true)
    const { error } = await resendVerification(email)
    setLoading(false)
    if (error) {
      setError(error.message)
    } else {
      setSuccess('Verification email sent! Check your inbox.')
      setError(null)
    }
  }

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode)
    setError(null)
    setSuccess(null)
    setNeedsVerification(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20 relative overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full opacity-[0.06] blur-[100px]" style={{ background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] rounded-full opacity-[0.04] blur-[80px]" style={{ background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)' }} />
        <div className="absolute inset-0 grid-bg opacity-20" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="glass-card-premium rounded-2xl p-8 sm:p-10">
          {/* Header */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #2563eb, #6366f1)' }}>
                <Zap size={20} className="text-white" />
              </div>
              <span className="text-2xl font-black tracking-tighter gradient-text">YORNAM</span>
            </Link>
            <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              {mode === 'login' ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
              {mode === 'login' ? 'Sign in to access your dashboard' : 'Start analyzing reels in seconds'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === 'signup' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your name"
                  className="w-full px-4 py-3 rounded-xl text-base outline-none transition-all duration-200 input-premium"
                  style={{ color: 'var(--text-primary)' }}
                />
              </motion.div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                Email
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-quaternary)' }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="w-full pl-12 pr-4 py-3 rounded-xl text-base outline-none transition-all duration-200 input-premium"
                  style={{ color: 'var(--text-primary)' }}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                Password
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-quaternary)' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder={mode === 'login' ? 'Enter your password' : 'Create a password (min 6 chars)'}
                  minLength={6}
                  className="w-full pl-12 pr-12 py-3 rounded-xl text-base outline-none transition-all duration-200 input-premium"
                  style={{ color: 'var(--text-primary)' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer"
                  style={{ color: 'var(--text-quaternary)' }}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center gap-2 text-sm py-3 px-4 rounded-xl"
                  style={{ color: 'var(--accent-red)', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}
                >
                  <AlertCircle size={16} style={{ flexShrink: 0 }} />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Success */}
            <AnimatePresence>
              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center gap-2 text-sm py-3 px-4 rounded-xl"
                  style={{ color: 'var(--accent-green)', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)' }}
                >
                  <Check size={16} style={{ flexShrink: 0 }} />
                  <span>{success}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Resend verification */}
            {needsVerification && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center"
              >
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={loading}
                  className="text-xs flex items-center gap-1.5 mx-auto cursor-pointer hover:opacity-80 transition-opacity disabled:opacity-50"
                  style={{ color: 'var(--accent-blue)' }}
                >
                  <Key size={14} />
                  Resend verification email
                </button>
              </motion.div>
            )}

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3.5 rounded-xl font-semibold text-white text-base transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer btn-premium"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  {mode === 'login' ? 'Signing in...' : 'Creating account...'}
                </>
              ) : (
                <>
                  {mode === 'login' ? 'Sign In' : 'Create Account'}
                  <ArrowRight size={18} />
                </>
              )}
            </motion.button>
          </form>

          {/* Forgot password link */}
          {mode === 'login' && !needsVerification && (
            <div className="mt-4 text-center">
              <Link
                to="/forgot-password"
                className="text-xs flex items-center gap-1.5 justify-center cursor-pointer hover:opacity-80 transition-opacity"
                style={{ color: 'var(--accent-blue)' }}
              >
                <Key size={14} />
                Forgot your password?
              </Link>
            </div>
          )}

          {/* Toggle */}
          <div className="mt-6 text-center">
            <button
              onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')}
              className="text-sm flex items-center gap-1.5 mx-auto cursor-pointer hover:opacity-80 transition-opacity"
              style={{ color: 'var(--accent-blue)' }}
            >
              <UserPlus size={16} />
              {mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>

          {/* Security note */}
          <div className="mt-6 pt-6 text-center" style={{ borderTop: '1px solid var(--divider)' }}>
            <p className="text-xs" style={{ color: 'var(--text-quaternary)' }}>
              Protected by enterprise-grade encryption
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
