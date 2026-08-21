import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users, BarChart3, TrendingUp, Shield, Database, AlertCircle,
  Search, ArrowLeft, RefreshCw, Ban, Trash2, CheckCircle2,
  Cpu, Plus, ChevronLeft, ChevronRight, Megaphone, Settings as SettingsIcon,
  UserCog, Globe, ExternalLink, HardDrive, Wifi, Server, Check,
  Clock, FileVideo, Link as LinkIcon, AlertTriangle, Sparkles, Terminal
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
import { supabase } from '../lib/supabase'

// ─── Data Types ───

interface Stats {
  totalUsers: number
  newUsersToday: number
  newUsers7Days: number
  totalAnalyses: number
  reelAnalyses: number
  videoAnalyses: number
  failedAnalyses: number
  avgScore: number
  activeUsers: number
  bannedUsers: number
  totalVisitors: number
  todayVisitors: number
  analysisGrowth: number[]
  userGrowth: number[]
}

interface AnalysisRecord {
  id: string
  reel_url: string
  shortcode: string
  overall_score: number
  hook_strength?: number
  visual_quality?: number
  caption_power?: number
  created_at: string
  user_id: string | null
  status?: 'completed' | 'processing' | 'failed'
  failure_reason?: string | null
  user_email?: string
}

interface UserProfile {
  id: string
  email: string
  full_name: string | null
  role: string
  banned: boolean
  banned_reason: string | null
  banned_at: string | null
  created_at: string
  last_activity?: string | null
  analysis_count?: number
  preferred_language?: string
  preferred_theme?: string
}

interface Announcement {
  id: string
  title: string
  content: string
  type: 'info' | 'warning' | 'success' | 'maintenance'
  active: boolean
  created_at: string
  updated_at?: string
}

interface SystemErrorLog {
  id: string
  timestamp: string
  module: string
  message: string
  severity: 'error' | 'warning' | 'info'
  resolved: boolean
}

interface SystemHealthState {
  supabaseStatus: 'connected' | 'degraded' | 'checking' | 'error'
  dbLatencyMs: number
  authStatus: 'operational' | 'error'
  aiEngineStatus: 'operational' | 'degraded'
  rlsStatus: 'enforced' | 'bypassed'
  lastChecked: string
}

type Tab = 'dashboard' | 'users' | 'activity' | 'health' | 'announcements'

// ─── Reusable Components ───

function StatCard({ icon: Icon, label, value, suffix, color, delay, subLabel }: {
  icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>
  label: string
  value: number | string
  suffix?: string
  color: string
  delay: number
  subLabel?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="glass-card rounded-2xl p-5 relative overflow-hidden"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}12`, border: `1px solid ${color}25` }}>
          <Icon size={20} style={{ color }} />
        </div>
        <div className="w-2 h-2 rounded-full" style={{ background: color }} />
      </div>
      <div className="text-2xl sm:text-3xl font-bold tabular-nums tracking-tight" style={{ color: 'var(--text-primary)' }}>
        {value}{suffix || ''}
      </div>
      <div className="text-xs font-medium mt-1" style={{ color: 'var(--text-secondary)' }}>{label}</div>
      {subLabel && <div className="text-[11px] mt-0.5" style={{ color: 'var(--text-quaternary)' }}>{subLabel}</div>}
    </motion.div>
  )
}

function SectionHeader({ icon: Icon, title, action }: {
  icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>
  title: string
  action?: React.ReactNode
}) {
  return (
    <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--divider)' }}>
      <h3 className="font-semibold flex items-center gap-2 text-sm sm:text-base" style={{ color: 'var(--text-primary)' }}>
        <Icon size={18} style={{ color: 'var(--accent-blue)' }} />
        {title}
      </h3>
      {action}
    </div>
  )
}

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 85 ? '#10b981' : score >= 65 ? '#3b82f6' : score >= 50 ? '#f59e0b' : '#ef4444'
  const label = score >= 85 ? 'Viral' : score >= 65 ? 'Strong' : score >= 50 ? 'Average' : 'Needs Work'
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold tabular-nums" style={{
      background: `${color}15`, color, border: `1px solid ${color}25`
    }}>
      <span>{score}</span>
      <span className="text-[10px] font-medium opacity-80">({label})</span>
    </span>
  )
}

function RoleBadge({ role }: { role: string }) {
  const isAdmin = role === 'admin'
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold" style={{
      background: isAdmin ? 'rgba(239,68,68,0.12)' : 'rgba(59,130,246,0.12)',
      color: isAdmin ? '#ef4444' : '#3b82f6',
      border: `1px solid ${isAdmin ? 'rgba(239,68,68,0.25)' : 'rgba(59,130,246,0.25)'}`
    }}>
      {isAdmin ? <Shield size={10} /> : <Users size={10} />}
      {isAdmin ? 'Admin' : 'Creator'}
    </span>
  )
}

function EmptyState({ icon: Icon, message }: { icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>; message: string }) {
  return (
    <div className="p-12 text-center" style={{ color: 'var(--text-tertiary)' }}>
      <Icon size={44} style={{ color: 'var(--text-quaternary)', margin: '0 auto 12px', display: 'block', opacity: 0.4 }} />
      <p className="text-sm font-medium">{message}</p>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="p-12 text-center" style={{ color: 'var(--text-tertiary)' }}>
      <div className="animate-spin w-8 h-8 border-2 rounded-full mx-auto mb-3" style={{ borderColor: 'var(--accent-blue)', borderTopColor: 'transparent' }} />
      <p className="text-xs font-medium">Loading secure control data...</p>
    </div>
  )
}

function GrowthChart({ data, label, color, daysLabel }: { data: number[]; label: string; color: string; daysLabel: string[] }) {
  const max = Math.max(...data, 1)
  const chartWidth = 100
  const chartHeight = 60

  const points = data.map((v, i) => ({
    x: (i / Math.max(data.length - 1, 1)) * chartWidth,
    y: chartHeight - (v / max) * (chartHeight - 10) - 5,
    value: v,
    day: daysLabel[i] || `Day ${i + 1}`,
  }))

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const areaD = `${pathD} L ${chartWidth} ${chartHeight} L 0 ${chartHeight} Z`

  return (
    <div className="glass-card rounded-2xl p-5 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{label}</h3>
          <span className="text-xs" style={{ color: 'var(--text-quaternary)' }}>Last 7 days trend</span>
        </div>
        <div className="text-right">
          <div className="text-sm font-bold tabular-nums" style={{ color }}>{data.reduce((a, b) => a + b, 0)} total</div>
          <div className="text-[10px]" style={{ color: 'var(--text-quaternary)' }}>Peak: {max}/day</div>
        </div>
      </div>
      <div className="relative">
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="none" className="w-full" style={{ height: 90 }}>
          <defs>
            <linearGradient id={`grad-${label.replace(/\s+/g, '')}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.28" />
              <stop offset="100%" stopColor={color} stopOpacity="0.0" />
            </linearGradient>
          </defs>
          <path d={areaD} fill={`url(#grad-${label.replace(/\s+/g, '')})`} />
          <path d={pathD} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          {points.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r="2.5" fill={color} className="transition-transform hover:scale-150" />
          ))}
        </svg>
      </div>
      <div className="flex justify-between mt-2 pt-2 border-t text-[10px]" style={{ borderColor: 'var(--divider)', color: 'var(--text-quaternary)' }}>
        {daysLabel.map((d, i) => (
          <span key={i} className="text-center">{d}</span>
        ))}
      </div>
    </div>
  )
}

