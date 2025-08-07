'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import {
  BarChart3,
  TrendingUp,
  Users,
  Building2,
  FileText,
  Activity,
  Download,
  Calendar,
  Filter,
  RefreshCw,
  PieChart,
  LineChart,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye
} from 'lucide-react'

interface ReportData {
  organizations: {
    total: number
    active: number
    inactive: number
    growth: number
  }
  users: {
    total: number
    active: number
    lastWeek: number
    growth: number
  }
  documents: {
    total: number
    thisMonth: number
    growth: number
  }
  activities: {
    total: number
    today: number
    growth: number
  }
}

interface ChartData {
  name: string
  value: number
  color: string
}

export default function ReportsPage() {
  const router = useRouter()
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState('30d')
  const [selectedReport, setSelectedReport] = useState('overview')

  useEffect(() => {
    fetchReportData()
  }, [selectedPeriod])

  const fetchReportData = async () => {
    setLoading(true)
    try {
      // Simulate API calls - replace with actual data fetching
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setReportData({
        organizations: {
          total: 47,
          active: 42,
          inactive: 5,
          growth: 12.5
        },
        users: {
          total: 156,
          active: 134,
          lastWeek: 142,
          growth: 8.2
        },
        documents: {
          total: 2847,
          thisMonth: 234,
          growth: 15.7
        },
        activities: {
          total: 12456,
          today: 89,
          growth: 23.1
        }
      })
    } catch (error) {
      console.error('Error fetching report data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSidebarItemClick = (item: any) => {
    if (item.href) {
      if (item.href === '/') {
        router.push('/')
      } else {
        router.push(item.href)
      }
    }
  }

  const organizationChartData: ChartData[] = [
    { name: 'Active', value: 42, color: '#10B981' },
    { name: 'Inactive', value: 5, color: '#EF4444' }
  ]

  const activityChartData: ChartData[] = [
    { name: 'Documents', value: 45, color: '#3B82F6' },
    { name: 'Configurations', value: 23, color: '#8B5CF6' },
    { name: 'Passwords', value: 18, color: '#F59E0B' },
    { name: 'Networks', value: 14, color: '#EF4444' }
  ]

  const exportReport = (format: 'pdf' | 'csv' | 'excel') => {
    // Simulate export functionality
    console.log(`Exporting report as ${format}`)
    // In real implementation, this would generate and download the file
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <Header currentPage="Reports" />
        <div className="flex">
          <Sidebar onItemClick={handleSidebarItemClick} />
          <div className="flex-1 p-6">
            <div className="flex items-center justify-center h-64">
              <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header currentPage="Reports" />
      <div className="flex">
        <Sidebar onItemClick={handleSidebarItemClick} />
        
        <div className="flex-1 p-6">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold">Analytics & Reports</h1>
                <div className="text-sm text-gray-400">
                  Comprehensive insights and analytics
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
              <button
                onClick={() => exportReport('pdf')}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
              <button
                onClick={fetchReportData}
                className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded text-sm"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* Key Metrics Cards */}
          {reportData && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Organizations</p>
                    <p className="text-2xl font-semibold text-white">{reportData.organizations.total}</p>
                    <div className="flex items-center mt-2">
                      <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
                      <span className="text-sm text-green-400">+{reportData.organizations.growth}%</span>
                    </div>
                  </div>
                  <Building2 className="w-8 h-8 text-blue-400" />
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Active Users</p>
                    <p className="text-2xl font-semibold text-white">{reportData.users.active}</p>
                    <div className="flex items-center mt-2">
                      <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
                      <span className="text-sm text-green-400">+{reportData.users.growth}%</span>
                    </div>
                  </div>
                  <Users className="w-8 h-8 text-green-400" />
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Documents</p>
                    <p className="text-2xl font-semibold text-white">{reportData.documents.total}</p>
                    <div className="flex items-center mt-2">
                      <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
                      <span className="text-sm text-green-400">+{reportData.documents.growth}%</span>
                    </div>
                  </div>
                  <FileText className="w-8 h-8 text-purple-400" />
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Activities</p>
                    <p className="text-2xl font-semibold text-white">{reportData.activities.today}</p>
                    <div className="flex items-center mt-2">
                      <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
                      <span className="text-sm text-green-400">+{reportData.activities.growth}%</span>
                    </div>
                  </div>
                  <Activity className="w-8 h-8 text-orange-400" />
                </div>
              </div>
            </div>
          )}

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Organization Status Chart */}
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Organization Status</h3>
                <PieChart className="w-5 h-5 text-gray-400" />
              </div>
              <div className="space-y-4">
                {organizationChartData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-gray-300">{item.name}</span>
                    </div>
                    <span className="text-white font-medium">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Activity Distribution Chart */}
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Activity Distribution</h3>
                <LineChart className="w-5 h-5 text-gray-400" />
              </div>
              <div className="space-y-4">
                {activityChartData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-gray-300">{item.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-700 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full"
                          style={{ 
                            backgroundColor: item.color,
                            width: `${(item.value / 50) * 100}%`
                          }}
                        />
                      </div>
                      <span className="text-white font-medium w-8">{item.value}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Reports Table */}
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <div className="p-4 border-b border-gray-700">
              <h2 className="text-lg font-semibold">Recent Reports</h2>
              <p className="text-sm text-gray-400">Generated reports and analytics</p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="text-left p-4 text-sm font-medium text-gray-300">Report Name</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-300">Type</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-300">Generated</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-300">Status</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  <tr className="hover:bg-gray-700/50">
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <BarChart3 className="w-4 h-4 text-blue-400" />
                        <span className="text-white">Monthly Organization Report</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-blue-600/20 text-blue-300 rounded-full text-xs">
                        Analytics
                      </span>
                    </td>
                    <td className="p-4 text-gray-300">2 hours ago</td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-green-400">Complete</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <button className="p-1 text-blue-400 hover:text-blue-300">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-green-400 hover:text-green-300">
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-700/50">
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <Users className="w-4 h-4 text-green-400" />
                        <span className="text-white">User Activity Report</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-green-600/20 text-green-300 rounded-full text-xs">
                        Usage
                      </span>
                    </td>
                    <td className="p-4 text-gray-300">1 day ago</td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-yellow-400" />
                        <span className="text-yellow-400">Processing</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <button className="p-1 text-blue-400 hover:text-blue-300">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-gray-400" disabled>
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
