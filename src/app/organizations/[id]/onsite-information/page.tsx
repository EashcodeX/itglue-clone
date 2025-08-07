'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase, type Organization } from '@/lib/supabase'
import { useClient } from '@/contexts/ClientContext'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'
import {
  Building,
  Key,
  Wifi,
  Car,
  AlertTriangle,
  Plus,
  Edit,
  Trash2,
  FileText,
  Clock,
  Shield
} from 'lucide-react'

interface OnsiteInfo {
  id: string
  title: string
  description: string
  category: string
  priority: string
  created_at: string
  updated_at: string
}

export default function OnsiteInformationPage() {
  const params = useParams()
  const router = useRouter()
  const organizationId = params.id as string
  const [onsiteInfo, setOnsiteInfo] = useState<OnsiteInfo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (organizationId) {
      loadOnsiteInfo()
    }
  }, [organizationId])

  const loadOnsiteInfo = async () => {
    try {
      setLoading(true)
      // Mock data for demonstration
      const mockData: OnsiteInfo[] = [
        {
          id: '1',
          title: 'Building Access Information',
          description: 'Main entrance code: #1234. Valid 24/7. Contact security at (555) 123-4567 if code doesn\'t work. Emergency exit codes are posted near each exit.',
          category: 'Access',
          priority: 'High',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          title: 'Network & WiFi Details',
          description: 'Guest Network: CompanyGuest, Password: Welcome2024. Main network requires domain credentials. Network closet is located on 2nd floor, room 201.',
          category: 'Network',
          priority: 'Medium',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '3',
          title: 'Emergency Procedures',
          description: 'Fire alarm: Evacuate via nearest exit. Security: (555) 123-4567. Facilities: (555) 234-5678. IT Support: (555) 345-6789. First aid kit located in break room.',
          category: 'Emergency',
          priority: 'High',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]
      setOnsiteInfo(mockData)
    } catch (error) {
      console.error('Error loading onsite information:', error)
    } finally {
      setLoading(false)
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'access': return Key
      case 'network': return Wifi
      case 'emergency': return AlertTriangle
      case 'parking': return Car
      case 'security': return Shield
      default: return Building
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'access': return 'text-blue-400'
      case 'network': return 'text-green-400'
      case 'emergency': return 'text-red-400'
      case 'parking': return 'text-purple-400'
      case 'security': return 'text-orange-400'
      default: return 'text-gray-400'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'bg-red-900/20 text-red-400 border-red-500'
      case 'medium': return 'bg-yellow-900/20 text-yellow-400 border-yellow-500'
      case 'low': return 'bg-green-900/20 text-green-400 border-green-500'
      default: return 'bg-gray-900/20 text-gray-400 border-gray-500'
    }
  }

  const handleSidebarItemClick = (item: any) => {
    console.log('Sidebar item clicked:', item)
    if (item.href) {
      if (item.href === '/') {
        router.push('/')
      } else {
        router.push(`/organizations/${organizationId}${item.href}`)
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading onsite information...</p>
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
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <Building className="w-8 h-8 text-blue-500" />
                <div>
                  <h1 className="text-3xl font-bold">Onsite Information</h1>
                  <p className="text-gray-400">Important information for onsite visits and access</p>
                </div>
              </div>
              <button
                onClick={() => alert('Add new onsite information feature coming soon!')}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Information</span>
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <FileText className="w-6 h-6 text-blue-400" />
                  <div>
                    <p className="text-2xl font-bold">{onsiteInfo.length}</p>
                    <p className="text-sm text-gray-400">Total Items</p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="w-6 h-6 text-red-400" />
                  <div>
                    <p className="text-2xl font-bold">{onsiteInfo.filter(i => i.priority === 'High').length}</p>
                    <p className="text-sm text-gray-400">High Priority</p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <Clock className="w-6 h-6 text-yellow-400" />
                  <div>
                    <p className="text-2xl font-bold">{onsiteInfo.filter(i => i.priority === 'Medium').length}</p>
                    <p className="text-sm text-gray-400">Medium Priority</p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <Shield className="w-6 h-6 text-green-400" />
                  <div>
                    <p className="text-2xl font-bold">{onsiteInfo.filter(i => i.priority === 'Low').length}</p>
                    <p className="text-sm text-gray-400">Low Priority</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Information Cards */}
            <div className="grid gap-4">
              {onsiteInfo.map(info => {
                const CategoryIcon = getCategoryIcon(info.category)
                return (
                  <div
                    key={info.id}
                    className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <CategoryIcon className={`w-6 h-6 ${getCategoryColor(info.category)}`} />
                        <div>
                          <h3 className="text-lg font-semibold">{info.title}</h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-xs text-gray-400">{info.category}</span>
                            <span className={`text-xs px-2 py-1 rounded border ${getPriorityColor(info.priority)}`}>
                              {info.priority.toUpperCase()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => alert('Edit feature coming soon!')}
                          className="p-2 text-gray-400 hover:text-blue-400 hover:bg-gray-700 rounded transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this information?')) {
                              setOnsiteInfo(prev => prev.filter(i => i.id !== info.id))
                            }
                          }}
                          className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-gray-300 leading-relaxed mb-4">{info.description}</p>
                    <div className="text-xs text-gray-500">
                      Last updated {new Date(info.updated_at).toLocaleDateString()}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}