'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { SidebarService } from '@/lib/sidebar-service'
import { supabase } from '@/lib/supabase'

export default function DebugOrgSwitching() {
  const router = useRouter()
  const [organizations, setOrganizations] = useState<any[]>([])
  const [currentOrg, setCurrentOrg] = useState<string>('')
  const [sidebarData, setSidebarData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadOrganizations()
  }, [])

  const loadOrganizations = async () => {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('id, name')
        .limit(10)
      
      if (error) throw error
      setOrganizations(data || [])
    } catch (error) {
      console.error('Error loading organizations:', error)
    }
  }

  const switchToOrganization = async (orgId: string) => {
    setLoading(true)
    setCurrentOrg(orgId)
    
    try {
      console.log('🔄 Switching to organization:', orgId)
      
      // Clear cache first
      SidebarService.clearCache()
      
      // Load sidebar data for this organization
      const sidebarData = await SidebarService.getOrganizationSidebarByCategory(orgId)
      setSidebarData(sidebarData)
      
      console.log('✅ Loaded sidebar data for org:', orgId, sidebarData)
    } catch (error) {
      console.error('❌ Error loading sidebar for org:', orgId, error)
      setSidebarData(null)
    }
    
    setLoading(false)
  }

  const navigateToOrganization = (orgId: string) => {
    router.push(`/organizations/${orgId}`)
  }

  const createTestSidebarItem = async (orgId: string) => {
    if (!orgId) return
    
    setLoading(true)
    try {
      const testItem = {
        organization_id: orgId,
        parent_category: 'CLIENT CONTACT',
        item_name: `Test Item for ${organizations.find(o => o.id === orgId)?.name || 'Org'}`,
        item_slug: `test-item-${Date.now()}`,
        item_type: 'page',
        icon: 'FileInput',
        description: 'Test custom sidebar item',
        sort_order: 100,
        is_active: true,
        is_system: false
      }

      const { data, error } = await supabase
        .from('organization_sidebar_items')
        .insert([testItem])
        .select()
        .single()
      
      if (error) throw error
      
      console.log('✅ Created test sidebar item:', data)
      
      // Refresh sidebar data
      await switchToOrganization(orgId)
      
    } catch (error) {
      console.error('❌ Error creating test sidebar item:', error)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-2xl font-bold mb-6">Organization Switching Debug</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Organization List */}
        <div className="bg-gray-800 p-6 rounded">
          <h2 className="text-lg font-semibold mb-4">Organizations</h2>
          <div className="space-y-2">
            {organizations.map((org) => (
              <div key={org.id} className="flex items-center justify-between p-3 bg-gray-700 rounded">
                <div>
                  <div className="font-medium">{org.name}</div>
                  <div className="text-xs text-gray-400">{org.id}</div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => switchToOrganization(org.id)}
                    disabled={loading}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm disabled:opacity-50"
                  >
                    Load Sidebar
                  </button>
                  <button
                    onClick={() => navigateToOrganization(org.id)}
                    className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm"
                  >
                    Navigate
                  </button>
                  <button
                    onClick={() => createTestSidebarItem(org.id)}
                    disabled={loading}
                    className="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded text-sm disabled:opacity-50"
                  >
                    Add Test Item
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar Data Display */}
        <div className="bg-gray-800 p-6 rounded">
          <h2 className="text-lg font-semibold mb-4">
            Sidebar Data 
            {currentOrg && (
              <span className="text-sm text-gray-400 ml-2">
                ({organizations.find(o => o.id === currentOrg)?.name || currentOrg})
              </span>
            )}
          </h2>
          
          {loading && (
            <div className="text-yellow-400">Loading...</div>
          )}
          
          {sidebarData && !loading && (
            <div className="space-y-4">
              {Object.entries(sidebarData).map(([category, data]: [string, any]) => (
                <div key={category} className="bg-gray-700 p-3 rounded">
                  <h3 className="font-medium text-blue-400 mb-2">{category}</h3>
                  {data.items && data.items.length > 0 ? (
                    <div className="space-y-1">
                      <div className="text-sm text-green-400">Custom Items ({data.items.length}):</div>
                      {data.items.map((item: any, index: number) => (
                        <div key={index} className="text-xs text-gray-300 ml-2">
                          • {item.item_name} ({item.item_slug})
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-gray-400">No custom items</div>
                  )}
                  {data.systemItems && (
                    <div className="text-xs text-gray-500 mt-2">
                      System items: {data.systemItems.length}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          
          {!sidebarData && !loading && (
            <div className="text-gray-400">No sidebar data loaded. Select an organization above.</div>
          )}
        </div>
      </div>

      <div className="mt-8 bg-blue-900/20 border border-blue-600 rounded-lg p-4">
        <h3 className="text-blue-400 font-semibold mb-2">Testing Instructions:</h3>
        <ol className="text-blue-200 text-sm space-y-1">
          <li>1. Click "Add Test Item" for different organizations to create custom sidebar items</li>
          <li>2. Click "Load Sidebar" to see the sidebar data for each organization</li>
          <li>3. Verify that each organization shows only its own custom items</li>
          <li>4. Click "Navigate" to go to the actual organization page and verify the sidebar</li>
          <li>5. Switch between organizations and verify the sidebar updates correctly</li>
        </ol>
      </div>
    </div>
  )
}
