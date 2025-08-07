'use client'

import { useParams } from 'next/navigation'
import NewItemForm from '@/components/NewItemForm'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'

export default function NewConfigurationPage() {
  const params = useParams()

  const fields = [
    {
      name: 'name',
      label: 'Configuration Name',
      type: 'text' as const,
      required: true,
      placeholder: 'Enter configuration name'
    },
    {
      name: 'configuration_type',
      label: 'Type',
      type: 'select' as const,
      required: true,
      options: [
        { value: 'server', label: 'Server' },
        { value: 'workstation', label: 'Workstation' },
        { value: 'network_device', label: 'Network Device' },
        { value: 'security_appliance', label: 'Security Appliance' },
        { value: 'storage', label: 'Storage' },
        { value: 'virtualization', label: 'Virtualization' },
        { value: 'other', label: 'Other' }
      ]
    },
    {
      name: 'operating_system',
      label: 'Operating System',
      type: 'text' as const,
      placeholder: 'e.g., Windows Server 2022, Ubuntu 22.04'
    },
    {
      name: 'primary_ip',
      label: 'Primary IP Address',
      type: 'text' as const,
      placeholder: '192.168.1.100'
    },
    {
      name: 'serial_number',
      label: 'Serial Number',
      type: 'text' as const,
      placeholder: 'Enter serial number'
    },
    {
      name: 'manufacturer',
      label: 'Manufacturer',
      type: 'text' as const,
      placeholder: 'e.g., Dell, HP, Cisco'
    },
    {
      name: 'model',
      label: 'Model',
      type: 'text' as const,
      placeholder: 'e.g., PowerEdge R750, ProLiant DL380'
    },
    {
      name: 'location',
      label: 'Location',
      type: 'text' as const,
      placeholder: 'Physical location'
    },
    {
      name: 'contact_person',
      label: 'Contact Person',
      type: 'text' as const,
      placeholder: 'Responsible person'
    },
    {
      name: 'warranty_expiry',
      label: 'Warranty Expiry',
      type: 'date' as const
    },
    {
      name: 'status',
      label: 'Status',
      type: 'select' as const,
      required: true,
      options: [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
        { value: 'maintenance', label: 'Maintenance' },
        { value: 'decommissioned', label: 'Decommissioned' }
      ]
    },
    {
      name: 'description',
      label: 'Description',
      type: 'textarea' as const,
      placeholder: 'Additional details about this configuration...',
      rows: 4
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
            title="New Configuration"
            tableName="configurations"
            organizationId={params.id as string}
            fields={fields}
            redirectPath={`/organizations/${params.id}/configurations`}
          />
        </div>
      </div>
    </div>
  )
}
