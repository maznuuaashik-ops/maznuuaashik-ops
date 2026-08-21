import { motion, useInView } from 'framer-motion'
import { useRef, useEffect, useState, useMemo } from 'react'
import { TrendingUp, Flame, Eye, ArrowUpRight, Sparkles, Clock, Heart, MessageCircle, Share2, Bookmark } from 'lucide-react'
import type { EnhancedReport } from '../lib/types'
import { useLanguage } from '../lib/LanguageContext'

function useTypewriter(text: string, active: boolean, speed = 18): string {
  const [displayed, setDisplayed] = useState('')
  useEffect(() => {
    if (!active || !text) return
    setDisplayed('')
    let i = 0
    const interval = setInterval(() => {
      i++
      setDisplayed(text.slice(0, i))
      if (i >= text.length) clearInterval(interval)
    }, speed)
    return () => clearInterval(interval)
  }, [text, active, speed])
  return displayed
}

interface SubMetric {
  label: string
  value: number
  color: string
}

interface ViralScoreProps {
  score: number
  subMetrics: SubMetric[]
  enhancedReport: EnhancedReport
}

function CircularProgress({ score, size = 200 }: { score: number; size?: number }) {
  const { t } = useLanguage()
  const [displayScore, setDisplayScore] = useState(0)
  const radius = (size - 20) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (displayScore / 100) * circumference

  useEffect(() => {
    let start = 0
    const duration = 2000
    const step = (timestamp: number) => {
      if (!start) start = timestamp
      const progress = Math.min((timestamp - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayScore(Math.round(eased * score))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [score])

  const getScoreConfig = (s: number) => {
    if (s >= 80) return { color: '#10b981', label: t('report.excellent'), glow: 'rgba(16, 185, 129, 0.35)' }
    if (s >= 60) return { color: '#3b82f6', label: t('report.good'), glow: 'rgba(59, 130, 246, 0.35)' }
    if (s >= 40) return { color: '#f59e0b', label: t('report.average'), glow: 'rgba(245, 158, 11, 0.35)' }
    return { color: '#ef4444', label: t('report.needsWork'), glow: 'rgba(239, 68, 68, 0.35)' }
  }

  const config = getScoreConfig(score)

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="absolute" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="8" />
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke={config.color} strokeWidth="8" strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
          style={{ transition: 'stroke-dashoffset 0.05s linear', filter: `drop-shadow(0 0 12px ${config.glow})` }}
        />
      </svg>
      <div className="relative z-10 text-center">
        <div className="text-5xl sm:text-6xl font-black tabular-nums" style={{ color: config.color, textShadow: `0 0 24px ${config.glow}` }}>
          {displayScore}
        </div>
        <div className="text-xs mt-1 tracking-widest uppercase font-medium" style={{ color: 'var(--text-tertiary)' }}>
          {t('report.outOf100')}
        </div>
      </div>
    </div>
  )
}

function RetentionCurve({ curve }: { curve: { time: string; retention: number }[] }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true })

  const maxRetention = 100
  const chartWidth = 100
  const chartHeight = 120

  const points = curve.map((p, i) => ({
    x: (i / (curve.length - 1)) * chartWidth,
    y: chartHeight - (p.retention / maxRetention) * chartHeight,
    retention: p.retention,
    time: p.time,
  }))

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const areaD = `${pathD} L ${chartWidth} ${chartHeight} L 0 ${chartHeight} Z`

  return (
    <div ref={ref} className="w-full">
      <div className="relative" style={{ height: chartHeight + 30 }}>
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="none" className="w-full" style={{ height: chartHeight }}>
          <defs>
            <linearGradient id="retentionGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
            </linearGradient>
          </defs>
          <motion.path
            d={areaD}
            fill="url(#retentionGradient)"
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
          />
          <motion.path
            d={pathD}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={inView ? { pathLength: 1 } : {}}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            style={{ filter: 'drop-shadow(0 0 4px rgba(59, 130, 246, 0.4))' }}
          />
          {points.map((p, i) => (
            <motion.circle
              key={i}
              cx={p.x}
              cy={p.y}
              r="1.5"
              fill="#3b82f6"
              initial={{ opacity: 0, scale: 0 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.3, delay: 0.5 + i * 0.1 }}
            />
          ))}
        </svg>
        <div className="flex justify-between mt-2 px-0.5">
          {curve.map((p) => (
            <span key={p.time} className="text-[10px]" style={{ color: 'var(--text-quaternary)' }}>{p.time}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

function EngagementStat({ icon: Icon, label, value, color, delay }: { icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>; label: string; value: string; color: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="flex items-center gap-3 p-3 rounded-xl"
      style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-secondary)' }}
    >
      <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${color}12`, border: `1px solid ${color}25` }}>
        <Icon size={16} style={{ color }} />
      </div>
      <div className="min-w-0">
        <div className="text-sm font-bold tabular-nums" style={{ color: 'var(--text-primary)' }}>{value}</div>
        <div className="text-[11px]" style={{ color: 'var(--text-quaternary)' }}>{label}</div>
      </div>
    </motion.div>
  )
}

export default function ViralScore({ score, subMetrics, enhancedReport }: ViralScoreProps) {
  const { t, translateText } = useLanguage()
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true })

  const getVerdict = (s: number) => {
    if (s >= 85) return { text: t('report.viralPotential'), icon: Flame, color: '#10b981' }
    if (s >= 65) return { text: t('report.strongPerformer'), icon: TrendingUp, color: '#3b82f6' }
    return { text: t('report.needsImprovement'), icon: Eye, color: '#f59e0b' }
  }

  const verdict = getVerdict(score)
  const VerdictIcon = verdict.icon

  const viralProbConfig = useMemo(() => {
    const v = enhancedReport.viralProbability
    if (v >= 70) return { color: '#10b981', label: t('report.high'), glow: 'rgba(16, 185, 129, 0.3)' }
    if (v >= 45) return { color: '#3b82f6', label: t('report.moderate'), glow: 'rgba(59, 130, 246, 0.3)' }
    return { color: '#f59e0b', label: t('report.low'), glow: 'rgba(245, 158, 11, 0.3)' }
  }, [enhancedReport.viralProbability, t])

  const { watchTimeEstimate, engagementPrediction } = enhancedReport
  const localizedVerdict = useMemo(() => {
    return translateText(enhancedReport.finalVerdict)
  }, [enhancedReport.finalVerdict, translateText])

  const typedVerdict = useTypewriter(localizedVerdict, inView)

  const getSubMetricLabel = (label: string) => {
    const lower = label.toLowerCase()
    if (lower.includes('hook')) return t('report.hookStrength')
    if (lower.includes('caption')) return t('report.captionPower')
    if (lower.includes('visual')) return t('report.visualQuality')
    if (lower.includes('audio')) return t('report.audioSync')
    if (lower.includes('trend')) return t('report.trendAlignment')
    return label
  }

  return (
    <section ref={ref} className="py-16 sm:py-24 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-10 sm:mb-14"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4 text-xs font-medium tracking-widest uppercase badge-premium">
            <Sparkles size={12} />
            {t('report.analysisComplete')}
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
            {t('report.viralityReportTitle')}
          </h2>
          <p className="text-sm sm:text-base max-w-lg mx-auto" style={{ color: 'var(--text-tertiary)' }}>
            {t('report.viralityReportSubtitle')}
          </p>
        </motion.div>

        {/* Main score card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="glass-card-premium rounded-3xl p-6 sm:p-10 mb-6"
        >
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 sm:gap-12">
            {/* Score ring */}
            <div className="flex flex-col items-center gap-5">
              {inView && <CircularProgress score={score} />}
              <div
                className="flex items-center gap-2 px-5 py-2.5 rounded-full"
                style={{ background: `${verdict.color}12`, border: `1px solid ${verdict.color}30` }}
              >
                <VerdictIcon size={16} style={{ color: verdict.color }} />
                <span className="text-sm font-semibold" style={{ color: verdict.color }}>{verdict.text}</span>
                <ArrowUpRight size={14} style={{ color: verdict.color }} />
              </div>
            </div>

            {/* Sub-metrics */}
            <div className="flex-1 w-full max-w-md space-y-5">
              {subMetrics.map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: 30 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.3 + i * 0.08 }}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                      {getSubMetricLabel(item.label)}
                    </span>
                    <span className="text-sm font-bold tabular-nums" style={{ color: item.color }}>{item.value}%</span>
                  </div>
                  <div className="h-2 rounded-full score-track">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={inView ? { width: `${item.value}%` } : {}}
                      transition={{ duration: 1.2, delay: 0.4 + i * 0.1, ease: 'easeOut' }}
                      className="h-full rounded-full"
                      style={{
                        background: `linear-gradient(90deg, ${item.color}, ${item.color}88)`,
                        boxShadow: `0 0 8px ${item.color}40`,
                      }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Viral Probability + Watch Time + Engagement row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Viral Probability */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="glass-card rounded-2xl p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <Flame size={16} style={{ color: viralProbConfig.color }} />
              <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                {t('report.viralProbTitle')}
              </h3>
            </div>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-4xl font-black tabular-nums" style={{ color: viralProbConfig.color, textShadow: `0 0 20px ${viralProbConfig.glow}` }}>
                {enhancedReport.viralProbability}%
              </span>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: `${viralProbConfig.color}15`, color: viralProbConfig.color }}>
                {viralProbConfig.label}
              </span>
            </div>
            <div className="h-2 rounded-full score-track mb-2">
              <motion.div
                initial={{ width: 0 }}
                animate={inView ? { width: `${enhancedReport.viralProbability}%` } : {}}
                transition={{ duration: 1.2, delay: 0.5, ease: 'easeOut' }}
                className="h-full rounded-full"
                style={{ background: `linear-gradient(90deg, ${viralProbConfig.color}, ${viralProbConfig.color}88)`, boxShadow: `0 0 10px ${viralProbConfig.color}50` }}
              />
            </div>
            <p className="text-xs mt-3" style={{ color: 'var(--text-tertiary)' }}>
              {t('report.viralProbSubtitle')}
            </p>
            {/* Confidence level */}
            <div className="mt-4 pt-3" style={{ borderTop: '1px solid var(--divider)' }}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] tracking-wider uppercase" style={{ color: 'var(--text-quaternary)' }}>
                  {t('report.confidence')}
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{
                  background: enhancedReport.confidence.level === 'high' ? 'rgba(16,185,129,0.12)' : enhancedReport.confidence.level === 'medium' ? 'rgba(59,130,246,0.12)' : 'rgba(245,158,11,0.12)',
                  color: enhancedReport.confidence.level === 'high' ? '#10b981' : enhancedReport.confidence.level === 'medium' ? '#3b82f6' : '#f59e0b',
                }}>
                  {enhancedReport.confidence.score}% {enhancedReport.confidence.level === 'high' ? t('report.high') : enhancedReport.confidence.level === 'medium' ? t('report.moderate') : t('report.low')}
                </span>
              </div>
              <div className="h-1 rounded-full score-track">
                <motion.div
                  initial={{ width: 0 }}
                  animate={inView ? { width: `${enhancedReport.confidence.score}%` } : {}}
                  transition={{ duration: 1, delay: 0.6 }}
                  className="h-full rounded-full"
                  style={{
                    background: enhancedReport.confidence.level === 'high' ? '#10b981' : enhancedReport.confidence.level === 'medium' ? '#3b82f6' : '#f59e0b',
                  }}
                />
              </div>
              <p className="text-[11px] mt-2 leading-relaxed" style={{ color: 'var(--text-quaternary)' }}>
                {translateText(enhancedReport.confidence.reasoning)}
              </p>
            </div>
          </motion.div>

          {/* Watch Time */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="glass-card rounded-2xl p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <Clock size={16} style={{ color: 'var(--accent-indigo)' }} />
              <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                {t('report.watchTimeTitle')}
              </h3>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div>
                <div className="text-xl font-bold tabular-nums" style={{ color: 'var(--text-primary)' }}>{watchTimeEstimate.avgWatchTime}</div>
                <div className="text-[10px] tracking-wider uppercase" style={{ color: 'var(--text-quaternary)' }}>{t('report.avgWatch')}</div>
              </div>
              <div>
                <div className="text-xl font-bold tabular-nums" style={{ color: 'var(--text-primary)' }}>{watchTimeEstimate.completionRate}%</div>
                <div className="text-[10px] tracking-wider uppercase" style={{ color: 'var(--text-quaternary)' }}>{t('report.completion')}</div>
              </div>
              <div>
                <div className="text-xl font-bold tabular-nums" style={{ color: 'var(--text-primary)' }}>{watchTimeEstimate.estimatedReplays.toFixed(1)}x</div>
                <div className="text-[10px] tracking-wider uppercase" style={{ color: 'var(--text-quaternary)' }}>{t('report.replays')}</div>
              </div>
            </div>
            <div className="text-xs mb-2 font-medium" style={{ color: 'var(--text-tertiary)' }}>{t('report.retentionCurve')}</div>
            <RetentionCurve curve={watchTimeEstimate.retentionCurve} />
          </motion.div>

          {/* Engagement Prediction */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="glass-card rounded-2xl p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={16} style={{ color: 'var(--accent-cyan)' }} />
              <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                {t('report.engagementTitle')}
              </h3>
            </div>
            <div className="space-y-2.5">
              <EngagementStat icon={Heart} label={t('report.estLikes')} value={engagementPrediction.estimatedLikes} color="#f43f5e" delay={0.6} />
              <EngagementStat icon={MessageCircle} label={t('report.estComments')} value={engagementPrediction.estimatedComments} color="#3b82f6" delay={0.65} />
              <EngagementStat icon={Share2} label={t('report.estShares')} value={engagementPrediction.estimatedShares} color="#06b6d4" delay={0.7} />
              <EngagementStat icon={Bookmark} label={t('report.estSaves')} value={engagementPrediction.estimatedSaves} color="#818cf8" delay={0.75} />
            </div>
            <div className="mt-4 pt-3 flex items-center justify-between" style={{ borderTop: '1px solid var(--divider)' }}>
              <div>
                <div className="text-xs" style={{ color: 'var(--text-quaternary)' }}>{t('report.engagementRate')}</div>
                <div className="text-lg font-bold" style={{ color: 'var(--accent-cyan)' }}>{engagementPrediction.engagementRate}%</div>
              </div>
              <div className="text-right">
                <div className="text-xs" style={{ color: 'var(--text-quaternary)' }}>{t('report.viralityMultiplier')}</div>
                <div className="text-lg font-bold" style={{ color: 'var(--accent-amber)' }}>{engagementPrediction.viralityMultiplier}x</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Final AI Verdict */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.7 }}
          className="gradient-border rounded-2xl p-6 sm:p-8"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--bg-badge)', border: '1px solid var(--border-accent)' }}>
              <Sparkles size={16} style={{ color: 'var(--accent-blue)' }} />
            </div>
            <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
              {t('report.finalVerdict')}
            </h3>
            <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: `${verdict.color}15`, color: verdict.color }}>
              {score}/100
            </span>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {typedVerdict}<span className="inline-block w-0.5 h-4 ml-0.5 align-middle animate-pulse" style={{ background: 'var(--accent-blue)' }} />
          </p>
        </motion.div>
      </div>
    </section>
  )
}
