'use client'

import { useState, useCallback } from 'react'
import { RefreshCw, CheckCircle, AlertCircle, Clock, Zap, Database } from 'lucide-react'
import { SyncService, type SyncProgress, type SyncResult } from '@/lib/sync-service'

interface SyncAllProps {
  onSyncComplete?: (result: SyncResult) => void
  className?: string
}

export default function SyncAll({ onSyncComplete, className = '' }: SyncAllProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState<SyncProgress | null>(null)
  const [lastResult, setLastResult] = useState<SyncResult | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  const handleSync = useCallback(async () => {
    setIsLoading(true)
    setProgress(null)
    setLastResult(null)

    try {
      const result = await SyncService.syncAll((progressUpdate) => {
        setProgress(progressUpdate)
      })

      setLastResult(result)
      if (onSyncComplete) {
        onSyncComplete(result)
      }
    } catch (error: any) {
      console.error('Sync failed:', error)
      setLastResult({
        success: false,
        totalSynced: 0,
        errors: [error.message],
        duration: 0,
        timestamp: new Date().toISOString(),
        details: {
          organizations: 0,
          configurations: 0,
          documents: 0,
          passwords: 0,
          domains: 0,
          sslCertificates: 0,
          networks: 0,
          knownIssues: 0,
          rfcs: 0,
          warranties: 0,
          contacts: 0,
          assets: 0,
          alerts: 0,
          activities: 0,
          favorites: 0
        }
      })
    } finally {
      setIsLoading(false)
      setProgress(null)
    }
  }, [onSyncComplete])

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`
    return `${(ms / 1000).toFixed(1)}s`
  }

  const getStatusIcon = () => {
    if (isLoading) {
      return <RefreshCw className="w-4 h-4 animate-spin" />
    }
    if (lastResult?.success) {
      return <CheckCircle className="w-4 h-4 text-green-400" />
    }
    if (lastResult && !lastResult.success) {
      return <AlertCircle className="w-4 h-4 text-red-400" />
    }
    return <Database className="w-4 h-4" />
  }

  const getStatusColor = () => {
    if (isLoading) return 'border-blue-500 bg-blue-500/10'
    if (lastResult?.success) return 'border-green-500 bg-green-500/10'
    if (lastResult && !lastResult.success) return 'border-red-500 bg-red-500/10'
    return 'border-gray-600 bg-gray-700/50'
  }

  return (
    <div className={`bg-gray-800 rounded-lg border border-gray-700 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg border ${getStatusColor()}`}>
              {getStatusIcon()}
            </div>
            <div>
              <h3 className="text-white font-medium">System Synchronization</h3>
              <p className="text-gray-400 text-sm">
                {isLoading 
                  ? 'Syncing all system data...' 
                  : lastResult 
                    ? `Last sync: ${new Date(lastResult.timestamp).toLocaleTimeString()}`
                    : 'Keep all data up to date'
                }
              </p>
            </div>
          </div>
          
          <button
            onClick={handleSync}
            disabled={isLoading}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            <Zap className="w-4 h-4" />
            <span>{isLoading ? 'Syncing...' : 'Sync All'}</span>
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      {progress && (
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-300">{progress.message}</span>
            <span className="text-sm text-gray-400">{progress.progress}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress.progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Results */}
      {lastResult && (
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              {lastResult.success ? (
                <CheckCircle className="w-5 h-5 text-green-400" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-400" />
              )}
              <span className={`font-medium ${lastResult.success ? 'text-green-400' : 'text-red-400'}`}>
                {lastResult.success ? 'Sync Completed' : 'Sync Failed'}
              </span>
            </div>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-gray-400 hover:text-white text-sm"
            >
              {showDetails ? 'Hide Details' : 'Show Details'}
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{lastResult.totalSynced}</div>
              <div className="text-xs text-gray-400">Items Synced</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{formatDuration(lastResult.duration)}</div>
              <div className="text-xs text-gray-400">Duration</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{lastResult.errors.length}</div>
              <div className="text-xs text-gray-400">Errors</div>
            </div>
          </div>

          {/* Detailed Results */}
          {showDetails && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-sm">
                {Object.entries(lastResult.details).map(([key, count]) => (
                  <div key={key} className="flex justify-between py-1">
                    <span className="text-gray-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                    <span className="text-white">{count}</span>
                  </div>
                ))}
              </div>

              {lastResult.errors.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-red-400 font-medium mb-2">Errors:</h4>
                  <div className="space-y-1">
                    {lastResult.errors.map((error, index) => (
                      <div key={index} className="text-sm text-red-300 bg-red-900/20 p-2 rounded">
                        {error}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Quick Actions */}
      <div className="p-4 border-t border-gray-700 bg-gray-800/50">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => SyncService.clearCache()}
              className="text-gray-400 hover:text-white"
            >
              Clear Cache
            </button>
            <button 
              onClick={() => SyncService.getLastSyncStatus()}
              className="text-gray-400 hover:text-white"
            >
              Check Status
            </button>
          </div>
          <div className="flex items-center space-x-1 text-gray-500">
            <Clock className="w-3 h-3" />
            <span>Auto-sync every 30 minutes</span>
          </div>
        </div>
      </div>
    </div>
  )
}
