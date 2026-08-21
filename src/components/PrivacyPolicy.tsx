import { motion } from 'framer-motion'
import { Shield, Lock, Database, Eye, UserX, Mail } from 'lucide-react'

export default function PrivacyPolicy() {
  const sections = [
    {
      icon: Database,
      title: 'Data We Collect',
      content: 'We collect information you provide directly, such as your email address when you create an account, and reel URLs you submit for analysis. We also automatically collect usage data, including pages visited, features used, and timestamps of your interactions with our service.',
    },
    {
      icon: Eye,
      title: 'How We Use Your Data',
      content: 'Your data is used to provide and improve our services. Reel URLs are processed to generate analysis predictions. Your email is used for account management and optional notifications. We never sell your personal data to third parties.',
    },
    {
      icon: Lock,
      title: 'Data Security',
      content: 'We implement industry-standard security measures including encryption at rest and in transit, secure authentication, and regular security audits. Your analysis data is stored in secure databases with role-based access controls.',
    },
    {
      icon: UserX,
      title: 'Your Rights',
      content: 'You have the right to access, correct, or delete your personal data at any time. You can request a full export of your data or complete account deletion through your account settings or by contacting us.',
    },
    {
      icon: Shield,
      title: 'Third-Party Services',
      content: 'We use trusted third-party services for authentication, hosting, and analytics. These providers are contractually bound to protect your data. We never share your reel URLs or analysis results with any third party.',
    },
  ]

  return (
    <div className="min-h-screen py-24 px-4" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6 text-xs font-medium tracking-widest uppercase" style={{ background: 'var(--bg-badge)', border: '1px solid var(--border-primary)', color: 'var(--accent-blue)' }}>
            Legal
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            Privacy Policy
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
            Last updated: June 2026
          </p>
        </motion.div>

        {/* Introduction */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-2xl p-6 sm:p-8 mb-6"
        >
          <p className="leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            At YORNAM, we take your privacy seriously. This policy explains what data we collect, how we use it, and your rights regarding your personal information. By using our service, you agree to the practices described below.
          </p>
        </motion.div>

        {/* Sections */}
        {sections.map((section, i) => {
          const Icon = section.icon
          return (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.1 }}
              className="glass-card rounded-2xl p-6 sm:p-8 mb-6"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'var(--bg-badge)', border: '1px solid var(--border-primary)' }}>
                  <Icon size={18} style={{ color: 'var(--accent-blue)' }} />
                </div>
                <div>
                  <h2 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>{section.title}</h2>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{section.content}</p>
                </div>
              </div>
            </motion.div>
          )
        })}

        {/* Contact for privacy */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="glass-card rounded-2xl p-6 sm:p-8"
        >
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'var(--bg-badge)', border: '1px solid var(--border-primary)' }}>
              <Mail size={18} style={{ color: 'var(--accent-blue)' }} />
            </div>
            <div>
              <h2 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Questions About Your Privacy?</h2>
              <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                If you have any questions or concerns about this privacy policy or your personal data, please contact us.
              </p>
              <a
                href="mailto:privacy@yornam.com"
                className="inline-flex items-center gap-2 text-sm font-medium cursor-pointer hover:opacity-80 transition-opacity"
                style={{ color: 'var(--accent-blue)' }}
              >
                privacy@yornam.com
              </a>
            </div>
          </div>
        </motion.div>

        {/* Footer note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 text-center text-xs"
          style={{ color: 'var(--text-quaternary)' }}
        >
          This privacy policy is effective as of June 2026 and may be updated periodically.
        </motion.div>
      </div>
    </div>
  )
}
