import { motion } from 'framer-motion'
import { Zap, Target, Users, Rocket, Globe } from 'lucide-react'

export default function About() {
  const values = [
    { icon: Target, title: 'Insight-Driven', description: 'Our AI analyzes real content signals — hook strength, pacing, caption structure — to give you actionable predictions, not guesses.' },
    { icon: Users, title: 'Creator-Centric', description: 'Built by creators, for creators. Every feature solves a real problem you face when planning content.' },
    { icon: Rocket, title: 'Speed Matters', description: 'Get insights in seconds, not hours. Your time is valuable, and so is your posting window.' },
    { icon: Globe, title: 'Privacy First', description: 'We only store your analysis results so you can track them. Your reel content is never downloaded or archived.' },
  ]

  const milestones = [
    { year: '2024', event: 'YORNAM founded', detail: 'Started with a simple idea: predict virality before posting' },
    { year: '2025', event: 'AI analysis engine launched', detail: 'Multi-layer reel analysis covering hook, retention, engagement, and viral probability' },
    { year: '2026', event: 'Real-time predictions', detail: 'Every report now generated on demand with live AI reasoning' },
  ]

  return (
    <div className="min-h-screen py-24 px-4" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-4xl mx-auto">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6 text-xs font-medium tracking-widest uppercase" style={{ background: 'var(--bg-badge)', border: '1px solid var(--border-primary)', color: 'var(--accent-blue)' }}>
            Our Story
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            About YORNAM
          </h1>
          <p className="text-base sm:text-lg max-w-2xl mx-auto" style={{ color: 'var(--text-tertiary)' }}>
            We're on a mission to democratize viral content intelligence, giving every creator access to AI-powered insights that help them understand and improve their reels before posting.
          </p>
        </motion.div>

        {/* Mission */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-2xl p-8 sm:p-12 mb-12"
        >
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #2563eb, #4f46e5)' }}>
              <Zap size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>Our Mission</h2>
              <p className="leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                Every day, millions of reels go unseen because creators lack the data to optimize their content. YORNAM changes that. We built an AI that analyzes the exact signals algorithms use to determine reach, giving you the power to adjust before you publish.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Values */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <h2 className="text-xl font-bold mb-8 text-center" style={{ color: 'var(--text-primary)' }}>What We Stand For</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {values.map((v, i) => {
              const Icon = v.icon
              return (
                <motion.div
                  key={v.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className="glass-card rounded-xl p-6"
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: 'var(--bg-badge)', border: '1px solid var(--border-primary)' }}>
                    <Icon size={18} style={{ color: 'var(--accent-blue)' }} />
                  </div>
                  <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{v.title}</h3>
                  <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>{v.description}</p>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card rounded-2xl p-8 sm:p-10"
        >
          <h2 className="text-xl font-bold mb-8 text-center" style={{ color: 'var(--text-primary)' }}>Our Journey</h2>
          <div className="space-y-6">
            {milestones.map((m) => (
              <div key={m.year} className="flex gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-bold" style={{ background: 'var(--bg-badge)', border: '1px solid var(--border-primary)', color: 'var(--accent-blue)' }}>
                  {m.year}
                </div>
                <div>
                  <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>{m.event}</div>
                  <div className="text-sm mt-1" style={{ color: 'var(--text-quaternary)' }}>{m.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-center gap-3 sm:gap-4 mt-12 flex-wrap"
        >
          {[
            { label: 'AI-Powered Analysis', icon: Zap },
            { label: 'Real-Time Processing', icon: Rocket },
            { label: 'Privacy First', icon: Globe },
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
      </div>
    </div>
  )
}
