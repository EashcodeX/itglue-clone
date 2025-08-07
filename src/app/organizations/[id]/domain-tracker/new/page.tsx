'use client'

import { useParams } from 'next/navigation'
import NewItemForm from '@/components/NewItemForm'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'

export default function NewDomainPage() {
  const params = useParams()

  const fields = [
    {
      name: 'domain_name',
      label: 'Domain Name',
      type: 'text' as const,
      required: true,
      placeholder: 'example.com'
    },
    {
      name: 'domain_type',
      label: 'Domain Type',
      type: 'select' as const,
      required: true,
      options: [
        { value: 'primary', label: 'Primary Domain' },
        { value: 'subdomain', label: 'Subdomain' },
        { value: 'redirect', label: 'Redirect Domain' },
        { value: 'parked', label: 'Parked Domain' },
        { value: 'development', label: 'Development Domain' }
      ]
    },
    {
      name: 'registrar',
      label: 'Domain Registrar',
      type: 'text' as const,
      required: true,
      placeholder: 'GoDaddy, Namecheap, Google Domains, etc.'
    },
    {
      name: 'registration_date',
      label: 'Registration Date',
      type: 'date' as const,
      required: true
    },
    {
      name: 'expiry_date',
      label: 'Expiry Date',
      type: 'date' as const,
      required: true
    },
    {
      name: 'auto_renewal',
      label: 'Auto Renewal Enabled',
      type: 'checkbox' as const
    },
    {
      name: 'renewal_cost',
      label: 'Annual Renewal Cost ($)',
      type: 'number' as const,
      placeholder: '15.99'
    },
    {
      name: 'dns_provider',
      label: 'DNS Provider',
      type: 'text' as const,
      placeholder: 'Cloudflare, Route 53, etc.'
    },
    {
      name: 'hosting_provider',
      label: 'Hosting Provider',
      type: 'text' as const,
      placeholder: 'AWS, Azure, GCP, etc.'
    },
    {
      name: 'nameservers',
      label: 'Nameservers',
      type: 'textarea' as const,
      placeholder: 'ns1.example.com\nns2.example.com',
      rows: 3
    },
    {
      name: 'privacy_protection',
      label: 'Privacy Protection Enabled',
      type: 'checkbox' as const
    },
    {
      name: 'lock_status',
      label: 'Domain Lock Enabled',
      type: 'checkbox' as const
    },
    {
      name: 'contact_email',
      label: 'Contact Email',
      type: 'email' as const,
      placeholder: 'admin@example.com'
    },
    {
      name: 'monitoring_enabled',
      label: 'Expiry Monitoring Enabled',
      type: 'checkbox' as const
    },
    {
      name: 'notes',
      label: 'Notes',
      type: 'textarea' as const,
      placeholder: 'Additional domain information...',
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
            title="New Domain"
            tableName="domains"
            organizationId={params.id as string}
            fields={fields}
            redirectPath={`/organizations/${params.id}/domain-tracker`}
          />
        </div>
      </div>
    </div>
  )
}