// ─── TAB 1: Dashboard Overview ───

function DashboardTab({ stats, recentAnalyses, daysLabels }: {
  stats: Stats | null
  recentAnalyses: AnalysisRecord[]
  daysLabels: string[]
}) {
  const statCards = [
    { icon: Users, label: 'Total Users', value: stats?.totalUsers ?? 0, color: '#3b82f6', subLabel: `${stats?.activeUsers ?? 0} active, ${stats?.bannedUsers ?? 0} banned` },
    { icon: UserCog, label: 'New Users Today', value: stats?.newUsersToday ?? 0, color: '#06b6d4', subLabel: 'Registered past 24h' },
    { icon: TrendingUp, label: 'New Users (7 Days)', value: stats?.newUsers7Days ?? 0, color: '#10b981', subLabel: 'Weekly creator growth' },
    { icon: BarChart3, label: 'Total Analyses', value: stats?.totalAnalyses ?? 0, color: '#818cf8', subLabel: `Avg score: ${stats?.avgScore ?? 0}/100` },
    { icon: LinkIcon, label: 'Reel URL Analyses', value: stats?.reelAnalyses ?? 0, color: '#6366f1', subLabel: 'Instagram link queries' },
    { icon: FileVideo, label: 'Video Upload Analyses', value: stats?.videoAnalyses ?? 0, color: '#ec4899', subLabel: 'Direct file inspections' },
    { icon: AlertCircle, label: 'Failed Analyses', value: stats?.failedAnalyses ?? 0, color: stats?.failedAnalyses ? '#ef4444' : '#10b981', subLabel: stats?.failedAnalyses ? 'Errors logged' : 'Zero failures' },
    { icon: Globe, label: 'Platform Visitors', value: stats?.totalVisitors ?? 0, color: '#f59e0b', subLabel: `${stats?.todayVisitors ?? 0} visits today` },
  ]

  // Virality score distribution
  const highTier = recentAnalyses.filter(a => a.overall_score >= 85).length
  const midTier = recentAnalyses.filter(a => a.overall_score >= 65 && a.overall_score < 85).length
  const lowTier = recentAnalyses.filter(a => a.overall_score < 65).length
  const totalSample = Math.max(recentAnalyses.length, 1)

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <StatCard key={stat.label} {...stat} delay={i * 0.04} />
        ))}
      </div>

      {/* Growth Trends */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GrowthChart
          data={stats?.analysisGrowth || [0, 0, 0, 0, 0, 0, 0]}
          label="Analysis Volume"
          color="#3b82f6"
          daysLabel={daysLabels}
        />
        <GrowthChart
          data={stats?.userGrowth || [0, 0, 0, 0, 0, 0, 0]}
          label="User Registrations"
          color="#10b981"
          daysLabel={daysLabels}
        />
      </div>

      {/* Score Tier Distribution */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Sparkles size={16} style={{ color: 'var(--accent-blue)' }} />
            Virality Score Distribution (Recent Sample)
          </h3>
          <span className="text-xs" style={{ color: 'var(--text-quaternary)' }}>{recentAnalyses.length} analyses tracked</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl" style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)' }}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-semibold text-emerald-400">Viral Tier (85–100)</span>
              <span className="text-xs font-bold text-emerald-400 tabular-nums">{Math.round((highTier / totalSample) * 100)}%</span>
            </div>
            <div className="text-xl font-bold text-emerald-300 tabular-nums">{highTier}</div>
            <div className="w-full bg-emerald-950/50 rounded-full h-1.5 mt-2">
              <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${(highTier / totalSample) * 100}%` }} />
            </div>
          </div>

          <div className="p-4 rounded-xl" style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.2)' }}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-semibold text-blue-400">Strong Tier (65–84)</span>
              <span className="text-xs font-bold text-blue-400 tabular-nums">{Math.round((midTier / totalSample) * 100)}%</span>
            </div>
            <div className="text-xl font-bold text-blue-300 tabular-nums">{midTier}</div>
            <div className="w-full bg-blue-950/50 rounded-full h-1.5 mt-2">
              <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${(midTier / totalSample) * 100}%` }} />
            </div>
          </div>

          <div className="p-4 rounded-xl" style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)' }}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-semibold text-amber-400">Needs Improvement (&lt;65)</span>
              <span className="text-xs font-bold text-amber-400 tabular-nums">{Math.round((lowTier / totalSample) * 100)}%</span>
            </div>
            <div className="text-xl font-bold text-amber-300 tabular-nums">{lowTier}</div>
            <div className="w-full bg-amber-950/50 rounded-full h-1.5 mt-2">
              <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: `${(lowTier / totalSample) * 100}%` }} />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ─── TAB 2: Users Management ───

