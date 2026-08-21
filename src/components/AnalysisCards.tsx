import { motion, useInView } from 'framer-motion'
import { useRef, useEffect, useState } from 'react'
import { Zap, Type, Eye, BarChart3, Users, ChevronRight, ArrowUpRight, Hash, Calendar, TrendingUp, AlertTriangle, CheckCircle2, Lightbulb, Image as ImageIcon } from 'lucide-react'
import type { AnalysisCard, EnhancedReport, InsightItem, HashtagSuggestion, PostingTimeSlot, ThumbnailSuggestion } from '../lib/types'
import { useLanguage } from '../lib/LanguageContext'

function useCountUp(target: number, active: boolean, duration = 1200): number {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (!active) return
    let start: number | null = null
    let frame: number
    const step = (ts: number) => {
      if (start === null) start = ts
      const progress = Math.min((ts - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(eased * target))
      if (progress < 1) frame = requestAnimationFrame(step)
    }
    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [target, active, duration])
  return value
}

function ScoreDisplay({ score, color, inView, delay }: { score: number; color: string; inView: boolean; delay: number }) {
  const [started, setStarted] = useState(false)
  useEffect(() => {
    if (inView) {
      const t = setTimeout(() => setStarted(true), delay)
      return () => clearTimeout(t)
    }
  }, [inView, delay])
  const animated = useCountUp(score, started)
  return <span className="text-xs font-bold tabular-nums" style={{ color }}>{animated}%</span>
}

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>> = {
  Hook: Zap,
  Caption: Type,
  Intro: Eye,
  Retention: BarChart3,
  Competitor: Users,
}

function getScoreTier(score: number) {
  if (score >= 80) return { tier: 'excellent', color: '#10b981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)' }
  if (score >= 60) return { tier: 'good', color: '#3b82f6', bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.2)' }
  if (score >= 40) return { tier: 'average', color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)' }
  return { tier: 'poor', color: '#ef4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)' }
}

