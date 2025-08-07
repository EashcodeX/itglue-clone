'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase, type Organization } from '@/lib/supabase'
import { useClient } from '@/contexts/ClientContext'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'
import { 
  Users, 
  ArrowLeft,
  Edit,
  Plus,
  Phone,
  Mail,
  User,
  Star,
  MoreHorizontal
} from 'lucide-react'

interface Contact {
  id: string
  name: string
  email: string
  phone: string
  role: string
  department: string
  title: string
  isPrimary: boolean
}

export default function ContactsPage() {
  const params = useParams()
  const router = useRouter()
  const { selectedClient } = useClient()
  const [loading, setLoading] = useState(true)
  const [organization, setOrganization] = useState<Organization | null>(null)
  // Initialize with empty array - no hardcoded sample data
  const [contacts, setContacts] = useState<Contact[]>([])

  useEffect(() => {
    if (params.id) {
      fetchOrganization(params.id as string)
    }
  }, [params.id])

  const fetchOrganization = async (id: string) => {
    try {
      setLoading(true)

      // Fetch organization data
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', id)
        .single()

      if (orgError) throw orgError
      setOrganization(orgData)

      // Fetch contacts for this organization
      const { data: contactsData, error: contactsError } = await supabase
        .from('contacts')
        .select('*')
        .eq('organization_id', id)

      if (contactsError) {
        console.warn('Error fetching contacts:', contactsError)
        // Don't throw error - organization might not have contacts yet
        setContacts([])
      } else {
        setContacts(contactsData || [])
      }

    } catch (err) {
      console.error('Error fetching organization:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSidebarItemClick = (item: any) => {
    console.log('Sidebar item clicked:', item)
    if (item.href) {
      if (item.href === '/') {
        router.push('/')
      } else {
        router.push(`/organizations/${params.id}${item.href}`)
      }
    }
  }

  const handleBackToOrganization = () => {
    router.push(`/organizations/${params.id}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <Header currentPage="Organizations" />
        <div className="flex">
          <Sidebar onItemClick={handleSidebarItemClick} />
          <div className="flex-1 p-6">
            <div className="flex items-center justify-center h-64">
              <div className="text-gray-400">Loading...</div>
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
        
        {/* Main Content */}
        <div className="flex-1">
          <div className="p-6">
            {/* Back Button */}
            <button
              onClick={handleBackToOrganization}
              className="flex items-center space-x-2 text-gray-400 hover:text-white mb-4 text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Organization</span>
            </button>

            {/* Page Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-semibold">Contacts</h1>
                  <div className="text-sm text-gray-400">
                    {organization?.name} • {contacts.length} contacts
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => router.push(`/organizations/${params.id}/edit`)}
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => router.push(`/organizations/${params.id}/contacts/new`)}
                  className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Contact</span>
                </button>
              </div>
            </div>

            {/* Contacts List */}
            <div className="bg-gray-800 rounded-lg overflow-hidden">
              <div className="p-4 border-b border-gray-700">
                <h2 className="text-lg font-medium">All Contacts</h2>
              </div>
              
              <div className="divide-y divide-gray-700">
                {contacts.map((contact) => (
                  <div key={contact.id} className="p-4 hover:bg-gray-750 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-medium text-white">{contact.name}</h3>
                            {contact.isPrimary && (
                              <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            )}
                          </div>
                          <div className="text-sm text-gray-400">{contact.title} • {contact.department}</div>
                          <div className="text-sm text-blue-400">{contact.role}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="flex items-center space-x-2 text-sm text-gray-300">
                            <Mail className="w-4 h-4" />
                            <span>{contact.email}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-300 mt-1">
                            <Phone className="w-4 h-4" />
                            <span>{contact.phone}</span>
                          </div>
                        </div>
                        
                        <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Statistics */}
            <div className="grid grid-cols-4 gap-4 mt-6">
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="text-2xl font-bold text-white">{contacts.length}</div>
                <div className="text-sm text-gray-400">Total Contacts</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="text-2xl font-bold text-yellow-500">{contacts.filter(c => c.isPrimary).length}</div>
                <div className="text-sm text-gray-400">Primary Contacts</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-500">{new Set(contacts.map(c => c.department)).size}</div>
                <div className="text-sm text-gray-400">Departments</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-500">{contacts.filter(c => c.email).length}</div>
                <div className="text-sm text-gray-400">With Email</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
