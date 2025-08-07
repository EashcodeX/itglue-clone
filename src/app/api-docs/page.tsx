'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import {
  Code,
  Book,
  Key,
  Server,
  Database,
  Shield,
  Copy,
  CheckCircle,
  ExternalLink,
  Search,
  Filter,
  ChevronRight,
  ChevronDown
} from 'lucide-react'

interface APIEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  path: string
  description: string
  parameters?: Parameter[]
  requestBody?: RequestBody
  responses: Response[]
  example: string
}

interface Parameter {
  name: string
  type: string
  required: boolean
  description: string
}

interface RequestBody {
  type: string
  properties: Record<string, any>
}

interface Response {
  status: number
  description: string
  example: string
}

export default function APIDocsPage() {
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState('organizations')
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedEndpoint, setExpandedEndpoint] = useState<string | null>(null)
  const [copiedExample, setCopiedExample] = useState<string | null>(null)

  const handleSidebarItemClick = (item: any) => {
    if (item.href) {
      if (item.href === '/') {
        router.push('/')
      } else {
        router.push(item.href)
      }
    }
  }

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedExample(id)
    setTimeout(() => setCopiedExample(null), 2000)
  }

  const categories = [
    { id: 'organizations', name: 'Organizations', icon: <Server className="w-4 h-4" /> },
    { id: 'users', name: 'Users', icon: <Shield className="w-4 h-4" /> },
    { id: 'documents', name: 'Documents', icon: <Book className="w-4 h-4" /> },
    { id: 'passwords', name: 'Passwords', icon: <Key className="w-4 h-4" /> },
    { id: 'configurations', name: 'Configurations', icon: <Database className="w-4 h-4" /> }
  ]

  const endpoints: Record<string, APIEndpoint[]> = {
    organizations: [
      {
        method: 'GET',
        path: '/api/organizations',
        description: 'Retrieve all organizations',
        parameters: [
          { name: 'page', type: 'integer', required: false, description: 'Page number for pagination' },
          { name: 'limit', type: 'integer', required: false, description: 'Number of items per page' },
          { name: 'status', type: 'string', required: false, description: 'Filter by status (active, inactive)' }
        ],
        responses: [
          {
            status: 200,
            description: 'Success',
            example: JSON.stringify({
              data: [
                {
                  id: 'uuid',
                  name: 'Acme Corp',
                  status: 'active',
                  created_at: '2024-01-15T10:30:00Z'
                }
              ],
              pagination: {
                page: 1,
                limit: 20,
                total: 47
              }
            }, null, 2)
          }
        ],
        example: `curl -X GET "https://api.itglue.com/api/organizations" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`
      },
      {
        method: 'POST',
        path: '/api/organizations',
        description: 'Create a new organization',
        requestBody: {
          type: 'object',
          properties: {
            name: { type: 'string', required: true },
            description: { type: 'string', required: false },
            status: { type: 'string', required: false, default: 'active' }
          }
        },
        responses: [
          {
            status: 201,
            description: 'Created',
            example: JSON.stringify({
              data: {
                id: 'uuid',
                name: 'New Organization',
                status: 'active',
                created_at: '2024-01-15T10:30:00Z'
              }
            }, null, 2)
          }
        ],
        example: `curl -X POST "https://api.itglue.com/api/organizations" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "New Organization",
    "description": "A new organization",
    "status": "active"
  }'`
      },
      {
        method: 'GET',
        path: '/api/organizations/{id}',
        description: 'Retrieve a specific organization',
        parameters: [
          { name: 'id', type: 'string', required: true, description: 'Organization ID' }
        ],
        responses: [
          {
            status: 200,
            description: 'Success',
            example: JSON.stringify({
              data: {
                id: 'uuid',
                name: 'Acme Corp',
                description: 'Technology company',
                status: 'active',
                created_at: '2024-01-15T10:30:00Z'
              }
            }, null, 2)
          }
        ],
        example: `curl -X GET "https://api.itglue.com/api/organizations/{id}" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`
      }
    ],
    users: [
      {
        method: 'GET',
        path: '/api/users',
        description: 'Retrieve all users',
        parameters: [
          { name: 'role', type: 'string', required: false, description: 'Filter by role' },
          { name: 'status', type: 'string', required: false, description: 'Filter by status' }
        ],
        responses: [
          {
            status: 200,
            description: 'Success',
            example: JSON.stringify({
              data: [
                {
                  id: 'uuid',
                  email: 'user@example.com',
                  role: 'user',
                  status: 'active'
                }
              ]
            }, null, 2)
          }
        ],
        example: `curl -X GET "https://api.itglue.com/api/users" \\
  -H "Authorization: Bearer YOUR_API_KEY"`
      }
    ],
    documents: [
      {
        method: 'GET',
        path: '/api/documents',
        description: 'Retrieve all documents',
        parameters: [
          { name: 'organization_id', type: 'string', required: false, description: 'Filter by organization' },
          { name: 'type', type: 'string', required: false, description: 'Filter by document type' }
        ],
        responses: [
          {
            status: 200,
            description: 'Success',
            example: JSON.stringify({
              data: [
                {
                  id: 'uuid',
                  name: 'Network Diagram',
                  type: 'diagram',
                  organization_id: 'uuid'
                }
              ]
            }, null, 2)
          }
        ],
        example: `curl -X GET "https://api.itglue.com/api/documents" \\
  -H "Authorization: Bearer YOUR_API_KEY"`
      }
    ],
    passwords: [
      {
        method: 'GET',
        path: '/api/passwords',
        description: 'Retrieve all passwords',
        parameters: [
          { name: 'organization_id', type: 'string', required: true, description: 'Organization ID' }
        ],
        responses: [
          {
            status: 200,
            description: 'Success',
            example: JSON.stringify({
              data: [
                {
                  id: 'uuid',
                  name: 'Admin Password',
                  username: 'admin',
                  organization_id: 'uuid'
                }
              ]
            }, null, 2)
          }
        ],
        example: `curl -X GET "https://api.itglue.com/api/passwords?organization_id=uuid" \\
  -H "Authorization: Bearer YOUR_API_KEY"`
      }
    ],
    configurations: [
      {
        method: 'GET',
        path: '/api/configurations',
        description: 'Retrieve all configurations',
        parameters: [
          { name: 'organization_id', type: 'string', required: true, description: 'Organization ID' },
          { name: 'type', type: 'string', required: false, description: 'Configuration type' }
        ],
        responses: [
          {
            status: 200,
            description: 'Success',
            example: JSON.stringify({
              data: [
                {
                  id: 'uuid',
                  name: 'Server Config',
                  type: 'server',
                  organization_id: 'uuid'
                }
              ]
            }, null, 2)
          }
        ],
        example: `curl -X GET "https://api.itglue.com/api/configurations?organization_id=uuid" \\
  -H "Authorization: Bearer YOUR_API_KEY"`
      }
    ]
  }

  const filteredEndpoints = endpoints[selectedCategory]?.filter(endpoint =>
    endpoint.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
    endpoint.description.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'bg-green-600 text-white'
      case 'POST': return 'bg-blue-600 text-white'
      case 'PUT': return 'bg-yellow-600 text-white'
      case 'PATCH': return 'bg-orange-600 text-white'
      case 'DELETE': return 'bg-red-600 text-white'
      default: return 'bg-gray-600 text-white'
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header currentPage="API Documentation" />
      <div className="flex">
        <Sidebar onItemClick={handleSidebarItemClick} />
        
        <div className="flex-1 p-6">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center">
                <Code className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold">API Documentation</h1>
                <div className="text-sm text-gray-400">
                  Complete API reference and integration guide
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <a
                href="https://api.itglue.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm"
              >
                <ExternalLink className="w-4 h-4" />
                <span>API Console</span>
              </a>
            </div>
          </div>

          {/* Getting Started */}
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Getting Started</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <Key className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <h3 className="font-medium mb-2">1. Get API Key</h3>
                <p className="text-sm text-gray-400">Generate your API key from the settings page</p>
              </div>
              <div className="text-center">
                <Code className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <h3 className="font-medium mb-2">2. Make Requests</h3>
                <p className="text-sm text-gray-400">Use your API key in the Authorization header</p>
              </div>
              <div className="text-center">
                <Database className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                <h3 className="font-medium mb-2">3. Handle Responses</h3>
                <p className="text-sm text-gray-400">Process JSON responses and handle errors</p>
              </div>
            </div>
          </div>

          <div className="flex space-x-6">
            {/* Categories Sidebar */}
            <div className="w-64 bg-gray-800 rounded-lg p-4">
              <h3 className="font-semibold mb-4">API Categories</h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded text-sm transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    {category.icon}
                    <span>{category.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              {/* Search */}
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search endpoints..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Endpoints */}
              <div className="space-y-4">
                {filteredEndpoints.map((endpoint, index) => {
                  const endpointId = `${endpoint.method}-${endpoint.path}-${index}`
                  const isExpanded = expandedEndpoint === endpointId

                  return (
                    <div key={endpointId} className="bg-gray-800 rounded-lg overflow-hidden">
                      <div
                        className="p-4 cursor-pointer hover:bg-gray-700/50"
                        onClick={() => setExpandedEndpoint(isExpanded ? null : endpointId)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getMethodColor(endpoint.method)}`}>
                              {endpoint.method}
                            </span>
                            <code className="text-blue-400">{endpoint.path}</code>
                            <span className="text-gray-300">{endpoint.description}</span>
                          </div>
                          {isExpanded ? (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="border-t border-gray-700 p-4 space-y-4">
                          {/* Parameters */}
                          {endpoint.parameters && endpoint.parameters.length > 0 && (
                            <div>
                              <h4 className="font-medium mb-2">Parameters</h4>
                              <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                  <thead>
                                    <tr className="border-b border-gray-700">
                                      <th className="text-left p-2">Name</th>
                                      <th className="text-left p-2">Type</th>
                                      <th className="text-left p-2">Required</th>
                                      <th className="text-left p-2">Description</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {endpoint.parameters.map((param, i) => (
                                      <tr key={i} className="border-b border-gray-700/50">
                                        <td className="p-2 font-mono text-blue-400">{param.name}</td>
                                        <td className="p-2 text-gray-300">{param.type}</td>
                                        <td className="p-2">
                                          {param.required ? (
                                            <span className="text-red-400">Yes</span>
                                          ) : (
                                            <span className="text-gray-400">No</span>
                                          )}
                                        </td>
                                        <td className="p-2 text-gray-300">{param.description}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}

                          {/* Example */}
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium">Example Request</h4>
                              <button
                                onClick={() => copyToClipboard(endpoint.example, endpointId)}
                                className="flex items-center space-x-1 text-sm text-blue-400 hover:text-blue-300"
                              >
                                {copiedExample === endpointId ? (
                                  <CheckCircle className="w-4 h-4" />
                                ) : (
                                  <Copy className="w-4 h-4" />
                                )}
                                <span>{copiedExample === endpointId ? 'Copied!' : 'Copy'}</span>
                              </button>
                            </div>
                            <pre className="bg-gray-900 p-4 rounded text-sm overflow-x-auto">
                              <code className="text-green-400">{endpoint.example}</code>
                            </pre>
                          </div>

                          {/* Response */}
                          <div>
                            <h4 className="font-medium mb-2">Response</h4>
                            <pre className="bg-gray-900 p-4 rounded text-sm overflow-x-auto">
                              <code className="text-gray-300">{endpoint.responses[0].example}</code>
                            </pre>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
