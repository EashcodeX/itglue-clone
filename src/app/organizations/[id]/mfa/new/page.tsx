'use client'

import { useParams } from 'next/navigation'
import NewItemForm from '@/components/NewItemForm'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'

export default function NewMFAConfigurationPage() {
  const params = useParams()

  const fields = [
    {
      name: 'service_name',
      label: 'Service Name',
      type: 'text' as const,
      required: true,
      placeholder: 'e.g., Microsoft 365, AWS Console'
    },
    {
      name: 'service_type',
      label: 'Service Type',
      type: 'select' as const,
      required: true,
      options: [
        { value: 'email', label: 'Email Service' },
        { value: 'application', label: 'Application' },
        { value: 'website', label: 'Website' },
        { value: 'vpn', label: 'VPN' },
        { value: 'server', label: 'Server' },
        { value: 'database', label: 'Database' },
        { value: 'cloud_service', label: 'Cloud Service' }
      ]
    },
    {
      name: 'mfa_method',
      label: 'MFA Method',
      type: 'select' as const,
      required: true,
      options: [
        { value: 'totp', label: 'TOTP (Authenticator App)' },
        { value: 'sms', label: 'SMS' },
        { value: 'email', label: 'Email' },
        { value: 'hardware_token', label: 'Hardware Token' },
        { value: 'push_notification', label: 'Push Notification' },
        { value: 'backup_codes', label: 'Backup Codes' }
      ]
    },
    {
      name: 'provider',
      label: 'Provider',
      type: 'text' as const,
      required: true,
      placeholder: 'e.g., Microsoft Authenticator, Google Authenticator'
    },
    {
      name: 'account_identifier',
      label: 'Account Identifier',
      type: 'text' as const,
      required: true,
      placeholder: 'Username, email, or account ID'
    },
    {
      name: 'device_name',
      label: 'Device Name',
      type: 'text' as const,
      placeholder: 'Name of MFA device (if applicable)'
    },
    {
      name: 'setup_date',
      label: 'Setup Date',
      type: 'date' as const,
      required: true
    },
    {
      name: 'expiry_date',
      label: 'Expiry Date',
      type: 'date' as const,
      placeholder: 'When does this MFA configuration expire?'
    },
    {
      name: 'assigned_to',
      label: 'Assigned To',
      type: 'text' as const,
      required: true,
      placeholder: 'Person responsible for this MFA setup'
    },
    {
      name: 'shared_account',
      label: 'Shared Account',
      type: 'checkbox' as const
    },
    {
      name: 'recovery_email',
      label: 'Recovery Email',
      type: 'email' as const,
      placeholder: 'backup@company.com'
    },
    {
      name: 'recovery_phone',
      label: 'Recovery Phone',
      type: 'tel' as const,
      placeholder: '+1 (555) 123-4567'
    },
    {
      name: 'qr_code_url',
      label: 'QR Code URL',
      type: 'text' as const,
      placeholder: 'URL to QR code image (for TOTP setup)'
    },
    {
      name: 'notes',
      label: 'Notes',
      type: 'textarea' as const,
      placeholder: 'Additional MFA configuration notes...',
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
            title="New MFA Configuration"
            tableName="mfa_configurations"
            organizationId={params.id as string}
            fields={fields}
            redirectPath={`/organizations/${params.id}/mfa`}
          />
        </div>
      </div>
    </div>
  )
}
