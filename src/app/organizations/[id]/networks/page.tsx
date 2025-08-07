'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase, type Organization } from '@/lib/supabase'
import { useClient } from '@/contexts/ClientContext'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'
import {
  Search,
  Download,
  Plus,
  Edit,
  Trash2,
  Eye,
  MoreHorizontal,
  Network,
  Wifi,
  Router,
  Shield,
  Globe,
  Server,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react'

interface NetworkConfig {
  id: string
  organization_id: string
  network_name: string
  network_type: 'lan' | 'wan' | 'wifi' | 'vpn' | 'dmz' | 'guest' | 'management'
  subnet: string
  subnet_mask: string
  gateway: string
  dns_primary?: string
  dns_secondary?: string
  dhcp_enabled: boolean
  dhcp_range_start?: string
  dhcp_range_end?: string
  vlan_id?: number
  description?: string
  location?: string
  status: 'active' | 'inactive' | 'maintenance' | 'planned'
  security_level: 'public' | 'internal' | 'restricted' | 'confidential'
  firewall_rules?: string[]
  monitoring_enabled: boolean
  bandwidth_limit?: string
  qos_enabled: boolean
  backup_gateway?: string
  network_devices?: string[]
  documentation_url?: string
  contact_person?: string
  notes?: string
  created_at: string
  updated_at: string
}

export default function NetworksPage() {
  const params = useParams()
  const router = useRouter()
  const { selectedClient } = useClient()
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [networks, setNetworks] = useState<NetworkConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [filteredNetworks, setFilteredNetworks] = useState<NetworkConfig[]>([])

  useEffect(() => {
    fetchOrganization()
    fetchNetworks()
  }, [params.id])

  useEffect(() => {
    filterNetworks()
  }, [networks, searchTerm, typeFilter, statusFilter])

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

  const fetchNetworks = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('networks')
        .select('*')
        .eq('organization_id', params.id)
        .order('network_name')

      if (error) throw error
      setNetworks(data || [])
    } catch (error) {
      console.error('Error fetching networks:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterNetworks = () => {
    let filtered = networks

    if (searchTerm) {
      filtered = filtered.filter(network =>
        network.network_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        network.subnet.toLowerCase().includes(searchTerm.toLowerCase()) ||
        network.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(network => network.network_type === typeFilter)
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(network => network.status === statusFilter)
    }

    setFilteredNetworks(filtered)
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

  const getNetworkTypeIcon = (type: string) => {
    switch (type) {
      case 'wifi':
        return <Wifi className="w-4 h-4 text-blue-400" />
      case 'wan':
        return <Globe className="w-4 h-4 text-green-400" />
      case 'vpn':
        return <Shield className="w-4 h-4 text-purple-400" />
      case 'dmz':
        return <Shield className="w-4 h-4 text-orange-400" />
      case 'management':
        return <Server className="w-4 h-4 text-indigo-400" />
      case 'guest':
        return <Wifi className="w-4 h-4 text-yellow-400" />
      default:
        return <Network className="w-4 h-4 text-gray-400" />
    }
  }

  const getNetworkTypeColor = (type: string) => {
    switch (type) {
      case 'wifi':
        return 'text-blue-400 bg-blue-900/20'
      case 'wan':
        return 'text-green-400 bg-green-900/20'
      case 'vpn':
        return 'text-purple-400 bg-purple-900/20'
      case 'dmz':
        return 'text-orange-400 bg-orange-900/20'
      case 'management':
        return 'text-indigo-400 bg-indigo-900/20'
      case 'guest':
        return 'text-yellow-400 bg-yellow-900/20'
      default:
        return 'text-gray-400 bg-gray-900/20'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-400" />
      case 'inactive':
        return <XCircle className="w-4 h-4 text-gray-400" />
      case 'maintenance':
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />
      case 'planned':
        return <AlertTriangle className="w-4 h-4 text-blue-400" />
      default:
        return <XCircle className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-400'
      case 'inactive':
        return 'text-gray-400'
      case 'maintenance':
        return 'text-yellow-400'
      case 'planned':
        return 'text-blue-400'
      default:
        return 'text-gray-400'
    }
  }

  const getSecurityLevelColor = (level: string) => {
    switch (level) {
      case 'confidential':
        return 'text-red-400 bg-red-900/20'
      case 'restricted':
        return 'text-orange-400 bg-orange-900/20'
      case 'internal':
        return 'text-yellow-400 bg-yellow-900/20'
      case 'public':
        return 'text-green-400 bg-green-900/20'
      default:
        return 'text-gray-400 bg-gray-900/20'
    }
  }

  const calculateNetworkSize = (subnetMask: string) => {
    const maskBits = subnetMask.split('.').reduce((acc, octet) => {
      return acc + (parseInt(octet).toString(2).match(/1/g) || []).length
    }, 0)
    return Math.pow(2, 32 - maskBits) - 2 // Subtract network and broadcast addresses
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <Header currentPage="Organizations" />
        <div className="flex">
          <Sidebar onItemClick={handleSidebarItemClick} />
          <div className="flex-1 p-6">
            <div className="flex items-center justify-center h-64">
              <div className="text-gray-400">Loading networks...</div>
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
                <Network className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold">Networks</h1>
                <div className="text-sm text-gray-400">
                  {organization?.name} • {filteredNetworks.length} networks
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded text-sm">
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
              <button 
                onClick={() => router.push(`/organizations/${params.id}/networks/new`)}
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
                    placeholder="Search networks..."
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
                  <option value="lan">LAN</option>
                  <option value="wan">WAN</option>
                  <option value="wifi">WiFi</option>
                  <option value="vpn">VPN</option>
                  <option value="dmz">DMZ</option>
                  <option value="guest">Guest</option>
                  <option value="management">Management</option>
                </select>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="planned">Planned</option>
                </select>
              </div>
              <div className="text-sm text-gray-400">
                {filteredNetworks.length} Results
              </div>
            </div>
          </div>

          {/* Networks Table */}
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="text-left p-4 text-sm font-medium text-gray-300">Network Name</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-300">Type</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-300">Subnet</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-300">Gateway</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-300">DHCP</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-300">VLAN</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-300">Security</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-300">Status</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {filteredNetworks.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center p-8 text-gray-400">
                        No networks found
                      </td>
                    </tr>
                  ) : (
                    filteredNetworks.map((network) => (
                      <tr key={network.id} className="hover:bg-gray-700/50">
                        <td className="p-4">
                          <div className="flex items-center space-x-3">
                            {getNetworkTypeIcon(network.network_type)}
                            <div>
                              <div className="text-white">{network.network_name}</div>
                              {network.description && (
                                <div className="text-xs text-gray-400 truncate max-w-xs">
                                  {network.description}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium uppercase ${getNetworkTypeColor(network.network_type)}`}>
                            {network.network_type}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="font-mono text-sm">
                            <div className="text-white">{network.subnet}</div>
                            <div className="text-xs text-gray-400">
                              /{network.subnet_mask} ({calculateNetworkSize(network.subnet_mask)} hosts)
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="font-mono text-sm text-gray-300">
                            {network.gateway}
                          </div>
                        </td>
                        <td className="p-4">
                          {network.dhcp_enabled ? (
                            <div>
                              <div className="flex items-center space-x-1">
                                <CheckCircle className="w-3 h-3 text-green-400" />
                                <span className="text-green-400 text-sm">Enabled</span>
                              </div>
                              {network.dhcp_range_start && network.dhcp_range_end && (
                                <div className="text-xs text-gray-400 font-mono">
                                  {network.dhcp_range_start} - {network.dhcp_range_end}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="flex items-center space-x-1">
                              <XCircle className="w-3 h-3 text-gray-400" />
                              <span className="text-gray-400 text-sm">Disabled</span>
                            </div>
                          )}
                        </td>
                        <td className="p-4 text-gray-300">
                          {network.vlan_id ? `VLAN ${network.vlan_id}` : '-'}
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${getSecurityLevelColor(network.security_level)}`}>
                            {network.security_level}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(network.status)}
                            <span className={`capitalize ${getStatusColor(network.status)}`}>
                              {network.status}
                            </span>
                          </div>
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
                <CheckCircle className="w-5 h-5 text-green-400" />
                <div>
                  <div className="text-sm text-gray-400">Active</div>
                  <div className="text-xl font-semibold">
                    {networks.filter(n => n.status === 'active').length}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Network className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-400">LAN</div>
                  <div className="text-xl font-semibold">
                    {networks.filter(n => n.network_type === 'lan').length}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Wifi className="w-5 h-5 text-blue-400" />
                <div>
                  <div className="text-sm text-gray-400">WiFi</div>
                  <div className="text-xl font-semibold">
                    {networks.filter(n => n.network_type === 'wifi').length}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-purple-400" />
                <div>
                  <div className="text-sm text-gray-400">VPN</div>
                  <div className="text-xl font-semibold">
                    {networks.filter(n => n.network_type === 'vpn').length}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <div>
                  <div className="text-sm text-gray-400">DHCP Enabled</div>
                  <div className="text-xl font-semibold">
                    {networks.filter(n => n.dhcp_enabled).length}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-yellow-400" />
                <div>
                  <div className="text-sm text-gray-400">Maintenance</div>
                  <div className="text-xl font-semibold">
                    {networks.filter(n => n.status === 'maintenance').length}
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
