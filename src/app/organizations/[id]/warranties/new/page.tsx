'use client'

import { useParams } from 'next/navigation'
import NewItemForm from '@/components/NewItemForm'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'

export default function NewWarrantyPage() {
  const params = useParams()

  const fields = [
    {
      name: 'asset_name',
      label: 'Asset Name',
      type: 'text' as const,
      required: true,
      placeholder: 'Name of the asset under warranty'
    },
    {
      name: 'manufacturer',
      label: 'Manufacturer',
      type: 'text' as const,
      placeholder: 'e.g., Dell, HP, Cisco, Microsoft'
    },
    {
      name: 'model',
      label: 'Model',
      type: 'text' as const,
      placeholder: 'Product model number'
    },
    {
      name: 'serial_number',
      label: 'Serial Number',
      type: 'text' as const,
      placeholder: 'Device serial number'
    },
    {
      name: 'warranty_type',
      label: 'Warranty Type',
      type: 'select' as const,
      required: true,
      options: [
        { value: 'hardware', label: 'Hardware' },
        { value: 'software', label: 'Software' },
        { value: 'extended', label: 'Extended' },
        { value: 'maintenance', label: 'Maintenance' }
      ]
    },
    {
      name: 'warranty_provider',
      label: 'Warranty Provider',
      type: 'text' as const,
      placeholder: 'Company providing warranty support'
    },
    {
      name: 'purchase_date',
      label: 'Purchase Date',
      type: 'date' as const,
      placeholder: 'When was this item purchased?'
    },
    {
      name: 'warranty_start_date',
      label: 'Warranty Start Date',
      type: 'date' as const,
      required: true
    },
    {
      name: 'warranty_end_date',
      label: 'Warranty End Date',
      type: 'date' as const,
      required: true
    },
    {
      name: 'warranty_duration_months',
      label: 'Warranty Duration (Months)',
      type: 'number' as const,
      placeholder: '12, 24, 36, etc.'
    },
    {
      name: 'coverage_type',
      label: 'Coverage Type',
      type: 'select' as const,
      options: [
        { value: 'full', label: 'Full Coverage' },
        { value: 'parts_only', label: 'Parts Only' },
        { value: 'labor_only', label: 'Labor Only' },
        { value: 'limited', label: 'Limited Coverage' }
      ]
    },
    {
      name: 'service_level',
      label: 'Service Level',
      type: 'select' as const,
      options: [
        { value: 'next_business_day', label: 'Next Business Day' },
        { value: '4_hour', label: '4 Hour Response' },
        { value: '8_hour', label: '8 Hour Response' },
        { value: '24_hour', label: '24 Hour Response' },
        { value: 'best_effort', label: 'Best Effort' }
      ]
    },
    {
      name: 'warranty_cost',
      label: 'Warranty Cost ($)',
      type: 'number' as const,
      placeholder: '1500.00'
    },
    {
      name: 'renewal_cost',
      label: 'Renewal Cost ($)',
      type: 'number' as const,
      placeholder: '800.00'
    },
    {
      name: 'auto_renewal',
      label: 'Auto Renewal Enabled',
      type: 'checkbox' as const
    },
    {
      name: 'contact_name',
      label: 'Contact Name',
      type: 'text' as const,
      placeholder: 'Support contact person'
    },
    {
      name: 'contact_phone',
      label: 'Contact Phone',
      type: 'tel' as const,
      placeholder: '+1 (555) 123-4567'
    },
    {
      name: 'contact_email',
      label: 'Contact Email',
      type: 'email' as const,
      placeholder: 'support@company.com'
    },
    {
      name: 'warranty_document_url',
      label: 'Warranty Document URL',
      type: 'text' as const,
      placeholder: 'https://example.com/warranty.pdf'
    },
    {
      name: 'notes',
      label: 'Notes',
      type: 'textarea' as const,
      placeholder: 'Additional warranty information...',
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
            title="New Warranty"
            tableName="warranties"
            organizationId={params.id as string}
            fields={fields}
            redirectPath={`/organizations/${params.id}/warranties`}
          />
        </div>
      </div>
    </div>
  )
}
