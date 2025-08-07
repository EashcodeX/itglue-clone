'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import {
  Zap,
  Server,
  Shield,
  Activity,
  Settings,
  Download,
  Upload,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Monitor,
  Wifi,
  HardDrive,
  Cpu
} from 'lucide-react'

interface ConnectedDevice {
  id: string
  name: string
  type: 'server' | 'workstation' | 'network' | 'mobile'
  status: 'online' | 'offline' | 'warning' | 'error'
  lastSeen: string
  version: string
  organization: string
  ipAddress: string
  osInfo: string
}

interface SyncStatus {
  lastSync: string
  status: 'success' | 'error' | 'syncing'
  itemsSynced: number
  errors: number
}

export default function GlueConnectPage() {
  const router = useRouter()
  const [devices, setDevices] = useState<ConnectedDevice[]>([])
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)

  useEffect(() => {
    fetchDevices()
    fetchSyncStatus()
  }, [])

  const fetchDevices = async () => {
    // Simulate API call - replace with actual GlueConnect API
    setTimeout(() => {
      setDevices([
        {
          id: '1',
          name: 'DC-SERVER-01',
          type: 'server',
          status: 'online',
          lastSeen: '2024-01-15T10:30:00Z',
          version: '2.1.5',
          organization: 'Acme Corp',
          ipAddress: '192.168.1.10',
          osInfo: 'Windows Server 2022'
        },
        {
          id: '2',
          name: 'WORKSTATION-05',
          type: 'workstation',
          status: 'online',
          lastSeen: '2024-01-15T10:25:00Z',
          version: '2.1.5',
          organization: 'Acme Corp',
          ipAddress: '192.168.1.45',
          osInfo: 'Windows 11 Pro'
        },
        {
          id: '3',
          name: 'FIREWALL-MAIN',
          type: 'network',
          status: 'warning',
          lastSeen: '2024-01-15T09:15:00Z',
          version: '2.1.3',
          organization: 'Acme Corp',
          ipAddress: '192.168.1.1',
          osInfo: 'pfSense 2.7'
        }
      ])
      setLoading(false)
    }, 1000)
  }

  const fetchSyncStatus = async () => {
    // Simulate API call
    setTimeout(() => {
      setSyncStatus({
        lastSync: '2024-01-15T10:30:00Z',
        status: 'success',
        itemsSynced: 1247,
        errors: 0
      })
    }, 500)
  }

  const handleSync = async () => {
    setSyncing(true)
    // Simulate sync process
    setTimeout(() => {
      setSyncStatus({
        lastSync: new Date().toISOString(),
        status: 'success',
        itemsSynced: 1251,
        errors: 0
      })
      setSyncing(false)
    }, 3000)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <CheckCircle className="w-4 h-4 text-green-400" />
      case 'offline':
        return <XCircle className="w-4 h-4 text-red-400" />
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />
      case 'error':
        return <XCircle className="w-4 h-4 text-red-400" />
      default:
        return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'server':
        return <Server className="w-5 h-5 text-blue-400" />
      case 'workstation':
        return <Monitor className="w-5 h-5 text-green-400" />
      case 'network':
        return <Wifi className="w-5 h-5 text-purple-400" />
      case 'mobile':
        return <HardDrive className="w-5 h-5 text-orange-400" />
      default:
        return <Cpu className="w-5 h-5 text-gray-400" />
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

  const formatLastSeen = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`
    return `${Math.floor(diffMins / 1440)}d ago`
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header currentPage="GlueConnect" />
      <div className="flex">
        <Sidebar onItemClick={handleSidebarItemClick} />

        <div className="flex-1 p-6">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold">GlueConnect</h1>
                <div className="text-sm text-gray-400">
                  Remote monitoring and management platform
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleSync}
                disabled={syncing}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-4 py-2 rounded text-sm"
              >
                <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                <span>{syncing ? 'Syncing...' : 'Sync Now'}</span>
              </button>
              <button className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded text-sm">
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </button>
            </div>
          </div>

          {/* Sync Status */}
          {syncStatus && (
            <div className="bg-gray-800 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {syncStatus.status === 'success' && <CheckCircle className="w-5 h-5 text-green-400" />}
                  {syncStatus.status === 'error' && <XCircle className="w-5 h-5 text-red-400" />}
                  {syncStatus.status === 'syncing' && <RefreshCw className="w-5 h-5 text-blue-400 animate-spin" />}
                  <div>
                    <h3 className="font-medium">Last Sync Status</h3>
                    <p className="text-sm text-gray-400">
                      {formatLastSeen(syncStatus.lastSync)} • {syncStatus.itemsSynced} items synced
                      {syncStatus.errors > 0 && ` • ${syncStatus.errors} errors`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Upload className="w-4 h-4 text-green-400" />
                    <span>245 KB/s</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Download className="w-4 h-4 text-blue-400" />
                    <span>1.2 MB/s</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Connected Devices */}
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <div className="p-4 border-b border-gray-700">
              <h2 className="text-lg font-semibold">Connected Devices</h2>
              <p className="text-sm text-gray-400">Devices currently monitored by GlueConnect</p>
            </div>

            {loading ? (
              <div className="p-8 text-center">
                <RefreshCw className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
                <p className="text-gray-400">Loading devices...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="text-left p-4 text-sm font-medium text-gray-300">Device</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-300">Type</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-300">Status</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-300">IP Address</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-300">OS Info</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-300">Version</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-300">Last Seen</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {devices.map((device) => (
                      <tr key={device.id} className="hover:bg-gray-700/50">
                        <td className="p-4">
                          <div className="flex items-center space-x-3">
                            {getDeviceIcon(device.type)}
                            <span className="text-white font-medium">{device.name}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="px-2 py-1 bg-gray-600 text-gray-300 rounded-full text-xs capitalize">
                            {device.type}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(device.status)}
                            <span className="text-gray-300 capitalize">{device.status}</span>
                          </div>
                        </td>
                        <td className="p-4 text-gray-300">{device.ipAddress}</td>
                        <td className="p-4 text-gray-300">{device.osInfo}</td>
                        <td className="p-4 text-gray-300">v{device.version}</td>
                        <td className="p-4 text-gray-300">{formatLastSeen(device.lastSeen)}</td>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            <button className="p-1 text-blue-400 hover:text-blue-300">
                              <Activity className="w-4 h-4" />
                            </button>
                            <button className="p-1 text-green-400 hover:text-green-300">
                              <Settings className="w-4 h-4" />
                            </button>
                            <button className="p-1 text-purple-400 hover:text-purple-300">
                              <Shield className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