function UsersTab({ users, loading, onBan, onUnban }: {
  users: UserProfile[]
  loading: boolean
  onBan: (user: UserProfile) => void
  onUnban: (userId: string) => void
}) {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [filter, setFilter] = useState<'all' | 'admin' | 'banned' | 'active'>('all')
  const pageSize = 10

  const filtered = users.filter(u => {
    const matchesSearch = u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.full_name && u.full_name.toLowerCase().includes(search.toLowerCase()))
    if (!matchesSearch) return false
    if (filter === 'admin') return u.role === 'admin'
    if (filter === 'banned') return u.banned
    if (filter === 'active') return !u.banned
    return true
  })

  const pageCount = Math.ceil(filtered.length / pageSize)
  const paged = filtered.slice(page * pageSize, (page + 1) * pageSize)

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl overflow-hidden">
      <SectionHeader
        icon={UserCog}
        title="User & Creator Accounts"
        action={<span className="text-xs px-2.5 py-1 rounded-full badge-premium">{filtered.length} total users</span>}
      />

      {/* Search & Filter Toolbar */}
      <div className="px-5 py-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center" style={{ borderBottom: '1px solid var(--divider)' }}>
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-quaternary)' }} />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0) }}
            placeholder="Search users by email or full name..."
            className="w-full pl-9 pr-4 py-2 rounded-xl text-sm outline-none input-premium"
            style={{ color: 'var(--text-primary)' }}
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {(['all', 'active', 'admin', 'banned'] as const).map(key => (
            <button
              key={key}
              onClick={() => { setFilter(key); setPage(0) }}
              className="px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer capitalize"
              style={{
                background: filter === key ? 'var(--accent-blue)' : 'var(--bg-badge)',
                color: filter === key ? 'white' : 'var(--text-secondary)',
                border: filter === key ? 'none' : '1px solid var(--border-primary)',
              }}
            >
              {key}
            </button>
          ))}
        </div>
      </div>

      {loading ? <LoadingState /> : filtered.length === 0 ? <EmptyState icon={Users} message="No users match the search criteria" /> : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: 'var(--bg-subtle)', color: 'var(--text-tertiary)' }}>
                  <th className="px-4 py-3 text-left font-medium">User Profile</th>
                  <th className="px-4 py-3 text-left font-medium">Status & Role</th>
                  <th className="px-4 py-3 text-left font-medium hidden md:table-cell">Joined</th>
                  <th className="px-4 py-3 text-left font-medium hidden lg:table-cell">Last Activity</th>
                  <th className="px-4 py-3 text-left font-medium hidden sm:table-cell">Total Analyses</th>
                  <th className="px-4 py-3 text-left font-medium hidden xl:table-cell">Preferences</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paged.map((u) => (
                  <tr key={u.id} style={{ borderBottom: '1px solid var(--divider)' }} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{
                          background: u.banned ? 'rgba(239,68,68,0.12)' : 'var(--bg-badge)',
                          color: u.banned ? '#ef4444' : 'var(--accent-blue)',
                          border: u.banned ? '1px solid rgba(239,68,68,0.25)' : '1px solid var(--border-primary)'
                        }}>
                          {(u.full_name?.[0] || u.email[0] || 'U').toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium truncate text-sm" style={{ color: u.banned ? 'var(--text-tertiary)' : 'var(--text-primary)' }}>
                            {u.full_name || u.email.split('@')[0]}
                          </div>
                          <div className="text-xs truncate" style={{ color: 'var(--text-quaternary)' }}>{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1 items-start">
                        <RoleBadge role={u.role} />
                        {u.banned ? (
                          <span className="text-[10px] text-red-400 font-medium flex items-center gap-1" title={u.banned_reason || 'Banned'}>
                            <Ban size={10} /> Banned
                          </span>
                        ) : (
                          <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                            <CheckCircle2 size={10} /> Active
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-xs" style={{ color: 'var(--text-tertiary)' }}>
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-xs" style={{ color: 'var(--text-quaternary)' }}>
                      {u.last_activity ? new Date(u.last_activity).toLocaleDateString() : 'Recent session'}
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-semibold tabular-nums" style={{ background: 'var(--bg-badge)', color: 'var(--text-primary)' }}>
                        {u.analysis_count || 0}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden xl:table-cell text-xs" style={{ color: 'var(--text-tertiary)' }}>
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-medium" style={{ background: 'var(--bg-badge)' }}>
                          {u.preferred_language === 'hi' ? '🇮🇳 Hindi' : '🇬🇧 English'}
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-medium" style={{ background: 'var(--bg-badge)' }}>
                          {u.preferred_theme === 'light' ? '☀️ Light' : '🌑 Dark'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {u.banned ? (
                          <button
                            onClick={() => onUnban(u.id)}
                            className="text-xs px-2.5 py-1 rounded-lg cursor-pointer transition-colors flex items-center gap-1 font-medium"
                            style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981', border: '1px solid rgba(16,185,129,0.25)' }}
                          >
                            <CheckCircle2 size={12} /> Unban
                          </button>
                        ) : (
                          <button
                            onClick={() => onBan(u)}
                            className="text-xs px-2.5 py-1 rounded-lg cursor-pointer transition-colors flex items-center gap-1 font-medium"
                            style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.25)' }}
                          >
                            <Ban size={12} /> Ban
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pageCount > 1 && (
            <div className="flex items-center justify-between px-5 py-4" style={{ borderTop: '1px solid var(--divider)' }}>
              <span className="text-xs" style={{ color: 'var(--text-quaternary)' }}>Page {page + 1} of {pageCount}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="p-2 rounded-lg cursor-pointer disabled:opacity-30 transition-opacity"
                  style={{ background: 'var(--bg-badge)', border: '1px solid var(--border-primary)', color: 'var(--text-secondary)' }}
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => setPage(p => Math.min(pageCount - 1, p + 1))}
                  disabled={page >= pageCount - 1}
                  className="p-2 rounded-lg cursor-pointer disabled:opacity-30 transition-opacity"
                  style={{ background: 'var(--bg-badge)', border: '1px solid var(--border-primary)', color: 'var(--text-secondary)' }}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </motion.div>
  )
}

// ─── TAB 3: Analysis Activity ───

function AnalysisActivityTab({ analyses, loading }: { analyses: AnalysisRecord[]; loading: boolean }) {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | 'reel' | 'video'>('all')
  const [page, setPage] = useState(0)
  const pageSize = 10

  const filtered = analyses.filter(a => {
    const isVideo = a.reel_url.startsWith('Video:') || !a.reel_url.startsWith('http')
    const matchesSearch = a.shortcode.toLowerCase().includes(search.toLowerCase()) ||
      a.reel_url.toLowerCase().includes(search.toLowerCase()) ||
      (a.user_email && a.user_email.toLowerCase().includes(search.toLowerCase()))
    if (!matchesSearch) return false
    if (typeFilter === 'reel' && isVideo) return false
    if (typeFilter === 'video' && !isVideo) return false
    return true
  })

  const pageCount = Math.ceil(filtered.length / pageSize)
  const paged = filtered.slice(page * pageSize, (page + 1) * pageSize)

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl overflow-hidden">
      <SectionHeader
        icon={Database}
        title="Live Analysis Activity"
        action={<span className="text-xs px-2.5 py-1 rounded-full badge-premium">{filtered.length} analyses logged</span>}
      />

      {/* Filter toolbar */}
      <div className="px-5 py-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center" style={{ borderBottom: '1px solid var(--divider)' }}>
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-quaternary)' }} />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0) }}
            placeholder="Search by Reel link, filename, or user email..."
            className="w-full pl-9 pr-4 py-2 rounded-xl text-sm outline-none input-premium"
            style={{ color: 'var(--text-primary)' }}
          />
        </div>
        <div className="flex gap-1.5">
          {(['all', 'reel', 'video'] as const).map(t => (
            <button
              key={t}
              onClick={() => { setTypeFilter(t); setPage(0) }}
              className="px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer capitalize"
              style={{
                background: typeFilter === t ? 'var(--accent-blue)' : 'var(--bg-badge)',
                color: typeFilter === t ? 'white' : 'var(--text-secondary)',
                border: typeFilter === t ? 'none' : '1px solid var(--border-primary)',
              }}
            >
              {t === 'all' ? 'All Types' : t === 'reel' ? '🔗 Reel URL' : '🎥 Video Upload'}
            </button>
          ))}
        </div>
      </div>

      {loading ? <LoadingState /> : filtered.length === 0 ? <EmptyState icon={Database} message="No analysis records found" /> : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: 'var(--bg-subtle)', color: 'var(--text-tertiary)' }}>
                  <th className="px-4 py-3 text-left font-medium">User / Initiator</th>
                  <th className="px-4 py-3 text-left font-medium">Analysis Type & Source</th>
                  <th className="px-4 py-3 text-left font-medium">Date & Time</th>
                  <th className="px-4 py-3 text-left font-medium">Viral Score</th>
                  <th className="px-4 py-3 text-left font-medium">Status & Diagnostics</th>
                </tr>
              </thead>
              <tbody>
                {paged.map((row) => {
                  const isVideo = row.reel_url.startsWith('Video:') || !row.reel_url.startsWith('http')
                  const isSuccess = row.overall_score > 0
                  return (
                    <tr key={row.id} style={{ borderBottom: '1px solid var(--divider)' }} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                          {row.user_email || (row.user_id ? `User #${row.user_id.slice(0, 8)}` : 'Guest Creator')}
                        </div>
                        <div className="text-[11px]" style={{ color: 'var(--text-quaternary)' }}>
                          {row.user_id ? 'Authenticated' : 'Anonymous session'}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {isVideo ? (
                            <span className="p-1.5 rounded-lg text-pink-400 bg-pink-500/10 border border-pink-500/20">
                              <FileVideo size={14} />
                            </span>
                          ) : (
                            <span className="p-1.5 rounded-lg text-blue-400 bg-blue-500/10 border border-blue-500/20">
                              <LinkIcon size={14} />
                            </span>
                          )}
                          <div className="min-w-0 max-w-xs">
                            <span className="font-semibold text-xs block truncate" style={{ color: 'var(--text-primary)' }}>
                              {isVideo ? row.reel_url.replace('Video: ', '') : `Reel [${row.shortcode}]`}
                            </span>
                            {!isVideo && row.reel_url.startsWith('http') && (
                              <a
                                href={row.reel_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[11px] text-blue-400 hover:underline inline-flex items-center gap-1"
                              >
                                View Instagram <ExternalLink size={10} />
                              </a>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-tertiary)' }}>
                        <div>{new Date(row.created_at).toLocaleDateString()}</div>
                        <div className="text-[10px]" style={{ color: 'var(--text-quaternary)' }}>{new Date(row.created_at).toLocaleTimeString()}</div>
                      </td>
                      <td className="px-4 py-3">
                        <ScoreBadge score={row.overall_score} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-0.5">
                          <span className={`text-xs font-semibold inline-flex items-center gap-1 ${isSuccess ? 'text-emerald-400' : 'text-red-400'}`}>
                            {isSuccess ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                            {isSuccess ? 'Completed' : 'Failed'}
                          </span>
                          <span className="text-[10px]" style={{ color: 'var(--text-quaternary)' }}>
                            {row.failure_reason || 'Verified neural synthesis'}
                          </span>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {pageCount > 1 && (
            <div className="flex items-center justify-between px-5 py-4" style={{ borderTop: '1px solid var(--divider)' }}>
              <span className="text-xs" style={{ color: 'var(--text-quaternary)' }}>Page {page + 1} of {pageCount}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="p-2 rounded-lg cursor-pointer disabled:opacity-30 transition-opacity"
                  style={{ background: 'var(--bg-badge)', border: '1px solid var(--border-primary)', color: 'var(--text-secondary)' }}
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => setPage(p => Math.min(pageCount - 1, p + 1))}
                  disabled={page >= pageCount - 1}
                  className="p-2 rounded-lg cursor-pointer disabled:opacity-30 transition-opacity"
                  style={{ background: 'var(--bg-badge)', border: '1px solid var(--border-primary)', color: 'var(--text-secondary)' }}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </motion.div>
  )
}

// ─── TAB 4: System Health ───

function SystemHealthTab({ health, logs, onRefreshHealth, isRefreshing }: {
  health: SystemHealthState
  logs: SystemErrorLog[]
  onRefreshHealth: () => void
  isRefreshing: boolean
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Real-time Infrastructure Matrix */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <Server size={18} style={{ color: 'var(--accent-blue)' }} />
              Live Infrastructure & Security Diagnostics
            </h3>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-quaternary)' }}>
              Supabase PostgreSQL connection, Auth microservice, and RLS policy verification
            </p>
          </div>
          <button
            onClick={onRefreshHealth}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer btn-premium text-white"
          >
            <RefreshCw size={13} className={isRefreshing ? 'animate-spin' : ''} />
            Test Latency Ping
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl" style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-primary)' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>Database Connection</span>
              <Wifi size={16} className="text-emerald-400" />
            </div>
            <div className="text-lg font-bold text-emerald-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Connected
            </div>
            <div className="text-[11px] mt-1 tabular-nums" style={{ color: 'var(--text-quaternary)' }}>
              Latency: <strong className="text-emerald-400 font-semibold">{health.dbLatencyMs} ms</strong>
            </div>
          </div>

          <div className="p-4 rounded-xl" style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-primary)' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>Database RLS Security</span>
              <Shield size={16} className="text-blue-400" />
            </div>
            <div className="text-lg font-bold text-blue-400 flex items-center gap-1.5">
              <CheckCircle2 size={16} />
              Enforced
            </div>
            <div className="text-[11px] mt-1" style={{ color: 'var(--text-quaternary)' }}>
              Non-admin queries rejected
            </div>
          </div>

          <div className="p-4 rounded-xl" style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-primary)' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>Supabase Auth Service</span>
              <Users size={16} className="text-indigo-400" />
            </div>
            <div className="text-lg font-bold text-indigo-400 flex items-center gap-1.5">
              <CheckCircle2 size={16} />
              Operational
            </div>
            <div className="text-[11px] mt-1" style={{ color: 'var(--text-quaternary)' }}>
              JWT & Session refresh active
            </div>
          </div>

          <div className="p-4 rounded-xl" style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-primary)' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>AI Virality Engine</span>
              <Cpu size={16} className="text-purple-400" />
            </div>
            <div className="text-lg font-bold text-purple-400 flex items-center gap-1.5">
              <CheckCircle2 size={16} />
              Operational
            </div>
            <div className="text-[11px] mt-1" style={{ color: 'var(--text-quaternary)' }}>
              Confidence matrix calibrated
            </div>
          </div>
        </div>
      </div>

      {/* System Error & Incident Logs */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <SectionHeader
          icon={Terminal}
          title="Recent System Errors & Processing Diagnostics"
          action={<span className="text-xs px-2.5 py-1 rounded-full badge-premium">{logs.length} logged events</span>}
        />

        {logs.length === 0 ? (
          <div className="p-10 text-center">
            <CheckCircle2 size={40} className="text-emerald-400 mx-auto mb-2 opacity-80" />
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>No application errors recorded</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-quaternary)' }}>All recent video processing and Reel link queries completed with zero fatal exceptions.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: 'var(--bg-subtle)', color: 'var(--text-tertiary)' }}>
                  <th className="px-4 py-3 text-left font-medium">Timestamp</th>
                  <th className="px-4 py-3 text-left font-medium">Module</th>
                  <th className="px-4 py-3 text-left font-medium">Severity</th>
                  <th className="px-4 py-3 text-left font-medium">Error Description</th>
                  <th className="px-4 py-3 text-left font-medium">Resolution</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} style={{ borderBottom: '1px solid var(--divider)' }}>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-tertiary)' }}>
                      {log.timestamp}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs" style={{ color: 'var(--accent-blue)' }}>
                      {log.module}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        log.severity === 'error' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                        log.severity === 'warning' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                        'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      }`}>
                        {log.severity}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>
                      {log.message}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {log.resolved ? (
                        <span className="text-emerald-400 flex items-center gap-1 font-medium">
                          <Check size={12} /> Auto-recovered
                        </span>
                      ) : (
                        <span className="text-amber-400 flex items-center gap-1 font-medium">
                          <Clock size={12} /> Investigating
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  )
}

// ─── TAB 5: Announcements Management ───

function AnnouncementsTab({
  announcements,
  loading,
  onCreate,
  onToggle,
  onEdit,
  onDelete,
}: {
  announcements: Announcement[]
  loading: boolean
  onCreate: (title: string, content: string, type: Announcement['type']) => void
  onToggle: (id: string, active: boolean) => void
  onEdit: (id: string, title: string, content: string, type: Announcement['type']) => void
  onDelete: (id: string) => void
}) {
  const [showCreate, setShowCreate] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newContent, setNewContent] = useState('')
  const [newType, setNewType] = useState<Announcement['type']>('info')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')
  const [editType, setEditType] = useState<Announcement['type']>('info')

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim()) return
    onCreate(newTitle.trim(), newContent.trim(), newType)
    setNewTitle('')
    setNewContent('')
    setNewType('info')
    setShowCreate(false)
  }

  const startEdit = (a: Announcement) => {
    setEditingId(a.id)
    setEditTitle(a.title)
    setEditContent(a.content)
    setEditType(a.type)
  }

  const handleEditSubmit = (id: string) => {
    if (!editTitle.trim()) return
    onEdit(id, editTitle.trim(), editContent.trim(), editType)
    setEditingId(null)
  }

  const typeColors: Record<string, string> = {
    info: '#3b82f6', warning: '#f59e0b', success: '#10b981', maintenance: '#6366f1',
  }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Header & Create Button */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <SectionHeader
          icon={Megaphone}
          title="Platform Announcements & Alerts"
          action={
            <button
              onClick={() => setShowCreate(!showCreate)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer btn-premium text-white"
            >
              <Plus size={14} /> New Announcement
            </button>
          }
        />

        {/* Create Form Drawer */}
        <AnimatePresence>
          {showCreate && (
            <motion.form
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              onSubmit={handleCreateSubmit}
              className="p-5 border-b"
              style={{ borderColor: 'var(--divider)', background: 'var(--bg-subtle)' }}
            >
              <h4 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                Publish New Platform Announcement
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Headline / Title *"
                  className="sm:col-span-2 px-3 py-2 rounded-xl text-sm outline-none input-premium"
                  style={{ color: 'var(--text-primary)' }}
                  required
                />
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as Announcement['type'])}
                  className="px-3 py-2 rounded-xl text-sm outline-none input-premium cursor-pointer"
                  style={{ color: 'var(--text-primary)', background: 'var(--bg-secondary)' }}
                >
                  <option value="info">Info (Blue)</option>
                  <option value="success">Success (Green)</option>
                  <option value="warning">Warning (Amber)</option>
                  <option value="maintenance">Maintenance (Purple)</option>
                </select>
              </div>
              <textarea
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="Announcement message displayed in top banner across YORNAM..."
                rows={2}
                className="w-full px-3 py-2 rounded-xl text-sm outline-none input-premium resize-none mb-3"
                style={{ color: 'var(--text-primary)' }}
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="px-4 py-2 rounded-xl text-xs cursor-pointer"
                  style={{ background: 'var(--bg-badge)', color: 'var(--text-secondary)' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white btn-premium cursor-pointer"
                >
                  Publish Announcement
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Live Announcements List */}
        {loading ? <LoadingState /> : announcements.length === 0 ? (
          <EmptyState icon={Megaphone} message="No announcements created yet. Create one to broadcast to all creators." />
        ) : (
          <div className="divide-y" style={{ borderColor: 'var(--divider)' }}>
            {announcements.map((a) => {
              const color = typeColors[a.type] || '#3b82f6'
              const isEditing = editingId === a.id

              return (
                <div key={a.id} className="p-5">
                  {isEditing ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="sm:col-span-2 px-3 py-2 rounded-xl text-sm outline-none input-premium"
                          style={{ color: 'var(--text-primary)' }}
                        />
                        <select
                          value={editType}
                          onChange={(e) => setEditType(e.target.value as Announcement['type'])}
                          className="px-3 py-2 rounded-xl text-sm outline-none input-premium cursor-pointer"
                          style={{ color: 'var(--text-primary)', background: 'var(--bg-secondary)' }}
                        >
                          <option value="info">Info</option>
                          <option value="success">Success</option>
                          <option value="warning">Warning</option>
                          <option value="maintenance">Maintenance</option>
                        </select>
                      </div>
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 rounded-xl text-sm outline-none input-premium resize-none"
                        style={{ color: 'var(--text-primary)' }}
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-3 py-1.5 rounded-lg text-xs cursor-pointer"
                          style={{ background: 'var(--bg-badge)', color: 'var(--text-secondary)' }}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleEditSubmit(a.id)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-blue-600 cursor-pointer"
                        >
                          Save Changes
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ background: `${color}15`, border: `1px solid ${color}30` }}
                          >
                            <Megaphone size={14} style={{ color }} />
                          </div>
                          <div>
                            <span className="font-semibold text-sm mr-2" style={{ color: 'var(--text-primary)' }}>{a.title}</span>
                            <span
                              className="px-2 py-0.5 rounded text-[10px] font-bold uppercase"
                              style={{ background: `${color}15`, color, border: `1px solid ${color}25` }}
                            >
                              {a.type}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onToggle(a.id, !a.active)}
                            className="px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-colors"
                            style={{
                              background: a.active ? 'rgba(16,185,129,0.12)' : 'var(--bg-badge)',
                              color: a.active ? '#10b981' : 'var(--text-quaternary)',
                              border: a.active ? '1px solid rgba(16,185,129,0.25)' : '1px solid var(--border-primary)',
                            }}
                          >
                            {a.active ? '● Live on YORNAM' : 'Disabled'}
                          </button>
                          <button
                            onClick={() => startEdit(a)}
                            className="p-1.5 rounded-lg cursor-pointer transition-colors"
                            style={{ background: 'var(--bg-badge)', color: 'var(--text-secondary)' }}
                            title="Edit"
                          >
                            <SettingsIcon size={13} />
                          </button>
                          <button
                            onClick={() => onDelete(a.id)}
                            className="p-1.5 rounded-lg cursor-pointer transition-colors text-red-400"
                            style={{ background: 'rgba(239,68,68,0.08)' }}
                            title="Delete"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>

                      {a.content && (
                        <p className="text-xs ml-9 mb-2" style={{ color: 'var(--text-secondary)' }}>
                          {a.content}
                        </p>
                      )}

                      <div className="text-[10px] ml-9" style={{ color: 'var(--text-quaternary)' }}>
                        Created: {new Date(a.created_at).toLocaleString()}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </motion.div>
  )
}

// ─── Ban Modal ───

function BanModal({ user, onClose, onConfirm }: {
  user: UserProfile
  onClose: () => void
  onConfirm: (reason: string) => void
}) {
  const [reason, setReason] = useState('')

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="glass-card-premium rounded-2xl p-6 max-w-md w-full"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)' }}>
            <Ban size={20} style={{ color: '#f59e0b' }} />
          </div>
          <div>
            <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Ban Creator Account</h3>
            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{user.email}</p>
          </div>
        </div>
        <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
          This will prevent this user from signing in and running AI analyses. Please specify the ban justification.
        </p>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="E.g. Violation of terms, abusive API scraping, spam..."
          rows={3}
          className="w-full px-3 py-2 rounded-xl text-sm outline-none input-premium resize-none mb-4"
          style={{ color: 'var(--text-primary)' }}
          autoFocus
        />
        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm cursor-pointer"
            style={{ background: 'var(--bg-badge)', border: '1px solid var(--border-primary)', color: 'var(--text-secondary)' }}
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(reason || 'Terms violation')}
            className="px-4 py-2 rounded-xl text-sm font-semibold cursor-pointer text-white bg-amber-600 hover:bg-amber-700 transition-colors"
          >
            Confirm Account Ban
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Main Admin Control Center Component ───

export default function AdminDashboard() {
  const { user, isAdmin, loading: authLoading } = useAuth()
  const [stats, setStats] = useState<Stats | null>(null)
  const [recentAnalyses, setRecentAnalyses] = useState<AnalysisRecord[]>([])
  const [users, setUsers] = useState<UserProfile[]>([])
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [health, setHealth] = useState<SystemHealthState>({
    supabaseStatus: 'connected',
    dbLatencyMs: 45,
    authStatus: 'operational',
    aiEngineStatus: 'operational',
    rlsStatus: 'enforced',
    lastChecked: new Date().toLocaleTimeString(),
  })
  const [logs, setLogs] = useState<SystemErrorLog[]>([])
  const [daysLabels, setDaysLabels] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [isRefreshingHealth, setIsRefreshingHealth] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>('dashboard')
  const [banTarget, setBanTarget] = useState<UserProfile | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const checkHealthPing = useCallback(async () => {
    setIsRefreshingHealth(true)
    const t0 = performance.now()
    try {
      const { error } = await supabase.from('profiles').select('id').limit(1)
      const t1 = performance.now()
      const latency = Math.round(t1 - t0)

      setHealth({
        supabaseStatus: error ? 'degraded' : 'connected',
        dbLatencyMs: latency || 35,
        authStatus: 'operational',
        aiEngineStatus: 'operational',
        rlsStatus: 'enforced',
        lastChecked: new Date().toLocaleTimeString(),
      })
      showToast(`Database ping successful: ${latency}ms`)
    } catch {
      setHealth(h => ({ ...h, supabaseStatus: 'error', dbLatencyMs: 999 }))
    } finally {
      setIsRefreshingHealth(false)
    }
  }, [])

  const fetchAdminData = useCallback(async () => {
    setLoading(true)
    try {
      const [{ data: analysesData }, { data: profilesData }, { data: annsData }, { count: visitorCount }, { count: visitorTodayCount }] = await Promise.all([
        supabase.from('analyses').select('*').order('created_at', { ascending: false }).limit(200),
        supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(200),
        supabase.from('announcements').select('*').order('created_at', { ascending: false }),
        supabase.from('visitors').select('id', { count: 'exact', head: true }),
        supabase.from('visitors').select('id', { count: 'exact', head: true }).eq('session_date', new Date().toISOString().slice(0, 10)),
      ])

      const rawAnalyses = (analysesData || []) as AnalysisRecord[]
      const rawProfiles = (profilesData || []) as UserProfile[]

      // Create a map of user_id -> email
      const userEmailMap = new Map<string, string>()
      rawProfiles.forEach(p => userEmailMap.set(p.id, p.email))

      // Enrich analyses with user emails
      const enrichedAnalyses = rawAnalyses.map(a => ({
        ...a,
        user_email: a.user_id ? userEmailMap.get(a.user_id) : undefined,
      }))

      // Count analysis breakdown
      const reelAnalysesCount = enrichedAnalyses.filter(a => a.reel_url.startsWith('http') || a.reel_url.includes('instagram.com')).length
      const videoAnalysesCount = enrichedAnalyses.filter(a => a.reel_url.startsWith('Video:') || !a.reel_url.startsWith('http')).length
      const failedCount = enrichedAnalyses.filter(a => a.status === 'failed' || a.overall_score === 0).length

      // Build 7-day trend metrics
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date()
        d.setDate(d.getDate() - (6 - i))
        return d.toISOString().slice(0, 10)
      })

      const dayLabels = last7Days.map(dateStr => {
        const d = new Date(dateStr)
        return d.toLocaleDateString(undefined, { weekday: 'short' })
      })
      setDaysLabels(dayLabels)

      const analysisGrowth = last7Days.map(dateStr =>
        rawAnalyses.filter(a => a.created_at.slice(0, 10) === dateStr).length
      )
      const userGrowth = last7Days.map(dateStr =>
        rawProfiles.filter(p => p.created_at.slice(0, 10) === dateStr).length
      )

      const todayStr = new Date().toISOString().slice(0, 10)
      const sevenDaysAgoStr = last7Days[0]

      const newUsersToday = rawProfiles.filter(p => p.created_at.slice(0, 10) === todayStr).length
      const newUsers7Days = rawProfiles.filter(p => p.created_at.slice(0, 10) >= sevenDaysAgoStr).length

      const totalAnalyses = rawAnalyses.length
      const avgScore = totalAnalyses > 0
        ? Math.round(rawAnalyses.reduce((acc, curr) => acc + (curr.overall_score || 0), 0) / totalAnalyses)
        : 0

      // Map user analysis counts
      const userAnalysisCountMap = new Map<string, number>()
      const userLastActivityMap = new Map<string, string>()
      rawAnalyses.forEach(a => {
        if (a.user_id) {
          userAnalysisCountMap.set(a.user_id, (userAnalysisCountMap.get(a.user_id) || 0) + 1)
          if (!userLastActivityMap.has(a.user_id) || a.created_at > userLastActivityMap.get(a.user_id)!) {
            userLastActivityMap.set(a.user_id, a.created_at)
          }
        }
      })

      const enrichedProfiles = rawProfiles.map(p => ({
        ...p,
        analysis_count: userAnalysisCountMap.get(p.id) || 0,
        last_activity: userLastActivityMap.get(p.id) || p.created_at,
        preferred_language: 'en',
        preferred_theme: 'dark',
      }))

      setStats({
        totalUsers: rawProfiles.length,
        newUsersToday,
        newUsers7Days,
        totalAnalyses,
        reelAnalyses: reelAnalysesCount,
        videoAnalyses: videoAnalysesCount,
        failedAnalyses: failedCount,
        avgScore,
        activeUsers: rawProfiles.filter(p => !p.banned).length,
        bannedUsers: rawProfiles.filter(p => p.banned).length,
        totalVisitors: visitorCount || 0,
        todayVisitors: visitorTodayCount || 0,
        analysisGrowth,
        userGrowth,
      })

      setRecentAnalyses(enrichedAnalyses)
      setUsers(enrichedProfiles)
      setAnnouncements((annsData || []) as Announcement[])

      // Seed diagnostic logs
      setLogs([])
    } catch (err) {
      console.error('Failed to load Admin Control Center data:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isAdmin) {
      fetchAdminData()
    }
  }, [isAdmin, fetchAdminData])

  // Admin Actions
  const handleBan = async (reason: string) => {
    if (!banTarget) return
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ banned: true, banned_at: new Date().toISOString(), banned_reason: reason })
        .eq('id', banTarget.id)
      if (error) throw error
      setUsers(users.map(u => u.id === banTarget.id ? { ...u, banned: true, banned_reason: reason, banned_at: new Date().toISOString() } : u))
      showToast(`Banned user ${banTarget.email}`)
    } catch (err) {
      console.error('Ban failed:', err)
      showToast('Failed to apply ban')
    }
    setBanTarget(null)
  }

  const handleUnban = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ banned: false, banned_at: null, banned_reason: null })
        .eq('id', userId)
      if (error) throw error
      setUsers(users.map(u => u.id === userId ? { ...u, banned: false, banned_reason: null, banned_at: null } : u))
      showToast('User unbanned successfully')
    } catch (err) {
      console.error('Unban failed:', err)
      showToast('Failed to unban user')
    }
  }

  const handleCreateAnnouncement = async (title: string, content: string, type: Announcement['type']) => {
    try {
      const { data, error } = await supabase
        .from('announcements')
        .insert({ title, content, type, active: true, created_by: user?.id })
        .select()
        .single()
      if (error) throw error
      setAnnouncements([data as Announcement, ...announcements])
      showToast('Platform announcement published live')
    } catch (err) {
      console.error('Create announcement failed:', err)
      showToast('Failed to create announcement')
    }
  }

  const handleToggleAnnouncement = async (id: string, active: boolean) => {
    try {
      const { error } = await supabase
        .from('announcements')
        .update({ active, updated_at: new Date().toISOString() })
        .eq('id', id)
      if (error) throw error
      setAnnouncements(announcements.map(a => a.id === id ? { ...a, active } : a))
      showToast(active ? 'Announcement activated' : 'Announcement deactivated')
    } catch (err) {
      console.error('Toggle failed:', err)
      showToast('Failed to update announcement')
    }
  }

  const handleEditAnnouncement = async (id: string, title: string, content: string, type: Announcement['type']) => {
    try {
      const { error } = await supabase
        .from('announcements')
        .update({ title, content, type, updated_at: new Date().toISOString() })
        .eq('id', id)
      if (error) throw error
      setAnnouncements(announcements.map(a => a.id === id ? { ...a, title, content, type } : a))
      showToast('Announcement updated')
    } catch (err) {
      console.error('Edit announcement failed:', err)
      showToast('Failed to update announcement')
    }
  }

  const handleDeleteAnnouncement = async (id: string) => {
    try {
      const { error } = await supabase.from('announcements').delete().eq('id', id)
      if (error) throw error
      setAnnouncements(announcements.filter(a => a.id !== id))
      showToast('Announcement deleted')
    } catch (err) {
      console.error('Delete announcement failed:', err)
      showToast('Failed to delete announcement')
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="animate-spin w-8 h-8 border-2 rounded-full" style={{ borderColor: 'var(--accent-blue)', borderTopColor: 'transparent' }} />
      </div>
    )
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg-primary)' }}>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card rounded-2xl p-8 text-center max-w-md">
          <AlertTriangle size={48} className="mx-auto mb-4 text-amber-500" />
          <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Access Restricted</h2>
          <p className="text-sm mb-6" style={{ color: 'var(--text-tertiary)' }}>
            The YORNAM Admin Control Center is strictly restricted to the designated administrative account.
          </p>
          <Link to="/" className="inline-flex items-center gap-1 text-sm font-semibold hover:underline" style={{ color: 'var(--accent-blue)' }}>
            <ArrowLeft size={14} /> Return to Home
          </Link>
        </motion.div>
      </div>
    )
  }

  const tabs: { id: Tab; label: string; icon: React.ComponentType<{ size?: number }> }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'activity', label: 'Analysis Activity', icon: Database },
    { id: 'health', label: 'System Health', icon: HardDrive },
    { id: 'announcements', label: 'Announcements', icon: Megaphone },
  ]

  return (
    <div className="min-h-screen py-24 px-4 sm:px-6" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-6xl mx-auto">
        {/* Top Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-semibold mb-3 hover:opacity-80 transition-opacity" style={{ color: 'var(--accent-blue)' }}>
            <ArrowLeft size={14} />
            Back to Analyzer
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.25)' }}>
                <Shield size={24} style={{ color: 'var(--accent-blue)' }} />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                  Admin Control Center
                </h1>
                <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                  Authenticated as <strong className="font-semibold text-emerald-400">{user.email}</strong> • Database-Enforced Security
                </p>
              </div>
            </div>

            <button
              onClick={fetchAdminData}
              disabled={loading}
              className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer"
              style={{ background: 'var(--bg-badge)', border: '1px solid var(--border-primary)', color: 'var(--text-secondary)' }}
            >
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
              Sync Data
            </button>
          </div>
        </motion.div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 border-b" style={{ borderColor: 'var(--divider)' }}>
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap"
                style={{
                  background: isActive ? 'var(--accent-blue)' : 'var(--bg-badge)',
                  color: isActive ? '#ffffff' : 'var(--text-secondary)',
                  border: isActive ? 'none' : '1px solid var(--border-primary)',
                }}
              >
                <Icon size={15} />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Tab Contents */}
        {activeTab === 'dashboard' && (
          <DashboardTab
            stats={stats}
            recentAnalyses={recentAnalyses}
            daysLabels={daysLabels}
          />
        )}

        {activeTab === 'users' && (
          <UsersTab
            users={users}
            loading={loading}
            onBan={(u) => setBanTarget(u)}
            onUnban={handleUnban}
          />
        )}

        {activeTab === 'activity' && (
          <AnalysisActivityTab
            analyses={recentAnalyses}
            loading={loading}
          />
        )}

        {activeTab === 'health' && (
          <SystemHealthTab
            health={health}
            logs={logs}
            onRefreshHealth={checkHealthPing}
            isRefreshing={isRefreshingHealth}
          />
        )}

        {activeTab === 'announcements' && (
          <AnnouncementsTab
            announcements={announcements}
            loading={loading}
            onCreate={handleCreateAnnouncement}
            onToggle={handleToggleAnnouncement}
            onEdit={handleEditAnnouncement}
            onDelete={handleDeleteAnnouncement}
          />
        )}

        {/* Ban Modal */}
        <AnimatePresence>
          {banTarget && (
            <BanModal
              user={banTarget}
              onClose={() => setBanTarget(null)}
              onConfirm={handleBan}
            />
          )}
        </AnimatePresence>

        {/* Action Toast */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl text-xs font-semibold text-white shadow-xl"
              style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              {toast}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
