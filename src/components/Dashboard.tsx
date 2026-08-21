import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { TrendingUp, Video, Clock, Share2, Target, Award, ArrowUpRight, BarChart3, Users, Globe, Type, Tag } from 'lucide-react'
import type { DashboardMetrics, RecentAnalysis, EnhancedReport } from '../lib/types'
import { useLanguage } from '../lib/LanguageContext'

interface DashboardProps {
  metrics: DashboardMetrics | null
  recentAnalyses: RecentAnalysis[]
  enhancedReport?: EnhancedReport
}

function getStatus(score: number, t: (key: string) => string): { label: string; color: string } {
  if (score >= 85) return { label: t('report.viral'), color: '#10b981' }
  if (score >= 65) return { label: t('report.strong'), color: '#3b82f6' }
  return { label: t('report.average'), color: '#f59e0b' }
}

function buildMetricCards(m: DashboardMetrics, t: (key: string) => string, translateText: (text: string) => string) {
  return [
    { icon: TrendingUp, label: t('dash.projViews'), value: m.projectedViews, sub: translateText(m.projectedViewsSub), color: '#3b82f6' },
    { icon: Share2, label: t('dash.shareProb'), value: m.shareProbability, sub: translateText(m.shareProbSub), color: '#06b6d4' },
    { icon: Clock, label: t('dash.bestPostTime'), value: m.bestPostTime, sub: translateText(m.bestPostTimeSub), color: '#6366f1' },
    { icon: Video, label: t('dash.idealDuration'), value: m.idealDuration, sub: translateText(m.idealDurationSub), color: '#60a5fa' },
    { icon: Target, label: t('dash.targetAudience'), value: translateText(m.targetAudience), sub: translateText(m.targetAudienceSub), color: '#38bdf8' },
    { icon: Award, label: t('dash.contentRank'), value: translateText(m.contentRank), sub: translateText(m.contentRankSub), color: '#f59e0b' },
  ]
}

function AudienceMatchCard({ audience, inView }: { audience: EnhancedReport['audienceMatch']; inView: boolean }) {
  const { t, translateText } = useLanguage()

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: 0.5 }}
      className="glass-card rounded-2xl p-6"
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--bg-badge)', border: '1px solid var(--border-accent)' }}>
            <Users size={16} style={{ color: 'var(--accent-blue)' }} />
          </div>
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{t('dash.audienceMatch')}</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold tabular-nums" style={{ color: audience.matchScore >= 75 ? '#10b981' : audience.matchScore >= 50 ? '#3b82f6' : '#f59e0b' }}>
            {audience.matchScore}%
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-5">
        <div>
          <div className="text-[10px] tracking-wider uppercase mb-1" style={{ color: 'var(--text-quaternary)' }}>{t('dash.primaryAge')}</div>
          <div className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{audience.primaryAgeRange}</div>
        </div>
        <div>
          <div className="text-[10px] tracking-wider uppercase mb-1" style={{ color: 'var(--text-quaternary)' }}>{t('dash.secondaryAge')}</div>
          <div className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{audience.secondaryAgeRange}</div>
        </div>
      </div>

      {/* Gender split bar */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] tracking-wider uppercase" style={{ color: 'var(--text-quaternary)' }}>{t('dash.genderSplit')}</span>
        </div>
        <div className="flex h-2 rounded-full overflow-hidden score-track">
          <div style={{ width: `${audience.genderSplit.male}%`, background: '#3b82f6' }} />
          <div style={{ width: `${audience.genderSplit.female}%`, background: '#f43f5e' }} />
        </div>
        <div className="flex justify-between mt-1.5">
          <span className="text-xs" style={{ color: '#3b82f6' }}>{t('dash.male')} {audience.genderSplit.male}%</span>
          <span className="text-xs" style={{ color: '#f43f5e' }}>{t('dash.female')} {audience.genderSplit.female}%</span>
        </div>
      </div>

      {/* Top interests */}
      <div className="mb-4">
        <div className="text-[10px] tracking-wider uppercase mb-2" style={{ color: 'var(--text-quaternary)' }}>{t('dash.topInterests')}</div>
        <div className="flex flex-wrap gap-2">
          {audience.topInterests.map((interest) => (
            <span key={interest} className="text-xs px-2.5 py-1 rounded-full" style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-secondary)', color: 'var(--text-secondary)' }}>
              {translateText(interest)}
            </span>
          ))}
        </div>
      </div>

      {/* Top locations */}
      <div>
        <div className="text-[10px] tracking-wider uppercase mb-2 flex items-center gap-1" style={{ color: 'var(--text-quaternary)' }}>
          <Globe size={10} /> {t('dash.topLocations')}
        </div>
        <div className="flex flex-wrap gap-2">
          {audience.topLocations.map((loc) => (
            <span key={loc} className="text-xs px-2.5 py-1 rounded-full" style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-secondary)', color: 'var(--text-secondary)' }}>
              {loc}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

function CaptionQualityCard({ score, inView }: { score: number; inView: boolean }) {
  const { t } = useLanguage()
  const tier = score >= 75 ? { color: '#10b981', label: t('report.strong') } : score >= 50 ? { color: '#3b82f6', label: t('report.moderate') } : { color: '#f59e0b', label: t('report.weak') }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="glass-card rounded-2xl p-6"
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${tier.color}12`, border: `1px solid ${tier.color}25` }}>
            <Type size={16} style={{ color: tier.color }} />
          </div>
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{t('dash.captionQuality')}</h3>
        </div>
        <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: `${tier.color}15`, color: tier.color }}>
          {tier.label}
        </span>
      </div>

      <div className="flex items-baseline gap-2 mb-4">
        <span className="text-4xl font-black tabular-nums" style={{ color: tier.color }}>{score}</span>
        <span className="text-sm" style={{ color: 'var(--text-quaternary)' }}>/ 100</span>
      </div>

      <div className="h-2 rounded-full score-track mb-2">
        <motion.div
          initial={{ width: 0 }}
          animate={inView ? { width: `${score}%` } : {}}
          transition={{ duration: 1.2, delay: 0.5, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${tier.color}, ${tier.color}88)`, boxShadow: `0 0 8px ${tier.color}40` }}
        />
      </div>
    </motion.div>
  )
}

