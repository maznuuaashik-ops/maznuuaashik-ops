import { createClient, type User, type Session } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

const isConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('http') &&
  !supabaseUrl.includes('placeholder')
)

// ─── Local Storage Fallback Database ───
const STORAGE_KEYS = {
  USERS: 'yornam_db_users',
  SESSION: 'yornam_db_session',
  PROFILES: 'yornam_db_profiles',
  ANALYSES: 'yornam_db_analyses',
  ANNOUNCEMENTS: 'yornam_db_announcements',
  VISITORS: 'yornam_db_visitors',
  SETTINGS: 'yornam_db_settings',
}

function getStored<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch {
    return defaultValue
  }
}

function setStored<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // silent
  }
}

// Initial seed data if not present
function initializeSeedData() {
  const existingProfiles = getStored<any[]>(STORAGE_KEYS.PROFILES, [])
  if (existingProfiles.length === 0) {
    const defaultProfiles = [
      {
        id: 'admin-user-001',
        email: 'admin@yornam.com',
        full_name: 'Admin User',
        avatar_url: null,
        role: 'admin',
        banned: false,
        banned_reason: null,
        banned_at: null,
        created_at: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
      },
      {
        id: 'demo-creator-002',
        email: 'creator@example.com',
        full_name: 'Alex Rivera',
        avatar_url: null,
        role: 'user',
        banned: false,
        banned_reason: null,
        banned_at: null,
        created_at: new Date(Date.now() - 14 * 24 * 3600 * 1000).toISOString(),
      }
    ]
    setStored(STORAGE_KEYS.PROFILES, defaultProfiles)
  }

  const existingAnnouncements = getStored<any[]>(STORAGE_KEYS.ANNOUNCEMENTS, [])
  if (existingAnnouncements.length === 0) {
    const defaultAnnouncements = [
      {
        id: 'ann-1',
        title: 'YORNAM v2.0 AI Engine Active',
        content: 'Deep pattern recognition & virality forecasting enabled.',
        type: 'info',
        active: true,
        created_at: new Date().toISOString(),
      }
    ]
    setStored(STORAGE_KEYS.ANNOUNCEMENTS, defaultAnnouncements)
  }

  const existingSettings = getStored<any[]>(STORAGE_KEYS.SETTINGS, [])
  if (existingSettings.length === 0) {
    const defaultSettings = [
      {
        id: 'set-1',
        key: 'virality_threshold',
        value: '75',
        description: 'Minimum composite score for viral badge classification',
        updated_at: new Date().toISOString(),
      },
      {
        id: 'set-2',
        key: 'hook_weight',
        value: '0.25',
        description: 'First 3-seconds weighting in score calculation',
        updated_at: new Date().toISOString(),
      }
    ]
    setStored(STORAGE_KEYS.SETTINGS, defaultSettings)
  }
}

initializeSeedData()

class MockQueryBuilder {
  private tableName: string
  private filters: Array<(item: any) => boolean> = []
  private sortFn: ((a: any, b: any) => number) | null = null
  private limitCount: number | null = null
  private rangeOffset: number = 0

  constructor(tableName: string) {
    this.tableName = tableName
  }

  select(_columns: string = '*', _options?: { count?: 'exact' | 'planned' | 'estimated' }) {
    return this
  }

  eq(column: string, value: any) {
    this.filters.push((item) => item[column] === value)
    return this
  }

  neq(column: string, value: any) {
    this.filters.push((item) => item[column] !== value)
    return this
  }

  or(filterStr: string) {
    // Basic parser for "user_id.eq.xxx,user_id.is.null"
    const conditions = filterStr.split(',').map((c) => c.trim())
    this.filters.push((item) => {
      return conditions.some((cond) => {
        if (cond.includes('.eq.')) {
          const [col, val] = cond.split('.eq.')
          return item[col] === val
        }
        if (cond.includes('.is.null')) {
          const col = cond.replace('.is.null', '')
          return item[col] === null || item[col] === undefined
        }
        return true
      })
    })
    return this
  }

  order(column: string, options?: { ascending?: boolean }) {
    const asc = options?.ascending ?? true
    this.sortFn = (a, b) => {
      const valA = a[column]
      const valB = b[column]
      if (valA === valB) return 0
      if (valA == null) return asc ? -1 : 1
      if (valB == null) return asc ? 1 : -1
      if (valA > valB) return asc ? 1 : -1
      return asc ? -1 : 1
    }
    return this
  }

