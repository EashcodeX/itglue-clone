'use client'

import { useParams } from 'next/navigation'
import NewItemForm from '@/components/NewItemForm'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'

export default function NewKnownIssuePage() {
  const params = useParams()

  const fields = [
    {
      name: 'title',
      label: 'Issue Title',
      type: 'text' as const,
      required: true,
      placeholder: 'Brief description of the issue'
    },
    {
      name: 'issue_type',
      label: 'Issue Type',
      type: 'select' as const,
      required: true,
      options: [
        { value: 'bug', label: 'Bug' },
        { value: 'performance', label: 'Performance' },
        { value: 'security', label: 'Security' },
        { value: 'compatibility', label: 'Compatibility' },
        { value: 'configuration', label: 'Configuration' },
        { value: 'hardware', label: 'Hardware' },
        { value: 'network', label: 'Network' }
      ]
    },
    {
      name: 'severity',
      label: 'Severity',
      type: 'select' as const,
      required: true,
      options: [
        { value: 'low', label: 'Low' },
        { value: 'medium', label: 'Medium' },
        { value: 'high', label: 'High' },
        { value: 'critical', label: 'Critical' }
      ]
    },
    {
      name: 'priority',
      label: 'Priority',
      type: 'select' as const,
      required: true,
      options: [
        { value: 'low', label: 'Low' },
        { value: 'medium', label: 'Medium' },
        { value: 'high', label: 'High' },
        { value: 'urgent', label: 'Urgent' }
      ]
    },
    {
      name: 'reported_by',
      label: 'Reported By',
      type: 'text' as const,
      required: true,
      placeholder: 'Name of person reporting the issue'
    },
    {
      name: 'assigned_to',
      label: 'Assigned To',
      type: 'text' as const,
      placeholder: 'Person responsible for resolution'
    },
    {
      name: 'reported_date',
      label: 'Reported Date',
      type: 'date' as const,
      required: true
    },
    {
      name: 'environment',
      label: 'Environment',
      type: 'text' as const,
      placeholder: 'Production, Staging, Development, etc.'
    },
    {
      name: 'description',
      label: 'Description',
      type: 'textarea' as const,
      required: true,
      placeholder: 'Detailed description of the issue...',
      rows: 4
    },
    {
      name: 'steps_to_reproduce',
      label: 'Steps to Reproduce',
      type: 'textarea' as const,
      placeholder: '1. Step one\n2. Step two\n3. Step three...',
      rows: 4
    },
    {
      name: 'impact_description',
      label: 'Impact Description',
      type: 'textarea' as const,
      placeholder: 'How does this issue affect users/systems?',
      rows: 3
    },
    {
      name: 'workaround',
      label: 'Workaround',
      type: 'textarea' as const,
      placeholder: 'Temporary solution or workaround...',
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
            title="Report New Issue"
            tableName="known_issues"
            organizationId={params.id as string}
            fields={fields}
            redirectPath={`/organizations/${params.id}/known-issues`}
          />
        </div>
      </div>
    </div>
  )
}
