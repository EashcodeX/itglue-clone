export interface SyncProgress {
  step: string
  progress: number
  total: number
  message: string
  completed: boolean
  error?: string
}

export interface SyncResult {
  success: boolean
  totalSynced: number
  errors: string[]
  duration: number
  timestamp: string
  details: {
    organizations: number
    configurations: number
    documents: number
    passwords: number
    domains: number
    sslCertificates: number
    networks: number
    knownIssues: number
    rfcs: number
    warranties: number
    contacts: number
    assets: number
    alerts: number
    activities: number
    favorites: number
  }
}

export class SyncService {
  private static readonly SYNC_STEPS = [
    'organizations',
    'configurations', 
    'documents',
    'passwords',
    'domains',
    'sslCertificates',
    'networks',
    'knownIssues',
    'rfcs',
    'warranties',
    'contacts',
    'assets',
    'alerts',
    'activities',
    'favorites'
  ]

  /**
   * Perform complete system synchronization
   */
  static async syncAll(
    onProgress?: (progress: SyncProgress) => void
  ): Promise<SyncResult> {
    const startTime = Date.now()
    const result: SyncResult = {
      success: false,
      totalSynced: 0,
      errors: [],
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
    }

    try {
      console.log('🔄 Starting system-wide synchronization...')

      for (let i = 0; i < this.SYNC_STEPS.length; i++) {
        const step = this.SYNC_STEPS[i]
        const progress = Math.round(((i + 1) / this.SYNC_STEPS.length) * 100)

        // Report progress
        if (onProgress) {
          onProgress({
            step,
            progress,
            total: this.SYNC_STEPS.length,
            message: `Syncing ${step}...`,
            completed: false
          })
        }

        try {
          // Sync individual data type
          const count = await this.syncDataType(step)
          result.details[step as keyof typeof result.details] = count
          result.totalSynced += count

          console.log(`✅ Synced ${count} ${step}`)
        } catch (error: any) {
          console.error(`❌ Error syncing ${step}:`, error)
          result.errors.push(`${step}: ${error.message}`)
        }

        // Small delay to show progress
        await new Promise(resolve => setTimeout(resolve, 200))
      }

      result.success = result.errors.length === 0
      result.duration = Date.now() - startTime

      // Final progress update
      if (onProgress) {
        onProgress({
          step: 'complete',
          progress: 100,
          total: this.SYNC_STEPS.length,
          message: result.success ? 'Sync completed successfully!' : 'Sync completed with errors',
          completed: true,
          error: result.errors.length > 0 ? result.errors.join(', ') : undefined
        })
      }

      console.log(`🎉 Sync completed in ${result.duration}ms. Total synced: ${result.totalSynced}`)
      return result

    } catch (error: any) {
      console.error('❌ Sync failed:', error)
      result.errors.push(`System error: ${error.message}`)
      result.duration = Date.now() - startTime

      if (onProgress) {
        onProgress({
          step: 'error',
          progress: 0,
          total: this.SYNC_STEPS.length,
          message: 'Sync failed',
          completed: true,
          error: error.message
        })
      }

      return result
    }
  }

  /**
   * Sync individual data type
   */
  private static async syncDataType(dataType: string): Promise<number> {
    try {
      const response = await fetch(`/api/sync/${dataType}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      return data.count || 0
    } catch (error: any) {
      throw new Error(`Failed to sync ${dataType}: ${error.message}`)
    }
  }

  /**
   * Get last sync status
   */
  static async getLastSyncStatus(): Promise<SyncResult | null> {
    try {
      const response = await fetch('/api/sync/status')
      if (response.ok) {
        return await response.json()
      }
    } catch (error) {
      console.error('Failed to get sync status:', error)
    }
    return null
  }

  /**
   * Clear sync cache and force fresh data
   */
  static async clearCache(): Promise<void> {
    try {
      await fetch('/api/sync/clear-cache', { method: 'POST' })
      console.log('🗑️ Sync cache cleared')
    } catch (error) {
      console.error('Failed to clear cache:', error)
    }
  }
}
