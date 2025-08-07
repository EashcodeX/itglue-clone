'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useClient } from '@/contexts/ClientContext'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import {
  FileText,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  DollarSign,
  Calendar,
  User
} from 'lucide-react'

interface TISContractException {
  id: string
  organization_id: string
  contract_reference: string
  exception_title: string
  contract_section: string
  exception_type: 'pricing' | 'terms' | 'scope' | 'timeline' | 'other'
  description: string
  business_justification: string
  financial_impact?: number
  risk_level: 'low' | 'medium' | 'high' | 'critical'
  approved_by?: string
  approval_date?: string
  effective_date?: string
  expiry_date?: string
  status: 'pending' | 'approved' | 'rejected' | 'expired'
  created_by: string
  created_at: string
  updated_at: string
}

export default function TISContractExceptionsPage() {
  const params = useParams()
  const router = useRouter()
  const { selectedClient } = useClient()
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [exceptions, setExceptions] = useState<TISContractException[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredExceptions, setFilteredExceptions] = useState<TISContractException[]>([])
  const [tableExists, setTableExists] = useState(true)

  useEffect(() => {
    fetchOrganization()
    fetchExceptions()
  }, [params.id])

  useEffect(() => {
    filterExceptions()
  }, [exceptions, searchTerm])

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

  const fetchExceptions = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('tis_contract_exceptions')
        .select('*')
        .eq('organization_id', params.id)
        .order('created_at', { ascending: false })

      if (error) {
        // Check if the error is due to table not existing
        if (error.message.includes('does not exist') || error.message.includes('relation') || error.code === 'PGRST116') {
          console.warn('TIS contract exceptions table does not exist yet. Migration may be required.')
          setTableExists(false)
          setExceptions([])
        } else {
          throw error
        }
      } else {
        setExceptions(data || [])
      }
    } catch (error) {
      console.error('Error fetching exceptions:', error)
      setExceptions([])
    } finally {
      setLoading(false)
    }
  }

  const filterExceptions = () => {
    if (!searchTerm) {
      setFilteredExceptions(exceptions)
    } else {
      const filtered = exceptions.filter(exception =>
        exception.exception_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exception.contract_reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exception.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredExceptions(filtered)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-400" />
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-400" />
      case 'expired':
        return <Clock className="w-4 h-4 text-gray-400" />
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-400" />
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'critical':
        return 'bg-red-600/20 text-red-300 ring-red-500/30'
      case 'high':
        return 'bg-orange-600/20 text-orange-300 ring-orange-500/30'
      case 'medium':
        return 'bg-yellow-600/20 text-yellow-300 ring-yellow-500/30'
      default:
        return 'bg-green-600/20 text-green-300 ring-green-500/30'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'pricing':
        return <DollarSign className="w-4 h-4 text-green-400" />
      case 'timeline':
        return <Calendar className="w-4 h-4 text-blue-400" />
      case 'terms':
        return <FileText className="w-4 h-4 text-purple-400" />
      default:
        return <FileText className="w-4 h-4 text-gray-400" />
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <Header currentPage="Organizations" />
        <div className="flex">
          <Sidebar onItemClick={handleSidebarItemClick} />
          <div className="flex-1 p-6">
            <div className="flex items-center justify-center h-64">
              <div className="text-gray-400">Loading TIS contract exceptions...</div>
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
              <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold">TIS Contract Exceptions</h1>
                <div className="text-sm text-gray-400">
                  {organization?.name} • {filteredExceptions.length} exceptions
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => router.push(`/organizations/${params.id}/tis-contract-exceptions/new`)}
                className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>New Exception</span>
              </button>
            </div>
          </div>

          {/* Migration Notice */}
          {!tableExists && (
            <div className="bg-yellow-900/50 border border-yellow-600 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-yellow-200 font-medium mb-2">Database Migration Required</h3>
                  <p className="text-yellow-100 text-sm mb-3">
                    The TIS Contract Exceptions table doesn't exist yet. This is expected after renaming from F12 to TIS.
                  </p>
                  <div className="text-yellow-100 text-sm">
                    <p className="font-medium mb-1">To fix this, run the database migration:</p>
                    <code className="bg-yellow-800/30 px-2 py-1 rounded text-xs">
                      node scripts/run-migration.js
                    </code>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Search and Filters */}
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search exceptions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded text-sm">
              <Filter className="w-4 h-4" />
              <span>Filter</span>
            </button>
          </div>

          {/* Exceptions Table */}
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="text-left p-4 text-sm font-medium text-gray-300">Exception</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-300">Contract</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-300">Type</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-300">Risk Level</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-300">Status</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-300">Financial Impact</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-300">Expiry</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-300">Approved By</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {filteredExceptions.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center p-8 text-gray-400">
                        No TIS contract exceptions found
                      </td>
                    </tr>
                  ) : (
                    filteredExceptions.map((exception) => (
                      <tr key={exception.id} className="hover:bg-gray-700/50">
                        <td className="p-4">
                          <div className="flex items-center space-x-3">
                            {getTypeIcon(exception.exception_type)}
                            <span className="text-white">{exception.exception_title}</span>
                          </div>
                        </td>
                        <td className="p-4 text-gray-300">{exception.contract_reference}</td>
                        <td className="p-4">
                          <span className="px-2 py-1 bg-blue-600/20 text-blue-300 rounded-full text-xs capitalize">
                            {exception.exception_type}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-xs ring-1 capitalize ${getRiskColor(exception.risk_level)}`}>
                            {exception.risk_level}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(exception.status)}
                            <span className="text-gray-300 capitalize">{exception.status}</span>
                          </div>
                        </td>
                        <td className="p-4 text-gray-300">
                          {exception.financial_impact ? `$${exception.financial_impact.toLocaleString()}` : 'N/A'}
                        </td>
                        <td className="p-4 text-gray-300">
                          {exception.expiry_date ? formatDate(exception.expiry_date) : 'N/A'}
                        </td>
                        <td className="p-4 text-gray-300">{exception.approved_by || 'Pending'}</td>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            <button className="p-1 text-blue-400 hover:text-blue-300">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="p-1 text-green-400 hover:text-green-300">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button className="p-1 text-red-400 hover:text-red-300">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

interface Organization {
  id: string
  name: string
  description?: string
  website?: string
  email?: string
  phone?: string
  address?: string
  city?: string
  state?: string
  country?: string
  postal_code?: string
  status: 'active' | 'inactive'
  created_at: string
  updated_at: string
}
