import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://dmmyuwrxmbljuazlcfyt.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJk bW15dXdyeG1ibGp1YXpsY2Z5dCIsInJlZiI6ImRtbXl1d3J4bWJsanVhemxjZnl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ1NjczODcsImV4cCI6MjEwMDE0MzM4N30.2j5YUdBVw2d0iS1ro_Nx6Ju9v_LKUzTr611ZGHL9mfo'.replace(/\s/g, '')

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface Tender {
  id: string
  code: string
  title: string
  region: string
  org: string
  sector: string
  type: string
  deadline: number
  posted: number
  created_at: string
}

export interface BidSubmission {
  id: string
  tender_id: string
  tender_title: string
  amount: number
  status: 'pending' | 'under_review' | 'accepted' | 'rejected'
  submitted_at: string
}

const DEMO_TENDERS: Tender[] = [
  { id: 'tender-004', code: 'TND-2026-004', title: 'Health Facility Equipment Supply', region: 'Upper River Region', org: 'Ministry of Health', sector: 'Health', type: 'Goods', deadline: 6, posted: 2, created_at: '2026-08-16T09:00:00.000Z' },
  { id: 'tender-002', code: 'TND-2026-002', title: 'Solar Energy Installation Project', region: 'West Coast Region', org: 'NAWEC', sector: 'Energy', type: 'Works', deadline: 12, posted: 4, created_at: '2026-08-14T09:00:00.000Z' },
  { id: 'tender-005', code: 'TND-2026-005', title: 'Agricultural Extension Services', region: 'North Bank Region', org: 'Ministry of Agriculture', sector: 'Agriculture', type: 'Consultancy', deadline: 18, posted: 6, created_at: '2026-08-12T09:00:00.000Z' },
  { id: 'tender-003', code: 'TND-2026-003', title: 'ICT Infrastructure Upgrade', region: 'Central River Region', org: 'Ministry of Information', sector: 'ICT', type: 'Goods', deadline: 24, posted: 8, created_at: '2026-08-10T09:00:00.000Z' },
  { id: 'tender-001', code: 'TND-2026-001', title: 'Road Infrastructure Development - Greater Banjul', region: 'Greater Banjul', org: 'Ministry of Works', sector: 'Infrastructure', type: 'Works', deadline: 30, posted: 10, created_at: '2026-08-08T09:00:00.000Z' },
]

const STORAGE_KEYS = {
  tenders: 'gambids:tenders',
  favorites: 'gambids:favorites',
  notifications: 'gambids:notifications',
  submissions: 'gambids:submissions',
}

function readLocal<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const value = window.localStorage.getItem(key)
    return value ? (JSON.parse(value) as T) : fallback
  } catch {
    return fallback
  }
}

function writeLocal<T>(key: string, value: T) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(key, JSON.stringify(value))
  window.dispatchEvent(new StorageEvent('storage', { key }))
}

export function getLocalTenders(): Tender[] {
  return readLocal(STORAGE_KEYS.tenders, DEMO_TENDERS)
}

export async function fetchTenders(filters?: {
  regions?: string[]
  types?: string[]
  deadline?: 'all' | 'urgent' | 'week'
  searchTerm?: string
  sortBy?: 'deadline' | 'newest' | 'value'
}): Promise<Tender[]> {
  let tenders = getLocalTenders()
  try {
    let query = supabase.from('tenders').select('*')
    if (filters?.regions?.length) query = query.in('region', filters.regions)
    if (filters?.types?.length) query = query.in('type', filters.types)
    if (filters?.deadline === 'urgent') query = query.lte('deadline', 7)
    if (filters?.deadline === 'week') query = query.lte('deadline', 14)
    if (filters?.sortBy === 'deadline') query = query.order('deadline', { ascending: true })
    if (filters?.sortBy === 'newest') query = query.order('created_at', { ascending: false })
    const { data, error } = await query
    const remoteTenders = (data || []) as Tender[]
    const remoteDataIsUsable = remoteTenders.length > 0 && remoteTenders.every((tender) => Number.isFinite(Number(tender.deadline)) && Number(tender.deadline) >= 0 && Number(tender.deadline) <= 365 && Number.isFinite(Number(tender.posted)) && Number(tender.posted) >= 0 && Number(tender.posted) <= 365)
    if (!error && remoteDataIsUsable) tenders = remoteTenders
  } catch {
    // The local store keeps the public experience working when the remote schema is unavailable.
  }

  const term = filters?.searchTerm?.trim().toLowerCase()
  if (filters?.regions?.length) tenders = tenders.filter((t) => filters.regions!.includes(t.region))
  if (filters?.types?.length) tenders = tenders.filter((t) => filters.types!.includes(t.type))
  if (filters?.deadline === 'urgent') tenders = tenders.filter((t) => t.deadline <= 7)
  if (filters?.deadline === 'week') tenders = tenders.filter((t) => t.deadline <= 14)
  if (term) tenders = tenders.filter((t) => [t.title, t.code, t.org, t.region, t.sector, t.type].some((value) => value.toLowerCase().includes(term)))
  if (filters?.sortBy === 'newest') tenders = [...tenders].sort((a, b) => b.created_at.localeCompare(a.created_at))
  else tenders = [...tenders].sort((a, b) => a.deadline - b.deadline)
  return tenders
}

