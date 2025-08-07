import { supabase, type DashboardStats, type Favorite } from './supabase'

export interface DashboardData {
  stats: DashboardStats
  recentActivity: RecentActivity[]
  favorites: Favorite[]
  alerts: Alert[]
}

export interface RecentActivity {
  id: string
  type: 'created' | 'updated' | 'deleted'
  item_type: string
  item_name: string
  item_id: string
  organization_name: string
  user_name: string
  timestamp: string
  description: string
}

export interface Alert {
  id: string
  type: 'warning' | 'error' | 'info'
  title: string
  message: string
  item_type?: string
  item_id?: string
  created_at: string
}

export class DashboardService {
  static async getDashboardData(organizationId?: string): Promise<DashboardData> {
    const [stats, recentActivity, favorites, alerts] = await Promise.all([
      this.getStats(organizationId),
      this.getRecentActivity(organizationId),
      this.getFavorites(organizationId),
      this.getAlerts(organizationId)
    ])

    return {
      stats,
      recentActivity,
      favorites,
      alerts
    }
  }

  static async getStats(organizationId?: string): Promise<DashboardStats> {
    try {
      const baseQuery = organizationId 
        ? { organization_id: organizationId }
        : {}

      // Get counts for all tables
      const [
        organizationsResult,
        configurationsResult,
        documentsResult,
        passwordsResult,
        domainsResult,
        contactsResult,
        locationsResult,
        assetsResult,
        usersResult,
        knownIssuesResult,
        rfcsResult,
        maintenanceWindowsResult,
        warrantiesResult,
        mfaConfigurationsResult,
        networksResult,
        sslCertificatesResult
      ] = await Promise.all([
        organizationId ? { count: 1 } : supabase.from('organizations').select('*', { count: 'exact', head: true }),
        supabase.from('configurations').select('*', { count: 'exact', head: true }).match(baseQuery),
        supabase.from('documents').select('*', { count: 'exact', head: true }).match(baseQuery),
        supabase.from('passwords').select('*', { count: 'exact', head: true }).match(baseQuery),
        supabase.from('domains').select('*', { count: 'exact', head: true }).match(baseQuery),
        supabase.from('contacts').select('*', { count: 'exact', head: true }).match(baseQuery),
        supabase.from('locations').select('*', { count: 'exact', head: true }).match(baseQuery),
        supabase.from('assets').select('*', { count: 'exact', head: true }).match(baseQuery),
        supabase.from('users').select('*', { count: 'exact', head: true }).match(baseQuery),
        supabase.from('known_issues').select('*', { count: 'exact', head: true }).match(baseQuery),
        supabase.from('rfcs').select('*', { count: 'exact', head: true }).match(baseQuery),
        supabase.from('maintenance_windows').select('*', { count: 'exact', head: true }).match(baseQuery),
        supabase.from('warranties').select('*', { count: 'exact', head: true }).match(baseQuery),
        supabase.from('mfa_configurations').select('*', { count: 'exact', head: true }).match(baseQuery),
        supabase.from('networks').select('*', { count: 'exact', head: true }).match(baseQuery),
        supabase.from('ssl_certificates').select('*', { count: 'exact', head: true }).match(baseQuery)
      ])

      // Get specific filtered counts
      const today = new Date()
      const thirtyDaysFromNow = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000))

      const [
        expiringCertificatesResult,
        expiredWarrantiesResult,
        openIssuesResult,
        pendingRfcsResult
      ] = await Promise.all([
        supabase
          .from('ssl_certificates')
          .select('*', { count: 'exact', head: true })
          .match(baseQuery)
          .lte('expiry_date', thirtyDaysFromNow.toISOString().split('T')[0]),
        supabase
          .from('warranties')
          .select('*', { count: 'exact', head: true })
          .match(baseQuery)
          .lt('warranty_end_date', today.toISOString().split('T')[0]),
        supabase
          .from('known_issues')
          .select('*', { count: 'exact', head: true })
          .match(baseQuery)
          .in('status', ['open', 'investigating']),
        supabase
          .from('rfcs')
          .select('*', { count: 'exact', head: true })
          .match(baseQuery)
          .in('status', ['submitted', 'pending'])
      ])

