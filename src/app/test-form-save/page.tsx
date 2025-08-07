'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { PageContentService } from '@/lib/page-content-service'

export default function TestFormSave() {
  const [pageContents, setPageContents] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedContent, setSelectedContent] = useState<any>(null)

  useEffect(() => {
    loadFormContents()
  }, [])

  const loadFormContents = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('page_contents')
        .select('*')
        .eq('content_type', 'form-data')
        .order('updated_at', { ascending: false })
      
      if (error) throw error
      setPageContents(data || [])
      console.log('📋 Found form contents:', data?.length || 0)
      
    } catch (error) {
      console.error('Error loading form contents:', error)
    }
    setLoading(false)
  }

  const viewContent = (content: any) => {
    setSelectedContent(content)
    console.log('👀 Viewing form content:', content)
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Form Save Test</h1>
        <button
          onClick={loadFormContents}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded disabled:bg-gray-600"
        >
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form Contents List */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-lg font-semibold mb-4">Saved Form Contents</h2>
          
          {loading ? (
            <div className="text-yellow-400">Loading...</div>
          ) : pageContents.length === 0 ? (
            <div className="text-gray-400">No form contents found</div>
          ) : (
            <div className="space-y-3">
              {pageContents.map((content) => (
                <div
                  key={content.id}
                  className={`p-3 rounded cursor-pointer transition-colors ${
                    selectedContent?.id === content.id
                      ? 'bg-blue-600'
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                  onClick={() => viewContent(content)}
                >
                  <div className="font-medium">
                    {content.content_data?.formTitle || 'Untitled Form'}
                  </div>
                  <div className="text-sm text-gray-400">
                    Elements: {content.content_data?.elements?.length || 0}
                  </div>
                  <div className="text-xs text-gray-500">
                    Updated: {new Date(content.updated_at).toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">
                    ID: {content.id}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Content Details */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-lg font-semibold mb-4">Form Details</h2>
          
          {selectedContent ? (
            <div className="space-y-4">
              <div>
                <h3 className="text-green-400 font-medium mb-2">Form Title:</h3>
                <div className="bg-gray-700 p-3 rounded">
                  {selectedContent.content_data?.formTitle || 'No title'}
                </div>
              </div>

              <div>
                <h3 className="text-blue-400 font-medium mb-2">
                  Form Elements ({selectedContent.content_data?.elements?.length || 0}):
                </h3>
                <div className="bg-gray-700 p-3 rounded max-h-60 overflow-y-auto">
                  {selectedContent.content_data?.elements?.length > 0 ? (
                    <div className="space-y-2">
                      {selectedContent.content_data.elements.map((element: any, index: number) => (
                        <div key={element.id} className="bg-gray-600 p-2 rounded text-sm">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-white">
                              {index + 1}. {element.label}
                            </span>
                            <span className="text-blue-300 text-xs">
                              {element.type}
                            </span>
                          </div>
                          {element.placeholder && (
                            <div className="text-gray-400 text-xs mt-1">
                              Placeholder: {element.placeholder}
                            </div>
                          )}
                          {element.required && (
                            <div className="text-red-400 text-xs">Required</div>
                          )}
                          {element.options && (
                            <div className="text-gray-400 text-xs mt-1">
                              Options: {element.options.join(', ')}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-400">No elements</div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-purple-400 font-medium mb-2">Raw Data:</h3>
                <div className="bg-gray-700 p-3 rounded">
                  <pre className="text-xs text-gray-300 overflow-auto max-h-40">
                    {JSON.stringify(selectedContent.content_data, null, 2)}
                  </pre>
                </div>
              </div>

              <div>
                <h3 className="text-yellow-400 font-medium mb-2">Metadata:</h3>
                <div className="bg-gray-700 p-3 rounded text-sm space-y-1">
                  <div>Content ID: {selectedContent.id}</div>
                  <div>Sidebar Item ID: {selectedContent.sidebar_item_id}</div>
                  <div>Content Type: {selectedContent.content_type}</div>
                  <div>Created: {new Date(selectedContent.created_at).toLocaleString()}</div>
                  <div>Updated: {new Date(selectedContent.updated_at).toLocaleString()}</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-gray-400">Select a form content to view details</div>
          )}
        </div>
      </div>

      <div className="mt-8 bg-green-900/20 border border-green-600 rounded-lg p-4">
        <h3 className="text-green-400 font-semibold mb-2">✅ Database Save Verification:</h3>
        <ul className="text-green-200 text-sm space-y-1">
          <li>• All form data is automatically saved to the <code>page_contents</code> table</li>
          <li>• Form title, elements, and configuration are stored in <code>content_data</code> JSON field</li>
          <li>• Each form element includes: type, label, placeholder, required status, and options</li>
          <li>• Changes are saved when you click the "Save Changes" button in the form editor</li>
          <li>• Data persists across browser sessions and page reloads</li>
        </ul>
      </div>
    </div>
  )
}