  limit(count: number) {
    this.limitCount = count
    return this
  }

  range(from: number, to: number) {
    this.rangeOffset = from
    this.limitCount = to - from + 1
    return this
  }

  private getData(): any[] {
    const key = `yornam_db_${this.tableName}`
    return getStored<any[]>(key, [])
  }

  private saveData(data: any[]) {
    const key = `yornam_db_${this.tableName}`
    setStored(key, data)
  }

  private executeQuery(): { data: any[]; count: number } {
    let result = [...this.getData()]
    for (const filter of this.filters) {
      result = result.filter(filter)
    }
    const count = result.length
    if (this.sortFn) {
      result.sort(this.sortFn)
    }
    if (this.rangeOffset > 0) {
      result = result.slice(this.rangeOffset)
    }
    if (this.limitCount !== null) {
      result = result.slice(0, this.limitCount)
    }
    return { data: result, count }
  }

  async then<TResult1 = any, TResult2 = never>(
    onfulfilled?: ((value: { data: any; error: null; count: number }) => TResult1 | PromiseLike<TResult1>) | null,
    _onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ) {
    const { data, count } = this.executeQuery()
    const result = { data, error: null, count }
    return onfulfilled ? onfulfilled(result) : (result as any)
  }

  async maybeSingle() {
    const { data } = this.executeQuery()
    return { data: data[0] ?? null, error: null }
  }

  async single() {
    const { data } = this.executeQuery()
    if (!data.length) {
      return { data: null, error: new Error('No rows found') }
    }
    return { data: data[0], error: null }
  }

  async insert(values: any | any[]) {
    const current = this.getData()
    const toInsert = Array.isArray(values) ? values : [values]
    const inserted = toInsert.map((v) => ({
      id: v.id || `rec_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      created_at: v.created_at || new Date().toISOString(),
      ...v,
    }))
    const updated = [...current, ...inserted]
    this.saveData(updated)
    return { data: Array.isArray(values) ? inserted : inserted[0], error: null }
  }

  async upsert(values: any | any[], _options?: { onConflict?: string }) {
    const current = this.getData()
    const toUpsert = Array.isArray(values) ? values : [values]
    const updated = [...current]

    for (const item of toUpsert) {
      const idx = updated.findIndex((r) => (item.id && r.id === item.id) || (item.key && r.key === item.key))
      if (idx >= 0) {
        updated[idx] = { ...updated[idx], ...item, updated_at: new Date().toISOString() }
      } else {
        updated.push({
          id: item.id || `rec_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          ...item,
        })
      }
    }
    this.saveData(updated)
    return { data: values, error: null }
  }

  async update(updates: any) {
    const current = this.getData()
    let updatedCount = 0
    const updated = current.map((item) => {
      let matches = true
      for (const filter of this.filters) {
        if (!filter(item)) {
          matches = false
          break
        }
      }
      if (matches) {
        updatedCount++
        return { ...item, ...updates, updated_at: new Date().toISOString() }
      }
      return item
    })
    this.saveData(updated)
    return { data: updates, error: null, count: updatedCount }
  }

  async delete() {
    const current = this.getData()
    const filtered = current.filter((item) => {
      for (const filter of this.filters) {
        if (filter(item)) return false
      }
      return true
    })
    this.saveData(filtered)
    return { data: null, error: null }
  }
}

// ─── Mock Auth Client ───
class MockAuthClient {
  private listeners: Array<(event: string, session: Session | null) => void> = []

  private getSessionFromStorage(): Session | null {
    return getStored<Session | null>(STORAGE_KEYS.SESSION, null)
  }

  private setSessionInStorage(session: Session | null) {
    setStored(STORAGE_KEYS.SESSION, session)
    const event = session ? 'SIGNED_IN' : 'SIGNED_OUT'
    this.listeners.forEach((listener) => {
      try {
        listener(event, session)
      } catch {
        // silent
      }
    })
  }

  async getSession() {
    const session = this.getSessionFromStorage()
    return { data: { session }, error: null }
  }

