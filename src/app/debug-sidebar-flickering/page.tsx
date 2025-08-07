'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'

export default function DebugSidebarFlickering() {
  const router = useRouter()
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [...prev.slice(-20), `${timestamp}: ${message}`])
  }

  useEffect(() => {
    addLog('🚀 Debug page mounted')
  }, [])

  const testPages = [
    { name: 'Onsite Information', url: '/organizations/90783206-82e1-4b86-a0ff-1eef169d0406/onsite-information' },
    { name: 'Site Summary', url: '/organizations/90783206-82e1-4b86-a0ff-1eef169d0406/site-summary' },
    { name: 'Contacts', url: '/organizations/90783206-82e1-4b86-a0ff-1eef169d0406/contacts' },
    { name: 'Locations', url: '/organizations/90783206-82e1-4b86-a0ff-1eef169d0406/locations' },
    { name: 'After Hour Access', url: '/organizations/90783206-82e1-4b86-a0ff-1eef169d0406/after-hour-access' }
  ]

  const navigateToPage = (url: string, name: string) => {
    addLog(`🔄 Navigating to ${name}`)
    router.push(url)
  }

  const handleSidebarItemClick = (item: any) => {
    addLog(`📋 Sidebar item clicked: ${item.label}`)
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
      <Header currentPage="Debug Sidebar Flickering" />
      <div className="flex">
        <Sidebar onItemClick={handleSidebarItemClick} />
        
        {/* Main Content */}
        <div className="flex-1">
          <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">Sidebar Flickering Debug Tool</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Navigation Test Buttons */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Quick Navigation Test</h2>
                <p className="text-gray-400 mb-4">
                  Click these buttons rapidly to test for sidebar flickering during navigation.
                </p>
                
                <div className="space-y-2">
                  {testPages.map((page) => (
                    <button
                      key={page.url}
                      onClick={() => navigateToPage(page.url, page.name)}
                      className="w-full text-left p-3 bg-blue-600 hover:bg-blue-700 rounded transition-colors"
                    >
                      {page.name}
                    </button>
                  ))}
                </div>
                
                <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-600 rounded">
                  <h3 className="text-yellow-400 font-semibold mb-2">How to Test:</h3>
                  <ul className="text-yellow-200 text-sm space-y-1">
                    <li>• Click buttons rapidly to switch between pages</li>
                    <li>• Watch the sidebar for any flickering or jumping</li>
                    <li>• Check the logs for any unusual behavior</li>
                    <li>• Look for double-loading or state conflicts</li>
                  </ul>
                </div>
              </div>

              {/* Debug Logs */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Debug Logs</h2>
                <div className="bg-gray-900 rounded p-4 h-96 overflow-y-auto">
                  {logs.length === 0 ? (
                    <p className="text-gray-400">No logs yet...</p>
                  ) : (
                    <div className="space-y-1">
                      {logs.map((log, index) => (
                        <div
                          key={index}
                          className="text-sm font-mono text-gray-300"
                        >
                          {log}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <button
                  onClick={() => setLogs([])}
                  className="mt-4 px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded text-sm"
                >
                  Clear Logs
                </button>
              </div>
            </div>

            {/* Instructions */}
            <div className="mt-6 bg-blue-900/20 border border-blue-600 rounded-lg p-6">
              <h3 className="text-blue-400 font-semibold mb-2">🔍 What to Look For:</h3>
              <div className="text-blue-200 text-sm space-y-2">
                <p><strong>Flickering Signs:</strong></p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Sidebar items disappearing and reappearing</li>
                  <li>Loading spinner showing briefly between pages</li>
                  <li>Sidebar sections jumping or changing order</li>
                  <li>Double-loading of sidebar content</li>
                </ul>
                
                <p className="mt-4"><strong>Expected Behavior:</strong></p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Smooth transitions between pages</li>
                  <li>Sidebar remains stable during navigation</li>
                  <li>No loading states when navigating within same org</li>
                  <li>Consistent sidebar content across pages</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
