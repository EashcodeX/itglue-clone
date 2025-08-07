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
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Bug,
  User,
  Calendar,
  Tag
} from 'lucide-react'

interface KnownIssue {
  id: string
  organization_id: string
  title: string
  description: string
  issue_type: 'bug' | 'performance' | 'security' | 'compatibility' | 'configuration' | 'hardware' | 'network'
  severity: 'low' | 'medium' | 'high' | 'critical'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'open' | 'investigating' | 'workaround_available' | 'resolved' | 'closed' | 'wont_fix'
  affected_systems?: string[]
  workaround?: string
  resolution?: string
  root_cause?: string
  reported_by: string
  assigned_to?: string
  reported_date: string
  resolved_date?: string
  impact_description?: string
  steps_to_reproduce?: string
  environment?: string
  tags?: string[]
  related_tickets?: string[]
  created_at: string
  updated_at: string
}

export default function KnownIssuesPage() {
  const params = useParams()
  const router = useRouter()
  const { selectedClient } = useClient()
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [issues, setIssues] = useState<KnownIssue[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [severityFilter, setSeverityFilter] = useState('all')
  const [filteredIssues, setFilteredIssues] = useState<KnownIssue[]>([])

  useEffect(() => {
    fetchOrganization()
    fetchIssues()
  }, [params.id])

  useEffect(() => {
    filterIssues()
  }, [issues, searchTerm, statusFilter, severityFilter])

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

  const fetchIssues = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('known_issues')
        .select('*')
        .eq('organization_id', params.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setIssues(data || [])
    } catch (error) {
      console.error('Error fetching known issues:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterIssues = () => {
    let filtered = issues

    if (searchTerm) {
      filtered = filtered.filter(issue =>
        issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.reported_by.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(issue => issue.status === statusFilter)
    }

    if (severityFilter !== 'all') {
      filtered = filtered.filter(issue => issue.severity === severityFilter)
    }

    setFilteredIssues(filtered)
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
      case 'resolved':
      case 'closed':
        return <CheckCircle className="w-4 h-4 text-green-400" />
      case 'wont_fix':
        return <XCircle className="w-4 h-4 text-gray-400" />
      case 'investigating':
        return <Clock className="w-4 h-4 text-blue-400" />
      case 'workaround_available':
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />
      case 'open':
        return <Bug className="w-4 h-4 text-red-400" />
      default:
        return <Bug className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved':
      case 'closed':
        return 'text-green-400'
      case 'wont_fix':
        return 'text-gray-400'
      case 'investigating':
        return 'text-blue-400'
      case 'workaround_available':
        return 'text-yellow-400'
      case 'open':
        return 'text-red-400'
      default:
        return 'text-gray-400'
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
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

  const getIssueTypeIcon = (type: string) => {
    switch (type) {
      case 'bug':
        return <Bug className="w-4 h-4 text-red-400" />
      case 'security':
        return <AlertTriangle className="w-4 h-4 text-red-400" />
      case 'performance':
        return <Clock className="w-4 h-4 text-yellow-400" />
      default:
        return <Tag className="w-4 h-4 text-gray-400" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const getDaysOpen = (reportedDate: string, resolvedDate?: string) => {
    const start = new Date(reportedDate)
    const end = resolvedDate ? new Date(resolvedDate) : new Date()
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <Header currentPage="Organizations" />
        <div className="flex">
          <Sidebar onItemClick={handleSidebarItemClick} />
          <div className="flex-1 p-6">
            <div className="flex items-center justify-center h-64">
              <div className="text-gray-400">Loading known issues...</div>
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
              <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                <Bug className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold">Known Issues</h1>
                <div className="text-sm text-gray-400">
                  {organization?.name} • {filteredIssues.length} issues
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => router.push(`/organizations/${params.id}/known-issues/new`)}
                className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Report Issue</span>
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
                    placeholder="Search issues..."
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
                  <option value="open">Open</option>
                  <option value="investigating">Investigating</option>
                  <option value="workaround_available">Workaround Available</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                  <option value="wont_fix">Won't Fix</option>
                </select>
                <select
                  value={severityFilter}
                  onChange={(e) => setSeverityFilter(e.target.value)}
                  className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Severity</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              <div className="text-sm text-gray-400">
                {filteredIssues.length} Results
              </div>
            </div>
          </div>

          {/* Issues Table */}
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="text-left p-4 text-sm font-medium text-gray-300">Issue</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-300">Type</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-300">Severity</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-300">Priority</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-300">Status</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-300">Reported By</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-300">Assigned To</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-300">Days Open</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {filteredIssues.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center p-8 text-gray-400">
                        No known issues found
                      </td>
                    </tr>
                  ) : (
                    filteredIssues.map((issue) => (
                      <tr key={issue.id} className="hover:bg-gray-700/50">
                        <td className="p-4">
                          <div className="flex items-center space-x-3">
                            {getIssueTypeIcon(issue.issue_type)}
                            <div>
                              <div className="text-white">{issue.title}</div>
                              <div className="text-xs text-gray-400 truncate max-w-xs">
                                {issue.description}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="capitalize text-gray-300">{issue.issue_type}</span>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${getSeverityColor(issue.severity)}`}>
                            {issue.severity}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${getPriorityColor(issue.priority)}`}>
                            {issue.priority}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(issue.status)}
                            <span className={`capitalize ${getStatusColor(issue.status)}`}>
                              {issue.status.replace('_', ' ')}
                            </span>
                          </div>
                        </td>
                        <td className="p-4 text-gray-300">{issue.reported_by}</td>
                        <td className="p-4 text-gray-300">{issue.assigned_to || '-'}</td>
                        <td className="p-4 text-gray-300">
                          {getDaysOpen(issue.reported_date, issue.resolved_date)} days
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
                <Bug className="w-5 h-5 text-red-400" />
                <div>
                  <div className="text-sm text-gray-400">Open</div>
                  <div className="text-xl font-semibold">
                    {issues.filter(i => i.status === 'open').length}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-blue-400" />
                <div>
                  <div className="text-sm text-gray-400">Investigating</div>
                  <div className="text-xl font-semibold">
                    {issues.filter(i => i.status === 'investigating').length}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-yellow-400" />
                <div>
                  <div className="text-sm text-gray-400">Workaround</div>
                  <div className="text-xl font-semibold">
                    {issues.filter(i => i.status === 'workaround_available').length}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <div>
                  <div className="text-sm text-gray-400">Resolved</div>
                  <div className="text-xl font-semibold">
                    {issues.filter(i => i.status === 'resolved').length}
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
                    {issues.filter(i => i.severity === 'critical').length}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-400">Avg Days Open</div>
                  <div className="text-xl font-semibold">
                    {issues.length > 0 ? Math.round(
                      issues.filter(i => !i.resolved_date).reduce((sum, i) => 
                        sum + getDaysOpen(i.reported_date), 0
                      ) / issues.filter(i => !i.resolved_date).length || 0
                    ) : 0}
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
