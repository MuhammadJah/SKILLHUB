import { useState, useEffect } from 'react'
import { getBidSubmissions, type BidSubmission } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Spinner } from '@/components/ui/spinner'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Clock, AlertCircle, FileText } from 'lucide-react'

export default function BidSubmissionTracker() {
  const { profile } = useAuth()
  const [submissions, setSubmissions] = useState<BidSubmission[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadSubmissions = async () => {
      if (!profile) {
        setLoading(false)
        return
      }

      try {
        setSubmissions(await getBidSubmissions(profile.id))
      } catch (err) {
        console.error('Error loading submissions:', err)
      } finally {
        setLoading(false)
      }
    }

    loadSubmissions()
  }, [profile])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted':
      case 'pending':
        return <Clock className="w-5 h-5 text-ochre" />
      case 'under_review':
        return <FileText className="w-5 h-5 text-river" />
      case 'accepted':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />
      case 'rejected':
        return <AlertCircle className="w-5 h-5 text-laterite" />
      default:
        return <FileText className="w-5 h-5 text-muted" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      draft: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Draft' },
      pending: { bg: 'bg-ochre/10', text: 'text-ochre', label: 'Pending Review' },
      submitted: { bg: 'bg-ochre/10', text: 'text-ochre', label: 'Submitted' },
      under_review: { bg: 'bg-river/10', text: 'text-river', label: 'Under Review' },
      accepted: { bg: 'bg-green-100', text: 'text-green-700', label: 'Accepted' },
      rejected: { bg: 'bg-laterite/10', text: 'text-laterite', label: 'Rejected' },
    }

    const variant = variants[status] || variants.draft
    return (
      <span className={`text-xs font-semibold px-3 py-1 rounded-full ${variant.bg} ${variant.text}`}>
        {variant.label}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner className="w-8 h-8" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="bg-white border border-line rounded-lg p-8 text-center">
        <p className="text-muted mb-4">Sign in to track your bid submissions</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-2xl font-bold font-serif mb-6">My Bid Submissions</h3>

      {submissions.length === 0 ? (
        <div className="bg-white border border-line rounded-lg p-8 text-center">
          <p className="text-muted">No bid submissions yet. Start bidding on tenders to track them here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {submissions.map((submission) => (
            <div key={submission.id} className="bg-white border border-line rounded-lg p-6 hover:border-river transition">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {getStatusIcon(submission.status)}
                    <h4 className="font-semibold">{submission.tender_title}</h4>
                  </div>
                  <p className="text-sm text-muted mb-3">Your application has been received and is awaiting procurement review.</p>
                  <div className="flex gap-4 text-xs text-muted">
                    <span>💰 GMD {submission.amount.toLocaleString()}</span>
                    <span>📅 {new Date(submission.submitted_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex-shrink-0">{getStatusBadge(submission.status)}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats */}
      {submissions.length > 0 && (
        <div className="grid md:grid-cols-4 gap-4 mt-8">
          <div className="bg-white border border-line rounded-lg p-4 text-center">
            <div className="text-2xl font-bold">{submissions.length}</div>
            <div className="text-xs text-muted mt-1">Total Submissions</div>
          </div>
          <div className="bg-white border border-line rounded-lg p-4 text-center">
            <div className="text-2xl font-bold">
              {submissions.filter((s) => s.status === 'accepted').length}
            </div>
            <div className="text-xs text-muted mt-1">Accepted</div>
          </div>
          <div className="bg-white border border-line rounded-lg p-4 text-center">
            <div className="text-2xl font-bold">
              {submissions.filter((s) => s.status === 'under_review').length}
            </div>
            <div className="text-xs text-muted mt-1">Under Review</div>
          </div>
          <div className="bg-white border border-line rounded-lg p-4 text-center">
            <div className="text-2xl font-bold">
              GMD {submissions.reduce((sum, s) => sum + s.amount, 0).toLocaleString()}
            </div>
            <div className="text-xs text-muted mt-1">Total Value</div>
          </div>
        </div>
      )}
    </div>
  )
}
