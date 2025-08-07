'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase, type Organization } from '@/lib/supabase'
import { useClient } from '@/contexts/ClientContext'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  MoreHorizontal,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Calendar,
  User,
  Settings
} from 'lucide-react'

interface RFC {
  id: string
  organization_id: string
  rfc_number: string
  title: string
  description: string
  change_type: 'emergency' | 'standard' | 'normal' | 'major'
  priority: 'low' | 'medium' | 'high' | 'critical'
  category: 'hardware' | 'software' | 'network' | 'security' | 'process' | 'other'
  requested_by: string
  assigned_to?: string
  business_justification: string
  implementation_plan: string
  rollback_plan: string
  risk_assessment: string
  impact_assessment: string
  testing_plan?: string
  scheduled_start?: string
  scheduled_end?: string
  actual_start?: string
  actual_end?: string
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'in_progress' | 'completed' | 'cancelled'
  approval_required: boolean
  approved_by?: string
  approval_date?: string
  created_at: string
  updated_at: string
}

export default function RFCPage() {
  const params = useParams()
  const router = useRouter()
  const { selectedClient } = useClient()
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [rfcs, setRfcs] = useState<RFC[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [filteredRfcs, setFilteredRfcs] = useState<RFC[]>([])

  useEffect(() => {
    fetchOrganization()
    fetchRfcs()
  }, [params.id])

  useEffect(() => {
    filterRfcs()
  }, [rfcs, searchTerm, statusFilter])

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

  const fetchRfcs = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('rfcs')
        .select('*')
        .eq('organization_id', params.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setRfcs(data || [])
    } catch (error) {
      console.error('Error fetching RFCs:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterRfcs = () => {
    let filtered = rfcs

    if (searchTerm) {
      filtered = filtered.filter(rfc =>
        rfc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rfc.rfc_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rfc.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(rfc => rfc.status === statusFilter)
    }

    setFilteredRfcs(filtered)
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-400" />
      case 'cancelled':
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-400" />
      case 'in_progress':
        return <Settings className="w-4 h-4 text-blue-400 animate-spin" />
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-blue-400" />
      case 'submitted':
        return <Clock className="w-4 h-4 text-yellow-400" />
      case 'draft':
        return <FileText className="w-4 h-4 text-gray-400" />
      default:
        return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-400'
      case 'cancelled':
      case 'rejected':
        return 'text-red-400'
      case 'in_progress':
        return 'text-blue-400'
      case 'approved':
        return 'text-blue-400'
      case 'submitted':
        return 'text-yellow-400'
      case 'draft':
        return 'text-gray-400'
      default:
        return 'text-gray-400'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'text-red-400 bg-red-900/20'
      case 'high':
        return 'text-orange-400 bg-orange-900/20'
      case 'medium':
        return 'text-yellow-400 bg-yellow-900/20'
      case 'low':
        return 'text-green-400 bg-green-900/20'
      default:
        return 'text-gray-400 bg-gray-900/20'
    }
  }

  const getChangeTypeColor = (type: string) => {
    switch (type) {
      case 'emergency':
        return 'text-red-400 bg-red-900/20'
      case 'major':
        return 'text-orange-400 bg-orange-900/20'
      case 'standard':
        return 'text-blue-400 bg-blue-900/20'
      case 'normal':
        return 'text-green-400 bg-green-900/20'
      default:
        return 'text-gray-400 bg-gray-900/20'
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
              <div className="text-gray-400">Loading RFCs...</div>
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
              <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold">Request for Change Form (RFC)</h1>
                <div className="text-sm text-gray-400">
                  {organization?.name} • {filteredRfcs.length} RFCs
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => router.push(`/organizations/${params.id}/rfc/new`)}
                className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>New RFC</span>
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-gray-800 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search RFCs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="draft">Draft</option>
                  <option value="submitted">Submitted</option>
                  <option value="approved">Approved</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="rejected">Rejected</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div className="text-sm text-gray-400">
                {filteredRfcs.length} Results
              </div>
            </div>
          </div>

          {/* RFCs Table */}
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="text-left p-4 text-sm font-medium text-gray-300">RFC Number</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-300">Title</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-300">Type</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-300">Priority</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-300">Category</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-300">Status</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-300">Requested By</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-300">Scheduled</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {filteredRfcs.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center p-8 text-gray-400">
                        No RFCs found
                      </td>
                    </tr>
                  ) : (
                    filteredRfcs.map((rfc) => (
                      <tr key={rfc.id} className="hover:bg-gray-700/50">
                        <td className="p-4">
                          <span className="text-blue-400 font-mono">{rfc.rfc_number}</span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-3">
                            <FileText className="w-4 h-4 text-blue-400" />
                            <span className="text-white">{rfc.title}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${getChangeTypeColor(rfc.change_type)}`}>
                            {rfc.change_type}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${getPriorityColor(rfc.priority)}`}>
                            {rfc.priority}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="capitalize text-gray-300">{rfc.category}</span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(rfc.status)}
                            <span className={`capitalize ${getStatusColor(rfc.status)}`}>
                              {rfc.status.replace('_', ' ')}
                            </span>
                          </div>
                        </td>
                        <td className="p-4 text-gray-300">{rfc.requested_by}</td>
                        <td className="p-4 text-gray-300">
                          {rfc.scheduled_start ? formatDate(rfc.scheduled_start) : '-'}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            <button className="p-1 text-gray-400 hover:text-white">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="p-1 text-gray-400 hover:text-white">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button className="p-1 text-gray-400 hover:text-white">
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <button className="p-1 text-gray-400 hover:text-white">
                              <MoreHorizontal className="w-4 h-4" />
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

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mt-6">
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-400">Draft</div>
                  <div className="text-xl font-semibold">
                    {rfcs.filter(r => r.status === 'draft').length}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-yellow-400" />
                <div>
                  <div className="text-sm text-gray-400">Submitted</div>
                  <div className="text-xl font-semibold">
                    {rfcs.filter(r => r.status === 'submitted').length}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-blue-400" />
                <div>
                  <div className="text-sm text-gray-400">Approved</div>
                  <div className="text-xl font-semibold">
                    {rfcs.filter(r => r.status === 'approved').length}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Settings className="w-5 h-5 text-blue-400" />
                <div>
                  <div className="text-sm text-gray-400">In Progress</div>
                  <div className="text-xl font-semibold">
                    {rfcs.filter(r => r.status === 'in_progress').length}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <div>
                  <div className="text-sm text-gray-400">Completed</div>
                  <div className="text-xl font-semibold">
                    {rfcs.filter(r => r.status === 'completed').length}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <div>
                  <div className="text-sm text-gray-400">Emergency</div>
                  <div className="text-xl font-semibold">
                    {rfcs.filter(r => r.change_type === 'emergency').length}
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
