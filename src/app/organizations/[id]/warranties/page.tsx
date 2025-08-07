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
  Shield,
  Calendar,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Package,
  DollarSign
} from 'lucide-react'

interface Warranty {
  id: string
  organization_id: string
  asset_name: string
  manufacturer: string
  model: string
  serial_number: string
  warranty_type: 'hardware' | 'software' | 'extended' | 'maintenance'
  warranty_provider: string
  purchase_date: string
  warranty_start_date: string
  warranty_end_date: string
  warranty_duration_months: number
  coverage_type: 'full' | 'parts_only' | 'labor_only' | 'limited'
  service_level: 'next_business_day' | '4_hour' | '8_hour' | '24_hour' | 'best_effort'
  warranty_cost?: number
  renewal_cost?: number
  auto_renewal: boolean
  contact_name?: string
  contact_phone?: string
  contact_email?: string
  warranty_document_url?: string
  notes?: string
  status: 'active' | 'expired' | 'expiring_soon' | 'cancelled'
  created_at: string
  updated_at: string
}

export default function WarrantiesPage() {
  const params = useParams()
  const router = useRouter()
  const { selectedClient } = useClient()
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [warranties, setWarranties] = useState<Warranty[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [filteredWarranties, setFilteredWarranties] = useState<Warranty[]>([])

  useEffect(() => {
    fetchOrganization()
    fetchWarranties()
  }, [params.id])

  useEffect(() => {
    filterWarranties()
  }, [warranties, searchTerm, statusFilter])

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

  const fetchWarranties = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('warranties')
        .select('*')
        .eq('organization_id', params.id)
        .order('warranty_end_date')

      if (error) throw error
      
      // Calculate status based on warranty end date
      const warrantiesToUpdate = (data || []).map(warranty => {
        const endDate = new Date(warranty.warranty_end_date)
        const today = new Date()
        const daysUntilExpiry = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        
        let status = warranty.status
        if (daysUntilExpiry < 0) {
          status = 'expired'
        } else if (daysUntilExpiry <= 30) {
          status = 'expiring_soon'
        } else {
          status = 'active'
        }
        
        return { ...warranty, status }
      })
      
      setWarranties(warrantiesToUpdate)
    } catch (error) {
      console.error('Error fetching warranties:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterWarranties = () => {
    let filtered = warranties

    if (searchTerm) {
      filtered = filtered.filter(warranty =>
        warranty.asset_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        warranty.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        warranty.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        warranty.serial_number.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(warranty => warranty.status === statusFilter)
    }

    setFilteredWarranties(filtered)
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
      case 'expired':
        return <XCircle className="w-4 h-4 text-red-400" />
      case 'expiring_soon':
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-gray-400" />
      default:
        return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-400'
      case 'expired':
        return 'text-red-400'
      case 'expiring_soon':
        return 'text-yellow-400'
      case 'cancelled':
        return 'text-gray-400'
      default:
        return 'text-gray-400'
    }
  }

  const getWarrantyTypeColor = (type: string) => {
    switch (type) {
      case 'hardware':
        return 'text-blue-400 bg-blue-900/20'
      case 'software':
        return 'text-green-400 bg-green-900/20'
      case 'extended':
        return 'text-purple-400 bg-purple-900/20'
      case 'maintenance':
        return 'text-orange-400 bg-orange-900/20'
      default:
        return 'text-gray-400 bg-gray-900/20'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const getDaysUntilExpiry = (expiryDate: string) => {
    const today = new Date()
    const expiry = new Date(expiryDate)
    const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysUntilExpiry < 0) {
      return `Expired ${Math.abs(daysUntilExpiry)} days ago`
    } else if (daysUntilExpiry === 0) {
      return 'Expires today'
    } else {
      return `${daysUntilExpiry} days`
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
              <div className="text-gray-400">Loading warranties...</div>
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
              <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold">Warranties - Ungrouped</h1>
                <div className="text-sm text-gray-400">
                  {organization?.name} • {filteredWarranties.length} warranties
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded text-sm">
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
              <button 
                onClick={() => router.push(`/organizations/${params.id}/warranties/new`)}
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
                    placeholder="Search warranties..."
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
                  <option value="expiring_soon">Expiring Soon</option>
                  <option value="expired">Expired</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div className="text-sm text-gray-400">
                {filteredWarranties.length} Results
              </div>
            </div>
          </div>

          {/* Warranties Table */}
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="text-left p-4 text-sm font-medium text-gray-300">Asset</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-300">Manufacturer</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-300">Model</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-300">Serial Number</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-300">Type</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-300">Provider</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-300">End Date</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-300">Days Left</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-300">Status</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {filteredWarranties.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="text-center p-8 text-gray-400">
                        No warranties found
                      </td>
                    </tr>
                  ) : (
                    filteredWarranties.map((warranty) => (
                      <tr key={warranty.id} className="hover:bg-gray-700/50">
                        <td className="p-4">
                          <div className="flex items-center space-x-3">
                            <Package className="w-4 h-4 text-blue-400" />
                            <span className="text-white">{warranty.asset_name}</span>
                          </div>
                        </td>
                        <td className="p-4 text-gray-300">{warranty.manufacturer}</td>
                        <td className="p-4 text-gray-300">{warranty.model}</td>
                        <td className="p-4 text-gray-300 font-mono text-sm">{warranty.serial_number}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${getWarrantyTypeColor(warranty.warranty_type)}`}>
                            {warranty.warranty_type}
                          </span>
                        </td>
                        <td className="p-4 text-gray-300">{warranty.warranty_provider}</td>
                        <td className="p-4 text-gray-300">{formatDate(warranty.warranty_end_date)}</td>
                        <td className="p-4">
                          <span className={`text-sm ${
                            getDaysUntilExpiry(warranty.warranty_end_date).includes('Expired') ? 'text-red-400' :
                            getDaysUntilExpiry(warranty.warranty_end_date).includes('today') ? 'text-red-400' :
                            parseInt(getDaysUntilExpiry(warranty.warranty_end_date)) <= 30 ? 'text-yellow-400' :
                            'text-gray-300'
                          }`}>
                            {getDaysUntilExpiry(warranty.warranty_end_date)}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(warranty.status)}
                            <span className={`capitalize ${getStatusColor(warranty.status)}`}>
                              {warranty.status.replace('_', ' ')}
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <div>
                  <div className="text-sm text-gray-400">Active</div>
                  <div className="text-xl font-semibold">
                    {warranties.filter(w => w.status === 'active').length}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-yellow-400" />
                <div>
                  <div className="text-sm text-gray-400">Expiring Soon</div>
                  <div className="text-xl font-semibold">
                    {warranties.filter(w => w.status === 'expiring_soon').length}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <XCircle className="w-5 h-5 text-red-400" />
                <div>
                  <div className="text-sm text-gray-400">Expired</div>
                  <div className="text-xl font-semibold">
                    {warranties.filter(w => w.status === 'expired').length}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5 text-green-400" />
                <div>
                  <div className="text-sm text-gray-400">Total Value</div>
                  <div className="text-lg font-semibold">
                    {formatCurrency(
                      warranties.reduce((sum, w) => sum + (w.warranty_cost || 0), 0)
                    )}
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