function ContentCategoryCard({ category, inView }: { category: string; inView: boolean }) {
  const { t, translateText } = useLanguage()

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: 0.45 }}
      className="glass-card rounded-2xl p-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.2)' }}>
          <Tag size={16} style={{ color: 'var(--accent-cyan)' }} />
        </div>
        <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{t('dash.contentCategory')}</h3>
      </div>
      <div className="text-2xl font-bold mb-1" style={{ color: 'var(--accent-cyan)' }}>{translateText(category)}</div>
      <p className="text-xs" style={{ color: 'var(--text-quaternary)' }}>{t('dash.aiDetectedNiche')}</p>
    </motion.div>
  )
}

export default function Dashboard({ metrics, recentAnalyses, enhancedReport }: DashboardProps) {
  const { t, translateText } = useLanguage()
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const metricCards = metrics ? buildMetricCards(metrics, t, translateText) : null

  return (
    <section ref={ref} className="py-16 sm:py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 sm:mb-14"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4 text-xs font-medium tracking-widest uppercase badge-premium">
            <BarChart3 size={12} />
            {t('dash.hubBadge')}
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
            {t('dash.title')}
          </h2>
          <p className="text-sm sm:text-base" style={{ color: 'var(--text-tertiary)' }}>
            {t('dash.subtitle')}
          </p>
        </motion.div>

        {/* Metric cards */}
        {metricCards && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-8">
            {metricCards.map((m, i) => {
              const Icon = m.icon
              return (
                <motion.div
                  key={m.label}
                  initial={{ opacity: 0, y: 30 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: i * 0.07 }}
                  whileHover={{ y: -3, transition: { duration: 0.2 } }}
                  className="glass-card rounded-2xl p-4 sm:p-5 cursor-default"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${m.color}12`, border: `1px solid ${m.color}25` }}>
                      <Icon size={16} style={{ color: m.color }} />
                    </div>
                    <ArrowUpRight size={14} style={{ color: 'var(--text-quaternary)' }} />
                  </div>
                  <div className="text-lg sm:text-xl md:text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                    {m.value}
                  </div>
                  <div className="text-xs" style={{ color: 'var(--text-quaternary)' }}>
                    {m.sub}
                  </div>
                  <div className="text-xs font-medium mt-2 hidden sm:block" style={{ color: 'var(--text-tertiary)' }}>
                    {m.label}
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}

        {/* Empty state when no metrics */}
        {!metricCards && (
          <div className="glass-card rounded-2xl p-8 sm:p-12 text-center mb-8">
            <BarChart3 size={32} className="mx-auto mb-3" style={{ color: 'var(--text-quaternary)' }} />
            <h3 className="text-base font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>{t('dash.noAnalysis')}</h3>
            <p className="text-sm" style={{ color: 'var(--text-quaternary)' }}>{t('dash.noAnalysisSub')}</p>
          </div>
        )}

        {/* Audience Match + Caption Quality + Content Category (only when enhanced report exists) */}
        {enhancedReport && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-2">
                <AudienceMatchCard audience={enhancedReport.audienceMatch} inView={inView} />
              </div>
              <div className="space-y-6">
                <CaptionQualityCard score={enhancedReport.captionQuality} inView={inView} />
                <ContentCategoryCard category={enhancedReport.contentCategory} inView={inView} />
              </div>
            </div>
          </>
        )}

        {/* Recent analyses */}
        {recentAnalyses.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="glass-card rounded-2xl overflow-hidden"
          >
            <div className="px-5 sm:px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--divider)' }}>
              <h3 className="font-semibold text-sm sm:text-base" style={{ color: 'var(--text-primary)' }}>{t('dash.recentHistory')}</h3>
              <span className="text-xs px-2.5 py-1 rounded-full font-medium badge-premium">
                {recentAnalyses.length} {t('dash.analysesCount')}
              </span>
            </div>
            <div>
              {recentAnalyses.map((reel, i) => {
                const status = getStatus(reel.overall_score, t)
                return (
                  <motion.div
                    key={reel.shortcode + reel.created_at}
                    initial={{ opacity: 0, x: -20 }}
                    animate={inView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.4, delay: 0.5 + i * 0.07 }}
                    className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 transition-colors cursor-default hover:bg-white/[0.02]"
                    style={{ borderBottom: i < recentAnalyses.length - 1 ? '1px solid var(--divider)' : 'none' }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold" style={{ background: 'var(--bg-subtle)', color: 'var(--text-tertiary)', border: '1px solid var(--border-secondary)' }}>
                        {i + 1}
                      </div>
                      <span className="text-xs sm:text-sm font-medium truncate max-w-[140px] sm:max-w-none" style={{ color: 'var(--text-primary)' }}>
                        {reel.shortcode}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 sm:gap-5">
                      <div className="text-xs sm:text-sm font-bold tabular-nums" style={{ color: status.color }}>
                        {reel.overall_score}/100
                      </div>
                      <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: `${status.color}12`, color: status.color, border: `1px solid ${status.color}25` }}>
                        {status.label}
                      </span>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  )
}
