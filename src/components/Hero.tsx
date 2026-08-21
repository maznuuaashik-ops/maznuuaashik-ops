import { motion, AnimatePresence } from 'framer-motion'
import {
  Zap,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Check,
  Camera,
  Link2,
  Loader2,
  Cpu,
  Shield,
  Smartphone,
  UploadCloud,
  FileVideo,
  X,
  Film,
} from 'lucide-react'
import { useState, useEffect, useMemo, useRef } from 'react'
import { validateVideoFile } from '../lib/api'
import { useLanguage } from '../lib/LanguageContext'

interface HeroProps {
  onAnalyze: (url: string) => void
  onAnalyzeVideo?: (file: File) => void
  isLoading: boolean
  error: string | null
}

const INSTAGRAM_REEL_REGEX = /instagram\.com\/(reel|p|tv)\/[A-Za-z0-9_-]+/

type ValidationState = 'idle' | 'valid' | 'invalid' | 'checking'
type Mode = 'url' | 'file'

export default function Hero({ onAnalyze, onAnalyzeVideo, isLoading, error }: HeroProps) {
  const { t } = useLanguage()
  const [mode, setMode] = useState<Mode>('url')
  const [url, setUrl] = useState('')
  const [validationState, setValidationState] = useState<ValidationState>('idle')
  const [validationError, setValidationError] = useState<string | null>(null)

  // Video file state
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Debounced live validation for URL
  useEffect(() => {
    if (!url.trim()) {
      setValidationState('idle')
      setValidationError(null)
      return
    }

    setValidationState('checking')
    const timer = setTimeout(() => {
      if (INSTAGRAM_REEL_REGEX.test(url.trim())) {
        setValidationState('valid')
        setValidationError(null)
      } else {
        setValidationState('invalid')
        setValidationError(t('hero.urlInvalid'))
      }
    }, 400)

    return () => clearTimeout(timer)
  }, [url, t])

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = url.trim()
    if (!trimmed) return

    if (!INSTAGRAM_REEL_REGEX.test(trimmed)) {
      setValidationState('invalid')
      setValidationError(t('hero.urlInvalid'))
      return
    }

    setValidationError(null)
    onAnalyze(trimmed)
  }

  const handleFileChange = (file: File | null) => {
    setFileError(null)
    if (!file) {
      setSelectedFile(null)
      return
    }

    const validation = validateVideoFile(file)
    if (!validation.valid) {
      if (validation.error?.includes('size') || validation.error?.includes('150MB')) {
        setFileError(t('hero.fileTooLarge'))
      } else if (validation.error?.includes('format')) {
        setFileError(t('hero.unsupportedFormat'))
      } else {
        setFileError(validation.error || t('hero.unsupportedFormat'))
      }
      setSelectedFile(null)
      return
    }

    setSelectedFile(file)
  }

  const handleFileSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFile) {
      setFileError(t('hero.fileEmpty'))
      return
    }

    const validation = validateVideoFile(selectedFile)
    if (!validation.valid) {
      if (validation.error?.includes('size') || validation.error?.includes('150MB')) {
        setFileError(t('hero.fileTooLarge'))
      } else {
        setFileError(validation.error || t('hero.unsupportedFormat'))
      }
      return
    }

    setFileError(null)
    if (onAnalyzeVideo) {
      onAnalyzeVideo(selectedFile)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0])
    }
  }

  const displayError = mode === 'url' ? (validationError || error) : (fileError || error)
  const canSubmitUrl = validationState === 'valid' && !isLoading
  const canSubmitFile = !!selectedFile && !fileError && !isLoading

  // Input border color based on state
  const inputBorder = useMemo(() => {
    if (validationState === 'valid') return 'rgba(16,185,129,0.4)'
    if (validationState === 'invalid') return 'rgba(239,68,68,0.4)'
    return undefined
  }, [validationState])

  // Input glow based on state
  const inputGlow = useMemo(() => {
    if (validationState === 'valid') return '0 0 0 3px rgba(16,185,129,0.1), 0 0 20px rgba(16,185,129,0.08)'
    if (validationState === 'invalid') return '0 0 0 3px rgba(239,68,68,0.1)'
    return undefined
  }, [validationState])

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-4 py-24 sm:py-20 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full opacity-[0.07] blur-[120px]" style={{ background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full opacity-[0.05] blur-[100px]" style={{ background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-[0.03] blur-[140px]" style={{ background: 'radial-gradient(circle, #06b6d4 0%, transparent 70%)' }} />
        <div className="absolute inset-0 grid-bg opacity-30" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto w-full text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 glass neon-border"
        >
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-sm font-medium tracking-widest uppercase" style={{ color: 'var(--accent-blue)' }}>
            {t('hero.badge')}
          </span>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tighter mb-4 select-none"
          style={{ lineHeight: 0.95 }}
        >
          <span className="shimmer-text">YORNAM</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="text-xl md:text-2xl font-light mb-4 tracking-wide"
          style={{ color: 'var(--text-secondary)' }}
        >
          {t('hero.subtitle')}
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="text-base mb-10 sm:mb-12 max-w-xl mx-auto"
          style={{ color: 'var(--text-tertiary)' }}
        >
          {t('hero.description')}
        </motion.p>

        {/* Mode Selector Tabs (Paste Reel Link OR Upload Video) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="flex items-center justify-center gap-2 mb-4"
        >
          <button
            type="button"
            onClick={() => {
              setMode('url')
              setFileError(null)
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer"
            style={{
              background: mode === 'url' ? 'var(--bg-badge)' : 'var(--bg-subtle)',
              border: mode === 'url' ? '1px solid var(--border-accent)' : '1px solid var(--border-secondary)',
              color: mode === 'url' ? 'var(--accent-blue)' : 'var(--text-tertiary)',
              boxShadow: mode === 'url' ? '0 0 15px rgba(59,130,246,0.15)' : 'none',
            }}
          >
            <Link2 size={15} />
            <span>{t('hero.tabPasteLink')}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMode('file')
              setValidationError(null)
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer"
            style={{
              background: mode === 'file' ? 'var(--bg-badge)' : 'var(--bg-subtle)',
              border: mode === 'file' ? '1px solid var(--border-accent)' : '1px solid var(--border-secondary)',
              color: mode === 'file' ? 'var(--accent-blue)' : 'var(--text-tertiary)',
              boxShadow: mode === 'file' ? '0 0 15px rgba(59,130,246,0.15)' : 'none',
            }}
          >
            <Film size={15} />
            <span>{t('hero.tabUploadVideo')}</span>
          </button>
        </motion.div>

        {/* 1. URL Input Form */}
        {mode === 'url' && (
          <motion.form
            key="url-form"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            onSubmit={handleUrlSubmit}
            className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto"
          >
            <div className="flex-1 relative">
              {/* Left icon — Instagram or link */}
              <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <AnimatePresence mode="wait">
                  {validationState === 'valid' ? (
                    <motion.div
                      key="ig"
                      initial={{ scale: 0, rotate: -90 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0, rotate: 90 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    >
                      <Camera size={18} style={{ color: '#10b981' }} />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="link"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <Link2 size={18} style={{ color: 'var(--text-quaternary)' }} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder={t('hero.urlPlaceholder')}
                className="w-full pl-12 pr-12 py-4 rounded-xl text-base outline-none transition-all duration-300 input-premium min-h-[56px]"
                style={{
                  color: 'var(--text-primary)',
                  borderColor: inputBorder,
                  boxShadow: inputGlow,
                }}
                disabled={isLoading}
                aria-label="Instagram Reel URL"
              />

              {/* Right icon — status indicator */}
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <AnimatePresence mode="wait">
                  {validationState === 'checking' && (
                    <motion.div key="checking" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <Loader2 size={18} className="animate-spin" style={{ color: 'var(--text-quaternary)' }} />
                    </motion.div>
                  )}
                  {validationState === 'valid' && (
                    <motion.div key="valid" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ type: 'spring', stiffness: 300 }}>
                      <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)' }}>
                        <Check size={12} style={{ color: '#10b981' }} />
                      </div>
                    </motion.div>
                  )}
                  {validationState === 'invalid' && url.trim() && (
                    <motion.div key="invalid" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ type: 'spring', stiffness: 300 }}>
                      <AlertCircle size={18} style={{ color: 'var(--accent-red)' }} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={!canSubmitUrl}
              whileHover={canSubmitUrl ? { scale: 1.02 } : undefined}
              whileTap={canSubmitUrl ? { scale: 0.97 } : undefined}
              className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold text-white text-base transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer btn-premium min-h-[56px]"
              style={{
                minWidth: '160px',
                boxShadow: canSubmitUrl ? '0 0 30px rgba(59,130,246,0.3), 0 0 60px rgba(59,130,246,0.1)' : undefined,
              }}
            >
              <Zap size={18} className={isLoading ? 'animate-spin' : ''} />
              {isLoading ? t('hero.analyzingBtn') : t('hero.analyzeReelBtn')}
              {!isLoading && <ArrowRight size={16} />}
            </motion.button>
          </motion.form>
        )}

        {/* 2. Video File Upload Form */}
        {mode === 'file' && (
          <motion.form
            key="file-form"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            onSubmit={handleFileSubmit}
            className="flex flex-col gap-3 max-w-2xl mx-auto"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="video/mp4,video/quicktime,video/webm,video/x-msvideo,video/x-matroska,video/*,.mp4,.mov,.webm,.avi,.m4v,.mkv"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleFileChange(e.target.files[0])
                }
              }}
              className="hidden"
            />

            {!selectedFile ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className="relative p-6 sm:p-8 rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer flex flex-col items-center justify-center gap-2"
                style={{
                  background: isDragging ? 'rgba(59,130,246,0.08)' : 'var(--bg-subtle)',
                  borderColor: isDragging ? 'var(--accent-blue)' : 'var(--border-primary)',
                  boxShadow: isDragging ? '0 0 30px rgba(59,130,246,0.15)' : 'none',
                }}
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mb-1 transition-transform hover:scale-110"
                  style={{ background: 'var(--bg-badge)', border: '1px solid var(--border-accent)' }}
                >
                  <UploadCloud size={24} style={{ color: 'var(--accent-blue)' }} />
                </div>
                <div className="text-sm sm:text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {t('hero.dropzoneTitle')}
                </div>
                <p className="text-xs max-w-sm text-center" style={{ color: 'var(--text-tertiary)' }}>
                  {t('hero.dropzoneSubtitle')}
                </p>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-3 items-stretch">
                <div
                  className="flex-1 flex items-center justify-between px-4 py-3.5 rounded-xl border min-h-[56px]"
                  style={{
                    background: 'var(--bg-subtle)',
                    borderColor: 'rgba(16,185,129,0.3)',
                    boxShadow: '0 0 15px rgba(16,185,129,0.06)',
                  }}
                >
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981' }}
                    >
                      <FileVideo size={18} />
                    </div>
                    <div className="min-w-0 text-left">
                      <div className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                        {selectedFile.name}
                      </div>
                      <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • {t('hero.readyForAnalysis')}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null)
                      if (fileInputRef.current) fileInputRef.current.value = ''
                    }}
                    className="p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer flex-shrink-0"
                    style={{ color: 'var(--text-quaternary)' }}
                    title={t('hero.removeVideo')}
                  >
                    <X size={16} />
                  </button>
                </div>

                <motion.button
                  type="submit"
                  disabled={!canSubmitFile}
                  whileHover={canSubmitFile ? { scale: 1.02 } : undefined}
                  whileTap={canSubmitFile ? { scale: 0.97 } : undefined}
                  className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold text-white text-base transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer btn-premium min-h-[56px]"
                  style={{
                    minWidth: '160px',
                    boxShadow: canSubmitFile ? '0 0 30px rgba(59,130,246,0.3), 0 0 60px rgba(59,130,246,0.1)' : undefined,
                  }}
                >
                  <Zap size={18} className={isLoading ? 'animate-spin' : ''} />
                  {isLoading ? t('hero.analyzingBtn') : t('hero.analyzeVideoBtn')}
                  {!isLoading && <ArrowRight size={16} />}
                </motion.button>
              </div>
            )}
          </motion.form>
        )}

        {/* Success state */}
        <AnimatePresence>
          {mode === 'url' && validationState === 'valid' && !isLoading && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center justify-center gap-2 mt-4 text-sm"
              style={{ color: '#10b981' }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, delay: 0.1 }}
                className="w-5 h-5 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)' }}
              >
                <Check size={12} style={{ color: '#10b981' }} />
              </motion.div>
              <span>{t('hero.reelDetected')}</span>
            </motion.div>
          )}

          {mode === 'file' && selectedFile && !fileError && !isLoading && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center justify-center gap-2 mt-4 text-sm"
              style={{ color: '#10b981' }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, delay: 0.1 }}
                className="w-5 h-5 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)' }}
              >
                <Check size={12} style={{ color: '#10b981' }} />
              </motion.div>
              <span>{t('hero.videoValidated')}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error state */}
        <AnimatePresence>
          {displayError && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="flex items-center justify-center gap-2 mt-4 text-sm"
              style={{ color: 'var(--accent-red)' }}
            >
              <AlertCircle size={16} />
              <span>{displayError}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex items-center justify-center gap-3 sm:gap-4 mt-14 sm:mt-16 flex-wrap"
        >
          {[
            { label: t('hero.trustBadge1'), icon: Cpu },
            { label: t('hero.trustBadge2'), icon: Zap },
            { label: t('hero.trustBadge3'), icon: Shield },
            { label: t('hero.trustBadge4'), icon: Smartphone },
          ].map((badge) => {
            const Icon = badge.icon
            return (
              <div key={badge.label} className="flex items-center gap-2 px-4 py-2 rounded-full" style={{ background: 'var(--bg-badge)', border: '1px solid var(--border-primary)' }}>
                <Icon size={14} style={{ color: 'var(--accent-blue)' }} />
                <span className="text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>{badge.label}</span>
              </div>
            )
          })}
        </motion.div>

        {/* Feature pills */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="flex items-center justify-center gap-3 mt-8 flex-wrap"
        >
          {[t('hero.feat1'), t('hero.feat2'), t('hero.feat3'), t('hero.feat4')].map((feat) => (
            <div key={feat} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium" style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-secondary)', color: 'var(--text-tertiary)' }}>
              <Sparkles size={10} style={{ color: 'var(--accent-blue)' }} />
              {feat}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
