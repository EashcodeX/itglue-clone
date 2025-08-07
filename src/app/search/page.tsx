'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

// Force dynamic rendering to avoid prerendering issues
export const dynamic = 'force-dynamic'
import { Search, Filter, X, Building2, Users, FileText, Settings, MapPin, Key, Globe, Loader2 } from 'lucide-react'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import { DeepSearchService, type DeepSearchResult, type SearchOptions } from '@/lib/deep-search-service'
import { useSearchContext, useOrganizationName } from '@/hooks/useSearchContext'

function SearchPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  // Get current context
  const searchContext = useSearchContext()
  const organizationName = useOrganizationName(searchContext.organizationId)

  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [results, setResults] = useState<DeepSearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedFilters, setSelectedFilters] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<'relevance' | 'date' | 'name'>('relevance')
  const [showFilters, setShowFilters] = useState(false)
  const [scope, setScope] = useState<'global' | 'organization'>(searchContext.scope)
  const [organizationId, setOrganizationId] = useState<string>(searchContext.organizationId || '')

  // Initialize from URL params and context
  useEffect(() => {
    const urlQuery = searchParams.get('q')
    const urlScope = searchParams.get('scope') as 'global' | 'organization'
    const urlOrgId = searchParams.get('org')
    const urlFilters = searchParams.get('filters')

    // Use URL params if available, otherwise fall back to context
    const effectiveScope = urlScope || searchContext.scope
    const effectiveOrgId = urlOrgId || searchContext.organizationId || ''

    if (urlQuery) setQuery(urlQuery)
    setScope(effectiveScope)
    setOrganizationId(effectiveOrgId)

    if (urlFilters) {
      try {
        setSelectedFilters(JSON.parse(urlFilters))
      } catch (e) {
        console.warn('Invalid filters in URL')
      }
    }

    if (urlQuery) {
      performSearch(urlQuery, effectiveScope, effectiveOrgId, urlFilters ? JSON.parse(urlFilters) : [])
    }
  }, [searchParams, searchContext])

  const performSearch = useCallback(async (
    searchQuery: string, 
    searchScope: 'global' | 'organization' = scope,
    orgId: string = organizationId,
    filters: string[] = selectedFilters
  ) => {
    if (!searchQuery.trim()) {
      setResults([])
      return
    }

    setIsLoading(true)

    try {
      const searchOptions: SearchOptions = {
        query: searchQuery,
        scope: searchScope,
        organizationId: orgId || undefined,
        filters: filters.length > 0 ? { contentTypes: filters } : undefined,
        limit: 100,
        fuzzySearch: true
      }

      const searchResults = await DeepSearchService.performDeepSearch(searchOptions)
      
      // Sort results
      const sortedResults = [...searchResults].sort((a, b) => {
        switch (sortBy) {
          case 'relevance':
            return b.relevanceScore - a.relevanceScore
          case 'date':
            return new Date(b.updatedAt || b.createdAt || '').getTime() - 
                   new Date(a.updatedAt || a.createdAt || '').getTime()
          case 'name':
            return a.title.localeCompare(b.title)
          default:
            return 0
        }
      })

      setResults(sortedResults)
    } catch (error) {
      console.error('Search error:', error)
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }, [scope, organizationId, selectedFilters, sortBy])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Update URL
    const params = new URLSearchParams()
    params.set('q', query)
    params.set('scope', scope)
    if (organizationId) params.set('org', organizationId)
    if (selectedFilters.length > 0) params.set('filters', JSON.stringify(selectedFilters))
    
    router.push(`/search?${params.toString()}`)
    performSearch(query)
  }

  const toggleFilter = (filterId: string) => {
    const newFilters = selectedFilters.includes(filterId)
      ? selectedFilters.filter(id => id !== filterId)
      : [...selectedFilters, filterId]
    
    setSelectedFilters(newFilters)
    if (query) {
      performSearch(query, scope, organizationId, newFilters)
    }
  }

  const clearFilters = () => {
    setSelectedFilters([])
    if (query) {
      performSearch(query, scope, organizationId, [])
    }
  }

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'organization': return <Building2 className="w-5 h-5 text-blue-400" />
      case 'contact': return <Users className="w-5 h-5 text-green-400" />
      case 'document': return <FileText className="w-5 h-5 text-purple-400" />
      case 'configuration': return <Settings className="w-5 h-5 text-orange-400" />
      case 'location': return <MapPin className="w-5 h-5 text-red-400" />
      case 'password': return <Key className="w-5 h-5 text-yellow-400" />
      case 'sidebar_item': return <FileText className="w-5 h-5 text-cyan-400" />
      case 'page_content': return <FileText className="w-5 h-5 text-indigo-400" />
      case 'domain': return <Globe className="w-5 h-5 text-pink-400" />
      case 'asset': return <Settings className="w-5 h-5 text-teal-400" />
      default: return <FileText className="w-5 h-5 text-gray-400" />
    }
  }

  const contentTypeFilters = [
    { id: 'sidebar_item', label: 'Navigation Items' },
    { id: 'page_content', label: 'Page Content' },
    { id: 'organization', label: 'Organizations' },
    { id: 'contact', label: 'Contacts' },
    { id: 'location', label: 'Locations' },
    { id: 'document', label: 'Documents' },
    { id: 'password', label: 'Passwords' },
    { id: 'configuration', label: 'Configurations' },
    { id: 'domain', label: 'Domains' },
    { id: 'asset', label: 'Assets' }
  ]

  const handleSidebarItemClick = (item: any) => {
    if (item.href) {
      if (item.href === '/') {
        router.push('/')
      } else {
        router.push(`/organizations/${organizationId}${item.href}`)
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header currentPage="Search Results" />
      <div className="flex">
        <Sidebar onItemClick={handleSidebarItemClick} />
        
        <div className="flex-1 p-6">
          {/* Search Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <div className={`p-2 rounded-lg ${
                scope === 'global'
                  ? 'bg-blue-500/20 text-blue-400'
                  : 'bg-green-500/20 text-green-400'
              }`}>
                {scope === 'global' ? (
                  <Globe className="w-6 h-6" />
                ) : (
                  <Building2 className="w-6 h-6" />
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold">
                  {scope === 'global' ? 'Global Search Results' : 'Organization Search Results'}
                </h1>
                <p className="text-gray-400">
                  {scope === 'global'
                    ? 'Searching across all organizations and data'
                    : `Searching within ${organizationName || 'this organization'}`
                  }
                </p>
              </div>
            </div>

            {/* Search Form */}
            <form onSubmit={handleSearch} className="mb-6">
              <div className="flex items-center space-x-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={scope === 'global'
                      ? 'Search across all organizations and data...'
                      : `Search within ${organizationName || 'this organization'}...`
                    }
                    className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg font-medium transition-colors"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Search'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowFilters(!showFilters)}
                  className="px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                >
                  <Filter className="w-5 h-5" />
                </button>
              </div>
            </form>

            {/* Search Options */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <select
                  value={scope}
                  onChange={(e) => setScope(e.target.value as 'global' | 'organization')}
                  className="px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                >
                  <option value="global">Global Search</option>
                  <option value="organization">Organization Search</option>
                </select>
                
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'relevance' | 'date' | 'name')}
                  className="px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                >
                  <option value="relevance">Sort by Relevance</option>
                  <option value="date">Sort by Date</option>
                  <option value="name">Sort by Name</option>
                </select>
              </div>

              {results.length > 0 && (
                <span className="text-gray-400">
                  {results.length} result{results.length !== 1 ? 's' : ''} found
                </span>
              )}
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mb-6 p-4 bg-gray-800 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Filter by Content Type</h3>
                {selectedFilters.length > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-blue-400 hover:text-blue-300 text-sm"
                  >
                    Clear All
                  </button>
                )}
              </div>
              
              <div className="flex flex-wrap gap-2">
                {contentTypeFilters.map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => toggleFilter(filter.id)}
                    className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedFilters.includes(filter.id)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Search Results */}
          <div className="space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
                <span className="ml-3 text-gray-400">Searching...</span>
              </div>
            ) : results.length === 0 && query ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-800 rounded-full flex items-center justify-center">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No results found</h3>
                <p className="text-gray-400">Try adjusting your search terms or filters</p>
              </div>
            ) : (
              results.map((result) => (
                <div
                  key={result.id}
                  className="p-6 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors cursor-pointer"
                  onClick={() => result.url && router.push(result.url)}
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 p-2 bg-gray-700 rounded-lg">
                      {getResultIcon(result.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-white truncate">
                          {result.title}
                        </h3>
                        <span className="px-2 py-1 bg-blue-600/20 text-blue-300 text-xs rounded-full">
                          {result.type.replace('_', ' ')}
                        </span>
                        {result.relevanceScore > 70 && (
                          <span className="px-2 py-1 bg-green-600/20 text-green-300 text-xs rounded-full">
                            High Match
                          </span>
                        )}
                      </div>
                      
                      {result.description && (
                        <p className="text-gray-300 mb-3 line-clamp-2">
                          {result.description}
                        </p>
                      )}
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-400">
                        {result.organizationName && (
                          <span>📍 {result.organizationName}</span>
                        )}
                        {result.category && (
                          <span>🏷️ {result.category}</span>
                        )}
                        {result.matchedFields && result.matchedFields.length > 0 && (
                          <span>🎯 Matched: {result.matchedFields.join(', ')}</span>
                        )}
                      </div>
                      
                      {result.matchedText && (
                        <div className="mt-3 p-3 bg-gray-700/50 rounded text-sm text-gray-300 italic">
                          "{result.matchedText}"
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-400 mx-auto mb-4" />
          <p className="text-gray-400">Loading search...</p>
        </div>
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  )
}
