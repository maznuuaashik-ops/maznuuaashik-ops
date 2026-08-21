import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { Sparkles, Shield, Cpu, ArrowUpRight } from 'lucide-react'
import { useLanguage } from '../lib/LanguageContext'

export default function Features() {
  const { t } = useLanguage()
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  const features = [
    {
      icon: Cpu,
      title: t('features.card1Title'),
      description: t('features.card1Desc'),
      color: '#3b82f6',
      stat: '11',
      statLabel: t('features.card1StatLabel'),
    },
    {
      icon: Sparkles,
      title: t('features.card2Title'),
      description: t('features.card2Desc'),
      color: '#22d3ee',
      stat: 'Live',
      statLabel: t('features.card2StatLabel'),
    },
    {
      icon: Shield,
      title: t('features.card3Title'),
      description: t('features.card3Desc'),
      color: '#22c55e',
      stat: 'Secure',
      statLabel: t('features.card3StatLabel'),
    },
  ]

  return (
    <section ref={ref} className="py-16 sm:py-24 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 sm:mb-14"
        >
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4 text-xs font-medium tracking-widest uppercase"
            style={{ background: 'var(--bg-badge)', border: '1px solid var(--border-primary)', color: 'var(--accent-blue)' }}
          >
            {t('features.badge')}
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
            {t('features.title')}
          </h2>
          <p className="text-sm sm:text-base" style={{ color: 'var(--text-tertiary)' }}>
            {t('features.subtitle')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
          {features.map((f, i) => {
            const Icon = f.icon
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: i * 0.12 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="glass-card rounded-2xl p-6 sm:p-7 text-center"
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
                  style={{ background: `${f.color}12`, border: `1px solid ${f.color}25`, boxShadow: `0 0 20px ${f.color}10` }}
                >
                  <Icon size={24} style={{ color: f.color }} />
                </div>
                <h3 className="font-semibold text-base sm:text-lg mb-2" style={{ color: 'var(--text-primary)' }}>
                  {f.title}
                </h3>
                <p className="text-xs sm:text-sm leading-relaxed mb-5" style={{ color: 'var(--text-secondary)' }}>
                  {f.description}
                </p>
                <div
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-xl"
                  style={{ background: `${f.color}08`, border: `1px solid ${f.color}15` }}
                >
                  <span className="text-lg font-bold" style={{ color: f.color }}>{f.stat}</span>
                  <span className="text-xs" style={{ color: 'var(--text-quaternary)' }}>{f.statLabel}</span>
                  <ArrowUpRight size={12} style={{ color: f.color }} />
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
