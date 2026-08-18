import { createContext, ReactNode, useContext, useEffect, useState } from 'react'
import { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

export interface UserProfile {
  id: string
  email: string
  full_name: string | null
  role: 'user' | 'admin'
  organization: string | null
  created_at: string
  updated_at: string
}

interface AuthContextType {
  session: Session | null
  user: User | null
  profile: UserProfile | null
  loading: boolean
  isAdmin: boolean
  isAuthenticated: boolean
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: Error | null }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)
const AUTH_KEY = 'gambids:auth'
const USERS_KEY = 'gambids:users'

type LocalAuth = { profile: UserProfile; password: string }

const demoUsers: LocalAuth[] = [
  {
    profile: { id: 'demo-admin', email: 'admin@gam-bids.gm', full_name: 'GAM-BIDS Administrator', role: 'admin', organization: 'GAM-BIDS', created_at: '2026-01-01T00:00:00.000Z', updated_at: '2026-01-01T00:00:00.000Z' },
    password: 'Admin@123456',
  },
  {
    profile: { id: 'demo-user', email: 'user@gam-bids.gm', full_name: 'Demo Procurement Officer', role: 'user', organization: null, created_at: '2026-01-01T00:00:00.000Z', updated_at: '2026-01-01T00:00:00.000Z' },
    password: 'User@123456',
  },
]

function readLocalUsers(): LocalAuth[] {
  if (typeof window === 'undefined') return demoUsers
  try {
    const saved = window.localStorage.getItem(USERS_KEY)
    return saved ? [...demoUsers, ...(JSON.parse(saved) as LocalAuth[])] : demoUsers
  } catch {
    return demoUsers
  }
}

function writeLocalAuth(auth: LocalAuth | null) {
  if (typeof window === 'undefined') return
  if (auth) window.localStorage.setItem(AUTH_KEY, JSON.stringify(auth))
  else window.localStorage.removeItem(AUTH_KEY)
}

function readLocalAuth(): LocalAuth | null {
  if (typeof window === 'undefined') return null
  try {
    const value = window.localStorage.getItem(AUTH_KEY)
    return value ? JSON.parse(value) as LocalAuth : null
  } catch {
    return null
  }
}

function createMockSession(profile: UserProfile) {
  const user = { id: profile.id, email: profile.email, user_metadata: { full_name: profile.full_name }, app_metadata: { provider: 'email' } }
  return { user } as unknown as Session
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    const initializeAuth = async () => {
      const localAuth = readLocalAuth()
      if (localAuth && active) {
        const nextSession = createMockSession(localAuth.profile)
        setSession(nextSession)
        setUser(nextSession.user)
        setProfile(localAuth.profile)
        setLoading(false)
        return
      }

      try {
        const { data } = await supabase.auth.getSession()
        if (!active) return
        setSession(data.session)
        setUser(data.session?.user || null)
        if (data.session?.user) {
          const { data: remoteProfile } = await supabase.from('user_profiles').select('*').eq('id', data.session.user.id).single()
          setProfile(remoteProfile || { id: data.session.user.id, email: data.session.user.email || '', full_name: data.session.user.user_metadata?.full_name || null, role: 'user', organization: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() })
        }
      } catch {
        // The app remains usable with the local demo auth flow.
      } finally {
        if (active) setLoading(false)
      }
    }

    initializeAuth()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, nextSession) => {
      if (!active || readLocalAuth()) return
      setSession(nextSession)
      setUser(nextSession?.user || null)
    })
    return () => {
      active = false
      subscription?.unsubscribe()
    }
  }, [])

  const signUp = async (email: string, password: string, fullName: string) => {
    const exists = readLocalUsers().some((entry) => entry.profile.email.toLowerCase() === email.toLowerCase())
    if (exists) return { error: new Error('An account with this email already exists.') }
    const localAuth: LocalAuth = { profile: { id: `local-${Date.now()}`, email, full_name: fullName, role: 'user', organization: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }, password }
    const savedUsers = typeof window !== 'undefined' ? JSON.parse(window.localStorage.getItem(USERS_KEY) || '[]') as LocalAuth[] : []
    if (typeof window !== 'undefined') window.localStorage.setItem(USERS_KEY, JSON.stringify([...savedUsers, localAuth]))
    writeLocalAuth(localAuth)
    const nextSession = createMockSession(localAuth.profile)
    setSession(nextSession)
    setUser(nextSession.user)
    setProfile(localAuth.profile)
    return { error: null }
  }

  const signIn = async (email: string, password: string) => {
    const localAuth = readLocalUsers().find((entry) => entry.profile.email.toLowerCase() === email.toLowerCase() && entry.password === password)
    if (!localAuth) return { error: new Error('Invalid email or password. Use a demo account or create a new account.') }
    writeLocalAuth(localAuth)
    const nextSession = createMockSession(localAuth.profile)
    setSession(nextSession)
    setUser(nextSession.user)
    setProfile(localAuth.profile)
    return { error: null }
  }

  const signOut = async () => {
    writeLocalAuth(null)
    try { await supabase.auth.signOut() } catch { /* local sign-out is complete */ }
    setSession(null)
    setUser(null)
    setProfile(null)
  }

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!profile) return { error: new Error('No user logged in') }
    const nextProfile = { ...profile, ...updates, updated_at: new Date().toISOString() }
    const localAuth = readLocalAuth()
    if (localAuth) writeLocalAuth({ ...localAuth, profile: nextProfile })
    setProfile(nextProfile)
    try { await supabase.from('user_profiles').update(updates).eq('id', profile.id) } catch { /* local profile is saved */ }
    return { error: null }
  }

  const value: AuthContextType = { session, user, profile, loading, isAdmin: profile?.role === 'admin', isAuthenticated: !!session, signUp, signIn, signOut, updateProfile }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
