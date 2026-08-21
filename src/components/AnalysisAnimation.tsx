import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState, useRef, useMemo } from 'react'
import {
  Brain, Video, Fish, Music, MessageSquare, Users, TrendingUp,
  Heart, Flame, Lightbulb, Sparkles, Check
} from 'lucide-react'
import { useLanguage } from '../lib/LanguageContext'

const STEP_ICONS = [
  { icon: Brain, key: 'step1' },
  { icon: Video, key: 'step2' },
  { icon: Fish, key: 'step3' },
  { icon: Music, key: 'step4' },
  { icon: MessageSquare, key: 'step5' },
  { icon: Users, key: 'step6' },
  { icon: TrendingUp, key: 'step7' },
  { icon: Heart, key: 'step8' },
  { icon: Flame, key: 'step9' },
  { icon: Lightbulb, key: 'step10' },
  { icon: Sparkles, key: 'step11' },
]

interface Particle {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
  color: string
  duration: number
}

function useParticles(count: number, active: boolean) {
  const [particles, setParticles] = useState<Particle[]>([])

  useEffect(() => {
    if (!active) return
    const colors = ['#3b82f6', '#6366f1', '#06b6d4', '#818cf8', '#60a5fa']
    const initial: Particle[] = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      vx: (Math.random() - 0.5) * 0.15,
      vy: (Math.random() - 0.5) * 0.15,
      size: Math.random() * 3 + 1,
      opacity: Math.random() * 0.4 + 0.1,
      color: colors[Math.floor(Math.random() * colors.length)],
      duration: 2 + (i % 5) * 0.4,
    }))
    setParticles(initial)

    const interval = setInterval(() => {
      setParticles((prev) =>
        prev.map((p) => ({
          ...p,
          x: p.x + p.vx < 0 || p.x + p.vx > 100 ? p.x - p.vx : p.x + p.vx,
          y: p.y + p.vy < 0 || p.y + p.vy > 100 ? p.y - p.vy : p.y + p.vy,
        }))
      )
    }, 50)

    return () => clearInterval(interval)
  }, [count, active])

  return particles
}

function ParticleField({ active }: { active: boolean }) {
  const particles = useParticles(50, active)

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            opacity: p.opacity,
            boxShadow: `0 0 ${p.size * 3}px ${p.color}`,
          }}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [p.opacity, p.opacity * 2, p.opacity],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

function GlowOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div
        className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)', filter: 'blur(80px)' }}
        animate={{ x: [0, 60, 0], y: [0, 40, 0], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)', filter: 'blur(70px)' }}
        animate={{ x: [0, -50, 0], y: [0, -30, 0], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 70%)', filter: 'blur(100px)' }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  )
}

function ScanningLine() {
  return (
    <motion.div
      className="absolute left-0 right-0 h-px pointer-events-none"
      style={{
        background: 'linear-gradient(90deg, transparent 0%, rgba(59,130,246,0.6) 50%, transparent 100%)',
        boxShadow: '0 0 20px rgba(59,130,246,0.4)',
      }}
      initial={{ top: '0%' }}
      animate={{ top: '100%' }}
      transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
    />
  )
}

function GradientShiftBar({ progress }: { progress: number }) {
  return (
    <div className="h-1.5 rounded-full score-track overflow-hidden">
      <motion.div
        className="h-full rounded-full relative"
        style={{
          width: `${progress}%`,
          background: 'linear-gradient(90deg, #3b82f6, #6366f1, #06b6d4, #3b82f6)',
          backgroundSize: '200% 100%',
          boxShadow: '0 0 12px rgba(59,130,246,0.4)',
        }}
        animate={{ backgroundPosition: ['0% 50%', '200% 50%'] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  )
}

function CircularProgress({ progress }: { progress: number }) {
  const size = 160
  const radius = (size - 16) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (progress / 100) * circumference

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="absolute" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="4" />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#progressGradient)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ filter: 'drop-shadow(0 0 8px rgba(59,130,246,0.5))' }}
        />
        <defs>
          <linearGradient id="progressGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="50%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
      </svg>
      <div className="relative z-10 text-center">
        <motion.div
          key={Math.floor(progress / 10)}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="text-4xl font-black tabular-nums"
          style={{ color: 'var(--accent-blue)', textShadow: '0 0 20px rgba(59,130,246,0.4)' }}
        >
          {progress}
        </motion.div>
        <div className="text-[10px] mt-0.5 tracking-widest uppercase" style={{ color: 'var(--text-quaternary)' }}>
          percent
        </div>
      </div>
    </div>
  )
}

interface StepItem {
  icon: React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>
  text: string
  detail: string
}

function StatusCard({ step, isActive, isCompleted, index }: {
  step: StepItem
  isActive: boolean
  isCompleted: boolean
  index: number
}) {
  const Icon = step.icon

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      className="flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300"
      style={{
        background: isActive ? 'rgba(59,130,246,0.08)' : 'transparent',
        border: isActive ? '1px solid rgba(59,130,246,0.2)' : '1px solid transparent',
      }}
    >
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300"
        style={{
          background: isCompleted
            ? 'rgba(16,185,129,0.12)'
            : isActive
              ? 'rgba(59,130,246,0.12)'
              : 'rgba(255,255,255,0.03)',
          border: `1px solid ${
            isCompleted
              ? 'rgba(16,185,129,0.25)'
              : isActive
                ? 'rgba(59,130,246,0.25)'
                : 'rgba(255,255,255,0.04)'
          }`,
        }}
      >
        {isCompleted ? (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300 }}>
            <Check size={16} style={{ color: '#10b981' }} />
          </motion.div>
        ) : isActive ? (
          <Icon size={16} style={{ color: 'var(--accent-blue)' }} className="animate-pulse" />
        ) : (
          <Icon size={16} style={{ color: 'var(--text-quaternary)' }} />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div
          className="text-sm font-medium transition-colors duration-300"
          style={{
            color: isCompleted
              ? 'var(--text-tertiary)'
              : isActive
                ? 'var(--text-primary)'
                : 'var(--text-quaternary)',
          }}
        >
          {step.text}
        </div>
        <AnimatePresence>
          {isActive && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="text-xs mt-0.5"
              style={{ color: 'var(--text-tertiary)' }}
            >
              {step.detail}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {isActive && (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-4 h-4 rounded-full border-2 border-transparent flex-shrink-0"
          style={{ borderTopColor: 'var(--accent-blue)', borderRightColor: 'var(--accent-blue)' }}
        />
      )}
      {isCompleted && !isActive && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-shrink-0">
          <Check size={14} style={{ color: '#10b981' }} />
        </motion.div>
      )}
    </motion.div>
  )
}

interface AnalysisAnimationProps {
  onComplete: () => void
  duration?: number
}

export default function AnalysisAnimation({ onComplete, duration = 5500 }: AnalysisAnimationProps) {
  const { t, language } = useLanguage()
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())
  const [progress, setProgress] = useState(0)
  const [isExiting, setIsExiting] = useState(false)
  const startTimeRef = useRef<number>(0)

  const steps = useMemo(() => {
    return STEP_ICONS.map((item) => ({
      icon: item.icon,
      text: t(`anim.${item.key}`),
      detail: t(`anim.${item.key}Detail`),
    }))
  }, [t])

  useEffect(() => {
    startTimeRef.current = Date.now()

    const stepInterval = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current
      const stepIndex = Math.min(Math.floor((elapsed / duration) * steps.length), steps.length - 1)

      setCurrentStep(stepIndex)
      setProgress(Math.min(Math.round((elapsed / duration) * 100), 99))

      if (stepIndex > 0) {
        setCompletedSteps((prev) => {
          const next = new Set(prev)
          for (let i = 0; i < stepIndex; i++) next.add(i)
          return next
        })
      }
    }, 50)

    const completeTimeout = setTimeout(() => {
      setProgress(100)
      setCompletedSteps(new Set(steps.map((_, i) => i)))
      setIsExiting(true)
      setTimeout(() => onComplete(), 700)
    }, duration)

    return () => {
      clearInterval(stepInterval)
      clearTimeout(completeTimeout)
    }
  }, [duration, onComplete, steps.length])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: isExiting ? 0 : 1 }}
      exit={{ opacity: 0, transition: { duration: 0.5 } }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 z-50 flex items-center justify-center px-4 overflow-hidden"
      style={{ background: 'var(--bg-primary)' }}
    >
      {/* Background layers */}
      <GlowOrbs />
      <ParticleField active={!isExiting} />
      <ScanningLine />
      <div className="absolute inset-0 grid-bg opacity-20" />

      {/* Main content */}
      <div className="relative z-10 max-w-lg w-full">
        {/* Central icon with pulsing rings */}
        <div className="flex flex-col items-center mb-10">
          <div className="relative">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="absolute inset-0 rounded-full"
                style={{ border: '1px solid rgba(59,130,246,0.2)' }}
                animate={{ scale: [1, 1.8], opacity: [0.6, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.6, ease: 'easeOut' }}
              />
            ))}
            <motion.div
              animate={{ scale: [1, 1.08, 1], opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="relative w-20 h-20 rounded-3xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(99,102,241,0.08))',
                border: '1px solid rgba(59,130,246,0.3)',
                boxShadow: '0 0 40px rgba(59,130,246,0.2), inset 0 1px 0 rgba(255,255,255,0.05)',
              }}
            >
              <Brain size={36} style={{ color: 'var(--accent-blue)' }} />
            </motion.div>
          </div>

          <motion.h3
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl sm:text-2xl font-bold mt-6 mb-1 text-center"
            style={{ color: 'var(--text-primary)' }}
          >
            {t('anim.analyzingTitle')}
          </motion.h3>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-sm text-center"
            style={{ color: 'var(--text-tertiary)' }}
          >
            {t('anim.analyzingSub')}
          </motion.p>
        </div>

        {/* Progress circle */}
        <div className="flex justify-center mb-10">
          <CircularProgress progress={progress} />
        </div>

        {/* Steps list */}
        <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin' }}>
          {steps.map((step, i) => (
            <StatusCard
              key={i}
              step={step}
              index={i}
              isActive={i === currentStep && !isExiting}
              isCompleted={completedSteps.has(i)}
            />
          ))}
        </div>

        {/* Bottom progress bar */}
        <div className="mt-8">
          <div className="flex justify-between text-xs mb-2" style={{ color: 'var(--text-quaternary)' }}>
            <span>{completedSteps.size}/{steps.length} {language === 'hi' ? 'स्तर पूर्ण' : 'layers complete'}</span>
            <span className="tabular-nums">{progress}%</span>
          </div>
          <GradientShiftBar progress={progress} />
        </div>
      </div>
    </motion.div>
  )
}
