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
  Edit,
  FileText,
  Copy,
  Trash2,
  Plus,
  Archive,
  MapPin,
  Phone,
  Mail,
  Clock,
  User,
  Users,
  Shield,
  Key,
  AlertTriangle
} from 'lucide-react'

export default function SiteSummaryLegacyPage() {
  const params = useParams()
  const router = useRouter()
  const { selectedClient } = useClient()
  const [loading, setLoading] = useState(true)
  const [organization, setOrganization] = useState<Organization | null>(null)

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

  const handleBackToOrganization = () => {
    router.push(`/organizations/${params.id}`)
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
              <span>Con-Elco Ltd</span>
              <span>/</span>
              <span>Site Summary (Legacy)</span>
              <span>/</span>
              <span className="text-white">Con Elco</span>
            </div>

            {/* Page Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-semibold">Con Elco</h1>
                  <div className="text-sm text-gray-400">
                    Site Summary (Legacy)
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => router.push(`/organizations/${params.id}/edit`)}
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit</span>
                </button>
                <button className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded text-sm">
                  <FileText className="w-4 h-4" />
                  <span>PDF</span>
                </button>
                <button className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded text-sm">
                  <Copy className="w-4 h-4" />
                  <span>Copy</span>
                </button>
                <button className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-sm">
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
                <button
                  onClick={() => router.push(`/organizations/${params.id}/site-summary-legacy/new`)}
                  className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>New</span>
                </button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex space-x-1 mb-6">
              <button 
                onClick={() => router.push(`/organizations/${params.id}/site-summary`)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded text-sm"
              >
                Site Summary
              </button>
              <button 
                className="px-4 py-2 bg-blue-600 text-white rounded text-sm"
              >
                Site Summary (Legacy)
              </button>
            </div>

            {/* Archive Button */}
            <div className="mb-6">
              <button className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded text-sm">
                <Archive className="w-4 h-4" />
                <span>Archive</span>
              </button>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-4 gap-6">
              {/* Left Column - Main Content */}
              <div className="col-span-3 space-y-6">
                
                {/* Title Section */}
                <div className="bg-gray-800 rounded-lg p-6">
                  <h2 className="text-lg font-medium mb-4">Title</h2>
                  <div className="text-white">{organization?.name || 'Con Elco'}</div>
                </div>

                {/* Client Contacts Section */}
                <div className="bg-gray-800 rounded-lg p-6">
                  <h2 className="text-lg font-medium mb-4">Client Contacts</h2>
                  
                  {/* Location */}
                  <div className="mb-6">
                    <h3 className="text-md font-medium text-blue-400 mb-3">Location</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span>Con-Elco Ltd</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span>Con-Elco Ltd - Allentown Lighting Product (117979 Ontario Inc.)</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span>Con-Elco Ltd - Fallowes Electrical Consultants Ltd</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span>Con-Elco Ltd - Fibre-Optic Network Infrastructure Inc.</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span>Con-Elco Ltd - Specialty Utility Construction Inc. (SUCI)</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span>Con-Elco Ltd - Main Office</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span>Fallowes Electrical Consultants</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span>Fibre-Optic Network Infrastructure Inc.</span>
                      </div>
                    </div>
                  </div>

                  {/* Primary Contact */}
                  <div className="mb-6">
                    <h3 className="text-md font-medium text-blue-400 mb-3">Primary Contact</h3>
                    <div className="flex items-center space-x-2 text-sm">
                      <User className="w-4 h-4 text-gray-400" />
                      <span>Linda Shan</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm mt-1">
                      <User className="w-4 h-4 text-gray-400" />
                      <span>Nick Melati</span>
                    </div>
                  </div>

                  {/* Emergency Contact #1 */}
                  <div className="mb-6">
                    <h3 className="text-md font-medium text-blue-400 mb-3">Emergency Contact #1</h3>
                    <div className="flex items-center space-x-2 text-sm">
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                      <span>Nick Melati</span>
                    </div>
                  </div>
                </div>

                {/* Initial Onboarding Details */}
                <div className="bg-gray-800 rounded-lg p-6">
                  <h2 className="text-lg font-medium mb-4">Initial Onboarding Details</h2>
                  <div className="text-sm text-gray-300">
                    <p className="mb-4">
                      Show who has access to this Site Summary (Legacy) 
                      <button className="text-blue-400 hover:text-blue-300 ml-1">
                        <span className="underline">link</span>
                      </button>
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Sidebar */}
              <div className="space-y-6">
                {/* Attachments */}
                <div className="bg-gray-800 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center">
                    <FileText className="w-4 h-4 mr-2" />
                    Attachments
                  </h3>
                  <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-600 rounded">
                    <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-xs">Browse or drop files to attach</p>
                    <p className="text-xs">Max file size: 10 MB each</p>
                  </div>
                </div>

                {/* Embedded Passwords */}
                <div className="bg-gray-800 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center">
                    <Key className="w-4 h-4 mr-2" />
                    Embedded Passwords
                  </h3>
                  <div className="text-center py-4 text-gray-400">
                    <p className="text-xs">No Embedded Passwords to show...</p>
                    <button className="text-blue-400 hover:text-blue-300 text-xs mt-2">
                      Add Password
                    </button>
                  </div>
                </div>

                {/* Related Items */}
                <div className="bg-gray-800 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center">
                    <Users className="w-4 h-4 mr-2" />
                    Related Items
                  </h3>
                  <div className="text-center py-4 text-gray-400">
                    <p className="text-xs">No Related Items to show...</p>
                    <button className="text-blue-400 hover:text-blue-300 text-xs mt-2">
                      Add Related Item
                    </button>
                  </div>
                </div>

                {/* Revisions */}
                <div className="bg-gray-800 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    Revisions
                  </h3>
                  <div className="text-xs text-gray-400">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-3 h-3" />
                      <span>Jul 19, 2022 - 10:26 pm</span>
                    </div>
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
