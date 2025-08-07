'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Globe, Building2, ArrowRight, CheckCircle, Target, Zap, Filter } from 'lucide-react'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import { useSearchContext, useOrganizationName } from '@/hooks/useSearchContext'

export default function ContextAwareSearchDemo() {
  const router = useRouter()
  const searchContext = useSearchContext()
  const organizationName = useOrganizationName(searchContext.organizationId)
  const [selectedDemo, setSelectedDemo] = useState<string | null>(null)

  const contextExamples = [
    {
      id: 'dashboard_global',
      title: 'Dashboard / Global Pages',
      description: 'When on dashboard or global pages, search defaults to Global mode',
      currentContext: searchContext.scope === 'global',
      url: '/',
      expectedBehavior: [
        'Search button shows Globe icon with "Global Search"',
        'Search placeholder: "Search across all organizations..."',
        'Results include data from ALL organizations',
        'Can find organizations, cross-org contacts, etc.',
        'Option to switch to Organization search if needed'
      ]
    },
    {
      id: 'organization_pages',
      title: 'Organization Pages',
      description: 'When within an organization, search defaults to Organization mode',
      currentContext: searchContext.scope === 'organization',
      url: '/organizations/90783206-82e1-4b86-a0ff-1eef169d0406',
      expectedBehavior: [
        'Search button shows Building icon with "Organization Search"',
        `Search placeholder: "Search within ${organizationName || 'this organization'}..."`,
        'Results limited to current organization only',
        'Finds org-specific contacts, documents, configs, etc.',
        'Option to switch to Global search if needed'
      ]
    }
  ]

  const searchFeatures = [
    {
      icon: Target,
      title: 'Automatic Context Detection',
      description: 'Detects your current location and sets appropriate search scope automatically'
    },
    {
      icon: Zap,
      title: 'Smart Scope Switching',
      description: 'Easily toggle between Global and Organization search with visual indicators'
    },
    {
      icon: Filter,
      title: 'Context-Aware Results',
      description: 'Results are filtered and prioritized based on your current working context'
    },
    {
      icon: Search,
      title: 'Consistent Experience',
      description: 'Same powerful deep search across both global and organization contexts'
    }
  ]

  const handleTryContext = (url: string) => {
    router.push(url)
  }

  const handleSidebarItemClick = (item: any) => {
    if (item.href) {
      if (item.href === '/') {
        router.push('/')
      } else {
        router.push(`/organizations/90783206-82e1-4b86-a0ff-1eef169d0406${item.href}`)
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header currentPage="Context-Aware Search Demo" />
      <div className="flex">
        <Sidebar onItemClick={handleSidebarItemClick} />
        
        <div className="flex-1 p-8">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-green-500 rounded-full mb-6">
              <Search className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
              Context-Aware Search
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Experience intelligent search that automatically adapts to your current working context, 
              providing the most relevant results based on where you are in the application.
            </p>
          </div>

          {/* Current Context Display */}
          <div className="max-w-4xl mx-auto mb-12">
            <div className={`p-6 rounded-xl border-2 ${
              searchContext.scope === 'global'
                ? 'bg-blue-900/20 border-blue-500/30'
                : 'bg-green-900/20 border-green-500/30'
            }`}>
              <div className="flex items-center space-x-4 mb-4">
                <div className={`p-3 rounded-lg ${
                  searchContext.scope === 'global'
                    ? 'bg-blue-500/20 text-blue-400'
                    : 'bg-green-500/20 text-green-400'
                }`}>
                  {searchContext.scope === 'global' ? (
                    <Globe className="w-6 h-6" />
                  ) : (
                    <Building2 className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-semibold">
                    Current Context: {searchContext.title}
                  </h3>
                  <p className="text-gray-300">
                    {searchContext.description}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Search Scope:</span>
                  <span className="ml-2 font-medium capitalize">{searchContext.scope}</span>
                </div>
                <div>
                  <span className="text-gray-400">Organization:</span>
                  <span className="ml-2 font-medium">
                    {organizationName || (searchContext.organizationId ? 'Loading...' : 'All Organizations')}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">Search Icon:</span>
                  <span className="ml-2 font-medium">
                    {searchContext.icon === 'globe' ? '🌐 Globe' : '🏢 Building'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">Placeholder:</span>
                  <span className="ml-2 font-medium text-xs">{searchContext.placeholder}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {searchFeatures.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div key={index} className="p-6 bg-gray-800 rounded-xl">
                  <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-400 text-sm">{feature.description}</p>
                </div>
              )
            })}
          </div>

          {/* Context Examples */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Context Examples</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {contextExamples.map((example) => (
                <div
                  key={example.id}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    example.currentContext
                      ? 'border-green-500 bg-green-900/20'
                      : 'border-gray-700 bg-gray-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-semibold">{example.title}</h3>
                      {example.currentContext && (
                        <div className="flex items-center space-x-1 px-2 py-1 bg-green-600/20 text-green-300 rounded-full text-xs">
                          <CheckCircle className="w-3 h-3" />
                          <span>Current</span>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => handleTryContext(example.url)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
                    >
                      <span>Try It</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <p className="text-gray-300 mb-4">{example.description}</p>
                  
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-gray-300">Expected Behavior:</h4>
                    <ul className="space-y-1">
                      {example.expectedBehavior.map((behavior, index) => (
                        <li key={index} className="flex items-start space-x-2 text-sm text-gray-400">
                          <div className="w-1.5 h-1.5 bg-blue-400 rounded-full flex-shrink-0 mt-2" />
                          <span>{behavior}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Demo */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Try Context-Aware Search</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-gray-800 rounded-xl">
                <h3 className="text-lg font-semibold mb-4">Quick Search Test</h3>
                <p className="text-gray-300 mb-4">
                  Press <kbd className="px-2 py-1 bg-gray-700 rounded text-xs">Q</kbd> to open search 
                  and notice how it automatically detects your current context.
                </p>
                <button
                  onClick={() => {
                    const event = new KeyboardEvent('keydown', { key: 'q' })
                    document.dispatchEvent(event)
                  }}
                  className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
                >
                  Open Context-Aware Search (Q)
                </button>
              </div>

              <div className="p-6 bg-gray-800 rounded-xl">
                <h3 className="text-lg font-semibold mb-4">Full Search Page</h3>
                <p className="text-gray-300 mb-4">
                  Visit the dedicated search page to see context-aware search with advanced filtering and sorting.
                </p>
                <button
                  onClick={() => router.push('/search')}
                  className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-medium transition-colors"
                >
                  Open Search Page
                </button>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="text-center p-8 bg-gradient-to-r from-blue-900/20 to-green-900/20 rounded-xl border border-blue-500/20">
            <h2 className="text-2xl font-bold mb-4">Test Different Contexts</h2>
            <p className="text-gray-300 mb-6">
              Navigate to different pages to see how the search context automatically adapts.
            </p>
            <div className="flex items-center justify-center space-x-4">
              <button
                onClick={() => router.push('/')}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors flex items-center space-x-2"
              >
                <Globe className="w-4 h-4" />
                <span>Go to Dashboard (Global)</span>
              </button>
              <button
                onClick={() => router.push('/organizations/90783206-82e1-4b86-a0ff-1eef169d0406')}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-medium transition-colors flex items-center space-x-2"
              >
                <Building2 className="w-4 h-4" />
                <span>Go to Organization</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
