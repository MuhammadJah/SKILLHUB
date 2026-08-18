import { useEffect, useState } from 'react'
import { useLocation } from 'wouter'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import AdminTenderManager from '@/components/AdminTenderManager'
import { getLocalTenders, type Tender } from '@/lib/supabase'

export default function AdminDashboard() {
  const { profile, signOut } = useAuth()
  const [, navigate] = useLocation()
  const [tenders, setTenders] = useState<Tender[]>([])

  useEffect(() => {
    setTenders(getLocalTenders())
  }, [])

  // Redirect if not admin
  useEffect(() => {
    if (profile && profile.role !== 'admin') {
      navigate('/')
    }
  }, [profile, navigate])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-ink border-b-4 border-laterite">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-laterite to-ochre flex items-center justify-center text-white font-bold text-sm">
              GB
            </div>
            <div>
              <div className="font-bold text-lg text-paper font-serif">GAM-BIDS</div>
              <div className="text-xs text-ochre font-semibold tracking-widest uppercase">
                Admin Panel
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-paper text-sm">
              Welcome, <span className="font-semibold">{profile?.full_name || 'Admin'}</span>
            </div>
            <Button
              onClick={() => {
                signOut()
                navigate('/')
              }}
              className="bg-laterite hover:bg-laterite-dark text-white"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold font-serif mb-2">Admin Dashboard</h1>
          <p className="text-muted">
            Manage the live tender registry and procurement activity
          </p>
        </div>

        {/* Tender Management */}
        <div className="mb-12">
          <AdminTenderManager />
        </div>

        {/* Stats Section */}
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <div className="bg-white border border-line rounded-lg p-6">
            <div className="text-xs text-muted font-semibold uppercase tracking-widest mb-2">
              Total Tenders
            </div>
              <div className="text-3xl font-bold">{tenders.length}</div>
            <div className="text-sm text-muted mt-2">Active in system</div>
          </div>

          <div className="bg-white border border-line rounded-lg p-6">
            <div className="text-xs text-muted font-semibold uppercase tracking-widest mb-2">
              Registered Users
            </div>
              <div className="text-3xl font-bold">2</div>
            <div className="text-sm text-muted mt-2">Admin + User accounts</div>
          </div>

          <div className="bg-white border border-line rounded-lg p-6">
            <div className="text-xs text-muted font-semibold uppercase tracking-widest mb-2">
              Urgent Tenders
            </div>
              <div className="text-3xl font-bold">{tenders.filter((tender) => tender.deadline <= 7).length}</div>
            <div className="text-sm text-muted mt-2">Closing within 7 days</div>
          </div>
        </div>
      </main>
    </div>
  )
}
