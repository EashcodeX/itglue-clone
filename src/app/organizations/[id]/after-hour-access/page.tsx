'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase, type Organization } from '@/lib/supabase'
import { useClient } from '@/contexts/ClientContext'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'
import {
  Clock,
  Key,
  Phone,
  MapPin,
  AlertTriangle,
  Edit,
  Save,
  X,
  Building,
  Shield,
  Users,
  FileText
} from 'lucide-react'

interface AfterHourAccess {
  id: string
  organization_id: string
  site_name: string
  primary_contact: string
  primary_phone: string
  secondary_contact?: string
  secondary_phone?: string
  access_instructions: string
  security_codes?: string
  key_location?: string
  alarm_codes?: string
  emergency_procedures: string
  building_hours: string
  after_hours_contact: string
  notes?: string
  created_at: string
  updated_at: string
}

export default function AfterHourAccessPage() {
  const params = useParams()
  const router = useRouter()
  const { selectedClient } = useClient()
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [accessInfo, setAccessInfo] = useState<AfterHourAccess | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    site_name: '',
    primary_contact: '',
    primary_phone: '',
    secondary_contact: '',
    secondary_phone: '',
    access_instructions: '',
    security_codes: '',
    key_location: '',
    alarm_codes: '',
    emergency_procedures: '',
    building_hours: '',
    after_hours_contact: '',
    notes: ''
  })

  useEffect(() => {
    fetchOrganization()
    fetchAfterHourAccess()
  }, [params.id])

  const fetchOrganization = async () => {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', params.id)
        .single()

      if (error) throw error
      setOrganization(data)
    } catch (error) {
      console.error('Error fetching organization:', error)
    }
  }

  const fetchAfterHourAccess = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('after_hour_access')
        .select('*')
        .eq('organization_id', params.id)
        .single()

      if (data) {
        setAccessInfo(data)
        setFormData({
          site_name: data.site_name || '',
          primary_contact: data.primary_contact || '',
          primary_phone: data.primary_phone || '',
          secondary_contact: data.secondary_contact || '',
          secondary_phone: data.secondary_phone || '',
          access_instructions: data.access_instructions || '',
          security_codes: data.security_codes || '',
          key_location: data.key_location || '',
          alarm_codes: data.alarm_codes || '',
          emergency_procedures: data.emergency_procedures || '',
          building_hours: data.building_hours || '',
          after_hours_contact: data.after_hours_contact || '',
          notes: data.notes || ''
        })
      }
    } catch (error) {
      console.error('Error fetching after hour access:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      
      const dataToSave = {
        organization_id: params.id,
        ...formData
      }

      if (accessInfo) {
        // Update existing
        const { error } = await supabase
          .from('after_hour_access')
          .update(dataToSave)
          .eq('id', accessInfo.id)

        if (error) throw error
      } else {
        // Create new
        const { error } = await supabase
          .from('after_hour_access')
          .insert([dataToSave])

        if (error) throw error
      }

      await fetchAfterHourAccess()
      setEditing(false)
    } catch (error) {
      console.error('Error saving after hour access:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSidebarItemClick = (item: any) => {
    if (item.href) {
      if (item.href === '/') {
        router.push('/')
      } else {
        router.push(`/organizations/${params.id}${item.href}`)
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <Header currentPage="Organizations" />
        <div className="flex">
          <Sidebar onItemClick={handleSidebarItemClick} />
          <div className="flex-1 p-6">
            <div className="flex items-center justify-center h-64">
              <div className="text-gray-400">Loading after hour access information...</div>
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
        
        <div className="flex-1 p-6">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold">After Hour and Building/Make Ready Access</h1>
                <div className="text-sm text-gray-400">
                  {organization?.name}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {editing ? (
                <>
                  <button
                    onClick={() => setEditing(false)}
                    className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded text-sm"
                  >
                    <X className="w-4 h-4" />
                    <span>Cancel</span>
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 disabled:bg-green-800 px-4 py-2 rounded text-sm"
                  >
                    <Save className="w-4 h-4" />
                    <span>{saving ? 'Saving...' : 'Save'}</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit</span>
                </button>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Site Information */}
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Building className="w-5 h-5 text-blue-400" />
                <h2 className="text-lg font-semibold">Site Information</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Site Name</label>
                  {editing ? (
                    <input
                      type="text"
                      value={formData.site_name}
                      onChange={(e) => handleInputChange('site_name', e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                    />
                  ) : (
                    <p className="text-gray-300">{formData.site_name || 'Not specified'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Building Hours</label>
                  {editing ? (
                    <input
                      type="text"
                      value={formData.building_hours}
                      onChange={(e) => handleInputChange('building_hours', e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                      placeholder="e.g., Monday-Friday 8:00 AM - 6:00 PM"
                    />
                  ) : (
                    <p className="text-gray-300">{formData.building_hours || 'Not specified'}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Users className="w-5 h-5 text-green-400" />
                <h2 className="text-lg font-semibold">Contact Information</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Primary Contact</label>
                  {editing ? (
                    <input
                      type="text"
                      value={formData.primary_contact}
                      onChange={(e) => handleInputChange('primary_contact', e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                    />
                  ) : (
                    <p className="text-gray-300">{formData.primary_contact || 'Not specified'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Primary Phone</label>
                  {editing ? (
                    <input
                      type="tel"
                      value={formData.primary_phone}
                      onChange={(e) => handleInputChange('primary_phone', e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                    />
                  ) : (
                    <p className="text-gray-300">{formData.primary_phone || 'Not specified'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">After Hours Contact</label>
                  {editing ? (
                    <input
                      type="text"
                      value={formData.after_hours_contact}
                      onChange={(e) => handleInputChange('after_hours_contact', e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                    />
                  ) : (
                    <p className="text-gray-300">{formData.after_hours_contact || 'Not specified'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Secondary Contact</label>
                  {editing ? (
                    <input
                      type="text"
                      value={formData.secondary_contact}
                      onChange={(e) => handleInputChange('secondary_contact', e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                    />
                  ) : (
                    <p className="text-gray-300">{formData.secondary_contact || 'Not specified'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Secondary Phone</label>
                  {editing ? (
                    <input
                      type="tel"
                      value={formData.secondary_phone}
                      onChange={(e) => handleInputChange('secondary_phone', e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                    />
                  ) : (
                    <p className="text-gray-300">{formData.secondary_phone || 'Not specified'}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Access Instructions */}
            <div className="bg-gray-800 rounded-lg p-6 lg:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <Key className="w-5 h-5 text-yellow-400" />
                <h2 className="text-lg font-semibold">Access Instructions</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Access Instructions</label>
                  {editing ? (
                    <textarea
                      value={formData.access_instructions}
                      onChange={(e) => handleInputChange('access_instructions', e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                      rows={4}
                      placeholder="Detailed instructions for building access..."
                    />
                  ) : (
                    <p className="text-gray-300 whitespace-pre-wrap">{formData.access_instructions || 'Not specified'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Key Location</label>
                  {editing ? (
                    <textarea
                      value={formData.key_location}
                      onChange={(e) => handleInputChange('key_location', e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                      rows={4}
                      placeholder="Where keys are located..."
                    />
                  ) : (
                    <p className="text-gray-300 whitespace-pre-wrap">{formData.key_location || 'Not specified'}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Security Information */}
            <div className="bg-gray-800 rounded-lg p-6 lg:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <Shield className="w-5 h-5 text-red-400" />
                <h2 className="text-lg font-semibold">Security Information</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Security Codes</label>
                  {editing ? (
                    <textarea
                      value={formData.security_codes}
                      onChange={(e) => handleInputChange('security_codes', e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                      rows={3}
                      placeholder="Door codes, gate codes, etc..."
                    />
                  ) : (
                    <p className="text-gray-300 whitespace-pre-wrap">{formData.security_codes || 'Not specified'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Alarm Codes</label>
                  {editing ? (
                    <textarea
                      value={formData.alarm_codes}
                      onChange={(e) => handleInputChange('alarm_codes', e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                      rows={3}
                      placeholder="Alarm system codes and procedures..."
                    />
                  ) : (
                    <p className="text-gray-300 whitespace-pre-wrap">{formData.alarm_codes || 'Not specified'}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Emergency Procedures */}
            <div className="bg-gray-800 rounded-lg p-6 lg:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-orange-400" />
                <h2 className="text-lg font-semibold">Emergency Procedures</h2>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Emergency Procedures</label>
                {editing ? (
                  <textarea
                    value={formData.emergency_procedures}
                    onChange={(e) => handleInputChange('emergency_procedures', e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                    rows={4}
                    placeholder="Emergency contact procedures, evacuation plans, etc..."
                  />
                ) : (
                  <p className="text-gray-300 whitespace-pre-wrap">{formData.emergency_procedures || 'Not specified'}</p>
                )}
              </div>
            </div>

            {/* Notes */}
            <div className="bg-gray-800 rounded-lg p-6 lg:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <FileText className="w-5 h-5 text-gray-400" />
                <h2 className="text-lg font-semibold">Additional Notes</h2>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Notes</label>
                {editing ? (
                  <textarea
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                    rows={3}
                    placeholder="Additional notes and information..."
                  />
                ) : (
                  <p className="text-gray-300 whitespace-pre-wrap">{formData.notes || 'No additional notes'}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
