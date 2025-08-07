'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function DebugDatabase() {
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testSidebarTable = async () => {
    setLoading(true)
    try {
      console.log('Testing sidebar table...')
      const { data, error } = await supabase
        .from('organization_sidebar_items')
        .select('*')
        .limit(1)
      
      console.log('Sidebar table result:', { data, error })
      setResults({ table: 'organization_sidebar_items', data, error })
    } catch (err) {
      console.error('Error testing sidebar table:', err)
      setResults({ table: 'organization_sidebar_items', error: err })
    }
    setLoading(false)
  }

  const testPageContentTable = async () => {
    setLoading(true)
    try {
      console.log('Testing page content table...')
      const { data, error } = await supabase
        .from('page_contents')
        .select('*')
        .limit(1)
      
      console.log('Page content table result:', { data, error })
      setResults({ table: 'page_contents', data, error })
    } catch (err) {
      console.error('Error testing page content table:', err)
      setResults({ table: 'page_contents', error: err })
    }
    setLoading(false)
  }

  const testCreateSidebarItem = async () => {
    setLoading(true)
    try {
      console.log('Testing create sidebar item...')
      const testItem = {
        organization_id: '6667e965-84f4-4a1b-8ff6-cd95e2eb6a57',
        parent_category: 'CLIENT CONTACT',
        item_name: 'Test Item',
        item_slug: 'test-item',
        item_type: 'page',
        icon: 'FileText',
        description: 'Test description',
        sort_order: 0,
        is_active: true,
        is_system: false
      }

      const { data, error } = await supabase
        .from('organization_sidebar_items')
        .insert([testItem])
        .select()
        .single()

      console.log('Create sidebar item result:', { data, error })
      setResults({ operation: 'create_sidebar_item', data, error, testItem })
    } catch (err) {
      console.error('Error creating sidebar item:', err)
      setResults({ operation: 'create_sidebar_item', error: err })
    }
    setLoading(false)
  }

  const createTables = async () => {
    setLoading(true)
    try {
      console.log('Creating database tables...')

      // Try to create tables using direct insert (since RPC might not be available)
      // First create organization_sidebar_items table
      const { data: sidebarTableData, error: sidebarTableError } = await supabase
        .from('organization_sidebar_items')
        .select('id')
        .limit(1)

      console.log('Sidebar table test result:', { sidebarTableData, sidebarTableError })

      // Test page_contents table
      const { data: pageTableData, error: pageTableError } = await supabase
        .from('page_contents')
        .select('id')
        .limit(1)

      console.log('Page contents table test result:', { pageTableData, pageTableError })

      setResults({
        operation: 'test_tables',
        sidebarTableData,
        sidebarTableError,
        pageTableData,
        pageTableError,
        message: 'If you see table not found errors, please run the SQL from database-setup.sql in your Supabase SQL editor'
      })
    } catch (err) {
      console.error('Error testing tables:', err)
      setResults({ operation: 'test_tables', error: err })
    }
    setLoading(false)
  }

  const createTestSidebarItem = async () => {
    setLoading(true)
    try {
      console.log('Creating test sidebar item...')
      const testItem = {
        organization_id: '6667e965-84f4-4a1b-8ff6-cd95e2eb6a57',
        parent_category: 'CLIENT CONTACT',
        item_name: 'Test Custom Form',
        item_slug: 'test-custom-form',
        item_type: 'page',
        icon: 'FileInput',
        description: 'Test custom form created from debug page',
        sort_order: 100,
        is_active: true,
        is_system: false
      }

      const { data, error } = await supabase
        .from('organization_sidebar_items')
        .insert([testItem])
        .select()
        .single()

      console.log('Test sidebar item creation result:', { data, error })
      setResults({ operation: 'create_test_sidebar_item', data, error, testItem })
    } catch (err) {
      console.error('Error creating test sidebar item:', err)
      setResults({ operation: 'create_test_sidebar_item', error: err })
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-2xl font-bold mb-6">Database Debug Page</h1>

      <div className="bg-yellow-900/20 border border-yellow-600 rounded-lg p-4 mb-6">
        <h2 className="text-yellow-400 font-semibold mb-2">⚠️ Database Setup Required</h2>
        <p className="text-yellow-200 text-sm mb-2">
          If you're getting errors when creating sidebar items, the database tables might not exist yet.
        </p>
        <p className="text-yellow-200 text-sm">
          <strong>Option 1:</strong> Use the "Create Database Tables" button below (may not work with RPC restrictions)<br/>
          <strong>Option 2:</strong> Copy and run the SQL from <code>database-setup.sql</code> in your Supabase SQL editor
        </p>
      </div>

      <div className="space-y-4 mb-8">
        <button
          onClick={testSidebarTable}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded disabled:opacity-50"
        >
          Test Sidebar Table
        </button>
        
        <button
          onClick={testPageContentTable}
          disabled={loading}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded disabled:opacity-50"
        >
          Test Page Content Table
        </button>
        
        <button
          onClick={testCreateSidebarItem}
          disabled={loading}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded disabled:opacity-50"
        >
          Test Create Sidebar Item
        </button>

        <button
          onClick={createTables}
          disabled={loading}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded disabled:opacity-50"
        >
          Test Database Tables
        </button>

        <button
          onClick={createTestSidebarItem}
          disabled={loading}
          className="px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded disabled:opacity-50"
        >
          Create Test Sidebar Item
        </button>
      </div>

      {loading && (
        <div className="text-yellow-400">Loading...</div>
      )}

      {results && (
        <div className="bg-gray-800 p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">Results:</h2>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(results, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}
