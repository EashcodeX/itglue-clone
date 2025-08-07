'use client'

import { useState, useEffect } from 'react'
import { 
  WifiOff, 
  RefreshCw, 
  Home, 
  Database,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(true)
  const [lastSync, setLastSync] = useState<Date | null>(null)
  const [pendingActions, setPendingActions] = useState(0)

  useEffect(() => {
    // Check online status
    setIsOnline(navigator.onLine)

    const handleOnline = () => {
      setIsOnline(true)
      setLastSync(new Date())
    }

    const handleOffline = () => {
      setIsOnline(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Get last sync time from localStorage
    const lastSyncTime = localStorage.getItem('lastSync')
    if (lastSyncTime) {
      setLastSync(new Date(lastSyncTime))
    }

    // Get pending actions count
    const pending = localStorage.getItem('pendingActions')
    if (pending) {
      setPendingActions(parseInt(pending, 10))
    }

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const handleRetry = () => {
    window.location.reload()
  }

  const handleGoHome = () => {
    window.location.href = '/'
  }

  const handleClearCache = async () => {
    if ('caches' in window) {
      const cacheNames = await caches.keys()
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      )
      window.location.reload()
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        {/* Offline Icon */}
        <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
          <WifiOff className="w-12 h-12 text-gray-400" />
        </div>

        {/* Status */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold mb-2">
            {isOnline ? 'Connection Restored' : 'You\'re Offline'}
          </h1>
          <p className="text-gray-400">
            {isOnline 
              ? 'Your internet connection has been restored. You can now access all features.'
              : 'Some features may be limited while you\'re offline. We\'ll sync your changes when you\'re back online.'
            }
          </p>
        </div>

        {/* Connection Status */}
        <div className="bg-gray-800 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-400">Connection Status</span>
            <div className={`flex items-center space-x-2 ${isOnline ? 'text-green-400' : 'text-red-400'}`}>
              {isOnline ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <AlertCircle className="w-4 h-4" />
              )}
              <span className="text-sm font-medium">
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>

          {lastSync && (
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-400">Last Sync</span>
              <div className="flex items-center space-x-2 text-gray-300">
                <Clock className="w-4 h-4" />
                <span className="text-sm">
                  {lastSync.toLocaleTimeString()}
                </span>
              </div>
            </div>
          )}

          {pendingActions > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Pending Changes</span>
              <div className="flex items-center space-x-2 text-yellow-400">
                <Database className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {pendingActions} action{pendingActions !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Available Features */}
        <div className="bg-gray-800 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-medium text-gray-300 mb-3">Available Offline</h3>
          <div className="space-y-2 text-sm text-gray-400">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span>View cached organizations</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span>Browse saved reports</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span>Access API documentation</span>
            </div>
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-yellow-400" />
              <span>Create/edit (syncs when online)</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          {isOnline ? (
            <button
              onClick={handleGoHome}
              className="w-full flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg transition-colors"
            >
              <Home className="w-4 h-4" />
              <span>Go to Dashboard</span>
            </button>
          ) : (
            <button
              onClick={handleRetry}
              className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Try Again</span>
            </button>
          )}

          <button
            onClick={handleGoHome}
            className="w-full flex items-center justify-center space-x-2 bg-gray-700 hover:bg-gray-600 px-6 py-3 rounded-lg transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Go Home</span>
          </button>

          <button
            onClick={handleClearCache}
            className="w-full text-sm text-gray-400 hover:text-gray-300 transition-colors"
          >
            Clear Cache & Reload
          </button>
        </div>

        {/* Tips */}
        <div className="mt-8 p-4 bg-gray-800/50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-300 mb-2">💡 Offline Tips</h4>
          <ul className="text-xs text-gray-400 space-y-1">
            <li>• Your changes will sync automatically when you're back online</li>
            <li>• Cached data is available for viewing</li>
            <li>• Some features require an internet connection</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
