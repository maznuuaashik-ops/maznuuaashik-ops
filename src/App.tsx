import { useState, useCallback, useRef, useEffect, lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Zap,
  Menu,
  X,
  LogOut,
  User,
  BarChart3,
  Settings as SettingsIcon,
  Megaphone,
  XCircle,
  Info,
  Mail,
  Lock,
  Moon,
  Sun,
  Shield,
} from 'lucide-react'
import { analyzeReel, analyzeVideoFile } from './lib/api'
import { useAuth } from './lib/AuthContext'
import { useTheme } from './lib/ThemeContext'
import { useLanguage } from './lib/LanguageContext'
import { supabase } from './lib/supabase'
import type { AnalysisResult } from './lib/types'
import './index.css'

// Eagerly loaded: critical for first paint
import Hero from './components/Hero'
import AnalysisAnimation from './components/AnalysisAnimation'
import SkeletonLoader from './components/SkeletonLoader'
import Features from './components/Features'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'

// Lazy loaded: results section (only needed after analysis)
const ViralScore = lazy(() => import('./components/ViralScore'))
const AnalysisCards = lazy(() => import('./components/AnalysisCards'))
const Dashboard = lazy(() => import('./components/Dashboard'))

// Lazy loaded: below the fold / secondary routes
const Login = lazy(() => import('./components/Login'))
const ForgotPassword = lazy(() => import('./components/ForgotPassword'))
const ResetPassword = lazy(() => import('./components/ResetPassword'))
const AdminDashboard = lazy(() => import('./components/AdminDashboard'))
const Analytics = lazy(() => import('./components/Analytics'))
const Settings = lazy(() => import('./components/Settings'))
const About = lazy(() => import('./components/About'))
const Contact = lazy(() => import('./components/Contact'))
const PrivacyPolicy = lazy(() => import('./components/PrivacyPolicy'))

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
      <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--accent-blue)', borderTopColor: 'transparent' }} />
    </div>
  )
}

