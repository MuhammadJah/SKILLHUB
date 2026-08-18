import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { createTender, deleteTender, getLocalTenders, updateTender, type Tender } from '@/lib/supabase'
import { toast } from 'sonner'
import { Trash2, Edit2, Plus } from 'lucide-react'

const REGIONS = [
  'Greater Banjul',
  'West Coast Region',
  'Lower River Region',
  'Central River Region',
  'Upper River Region',
  'North Bank Region',
]

const TYPES = ['Works', 'Goods', 'Services', 'Consultancy']

const SECTORS = ['Agriculture', 'Energy', 'Infrastructure', 'ICT', 'Health', 'Education', 'Water']

export default function AdminTenderManager() {
  const [tenders, setTenders] = useState<Tender[]>([])
  const [loading, setLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    code: '',
    title: '',
    region: '',
    org: '',
    sector: '',
    type: '',
    deadline: 30,
  })

  // Load tenders
  useEffect(() => {
    loadTenders()
  }, [])

  const loadTenders = async () => {
    try {
      setTenders(getLocalTenders())
    } catch {
      toast.error('Failed to load tenders')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.code || !formData.title || !formData.region || !formData.org || !formData.sector || !formData.type) {
      toast.error('Please fill in all fields')
      return
    }

    try {
      const tenderInput = {
        code: formData.code,
        title: formData.title,
        region: formData.region,
        org: formData.org,
        sector: formData.sector,
        type: formData.type,
        deadline: formData.deadline,
      }
      if (editingId) {
        await updateTender(editingId, tenderInput)
        toast.success('Tender updated successfully')
      } else {
        await createTender(tenderInput)
        toast.success('Tender created successfully')
      }

      setFormData({
        code: '',
        title: '',
        region: '',
        org: '',
        sector: '',
        type: '',
        deadline: 30,
      })
      setEditingId(null)
      setIsFormOpen(false)
      loadTenders()
    } catch (err) {
      toast.error(editingId ? 'Failed to update tender' : 'Failed to create tender')
    }
  }

  const handleEdit = (tender: Tender) => {
    setFormData({
      code: tender.code,
      title: tender.title,
      region: tender.region,
      org: tender.org,
      sector: tender.sector,
      type: tender.type,
      deadline: tender.deadline,
    })
    setEditingId(tender.id)
    setIsFormOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this tender?')) return

    try {
      await deleteTender(id)
      toast.success('Tender deleted successfully')
      loadTenders()
    } catch (err) {
      toast.error('Failed to delete tender')
    }
  }

  const handleCancel = () => {
    setFormData({
      code: '',
      title: '',
      region: '',
      org: '',
      sector: '',
      type: '',
      deadline: 30,
    })
    setEditingId(null)
    setIsFormOpen(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner className="w-8 h-8" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Form Section */}
      {isFormOpen && (
        <div className="bg-white border border-line rounded-lg p-8">
          <h3 className="text-xl font-bold font-serif mb-6">{editingId ? 'Edit Tender' : 'Create New Tender'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="code" className="text-sm font-semibold mb-2 block">
                  Tender Code
                </Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="e.g., GPPA-2026-001"
                  className="w-full"
                />
              </div>

              <div>
                <Label htmlFor="title" className="text-sm font-semibold mb-2 block">
                  Title
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Tender title"
                  className="w-full"
                />
              </div>

              <div>
                <Label htmlFor="region" className="text-sm font-semibold mb-2 block">
                  Region
                </Label>
                <select
                  id="region"
                  value={formData.region}
                  onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                  className="w-full px-3 py-2 border border-line rounded-lg"
                >
                  <option value="">Select region</option>
                  {REGIONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="org" className="text-sm font-semibold mb-2 block">
                  Organization
                </Label>
                <Input
                  id="org"
                  value={formData.org}
                  onChange={(e) => setFormData({ ...formData, org: e.target.value })}
                  placeholder="Organization name"
                  className="w-full"
                />
              </div>

              <div>
                <Label htmlFor="sector" className="text-sm font-semibold mb-2 block">
                  Sector
                </Label>
                <select
                  id="sector"
                  value={formData.sector}
                  onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                  className="w-full px-3 py-2 border border-line rounded-lg"
                >
                  <option value="">Select sector</option>
                  {SECTORS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="type" className="text-sm font-semibold mb-2 block">
                  Type
                </Label>
                <select
                  id="type"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 border border-line rounded-lg"
                >
                  <option value="">Select type</option>
                  {TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="deadline" className="text-sm font-semibold mb-2 block">
                  Days Until Deadline
                </Label>
                <Input
                  id="deadline"
                  type="number"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: parseInt(e.target.value) })}
                  min="1"
                  className="w-full"
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" className="bg-river hover:bg-river-dark text-white">
                {editingId ? 'Update Tender' : 'Create Tender'}
              </Button>
              <Button type="button" onClick={handleCancel} variant="outline" className="border-line">
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Tenders List */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold font-serif">All Tenders ({tenders.length})</h3>
          {!isFormOpen && (
            <Button onClick={() => setIsFormOpen(true)} className="bg-river hover:bg-river-dark text-white">
              <Plus className="w-4 h-4 mr-2" />
              New Tender
            </Button>
          )}
        </div>

        {tenders.length === 0 ? (
          <div className="bg-white border border-line rounded-lg p-8 text-center">
            <p className="text-muted mb-4">No tenders yet</p>
            <Button onClick={() => setIsFormOpen(true)} className="bg-river hover:bg-river-dark text-white">
              Create First Tender
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {tenders.map((tender) => (
              <div key={tender.id} className="bg-white border border-line rounded-lg p-4 flex items-center justify-between hover:border-river transition">
                <div className="flex-1">
                  <div className="font-semibold">{tender.title}</div>
                  <div className="text-sm text-muted">
                    {tender.code} • {tender.region} • {tender.type} • {tender.deadline} days left
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleEdit(tender)}
                    variant="outline"
                    size="sm"
                    className="border-river text-river hover:bg-river/10"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => handleDelete(tender.id)}
                    variant="outline"
                    size="sm"
                    className="border-laterite text-laterite hover:bg-laterite/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
