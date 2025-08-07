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
  GitCommit,
  Calendar,
  User,
  Tag,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info
} from 'lucide-react'

interface ChangeLogEntry {
  id: string
  organization_id: string
  change_id?: string
  rfc_number?: string
  title: string
  description: string
  change_type: 'configuration' | 'hardware' | 'software' | 'network' | 'security' | 'process' | 'documentation'
  impact_level: 'low' | 'medium' | 'high' | 'critical'
  status: 'planned' | 'in_progress' | 'completed' | 'failed' | 'rolled_back'
  performed_by: string
  approved_by?: string
  affected_systems?: string[]
  downtime_duration?: number
  rollback_performed: boolean
  rollback_reason?: string
  change_window_start?: string
  change_window_end?: string
  actual_start?: string
  actual_end?: string
  notes?: string
  created_at: string
  updated_at: string
}

export default function ChangeLogPage() {
  const params = useParams()
  const router = useRouter()
  const { selectedClient } = useClient()
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [changeLog, setChangeLog] = useState<ChangeLogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [filteredChanges, setFilteredChanges] = useState<ChangeLogEntry[]>([])

  useEffect(() => {
    fetchOrganization()
    fetchChangeLog()
  }, [params.id])

  useEffect(() => {
    filterChanges()
  }, [changeLog, searchTerm, typeFilter, statusFilter])

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

  const fetchChangeLog = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('change_log')
        .select('*')
        .eq('organization_id', params.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setChangeLog(data || [])
    } catch (error) {
      console.error('Error fetching change log:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterChanges = () => {
    let filtered = changeLog

    if (searchTerm) {
      filtered = filtered.filter(change =>
        change.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        change.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        change.performed_by.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(change => change.change_type === typeFilter)
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(change => change.status === statusFilter)
    }

    setFilteredChanges(filtered)
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
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-400" />
      case 'rolled_back':
        return <XCircle className="w-4 h-4 text-orange-400" />
      case 'in_progress':
        return <Clock className="w-4 h-4 text-blue-400" />
      case 'planned':
        return <Calendar className="w-4 h-4 text-yellow-400" />
      default:
        return <Info className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-400'
      case 'failed':
        return 'text-red-400'
      case 'rolled_back':
        return 'text-orange-400'
      case 'in_progress':
        return 'text-blue-400'
      case 'planned':
        return 'text-yellow-400'
      default:
        return 'text-gray-400'
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'configuration':
        return <Tag className="w-4 h-4 text-blue-400" />
      case 'hardware':
        return <Tag className="w-4 h-4 text-purple-400" />
      case 'software':
        return <Tag className="w-4 h-4 text-green-400" />
      case 'network':
        return <Tag className="w-4 h-4 text-indigo-400" />
      case 'security':
        return <Tag className="w-4 h-4 text-red-400" />
      default:
        return <Tag className="w-4 h-4 text-gray-400" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}m`
    }
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return `${hours}h ${remainingMinutes}m`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <Header currentPage="Organizations" />
        <div className="flex">
          <Sidebar onItemClick={handleSidebarItemClick} />
          <div className="flex-1 p-6">
            <div className="flex items-center justify-center h-64">
              <div className="text-gray-400">Loading change log...</div>
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
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                <GitCommit className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold">Change Log</h1>
                <div className="text-sm text-gray-400">
                  {organization?.name} • {filteredChanges.length} changes
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => router.push(`/organizations/${params.id}/change-log/new`)}
                className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Log Change</span>
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
                    placeholder="Search changes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Types</option>
                  <option value="configuration">Configuration</option>
                  <option value="hardware">Hardware</option>
                  <option value="software">Software</option>
                  <option value="network">Network</option>
                  <option value="security">Security</option>
                  <option value="process">Process</option>
                  <option value="documentation">Documentation</option>
                </select>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="planned">Planned</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                  <option value="rolled_back">Rolled Back</option>
                </select>
              </div>
              <div className="text-sm text-gray-400">
                {filteredChanges.length} Results
              </div>
            </div>
          </div>

          {/* Change Log Table */}
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="text-left p-4 text-sm font-medium text-gray-300">Change</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-300">Type</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-300">Impact</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-300">Status</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-300">Performed By</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-300">Date</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-300">Downtime</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-300">Rollback</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {filteredChanges.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center p-8 text-gray-400">
                        No change log entries found
                      </td>
                    </tr>
                  ) : (
                    filteredChanges.map((change) => (
                      <tr key={change.id} className="hover:bg-gray-700/50">
                        <td className="p-4">
                          <div className="flex items-center space-x-3">
                            <GitCommit className="w-4 h-4 text-green-400" />
                            <div>
                              <div className="text-white">{change.title}</div>
                              {change.rfc_number && (
                                <div className="text-xs text-blue-400">RFC: {change.rfc_number}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            {getTypeIcon(change.change_type)}
                            <span className="capitalize text-gray-300">{change.change_type}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${getImpactColor(change.impact_level)}`}>
                            {change.impact_level}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(change.status)}
                            <span className={`capitalize ${getStatusColor(change.status)}`}>
                              {change.status.replace('_', ' ')}
                            </span>
                          </div>
                        </td>
                        <td className="p-4 text-gray-300">{change.performed_by}</td>
                        <td className="p-4 text-gray-300">
                          {change.actual_start ? formatDateTime(change.actual_start) : 
                           change.change_window_start ? formatDateTime(change.change_window_start) : 
                           formatDate(change.created_at)}
                        </td>
                        <td className="p-4 text-gray-300">
                          {change.downtime_duration ? formatDuration(change.downtime_duration) : '-'}
                        </td>
                        <td className="p-4">
                          {change.rollback_performed ? (
                            <div className="flex items-center space-x-1">
                              <XCircle className="w-4 h-4 text-orange-400" />
                              <span className="text-orange-400 text-sm">Yes</span>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">No</span>
                          )}
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
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-6">
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <div>
                  <div className="text-sm text-gray-400">Completed</div>
                  <div className="text-xl font-semibold">
                    {changeLog.filter(c => c.status === 'completed').length}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-blue-400" />
                <div>
                  <div className="text-sm text-gray-400">In Progress</div>
                  <div className="text-xl font-semibold">
                    {changeLog.filter(c => c.status === 'in_progress').length}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <XCircle className="w-5 h-5 text-red-400" />
                <div>
                  <div className="text-sm text-gray-400">Failed</div>
                  <div className="text-xl font-semibold">
                    {changeLog.filter(c => c.status === 'failed').length}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <XCircle className="w-5 h-5 text-orange-400" />
                <div>
                  <div className="text-sm text-gray-400">Rolled Back</div>
                  <div className="text-xl font-semibold">
                    {changeLog.filter(c => c.rollback_performed).length}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <div>
                  <div className="text-sm text-gray-400">Critical</div>
                  <div className="text-xl font-semibold">
                    {changeLog.filter(c => c.impact_level === 'critical').length}
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
