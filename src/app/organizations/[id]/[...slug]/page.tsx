'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Edit, Save, X, FileText } from 'lucide-react'
import { SidebarService } from '@/lib/sidebar-service'
import { PageContentService } from '@/lib/page-content-service'
import { supabase, type Organization } from '@/lib/supabase'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'
import DynamicPageContent from '@/components/DynamicPageContent'

interface SidebarItem {
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

interface PageContent {
  id: string
  sidebar_item_id: string
  content_type: string
  content_data: any
  created_at: string
  updated_at: string
}

export default function DynamicPage() {
  const params = useParams()
  const router = useRouter()
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [sidebarItem, setSidebarItem] = useState<SidebarItem | null>(null)
  const [pageContent, setPageContent] = useState<PageContent | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  const organizationId = params.id as string
  const slug = Array.isArray(params.slug) ? params.slug.join('/') : params.slug

  useEffect(() => {
    loadPageData()
  }, [organizationId, slug])

  const loadPageData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Load organization data
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', organizationId)
        .single()

      if (orgError) {
        console.error('Error fetching organization:', orgError)
        setError('Organization not found')
        return
      }

      setOrganization(orgData)

      // Find the sidebar item by slug
      const sidebarItems = await SidebarService.getOrganizationSidebarItems(organizationId)
      const item = sidebarItems.find(item => item.item_slug === slug)

      if (!item) {
        setError(`Page not found: ${slug}`)
        return
      }

      setSidebarItem(item)

      // Load page content if it exists
      try {
        const content = await PageContentService.getPageContent(item.id)
        setPageContent(content)
      } catch (contentError) {
        console.error('Error fetching page content:', contentError)

        // If it's a "not found" error, show a helpful message
        if (contentError instanceof Error && contentError.message.includes('No page content found')) {
          console.log('⚠️ No page content found for sidebar item:', item.id)
          setError(`Page content not found. This sidebar item may not have been set up correctly. Please recreate it through Sidebar Management.`)
          return
        } else {
          // For other errors (like table doesn't exist), show the error
          setError(`Failed to load page content: ${contentError instanceof Error ? contentError.message : 'Unknown error'}`)
          return
        }
      }

    } catch (err) {
      console.error('❌ Error loading page data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load page')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (contentData: any) => {
    if (!pageContent) return

    try {
      console.log('💾 Saving form content:', contentData)

      const updatedContent = await PageContentService.updatePageContent(pageContent.id, {
        content_data: contentData
      })

      console.log('✅ Form saved successfully:', updatedContent)
      setPageContent(updatedContent)
      setIsEditing(false)

      // Show success message (you could add a toast notification here)
      console.log('🎉 Form elements and configuration saved to database!')

    } catch (err) {
      console.error('❌ Error saving content:', err)
      setError('Failed to save content')
    }
  }

  const handleSidebarItemClick = (item: any) => {
    if (item.href) {
      if (item.href === '/') {
        router.push('/')
      } else {
        router.push(`/organizations/${organizationId}${item.href}`)
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <Header currentPage="Organizations" />
        <div className="flex">
          <Sidebar onItemClick={handleSidebarItemClick} />
          <div className="flex-1 p-6">
            <div className="flex items-center justify-center h-64">
              <div className="text-gray-400">Loading page...</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <Header currentPage="Organizations" />
        <div className="flex">
          <Sidebar onItemClick={handleSidebarItemClick} />
          <div className="flex-1 p-6">
            <div className="bg-red-900/20 border border-red-800 rounded-lg p-6">
              <h1 className="text-xl font-semibold text-red-400 mb-2">Page Not Found</h1>
              <p className="text-red-300">{error}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header currentPage="Organizations" />
      <div className="flex">
        <Sidebar onItemClick={handleSidebarItemClick} />

        <div className="flex-1 p-6">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold">{sidebarItem?.item_name}</h1>
                <div className="text-sm text-gray-400">
                  {organization?.name} • Custom Page
                  {sidebarItem?.description && ` • ${sidebarItem.description}`}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {isEditing ? (
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded text-sm"
                >
                  <X className="w-4 h-4" />
                  <span>Cancel</span>
                </button>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-sm"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit</span>
                </button>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            {pageContent && (
              <DynamicPageContent
                content={pageContent}
                isEditing={isEditing}
                onSave={handleSave}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
