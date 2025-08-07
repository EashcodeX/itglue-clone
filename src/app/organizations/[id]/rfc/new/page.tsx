'use client'

import { useParams } from 'next/navigation'
import NewItemForm from '@/components/NewItemForm'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'

export default function NewRFCPage() {
  const params = useParams()

  const fields = [
    {
      name: 'title',
      label: 'RFC Title',
      type: 'text' as const,
      required: true,
      placeholder: 'Brief title of the change request'
    },
    {
      name: 'change_type',
      label: 'Change Type',
      type: 'select' as const,
      required: true,
      options: [
        { value: 'emergency', label: 'Emergency' },
        { value: 'standard', label: 'Standard' },
        { value: 'normal', label: 'Normal' },
        { value: 'major', label: 'Major' }
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
        { value: 'critical', label: 'Critical' }
      ]
    },
    {
      name: 'category',
      label: 'Category',
      type: 'select' as const,
      required: true,
      options: [
        { value: 'hardware', label: 'Hardware' },
        { value: 'software', label: 'Software' },
        { value: 'network', label: 'Network' },
        { value: 'security', label: 'Security' },
        { value: 'process', label: 'Process' },
        { value: 'other', label: 'Other' }
      ]
    },
    {
      name: 'requested_by',
      label: 'Requested By',
      type: 'text' as const,
      required: true,
      placeholder: 'Name of person requesting the change'
    },
    {
      name: 'assigned_to',
      label: 'Assigned To',
      type: 'text' as const,
      placeholder: 'Person responsible for implementation'
    },
    {
      name: 'scheduled_start',
      label: 'Scheduled Start',
      type: 'date' as const,
      placeholder: 'When should this change begin?'
    },
    {
      name: 'scheduled_end',
      label: 'Scheduled End',
      type: 'date' as const,
      placeholder: 'When should this change complete?'
    },
    {
      name: 'approval_required',
      label: 'Approval Required',
      type: 'checkbox' as const
    },
    {
      name: 'description',
      label: 'Description',
      type: 'textarea' as const,
      required: true,
      placeholder: 'Detailed description of the proposed change...',
      rows: 4
    },
    {
      name: 'business_justification',
      label: 'Business Justification',
      type: 'textarea' as const,
      required: true,
      placeholder: 'Why is this change necessary?',
      rows: 3
    },
    {
      name: 'implementation_plan',
      label: 'Implementation Plan',
      type: 'textarea' as const,
      required: true,
      placeholder: 'Step-by-step implementation plan...',
      rows: 4
    },
    {
      name: 'rollback_plan',
      label: 'Rollback Plan',
      type: 'textarea' as const,
      required: true,
      placeholder: 'How to rollback if issues occur...',
      rows: 3
    },
    {
      name: 'risk_assessment',
      label: 'Risk Assessment',
      type: 'textarea' as const,
      required: true,
      placeholder: 'Potential risks and mitigation strategies...',
      rows: 3
    },
    {
      name: 'impact_assessment',
      label: 'Impact Assessment',
      type: 'textarea' as const,
      required: true,
      placeholder: 'Expected impact on systems and users...',
      rows: 3
    },
    {
      name: 'testing_plan',
      label: 'Testing Plan',
      type: 'textarea' as const,
      placeholder: 'How will the change be tested?',
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
            title="New Request for Change (RFC)"
            tableName="rfcs"
            organizationId={params.id as string}
            fields={fields}
            redirectPath={`/organizations/${params.id}/rfc`}
          />
        </div>
      </div>
    </div>
  )
}
