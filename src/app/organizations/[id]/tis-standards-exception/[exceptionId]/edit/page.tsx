'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useNotifications } from '@/contexts/NotificationContext'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import {
  AlertTriangle,
  Save,
  X,
  ArrowLeft,
  Calendar,
  User,
  FileText,
  Shield,
  AlertCircle,
  Loader2
} from 'lucide-react'

interface TISStandardsException {
  id: string
  exception_title: string
  standard_reference: string
  exception_type: 'temporary' | 'permanent' | 'conditional'
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  justification: string
  risk_assessment: string
  mitigation_plan: string
  approved_by: string
  approval_date: string
  expiry_date: string
  status: 'pending' | 'approved' | 'rejected' | 'expired'
  created_by: string
  created_at: string
  updated_at: string
}

export default function EditTISStandardsExceptionPage() {
  const params = useParams()
  const router = useRouter()
  const { success, error } = useNotifications()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [exception, setException] = useState<TISStandardsException | null>(null)

  useEffect(() => {
    fetchException()
  }, [params.exceptionId])

  const fetchException = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('tis_standards_exceptions')
        .select('*')
        .eq('id', params.exceptionId)
        .eq('organization_id', params.id)
        .single()

      if (fetchError) throw fetchError
      
      setException(data)
    } catch (err) {
      console.error('Error fetching exception:', err)
      error('Failed to load exception. Please try again.')
      router.back()
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (!exception) return
    
    const { name, value } = e.target
    setException(prev => prev ? {
      ...prev,
      [name]: value
    } : null)
  }

  const validateForm = (): string[] => {
    if (!exception) return ['Exception data not loaded']
    
    const errors: string[] = []
    
    if (!exception.exception_title.trim()) errors.push('Exception title is required')
    if (!exception.standard_reference.trim()) errors.push('Standard reference is required')
    if (!exception.description.trim()) errors.push('Description is required')
    if (!exception.justification.trim()) errors.push('Justification is required')
    if (!exception.risk_assessment.trim()) errors.push('Risk assessment is required')
    
    if (exception.exception_type === 'temporary' && !exception.expiry_date) {
      errors.push('Expiry date is required for temporary exceptions')
    }
    
    return errors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!exception) return
    
    const validationErrors = validateForm()
    if (validationErrors.length > 0) {
      error(`Please fix the following errors: ${validationErrors.join(', ')}`)
      return
    }

    setSaving(true)
    try {
      const { error: updateError } = await supabase
        .from('tis_standards_exceptions')
        .update({
          ...exception,
          updated_at: new Date().toISOString()
        })
        .eq('id', params.exceptionId)
        .eq('organization_id', params.id)

      if (updateError) throw updateError

      success('TIS Standards Exception updated successfully!')
      router.push(`/organizations/${params.id}/tis-standards-exception`)
    } catch (err) {
      console.error('Error updating exception:', err)
      error('Failed to update TIS Standards Exception. Please try again.')
    } finally {
      setSaving(false)
    }
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
          <div className="flex-1 p-6 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
              <p className="text-gray-400">Loading exception...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!exception) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <Header currentPage="Organizations" />
        <div className="flex">
          <Sidebar onItemClick={handleSidebarItemClick} />
          <div className="flex-1 p-6 flex items-center justify-center">
            <div className="text-center">
              <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Exception Not Found</h2>
              <p className="text-gray-400 mb-4">The requested exception could not be found.</p>
              <button
                onClick={() => router.back()}
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded transition-colors"
              >
                Go Back
              </button>
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
              <button
                onClick={() => router.back()}
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold">Edit TIS Standards Exception</h1>
                <div className="text-sm text-gray-400">
                  {exception.exception_title}
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="max-w-4xl">
            <div className="bg-gray-800 rounded-lg p-6 space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-blue-400" />
                  <span>Basic Information</span>
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Exception Title *
                    </label>
                    <input
                      type="text"
                      name="exception_title"
                      value={exception.exception_title}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Standard Reference *
                    </label>
                    <input
                      type="text"
                      name="standard_reference"
                      value={exception.standard_reference}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Exception Type *
                    </label>
                    <select
                      name="exception_type"
                      value={exception.exception_type}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="temporary">Temporary</option>
                      <option value="permanent">Permanent</option>
                      <option value="conditional">Conditional</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Severity *
                    </label>
                    <select
                      name="severity"
                      value={exception.severity}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Description and Justification */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-yellow-400" />
                  <span>Details</span>
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Description *
                    </label>
                    <textarea
                      name="description"
                      value={exception.description}
                      onChange={handleInputChange}
                      required
                      rows={3}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Business Justification *
                    </label>
                    <textarea
                      name="justification"
                      value={exception.justification}
                      onChange={handleInputChange}
                      required
                      rows={3}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Risk Assessment *
                    </label>
                    <textarea
                      name="risk_assessment"
                      value={exception.risk_assessment}
                      onChange={handleInputChange}
                      required
                      rows={3}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Mitigation Plan
                    </label>
                    <textarea
                      name="mitigation_plan"
                      value={exception.mitigation_plan || ''}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Approval and Dates */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-green-400" />
                  <span>Approval & Timeline</span>
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Approved By
                    </label>
                    <input
                      type="text"
                      name="approved_by"
                      value={exception.approved_by || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Approval Date
                    </label>
                    <input
                      type="date"
                      name="approval_date"
                      value={exception.approval_date || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  {exception.exception_type === 'temporary' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Expiry Date *
                      </label>
                      <input
                        type="date"
                        name="expiry_date"
                        value={exception.expiry_date || ''}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Status
                    </label>
                    <select
                      name="status"
                      value={exception.status}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                      <option value="expired">Expired</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-700">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="flex items-center space-x-2 px-6 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                  <span>Cancel</span>
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-6 py-2 rounded-lg transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
