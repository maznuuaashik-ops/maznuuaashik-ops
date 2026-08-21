import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Settings as SettingsIcon,
  User,
  Bell,
  Shield,
  Palette,
  Save,
  Check,
  Mail,
  KeyRound,
  ArrowLeft,
  Moon,
  Sun,
  LogOut,
  Sparkles,
  UserCheck,
  Lock,
  Globe,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
import { useTheme } from '../lib/ThemeContext'
import { useLanguage } from '../lib/LanguageContext'

export default function Settings() {
  const { user, profile, updateProfile, updatePassword, signOut } = useAuth()
  const { theme, setTheme, toggleTheme } = useTheme()
  const { language, setLanguage, t } = useLanguage()
  const navigate = useNavigate()

  const [fullName, setFullName] = useState('')
  const [saved, setSaved] = useState(false)
  const [notifications, setNotifications] = useState(true)
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  useEffect(() => {
    if (profile?.full_name !== undefined) {
      setFullName(profile.full_name || '')
    } else if (user?.email) {
      setFullName(user.email.split('@')[0])
    }
  }, [profile, user])

  const handleProfileSave = async () => {
    setProfileError(null)
    setLoading(true)
    const { error } = await updateProfile({ full_name: fullName })
    setLoading(false)
    if (error) {
      setProfileError(error.message)
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
  }

  const handlePasswordChange = async () => {
    setPasswordError(null)
    setPasswordSuccess(false)

    if (newPassword.length < 6) {
      setPasswordError(language === 'hi' ? 'पासवर्ड कम से कम 6 अक्षरों का होना चाहिए' : 'Password must be at least 6 characters')
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordError(language === 'hi' ? 'पासवर्ड मेल नहीं खा रहे हैं' : 'Passwords do not match')
      return
    }

    setLoading(true)
    const { error } = await updatePassword(newPassword)
    setLoading(false)

    if (error) {
      setPasswordError(error.message)
    } else {
      setPasswordSuccess(true)
      setNewPassword('')
      setConfirmPassword('')
      setShowChangePassword(false)
    }
  }

  const handleSignOut = async () => {
    setLoggingOut(true)
    try {
      await signOut()
      navigate('/')
    } catch {
      setLoggingOut(false)
    }
  }

  return (
    <div className="min-h-screen py-24 sm:py-28 px-4" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 sm:mb-10"
        >
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium mb-4 hover:opacity-80 transition-opacity"
            style={{ color: 'var(--accent-blue)' }}
          >
            <ArrowLeft size={16} />
            {t('nav.backToAnalyzer')}
          </Link>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 flex items-center gap-3" style={{ color: 'var(--text-primary)' }}>
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'var(--bg-badge)', border: '1px solid var(--border-accent)' }}
                >
                  <SettingsIcon size={22} style={{ color: 'var(--accent-blue)' }} />
                </div>
                {t('settings.title')}
              </h1>
              <p className="text-sm sm:text-base" style={{ color: 'var(--text-tertiary)' }}>
                {t('settings.subtitle')}
              </p>
            </div>

            {user && (
              <button
                onClick={handleSignOut}
                disabled={loggingOut}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer hover:bg-red-500/10 hover:border-red-500/30"
                style={{
                  background: 'var(--bg-badge)',
                  border: '1px solid var(--border-primary)',
                  color: 'var(--accent-red)',
                }}
              >
                <LogOut size={16} />
                {loggingOut ? t('settings.signingOut') : t('settings.signOutBtn')}
              </button>
            )}
          </div>
        </motion.div>

        {/* 1. Language Section (NEW) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.03 }}
          className="glass-card rounded-2xl p-6 sm:p-8 mb-6"
        >
          <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
            <div className="flex items-center gap-3" style={{ color: 'var(--text-primary)' }}>
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: 'var(--bg-badge)', border: '1px solid var(--border-accent)' }}
              >
                <Globe size={18} style={{ color: 'var(--accent-blue)' }} />
              </div>
              <div>
                <h2 className="font-semibold text-base sm:text-lg">{t('settings.languageTitle')}</h2>
                <p className="text-xs sm:text-sm" style={{ color: 'var(--text-tertiary)' }}>
                  {t('settings.languageSubtitle')}
                </p>
              </div>
            </div>

            <div
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
              style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-secondary)', color: 'var(--text-tertiary)' }}
            >
              <Sparkles size={12} style={{ color: 'var(--accent-blue)' }} />
              {t('settings.activeLanguage')}: {language === 'hi' ? 'हिंदी (Hindi)' : 'English'}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* English Option */}
            <motion.button
              type="button"
              onClick={() => setLanguage('en')}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="relative p-5 rounded-2xl text-left transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden"
              style={{
                background: language === 'en' ? 'rgba(59, 130, 246, 0.08)' : 'var(--bg-subtle)',
                border: language === 'en' ? '2px solid var(--accent-blue)' : '1px solid var(--border-primary)',
                boxShadow: language === 'en' ? '0 0 25px rgba(59, 130, 246, 0.2)' : 'none',
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                    style={{ background: 'var(--bg-badge)', border: '1px solid var(--border-secondary)' }}
                  >
                    🇬🇧
                  </div>
                  <div>
                    <span className="font-semibold text-sm block" style={{ color: 'var(--text-primary)' }}>
                      English
                    </span>
                    <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                      {t('settings.englishSub')}
                    </span>
                  </div>
                </div>

                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center"
                  style={{
                    border: language === 'en' ? 'none' : '2px solid var(--border-primary)',
                    background: language === 'en' ? 'var(--accent-blue)' : 'transparent',
                  }}
                >
                  {language === 'en' && <Check size={12} className="text-white" />}
                </div>
              </div>
            </motion.button>

            {/* Hindi Option */}
            <motion.button
              type="button"
              onClick={() => setLanguage('hi')}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="relative p-5 rounded-2xl text-left transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden"
              style={{
                background: language === 'hi' ? 'rgba(59, 130, 246, 0.08)' : 'var(--bg-subtle)',
                border: language === 'hi' ? '2px solid var(--accent-blue)' : '1px solid var(--border-primary)',
                boxShadow: language === 'hi' ? '0 0 25px rgba(59, 130, 246, 0.2)' : 'none',
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                    style={{ background: 'var(--bg-badge)', border: '1px solid var(--border-secondary)' }}
                  >
                    🇮🇳
                  </div>
                  <div>
                    <span className="font-semibold text-sm block" style={{ color: 'var(--text-primary)' }}>
                      हिंदी
                    </span>
                    <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                      {t('settings.hindiSub')}
                    </span>
                  </div>
                </div>

                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center"
                  style={{
                    border: language === 'hi' ? 'none' : '2px solid var(--border-primary)',
                    background: language === 'hi' ? 'var(--accent-blue)' : 'transparent',
                  }}
                >
                  {language === 'hi' && <Check size={12} className="text-white" />}
                </div>
              </div>
            </motion.button>
          </div>
        </motion.div>

        {/* 2. Theme / Appearance Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06 }}
          className="glass-card rounded-2xl p-6 sm:p-8 mb-6"
        >
          <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
            <div className="flex items-center gap-3" style={{ color: 'var(--text-primary)' }}>
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: 'var(--bg-badge)', border: '1px solid var(--border-accent)' }}
              >
                <Palette size={18} style={{ color: 'var(--accent-blue)' }} />
              </div>
              <div>
                <h2 className="font-semibold text-base sm:text-lg">{t('settings.appearanceTitle')}</h2>
                <p className="text-xs sm:text-sm" style={{ color: 'var(--text-tertiary)' }}>
                  {t('settings.appearanceSubtitle')}
                </p>
              </div>
            </div>

            <div
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
              style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-secondary)', color: 'var(--text-tertiary)' }}
            >
              <Sparkles size={12} style={{ color: 'var(--accent-blue)' }} />
              {t('settings.activeTheme')}: {theme === 'dark' ? (language === 'hi' ? 'डार्क मोड' : 'Dark Mode') : (language === 'hi' ? 'लाइट मोड' : 'Light Mode')}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Dark Mode Option */}
            <motion.button
              type="button"
              onClick={() => setTheme('dark')}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="relative p-5 rounded-2xl text-left transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden"
              style={{
                background: theme === 'dark' ? 'rgba(15, 17, 23, 0.95)' : 'var(--bg-subtle)',
                border: theme === 'dark' ? '2px solid var(--accent-blue)' : '1px solid var(--border-primary)',
                boxShadow: theme === 'dark' ? '0 0 25px rgba(59, 130, 246, 0.2)' : 'none',
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: '#0a0c10', border: '1px solid rgba(255,255,255,0.1)' }}
                  >
                    <Moon size={18} className="text-blue-400" />
                  </div>
                  <div>
                    <span className="font-semibold text-sm block" style={{ color: '#f0f3f8' }}>
                      {t('settings.darkMode')}
                    </span>
                    <span className="text-xs" style={{ color: '#9ba3b4' }}>
                      {t('settings.darkModeSub')}
                    </span>
                  </div>
                </div>

                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center"
                  style={{
                    border: theme === 'dark' ? 'none' : '2px solid var(--border-primary)',
                    background: theme === 'dark' ? 'var(--accent-blue)' : 'transparent',
                  }}
                >
                  {theme === 'dark' && <Check size={12} className="text-white" />}
                </div>
              </div>

              {/* Mini mockup */}
              <div
                className="rounded-lg p-2.5 flex items-center gap-2 mt-2"
                style={{ background: '#050608', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
                <div className="h-2 w-20 rounded bg-slate-700" />
                <div className="h-2 w-12 rounded bg-slate-800 ml-auto" />
              </div>
            </motion.button>

            {/* Light Mode Option */}
            <motion.button
              type="button"
              onClick={() => setTheme('light')}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="relative p-5 rounded-2xl text-left transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden"
              style={{
                background: theme === 'light' ? 'rgba(255, 255, 255, 0.95)' : 'var(--bg-subtle)',
                border: theme === 'light' ? '2px solid var(--accent-blue)' : '1px solid var(--border-primary)',
                boxShadow: theme === 'light' ? '0 0 25px rgba(37, 99, 235, 0.2)' : 'none',
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: '#f1f5f9', border: '1px solid rgba(0,0,0,0.1)' }}
                  >
                    <Sun size={18} className="text-amber-500" />
                  </div>
                  <div>
                    <span className="font-semibold text-sm block" style={{ color: theme === 'light' ? '#0f172a' : 'var(--text-primary)' }}>
                      {t('settings.lightMode')}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                      {t('settings.lightModeSub')}
                    </span>
                  </div>
                </div>

                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center"
                  style={{
                    border: theme === 'light' ? 'none' : '2px solid var(--border-primary)',
                    background: theme === 'light' ? 'var(--accent-blue)' : 'transparent',
                  }}
                >
                  {theme === 'light' && <Check size={12} className="text-white" />}
                </div>
              </div>

              {/* Mini mockup */}
              <div
                className="rounded-lg p-2.5 flex items-center gap-2 mt-2"
                style={{ background: '#f8fafc', border: '1px solid rgba(0,0,0,0.08)' }}
              >
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <div className="h-2 w-20 rounded bg-slate-300" />
                <div className="h-2 w-12 rounded bg-slate-200 ml-auto" />
              </div>
            </motion.button>
          </div>

          {/* Quick toggle switch */}
          <div className="mt-5 pt-4 flex items-center justify-between" style={{ borderTop: '1px solid var(--divider)' }}>
            <span className="text-xs sm:text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
              {t('settings.toggleThemeInstantly')}
            </span>
            <button
              type="button"
              onClick={toggleTheme}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all duration-200"
              style={{
                background: 'var(--bg-badge)',
                border: '1px solid var(--border-accent)',
                color: 'var(--accent-blue)',
              }}
            >
              {theme === 'dark' ? (
                <>
                  <Sun size={14} className="text-amber-400" />
                  {t('settings.switchToLight')}
                </>
              ) : (
                <>
                  <Moon size={14} className="text-blue-500" />
                  {t('settings.switchToDark')}
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* 3. Account Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-2xl p-6 sm:p-8 mb-6"
        >
          <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
            <div className="flex items-center gap-3" style={{ color: 'var(--text-primary)' }}>
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: 'var(--bg-badge)', border: '1px solid var(--border-accent)' }}
              >
                <User size={18} style={{ color: 'var(--accent-blue)' }} />
              </div>
              <div>
                <h2 className="font-semibold text-base sm:text-lg">{t('settings.accountTitle')}</h2>
                <p className="text-xs sm:text-sm" style={{ color: 'var(--text-tertiary)' }}>
                  {user ? t('settings.accountSubtitleAuth') : t('settings.accountSubtitleGuest')}
                </p>
              </div>
            </div>

            {user ? (
              <span
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium"
                style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', color: '#10b981' }}
              >
                <UserCheck size={12} />
                {t('settings.authenticated')}
              </span>
            ) : (
              <span
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium"
                style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-secondary)', color: 'var(--text-tertiary)' }}
              >
                {t('settings.guestBadge')}
              </span>
            )}
          </div>

          {user ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-tertiary)' }}>
                    {t('settings.displayName')}
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={t('settings.namePlaceholder')}
                    className="w-full px-4 py-3 rounded-xl text-sm sm:text-base outline-none input-premium"
                    style={{
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-tertiary)' }}>
                    {t('settings.emailAddress')}
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-quaternary)' }} />
                    <input
                      type="email"
                      value={user.email || ''}
                      disabled
                      className="w-full pl-10 pr-4 py-3 rounded-xl text-sm sm:text-base outline-none opacity-80"
                      style={{
                        background: 'var(--bg-input)',
                        color: 'var(--text-secondary)',
                        border: '1px solid var(--border-secondary)',
                      }}
                    />
                  </div>
                </div>
              </div>

              <div
                className="flex items-center justify-between px-4 py-3 rounded-xl text-xs flex-wrap gap-2"
                style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-secondary)' }}
              >
                <div className="flex items-center gap-2">
                  <span style={{ color: 'var(--text-quaternary)' }}>{t('settings.accountStatus')}</span>
                  <span className="font-semibold capitalize" style={{ color: 'var(--text-primary)' }}>
                    {profile?.role || 'Creator'} {language === 'hi' ? 'खाता' : 'Account'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span style={{ color: 'var(--text-quaternary)' }}>{t('settings.securityStatus')}</span>
                  <span className="font-semibold" style={{ color: '#10b981' }}>{t('settings.securityActive')}</span>
                </div>
              </div>

              {profileError && (
                <div className="text-sm py-2 px-3 rounded-lg" style={{ color: 'var(--accent-red)', background: 'rgba(239,68,68,0.1)' }}>
                  {profileError}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <motion.button
                  onClick={handleProfileSave}
                  disabled={loading}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 py-3 px-4 rounded-xl font-semibold text-white text-sm transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer btn-premium"
                  style={{ background: saved ? '#10b981' : undefined }}
                >
                  {saved ? (
                    <>
                      <Check size={16} />
                      {t('settings.profileSaved')}
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      {t('settings.saveChanges')}
                    </>
                  )}
                </motion.button>

                <button
                  type="button"
                  onClick={() => setShowChangePassword(!showChangePassword)}
                  className="py-3 px-4 rounded-xl font-medium text-sm transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
                  style={{
                    background: 'var(--bg-badge)',
                    border: '1px solid var(--border-primary)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  <KeyRound size={16} />
                  {showChangePassword ? t('settings.closePasswordForm') : t('settings.updatePassword')}
                </button>
              </div>

              {/* Change password subsection */}
              <AnimatePresence>
                {showChangePassword && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden pt-3"
                  >
                    <div className="p-4 rounded-xl space-y-3" style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-secondary)' }}>
                      <h4 className="text-sm font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                        <Lock size={14} style={{ color: 'var(--accent-blue)' }} />
                        {t('settings.changePasswordTitle')}
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs mb-1" style={{ color: 'var(--text-tertiary)' }}>{t('settings.newPassword')}</label>
                          <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder={t('settings.passwordPlaceholder')}
                            minLength={6}
                            className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none input-premium"
                            style={{ color: 'var(--text-primary)' }}
                          />
                        </div>
                        <div>
                          <label className="block text-xs mb-1" style={{ color: 'var(--text-tertiary)' }}>{t('settings.confirmPassword')}</label>
                          <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder={t('settings.confirmPlaceholder')}
                            minLength={6}
                            className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none input-premium"
                            style={{ color: 'var(--text-primary)' }}
                          />
                        </div>
                      </div>

                      {passwordError && (
                        <div className="text-xs py-2 px-3 rounded-lg" style={{ color: 'var(--accent-red)', background: 'rgba(239,68,68,0.1)' }}>
                          {passwordError}
                        </div>
                      )}

                      {passwordSuccess && (
                        <div className="text-xs py-2 px-3 rounded-lg" style={{ color: '#10b981', background: 'rgba(16,185,129,0.1)' }}>
                          {t('settings.passwordSuccess')}
                        </div>
                      )}

                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setShowChangePassword(false)}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer"
                          style={{ color: 'var(--text-tertiary)' }}
                        >
                          {t('settings.cancel')}
                        </button>
                        <button
                          type="button"
                          onClick={handlePasswordChange}
                          disabled={loading}
                          className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white cursor-pointer btn-premium disabled:opacity-50"
                        >
                          {loading ? t('settings.saving') : t('settings.applyNewPassword')}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Logout button row */}
              <div className="pt-4 mt-2 flex items-center justify-between" style={{ borderTop: '1px solid var(--divider)' }}>
                <div>
                  <span className="text-sm font-medium block" style={{ color: 'var(--text-primary)' }}>{t('settings.signOutBtn')}</span>
                  <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{t('settings.signOutDesc')}</span>
                </div>
                <button
                  type="button"
                  onClick={handleSignOut}
                  disabled={loggingOut}
                  className="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer flex items-center gap-2 hover:opacity-90"
                  style={{
                    background: 'rgba(239,68,68,0.1)',
                    border: '1px solid rgba(239,68,68,0.25)',
                    color: 'var(--accent-red)',
                  }}
                >
                  <LogOut size={14} />
                  {loggingOut ? t('settings.signingOut') : t('settings.signOutBtn')}
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <div
                className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center"
                style={{ background: 'var(--bg-badge)', border: '1px solid var(--border-accent)' }}
              >
                <User size={22} style={{ color: 'var(--accent-blue)' }} />
              </div>
              <h3 className="text-base font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                {t('settings.guestTitle')}
              </h3>
              <p className="text-xs sm:text-sm max-w-md mx-auto mb-5" style={{ color: 'var(--text-tertiary)' }}>
                {t('settings.guestDesc')}
              </p>
              <div className="flex items-center justify-center gap-3">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-white text-sm cursor-pointer btn-premium"
                >
                  <User size={15} />
                  {t('settings.signInCreate')}
                </Link>
              </div>
            </div>
          )}
        </motion.div>

        {/* 4. Notifications Preference */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass-card rounded-2xl p-6 sm:p-8 mb-6"
        >
          <div className="flex items-center gap-3 mb-6" style={{ color: 'var(--text-primary)' }}>
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'var(--bg-badge)', border: '1px solid var(--border-accent)' }}
            >
              <Bell size={18} style={{ color: 'var(--accent-blue)' }} />
            </div>
            <div>
              <h2 className="font-semibold text-base sm:text-lg">{t('settings.notificationsTitle')}</h2>
              <p className="text-xs sm:text-sm" style={{ color: 'var(--text-tertiary)' }}>
                {t('settings.notificationsSubtitle')}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{t('settings.trendAlerts')}</div>
              <div className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>{t('settings.trendAlertsDesc')}</div>
            </div>
            <button
              type="button"
              onClick={() => setNotifications(!notifications)}
              className={`w-12 h-7 rounded-full relative transition-colors duration-200 cursor-pointer ${notifications ? 'bg-blue-600' : 'bg-gray-500'}`}
              aria-label="Toggle notifications"
            >
              <div
                className={`w-5 h-5 rounded-full bg-white absolute top-1 transition-transform duration-200 ${notifications ? 'translate-x-6' : 'translate-x-1'}`}
              />
            </button>
          </div>
        </motion.div>

        {/* 5. Privacy & Security section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-2xl p-6 sm:p-8"
        >
          <div className="flex items-center gap-3 mb-4" style={{ color: 'var(--text-primary)' }}>
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'var(--bg-badge)', border: '1px solid var(--border-accent)' }}
            >
              <Shield size={18} style={{ color: 'var(--accent-blue)' }} />
            </div>
            <div>
              <h2 className="font-semibold text-base sm:text-lg">{t('settings.privacyTitle')}</h2>
              <p className="text-xs sm:text-sm" style={{ color: 'var(--text-tertiary)' }}>
                {t('settings.privacySubtitle')}
              </p>
            </div>
          </div>

          <div className="space-y-2 text-xs sm:text-sm" style={{ color: 'var(--text-tertiary)' }}>
            <p>{t('settings.privacyP1')}</p>
            <p>{t('settings.privacyP2')}</p>
          </div>

          <div className="mt-5 pt-4 flex gap-4" style={{ borderTop: '1px solid var(--divider)' }}>
            <Link
              to="/privacy"
              className="text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity flex items-center gap-1"
              style={{ color: 'var(--accent-blue)' }}
            >
              {t('settings.viewPrivacyPolicy')}
            </Link>
            <Link
              to="/contact"
              className="text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity"
              style={{ color: 'var(--text-secondary)' }}
            >
              {t('settings.contactSupport')}
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
