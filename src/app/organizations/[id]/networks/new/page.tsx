'use client'

import { useParams } from 'next/navigation'
import NewItemForm from '@/components/NewItemForm'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'

export default function NewNetworkPage() {
  const params = useParams()

  const fields = [
    {
      name: 'network_name',
      label: 'Network Name',
      type: 'text' as const,
      required: true,
      placeholder: 'e.g., Production LAN, Guest WiFi'
    },
    {
      name: 'network_type',
      label: 'Network Type',
      type: 'select' as const,
      required: true,
      options: [
        { value: 'lan', label: 'LAN' },
        { value: 'wan', label: 'WAN' },
        { value: 'wifi', label: 'WiFi' },
        { value: 'vpn', label: 'VPN' },
        { value: 'dmz', label: 'DMZ' },
        { value: 'guest', label: 'Guest Network' },
        { value: 'management', label: 'Management Network' }
      ]
    },
    {
      name: 'subnet',
      label: 'Subnet (CIDR)',
      type: 'text' as const,
      required: true,
      placeholder: '192.168.1.0/24'
    },
    {
      name: 'subnet_mask',
      label: 'Subnet Mask',
      type: 'text' as const,
      required: true,
      placeholder: '255.255.255.0'
    },
    {
      name: 'gateway',
      label: 'Gateway',
      type: 'text' as const,
      required: true,
      placeholder: '192.168.1.1'
    },
    {
      name: 'dns_primary',
      label: 'Primary DNS',
      type: 'text' as const,
      placeholder: '8.8.8.8'
    },
    {
      name: 'dns_secondary',
      label: 'Secondary DNS',
      type: 'text' as const,
      placeholder: '8.8.4.4'
    },
    {
      name: 'dhcp_enabled',
      label: 'DHCP Enabled',
      type: 'checkbox' as const
    },
    {
      name: 'dhcp_range_start',
      label: 'DHCP Range Start',
      type: 'text' as const,
      placeholder: '192.168.1.100'
    },
    {
      name: 'dhcp_range_end',
      label: 'DHCP Range End',
      type: 'text' as const,
      placeholder: '192.168.1.200'
    },
    {
      name: 'vlan_id',
      label: 'VLAN ID',
      type: 'number' as const,
      placeholder: '10'
    },
    {
      name: 'location',
      label: 'Location',
      type: 'text' as const,
      placeholder: 'Physical location of network'
    },
    {
      name: 'security_level',
      label: 'Security Level',
      type: 'select' as const,
      required: true,
      options: [
        { value: 'public', label: 'Public' },
        { value: 'internal', label: 'Internal' },
        { value: 'restricted', label: 'Restricted' },
        { value: 'confidential', label: 'Confidential' }
      ]
    },
    {
      name: 'monitoring_enabled',
      label: 'Monitoring Enabled',
      type: 'checkbox' as const
    },
    {
      name: 'bandwidth_limit',
      label: 'Bandwidth Limit',
      type: 'text' as const,
      placeholder: '100 Mbps'
    },
    {
      name: 'qos_enabled',
      label: 'QoS Enabled',
      type: 'checkbox' as const
    },
    {
      name: 'backup_gateway',
      label: 'Backup Gateway',
      type: 'text' as const,
      placeholder: '192.168.1.2'
    },
    {
      name: 'contact_person',
      label: 'Contact Person',
      type: 'text' as const,
      placeholder: 'Network administrator'
    },
    {
      name: 'documentation_url',
      label: 'Documentation URL',
      type: 'text' as const,
      placeholder: 'https://wiki.company.com/network-docs'
    },
    {
      name: 'description',
      label: 'Description',
      type: 'textarea' as const,
      placeholder: 'Network description and purpose...',
      rows: 3
    },
    {
      name: 'notes',
      label: 'Notes',
      type: 'textarea' as const,
      placeholder: 'Additional network information...',
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
            title="New Network Configuration"
            tableName="networks"
            organizationId={params.id as string}
            fields={fields}
            redirectPath={`/organizations/${params.id}/networks`}
          />
        </div>
      </div>
    </div>
  )
}
