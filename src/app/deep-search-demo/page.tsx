'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Zap, Filter, Target, Globe, Building2, Users, FileText, Settings, MapPin, Key, ArrowRight } from 'lucide-react'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'

export default function DeepSearchDemo() {
  const router = useRouter()
  const [selectedExample, setSelectedExample] = useState<string | null>(null)

  const searchExamples = [
    {
      id: 'comprehensive',
      title: 'Comprehensive Search',
      description: 'Search across all content types simultaneously',
      query: 'network configuration',
      scope: 'global',
      expectedResults: [
        'Network configurations in IT documentation',
        'Sidebar navigation items related to networking',
        'Page content mentioning network setup',
        'Contact information for network administrators',
        'Assets tagged with network equipment',
        'Passwords for network devices'
      ]
    },
    {
      id: 'sidebar_navigation',
      title: 'Navigation Items Search',
      description: 'Find specific sidebar items and custom pages',
      query: 'site summary',
      scope: 'organization',
      expectedResults: [
        'Site Summary navigation item',
        'Custom sidebar items with "site" in the name',
        'Page content related to site information',
        'Location data for sites'
      ]
    },
    {
      id: 'page_content',
      title: 'Page Content Search',
      description: 'Search within rich text content and custom forms',
      query: 'emergency contact',
      scope: 'organization',
      expectedResults: [
        'Rich text documents mentioning emergency contacts',
        'Contact forms with emergency information',
        'Location pages with emergency procedures',
        'Custom fields containing emergency data'
      ]
    },
    {
      id: 'cross_organization',
      title: 'Cross-Organization Search',
      description: 'Find information across multiple organizations',
      query: 'john smith',
      scope: 'global',
      expectedResults: [
        'Contact records for John Smith',
        'Documents authored by John Smith',
        'Assets assigned to John Smith',
        'Page content mentioning John Smith',
        'Organizations where John Smith works'
      ]
    },
    {
      id: 'fuzzy_matching',
      title: 'Fuzzy Search & Partial Matching',
      description: 'Find results even with typos or partial terms',
      query: 'netwrk confg',
      scope: 'global',
      expectedResults: [
        'Network configuration (corrected spelling)',
        'Network config documents',
        'Networking setup guides',
        'Related network assets'
      ]
    }
  ]

  const searchFeatures = [
    {
      icon: Target,
      title: 'Multi-Source Search',
      description: 'Searches across sidebar items, page content, organizations, contacts, locations, documents, passwords, configurations, domains, and assets'
    },
    {
      icon: Zap,
      title: 'Real-Time Results',
      description: 'Get instant search suggestions as you type with intelligent caching for fast performance'
    },
    {
      icon: Filter,
      title: 'Advanced Filtering',
      description: 'Filter results by content type, organization, category, date range, and custom criteria'
    },
    {
      icon: Globe,
      title: 'Context-Aware',
      description: 'Automatically switches between global search and organization-specific search based on your current location'
    }
  ]

  const handleTryExample = (example: any) => {
    const params = new URLSearchParams({
      q: example.query,
      scope: example.scope
    })
    router.push(`/search?${params.toString()}`)
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
      <Header currentPage="Deep Search Demo" />
      <div className="flex">
        <Sidebar onItemClick={handleSidebarItemClick} />
        
        <div className="flex-1 p-8">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-6">
              <Search className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Deep Search Functionality
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Experience comprehensive search across all content types in your ITGlue clone. 
              Find information instantly with intelligent matching and contextual results.
            </p>
          </div>

          {/* Quick Search Bar */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Try searching for 'network', 'contact', or 'site summary'..."
                className="w-full pl-12 pr-4 py-4 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                    const params = new URLSearchParams({
                      q: e.currentTarget.value.trim(),
                      scope: 'global'
                    })
                    router.push(`/search?${params.toString()}`)
                  }
                }}
              />
            </div>
            <p className="text-center text-gray-400 mt-3">
              Press <kbd className="px-2 py-1 bg-gray-700 rounded text-xs">Q</kbd> anywhere to open quick search
            </p>
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

          {/* Search Examples */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Try These Search Examples</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {searchExamples.map((example) => (
                <div
                  key={example.id}
                  className={`p-6 bg-gray-800 rounded-xl border-2 transition-all cursor-pointer ${
                    selectedExample === example.id
                      ? 'border-blue-500 bg-blue-900/20'
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                  onClick={() => setSelectedExample(selectedExample === example.id ? null : example.id)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">{example.title}</h3>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleTryExample(example)
                      }}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
                    >
                      <span>Try It</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <p className="text-gray-300 mb-4">{example.description}</p>
                  
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="flex items-center space-x-2">
                      <Search className="w-4 h-4 text-gray-400" />
                      <code className="px-2 py-1 bg-gray-700 rounded text-sm text-blue-300">
                        "{example.query}"
                      </code>
                    </div>
                    <div className="flex items-center space-x-2">
                      {example.scope === 'global' ? (
                        <Globe className="w-4 h-4 text-blue-400" />
                      ) : (
                        <Building2 className="w-4 h-4 text-green-400" />
                      )}
                      <span className="text-sm text-gray-400 capitalize">{example.scope}</span>
                    </div>
                  </div>

                  {selectedExample === example.id && (
                    <div className="mt-4 p-4 bg-gray-700/50 rounded-lg">
                      <h4 className="text-sm font-semibold mb-3 text-gray-300">Expected Results:</h4>
                      <ul className="space-y-2">
                        {example.expectedResults.map((result, index) => (
                          <li key={index} className="flex items-center space-x-2 text-sm text-gray-400">
                            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full flex-shrink-0" />
                            <span>{result}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Content Types */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Searchable Content Types</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {[
                { icon: FileText, label: 'Navigation Items', color: 'text-cyan-400' },
                { icon: FileText, label: 'Page Content', color: 'text-indigo-400' },
                { icon: Building2, label: 'Organizations', color: 'text-blue-400' },
                { icon: Users, label: 'Contacts', color: 'text-green-400' },
                { icon: MapPin, label: 'Locations', color: 'text-red-400' },
                { icon: FileText, label: 'Documents', color: 'text-purple-400' },
                { icon: Key, label: 'Passwords', color: 'text-yellow-400' },
                { icon: Settings, label: 'Configurations', color: 'text-orange-400' },
                { icon: Globe, label: 'Domains', color: 'text-pink-400' },
                { icon: Settings, label: 'Assets', color: 'text-teal-400' }
              ].map((type, index) => {
                const Icon = type.icon
                return (
                  <div key={index} className="p-4 bg-gray-800 rounded-lg text-center">
                    <Icon className={`w-8 h-8 mx-auto mb-2 ${type.color}`} />
                    <span className="text-sm text-gray-300">{type.label}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center p-8 bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-xl border border-blue-500/20">
            <h2 className="text-2xl font-bold mb-4">Ready to Experience Deep Search?</h2>
            <p className="text-gray-300 mb-6">
              Start searching across all your content with intelligent matching and contextual results.
            </p>
            <div className="flex items-center justify-center space-x-4">
              <button
                onClick={() => router.push('/search')}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
              >
                Open Search Page
              </button>
              <button
                onClick={() => {
                  // Trigger global search modal
                  const event = new KeyboardEvent('keydown', { key: 'q' })
                  document.dispatchEvent(event)
                }}
                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-colors"
              >
                Quick Search (Q)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
