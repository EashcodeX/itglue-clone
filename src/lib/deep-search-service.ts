import { supabase } from './supabase'

export interface DeepSearchResult {
  id: string
  title: string
  description?: string
  type: 'sidebar_item' | 'page_content' | 'organization' | 'contact' | 'location' | 'document' | 'password' | 'configuration' | 'domain' | 'asset' | 'custom_field'
  subtype?: string
  organizationId?: string
  organizationName?: string
  category?: string
  url?: string
  matchedFields: string[]
  matchedText: string
  relevanceScore: number
  metadata?: any
  createdAt?: string
  updatedAt?: string
}

export interface SearchFilters {
  contentTypes?: string[]
  organizationIds?: string[]
  categories?: string[]
  dateRange?: {
    start: string
    end: string
  }
}

export interface SearchOptions {
  query: string
  scope: 'global' | 'organization'
  organizationId?: string
  filters?: SearchFilters
  limit?: number
  fuzzySearch?: boolean
  includeArchived?: boolean
}

export class DeepSearchService {
  private static SEARCH_CACHE = new Map<string, { data: DeepSearchResult[], timestamp: number }>()
  private static CACHE_DURATION = 30000 // 30 seconds

  // Main search function that orchestrates all search types
  static async performDeepSearch(options: SearchOptions): Promise<DeepSearchResult[]> {
    const { query, scope, organizationId, filters, limit = 50, fuzzySearch = true } = options
    
    if (!query || query.trim().length < 2) {
      return []
    }

    console.log('🔍 Performing deep search:', { query, scope, organizationId, filters })

    // Check cache first
    const cacheKey = `${query}-${scope}-${organizationId}-${JSON.stringify(filters)}`
    const cached = this.SEARCH_CACHE.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      console.log('📦 Using cached search results')
      return cached.data.slice(0, limit)
    }

