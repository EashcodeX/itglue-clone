'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Building2, Users, ArrowRight, Loader2, Globe, Home, FileText, Settings, MapPin, Key } from 'lucide-react'
import { useSearchContext, useOrganizationName } from '@/hooks/useSearchContext'

interface SearchResult {
  id: string
  name: string
  type: 'organization' | 'client' | 'document' | 'contact' | 'configuration' | 'location' | 'password' | 'sidebar_item' | 'page_content' | 'domain' | 'asset' | 'custom_field'
  subtype?: string
  description?: string
  contactCount?: number
  locationCount?: number
  organizationName?: string
  category?: string
  url?: string
  matchedFields?: string[]
  matchedText?: string
  relevanceScore?: number
  metadata?: any
}

interface GlobalSearchProps {
  isOpen: boolean
  onClose: () => void
}

export default function GlobalSearch({ isOpen, onClose }: GlobalSearchProps) {
  const router = useRouter()
  const searchInputRef = useRef<HTMLInputElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)

  // Get search context based on current page
  const searchContext = useSearchContext()

  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [useDeepSearch, setUseDeepSearch] = useState(true)
  const [selectedFilters, setSelectedFilters] = useState<string[]>([])
  const [searchType, setSearchType] = useState<'legacy' | 'deep'>('deep')
  const [currentScope, setCurrentScope] = useState<'global' | 'organization'>('global')
  const [manualScopeOverride, setManualScopeOverride] = useState(false)

  // Get organization name after context is established
  const organizationName = useOrganizationName(searchContext.organizationId)

  // Initialize and update current scope when search context changes (unless manually overridden)
  useEffect(() => {
    if (!manualScopeOverride) {
      setCurrentScope(searchContext.scope)
    }
  }, [searchContext.scope, manualScopeOverride])

  // Initialize currentScope on first render
  useEffect(() => {
    setCurrentScope(searchContext.scope)
  }, [])

  // Focus search input when modal opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus()
      setQuery('')
      setResults([])
      setSelectedIndex(0)
      setHasSearched(false)
      // Reset manual override when opening search
      setManualScopeOverride(false)
      setCurrentScope(searchContext.scope)
    }
  }, [isOpen, searchContext.scope])

  // Search function with debouncing and context awareness
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      setHasSearched(false)
      return
    }

    setIsLoading(true)
    setHasSearched(true)

    try {
      // Build search URL based on current scope (context-aware or manually overridden)
      const effectiveScope = currentScope
      const effectiveOrgId = effectiveScope === 'organization' ?
        (searchContext.organizationId || '') : undefined

      const searchParams = new URLSearchParams({
        q: searchQuery,
        scope: effectiveScope,
        deep: useDeepSearch.toString(),
        limit: '50'
      })

      if (effectiveOrgId) {
        searchParams.set('organization_id', effectiveOrgId)
      }

      // Add filters if any are selected
      if (selectedFilters.length > 0) {
        const filters = {
          contentTypes: selectedFilters
        }
        searchParams.set('filters', JSON.stringify(filters))
      }

      const response = await fetch(`/api/search/global?${searchParams.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setResults(data.results || [])
        setSearchType(data.searchType || 'legacy')
        setSelectedIndex(0)
      } else {
        console.error('Search failed:', response.statusText)
        setResults([])
      }
    } catch (error) {
      console.error('Search error:', error)
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }, [currentScope, searchContext.organizationId, useDeepSearch, selectedFilters])

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch(query)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [query, performSearch])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return

      switch (e.key) {
        case 'Escape':
          e.preventDefault()
          onClose()
          break
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex(prev => Math.min(prev + 1, results.length - 1))
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex(prev => Math.max(prev - 1, 0))
          break
        case 'Enter':
          e.preventDefault()
          if (results[selectedIndex]) {
            handleSelectResult(results[selectedIndex])
          }
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, results, selectedIndex, onClose])

  // Scroll selected item into view
  useEffect(() => {
    if (resultsRef.current && results.length > 0) {
      const selectedElement = resultsRef.current.children[selectedIndex] as HTMLElement
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest' })
      }
    }
  }, [selectedIndex, results])

  const handleSelectResult = (result: SearchResult) => {
    // Navigate based on result type and context
    if (result.url) {
      router.push(result.url)
    } else if (result.type === 'organization') {
      router.push(`/organizations/${result.id}`)
    } else if (searchContext.scope === 'organization' && searchContext.organizationId) {
      // For organization-scoped results, navigate within the organization
      switch (result.type) {
        case 'contact':
          router.push(`/organizations/${searchContext.organizationId}/contacts`)
          break
        case 'document':
          router.push(`/organizations/${searchContext.organizationId}/documents`)
          break
        case 'configuration':
          router.push(`/organizations/${searchContext.organizationId}/configurations`)
          break
        case 'location':
          router.push(`/organizations/${searchContext.organizationId}/locations`)
          break
        case 'password':
          router.push(`/organizations/${searchContext.organizationId}/passwords`)
          break
        default:
          router.push(`/organizations/${searchContext.organizationId}`)
      }
    } else {
      // Default to organization page
      router.push(`/organizations/${result.id}`)
    }
    onClose()
  }

  const getResultIcon = (type: string, subtype?: string) => {
    switch (type) {
      case 'organization':
        return <Building2 className="w-4 h-4 text-blue-400" />
      case 'client':
      case 'contact':
        return <Users className="w-4 h-4 text-green-400" />
      case 'document':
        return <FileText className="w-4 h-4 text-purple-400" />
      case 'configuration':
        return <Settings className="w-4 h-4 text-orange-400" />
      case 'location':
        return <MapPin className="w-4 h-4 text-red-400" />
      case 'password':
        return <Key className="w-4 h-4 text-yellow-400" />
      case 'sidebar_item':
        return <FileText className="w-4 h-4 text-cyan-400" />
      case 'page_content':
        return <FileText className="w-4 h-4 text-indigo-400" />
      case 'domain':
        return <Globe className="w-4 h-4 text-pink-400" />
      case 'asset':
        return <Settings className="w-4 h-4 text-teal-400" />
      case 'custom_field':
        return <FileText className="w-4 h-4 text-amber-400" />
      default:
        return <Building2 className="w-4 h-4 text-gray-400" />
    }
  }

  // Get display name for result type
  const getResultTypeName = (type: string, subtype?: string) => {
    switch (type) {
      case 'sidebar_item': return 'Navigation Item'
      case 'page_content': return 'Page Content'
      case 'organization': return 'Organization'
      case 'contact': return 'Contact'
      case 'location': return 'Location'
      case 'document': return 'Document'
      case 'password': return 'Password'
      case 'configuration': return 'Configuration'
      case 'domain': return 'Domain'
      case 'asset': return 'Asset'
      case 'custom_field': return 'Custom Field'
      default: return type.charAt(0).toUpperCase() + type.slice(1)
    }
  }

  // Available content type filters
  const contentTypeFilters = [
    { id: 'sidebar_item', label: 'Navigation Items', icon: FileText },
    { id: 'page_content', label: 'Page Content', icon: FileText },
    { id: 'organization', label: 'Organizations', icon: Building2 },
    { id: 'contact', label: 'Contacts', icon: Users },
    { id: 'location', label: 'Locations', icon: MapPin },
    { id: 'document', label: 'Documents', icon: FileText },
    { id: 'password', label: 'Passwords', icon: Key },
    { id: 'configuration', label: 'Configurations', icon: Settings },
    { id: 'domain', label: 'Domains', icon: Globe },
    { id: 'asset', label: 'Assets', icon: Settings }
  ]

  // Toggle filter
  const toggleFilter = (filterId: string) => {
    setSelectedFilters(prev =>
      prev.includes(filterId)
        ? prev.filter(id => id !== filterId)
        : [...prev, filterId]
    )
  }

  // Toggle search scope
  const toggleScope = () => {
    const newScope = currentScope === 'global' ? 'organization' : 'global'
    setCurrentScope(newScope)
    setManualScopeOverride(true)
    // Re-run search with new scope if there's a query
    if (query.trim()) {
      performSearch(query)
    }
  }

  // Get current context info for display
  const getCurrentContextInfo = () => {
    if (currentScope === 'organization') {
      return {
        icon: 'building' as const,
        title: 'Organization Search',
        description: organizationName
          ? `Search within ${organizationName}`
          : 'Search within this organization',
        placeholder: 'Search within this organization...'
      }
    } else {
      return {
        icon: 'globe' as const,
        title: 'Global Search',
        description: 'Search across all organizations and data',
        placeholder: 'Search across all organizations...'
      }
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20">
      {/* Spotlight-style background with enhanced blur */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-spotlight" onClick={onClose} />

      {/* Animated spotlight effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl spotlight-bg" />
        <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl spotlight-bg" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 right-1/3 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl spotlight-bg" style={{ animationDelay: '2s' }} />
        <div className="absolute top-3/4 left-2/3 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl spotlight-bg" style={{ animationDelay: '3s' }} />
      </div>

      <div className="relative bg-gray-900/90 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-2xl mx-4 border border-gray-700/50 ring-1 ring-white/10">
        {/* Search Header */}
        <div className="p-6 border-b border-gray-700/50">
          {/* Context Header with Scope Toggle */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className={`p-2 rounded-lg mr-3 ${
                currentScope === 'global'
                  ? 'bg-blue-500/20 text-blue-400'
                  : 'bg-green-500/20 text-green-400'
              }`}>
                {currentScope === 'global' ? (
                  <Globe className="w-5 h-5" />
                ) : (
                  <Building2 className="w-5 h-5" />
                )}
              </div>
              <div>
                <h3 className="text-white font-medium">
                  {getCurrentContextInfo().title}
                </h3>
                <p className="text-gray-400 text-sm">
                  {getCurrentContextInfo().description}
                </p>
              </div>
            </div>

            {/* Scope Toggle Button */}
            {(searchContext.organizationId || currentScope === 'organization') && (
              <button
                onClick={toggleScope}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  manualScopeOverride
                    ? 'bg-yellow-600/20 text-yellow-300 ring-1 ring-yellow-500/30'
                    : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700 hover:text-gray-200'
                }`}
                title={currentScope === 'global' ? 'Switch to Organization Search' : 'Switch to Global Search'}
              >
                {currentScope === 'global' ? (
                  <div className="flex items-center space-x-1">
                    <Building2 className="w-3 h-3" />
                    <span>Org Search</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1">
                    <Globe className="w-3 h-3" />
                    <span>Global Search</span>
                  </div>
                )}
              </button>
            )}
          </div>

          {/* Search Input */}
          <div className="flex items-center w-full bg-gray-800/50 rounded-xl px-4 py-3 ring-1 ring-gray-600/50 focus-within:ring-2 focus-within:ring-blue-500/50 transition-all">
            <Search className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder={getCurrentContextInfo().placeholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent text-white placeholder-gray-400 outline-none text-lg"
            />
            {isLoading && (
              <Loader2 className="w-5 h-5 text-blue-400 animate-spin ml-2 flex-shrink-0" />
            )}
          </div>

          {/* Search Options */}
          <div className="flex items-center justify-between mt-4 text-sm">
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useDeepSearch}
                  onChange={(e) => setUseDeepSearch(e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                />
                <span className="text-gray-300">Deep Search</span>
              </label>
              {searchType === 'deep' && (
                <span className="px-2 py-1 bg-blue-600/20 text-blue-400 rounded text-xs">
                  Enhanced
                </span>
              )}
            </div>

            {results.length > 0 && (
              <span className="text-gray-400">
                {results.length} result{results.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {/* Content Type Filters */}
          {useDeepSearch && (
            <div className="mt-4">
              <div className="flex flex-wrap gap-2">
                {contentTypeFilters.map((filter) => {
                  const Icon = filter.icon
                  const isSelected = selectedFilters.includes(filter.id)
                  return (
                    <button
                      key={filter.id}
                      onClick={() => toggleFilter(filter.id)}
                      className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs transition-colors ${
                        isSelected
                          ? 'bg-blue-600/30 text-blue-300 ring-1 ring-blue-500/50'
                          : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700 hover:text-gray-300'
                      }`}
                    >
                      <Icon className="w-3 h-3" />
                      <span>{filter.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Search Results */}
        <div className="max-h-96 overflow-y-auto" ref={resultsRef}>
          {hasSearched && results.length === 0 && !isLoading && (
            <div className="p-12 text-center text-gray-400">
              <div className="w-16 h-16 mx-auto mb-6 bg-gray-800/50 rounded-full flex items-center justify-center">
                <Search className="w-8 h-8 opacity-50" />
              </div>
              <p className="text-xl mb-3 font-medium">No results found</p>
              <p className="text-sm text-gray-500">Try searching for a different organization or client name</p>
            </div>
          )}

          {!hasSearched && !isLoading && (
            <div className="p-12 text-center text-gray-400">
              <div className={`w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center ${
                searchContext.scope === 'global'
                  ? 'bg-gradient-to-br from-blue-500/20 to-purple-500/20'
                  : 'bg-gradient-to-br from-green-500/20 to-blue-500/20'
              }`}>
                {searchContext.scope === 'global' ? (
                  <Globe className="w-8 h-8 text-blue-400" />
                ) : (
                  <Building2 className="w-8 h-8 text-green-400" />
                )}
              </div>
              <p className="text-xl mb-3 font-medium">{searchContext.title}</p>
              <p className="text-sm text-gray-500">{searchContext.description}</p>
            </div>
          )}

          {results.map((result, index) => (
            <div
              key={result.id}
              className={`flex items-center p-4 mx-2 my-1 cursor-pointer rounded-xl search-result-item ${
                index === selectedIndex
                  ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 ring-1 ring-blue-500/50 search-result-selected'
                  : 'hover:bg-gray-800/50 hover:ring-1 hover:ring-gray-600/50'
              }`}
              onClick={() => handleSelectResult(result)}
            >
              <div className={`mr-4 p-2 rounded-lg ${
                index === selectedIndex
                  ? 'bg-blue-500/20'
                  : 'bg-gray-800/50'
              }`}>
                {getResultIcon(result.type, result.subtype)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center">
                  <h3 className="text-white font-medium truncate">{result.name}</h3>
                  <span className={`ml-3 px-2 py-1 text-xs rounded-full font-medium ${
                    result.type === 'organization'
                      ? 'bg-blue-500/20 text-blue-300 ring-1 ring-blue-500/30'
                      : result.type === 'sidebar_item'
                      ? 'bg-cyan-500/20 text-cyan-300 ring-1 ring-cyan-500/30'
                      : result.type === 'page_content'
                      ? 'bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-500/30'
                      : 'bg-green-500/20 text-green-300 ring-1 ring-green-500/30'
                  }`}>
                    {getResultTypeName(result.type, result.subtype)}
                  </span>
                  {result.relevanceScore && result.relevanceScore > 50 && (
                    <span className="ml-2 px-1.5 py-0.5 bg-yellow-500/20 text-yellow-300 text-xs rounded">
                      High Match
                    </span>
                  )}
                </div>

                {result.description && (
                  <p className="text-gray-400 text-sm mt-1 line-clamp-2">{result.description}</p>
                )}

                {/* Enhanced metadata display */}
                <div className="flex items-center mt-2 text-xs text-gray-500 space-x-3">
                  {result.organizationName && result.type !== 'organization' && (
                    <span className="px-2 py-1 bg-gray-800/50 rounded-md">
                      {result.organizationName}
                    </span>
                  )}
                  {result.category && (
                    <span className="px-2 py-1 bg-gray-800/50 rounded-md">
                      {result.category}
                    </span>
                  )}
                  {result.matchedFields && result.matchedFields.length > 0 && (
                    <span className="px-2 py-1 bg-blue-800/30 text-blue-300 rounded-md">
                      Matched: {result.matchedFields.join(', ')}
                    </span>
                  )}
                  {result.contactCount !== undefined && (
                    <span className="px-2 py-1 bg-gray-800/50 rounded-md">{result.contactCount} contacts</span>
                  )}
                  {result.locationCount !== undefined && (
                    <span className="px-2 py-1 bg-gray-800/50 rounded-md">{result.locationCount} locations</span>
                  )}
                </div>

                {/* Show matched text excerpt for deep search results */}
                {result.matchedText && result.matchedText !== result.description && (
                  <div className="mt-2 p-2 bg-gray-800/30 rounded text-xs text-gray-400 italic">
                    "{result.matchedText}"
                  </div>
                )}
              </div>

              <ArrowRight className={`w-4 h-4 ml-2 transition-colors ${
                index === selectedIndex ? 'text-blue-400' : 'text-gray-400'
              }`} />
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700/50 bg-gray-900/50 backdrop-blur-sm rounded-b-2xl">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <div className="flex items-center space-x-4">
              <span className="flex items-center">
                <kbd className="px-2 py-1 bg-gray-700/50 ring-1 ring-gray-600/50 rounded-md text-xs mr-2 font-mono">↑↓</kbd>
                Navigate
              </span>
              <span className="flex items-center">
                <kbd className="px-2 py-1 bg-gray-700/50 ring-1 ring-gray-600/50 rounded-md text-xs mr-2 font-mono">Enter</kbd>
                Select
              </span>
              <span className="flex items-center">
                <kbd className="px-2 py-1 bg-gray-700/50 ring-1 ring-gray-600/50 rounded-md text-xs mr-2 font-mono">Esc</kbd>
                Close
              </span>
              {query && results.length > 0 && (
                <button
                  onClick={() => {
                    const params = new URLSearchParams({
                      q: query,
                      scope: currentScope
                    })
                    if (currentScope === 'organization' && searchContext.organizationId) {
                      params.set('org', searchContext.organizationId)
                    }
                    if (selectedFilters.length > 0) {
                      params.set('filters', JSON.stringify(selectedFilters))
                    }
                    router.push(`/search?${params.toString()}`)
                    onClose()
                  }}
                  className="text-blue-400 hover:text-blue-300 underline"
                >
                  View All Results
                </button>
              )}
            </div>
            <span className="flex items-center">
              Press <kbd className="px-2 py-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 ring-1 ring-blue-500/50 rounded-md text-xs mx-1 font-mono text-blue-300">Q</kbd> to search
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
