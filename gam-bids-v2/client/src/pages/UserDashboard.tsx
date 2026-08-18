import { useState, useEffect } from 'react'
import { useLocation } from 'wouter'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { useAuth } from '@/contexts/AuthContext'
import { fetchTenders, getFavoriteTenderIds, setFavorite, type Tender } from '@/lib/supabase'
import { toast } from 'sonner'
import EmailNotificationSetup from '@/components/EmailNotificationSetup'
import BidSubmissionTracker from '@/components/BidSubmissionTracker'

export default function UserDashboard() {
  const { profile, signOut } = useAuth()
  const [, navigate] = useLocation()
  const [favorites, setFavorites] = useState<Tender[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'favorites' | 'notifications' | 'submissions'>('favorites')

  // Fetch user's favorite tenders
  useEffect(() => {
    const fetchFavorites = async () => {
      if (!profile) return

      try {
        const favoriteIds = await getFavoriteTenderIds(profile.id)
        const tenderData = (await fetchTenders()).filter((tender) => favoriteIds.includes(tender.id))
        setFavorites(tenderData)
      } catch (err) {
        toast.error('An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchFavorites()
  }, [profile])

  const handleRemoveFavorite = async (tenderId: string) => {
    if (!profile) return

    try {
      await setFavorite(profile.id, tenderId, false)
      toast.success('Removed from favorites')
      setFavorites((current) => current.filter((t) => t.id !== tenderId))
    } catch (err) {
      toast.error('An error occurred')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Spinner className="w-8 h-8" />
      </div>
    )
  }

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
                My Dashboard
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-paper text-sm">
              Welcome, <span className="font-semibold">{profile?.full_name || 'User'}</span>
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
        <div className="mb-8">
          <h1 className="text-4xl font-bold font-serif mb-6">My Dashboard</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-12 border-b border-line overflow-x-auto">
          <button
            onClick={() => setActiveTab('favorites')}
            className={`px-6 py-3 font-semibold border-b-2 transition whitespace-nowrap ${
              activeTab === 'favorites'
                ? 'border-river text-river'
                : 'border-transparent text-muted hover:text-foreground'
            }`}
          >
            💾 Saved Favorites ({favorites.length})
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`px-6 py-3 font-semibold border-b-2 transition whitespace-nowrap ${
              activeTab === 'notifications'
                ? 'border-river text-river'
                : 'border-transparent text-muted hover:text-foreground'
            }`}
          >
            📧 Email Notifications
          </button>
          <button
            onClick={() => setActiveTab('submissions')}
            className={`px-6 py-3 font-semibold border-b-2 transition whitespace-nowrap ${
              activeTab === 'submissions'
                ? 'border-river text-river'
                : 'border-transparent text-muted hover:text-foreground'
            }`}
          >
            📝 My Submissions
          </button>
        </div>

        {/* Favorites Tab */}
        {activeTab === 'favorites' && (
          <section>
            {favorites.length === 0 ? (
              <div className="bg-white border border-line rounded-xl p-12 text-center">
                <h3 className="text-2xl font-bold font-serif mb-4">No saved tenders yet</h3>
                <p className="text-muted mb-6">
                  Browse tenders and click the heart icon to save them here
                </p>
                <Button
                  onClick={() => navigate('/')}
                  className="bg-river hover:bg-river-dark text-white"
                >
                  Browse Tenders
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {favorites.map((tender) => (
                  <div
                    key={tender.id}
                    className="bg-white border border-line rounded-xl p-6 hover:border-river hover:shadow-lg transition"
                  >
                    <div className="flex justify-between gap-6">
                      <div className="flex-1">
                        <div className="text-xs text-muted font-mono mb-2">{tender.code}</div>
                        <h3 className="text-lg font-semibold mb-3 leading-snug">{tender.title}</h3>
                        <div className="flex gap-4 text-sm text-muted mb-4">
                          <span>📍 {tender.region}</span>
                          <span>🏛️ {tender.org}</span>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          <span className="text-xs px-2.5 py-1 bg-river/10 text-river rounded-full font-semibold">
                            {tender.type}
                          </span>
                          <span className="text-xs px-2.5 py-1 bg-groundnut/10 text-groundnut rounded-full font-semibold">
                            {tender.region}
                          </span>
                        </div>
                      </div>

                      {/* Deadline Stamp */}
                      <div
                        className={`flex-shrink-0 w-24 h-24 border-2 rounded-full flex flex-col items-center justify-center -rotate-6 font-mono text-center ${
                          tender.deadline <= 7
                            ? 'border-laterite text-laterite'
                            : 'border-river text-river'
                        }`}
                      >
                        <div className="text-2xl font-bold">{tender.deadline}</div>
                        <div className="text-xs font-semibold tracking-wider uppercase">
                          days left
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-line mt-4 pt-4 flex justify-between items-center">
                      <div className="text-sm text-muted">
                        Posted {tender.posted} day{tender.posted !== 1 ? 's' : ''} ago
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => navigate(`/tender/${tender.id}`)}
                          className="bg-ink hover:bg-river text-white"
                        >
                          View Details →
                        </Button>
                        <Button
                          onClick={() => handleRemoveFavorite(tender.id)}
                          variant="outline"
                          className="text-laterite border-laterite hover:bg-laterite/10"
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <section>
            <EmailNotificationSetup />
          </section>
        )}

        {/* Submissions Tab */}
        {activeTab === 'submissions' && (
          <section>
            <BidSubmissionTracker />
          </section>
        )}
      </main>
    </div>
  )
}
