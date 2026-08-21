import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, MessageSquare, Send, MapPin, Clock, Check } from 'lucide-react'

export default function Contact() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => {
      setName('')
      setEmail('')
      setSubject('')
      setMessage('')
      setSubmitted(false)
    }, 3000)
  }

  const contactInfo = [
    { icon: Mail, label: 'Email', value: 'hello@yornam.com', href: 'mailto:hello@yornam.com' },
    { icon: MessageSquare, label: 'Support', value: 'Open a ticket', href: '#' },
    { icon: MapPin, label: 'Location', value: 'San Francisco, CA', href: null },
    { icon: Clock, label: 'Response Time', value: '< 24 hours', href: null },
  ]

  return (
    <div className="min-h-screen py-24 px-4" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6 text-xs font-medium tracking-widest uppercase" style={{ background: 'var(--bg-badge)', border: '1px solid var(--border-primary)', color: 'var(--accent-blue)' }}>
            Get in Touch
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            Contact Us
          </h1>
          <p className="text-base sm:text-lg max-w-xl mx-auto" style={{ color: 'var(--text-tertiary)' }}>
            Have a question, suggestion, or just want to say hi? We'd love to hear from you.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Contact form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-3 glass-card rounded-2xl p-6 sm:p-8"
          >
            <h2 className="text-lg font-semibold mb-6" style={{ color: 'var(--text-primary)' }}>Send a Message</h2>

            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
              >
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(34,197,94,0.1)' }}>
                  <Check size={32} className="text-green-500" />
                </div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Message Sent!</h3>
                <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>We'll get back to you within 24 hours.</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      placeholder="Your name"
                      className="w-full px-4 py-3 rounded-xl text-base outline-none transition-all duration-200"
                      style={{
                        background: 'var(--bg-input)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border-secondary)',
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="you@example.com"
                      className="w-full px-4 py-3 rounded-xl text-base outline-none transition-all duration-200"
                      style={{
                        background: 'var(--bg-input)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border-secondary)',
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Subject</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                    placeholder="What's this about?"
                    className="w-full px-4 py-3 rounded-xl text-base outline-none transition-all duration-200"
                    style={{
                      background: 'var(--bg-input)',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border-secondary)',
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Message</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    rows={5}
                    placeholder="Your message..."
                    className="w-full px-4 py-3 rounded-xl text-base outline-none transition-all duration-200 resize-none"
                    style={{
                      background: 'var(--bg-input)',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border-secondary)',
                    }}
                  />
                </div>

                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3.5 rounded-xl font-semibold text-white text-base transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
                  style={{ background: 'linear-gradient(135deg, #2563eb, #4f46e5)' }}
                >
                  <Send size={18} />
                  Send Message
                </motion.button>
              </form>
            )}
          </motion.div>

          {/* Contact info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 space-y-4"
          >
            {contactInfo.map((item, i) => {
              const Icon = item.icon
              const content = (
                <div className="glass-card rounded-xl p-5" style={{ transitionDelay: `${i * 0.05}s` }}>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--bg-badge)', border: '1px solid var(--border-primary)' }}>
                      <Icon size={18} style={{ color: 'var(--accent-blue)' }} />
                    </div>
                    <div>
                      <div className="text-xs font-medium" style={{ color: 'var(--text-quaternary)' }}>{item.label}</div>
                      <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{item.value}</div>
                    </div>
                  </div>
                </div>
              )

              if (item.href) {
                return <a key={item.label} href={item.href} className="block hover:scale-[1.02] transition-transform">{content}</a>
              }
              return <div key={item.label}>{content}</div>
            })}

            {/* Hours */}
            <div className="glass-card rounded-xl p-5">
              <h3 className="font-semibold mb-3 text-sm" style={{ color: 'var(--text-primary)' }}>Business Hours</h3>
              <div className="space-y-2 text-xs" style={{ color: 'var(--text-tertiary)' }}>
                <div className="flex justify-between">
                  <span>Mon - Fri</span>
                  <span>9:00 AM - 6:00 PM PST</span>
                </div>
                <div className="flex justify-between">
                  <span>Sat - Sun</span>
                  <span>Closed</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
