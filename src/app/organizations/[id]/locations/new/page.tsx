'use client'

import { useParams } from 'next/navigation'
import NewItemForm from '@/components/NewItemForm'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'

export default function NewLocationPage() {
  const params = useParams()

  const fields = [
    {
      name: 'name',
      label: 'Location Name',
      type: 'text' as const,
      required: true,
      placeholder: 'Main Office, Branch Office, Data Center, etc.'
    },
    {
      name: 'location_type',
      label: 'Location Type',
      type: 'select' as const,
      required: true,
      options: [
        { value: 'office', label: 'Office' },
        { value: 'data_center', label: 'Data Center' },
        { value: 'warehouse', label: 'Warehouse' },
        { value: 'retail', label: 'Retail Store' },
        { value: 'remote', label: 'Remote Site' },
        { value: 'other', label: 'Other' }
      ]
    },
    {
      name: 'address',
      label: 'Street Address',
      type: 'text' as const,
      required: true,
      placeholder: '123 Main Street'
    },
    {
      name: 'city',
      label: 'City',
      type: 'text' as const,
      required: true,
      placeholder: 'New York'
    },
    {
      name: 'state',
      label: 'State/Province',
      type: 'text' as const,
      required: true,
      placeholder: 'NY'
    },
    {
      name: 'postal_code',
      label: 'Postal Code',
      type: 'text' as const,
      required: true,
      placeholder: '10001'
    },
    {
      name: 'country',
      label: 'Country',
      type: 'text' as const,
      required: true,
      placeholder: 'United States'
    },
    {
      name: 'phone',
      label: 'Phone Number',
      type: 'tel' as const,
      placeholder: '+1 (555) 123-4567'
    },
    {
      name: 'fax',
      label: 'Fax Number',
      type: 'tel' as const,
      placeholder: '+1 (555) 123-4568'
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
      name: 'primary_contact',
      label: 'Primary Contact',
      type: 'text' as const,
      placeholder: 'Site manager or primary contact person'
    },
    {
      name: 'is_primary',
      label: 'Primary Location',
      type: 'checkbox' as const
    },
    {
      name: 'is_active',
      label: 'Active Location',
      type: 'checkbox' as const
    },
    {
      name: 'notes',
      label: 'Notes',
      type: 'textarea' as const,
      placeholder: 'Additional information about this location...',
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
            title="New Location"
            tableName="locations"
            organizationId={params.id as string}
            fields={fields}
            redirectPath={`/organizations/${params.id}/locations`}
          />
        </div>
      </div>
    </div>
  )
}
