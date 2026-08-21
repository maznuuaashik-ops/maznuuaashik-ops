import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, TrendingUp, Target, Zap, Calendar, ArrowUpRight, ArrowLeft, RefreshCw } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
import { supabase } from '../lib/supabase'

interface AnalysisRow {
  id: string
  reel_url: string
  shortcode: string
  overall_score: number
  hook_strength: number
  audio_sync: number
  visual_quality: number
  caption_power: number
  trend_alignment: number
  created_at: string
}

export default function Analytics() {
  const { user } = useAuth()
  const [analyses, setAnalyses] = useState<AnalysisRow[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    avgScore: 0,
    bestScore: 0,
    avgHook: 0,
  })

  const fetchAnalyses = async () => {
    setLoading(true)
    try {
      // Get analyses where user_id matches or is null (anonymous)
      const { data, error } = await supabase
        .from('analyses')
        .select('*')
        .or(`user_id.eq.${user?.id},user_id.is.null`)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error

      if (data) {
        setAnalyses(data)
        if (data.length > 0) {
          const list = data as AnalysisRow[]
          setStats({
            total: list.length,
            avgScore: Math.round(list.reduce((sum: number, a: AnalysisRow) => sum + a.overall_score, 0) / list.length),
            bestScore: Math.max(...list.map((a: AnalysisRow) => a.overall_score)),
            avgHook: Math.round(list.reduce((sum: number, a: AnalysisRow) => sum + a.hook_strength, 0) / list.length),
          })
        }
      }
    } catch (err) {
      console.error('Error fetching analyses:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchAnalyses()
    } else {
      setLoading(false)
    }
  }, [user])

  const statCards = [
    { icon: BarChart3, label: 'Total Analyses', value: stats.total, color: '#3b82f6' },
    { icon: TrendingUp, label: 'Avg Score', value: stats.avgScore, suffix: '/100', color: '#22c55e' },
    { icon: Target, label: 'Best Score', value: stats.bestScore, suffix: '/100', color: '#f59e0b' },
    { icon: Zap, label: 'Avg Hook', value: stats.avgHook, suffix: '/100', color: '#818cf8' },
  ]

  return (
    <div className="min-h-screen py-24 px-4" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <Link to="/" className="inline-flex items-center gap-1 text-sm mb-4 hover:opacity-80" style={{ color: 'var(--accent-blue)' }}>
            <ArrowLeft size={14} />
            Back to Home
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                Your Analytics
              </h1>
              <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                Track your reel analysis history and performance trends
              </p>
            </div>
            {user && (
              <button
                onClick={fetchAnalyses}
                className="p-2 rounded-xl"
                style={{ background: 'var(--bg-badge)', border: '1px solid var(--border-primary)', color: 'var(--text-secondary)' }}
              >
                <RefreshCw size={16} />
              </button>
            )}
          </div>
        </motion.div>

        {!user ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-2xl p-8 text-center"
          >
            <BarChart3 size={48} className="mx-auto mb-4 opacity-30" />
            <p className="text-sm mb-4" style={{ color: 'var(--text-tertiary)' }}>Please sign in to view your analytics</p>
            <Link
              to="/login"
              className="inline-block px-6 py-2 rounded-xl font-semibold text-white text-sm"
              style={{ background: 'linear-gradient(135deg, #2563eb, #4f46e5)' }}
            >
              Sign In
            </Link>
          </motion.div>
        ) : (
          <>
            {/* Stats overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {statCards.map((stat, i) => {
                const Icon = stat.icon
                return (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="glass-card rounded-2xl p-5"
                  >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: `${stat.color}15` }}>
                      <Icon size={20} style={{ color: stat.color }} />
                    </div>
                    <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                      {stat.value}{stat.suffix || ''}
                    </div>
                    <div className="text-xs mt-1" style={{ color: 'var(--text-quaternary)' }}>{stat.label}</div>
                  </motion.div>
                )
              })}
            </div>

            {/* Analysis history */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="glass-card rounded-2xl overflow-hidden"
            >
              <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--divider)' }}>
                <h3 className="font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  <Calendar size={18} />
                  Analysis History
                </h3>
                <span className="text-xs px-2.5 py-1 rounded-full" style={{ background: 'var(--bg-badge)', color: 'var(--accent-blue)' }}>
                  {analyses.length} reels
                </span>
              </div>

              {loading ? (
                <div className="p-12 text-center" style={{ color: 'var(--text-tertiary)' }}>
                  <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-3" />
                  Loading your analyses...
                </div>
              ) : analyses.length === 0 ? (
                <div className="p-12 text-center" style={{ color: 'var(--text-tertiary)' }}>
                  <BarChart3 size={48} className="mx-auto mb-4 opacity-30" />
                  <p className="text-sm">No analyses yet. Analyze your first reel to see data here.</p>
                  <Link to="/" className="inline-block mt-4 text-sm text-blue-400 hover:underline">Analyze a reel</Link>
                </div>
              ) : (
                <div className="divide-y" style={{ borderColor: 'var(--divider)' }}>
                  {analyses.map((row) => (
                    <div key={row.id} className="px-5 py-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-12 text-xs" style={{ color: 'var(--text-quaternary)' }}>
                          {new Date(row.created_at).toLocaleDateString()}
                        </div>
                        <a
                          href={row.reel_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-sm hover:text-blue-400 transition-colors flex items-center gap-1"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          {row.shortcode}
                          <ArrowUpRight size={12} />
                        </a>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 rounded-full hidden sm:block" style={{ background: 'var(--bg-subtle)' }}>
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${row.overall_score}%`,
                                background: row.overall_score >= 70 ? '#22c55e' : row.overall_score >= 50 ? '#f59e0b' : '#ef4444'
                              }}
                            />
                          </div>
                          <span className="text-sm font-bold w-10 text-right" style={{ color: row.overall_score >= 70 ? '#22c55e' : row.overall_score >= 50 ? '#f59e0b' : '#ef4444' }}>
                            {row.overall_score}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </>
        )}
      </div>
    </div>
  )
}
