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
  Shield,
  Smartphone,
  Key,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  User,
  Mail,
  QrCode
} from 'lucide-react'

interface MFAConfiguration {
  id: string
  organization_id: string
  service_name: string
  service_type: 'email' | 'application' | 'website' | 'vpn' | 'server' | 'database' | 'cloud_service'
  mfa_method: 'totp' | 'sms' | 'email' | 'hardware_token' | 'push_notification' | 'backup_codes'
  provider: string
  account_identifier: string
  secret_key?: string
  backup_codes?: string[]
  recovery_email?: string
  recovery_phone?: string
  status: 'active' | 'inactive' | 'pending_setup' | 'disabled'
  last_used?: string
  setup_date: string
  expiry_date?: string
  assigned_to: string
  shared_account: boolean
  notes?: string
  qr_code_url?: string
  device_name?: string
  created_at: string
  updated_at: string
}

export default function MFAPage() {
  const params = useParams()
  const router = useRouter()
  const { selectedClient } = useClient()
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [mfaConfigs, setMfaConfigs] = useState<MFAConfiguration[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [methodFilter, setMethodFilter] = useState('all')
  const [filteredConfigs, setFilteredConfigs] = useState<MFAConfiguration[]>([])

  useEffect(() => {
    fetchOrganization()
    fetchMFAConfigs()
  }, [params.id])

  useEffect(() => {
    filterConfigs()
  }, [mfaConfigs, searchTerm, statusFilter, methodFilter])

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

  const fetchMFAConfigs = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('mfa_configurations')
        .select('*')
        .eq('organization_id', params.id)
        .order('service_name')

      if (error) throw error
      setMfaConfigs(data || [])
    } catch (error) {
      console.error('Error fetching MFA configurations:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterConfigs = () => {
    let filtered = mfaConfigs

    if (searchTerm) {
      filtered = filtered.filter(config =>
        config.service_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        config.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
        config.account_identifier.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(config => config.status === statusFilter)
    }

    if (methodFilter !== 'all') {
      filtered = filtered.filter(config => config.mfa_method === methodFilter)
    }

    setFilteredConfigs(filtered)
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
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-400" />
      case 'inactive':
        return <XCircle className="w-4 h-4 text-gray-400" />
      case 'disabled':
        return <XCircle className="w-4 h-4 text-red-400" />
      case 'pending_setup':
        return <Clock className="w-4 h-4 text-yellow-400" />
      default:
        return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-400'
      case 'inactive':
        return 'text-gray-400'
      case 'disabled':
        return 'text-red-400'
      case 'pending_setup':
        return 'text-yellow-400'
      default:
        return 'text-gray-400'
    }
  }

  const getMFAMethodIcon = (method: string) => {
    switch (method) {
      case 'totp':
        return <Smartphone className="w-4 h-4 text-blue-400" />
      case 'sms':
        return <Smartphone className="w-4 h-4 text-green-400" />
      case 'email':
        return <Mail className="w-4 h-4 text-purple-400" />
      case 'hardware_token':
        return <Key className="w-4 h-4 text-orange-400" />
      case 'push_notification':
        return <Smartphone className="w-4 h-4 text-indigo-400" />
      case 'backup_codes':
        return <QrCode className="w-4 h-4 text-gray-400" />
      default:
        return <Shield className="w-4 h-4 text-gray-400" />
    }
  }

  const getMFAMethodColor = (method: string) => {
    switch (method) {
      case 'totp':
        return 'text-blue-400 bg-blue-900/20'
      case 'sms':
        return 'text-green-400 bg-green-900/20'
      case 'email':
        return 'text-purple-400 bg-purple-900/20'
      case 'hardware_token':
        return 'text-orange-400 bg-orange-900/20'
      case 'push_notification':
        return 'text-indigo-400 bg-indigo-900/20'
      case 'backup_codes':
        return 'text-gray-400 bg-gray-900/20'
      default:
        return 'text-gray-400 bg-gray-900/20'
    }
  }

  const getServiceTypeIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <Mail className="w-4 h-4 text-blue-400" />
      case 'cloud_service':
        return <Shield className="w-4 h-4 text-purple-400" />
      case 'vpn':
        return <Shield className="w-4 h-4 text-green-400" />
      default:
        return <Shield className="w-4 h-4 text-gray-400" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const isExpiringSoon = (expiryDate?: string) => {
    if (!expiryDate) return false
    const expiry = new Date(expiryDate)
    const today = new Date()
    const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0
  }

  const isExpired = (expiryDate?: string) => {
    if (!expiryDate) return false
    return new Date(expiryDate) < new Date()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <Header currentPage="Organizations" />
        <div className="flex">
          <Sidebar onItemClick={handleSidebarItemClick} />
          <div className="flex-1 p-6">
            <div className="flex items-center justify-center h-64">
              <div className="text-gray-400">Loading MFA configurations...</div>
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
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold">Multi Factor Authentication</h1>
                <div className="text-sm text-gray-400">
                  {organization?.name} • {filteredConfigs.length} configurations
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => router.push(`/organizations/${params.id}/mfa/new`)}
                className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add MFA</span>
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
                    placeholder="Search MFA configurations..."
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
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="pending_setup">Pending Setup</option>
                  <option value="disabled">Disabled</option>
                </select>
                <select
                  value={methodFilter}
                  onChange={(e) => setMethodFilter(e.target.value)}
                  className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Methods</option>
                  <option value="totp">TOTP</option>
                  <option value="sms">SMS</option>
                  <option value="email">Email</option>
                  <option value="hardware_token">Hardware Token</option>
                  <option value="push_notification">Push Notification</option>
                  <option value="backup_codes">Backup Codes</option>
                </select>
              </div>
              <div className="text-sm text-gray-400">
                {filteredConfigs.length} Results
              </div>
            </div>
          </div>

          {/* MFA Configurations Table */}
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="text-left p-4 text-sm font-medium text-gray-300">Service</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-300">Type</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-300">MFA Method</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-300">Provider</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-300">Account</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-300">Status</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-300">Assigned To</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-300">Last Used</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {filteredConfigs.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center p-8 text-gray-400">
                        No MFA configurations found
                      </td>
                    </tr>
                  ) : (
                    filteredConfigs.map((config) => (
                      <tr key={config.id} className={`hover:bg-gray-700/50 ${
                        isExpired(config.expiry_date) ? 'bg-red-900/10' : 
                        isExpiringSoon(config.expiry_date) ? 'bg-yellow-900/10' : ''
                      }`}>
                        <td className="p-4">
                          <div className="flex items-center space-x-3">
                            {getServiceTypeIcon(config.service_type)}
                            <div>
                              <div className="text-white">{config.service_name}</div>
                              {config.shared_account && (
                                <div className="text-xs text-blue-400">Shared Account</div>
                              )}
                              {isExpired(config.expiry_date) && (
                                <div className="text-xs text-red-400">Expired</div>
                              )}
                              {isExpiringSoon(config.expiry_date) && (
                                <div className="text-xs text-yellow-400">Expiring Soon</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="capitalize text-gray-300">{config.service_type.replace('_', ' ')}</span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            {getMFAMethodIcon(config.mfa_method)}
                            <span className={`px-2 py-1 rounded text-xs font-medium uppercase ${getMFAMethodColor(config.mfa_method)}`}>
                              {config.mfa_method.replace('_', ' ')}
                            </span>
                          </div>
                        </td>
                        <td className="p-4 text-gray-300">{config.provider}</td>
                        <td className="p-4">
                          <div className="text-gray-300 font-mono text-sm">
                            {config.account_identifier}
                          </div>
                          {config.device_name && (
                            <div className="text-xs text-gray-400">{config.device_name}</div>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(config.status)}
                            <span className={`capitalize ${getStatusColor(config.status)}`}>
                              {config.status.replace('_', ' ')}
                            </span>
                          </div>
                        </td>
                        <td className="p-4 text-gray-300">{config.assigned_to}</td>
                        <td className="p-4 text-gray-300 text-sm">
                          {config.last_used ? formatDateTime(config.last_used) : 'Never'}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            <button className="p-1 text-gray-400 hover:text-white">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="p-1 text-gray-400 hover:text-white">
                              <Edit className="w-4 h-4" />
                            </button>
                            {config.mfa_method === 'totp' && config.qr_code_url && (
                              <button className="p-1 text-blue-400 hover:text-blue-300">
                                <QrCode className="w-4 h-4" />
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
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mt-6">
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <div>
                  <div className="text-sm text-gray-400">Active</div>
                  <div className="text-xl font-semibold">
                    {mfaConfigs.filter(c => c.status === 'active').length}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Smartphone className="w-5 h-5 text-blue-400" />
                <div>
                  <div className="text-sm text-gray-400">TOTP</div>
                  <div className="text-xl font-semibold">
                    {mfaConfigs.filter(c => c.mfa_method === 'totp').length}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Smartphone className="w-5 h-5 text-green-400" />
                <div>
                  <div className="text-sm text-gray-400">SMS</div>
                  <div className="text-xl font-semibold">
                    {mfaConfigs.filter(c => c.mfa_method === 'sms').length}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Key className="w-5 h-5 text-orange-400" />
                <div>
                  <div className="text-sm text-gray-400">Hardware</div>
                  <div className="text-xl font-semibold">
                    {mfaConfigs.filter(c => c.mfa_method === 'hardware_token').length}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-yellow-400" />
                <div>
                  <div className="text-sm text-gray-400">Pending</div>
                  <div className="text-xl font-semibold">
                    {mfaConfigs.filter(c => c.status === 'pending_setup').length}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <div>
                  <div className="text-sm text-gray-400">Expiring</div>
                  <div className="text-xl font-semibold">
                    {mfaConfigs.filter(c => isExpiringSoon(c.expiry_date) || isExpired(c.expiry_date)).length}
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