      return {
        organizations: organizationId ? 1 : (organizationsResult.count || 0),
        configurations: configurationsResult.count || 0,
        documents: documentsResult.count || 0,
        passwords: passwordsResult.count || 0,
        domains: domainsResult.count || 0,
        contacts: contactsResult.count || 0,
        locations: locationsResult.count || 0,
        assets: assetsResult.count || 0,
        users: usersResult.count || 0,
        certificates: sslCertificatesResult.count || 0,
        related_items: 0, // This would be calculated based on relationships
        known_issues: knownIssuesResult.count || 0,
        rfcs: rfcsResult.count || 0,
        maintenance_windows: maintenanceWindowsResult.count || 0,
        warranties: warrantiesResult.count || 0,
        mfa_configurations: mfaConfigurationsResult.count || 0,
        networks: networksResult.count || 0,
        ssl_certificates: sslCertificatesResult.count || 0,
        expiring_certificates: expiringCertificatesResult.count || 0,
        expired_warranties: expiredWarrantiesResult.count || 0,
        open_issues: openIssuesResult.count || 0,
        pending_rfcs: pendingRfcsResult.count || 0
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
      return {
        organizations: 0,
        configurations: 0,
        documents: 0,
        passwords: 0,
        domains: 0,
        contacts: 0,
        locations: 0,
        assets: 0,
        users: 0,
        certificates: 0,
        related_items: 0,
        known_issues: 0,
        rfcs: 0,
        maintenance_windows: 0,
        warranties: 0,
        mfa_configurations: 0,
        networks: 0,
        ssl_certificates: 0,
        expiring_certificates: 0,
        expired_warranties: 0,
        open_issues: 0,
        pending_rfcs: 0
      }
    }
  }

  static async getRecentActivity(organizationId?: string): Promise<RecentActivity[]> {
    try {
      // This would typically come from an audit log table
      // For now, we'll simulate recent activity from various tables
      const activities: RecentActivity[] = []

      // Get recent configurations
      const { data: recentConfigs } = await supabase
        .from('configurations')
        .select('id, name, updated_at, organization_id')
        .match(organizationId ? { organization_id: organizationId } : {})
        .order('updated_at', { ascending: false })
        .limit(5)

      recentConfigs?.forEach(config => {
        activities.push({
          id: `config-${config.id}`,
          type: 'updated',
          item_type: 'configuration',
          item_name: config.name,
          item_id: config.id,
          organization_name: 'Organization', // Would join with organizations table
          user_name: 'System User',
          timestamp: config.updated_at,
          description: `Configuration "${config.name}" was updated`
        })
      })

      // Get recent documents
      const { data: recentDocs } = await supabase
        .from('documents')
        .select('id, name, updated_at, organization_id')
        .match(organizationId ? { organization_id: organizationId } : {})
        .order('updated_at', { ascending: false })
        .limit(5)

      recentDocs?.forEach(doc => {
        activities.push({
          id: `doc-${doc.id}`,
          type: 'updated',
          item_type: 'document',
          item_name: doc.name || 'Untitled Document',
          item_id: doc.id,
          organization_name: 'Organization',
          user_name: 'System User',
          timestamp: doc.updated_at,
          description: `Document "${doc.name}" was updated`
        })
      })

      // Sort by timestamp and return top 10
      return activities
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 10)

    } catch (error) {
      console.error('Error fetching recent activity:', error)
      return []
    }
  }

  static async getFavorites(organizationId?: string): Promise<Favorite[]> {
    try {
      const query = supabase
        .from('favorites')
        .select('*')
        .order('created_at', { ascending: false })

      if (organizationId) {
        query.eq('organization_id', organizationId)
      }

      const { data, error } = await query

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching favorites:', error)
      return []
    }
  }

  static async getAlerts(organizationId?: string): Promise<Alert[]> {
    try {
      const alerts: Alert[] = []
      const today = new Date()
      const thirtyDaysFromNow = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000))

      // Check for expiring SSL certificates
      const { data: expiringCerts } = await supabase
        .from('ssl_certificates')
        .select('id, domain_name, expiry_date')
        .match(organizationId ? { organization_id: organizationId } : {})
        .lte('expiry_date', thirtyDaysFromNow.toISOString().split('T')[0])
        .gt('expiry_date', today.toISOString().split('T')[0])

      expiringCerts?.forEach(cert => {
        const daysUntilExpiry = Math.ceil((new Date(cert.expiry_date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        alerts.push({
          id: `cert-${cert.id}`,
          type: 'warning',
          title: 'SSL Certificate Expiring Soon',
          message: `Certificate for ${cert.domain_name} expires in ${daysUntilExpiry} days`,
          item_type: 'ssl_certificate',
          item_id: cert.id,
          created_at: new Date().toISOString()
        })
      })

      // Check for expired warranties
      const { data: expiredWarranties } = await supabase
        .from('warranties')
        .select('id, asset_name, warranty_end_date')
        .match(organizationId ? { organization_id: organizationId } : {})
        .lt('warranty_end_date', today.toISOString().split('T')[0])

      expiredWarranties?.forEach(warranty => {
        alerts.push({
          id: `warranty-${warranty.id}`,
          type: 'error',
          title: 'Warranty Expired',
          message: `Warranty for ${warranty.asset_name} has expired`,
          item_type: 'warranty',
          item_id: warranty.id,
          created_at: new Date().toISOString()
        })
      })

      // Check for critical open issues
      const { data: criticalIssues } = await supabase
        .from('known_issues')
        .select('id, title, severity')
        .match(organizationId ? { organization_id: organizationId } : {})
        .eq('severity', 'critical')
        .in('status', ['open', 'investigating'])

      criticalIssues?.forEach(issue => {
        alerts.push({
          id: `issue-${issue.id}`,
          type: 'error',
          title: 'Critical Issue Open',
          message: `Critical issue: ${issue.title}`,
          item_type: 'known_issue',
          item_id: issue.id,
          created_at: new Date().toISOString()
        })
      })

      return alerts.slice(0, 10) // Return top 10 alerts
    } catch (error) {
      console.error('Error fetching alerts:', error)
      return []
    }
  }

  // Favorites management
  static async addFavorite(favorite: Omit<Favorite, 'id' | 'created_at' | 'updated_at'>): Promise<Favorite | null> {
    try {
      const { data, error } = await supabase
        .from('favorites')
        .insert([favorite])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error adding favorite:', error)
      return null
    }
  }

  static async removeFavorite(favoriteId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('id', favoriteId)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error removing favorite:', error)
      return false
    }
  }

  static async toggleFavorite(
    itemType: string,
    itemId: string,
    itemName: string,
    organizationId: string,
    itemDescription?: string,
    color?: string
  ): Promise<boolean> {
    try {
      // Check if already favorited
      const { data: existing } = await supabase
        .from('favorites')
        .select('id')
        .eq('item_type', itemType)
        .eq('item_id', itemId)
        .eq('organization_id', organizationId)
        .single()

      if (existing) {
        // Remove favorite
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('id', existing.id)

        if (error) throw error
        return false // Removed
      } else {
        // Add favorite
        const { error } = await supabase
          .from('favorites')
          .insert([{
            item_type: itemType,
            item_id: itemId,
            item_name: itemName,
            item_description: itemDescription,
            organization_id: organizationId,
            color: color || 'bg-gray-500'
          }])

        if (error) throw error
        return true // Added
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
      return false
    }
  }
}