function Navigation() {
  const { user, isAdmin, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const { t, language } = useLanguage()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const navLinks = [
    { to: '/about', label: t('nav.about'), icon: Info },
    { to: '/contact', label: t('nav.contact'), icon: Mail },
    { to: '/privacy', label: t('nav.privacy'), icon: Lock },
    { to: '/settings', label: t('nav.settings'), icon: SettingsIcon },
  ]

  const authLinks = [
    ...(user ? [{ to: '/analytics', label: t('nav.analytics'), icon: BarChart3 }] : []),
    ...(isAdmin ? [{ to: '/admin', label: t('nav.adminControlCenter'), icon: Shield }] : []),
  ]

  return (
    <nav className="fixed top-3 sm:top-4 left-1/2 -translate-x-1/2 z-40 px-4 py-2 sm:py-4 w-full max-w-6xl">
      <div
        className="flex items-center justify-between rounded-2xl px-4 sm:px-5 py-2.5 sm:py-3"
        style={{ background: 'var(--nav-bg)', backdropFilter: 'blur(20px)', border: '1px solid var(--border-primary)' }}
      >
        <Link to="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #2563eb, #6366f1)' }}>
            <Zap size={14} className="text-white" />
          </div>
          <span className="text-base sm:text-lg font-black tracking-tighter gradient-text">YORNAM</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden lg:flex items-center gap-1 text-sm" style={{ color: 'var(--text-tertiary)' }}>
          {navLinks.map((link) => {
            const Icon = link.icon
            const isActive = location.pathname === link.to
            return (
              <Link
                key={link.to}
                to={link.to}
                className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-300 group"
                style={{
                  color: isActive ? 'var(--accent-blue)' : 'var(--text-tertiary)',
                  background: isActive ? 'rgba(59,130,246,0.08)' : 'transparent',
                }}
              >
                <Icon size={14} className="transition-transform duration-300 group-hover:scale-110" style={{ color: isActive ? 'var(--accent-blue)' : undefined }} />
                <span className="transition-colors duration-300">{link.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="nav-active-indicator"
                    className="absolute inset-0 rounded-lg pointer-events-none"
                    style={{ boxShadow: '0 0 12px rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.2)' }}
                  />
                )}
              </Link>
            )
          })}
          {authLinks.map((link) => {
            const Icon = link.icon
            const isActive = location.pathname === link.to
            return (
              <Link
                key={link.to}
                to={link.to}
                className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-300 group"
                style={{
                  color: isActive ? 'var(--accent-blue)' : 'var(--text-tertiary)',
                  background: isActive ? 'rgba(59,130,246,0.08)' : 'transparent',
                }}
              >
                <Icon size={14} className="transition-transform duration-300 group-hover:scale-110" style={{ color: isActive ? 'var(--accent-blue)' : undefined }} />
                <span className="transition-colors duration-300">{link.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="nav-active-indicator"
                    className="absolute inset-0 rounded-lg pointer-events-none"
                    style={{ boxShadow: '0 0 12px rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.2)' }}
                  />
                )}
              </Link>
            )
          })}
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            className="w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer transition-transform hover:scale-105 active:scale-95"
            style={{
              background: 'var(--bg-badge)',
              border: '1px solid var(--border-primary)',
              color: theme === 'dark' ? '#fbbf24' : '#2563eb',
            }}
            title={theme === 'dark' ? t('nav.themeToggleLight') : t('nav.themeToggleDark')}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {user ? (
            <div className="flex items-center gap-2">
              <Link
                to="/settings"
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200"
                style={{
                  background: 'var(--bg-subtle)',
                  border: '1px solid var(--border-secondary)',
                  color: 'var(--text-secondary)',
                }}
                title={t('nav.settings')}
              >
                <User size={13} style={{ color: 'var(--accent-blue)' }} />
                <span className="max-w-[110px] truncate">{user.email?.split('@')[0]}</span>
              </Link>

              <motion.button
                onClick={handleSignOut}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer"
                style={{ background: 'var(--bg-badge)', border: '1px solid var(--border-primary)', color: 'var(--text-secondary)' }}
              >
                <LogOut size={13} />
                {t('nav.signOut')}
              </motion.button>
            </div>
          ) : (
            <motion.button
              onClick={() => navigate('/login')}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="hidden sm:flex px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all duration-200 cursor-pointer btn-premium"
            >
              {t('nav.signIn')}
            </motion.button>
          )}

          {/* Mobile menu button */}
          <button
            className="lg:hidden w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer"
            style={{ background: 'var(--bg-badge)', border: '1px solid var(--border-primary)', color: 'var(--text-tertiary)' }}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden mt-2 rounded-2xl p-4"
            style={{ background: 'var(--nav-bg)', backdropFilter: 'blur(20px)', border: '1px solid var(--border-primary)' }}
          >
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => {
                const Icon = link.icon
                const isActive = location.pathname === link.to
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="flex items-center gap-2 text-sm py-2.5 px-3 rounded-xl transition-all duration-300"
                    style={{
                      color: isActive ? 'var(--accent-blue)' : 'var(--text-secondary)',
                      background: isActive ? 'rgba(59,130,246,0.08)' : 'var(--bg-subtle)',
                      border: isActive ? '1px solid rgba(59,130,246,0.2)' : '1px solid transparent',
                    }}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon size={16} />
                    {link.label}
                  </Link>
                )
              })}

              {authLinks.map((link) => {
                const Icon = link.icon
                const isActive = location.pathname === link.to
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="flex items-center gap-2 text-sm py-2.5 px-3 rounded-xl transition-all duration-300"
                    style={{
                      color: isActive ? 'var(--accent-blue)' : 'var(--text-secondary)',
                      background: isActive ? 'rgba(59,130,246,0.08)' : 'var(--bg-subtle)',
                      border: isActive ? '1px solid rgba(59,130,246,0.2)' : '1px solid transparent',
                    }}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon size={16} />
                    {link.label}
                  </Link>
                )
              })}

              {/* Theme toggle in mobile menu */}
              <div
                className="flex items-center justify-between py-2 px-3 rounded-xl mt-1"
                style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-secondary)' }}
              >
                <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {theme === 'dark' ? <Moon size={16} className="text-blue-400" /> : <Sun size={16} className="text-amber-500" />}
                  <span>{theme === 'dark' ? t('nav.themeToggleDark') : t('nav.themeToggleLight')}</span>
                </div>
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer"
                  style={{ background: 'var(--bg-badge)', color: 'var(--accent-blue)' }}
                >
                  {language === 'hi' ? 'बदलें' : 'Switch'}
                </button>
              </div>

              <div style={{ borderTop: '1px solid var(--divider)', margin: '6px 0' }} />

              {user ? (
                <div className="flex flex-col gap-2">
                  <Link
                    to="/settings"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 text-xs py-2 px-3 rounded-xl"
                    style={{ color: 'var(--text-tertiary)', background: 'var(--bg-subtle)' }}
                  >
                    <User size={14} style={{ color: 'var(--accent-blue)' }} />
                    <span>{language === 'hi' ? 'साइन इन रूप में:' : 'Signed in as'} <strong className="font-semibold text-xs" style={{ color: 'var(--text-primary)' }}>{user.email}</strong></span>
                  </Link>

                  <button
                    onClick={() => { handleSignOut(); setMobileMenuOpen(false) }}
                    className="flex items-center justify-center gap-2 text-sm py-2.5 px-3 rounded-xl cursor-pointer"
                    style={{ color: 'var(--accent-red)', background: 'rgba(239,68,68,0.08)' }}
                  >
                    <LogOut size={15} />
                    {t('nav.signOut')}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => { navigate('/login'); setMobileMenuOpen(false) }}
                  className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-white cursor-pointer btn-premium"
                >
                  <User size={16} />
                  {t('nav.signIn')}
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}

