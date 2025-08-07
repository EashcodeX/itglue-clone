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
  Lock,
  Unlock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Globe,
  Calendar,
  ExternalLink
} from 'lucide-react'

interface SSLCertificate {
  id: string
  organization_id: string
  domain_name: string
  certificate_name: string
  certificate_type: 'domain_validated' | 'organization_validated' | 'extended_validation' | 'wildcard' | 'multi_domain'
  issuer: string
  subject: string
  serial_number: string
  algorithm: string
  key_size: number
  issued_date: string
  expiry_date: string
  auto_renewal: boolean
  renewal_provider?: string
  certificate_authority: string
  intermediate_ca?: string
  root_ca?: string
  san_domains?: string[]
  status: 'valid' | 'expired' | 'expiring_soon' | 'revoked' | 'pending_validation'
  validation_method: 'dns' | 'http' | 'email'
  cost?: number
  renewal_cost?: number
  contact_email?: string
  certificate_path?: string
  private_key_path?: string
  installation_notes?: string
  monitoring_enabled: boolean
  last_checked?: string
  created_at: string
  updated_at: string
}

export default function SSLTrackerPage() {
  const params = useParams()
  const router = useRouter()
  const { selectedClient } = useClient()
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [certificates, setCertificates] = useState<SSLCertificate[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [filteredCertificates, setFilteredCertificates] = useState<SSLCertificate[]>([])

  useEffect(() => {
    fetchOrganization()
    fetchCertificates()
  }, [params.id])

  useEffect(() => {
    filterCertificates()
  }, [certificates, searchTerm, statusFilter, typeFilter])

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

  const fetchCertificates = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('ssl_certificates')
        .select('*')
        .eq('organization_id', params.id)
        .order('expiry_date')

      if (error) throw error
      
      // Calculate status based on expiry date
      const certificatesToUpdate = (data || []).map(cert => {
        const expiryDate = new Date(cert.expiry_date)
        const today = new Date()
        const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        
        let status = cert.status
        if (daysUntilExpiry < 0) {
          status = 'expired'
        } else if (daysUntilExpiry <= 30) {
          status = 'expiring_soon'
        } else if (cert.status !== 'revoked' && cert.status !== 'pending_validation') {
          status = 'valid'
        }
        
        return { ...cert, status }
      })
      
      setCertificates(certificatesToUpdate)
    } catch (error) {
      console.error('Error fetching SSL certificates:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterCertificates = () => {
    let filtered = certificates

    if (searchTerm) {
      filtered = filtered.filter(cert =>
        cert.domain_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.certificate_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.issuer.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(cert => cert.status === statusFilter)
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(cert => cert.certificate_type === typeFilter)
    }

    setFilteredCertificates(filtered)
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
      case 'valid':
        return <CheckCircle className="w-4 h-4 text-green-400" />
      case 'expired':
        return <XCircle className="w-4 h-4 text-red-400" />
      case 'expiring_soon':
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />
      case 'revoked':
        return <XCircle className="w-4 h-4 text-red-400" />
      case 'pending_validation':
        return <Clock className="w-4 h-4 text-blue-400" />
      default:
        return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'valid':
        return 'text-green-400'
      case 'expired':
        return 'text-red-400'
      case 'expiring_soon':
        return 'text-yellow-400'
      case 'revoked':
        return 'text-red-400'
      case 'pending_validation':
        return 'text-blue-400'
      default:
        return 'text-gray-400'
    }
  }

  const getCertificateTypeColor = (type: string) => {
    switch (type) {
      case 'extended_validation':
        return 'text-green-400 bg-green-900/20'
      case 'organization_validated':
        return 'text-blue-400 bg-blue-900/20'
      case 'domain_validated':
        return 'text-yellow-400 bg-yellow-900/20'
      case 'wildcard':
        return 'text-purple-400 bg-purple-900/20'
      case 'multi_domain':
        return 'text-indigo-400 bg-indigo-900/20'
      default:
        return 'text-gray-400 bg-gray-900/20'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <Header currentPage="Organizations" />
        <div className="flex">
          <Sidebar onItemClick={handleSidebarItemClick} />
          <div className="flex-1 p-6">
            <div className="flex items-center justify-center h-64">
              <div className="text-gray-400">Loading SSL certificates...</div>
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
                <Lock className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold">SSL Tracker</h1>
                <div className="text-sm text-gray-400">
                  {organization?.name} • {filteredCertificates.length} certificates
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded text-sm">
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
              <button 
                onClick={() => router.push(`/organizations/${params.id}/ssl-tracker/new`)}
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
                    placeholder="Search certificates..."
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
                  <option value="valid">Valid</option>
                  <option value="expiring_soon">Expiring Soon</option>
                  <option value="expired">Expired</option>
                  <option value="revoked">Revoked</option>
                  <option value="pending_validation">Pending</option>
                </select>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Types</option>
                  <option value="domain_validated">Domain Validated</option>
                  <option value="organization_validated">Organization Validated</option>
                  <option value="extended_validation">Extended Validation</option>
                  <option value="wildcard">Wildcard</option>
                  <option value="multi_domain">Multi-Domain</option>
                </select>
              </div>
              <div className="text-sm text-gray-400">
                {filteredCertificates.length} Results
              </div>
            </div>
          </div>

          {/* SSL Certificates Table */}
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="text-left p-4 text-sm font-medium text-gray-300">Domain</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-300">Certificate Type</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-300">Issuer</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-300">Status</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-300">Issued Date</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-300">Expiry Date</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-300">Days Left</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-300">Auto Renewal</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {filteredCertificates.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center p-8 text-gray-400">
                        No SSL certificates found
                      </td>
                    </tr>
                  ) : (
                    filteredCertificates.map((cert) => (
                      <tr key={cert.id} className="hover:bg-gray-700/50">
                        <td className="p-4">
                          <div className="flex items-center space-x-3">
                            <Globe className="w-4 h-4 text-blue-400" />
                            <div>
                              <div className="text-white">{cert.domain_name}</div>
                              <div className="text-xs text-gray-400">{cert.certificate_name}</div>
                              {cert.san_domains && cert.san_domains.length > 0 && (
                                <div className="text-xs text-blue-400">
                                  +{cert.san_domains.length} SAN domains
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getCertificateTypeColor(cert.certificate_type)}`}>
                            {cert.certificate_type.replace('_', ' ').toUpperCase()}
                          </span>
                        </td>
                        <td className="p-4 text-gray-300">{cert.issuer}</td>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(cert.status)}
                            <span className={`capitalize ${getStatusColor(cert.status)}`}>
                              {cert.status.replace('_', ' ')}
                            </span>
                          </div>
                        </td>
                        <td className="p-4 text-gray-300">{formatDate(cert.issued_date)}</td>
                        <td className="p-4 text-gray-300">{formatDate(cert.expiry_date)}</td>
                        <td className="p-4">
                          <span className={`text-sm ${
                            getDaysUntilExpiry(cert.expiry_date).includes('Expired') ? 'text-red-400' :
                            getDaysUntilExpiry(cert.expiry_date).includes('today') ? 'text-red-400' :
                            parseInt(getDaysUntilExpiry(cert.expiry_date)) <= 30 ? 'text-yellow-400' :
                            'text-gray-300'
                          }`}>
                            {getDaysUntilExpiry(cert.expiry_date)}
                          </span>
                        </td>
                        <td className="p-4">
                          {cert.auto_renewal ? (
                            <div className="flex items-center space-x-1">
                              <CheckCircle className="w-4 h-4 text-green-400" />
                              <span className="text-green-400 text-sm">Yes</span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-1">
                              <XCircle className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-400 text-sm">No</span>
                            </div>
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
                            <button 
                              onClick={() => window.open(`https://${cert.domain_name}`, '_blank')}
                              className="p-1 text-gray-400 hover:text-white"
                            >
                              <ExternalLink className="w-4 h-4" />
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
                  <div className="text-sm text-gray-400">Valid</div>
                  <div className="text-xl font-semibold">
                    {certificates.filter(c => c.status === 'valid').length}
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
                    {certificates.filter(c => c.status === 'expiring_soon').length}
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
                    {certificates.filter(c => c.status === 'expired').length}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <div>
                  <div className="text-sm text-gray-400">Auto Renewal</div>
                  <div className="text-xl font-semibold">
                    {certificates.filter(c => c.auto_renewal).length}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-purple-400" />
                <div>
                  <div className="text-sm text-gray-400">Wildcard</div>
                  <div className="text-xl font-semibold">
                    {certificates.filter(c => c.certificate_type === 'wildcard').length}
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
