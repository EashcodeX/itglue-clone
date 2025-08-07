'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useNotifications } from '@/contexts/NotificationContext'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import {
  FileText,
  Save,
  X,
  ArrowLeft,
  Calendar,
  DollarSign,
  Shield,
  AlertCircle
} from 'lucide-react'

interface TISContractExceptionForm {
  contract_reference: string
  exception_title: string
  contract_section: string
  exception_type: 'pricing' | 'terms' | 'scope' | 'timeline' | 'other'
  description: string
  business_justification: string
  financial_impact: number | ''
  risk_level: 'low' | 'medium' | 'high' | 'critical'
  approved_by: string
  approval_date: string
  effective_date: string
  expiry_date: string
  status: 'pending' | 'approved' | 'rejected' | 'expired'
  created_by: string
}

export default function NewTISContractExceptionPage() {
  const params = useParams()
  const router = useRouter()
  const { success, error } = useNotifications()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<TISContractExceptionForm>({
    contract_reference: '',
    exception_title: '',
    contract_section: '',
    exception_type: 'terms',
    description: '',
    business_justification: '',
    financial_impact: '',
    risk_level: 'medium',
    approved_by: '',
    approval_date: '',
    effective_date: '',
    expiry_date: '',
    status: 'pending',
    created_by: 'Current User' // In real app, get from auth context
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'financial_impact' ? (value === '' ? '' : parseFloat(value)) : value
    }))
  }

  const validateForm = (): string[] => {
    const errors: string[] = []
    
    if (!formData.contract_reference.trim()) errors.push('Contract reference is required')
    if (!formData.exception_title.trim()) errors.push('Exception title is required')
    if (!formData.contract_section.trim()) errors.push('Contract section is required')
    if (!formData.description.trim()) errors.push('Description is required')
    if (!formData.business_justification.trim()) errors.push('Business justification is required')
    
    return errors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const validationErrors = validateForm()
    if (validationErrors.length > 0) {
      error(`Please fix the following errors: ${validationErrors.join(', ')}`)
      return
    }

    setLoading(true)
    try {
      const { data, error: submitError } = await supabase
        .from('tis_contract_exceptions')
        .insert([{
          organization_id: params.id,
          ...formData,
          financial_impact: formData.financial_impact === '' ? null : formData.financial_impact,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()

      if (submitError) throw submitError

      success('TIS Contract Exception created successfully!')
      router.push(`/organizations/${params.id}/tis-contract-exceptions`)
    } catch (err) {
      console.error('Error creating exception:', err)
      error('Failed to create TIS Contract Exception. Please try again.')
    } finally {
      setLoading(false)
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
              <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold">New TIS Contract Exception</h1>
                <div className="text-sm text-gray-400">
                  Create a new contract exception request
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="max-w-4xl">
            <div className="bg-gray-800 rounded-lg p-6 space-y-6">
              {/* Contract Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-blue-400" />
                  <span>Contract Information</span>
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Contract Reference *
                    </label>
                    <input
                      type="text"
                      name="contract_reference"
                      value={formData.contract_reference}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., MSA-2024-001"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Contract Section *
                    </label>
                    <input
                      type="text"
                      name="contract_section"
                      value={formData.contract_section}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Section 5.2 - Payment Terms"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Exception Title *
                    </label>
                    <input
                      type="text"
                      name="exception_title"
                      value={formData.exception_title}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Brief title for this exception"
                    />
                  </div>
                </div>
              </div>

              {/* Exception Details */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-yellow-400" />
                  <span>Exception Details</span>
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Exception Type *
                    </label>
                    <select
                      name="exception_type"
                      value={formData.exception_type}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="pricing">Pricing</option>
                      <option value="terms">Terms</option>
                      <option value="scope">Scope</option>
                      <option value="timeline">Timeline</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Risk Level *
                    </label>
                    <select
                      name="risk_level"
                      value={formData.risk_level}
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
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Description *
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      required
                      rows={3}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Describe the contract exception in detail"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Business Justification *
                    </label>
                    <textarea
                      name="business_justification"
                      value={formData.business_justification}
                      onChange={handleInputChange}
                      required
                      rows={3}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Explain the business need for this exception"
                    />
                  </div>
                </div>
              </div>

              {/* Financial and Timeline */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                  <DollarSign className="w-5 h-5 text-green-400" />
                  <span>Financial Impact & Timeline</span>
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Financial Impact ($)
                    </label>
                    <input
                      type="number"
                      name="financial_impact"
                      value={formData.financial_impact}
                      onChange={handleInputChange}
                      step="0.01"
                      min="0"
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0.00"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Approved By
                    </label>
                    <input
                      type="text"
                      name="approved_by"
                      value={formData.approved_by}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Approver name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Effective Date
                    </label>
                    <input
                      type="date"
                      name="effective_date"
                      value={formData.effective_date}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Expiry Date
                    </label>
                    <input
                      type="date"
                      name="expiry_date"
                      value={formData.expiry_date}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Approval Date
                    </label>
                    <input
                      type="date"
                      name="approval_date"
                      value={formData.approval_date}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Status
                    </label>
                    <select
                      name="status"
                      value={formData.status}
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
                  disabled={loading}
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-6 py-2 rounded-lg transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>{loading ? 'Creating...' : 'Create Exception'}</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
