'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase, type Organization } from '@/lib/supabase'
import { useClient } from '@/contexts/ClientContext'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'
import { 
  Building2, 
  ArrowLeft,
  Save,
  X,
  Archive,
  MapPin,
  Phone,
  Mail,
  Clock,
  User,
  Users,
  Shield,
  Key,
  AlertTriangle,
  FileText
} from 'lucide-react'

interface SiteSummaryLegacyForm {
  title: string
  locations: string[]
  primaryContacts: string[]
  emergencyContacts: string[]
  onboardingDetails: string
  notes: string
}

export default function NewSiteSummaryLegacyPage() {
  const params = useParams()
  const router = useRouter()
  const { selectedClient } = useClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [formData, setFormData] = useState<SiteSummaryLegacyForm>({
    title: '',
    locations: [''],
    primaryContacts: [''],
    emergencyContacts: [''],
    onboardingDetails: '',
    notes: ''
  })

  useEffect(() => {
    if (params.id) {
      fetchOrganization(params.id as string)
    }
  }, [params.id])

  const fetchOrganization = async (id: string) => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      setOrganization(data)
      
      // Pre-populate title with organization name
      setFormData(prev => ({
        ...prev,
        title: data.name || ''
      }))
    } catch (err) {
      console.error('Error fetching organization:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSidebarItemClick = (item: any) => {
    console.log('Sidebar item clicked:', item)
    if (item.href) {
      if (item.href === '/') {
        router.push('/')
      } else {
        router.push(`/organizations/${params.id}${item.href}`)
      }
    }
  }

  const handleInputChange = (field: keyof SiteSummaryLegacyForm, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleArrayInputChange = (field: 'locations' | 'primaryContacts' | 'emergencyContacts', index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }))
  }

  const addArrayItem = (field: 'locations' | 'primaryContacts' | 'emergencyContacts') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }))
  }

  const removeArrayItem = (field: 'locations' | 'primaryContacts' | 'emergencyContacts', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }))
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setSaveError(null)
      setSaveSuccess(false)

      // Validate required fields
      if (!formData.title.trim()) {
        throw new Error('Title is required')
      }

      // In a real implementation, this would save to the database
      // For now, we'll simulate the save and redirect back
      console.log('Saving Site Summary (Legacy):', formData)

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Show success message briefly
      setSaveSuccess(true)

      // Redirect back to site summary legacy page after a short delay
      setTimeout(() => {
        router.push(`/organizations/${params.id}/site-summary-legacy`)
      }, 1500)

    } catch (error: any) {
      console.error('Error saving site summary:', error)
      setSaveError(error.message || 'Failed to save site summary')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    router.push(`/organizations/${params.id}/site-summary-legacy`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <Header currentPage="Organizations" />
        <div className="flex">
          <Sidebar onItemClick={handleSidebarItemClick} />
          <div className="flex-1 p-6">
            <div className="flex items-center justify-center h-64">
              <div className="text-gray-400">Loading...</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header currentPage="Organizations" />
      <div className="flex">
        <Sidebar onItemClick={handleSidebarItemClick} />
        
        {/* Main Content */}
        <div className="flex-1">
          <div className="p-6">
            {/* Breadcrumb */}
            <div className="flex items-center space-x-2 text-sm text-gray-400 mb-4">
              <span>{organization?.name}</span>
              <span>/</span>
              <span>Site Summary (Legacy)</span>
              <span>/</span>
              <span className="text-white">New</span>
            </div>

            {/* Success/Error Messages */}
            {saveSuccess && (
              <div className="mb-4 p-4 bg-green-900/50 border border-green-500 rounded-lg">
                <div className="text-green-400 text-sm">
                  ✅ Site Summary (Legacy) saved successfully! Redirecting...
                </div>
              </div>
            )}

            {saveError && (
              <div className="mb-4 p-4 bg-red-900/50 border border-red-500 rounded-lg">
                <div className="text-red-400 text-sm">
                  ❌ {saveError}
                </div>
              </div>
            )}

            {/* Page Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                  <Archive className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-semibold">New Site Summary (Legacy)</h1>
                  <div className="text-sm text-gray-400">
                    Create a new legacy site summary for {organization?.name}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={handleCancel}
                  disabled={saving}
                  className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-700 px-4 py-2 rounded text-sm"
                >
                  <X className="w-4 h-4" />
                  <span>Cancel</span>
                </button>
                <button 
                  onClick={handleSave}
                  disabled={saving || !formData.title.trim()}
                  className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-4 py-2 rounded text-sm"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Saving...' : 'Save'}</span>
                </button>
              </div>
            </div>

            {/* Form */}
            <div className="grid grid-cols-4 gap-6">
              {/* Left Column - Main Form */}
              <div className="col-span-3 space-y-6">
                
                {/* Title Section */}
                <div className="bg-gray-800 rounded-lg p-6">
                  <h2 className="text-lg font-medium mb-4">Title</h2>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter site summary title..."
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Client Contacts Section */}
                <div className="bg-gray-800 rounded-lg p-6">
                  <h2 className="text-lg font-medium mb-4">Client Contacts</h2>
                  
                  {/* Locations */}
                  <div className="mb-6">
                    <h3 className="text-md font-medium text-blue-400 mb-3">Locations</h3>
                    {formData.locations.map((location, index) => (
                      <div key={index} className="flex items-center space-x-2 mb-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          value={location}
                          onChange={(e) => handleArrayInputChange('locations', index, e.target.value)}
                          placeholder="Enter location..."
                          className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-1 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                        />
                        {formData.locations.length > 1 && (
                          <button
                            onClick={() => removeArrayItem('locations', index)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={() => addArrayItem('locations')}
                      className="text-blue-400 hover:text-blue-300 text-sm"
                    >
                      + Add Location
                    </button>
                  </div>

                  {/* Primary Contacts */}
                  <div className="mb-6">
                    <h3 className="text-md font-medium text-blue-400 mb-3">Primary Contacts</h3>
                    {formData.primaryContacts.map((contact, index) => (
                      <div key={index} className="flex items-center space-x-2 mb-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          value={contact}
                          onChange={(e) => handleArrayInputChange('primaryContacts', index, e.target.value)}
                          placeholder="Enter primary contact..."
                          className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-1 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                        />
                        {formData.primaryContacts.length > 1 && (
                          <button
                            onClick={() => removeArrayItem('primaryContacts', index)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={() => addArrayItem('primaryContacts')}
                      className="text-blue-400 hover:text-blue-300 text-sm"
                    >
                      + Add Primary Contact
                    </button>
                  </div>

                  {/* Emergency Contacts */}
                  <div className="mb-6">
                    <h3 className="text-md font-medium text-blue-400 mb-3">Emergency Contacts</h3>
                    {formData.emergencyContacts.map((contact, index) => (
                      <div key={index} className="flex items-center space-x-2 mb-2">
                        <AlertTriangle className="w-4 h-4 text-red-400" />
                        <input
                          type="text"
                          value={contact}
                          onChange={(e) => handleArrayInputChange('emergencyContacts', index, e.target.value)}
                          placeholder="Enter emergency contact..."
                          className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-1 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                        />
                        {formData.emergencyContacts.length > 1 && (
                          <button
                            onClick={() => removeArrayItem('emergencyContacts', index)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={() => addArrayItem('emergencyContacts')}
                      className="text-blue-400 hover:text-blue-300 text-sm"
                    >
                      + Add Emergency Contact
                    </button>
                  </div>
                </div>

                {/* Initial Onboarding Details */}
                <div className="bg-gray-800 rounded-lg p-6">
                  <h2 className="text-lg font-medium mb-4">Initial Onboarding Details</h2>
                  <textarea
                    value={formData.onboardingDetails}
                    onChange={(e) => handleInputChange('onboardingDetails', e.target.value)}
                    placeholder="Enter onboarding details..."
                    rows={4}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Notes */}
                <div className="bg-gray-800 rounded-lg p-6">
                  <h2 className="text-lg font-medium mb-4">Notes</h2>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="Enter additional notes..."
                    rows={3}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Right Sidebar */}
              <div className="space-y-6">
                {/* Save Actions */}
                <div className="bg-gray-800 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-300 mb-3">Actions</h3>
                  <div className="space-y-2">
                    <button 
                      onClick={handleSave}
                      disabled={saving || !formData.title.trim()}
                      className="w-full flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-3 py-2 rounded text-sm"
                    >
                      <Save className="w-4 h-4" />
                      <span>{saving ? 'Saving...' : 'Save Site Summary'}</span>
                    </button>
                    <button 
                      onClick={handleCancel}
                      disabled={saving}
                      className="w-full flex items-center justify-center space-x-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-700 px-3 py-2 rounded text-sm"
                    >
                      <X className="w-4 h-4" />
                      <span>Cancel</span>
                    </button>
                  </div>
                </div>

                {/* Help */}
                <div className="bg-gray-800 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center">
                    <FileText className="w-4 h-4 mr-2" />
                    Help
                  </h3>
                  <div className="text-xs text-gray-400 space-y-2">
                    <p>Site Summary (Legacy) provides a comprehensive overview of client contact information and onboarding details.</p>
                    <p>Fill in all relevant fields to ensure complete documentation.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