function AnnouncementBanner() {
  const [announcement, setAnnouncement] = useState<{ title: string; content: string; type: string } | null>(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase
          .from('announcements')
          .select('title, content, type')
          .eq('active', true)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()
        if (data) setAnnouncement(data)
      } catch { /* silent */ }
    })()
  }, [])

  if (!announcement || dismissed) return null

  const typeColors: Record<string, string> = {
    info: '#3b82f6', warning: '#f59e0b', success: '#10b981', maintenance: '#6366f1',
  }
  const color = typeColors[announcement.type] || '#3b82f6'

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="fixed top-20 left-1/2 -translate-x-1/2 z-30 px-4 w-full max-w-2xl"
    >
      <div
        className="flex items-center gap-3 rounded-xl px-4 py-3"
        style={{ background: `${color}0d`, backdropFilter: 'blur(20px)', border: `1px solid ${color}25` }}
      >
        <Megaphone size={18} style={{ color, flexShrink: 0 }} />
        <div className="flex-1 min-w-0">
          <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{announcement.title}</span>
          {announcement.content && (
            <span className="text-xs ml-2" style={{ color: 'var(--text-tertiary)' }}>— {announcement.content}</span>
          )}
        </div>
        <button onClick={() => setDismissed(true)} className="cursor-pointer flex-shrink-0" style={{ color: 'var(--text-quaternary)' }} aria-label="Dismiss">
          <XCircle size={16} />
        </button>
      </div>
    </motion.div>
  )
}

function VisitorTracker() {
  useEffect(() => {
    (async () => {
      try {
        let visitorId = localStorage.getItem('yornam_visitor_id')
        if (!visitorId) {
          visitorId = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
          localStorage.setItem('yornam_visitor_id', visitorId)
        }
        await supabase.from('visitors').insert({
          visitor_id: visitorId,
          page: window.location.pathname,
        })
      } catch { /* silent */ }
    })()
  }, [])
  return null
}

