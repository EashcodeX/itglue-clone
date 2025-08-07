import { supabase } from './supabase'

export interface SidebarItem {
  id: string
  organization_id: string
  parent_category?: string
  item_name: string
  item_slug: string
  item_type: string
  icon: string
  description?: string
  sort_order: number
  is_active: boolean
  is_system: boolean
  created_at: string
  updated_at: string
}

interface SystemSidebarItem {
  name: string
  href: string
  icon: string
  count?: number
}

export interface SidebarCategory {
  name: string
  items: SidebarItem[]
  systemItems: SystemSidebarItem[]
}

export class SidebarService {
  // Cache to store sidebar data temporarily
  private static cache = new Map<string, { data: any, timestamp: number }>()
  private static CACHE_DURATION = 30000 // 30 seconds

  // Fetch real counts for sidebar items
  static async getOrganizationCounts(organizationId: string): Promise<Record<string, number>> {
    const cacheKey = `counts_${organizationId}`
    const cached = this.cache.get(cacheKey)

    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      console.log('📦 Using cached counts for organization:', organizationId)
      return cached.data
    }

    console.log('🔢 Fetching real counts for organization:', organizationId)

    try {
      const counts: Record<string, number> = {}

      // Fetch contacts count
      const { count: contactsCount, error: contactsError } = await supabase
        .from('contacts')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organizationId)

      if (!contactsError) {
        counts.contacts = contactsCount || 0
      }

