'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase, type Organization, type Configuration } from '@/lib/supabase'
import { useClient } from '@/contexts/ClientContext'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'
import DeleteConfirmation from '@/components/DeleteConfirmation'
import {
  Search,
  Download,
  Plus,
  Edit,
  Trash2,
  Eye,
  MoreHorizontal,
  Filter,
  Settings,
  Server,
  Monitor,
  Smartphone,
  Wifi,
  Shield
} from 'lucide-react'

export default function ConfigurationsPage() {
  const params = useParams()
  const router = useRouter()
  const { selectedClient } = useClient()
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [configurations, setConfigurations] = useState<Configuration[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [includeArchived, setIncludeArchived] = useState(false)
  const [filteredConfigurations, setFilteredConfigurations] = useState<Configuration[]>([])
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean
    item: Configuration | null
  }>({ isOpen: false, item: null })

  useEffect(() => {
    fetchOrganization()
    fetchConfigurations()
  }, [params.id])

  useEffect(() => {
    filterConfigurations()
  }, [configurations, searchTerm, includeArchived])

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

  const fetchConfigurations = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('configurations')
        .select('*')
        .eq('organization_id', params.id)
        .order('name')

      if (error) throw error
      setConfigurations(data || [])
    } catch (error) {
      console.error('Error fetching configurations:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterConfigurations = () => {
    let filtered = configurations

    if (searchTerm) {
      filtered = filtered.filter(config =>
        config.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        config.hostname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        config.ip_address?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (!includeArchived) {
      filtered = filtered.filter(config => config.status !== 'deprecated')
    }

    setFilteredConfigurations(filtered)
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

  const handleEdit = (config: Configuration) => {
    router.push(`/organizations/${params.id}/configurations/${config.id}/edit`)
  }

  const handleDelete = (config: Configuration) => {
    setDeleteConfirmation({
      isOpen: true,
      item: config
    })
  }

  const handleDeleteConfirm = () => {
    // Refresh the configurations list
    fetchConfigurations()
  }

  const handleDeleteCancel = () => {
    setDeleteConfirmation({
      isOpen: false,
      item: null
    })
  }

  const getConfigIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'server':
        return <Server className="w-4 h-4 text-blue-400" />
      case 'network':
        return <Wifi className="w-4 h-4 text-green-400" />
      case 'security':
        return <Shield className="w-4 h-4 text-red-400" />
      case 'application':
        return <Monitor className="w-4 h-4 text-purple-400" />
      default:
        return <Settings className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'text-green-400'
      case 'inactive':
        return 'text-red-400'
      case 'maintenance':
        return 'text-yellow-400'
      case 'deprecated':
        return 'text-gray-400'
      default:
        return 'text-gray-400'
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
              <div className="text-gray-400">Loading configurations...</div>
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
                <h1 className="text-2xl font-semibold">Configurations</h1>
                <div className="text-sm text-gray-400">
                  {organization?.name} • {filteredConfigurations.length} configurations
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded text-sm">
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
              <button 
                onClick={() => router.push(`/organizations/${params.id}/configurations/new`)}
                className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>New</span>
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
                    placeholder="Filter columns or Search keywords..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <label className="flex items-center space-x-2 text-sm text-gray-300">
                  <input
                    type="checkbox"
                    checked={includeArchived}
                    onChange={(e) => setIncludeArchived(e.target.checked)}
                    className="rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Include archived</span>
                </label>
              </div>
              <div className="text-sm text-gray-400">
                {filteredConfigurations.length} Results
              </div>
            </div>
          </div>

          {/* Configurations Table */}
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="text-left p-4 text-sm font-medium text-gray-300">
                      <input type="checkbox" className="rounded border-gray-600 bg-gray-700" />
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-gray-300">Name</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-300">Status</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-300">Type</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-300">OS</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-300">Primary IP</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-300">Serial Number</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-300">Expires</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-300">Location</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-300">Contact</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {filteredConfigurations.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="text-center p-8 text-gray-400">
                        No configurations found
                      </td>
                    </tr>
                  ) : (
                    filteredConfigurations.map((config) => (
                      <tr key={config.id} className="hover:bg-gray-700/50">
                        <td className="p-4">
                          <input type="checkbox" className="rounded border-gray-600 bg-gray-700" />
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-3">
                            {getConfigIcon(config.config_type)}
                            <span className="text-white">{config.name}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`capitalize ${getStatusColor(config.status)}`}>
                            {config.status}
                          </span>
                        </td>
                        <td className="p-4 text-gray-300 capitalize">{config.config_type}</td>
                        <td className="p-4 text-gray-300">{config.operating_system || '-'}</td>
                        <td className="p-4 text-gray-300">{config.ip_address || '-'}</td>
                        <td className="p-4 text-gray-300">{config.hostname || '-'}</td>
                        <td className="p-4 text-gray-300">-</td>
                        <td className="p-4 text-gray-300">-</td>
                        <td className="p-4 text-gray-300">-</td>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            <button
                              className="p-1 text-gray-400 hover:text-white"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEdit(config)}
                              className="p-1 text-gray-400 hover:text-blue-400"
                              title="Edit Configuration"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(config)}
                              className="p-1 text-gray-400 hover:text-red-400"
                              title="Delete Configuration"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <button
                              className="p-1 text-gray-400 hover:text-white"
                              title="More Options"
                            >
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
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmation
        isOpen={deleteConfirmation.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Configuration"
        message="Are you sure you want to delete this configuration? This action cannot be undone."
        itemName={deleteConfirmation.item?.name}
        tableName="configurations"
        itemId={deleteConfirmation.item?.id}
      />
    </div>
  )
}
