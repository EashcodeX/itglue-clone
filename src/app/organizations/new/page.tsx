'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, type Organization } from '@/lib/supabase'
import { useClient } from '@/contexts/ClientContext'
import Header from '@/components/Header'
import {
  Save,
  X,
  Building2,
  ArrowLeft,
  Upload
} from 'lucide-react'

export default function NewOrganizationPage() {
  const router = useRouter()
  const { setSelectedClient } = useClient()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    shortName: '',
    type: '',
    status: '',
    locationName: '',
    address: '',
    city: '',
    country: 'Canada',
    state: '',
    zipCode: '',
    logo: null as File | null,
    description: '',
    alertMessage: '',
    organizationHomePage: '',
    parentOrganization: ''
  })

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setSaving(true)
      setError(null)

      // Validate required fields
      if (!formData.name.trim()) {
        setError('Organization name is required')
        return
      }

      // Prepare organization data for database
      const organizationData = {
        name: formData.name,
        description: formData.description || '',
        website: formData.organizationHomePage || '',
        address: formData.address || '',
        city: formData.city || '',
        state: formData.state || '',
        country: formData.country || 'Canada',
        postal_code: formData.zipCode || '',
        timezone: 'EST',
        status: (formData.status || 'active') as 'active' | 'inactive' | 'suspended'
      }

      // Insert new organization into Supabase
      const { data: newOrg, error: orgError } = await supabase
        .from('organizations')
        .insert([organizationData])
        .select()
        .single()

      if (orgError) {
        throw new Error(`Failed to create organization: ${orgError.message}`)
      }

      // Create primary location if provided
      if (formData.locationName && formData.address) {
        const locationData = {
          organization_id: newOrg.id,
          name: formData.locationName,
          location_type: 'office',
          address: formData.address,
          city: formData.city,
          state: formData.state,
          country: formData.country,
          postal_code: formData.zipCode
        }

        const { error: locationError } = await supabase
          .from('locations')
          .insert([locationData])

        if (locationError) {
          console.warn('Failed to create location:', locationError.message)
        }
      }

      // Set the new organization as selected client
      setSelectedClient(newOrg)

      // Navigate to the new organization's detail page
      router.push(`/organizations/${newOrg.id}`)
    } catch (err: any) {
      console.error('Error creating organization:', err)
      setError(err.message || 'Failed to create organization')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    router.push('/organizations')
  }

  const handleSidebarItemClick = (item: any) => {
    console.log('Sidebar item clicked:', item)
    if (item.href) {
      if (item.href === '/') {
        router.push('/')
      } else {
        router.push(item.href)
      }
    }
  }

  const handleBackToOrganizations = () => {
    router.push('/organizations')
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setFormData(prev => ({
      ...prev,
      logo: file
    }))
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header currentPage="Organizations" />

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-6">
        {/* Back Button */}
        <button
          onClick={handleBackToOrganizations}
          className="flex items-center space-x-2 text-gray-400 hover:text-white mb-6 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Organizations</span>
        </button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Create Organization</h1>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/50 border border-red-700 rounded-lg p-4 mb-6">
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSave} className="bg-gray-800 rounded-lg p-6">
          <div className="grid grid-cols-2 gap-6 mb-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter organization name"
                required
              />
            </div>

            {/* Short Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Short Name
              </label>
              <input
                type="text"
                value={formData.shortName}
                onChange={(e) => handleInputChange('shortName', e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter short name"
              />
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Please select</option>
                <option value="client">Client</option>
                <option value="vendor">Vendor</option>
                <option value="partner">Partner</option>
                <option value="internal">Internal</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Please select</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>

          {/* Primary Location Section */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-300 mb-4">Primary Location</h3>

            <div className="grid grid-cols-2 gap-4 mb-4">
              {/* Location Name */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Location Name *
                </label>
                <input
                  type="text"
                  value={formData.locationName}
                  onChange={(e) => handleInputChange('locationName', e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter location name"
                />
              </div>

              {/* Address */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Address *
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Enter address"
                />
              </div>

              {/* City */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  City
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter city"
                />
              </div>

              {/* Country */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Country
                </label>
                <select
                  value={formData.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Canada">Canada</option>
                  <option value="United States">United States</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Australia">Australia</option>
                </select>
              </div>

              {/* State/Province */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  State/Province
                </label>
                <select
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Please select</option>
                  <option value="ON">Ontario</option>
                  <option value="BC">British Columbia</option>
                  <option value="AB">Alberta</option>
                  <option value="QC">Quebec</option>
                  <option value="MB">Manitoba</option>
                  <option value="SK">Saskatchewan</option>
                  <option value="NS">Nova Scotia</option>
                  <option value="NB">New Brunswick</option>
                  <option value="NL">Newfoundland and Labrador</option>
                  <option value="PE">Prince Edward Island</option>
                  <option value="NT">Northwest Territories</option>
                  <option value="NU">Nunavut</option>
                  <option value="YT">Yukon</option>
                </select>
              </div>

              {/* Zip/Postal Code */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Zip/Postal Code
                </label>
                <input
                  type="text"
                  value={formData.zipCode}
                  onChange={(e) => handleInputChange('zipCode', e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter zip/postal code"
                />
              </div>
            </div>
          </div>

          {/* Logo Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Logo
            </label>
            <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
              <Upload className="w-8 h-8 text-gray-500 mx-auto mb-2" />
              <p className="text-sm text-gray-400 mb-2">Browse or drop files to attach</p>
              <p className="text-xs text-gray-500 mb-4">Max file size 100MB each</p>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="logo-upload"
              />
              <label
                htmlFor="logo-upload"
                className="inline-flex items-center px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded cursor-pointer"
              >
                Choose File
              </label>
              {formData.logo && (
                <p className="text-sm text-green-400 mt-2">
                  Selected: {formData.logo.name}
                </p>
              )}
            </div>
          </div>

          {/* Additional Fields */}
          <div className="grid grid-cols-1 gap-4 mb-6">
            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Enter description"
              />
            </div>

            {/* Alert Message */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Alert Message
              </label>
              <textarea
                value={formData.alertMessage}
                onChange={(e) => handleInputChange('alertMessage', e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={2}
                placeholder="Enter alert message"
              />
            </div>

            {/* Organization Home Page */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Required on Organization home page
              </label>
              <input
                type="url"
                value={formData.organizationHomePage}
                onChange={(e) => handleInputChange('organizationHomePage', e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter website URL"
              />
            </div>

            {/* Parent Organization */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Parent Organization
              </label>
              <select
                value={formData.parentOrganization}
                onChange={(e) => handleInputChange('parentOrganization', e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">None</option>
                <option value="parent1">Parent Organization 1</option>
                <option value="parent2">Parent Organization 2</option>
              </select>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-700">
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white rounded-lg transition-colors flex items-center space-x-2"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
