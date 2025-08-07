'use client'

import { useParams } from 'next/navigation'
import NewItemForm from '@/components/NewItemForm'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'

export default function NewSSLCertificatePage() {
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
      name: 'certificate_name',
      label: 'Certificate Name',
      type: 'text' as const,
      required: true,
      placeholder: 'Main Website SSL'
    },
    {
      name: 'certificate_type',
      label: 'Certificate Type',
      type: 'select' as const,
      required: true,
      options: [
        { value: 'domain_validated', label: 'Domain Validated (DV)' },
        { value: 'organization_validated', label: 'Organization Validated (OV)' },
        { value: 'extended_validation', label: 'Extended Validation (EV)' },
        { value: 'wildcard', label: 'Wildcard' },
        { value: 'multi_domain', label: 'Multi-Domain (SAN)' }
      ]
    },
    {
      name: 'issuer',
      label: 'Certificate Issuer',
      type: 'text' as const,
      required: true,
      placeholder: 'Let\'s Encrypt, DigiCert, etc.'
    },
    {
      name: 'certificate_authority',
      label: 'Certificate Authority',
      type: 'text' as const,
      required: true,
      placeholder: 'Certificate Authority name'
    },
    {
      name: 'subject',
      label: 'Subject',
      type: 'text' as const,
      required: true,
      placeholder: 'CN=example.com'
    },
    {
      name: 'serial_number',
      label: 'Serial Number',
      type: 'text' as const,
      required: true,
      placeholder: 'Certificate serial number'
    },
    {
      name: 'algorithm',
      label: 'Algorithm',
      type: 'select' as const,
      options: [
        { value: 'SHA256-RSA', label: 'SHA256-RSA' },
        { value: 'SHA384-RSA', label: 'SHA384-RSA' },
        { value: 'SHA256-ECDSA', label: 'SHA256-ECDSA' },
        { value: 'SHA384-ECDSA', label: 'SHA384-ECDSA' }
      ]
    },
    {
      name: 'key_size',
      label: 'Key Size',
      type: 'select' as const,
      options: [
        { value: '2048', label: '2048 bits' },
        { value: '3072', label: '3072 bits' },
        { value: '4096', label: '4096 bits' }
      ]
    },
    {
      name: 'issued_date',
      label: 'Issued Date',
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
      name: 'renewal_provider',
      label: 'Renewal Provider',
      type: 'text' as const,
      placeholder: 'Provider handling renewal'
    },
    {
      name: 'validation_method',
      label: 'Validation Method',
      type: 'select' as const,
      options: [
        { value: 'dns', label: 'DNS Validation' },
        { value: 'http', label: 'HTTP Validation' },
        { value: 'email', label: 'Email Validation' }
      ]
    },
    {
      name: 'cost',
      label: 'Cost ($)',
      type: 'number' as const,
      placeholder: '99.00'
    },
    {
      name: 'contact_email',
      label: 'Contact Email',
      type: 'email' as const,
      placeholder: 'admin@example.com'
    },
    {
      name: 'monitoring_enabled',
      label: 'Enable Monitoring',
      type: 'checkbox' as const
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
            title="New SSL Certificate"
            tableName="ssl_certificates"
            organizationId={params.id as string}
            fields={fields}
            redirectPath={`/organizations/${params.id}/ssl-tracker`}
          />
        </div>
      </div>
    </div>
  )
}
