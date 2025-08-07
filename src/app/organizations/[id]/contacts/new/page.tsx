'use client'

import { useParams } from 'next/navigation'
import NewItemForm from '@/components/NewItemForm'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'

export default function NewContactPage() {
  const params = useParams()

  const fields = [
    {
      name: 'first_name',
      label: 'First Name',
      type: 'text' as const,
      required: true,
      placeholder: 'John'
    },
    {
      name: 'last_name',
      label: 'Last Name',
      type: 'text' as const,
      required: true,
      placeholder: 'Smith'
    },
    {
      name: 'title',
      label: 'Job Title',
      type: 'text' as const,
      placeholder: 'IT Manager, CEO, etc.'
    },
    {
      name: 'department',
      label: 'Department',
      type: 'text' as const,
      placeholder: 'IT, Finance, Operations, etc.'
    },
    {
      name: 'contact_type',
      label: 'Contact Type',
      type: 'select' as const,
      required: true,
      options: [
        { value: 'primary', label: 'Primary Contact' },
        { value: 'technical', label: 'Technical Contact' },
        { value: 'billing', label: 'Billing Contact' },
        { value: 'emergency', label: 'Emergency Contact' },
        { value: 'vendor', label: 'Vendor Contact' },
        { value: 'other', label: 'Other' }
      ]
    },
    {
      name: 'email',
      label: 'Email Address',
      type: 'email' as const,
      required: true,
      placeholder: 'john.smith@company.com'
    },
    {
      name: 'phone',
      label: 'Phone Number',
      type: 'tel' as const,
      placeholder: '+1 (555) 123-4567'
    },
    {
      name: 'mobile',
      label: 'Mobile Number',
      type: 'tel' as const,
      placeholder: '+1 (555) 987-6543'
    },
    {
      name: 'extension',
      label: 'Extension',
      type: 'text' as const,
      placeholder: '1234'
    },
    {
      name: 'location',
      label: 'Location',
      type: 'text' as const,
      placeholder: 'Office location or address'
    },
    {
      name: 'time_zone',
      label: 'Time Zone',
      type: 'select' as const,
      options: [
        { value: 'EST', label: 'Eastern (EST)' },
        { value: 'CST', label: 'Central (CST)' },
        { value: 'MST', label: 'Mountain (MST)' },
        { value: 'PST', label: 'Pacific (PST)' },
        { value: 'UTC', label: 'UTC' }
      ]
    },
    {
      name: 'preferred_contact_method',
      label: 'Preferred Contact Method',
      type: 'select' as const,
      options: [
        { value: 'email', label: 'Email' },
        { value: 'phone', label: 'Phone' },
        { value: 'mobile', label: 'Mobile' },
        { value: 'teams', label: 'Microsoft Teams' },
        { value: 'slack', label: 'Slack' }
      ]
    },
    {
      name: 'is_primary',
      label: 'Primary Contact',
      type: 'checkbox' as const
    },
    {
      name: 'is_active',
      label: 'Active Contact',
      type: 'checkbox' as const
    },
    {
      name: 'notes',
      label: 'Notes',
      type: 'textarea' as const,
      placeholder: 'Additional information about this contact...',
      rows: 3
    }
  ]

  const handleSidebarItemClick = (item: any) => {
    // Handle sidebar navigation if needed
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header currentPage="Organizations" />
      <div className="flex">
        <Sidebar onItemClick={handleSidebarItemClick} />
        <div className="flex-1">
          <NewItemForm
            title="New Contact"
            tableName="contacts"
            organizationId={params.id as string}
            fields={fields}
            redirectPath={`/organizations/${params.id}/contacts`}
          />
        </div>
      </div>
    </div>
  )
}
