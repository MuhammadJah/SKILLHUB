import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { getNotificationPreferences, saveNotificationPreferences } from '@/lib/supabase'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'

const SECTORS = ['Agriculture', 'Energy', 'Infrastructure', 'ICT', 'Health', 'Education', 'Water']
const REGIONS = [
  'Greater Banjul',
  'West Coast Region',
  'Lower River Region',
  'Central River Region',
  'Upper River Region',
  'North Bank Region',
]

export default function EmailNotificationSetup() {
  const { profile } = useAuth()
  const [selectedSectors, setSelectedSectors] = useState<string[]>([])
  const [selectedRegions, setSelectedRegions] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  // Load existing preferences
  useEffect(() => {
    const loadPreferences = async () => {
      if (!profile) return

      const preferences = await getNotificationPreferences(profile.id)
      setSelectedSectors(preferences.sectors)
      setSelectedRegions(preferences.regions)
    }

    loadPreferences()
  }, [profile])

  const handleSavePreferences = async () => {
    if (!profile) {
      toast.error('Please sign in to save preferences')
      return
    }

    setLoading(true)
    try {
      await saveNotificationPreferences(profile.id, selectedSectors, selectedRegions)

      setSaved(true)
      toast.success('Notification preferences saved')
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      toast.error('Failed to save preferences')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white border border-line rounded-lg p-8">
      <h3 className="text-2xl font-bold font-serif mb-6">Email Notifications</h3>
      <p className="text-muted mb-6">
        Get notified when new tenders match your interests. Select the sectors and regions you care about.
      </p>

      <div className="grid md:grid-cols-2 gap-8 mb-8">
        {/* Sectors */}
        <div>
          <h4 className="font-semibold mb-4">Sectors</h4>
          <div className="space-y-3">
            {SECTORS.map((sector) => (
              <label key={sector} className="flex items-center gap-3 cursor-pointer">
                <Checkbox
                  checked={selectedSectors.includes(sector)}
                  onCheckedChange={() => {
                    setSelectedSectors((prev) =>
                      prev.includes(sector) ? prev.filter((s) => s !== sector) : [...prev, sector]
                    )
                  }}
                />
                <span className="text-sm">{sector}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Regions */}
        <div>
          <h4 className="font-semibold mb-4">Regions</h4>
          <div className="space-y-3">
            {REGIONS.map((region) => (
              <label key={region} className="flex items-center gap-3 cursor-pointer">
                <Checkbox
                  checked={selectedRegions.includes(region)}
                  onCheckedChange={() => {
                    setSelectedRegions((prev) =>
                      prev.includes(region) ? prev.filter((r) => r !== region) : [...prev, region]
                    )
                  }}
                />
                <span className="text-sm">{region}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <Button
          onClick={handleSavePreferences}
          disabled={loading}
          className={`${saved ? 'bg-green-600 hover:bg-green-700' : 'bg-river hover:bg-river-dark'} text-white`}
        >
          {saved ? '✓ Saved' : loading ? 'Saving...' : 'Save Preferences'}
        </Button>
      </div>

      <div className="mt-8 p-4 bg-river/5 border border-river/20 rounded-lg">
        <p className="text-sm text-muted">
          <strong>How it works:</strong> When a new tender is posted that matches your selected sectors and regions,
          you'll receive an email notification within 1 hour. You can update your preferences anytime.
        </p>
      </div>
    </div>
  )
}