function InsightCard({ item, type, index, inView }: { item: InsightItem; type: 'weak' | 'strong' | 'improvement'; index: number; inView: boolean }) {
  const { t, translateText } = useLanguage()
  const config = {
    weak: { icon: AlertTriangle, color: '#ef4444', bg: 'rgba(239,68,68,0.06)', border: 'rgba(239,68,68,0.15)', label: t('cards.weakPoint') },
    strong: { icon: CheckCircle2, color: '#10b981', bg: 'rgba(16,185,129,0.06)', border: 'rgba(16,185,129,0.15)', label: t('cards.strongPoint') },
    improvement: { icon: Lightbulb, color: '#f59e0b', bg: 'rgba(245,158,11,0.06)', border: 'rgba(245,158,11,0.15)', label: t('cards.improvement') },
  }[type]

  const Icon = config.icon
  const impactColor = item.impact === 'high' ? config.color : item.impact === 'medium' ? '#f59e0b' : '#6b7280'
  const impactLabel = item.impact === 'high' ? t('report.high') : item.impact === 'medium' ? t('report.moderate') : t('report.low')

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="rounded-xl p-4"
      style={{ background: config.bg, border: `1px solid ${config.border}` }}
    >
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${config.color}12`, border: `1px solid ${config.color}25` }}>
          <Icon size={14} style={{ color: config.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{translateText(item.label)}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium uppercase tracking-wider" style={{ background: `${impactColor}15`, color: impactColor }}>
              {impactLabel}
            </span>
          </div>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>{translateText(item.description)}</p>
        </div>
      </div>
    </motion.div>
  )
}

function HashtagChip({ tag, reach, competition, relevance }: HashtagSuggestion & { index: number }) {
  const { t } = useLanguage()
  const reachConfig = {
    high: { color: '#10b981', label: t('cards.highReach') },
    medium: { color: '#3b82f6', label: t('cards.medReach') },
    low: { color: '#f59e0b', label: t('cards.lowReach') },
  }[reach]

  const compConfig = {
    high: { color: '#ef4444', label: t('cards.highComp') },
    medium: { color: '#f59e0b', label: t('cards.medComp') },
    low: { color: '#10b981', label: t('cards.lowComp') },
  }[competition]

  return (
    <div className="rounded-xl p-3" style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-secondary)' }}>
      <div className="flex items-center gap-2 mb-2">
        <Hash size={12} style={{ color: 'var(--accent-blue)' }} />
        <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>#{tag}</span>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium" style={{ background: `${reachConfig.color}12`, color: reachConfig.color }}>
          {reachConfig.label}
        </span>
        <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium" style={{ background: `${compConfig.color}12`, color: compConfig.color }}>
          {compConfig.label}
        </span>
      </div>
      <div className="mt-2 flex items-center gap-2">
        <div className="flex-1 h-1 rounded-full score-track">
          <div className="h-full rounded-full" style={{ width: `${relevance}%`, background: 'var(--accent-blue)' }} />
        </div>
        <span className="text-[10px] tabular-nums" style={{ color: 'var(--text-quaternary)' }}>{relevance}%</span>
      </div>
    </div>
  )
}

function PostingTimeCard({ slot, index }: { slot: PostingTimeSlot; index: number }) {
  const { t, translateText } = useLanguage()

  const getDayTranslation = (day: string) => {
    const d = day.toLowerCase()
    if (d.includes('mon')) return t('cards.dayMonday')
    if (d.includes('tue')) return t('cards.dayTuesday')
    if (d.includes('wed')) return t('cards.dayWednesday')
    if (d.includes('thu')) return t('cards.dayThursday')
    if (d.includes('fri')) return t('cards.dayFriday')
    if (d.includes('sat')) return t('cards.daySaturday')
    if (d.includes('sun')) return t('cards.daySunday')
    return day
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="flex items-center gap-4 p-4 rounded-xl"
      style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-secondary)' }}
    >
      <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'var(--bg-badge)', border: '1px solid var(--border-accent)' }}>
        <Calendar size={18} style={{ color: 'var(--accent-blue)' }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{getDayTranslation(slot.day)}</span>
          <span className="text-sm tabular-nums" style={{ color: 'var(--accent-blue)' }}>{slot.time}</span>
        </div>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>{translateText(slot.reason)}</p>
      </div>
      <div className="text-right flex-shrink-0">
        <div className="text-lg font-bold tabular-nums" style={{ color: slot.score >= 85 ? '#10b981' : slot.score >= 70 ? '#3b82f6' : '#f59e0b' }}>
          {slot.score}
        </div>
        <div className="text-[10px] tracking-wider uppercase" style={{ color: 'var(--text-quaternary)' }}>{t('cards.score')}</div>
      </div>
    </motion.div>
  )
}

function ThumbnailCard({ thumb, index, inView }: { thumb: ThumbnailSuggestion; index: number; inView: boolean }) {
  const { t, translateText } = useLanguage()
  const impactColor = thumb.impact === 'high' ? '#10b981' : thumb.impact === 'medium' ? '#3b82f6' : '#f59e0b'
  const impactLabel = thumb.impact === 'high' ? t('report.high') : thumb.impact === 'medium' ? t('report.moderate') : t('report.low')
  const typeIcon = { 'cover-frame': ImageIcon, 'text-overlay': Type, 'face-closeup': Eye, 'before-after': BarChart3, 'curiosity-gap': Zap }
  const Icon = typeIcon[thumb.type] || ImageIcon

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: 0.85 + index * 0.08 }}
      className="rounded-xl p-4"
      style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-secondary)' }}
    >
      <div className="flex items-start gap-3 mb-2">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}>
          <Icon size={14} style={{ color: '#818cf8' }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{translateText(thumb.title)}</span>
          </div>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium uppercase tracking-wider" style={{ background: `${impactColor}15`, color: impactColor }}>
            {impactLabel} {t('cards.impact')}
          </span>
        </div>
      </div>
      <p className="text-xs leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>{translateText(thumb.description)}</p>
    </motion.div>
  )
}

interface AnalysisCardsProps {
  cards: AnalysisCard[]
  enhancedReport: EnhancedReport
}

export default function AnalysisCards({ cards, enhancedReport }: AnalysisCardsProps) {
  const { t, translateText } = useLanguage()
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  const getCardTitle = (title: string) => {
    const lower = title.toLowerCase()
    if (lower.includes('hook')) return t('cards.hook')
    if (lower.includes('caption')) return t('cards.caption')
    if (lower.includes('intro')) return t('cards.intro')
    if (lower.includes('retention')) return t('cards.retention')
    if (lower.includes('competitor')) return t('cards.competitor')
    return title
  }

  return (
    <section ref={ref} className="py-16 sm:py-24 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 sm:mb-14"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4 text-xs font-medium tracking-widest uppercase badge-premium">
            {t('cards.deepDive')}
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
            {t('cards.breakdownTitle')}
          </h2>
          <p className="max-w-xl mx-auto text-sm sm:text-base" style={{ color: 'var(--text-tertiary)' }}>
            {t('cards.breakdownSubtitle')}
          </p>
        </motion.div>

        {/* Analysis cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 mb-12">
          {cards.map((card, i) => {
            const Icon = iconMap[card.title] || Zap
            const tier = getScoreTier(card.score)

            return (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 40 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="glass-card rounded-2xl p-5 sm:p-6 cursor-default group"
              >
                <div className="flex items-start justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: tier.bg, border: `1px solid ${tier.border}`, boxShadow: `0 0 16px ${tier.bg}` }}>
                      <Icon size={20} style={{ color: tier.color }} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{getCardTitle(card.title)}</h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <ScoreDisplay score={card.score} color={tier.color} inView={inView} delay={300 + i * 100} />
                        <span className="text-xs" style={{ color: 'var(--text-quaternary)' }}>{t('cards.score')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold" style={{ background: tier.bg, color: tier.color, border: `1px solid ${tier.border}` }}>
                    {card.grade}
                    <ArrowUpRight size={10} />
                  </div>
                </div>

                <div className="h-1.5 rounded-full mb-5 score-track">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={inView ? { width: `${card.score}%` } : {}}
                    transition={{ duration: 1.2, delay: 0.3 + i * 0.1, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{ background: `linear-gradient(90deg, ${tier.color}, ${tier.color}80)`, boxShadow: `0 0 8px ${tier.color}40` }}
                  />
                </div>

                <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>{translateText(card.description)}</p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {card.tags.map((tag) => (
                    <span key={tag} className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: tier.bg, color: tier.color, border: `1px solid ${tier.border}` }}>
                      {translateText(tag)}
                    </span>
                  ))}
                </div>

                <div className="rounded-xl p-3.5" style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-secondary)' }}>
                  <div className="flex items-start gap-2">
                    <ChevronRight size={14} style={{ color: tier.color, marginTop: 2, flexShrink: 0 }} />
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>{translateText(card.recommendation)}</p>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Strong & Weak Points */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="glass-card rounded-2xl p-6"
          >
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
                <CheckCircle2 size={16} style={{ color: '#10b981' }} />
              </div>
              <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{t('cards.strongPointsTitle')}</h3>
            </div>
            <div className="space-y-3">
              {enhancedReport.strongPoints.map((item, i) => (
                <InsightCard key={i} item={item} type="strong" index={i} inView={inView} />
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="glass-card rounded-2xl p-6"
          >
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                <AlertTriangle size={16} style={{ color: '#ef4444' }} />
              </div>
              <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{t('cards.weakPointsTitle')}</h3>
            </div>
            <div className="space-y-3">
              {enhancedReport.weakPoints.map((item, i) => (
                <InsightCard key={i} item={item} type="weak" index={i} inView={inView} />
              ))}
            </div>
          </motion.div>
        </div>

        {/* Improvement Suggestions */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="glass-card rounded-2xl p-6 mb-6"
        >
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}>
              <Lightbulb size={16} style={{ color: '#f59e0b' }} />
            </div>
            <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{t('cards.improvementTitle')}</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {enhancedReport.improvementSuggestions.map((item, i) => (
              <InsightCard key={i} item={item} type="improvement" index={i} inView={inView} />
            ))}
          </div>
        </motion.div>

        {/* Hashtag Suggestions & Posting Times */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Hashtags */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="glass-card rounded-2xl p-6"
          >
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--bg-badge)', border: '1px solid var(--border-accent)' }}>
                <Hash size={16} style={{ color: 'var(--accent-blue)' }} />
              </div>
              <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{t('cards.hashtagTitle')}</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {enhancedReport.hashtagSuggestions.map((tag, i) => (
                <HashtagChip key={i} {...tag} index={i} />
              ))}
            </div>
          </motion.div>

          {/* Posting Times */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="glass-card rounded-2xl p-6"
          >
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--bg-badge)', border: '1px solid var(--border-accent)' }}>
                <TrendingUp size={16} style={{ color: 'var(--accent-blue)' }} />
              </div>
              <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{t('cards.postingTimeTitle')}</h3>
            </div>
            <div className="space-y-3">
              {enhancedReport.postingTimeSuggestions.map((slot, i) => (
                <PostingTimeCard key={i} slot={slot} index={i} />
              ))}
            </div>
          </motion.div>
        </div>

        {/* Thumbnail Suggestions */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="glass-card rounded-2xl p-6"
        >
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}>
              <ImageIcon size={16} style={{ color: '#818cf8' }} />
            </div>
            <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{t('cards.thumbnailTitle')}</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {enhancedReport.thumbnailSuggestions.map((thumb, i) => (
              <ThumbnailCard key={i} thumb={thumb} index={i} inView={inView} />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
