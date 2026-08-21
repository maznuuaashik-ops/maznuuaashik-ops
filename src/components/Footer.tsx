import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Zap, Send, Camera, Play } from 'lucide-react'
import { useLanguage } from '../lib/LanguageContext'

export default function Footer() {
  const { t } = useLanguage()

  return (
    <footer className="relative mt-10" style={{ borderTop: '1px solid var(--divider)' }}>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px" style={{ background: 'linear-gradient(90deg, transparent, var(--accent-blue), transparent)' }} />

      <div className="max-w-6xl mx-auto px-4 py-10 sm:py-14">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8">
          <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex flex-col items-center md:items-start gap-2">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #2563eb, #4f46e5)' }}>
                <Zap size={14} className="text-white" />
              </div>
              <span className="text-xl font-black tracking-tighter gradient-text">YORNAM</span>
            </Link>
            <p className="text-xs max-w-xs text-center md:text-left" style={{ color: 'var(--text-quaternary)' }}>
              {t('footer.tagline')}
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="flex items-center gap-5 sm:gap-6 text-xs sm:text-sm flex-wrap justify-center" style={{ color: 'var(--text-tertiary)' }}>
            <Link to="/about" className="hover:text-blue-400 transition-colors duration-200">{t('nav.about')}</Link>
            <Link to="/contact" className="hover:text-blue-400 transition-colors duration-200">{t('nav.contact')}</Link>
            <Link to="/privacy" className="hover:text-blue-400 transition-colors duration-200">{t('nav.privacy')}</Link>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="flex items-center gap-3">
            {[
              { Icon: Send, href: 'https://instagram.com', label: 'Instagram' },
              { Icon: Camera, href: '#', label: 'Camera' },
              { Icon: Play, href: 'https://tiktok.com', label: 'TikTok' },
            ].map(({ Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-110"
                style={{ background: 'var(--bg-badge)', border: '1px solid var(--border-primary)', color: 'var(--text-tertiary)' }}
                aria-label={label}
              >
                <Icon size={15} />
              </a>
            ))}
          </motion.div>
        </div>

        <div className="mt-8 sm:mt-10 pt-5 sm:pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs" style={{ borderTop: '1px solid var(--border-secondary)', color: 'var(--text-quaternary)' }}>
          <span>&copy; 2026 YORNAM. {t('footer.allRightsReserved')}</span>
          <div className="flex items-center gap-4">
            <Link to="/privacy" className="hover:text-blue-400 transition-colors">{t('footer.privacyPolicy')}</Link>
            <Link to="/privacy" className="hover:text-blue-400 transition-colors">{t('footer.termsOfService')}</Link>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span>{t('footer.allSystemsOperational')}</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
