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
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Settings,
  Users,
  Bell
} from 'lucide-react'

interface MaintenanceWindow {
  id: string
  organization_id: string
  title: string
  description: string
  maintenance_type: 'scheduled' | 'emergency' | 'routine' | 'upgrade' | 'patch'
  priority: 'low' | 'medium' | 'high' | 'critical'
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'postponed'
  start_time: string
  end_time: string
  estimated_duration_minutes: number
  actual_duration_minutes?: number
  affected_systems: string[]
  impact_description: string
  maintenance_steps?: string
  rollback_plan?: string
  assigned_technician: string
  backup_technician?: string
  approval_required: boolean
  approved_by?: string
  approval_date?: string
  notification_sent: boolean
  notification_recipients?: string[]
  downtime_expected: boolean
  customer_notification_required: boolean
  post_maintenance_verification?: string
  notes?: string
  created_by: string
  created_at: string
  updated_at: string
}

export default function MaintenanceWindowsPage() {
  const params = useParams()
  const router = useRouter()
  const { selectedClient } = useClient()
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [maintenanceWindows, setMaintenanceWindows] = useState<MaintenanceWindow[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [filteredWindows, setFilteredWindows] = useState<MaintenanceWindow[]>([])

  useEffect(() => {
    fetchOrganization()
    fetchMaintenanceWindows()
  }, [params.id])

  useEffect(() => {
    filterWindows()
  }, [maintenanceWindows, searchTerm, statusFilter, typeFilter])

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

  const fetchMaintenanceWindows = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('maintenance_windows')
        .select('*')
        .eq('organization_id', params.id)
        .order('start_time', { ascending: false })

      if (error) throw error
      setMaintenanceWindows(data || [])
    } catch (error) {
      console.error('Error fetching maintenance windows:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterWindows = () => {
    let filtered = maintenanceWindows

    if (searchTerm) {
      filtered = filtered.filter(window =>
        window.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        window.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        window.assigned_technician.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(window => window.status === statusFilter)
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(window => window.maintenance_type === typeFilter)
    }

    setFilteredWindows(filtered)
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
        return <XCircle className="w-4 h-4 text-red-400" />
      case 'postponed':
        return <XCircle className="w-4 h-4 text-yellow-400" />
      case 'in_progress':
        return <Settings className="w-4 h-4 text-blue-400 animate-spin" />
      case 'scheduled':
        return <Calendar className="w-4 h-4 text-yellow-400" />
      default:
        return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-400'
      case 'cancelled':
        return 'text-red-400'
      case 'postponed':
        return 'text-yellow-400'
      case 'in_progress':
        return 'text-blue-400'
      case 'scheduled':
        return 'text-yellow-400'
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

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'emergency':
        return 'text-red-400 bg-red-900/20'
      case 'upgrade':
        return 'text-blue-400 bg-blue-900/20'
      case 'patch':
        return 'text-purple-400 bg-purple-900/20'
      case 'routine':
        return 'text-green-400 bg-green-900/20'
      case 'scheduled':
        return 'text-yellow-400 bg-yellow-900/20'
      default:
        return 'text-gray-400 bg-gray-900/20'
    }
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

  const isUpcoming = (startTime: string) => {
    return new Date(startTime) > new Date()
  }

  const isOverdue = (endTime: string, status: string) => {
    return new Date(endTime) < new Date() && status === 'scheduled'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <Header currentPage="Organizations" />
        <div className="flex">
          <Sidebar onItemClick={handleSidebarItemClick} />
          <div className="flex-1 p-6">
            <div className="flex items-center justify-center h-64">
              <div className="text-gray-400">Loading maintenance windows...</div>
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
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold">Maintenance Windows</h1>
                <div className="text-sm text-gray-400">
                  {organization?.name} • {filteredWindows.length} windows
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => router.push(`/organizations/${params.id}/maintenance-windows/new`)}
                className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Schedule Maintenance</span>
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
                    placeholder="Search maintenance windows..."
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
                  <option value="scheduled">Scheduled</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="postponed">Postponed</option>
                </select>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Types</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="emergency">Emergency</option>
                  <option value="routine">Routine</option>
                  <option value="upgrade">Upgrade</option>
                  <option value="patch">Patch</option>
                </select>
              </div>
              <div className="text-sm text-gray-400">
                {filteredWindows.length} Results
              </div>
            </div>
          </div>

          {/* Maintenance Windows Table */}
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="text-left p-4 text-sm font-medium text-gray-300">Title</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-300">Type</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-300">Priority</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-300">Status</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-300">Start Time</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-300">Duration</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-300">Technician</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-300">Downtime</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {filteredWindows.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center p-8 text-gray-400">
                        No maintenance windows found
                      </td>
                    </tr>
                  ) : (
                    filteredWindows.map((window) => (
                      <tr key={window.id} className={`hover:bg-gray-700/50 ${
                        isOverdue(window.end_time, window.status) ? 'bg-red-900/10' : ''
                      }`}>
                        <td className="p-4">
                          <div className="flex items-center space-x-3">
                            <Settings className="w-4 h-4 text-blue-400" />
                            <div>
                              <div className="text-white">{window.title}</div>
                              <div className="text-xs text-gray-400 truncate max-w-xs">
                                {window.description}
                              </div>
                              {isUpcoming(window.start_time) && window.status === 'scheduled' && (
                                <div className="text-xs text-blue-400">Upcoming</div>
                              )}
                              {isOverdue(window.end_time, window.status) && (
                                <div className="text-xs text-red-400">Overdue</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${getTypeColor(window.maintenance_type)}`}>
                            {window.maintenance_type}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${getPriorityColor(window.priority)}`}>
                            {window.priority}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(window.status)}
                            <span className={`capitalize ${getStatusColor(window.status)}`}>
                              {window.status.replace('_', ' ')}
                            </span>
                          </div>
                        </td>
                        <td className="p-4 text-gray-300 text-sm">
                          {formatDateTime(window.start_time)}
                        </td>
                        <td className="p-4 text-gray-300">
                          <div>
                            <div>Est: {formatDuration(window.estimated_duration_minutes)}</div>
                            {window.actual_duration_minutes && (
                              <div className="text-xs text-gray-400">
                                Act: {formatDuration(window.actual_duration_minutes)}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-gray-300">
                          <div>
                            <div>{window.assigned_technician}</div>
                            {window.backup_technician && (
                              <div className="text-xs text-gray-400">
                                Backup: {window.backup_technician}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          {window.downtime_expected ? (
                            <div className="flex items-center space-x-1">
                              <AlertTriangle className="w-4 h-4 text-yellow-400" />
                              <span className="text-yellow-400 text-sm">Yes</span>
                            </div>
                          ) : (
                            <span className="text-green-400 text-sm">No</span>
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
                            {window.customer_notification_required && !window.notification_sent && (
                              <button className="p-1 text-yellow-400 hover:text-yellow-300">
                                <Bell className="w-4 h-4" />
                              </button>
                            )}
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
                <Calendar className="w-5 h-5 text-yellow-400" />
                <div>
                  <div className="text-sm text-gray-400">Scheduled</div>
                  <div className="text-xl font-semibold">
                    {maintenanceWindows.filter(w => w.status === 'scheduled').length}
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
                    {maintenanceWindows.filter(w => w.status === 'in_progress').length}
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
                    {maintenanceWindows.filter(w => w.status === 'completed').length}
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
                    {maintenanceWindows.filter(w => w.maintenance_type === 'emergency').length}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Bell className="w-5 h-5 text-yellow-400" />
                <div>
                  <div className="text-sm text-gray-400">Pending Notification</div>
                  <div className="text-xl font-semibold">
                    {maintenanceWindows.filter(w => w.customer_notification_required && !w.notification_sent).length}
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