function HomePage() {
  const [isLoading, setIsLoading] = useState(false)
  const [showAnimation, setShowAnimation] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const apiDoneRef = useRef(false)
  const apiResultRef = useRef<AnalysisResult | null>(null)
  const apiErrorRef = useRef<string | null>(null)

  const handleAnimationComplete = useCallback(() => {
    setShowAnimation(false)
    if (apiErrorRef.current) {
      setError(apiErrorRef.current)
      apiErrorRef.current = null
      setIsLoading(false)
      return
    }
    if (apiDoneRef.current && apiResultRef.current) {
      setResult(apiResultRef.current)
      setShowResults(true)
      setIsLoading(false)
    }
  }, [])

  const handleAnalyze = useCallback(async (url: string) => {
    setError(null)
    setIsLoading(true)
    setShowResults(false)
    setResult(null)
    apiDoneRef.current = false
    apiResultRef.current = null
    apiErrorRef.current = null
    setShowAnimation(true)

    try {
      const data = await analyzeReel(url)
      apiResultRef.current = data
      apiDoneRef.current = true
    } catch (err) {
      apiErrorRef.current = err instanceof Error ? err.message : 'Analysis failed. Please try again.'
      apiDoneRef.current = true
    }
  }, [])

  const handleAnalyzeVideo = useCallback(async (file: File) => {
    setError(null)
    setIsLoading(true)
    setShowResults(false)
    setResult(null)
    apiDoneRef.current = false
    apiResultRef.current = null
    apiErrorRef.current = null
    setShowAnimation(true)

    try {
      const data = await analyzeVideoFile(file)
      apiResultRef.current = data
      apiDoneRef.current = true
    } catch (err) {
      apiErrorRef.current = err instanceof Error ? err.message : 'Video analysis failed. Please try again.'
      apiDoneRef.current = true
    }
  }, [])

  return (
    <>
      <AnnouncementBanner />
      <VisitorTracker />

      {/* Premium analysis animation overlay */}
      <AnimatePresence>
        {showAnimation && (
          <AnalysisAnimation key="analysis-anim" onComplete={handleAnimationComplete} />
        )}
      </AnimatePresence>

      {/* Hero */}
      <Hero
        onAnalyze={handleAnalyze}
        onAnalyzeVideo={handleAnalyzeVideo}
        isLoading={isLoading}
        error={error}
      />

      {/* Results — progressive reveal: ViralScore → AnalysisCards → Dashboard */}
      <AnimatePresence>
        {showResults && result && (
          <motion.div key="results">
            <Suspense fallback={<SkeletonLoader />}>
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <ViralScore
                  score={result.overallScore}
                  subMetrics={[
                    { label: 'Hook Strength', value: result.hookStrength, color: '#3b82f6' },
                    { label: 'Audio Sync', value: result.audioSync, color: '#22d3ee' },
                    { label: 'Visual Quality', value: result.visualQuality, color: '#818cf8' },
                    { label: 'Caption Power', value: result.captionPower, color: '#60a5fa' },
                    { label: 'Trend Alignment', value: result.trendAlignment, color: '#38bdf8' },
                  ]}
                  enhancedReport={result.enhancedReport}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <AnalysisCards cards={result.analysisCards} enhancedReport={result.enhancedReport} />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <Dashboard metrics={result.dashboardMetrics} recentAnalyses={result.recentAnalyses} enhancedReport={result.enhancedReport} />
              </motion.div>
            </Suspense>
          </motion.div>
        )}
      </AnimatePresence>

      {!showResults && !isLoading && (
        <Suspense fallback={<PageLoader />}>
          <Dashboard metrics={null} recentAnalyses={[]} />
        </Suspense>
      )}
      {!showResults && !isLoading && <Features />}
      <Footer />
    </>
  )
}

function AppLayout() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <Navigation />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Suspense fallback={<PageLoader />}><Login /></Suspense>} />
        <Route path="/forgot-password" element={<Suspense fallback={<PageLoader />}><ForgotPassword /></Suspense>} />
        <Route path="/reset-password" element={<Suspense fallback={<PageLoader />}><ResetPassword /></Suspense>} />
        <Route path="/admin" element={
          <ProtectedRoute requireAdmin>
            <Suspense fallback={<PageLoader />}><AdminDashboard /></Suspense>
          </ProtectedRoute>
        } />
        <Route path="/analytics" element={
          <ProtectedRoute>
            <Suspense fallback={<PageLoader />}><Analytics /></Suspense>
          </ProtectedRoute>
        } />
        <Route path="/settings" element={<Suspense fallback={<PageLoader />}><Settings /></Suspense>} />
        <Route path="/about" element={<Suspense fallback={<PageLoader />}><About /></Suspense>} />
        <Route path="/contact" element={<Suspense fallback={<PageLoader />}><Contact /></Suspense>} />
        <Route path="/privacy" element={<Suspense fallback={<PageLoader />}><PrivacyPolicy /></Suspense>} />
      </Routes>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  )
}