      // Fetch locations count
      const { count: locationsCount, error: locationsError } = await supabase
        .from('locations')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organizationId)

      if (!locationsError) {
        counts.locations = locationsCount || 0
      }

      // Fetch documents count (if table exists)
      const { count: documentsCount, error: documentsError } = await supabase
        .from('documents')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organizationId)

      if (!documentsError) {
        counts.documents = documentsCount || 0
      } else {
        counts.documents = 0 // Table might not exist yet
      }

      // Fetch passwords count (if table exists)
      const { count: passwordsCount, error: passwordsError } = await supabase
        .from('passwords')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organizationId)

      if (!passwordsError) {
        counts.passwords = passwordsCount || 0
      } else {
        counts.passwords = 0 // Table might not exist yet
      }

      // Fetch configurations count (if table exists)
      const { count: configurationsCount, error: configurationsError } = await supabase
        .from('configurations')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organizationId)

      if (!configurationsError) {
        counts.configurations = configurationsCount || 0
      } else {
        counts.configurations = 0 // Table might not exist yet
      }

      // Fetch networks count (if table exists)
      const { count: networksCount, error: networksError } = await supabase
        .from('networks')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organizationId)

      if (!networksError) {
        counts.networks = networksCount || 0
      } else {
        counts.networks = 0 // Table might not exist yet
      }

      // Fetch SSL certificates count (if table exists)
      const { count: sslCount, error: sslError } = await supabase
        .from('ssl_certificates')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organizationId)

      if (!sslError) {
        counts.ssl_certificates = sslCount || 0
      } else {
        counts.ssl_certificates = 0 // Table might not exist yet
      }

      // Fetch domains count (if table exists)
      const { count: domainsCount, error: domainsError } = await supabase
        .from('domains')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organizationId)

      if (!domainsError) {
        counts.domains = domainsCount || 0
      } else {
        counts.domains = 0 // Table might not exist yet
      }

      console.log('📊 Real counts fetched:', counts)

      // Cache the results
      this.cache.set(cacheKey, { data: counts, timestamp: Date.now() })

      return counts

    } catch (error) {
      console.error('❌ Error fetching organization counts:', error)
      return {} // Return empty object on error
    }
  }

  // Clear cache for a specific organization
  static clearCache(organizationId?: string) {
    if (organizationId) {
      console.log('🗑️ Clearing sidebar cache for organization:', organizationId)
      this.cache.delete(`sidebar_${organizationId}`)
      this.cache.delete(`items_${organizationId}`)
      this.cache.delete(`counts_${organizationId}`)
    } else {
      console.log('🗑️ Clearing all sidebar cache')
      this.cache.clear()
    }
  }

  // Clear cache only when switching between different organizations
  static clearCacheIfDifferentOrg(newOrgId: string) {
    const currentCacheKeys = Array.from(this.cache.keys())
    const hasDataForDifferentOrg = currentCacheKeys.some(key =>
      key.includes('sidebar_') && !key.includes(newOrgId)
    )

    if (hasDataForDifferentOrg) {
      console.log('🔄 Switching organizations, clearing cache for different org')
      this.cache.clear()
    }
  }

  // Get all sidebar items for an organization
  static async getOrganizationSidebarItems(organizationId: string): Promise<SidebarItem[]> {
    console.log('🔍 Fetching sidebar items for organization:', organizationId)

    // Check cache first
    const cacheKey = `items_${organizationId}`
    const cached = this.cache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      console.log('📦 Using cached sidebar items for organization:', organizationId)
      return cached.data
    }

    const { data, error } = await supabase
      .from('organization_sidebar_items')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    if (error) {
      console.error('❌ Error fetching sidebar items:', error)
      console.error('Error details:', JSON.stringify(error, null, 2))
      throw error
    }

    console.log('📋 Found sidebar items:', data)
    const result = data || []

    // Cache the result
    this.cache.set(cacheKey, { data: result, timestamp: Date.now() })

    return result
  }

  // Get sidebar items grouped by category - EXACT ITGlue structure from image
  static async getOrganizationSidebarByCategory(organizationId: string): Promise<Record<string, SidebarCategory>> {
    console.log('🏗️ Building sidebar categories for organization:', organizationId)

    // Check cache first
    const cacheKey = `sidebar_${organizationId}`
    const cached = this.cache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      console.log('📦 Using cached sidebar categories for organization:', organizationId)
      return cached.data
    }

    const items = await this.getOrganizationSidebarItems(organizationId)

    // Get real counts for this organization
    const counts = await this.getOrganizationCounts(organizationId)

    // EXACT ITGlue sidebar structure from the provided image (with real counts)
    const defaultSidebar = {
      'CLIENT CONTACT': {
        name: 'CLIENT CONTACT',
        items: [],
        systemItems: [
          { name: 'Site Summary', href: '/site-summary', icon: 'FileText', count: 1 },
          { name: 'Site Summary (Legacy)', href: '/site-summary-legacy', icon: 'Archive', count: 1 },
          { name: 'After Hour and Building/Site...', href: '/after-hour-access', icon: 'Clock', count: 1 },
          { name: 'Onsite Information', href: '/onsite-information', icon: 'AlertTriangle' },
          { name: 'Locations', href: '/locations', icon: 'MapPin', count: counts.locations || 0 },
          { name: 'Contacts', href: '/contacts', icon: 'Users', count: counts.contacts || 0 }
        ]
      },
      'CORE DOCUMENTATION': {
        name: 'CORE DOCUMENTATION',
        items: [],
        systemItems: [
          { name: 'TIS Standards Exception', href: '/tis-standards-exception', icon: 'AlertTriangle' },
          { name: 'TIS Contract Exceptions', href: '/tis-contract-exceptions', icon: 'FileX' },
          { name: 'Request for Change Form (RFC)', href: '/rfc', icon: 'Clock' },
          { name: 'Change Log', href: '/change-log', icon: 'FileText' },
          { name: 'Configurations', href: '/configurations', icon: 'Settings', count: counts.configurations || 0 },
          { name: 'Documents', href: '/documents', icon: 'FileText', count: counts.documents || 0 },
          { name: 'Domains - Liongard', href: '/domains-liongard', icon: 'FileText', count: counts.domains || 0 },
          { name: 'Domain Tracker', href: '/domain-tracker', icon: 'Globe', count: counts.domains || 0 },
          { name: 'Known Issues', href: '/known-issues', icon: 'AlertTriangle', count: 0 },
          { name: 'Maintenance Windows', href: '/maintenance-windows', icon: 'Zap' },
          { name: 'Multi-Factor Authentication', href: '/mfa', icon: 'Shield', count: 0 },
          { name: 'Networks', href: '/networks', icon: 'Network', count: counts.networks || 0 },
          { name: 'Passwords', href: '/passwords', icon: 'Key', count: counts.passwords || 0 },
          { name: 'SSL Tracker', href: '/ssl-tracker', icon: 'Lock', count: counts.ssl_certificates || 0 },
          { name: 'TLS/SSL Certificate', href: '/tls-ssl-certificate', icon: 'Shield', count: counts.ssl_certificates || 0 }
        ]
      }
    }

    // Group custom items by parent category - they will appear AFTER system items
    items.forEach(item => {
      const category = item.parent_category || 'CLIENT CONTACT'

      if (!defaultSidebar[category]) {
        // If category doesn't exist, create it
        defaultSidebar[category] = {
          name: category,
          items: [],
          systemItems: []
        }
      }
      defaultSidebar[category].items.push(item)
    })

    console.log('✅ Built sidebar categories for organization:', organizationId, defaultSidebar)

    // Cache the result
    this.cache.set(cacheKey, { data: defaultSidebar, timestamp: Date.now() })

    return defaultSidebar
  }

  // Create a new sidebar item
  static async createSidebarItem(item: Omit<SidebarItem, 'id' | 'created_at' | 'updated_at'>): Promise<SidebarItem> {
    console.log('Creating sidebar item with data:', item)

    try {
      const { data, error } = await supabase
        .from('organization_sidebar_items')
        .insert([item])
        .select()
        .single()

      if (error) {
        console.error('Supabase error creating sidebar item:', error)

        // Check for common error types
        if (error.code === '42P01') {
          throw new Error('Database table "organization_sidebar_items" does not exist. Please run the database setup SQL first.')
        } else if (error.code === '23505') {
          throw new Error('A sidebar item with this slug already exists for this organization.')
        } else if (error.message?.includes('timeout')) {
          throw new Error('Database connection timeout. Please try again.')
        } else {
          throw new Error(`Database error: ${error.message || 'Unknown error'}`)
        }
      }

      console.log('Successfully created sidebar item:', data)

      // Clear cache for this organization to force refresh
      this.clearCache(item.organization_id)

      return data
    } catch (err) {
      console.error('Error in createSidebarItem:', err)
      throw err
    }
  }

  // Update a sidebar item
  static async updateSidebarItem(id: string, updates: Partial<SidebarItem>): Promise<SidebarItem> {
    const { data, error } = await supabase
      .from('organization_sidebar_items')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating sidebar item:', error)
      throw error
    }

    return data
  }

  // Delete a sidebar item
  static async deleteSidebarItem(id: string): Promise<void> {
    const { error } = await supabase
      .from('organization_sidebar_items')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting sidebar item:', error)
      throw error
    }
  }

  // Get available icons for sidebar items
  static getAvailableIcons(): { value: string; label: string }[] {
    return [
      { value: 'FileText', label: 'Document' },
      { value: 'Folder', label: 'Folder' },
      { value: 'Users', label: 'Users' },
      { value: 'Phone', label: 'Phone' },
      { value: 'Mail', label: 'Email' },
      { value: 'Settings', label: 'Settings' },
      { value: 'Code', label: 'Code' },
      { value: 'Database', label: 'Database' },
      { value: 'Server', label: 'Server' },
      { value: 'Network', label: 'Network' },
      { value: 'Shield', label: 'Security' },
      { value: 'Key', label: 'Key' },
      { value: 'Lock', label: 'Lock' },
      { value: 'Globe', label: 'Globe' },
      { value: 'Calendar', label: 'Calendar' },
      { value: 'Clock', label: 'Clock' },
      { value: 'Bug', label: 'Bug' },
      { value: 'AlertTriangle', label: 'Alert' },
      { value: 'CheckCircle', label: 'Check' },
      { value: 'Info', label: 'Info' },
      { value: 'Star', label: 'Star' },
      { value: 'Heart', label: 'Heart' },
      { value: 'Bookmark', label: 'Bookmark' },
      { value: 'Tag', label: 'Tag' }
    ]
  }

  // Get available parent categories - Exact ITGlue structure
  static getAvailableCategories(): { value: string; label: string }[] {
    return [
      { value: 'CLIENT CONTACT', label: 'Client Contact' },
      { value: 'CORE DOCUMENTATION', label: 'Core Documentation' }
    ]
  }
}