export async function fetchTenderById(id: string): Promise<Tender | null> {
  try {
    const { data, error } = await supabase.from('tenders').select('*').eq('id', id).single()
    if (!error && data) return data as Tender
  } catch {
    // Fall through to the local store.
  }
  return getLocalTenders().find((tender) => tender.id === id) || null
}

export async function createTender(input: Omit<Tender, 'id' | 'created_at' | 'posted'>): Promise<Tender> {
  const tender: Tender = { ...input, id: `tender-${Date.now()}`, posted: 0, created_at: new Date().toISOString() }
  try {
    const { data, error } = await supabase.from('tenders').insert([input]).select().single()
    if (!error && data) {
      const remoteTender = data as Tender
      writeLocal(STORAGE_KEYS.tenders, [remoteTender, ...getLocalTenders().filter((existing) => existing.id !== remoteTender.id)])
      return remoteTender
    }
  } catch {
    // Use local persistence below.
  }
  writeLocal(STORAGE_KEYS.tenders, [tender, ...getLocalTenders()])
  return tender
}

export async function updateTender(id: string, updates: Partial<Tender>): Promise<void> {
  try {
    await supabase.from('tenders').update(updates).eq('id', id)
  } catch {
    // The local mirror remains authoritative for the current session.
  }
  writeLocal(STORAGE_KEYS.tenders, getLocalTenders().map((tender) => tender.id === id ? { ...tender, ...updates } : tender))
}

export async function deleteTender(id: string): Promise<void> {
  try {
    await supabase.from('tenders').delete().eq('id', id)
  } catch {
    // The local mirror remains authoritative for the current session.
  }
  writeLocal(STORAGE_KEYS.tenders, getLocalTenders().filter((tender) => tender.id !== id))
}

export async function getFavoriteTenderIds(userId: string): Promise<string[]> {
  try {
    const { data, error } = await supabase.from('user_favorites').select('tender_id').eq('user_id', userId)
    if (!error && data) return data.map((row) => row.tender_id)
  } catch {
    // Use local persistence below.
  }
  return readLocal<Record<string, string[]>>(STORAGE_KEYS.favorites, {})[userId] || []
}

export async function setFavorite(userId: string, tenderId: string, active: boolean): Promise<void> {
  try {
    if (active) await supabase.from('user_favorites').upsert([{ user_id: userId, tender_id: tenderId }], { onConflict: 'user_id,tender_id' })
    else await supabase.from('user_favorites').delete().eq('user_id', userId).eq('tender_id', tenderId)
  } catch {
    // The local mirror remains authoritative for the current session.
  }
  const favorites = readLocal<Record<string, string[]>>(STORAGE_KEYS.favorites, {})
  const next = new Set(favorites[userId] || [])
  active ? next.add(tenderId) : next.delete(tenderId)
  writeLocal(STORAGE_KEYS.favorites, { ...favorites, [userId]: Array.from(next) })
}

export async function getNotificationPreferences(userId: string) {
  try {
    const { data, error } = await supabase.from('notification_preferences').select('sectors, regions').eq('user_id', userId).single()
    if (!error && data) return { sectors: data.sectors || [], regions: data.regions || [] }
  } catch {
    // Use local persistence below.
  }
  return readLocal<Record<string, { sectors: string[]; regions: string[] }>>(STORAGE_KEYS.notifications, {})[userId] || { sectors: [], regions: [] }
}

export async function saveNotificationPreferences(userId: string, sectors: string[], regions: string[]): Promise<void> {
  try {
    await supabase.from('notification_preferences').upsert([{ user_id: userId, sectors, regions, updated_at: new Date().toISOString() }], { onConflict: 'user_id' })
  } catch {
    // The local mirror remains authoritative for the current session.
  }
  const preferences = readLocal<Record<string, { sectors: string[]; regions: string[] }>>(STORAGE_KEYS.notifications, {})
  writeLocal(STORAGE_KEYS.notifications, { ...preferences, [userId]: { sectors, regions } })
}

export async function getBidSubmissions(userId: string): Promise<BidSubmission[]> {
  try {
    const { data, error } = await supabase.from('bid_submissions').select('*').eq('user_id', userId).order('submitted_at', { ascending: false })
    if (!error && data) return data as BidSubmission[]
  } catch {
    // Use local persistence below.
  }
  return readLocal<Record<string, BidSubmission[]>>(STORAGE_KEYS.submissions, {})[userId] || []
}

export async function createBidSubmission(userId: string, tender: Tender, amount: number): Promise<BidSubmission> {
  const submission: BidSubmission = { id: `submission-${Date.now()}`, tender_id: tender.id, tender_title: tender.title, amount, status: 'pending', submitted_at: new Date().toISOString() }
  try {
    const { data, error } = await supabase.from('bid_submissions').insert([{ user_id: userId, tender_id: tender.id, amount, status: submission.status }]).select().single()
    if (!error && data) Object.assign(submission, data)
  } catch {
    // The local mirror remains authoritative for the current session.
  }
  const submissions = readLocal<Record<string, BidSubmission[]>>(STORAGE_KEYS.submissions, {})
  writeLocal(STORAGE_KEYS.submissions, { ...submissions, [userId]: [submission, ...(submissions[userId] || [])] })
  return submission
}

export { DEMO_TENDERS }
