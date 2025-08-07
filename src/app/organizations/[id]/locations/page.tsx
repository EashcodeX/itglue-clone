'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase, type Organization } from '@/lib/supabase'
import { useClient } from '@/contexts/ClientContext'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'
import { 
  MapPin, 
  ArrowLeft,
  Edit,
  Plus,
  Phone,
  User,
  Building2,
  MoreHorizontal
} from 'lucide-react'

interface Location {
  id: string
  name: string
  address: string
  type: string
  phone: string
  contact: string
}

export default function LocationsPage() {
  const params = useParams()
  const router = useRouter()
  const { selectedClient } = useClient()
  const [loading, setLoading] = useState(true)
  const [organization, setOrganization] = useState<Organization | null>(null)
  // Initialize with empty array - no hardcoded sample data
  const [locations, setLocations] = useState<Location[]>([])

  useEffect(() => {
    if (params.id) {
      fetchOrganization(params.id as string)
    }
  }, [params.id])

  const fetchOrganization = async (id: string) => {
    try {
      setLoading(true)

      // Fetch organization data
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', id)
        .single()

      if (orgError) throw orgError
      setOrganization(orgData)

      // Fetch locations for this organization
      const { data: locationsData, error: locationsError } = await supabase
        .from('locations')
        .select('*')
        .eq('organization_id', id)

      if (locationsError) {
        console.warn('Error fetching locations:', locationsError)
        // Don't throw error - organization might not have locations yet
        setLocations([])
      } else {
        setLocations(locationsData || [])
      }

    } catch (err) {
      console.error('Error fetching organization:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSidebarItemClick = (item: any) => {
    console.log('Sidebar item clicked:', item)
    if (item.href) {
      if (item.href === '/') {
        router.push('/')
      } else {
        router.push(`/organizations/${params.id}${item.href}`)
      }
    }
  }

  const handleBackToOrganization = () => {
    router.push(`/organizations/${params.id}`)
  }

  const getLocationTypeColor = (type: string) => {
    switch (type) {
      case 'Main Office': return 'bg-blue-600'
      case 'Branch': return 'bg-green-600'
      case 'Warehouse': return 'bg-yellow-600'
      case 'Remote Site': return 'bg-purple-600'
      case 'Service Center': return 'bg-red-600'
      case 'Training Facility': return 'bg-indigo-600'
      case 'Storage': return 'bg-gray-600'
      default: return 'bg-gray-600'
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
              <div className="text-gray-400">Loading...</div>
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
        
        {/* Main Content */}
        <div className="flex-1">
          <div className="p-6">
            {/* Back Button */}
            <button
              onClick={handleBackToOrganization}
              className="flex items-center space-x-2 text-gray-400 hover:text-white mb-4 text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Organization</span>
            </button>

            {/* Page Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-semibold">Locations</h1>
                  <div className="text-sm text-gray-400">
                    {organization?.name} • {locations.length} locations
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => router.push(`/organizations/${params.id}/edit`)}
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit</span>
                </button>
                <button className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-sm">
                  <Plus className="w-4 h-4" />
                  <span>Add Location</span>
                </button>
              </div>
            </div>

            {/* Locations Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {locations.map((location) => (
                <div key={location.id} className="bg-gray-800 rounded-lg p-4 hover:bg-gray-750 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-10 h-10 ${getLocationTypeColor(location.type)} rounded-full flex items-center justify-center`}>
                      <Building2 className="w-5 h-5 text-white" />
                    </div>
                    <button className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <h3 className="font-medium text-white mb-2 line-clamp-2">{location.name}</h3>
                  <div className="text-sm text-blue-400 mb-2">{location.type}</div>
                  
                  <div className="space-y-2 text-sm text-gray-300">
                    <div className="flex items-start space-x-2">
                      <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span className="line-clamp-2">{location.address}</span>
                    </div>
                    
                    {location.phone && (
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 flex-shrink-0" />
                        <span>{location.phone}</span>
                      </div>
                    )}
                    
                    {location.contact && (
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 flex-shrink-0" />
                        <span>{location.contact}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Location Statistics */}
            <div className="grid grid-cols-5 gap-4">
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="text-2xl font-bold text-white">{locations.length}</div>
                <div className="text-sm text-gray-400">Total Locations</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-500">{locations.filter(l => l.type === 'Main Office').length}</div>
                <div className="text-sm text-gray-400">Main Offices</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-500">{locations.filter(l => l.type === 'Branch').length}</div>
                <div className="text-sm text-gray-400">Branches</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="text-2xl font-bold text-yellow-500">{locations.filter(l => l.type === 'Warehouse').length}</div>
                <div className="text-sm text-gray-400">Warehouses</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="text-2xl font-bold text-purple-500">{locations.filter(l => l.type === 'Remote Site').length}</div>
                <div className="text-sm text-gray-400">Remote Sites</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