    try {
      // Perform parallel searches across all content types
      const searchPromises = [
        this.searchSidebarItems(query, scope, organizationId),
        this.searchPageContents(query, scope, organizationId),
        this.searchOrganizations(query, scope, organizationId),
        this.searchContacts(query, scope, organizationId),
        this.searchLocations(query, scope, organizationId),
        this.searchDocuments(query, scope, organizationId),
        this.searchPasswords(query, scope, organizationId),
        this.searchConfigurations(query, scope, organizationId),
        this.searchDomains(query, scope, organizationId),
        this.searchAssets(query, scope, organizationId),
        this.searchCustomFields(query, scope, organizationId)
      ]

      const searchResults = await Promise.allSettled(searchPromises)
      
      // Combine all results
      let allResults: DeepSearchResult[] = []
      searchResults.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value) {
          allResults = allResults.concat(result.value)
        } else if (result.status === 'rejected') {
          console.error(`Search failed for type ${index}:`, result.reason)
        }
      })

      // Apply filters
      if (filters) {
        allResults = this.applyFilters(allResults, filters)
      }

      // Sort by relevance score and limit results
      allResults.sort((a, b) => b.relevanceScore - a.relevanceScore)
      const limitedResults = allResults.slice(0, limit)

      // Cache results
      this.SEARCH_CACHE.set(cacheKey, { data: limitedResults, timestamp: Date.now() })

      console.log(`✅ Deep search completed: ${limitedResults.length} results found`)
      return limitedResults

    } catch (error) {
      console.error('❌ Deep search error:', error)
      return []
    }
  }

  // Search sidebar navigation items
  private static async searchSidebarItems(query: string, scope: string, organizationId?: string): Promise<DeepSearchResult[]> {
    try {
      let queryBuilder = supabase
        .from('organization_sidebar_items')
        .select(`
          id,
          organization_id,
          item_name,
          item_slug,
          item_type,
          icon,
          description,
          parent_category,
          created_at,
          updated_at,
          organizations:organization_id(name)
        `)
        .eq('is_active', true)

      if (scope === 'organization' && organizationId) {
        queryBuilder = queryBuilder.eq('organization_id', organizationId)
      }

      // Search in multiple fields
      queryBuilder = queryBuilder.or(`item_name.ilike.%${query}%,description.ilike.%${query}%,parent_category.ilike.%${query}%`)

      const { data, error } = await queryBuilder.limit(20)

      if (error) {
        console.error('Error searching sidebar items:', error)
        return []
      }

      return (data || []).map(item => ({
        id: item.id,
        title: item.item_name,
        description: item.description,
        type: 'sidebar_item' as const,
        subtype: item.item_type,
        organizationId: item.organization_id,
        organizationName: (item.organizations as any)?.name,
        category: item.parent_category,
        url: `/organizations/${item.organization_id}/${item.item_slug}`,
        matchedFields: this.getMatchedFields(query, {
          item_name: item.item_name,
          description: item.description,
          parent_category: item.parent_category
        }),
        matchedText: this.extractMatchedText(query, item.item_name + ' ' + (item.description || '')),
        relevanceScore: this.calculateRelevanceScore(query, item.item_name, item.description),
        metadata: {
          icon: item.icon,
          slug: item.item_slug
        },
        createdAt: item.created_at,
        updatedAt: item.updated_at
      }))
    } catch (error) {
      console.error('Error in searchSidebarItems:', error)
      return []
    }
  }

  // Search page contents
  private static async searchPageContents(query: string, scope: string, organizationId?: string): Promise<DeepSearchResult[]> {
    try {
      let queryBuilder = supabase
        .from('page_contents')
        .select(`
          id,
          sidebar_item_id,
          content_type,
          content_data,
          created_at,
          updated_at,
          organization_sidebar_items:sidebar_item_id(
            item_name,
            organization_id,
            item_slug,
            organizations:organization_id(name)
          )
        `)

      const { data, error } = await queryBuilder.limit(30)

      if (error) {
        console.error('Error searching page contents:', error)
        return []
      }

      const results: DeepSearchResult[] = []
      
      for (const content of data || []) {
        const sidebarItem = content.organization_sidebar_items as any
        
        // Skip if organization filter doesn't match
        if (scope === 'organization' && organizationId && sidebarItem?.organization_id !== organizationId) {
          continue
        }

        // Search within content_data
        const contentText = this.extractTextFromContentData(content.content_data)
        if (contentText.toLowerCase().includes(query.toLowerCase())) {
          results.push({
            id: content.id,
            title: sidebarItem?.item_name || 'Untitled Page',
            description: this.extractMatchedText(query, contentText, 200),
            type: 'page_content' as const,
            subtype: content.content_type,
            organizationId: sidebarItem?.organization_id,
            organizationName: sidebarItem?.organizations?.name,
            url: `/organizations/${sidebarItem?.organization_id}/${sidebarItem?.item_slug}`,
            matchedFields: ['content'],
            matchedText: this.extractMatchedText(query, contentText),
            relevanceScore: this.calculateRelevanceScore(query, sidebarItem?.item_name || '', contentText),
            metadata: {
              contentType: content.content_type,
              sidebarItemId: content.sidebar_item_id
            },
            createdAt: content.created_at,
            updatedAt: content.updated_at
          })
        }
      }

      return results
    } catch (error) {
      console.error('Error in searchPageContents:', error)
      return []
    }
  }

  // Search organizations
  private static async searchOrganizations(query: string, scope: string, organizationId?: string): Promise<DeepSearchResult[]> {
    try {
      // Skip organization search if we're in organization scope
      if (scope === 'organization') {
        return []
      }

      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .or(`name.ilike.%${query}%,description.ilike.%${query}%,website.ilike.%${query}%,email.ilike.%${query}%`)
        .limit(10)

      if (error) {
        console.error('Error searching organizations:', error)
        return []
      }

      return (data || []).map(org => ({
        id: org.id,
        title: org.name,
        description: org.description,
        type: 'organization' as const,
        url: `/organizations/${org.id}`,
        matchedFields: this.getMatchedFields(query, {
          name: org.name,
          description: org.description,
          website: org.website,
          email: org.email
        }),
        matchedText: this.extractMatchedText(query, org.name + ' ' + (org.description || '')),
        relevanceScore: this.calculateRelevanceScore(query, org.name, org.description),
        metadata: {
          website: org.website,
          email: org.email,
          status: org.status
        },
        createdAt: org.created_at,
        updatedAt: org.updated_at
      }))
    } catch (error) {
      console.error('Error in searchOrganizations:', error)
      return []
    }
  }

  // Helper method to extract text from content_data
  private static extractTextFromContentData(contentData: any): string {
    if (!contentData) return ''
    
    try {
      if (typeof contentData === 'string') {
        return contentData
      }
      
      if (typeof contentData === 'object') {
        // Handle different content types
        if (contentData.content) {
          // Rich text content
          return this.stripHtml(contentData.content)
        }
        
        if (contentData.contacts) {
          // Contact form data
          return contentData.contacts.map((c: any) => 
            `${c.name || ''} ${c.email || ''} ${c.phone || ''} ${c.notes || ''}`
          ).join(' ')
        }
        
        if (contentData.locations) {
          // Location data
          return contentData.locations.map((l: any) => 
            `${l.name || ''} ${l.address || ''} ${l.city || ''} ${l.notes || ''}`
          ).join(' ')
        }
        
        // Generic object search
        return JSON.stringify(contentData).toLowerCase()
      }
      
      return String(contentData)
    } catch (error) {
      return ''
    }
  }

  // Helper method to strip HTML tags
  private static stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  }

  // Helper method to calculate relevance score
  private static calculateRelevanceScore(query: string, title: string, description?: string): number {
    const queryLower = query.toLowerCase()
    const titleLower = (title || '').toLowerCase()
    const descLower = (description || '').toLowerCase()
    
    let score = 0
    
    // Exact title match gets highest score
    if (titleLower === queryLower) score += 100
    else if (titleLower.includes(queryLower)) score += 50
    
    // Description matches
    if (descLower.includes(queryLower)) score += 25
    
    // Word boundary matches get bonus
    const wordBoundaryRegex = new RegExp(`\\b${queryLower}\\b`)
    if (wordBoundaryRegex.test(titleLower)) score += 30
    if (wordBoundaryRegex.test(descLower)) score += 15
    
    return score
  }

  // Helper method to get matched fields
  private static getMatchedFields(query: string, fields: Record<string, string | null | undefined>): string[] {
    const queryLower = query.toLowerCase()
    const matched: string[] = []
    
    Object.entries(fields).forEach(([key, value]) => {
      if (value && value.toLowerCase().includes(queryLower)) {
        matched.push(key)
      }
    })
    
    return matched
  }

  // Helper method to extract matched text with context
  private static extractMatchedText(query: string, text: string, maxLength: number = 150): string {
    if (!text) return ''
    
    const queryLower = query.toLowerCase()
    const textLower = text.toLowerCase()
    const index = textLower.indexOf(queryLower)
    
    if (index === -1) {
      return text.substring(0, maxLength) + (text.length > maxLength ? '...' : '')
    }
    
    const start = Math.max(0, index - 50)
    const end = Math.min(text.length, index + query.length + 50)
    
    let excerpt = text.substring(start, end)
    if (start > 0) excerpt = '...' + excerpt
    if (end < text.length) excerpt = excerpt + '...'
    
    return excerpt
  }

  // Apply filters to search results
  private static applyFilters(results: DeepSearchResult[], filters: SearchFilters): DeepSearchResult[] {
    let filtered = results
    
    if (filters.contentTypes && filters.contentTypes.length > 0) {
      filtered = filtered.filter(result => filters.contentTypes!.includes(result.type))
    }
    
    if (filters.organizationIds && filters.organizationIds.length > 0) {
      filtered = filtered.filter(result => 
        result.organizationId && filters.organizationIds!.includes(result.organizationId)
      )
    }
    
    if (filters.categories && filters.categories.length > 0) {
      filtered = filtered.filter(result => 
        result.category && filters.categories!.includes(result.category)
      )
    }
    
    if (filters.dateRange) {
      const startDate = new Date(filters.dateRange.start)
      const endDate = new Date(filters.dateRange.end)
      
      filtered = filtered.filter(result => {
        if (!result.createdAt) return true
        const createdDate = new Date(result.createdAt)
        return createdDate >= startDate && createdDate <= endDate
      })
    }
    
    return filtered
  }

  // Search contacts
  private static async searchContacts(query: string, scope: string, organizationId?: string): Promise<DeepSearchResult[]> {
    try {
      let queryBuilder = supabase
        .from('contacts')
        .select(`
          id,
          organization_id,
          first_name,
          last_name,
          company,
          title,
          email,
          phone,
          mobile,
          notes,
          created_at,
          updated_at,
          organizations:organization_id(name)
        `)

      if (scope === 'organization' && organizationId) {
        queryBuilder = queryBuilder.eq('organization_id', organizationId)
      }

      queryBuilder = queryBuilder.or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,company.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%,notes.ilike.%${query}%`)

      const { data, error } = await queryBuilder.limit(15)

      if (error) {
        console.error('Error searching contacts:', error)
        return []
      }

      return (data || []).map(contact => ({
        id: contact.id,
        title: `${contact.first_name || ''} ${contact.last_name || ''}`.trim() || contact.company || 'Unnamed Contact',
        description: `${contact.title || ''} ${contact.email || ''} ${contact.phone || ''}`.trim(),
        type: 'contact' as const,
        organizationId: contact.organization_id,
        organizationName: (contact.organizations as any)?.name,
        url: `/organizations/${contact.organization_id}/contacts`,
        matchedFields: this.getMatchedFields(query, {
          first_name: contact.first_name,
          last_name: contact.last_name,
          company: contact.company,
          email: contact.email,
          phone: contact.phone,
          notes: contact.notes
        }),
        matchedText: this.extractMatchedText(query, `${contact.first_name || ''} ${contact.last_name || ''} ${contact.email || ''} ${contact.notes || ''}`),
        relevanceScore: this.calculateRelevanceScore(query, `${contact.first_name || ''} ${contact.last_name || ''}`, contact.email),
        metadata: {
          email: contact.email,
          phone: contact.phone,
          company: contact.company
        },
        createdAt: contact.created_at,
        updatedAt: contact.updated_at
      }))
    } catch (error) {
      console.error('Error in searchContacts:', error)
      return []
    }
  }

  // Search locations
  private static async searchLocations(query: string, scope: string, organizationId?: string): Promise<DeepSearchResult[]> {
    try {
      let queryBuilder = supabase
        .from('locations')
        .select(`
          id,
          organization_id,
          name,
          address,
          city,
          state,
          country,
          postal_code,
          notes,
          created_at,
          updated_at,
          organizations:organization_id(name)
        `)

      if (scope === 'organization' && organizationId) {
        queryBuilder = queryBuilder.eq('organization_id', organizationId)
      }

      queryBuilder = queryBuilder.or(`name.ilike.%${query}%,address.ilike.%${query}%,city.ilike.%${query}%,state.ilike.%${query}%,country.ilike.%${query}%,notes.ilike.%${query}%`)

      const { data, error } = await queryBuilder.limit(10)

      if (error) {
        console.error('Error searching locations:', error)
        return []
      }

      return (data || []).map(location => ({
        id: location.id,
        title: location.name || 'Unnamed Location',
        description: `${location.address || ''} ${location.city || ''} ${location.state || ''}`.trim(),
        type: 'location' as const,
        organizationId: location.organization_id,
        organizationName: (location.organizations as any)?.name,
        url: `/organizations/${location.organization_id}/locations`,
        matchedFields: this.getMatchedFields(query, {
          name: location.name,
          address: location.address,
          city: location.city,
          state: location.state,
          country: location.country,
          notes: location.notes
        }),
        matchedText: this.extractMatchedText(query, `${location.name || ''} ${location.address || ''} ${location.notes || ''}`),
        relevanceScore: this.calculateRelevanceScore(query, location.name || '', location.address),
        metadata: {
          address: location.address,
          city: location.city,
          state: location.state,
          country: location.country
        },
        createdAt: location.created_at,
        updatedAt: location.updated_at
      }))
    } catch (error) {
      console.error('Error in searchLocations:', error)
      return []
    }
  }

  // Search documents
  private static async searchDocuments(query: string, scope: string, organizationId?: string): Promise<DeepSearchResult[]> {
    try {
      let queryBuilder = supabase
        .from('documents')
        .select(`
          id,
          organization_id,
          name,
          description,
          category,
          file_type,
          created_at,
          updated_at,
          organizations:organization_id(name)
        `)

      if (scope === 'organization' && organizationId) {
        queryBuilder = queryBuilder.eq('organization_id', organizationId)
      }

      queryBuilder = queryBuilder.or(`name.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%`)

      const { data, error } = await queryBuilder.limit(10)

      if (error) {
        console.error('Error searching documents:', error)
        return []
      }

      return (data || []).map(doc => ({
        id: doc.id,
        title: doc.name || 'Untitled Document',
        description: doc.description,
        type: 'document' as const,
        subtype: doc.file_type,
        organizationId: doc.organization_id,
        organizationName: (doc.organizations as any)?.name,
        category: doc.category,
        url: `/organizations/${doc.organization_id}/documents`,
        matchedFields: this.getMatchedFields(query, {
          name: doc.name,
          description: doc.description,
          category: doc.category
        }),
        matchedText: this.extractMatchedText(query, `${doc.name || ''} ${doc.description || ''}`),
        relevanceScore: this.calculateRelevanceScore(query, doc.name || '', doc.description),
        metadata: {
          fileType: doc.file_type,
          category: doc.category
        },
        createdAt: doc.created_at,
        updatedAt: doc.updated_at
      }))
    } catch (error) {
      console.error('Error in searchDocuments:', error)
      return []
    }
  }

  // Search passwords
  private static async searchPasswords(query: string, scope: string, organizationId?: string): Promise<DeepSearchResult[]> {
    try {
      let queryBuilder = supabase
        .from('passwords')
        .select(`
          id,
          organization_id,
          name,
          username,
          url,
          notes,
          category,
          created_at,
          updated_at,
          organizations:organization_id(name)
        `)

      if (scope === 'organization' && organizationId) {
        queryBuilder = queryBuilder.eq('organization_id', organizationId)
      }

      queryBuilder = queryBuilder.or(`name.ilike.%${query}%,username.ilike.%${query}%,url.ilike.%${query}%,notes.ilike.%${query}%,category.ilike.%${query}%`)

      const { data, error } = await queryBuilder.limit(10)

      if (error) {
        console.error('Error searching passwords:', error)
        return []
      }

      return (data || []).map(pwd => ({
        id: pwd.id,
        title: pwd.name || 'Untitled Password',
        description: `${pwd.username || ''} ${pwd.url || ''}`.trim(),
        type: 'password' as const,
        organizationId: pwd.organization_id,
        organizationName: (pwd.organizations as any)?.name,
        category: pwd.category,
        url: `/organizations/${pwd.organization_id}/passwords`,
        matchedFields: this.getMatchedFields(query, {
          name: pwd.name,
          username: pwd.username,
          url: pwd.url,
          notes: pwd.notes,
          category: pwd.category
        }),
        matchedText: this.extractMatchedText(query, `${pwd.name || ''} ${pwd.username || ''} ${pwd.notes || ''}`),
        relevanceScore: this.calculateRelevanceScore(query, pwd.name || '', pwd.username),
        metadata: {
          username: pwd.username,
          url: pwd.url,
          category: pwd.category
        },
        createdAt: pwd.created_at,
        updatedAt: pwd.updated_at
      }))
    } catch (error) {
      console.error('Error in searchPasswords:', error)
      return []
    }
  }

  // Search configurations
  private static async searchConfigurations(query: string, scope: string, organizationId?: string): Promise<DeepSearchResult[]> {
    try {
      let queryBuilder = supabase
        .from('configurations')
        .select(`
          id,
          organization_id,
          name,
          description,
          config_type,
          created_at,
          updated_at,
          organizations:organization_id(name)
        `)

      if (scope === 'organization' && organizationId) {
        queryBuilder = queryBuilder.eq('organization_id', organizationId)
      }

      queryBuilder = queryBuilder.or(`name.ilike.%${query}%,description.ilike.%${query}%,config_type.ilike.%${query}%`)

      const { data, error } = await queryBuilder.limit(10)

      if (error) {
        console.error('Error searching configurations:', error)
        return []
      }

      return (data || []).map(config => ({
        id: config.id,
        title: config.name || 'Untitled Configuration',
        description: config.description,
        type: 'configuration' as const,
        subtype: config.config_type,
        organizationId: config.organization_id,
        organizationName: (config.organizations as any)?.name,
        url: `/organizations/${config.organization_id}/configurations`,
        matchedFields: this.getMatchedFields(query, {
          name: config.name,
          description: config.description,
          config_type: config.config_type
        }),
        matchedText: this.extractMatchedText(query, `${config.name || ''} ${config.description || ''}`),
        relevanceScore: this.calculateRelevanceScore(query, config.name || '', config.description),
        metadata: {
          configType: config.config_type
        },
        createdAt: config.created_at,
        updatedAt: config.updated_at
      }))
    } catch (error) {
      console.error('Error in searchConfigurations:', error)
      return []
    }
  }

  // Search domains
  private static async searchDomains(query: string, scope: string, organizationId?: string): Promise<DeepSearchResult[]> {
    try {
      let queryBuilder = supabase
        .from('domains')
        .select(`
          id,
          organization_id,
          domain_name,
          registrar,
          notes,
          created_at,
          updated_at,
          organizations:organization_id(name)
        `)

      if (scope === 'organization' && organizationId) {
        queryBuilder = queryBuilder.eq('organization_id', organizationId)
      }

      queryBuilder = queryBuilder.or(`domain_name.ilike.%${query}%,registrar.ilike.%${query}%,notes.ilike.%${query}%`)

      const { data, error } = await queryBuilder.limit(10)

      if (error) {
        console.error('Error searching domains:', error)
        return []
      }

      return (data || []).map(domain => ({
        id: domain.id,
        title: domain.domain_name || 'Untitled Domain',
        description: `Registrar: ${domain.registrar || 'Unknown'}`,
        type: 'domain' as const,
        organizationId: domain.organization_id,
        organizationName: (domain.organizations as any)?.name,
        url: `/organizations/${domain.organization_id}/domains`,
        matchedFields: this.getMatchedFields(query, {
          domain_name: domain.domain_name,
          registrar: domain.registrar,
          notes: domain.notes
        }),
        matchedText: this.extractMatchedText(query, `${domain.domain_name || ''} ${domain.registrar || ''} ${domain.notes || ''}`),
        relevanceScore: this.calculateRelevanceScore(query, domain.domain_name || '', domain.registrar),
        metadata: {
          registrar: domain.registrar
        },
        createdAt: domain.created_at,
        updatedAt: domain.updated_at
      }))
    } catch (error) {
      console.error('Error in searchDomains:', error)
      return []
    }
  }

  // Search assets
  private static async searchAssets(query: string, scope: string, organizationId?: string): Promise<DeepSearchResult[]> {
    try {
      let queryBuilder = supabase
        .from('assets')
        .select(`
          id,
          organization_id,
          name,
          description,
          asset_type,
          manufacturer,
          model,
          serial_number,
          created_at,
          updated_at,
          organizations:organization_id(name)
        `)

      if (scope === 'organization' && organizationId) {
        queryBuilder = queryBuilder.eq('organization_id', organizationId)
      }

      queryBuilder = queryBuilder.or(`name.ilike.%${query}%,description.ilike.%${query}%,manufacturer.ilike.%${query}%,model.ilike.%${query}%,serial_number.ilike.%${query}%`)

      const { data, error } = await queryBuilder.limit(10)

      if (error) {
        console.error('Error searching assets:', error)
        return []
      }

      return (data || []).map(asset => ({
        id: asset.id,
        title: asset.name || 'Untitled Asset',
        description: `${asset.manufacturer || ''} ${asset.model || ''}`.trim(),
        type: 'asset' as const,
        subtype: asset.asset_type,
        organizationId: asset.organization_id,
        organizationName: (asset.organizations as any)?.name,
        url: `/organizations/${asset.organization_id}/assets`,
        matchedFields: this.getMatchedFields(query, {
          name: asset.name,
          description: asset.description,
          manufacturer: asset.manufacturer,
          model: asset.model,
          serial_number: asset.serial_number
        }),
        matchedText: this.extractMatchedText(query, `${asset.name || ''} ${asset.description || ''} ${asset.manufacturer || ''}`),
        relevanceScore: this.calculateRelevanceScore(query, asset.name || '', asset.description),
        metadata: {
          assetType: asset.asset_type,
          manufacturer: asset.manufacturer,
          model: asset.model,
          serialNumber: asset.serial_number
        },
        createdAt: asset.created_at,
        updatedAt: asset.updated_at
      }))
    } catch (error) {
      console.error('Error in searchAssets:', error)
      return []
    }
  }

  // Search custom fields (placeholder for future implementation)
  private static async searchCustomFields(query: string, scope: string, organizationId?: string): Promise<DeepSearchResult[]> {
    // This would search through custom fields when that feature is implemented
    // For now, return empty array
    return []
  }

  // Clear search cache
  static clearCache(): void {
    this.SEARCH_CACHE.clear()
  }
}