  async getUser() {
    const session = this.getSessionFromStorage()
    return { data: { user: session?.user ?? null }, error: null }
  }

  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    this.listeners.push(callback)
    return {
      data: {
        subscription: {
          unsubscribe: () => {
            this.listeners = this.listeners.filter((cb) => cb !== callback)
          },
        },
      },
    }
  }

  async signUp({ email, password: _password, options }: { email: string; password: string; options?: { data?: { full_name?: string } } }) {
    const profiles = getStored<any[]>(STORAGE_KEYS.PROFILES, [])
    const existing = profiles.find((p) => p.email.toLowerCase() === email.toLowerCase())
    if (existing) {
      return { data: { user: null, session: null }, error: new Error('User already registered') }
    }

    const userId = `user_${Date.now()}`
    const newUser: User = {
      id: userId,
      app_metadata: {},
      user_metadata: { full_name: options?.data?.full_name || '' },
      aud: 'authenticated',
      created_at: new Date().toISOString(),
      email: email,
      role: 'authenticated',
      email_confirmed_at: new Date().toISOString(),
      phone: '',
      confirmed_at: new Date().toISOString(),
      last_sign_in_at: new Date().toISOString(),
    } as User

    const newProfile = {
      id: userId,
      email: email,
      full_name: options?.data?.full_name || null,
      avatar_url: null,
      role: email.toLowerCase() === 'maznuuaashik@gmail.com' ? 'admin' : 'user',
      banned: false,
      banned_reason: null,
      banned_at: null,
      created_at: new Date().toISOString(),
    }

    setStored(STORAGE_KEYS.PROFILES, [...profiles, newProfile])

    const session: Session = {
      access_token: `mock_jwt_${userId}_${Date.now()}`,
      token_type: 'bearer',
      expires_in: 3600,
      refresh_token: `mock_refresh_${userId}`,
      user: newUser,
    } as Session

    this.setSessionInStorage(session)
    return { data: { user: newUser, session }, error: null }
  }

  async signInWithPassword({ email, password: _password }: { email: string; password: string }) {
    const profiles = getStored<any[]>(STORAGE_KEYS.PROFILES, [])
    let profile = profiles.find((p) => p.email.toLowerCase() === email.toLowerCase())

    // Auto-create admin or test user if signing in
    if (!profile) {
      if (email === 'admin@yornam.com') {
        profile = {
          id: 'admin-user-001',
          email: 'admin@yornam.com',
          full_name: 'Admin User',
          avatar_url: null,
          role: 'admin',
          banned: false,
          banned_reason: null,
          banned_at: null,
          created_at: new Date().toISOString(),
        }
        setStored(STORAGE_KEYS.PROFILES, [...profiles, profile])
      } else {
        return { data: { user: null, session: null }, error: new Error('Invalid login credentials') }
      }
    }

    if (profile.banned) {
      return { data: { user: null, session: null }, error: new Error(`Account banned: ${profile.banned_reason || 'Contact support'}`) }
    }

    const user: User = {
      id: profile.id,
      app_metadata: {},
      user_metadata: { full_name: profile.full_name || '' },
      aud: 'authenticated',
      created_at: profile.created_at,
      email: profile.email,
      role: 'authenticated',
      email_confirmed_at: new Date().toISOString(),
      phone: '',
      confirmed_at: new Date().toISOString(),
      last_sign_in_at: new Date().toISOString(),
    } as User

    const session: Session = {
      access_token: `mock_jwt_${profile.id}_${Date.now()}`,
      token_type: 'bearer',
      expires_in: 3600,
      refresh_token: `mock_refresh_${profile.id}`,
      user,
    } as Session

    this.setSessionInStorage(session)
    return { data: { user, session }, error: null }
  }

  async signOut() {
    this.setSessionInStorage(null)
    return { error: null }
  }

  async resetPasswordForEmail(_email: string, _options?: { redirectTo?: string }) {
    return { data: {}, error: null }
  }

  async updateUser(updates: { password?: string; data?: any }) {
    const session = this.getSessionFromStorage()
    if (!session?.user) {
      return { data: { user: null }, error: new Error('Not authenticated') }
    }
    const updatedUser = {
      ...session.user,
      user_metadata: { ...session.user.user_metadata, ...(updates.data || {}) },
    }
    const updatedSession = { ...session, user: updatedUser }
    this.setSessionInStorage(updatedSession)
    return { data: { user: updatedUser }, error: null }
  }

  async resend(_options: { type: string; email: string }) {
    return { data: {}, error: null }
  }
}

// ─── Exported Supabase Client ───
export const supabase: any = isConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : {
      auth: new MockAuthClient(),
      from: (tableName: string) => new MockQueryBuilder(tableName),
    }
