'use client'

import { useParams } from 'next/navigation'
import NewItemForm from '@/components/NewItemForm'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'

export default function NewMaintenanceWindowPage() {
  const params = useParams()

  const fields = [
    {
      name: 'title',
      label: 'Maintenance Title',
      type: 'text' as const,
      required: true,
      placeholder: 'Brief description of maintenance activity'
    },
    {
      name: 'maintenance_type',
      label: 'Maintenance Type',
      type: 'select' as const,
      required: true,
      options: [
        { value: 'scheduled', label: 'Scheduled' },
        { value: 'emergency', label: 'Emergency' },
        { value: 'routine', label: 'Routine' },
        { value: 'upgrade', label: 'Upgrade' },
        { value: 'patch', label: 'Patch' }
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
      name: 'start_time',
      label: 'Start Time',
      type: 'date' as const,
      required: true
    },
    {
      name: 'end_time',
      label: 'End Time',
      type: 'date' as const,
      required: true
    },
    {
      name: 'estimated_duration_minutes',
      label: 'Estimated Duration (Minutes)',
      type: 'number' as const,
      required: true,
      placeholder: '120'
    },
    {
      name: 'assigned_technician',
      label: 'Assigned Technician',
      type: 'text' as const,
      required: true,
      placeholder: 'Primary technician responsible'
    },
    {
      name: 'backup_technician',
      label: 'Backup Technician',
      type: 'text' as const,
      placeholder: 'Secondary technician (optional)'
    },
    {
      name: 'downtime_expected',
      label: 'Downtime Expected',
      type: 'checkbox' as const
    },
    {
      name: 'customer_notification_required',
      label: 'Customer Notification Required',
      type: 'checkbox' as const
    },
    {
      name: 'approval_required',
      label: 'Approval Required',
      type: 'checkbox' as const
    },
    {
      name: 'created_by',
      label: 'Created By',
      type: 'text' as const,
      required: true,
      placeholder: 'Person scheduling this maintenance'
    },
    {
      name: 'description',
      label: 'Description',
      type: 'textarea' as const,
      required: true,
      placeholder: 'Detailed description of maintenance activities...',
      rows: 4
    },
    {
      name: 'impact_description',
      label: 'Impact Description',
      type: 'textarea' as const,
      required: true,
      placeholder: 'Expected impact on systems and users...',
      rows: 3
    },
    {
      name: 'maintenance_steps',
      label: 'Maintenance Steps',
      type: 'textarea' as const,
      placeholder: '1. Step one\n2. Step two\n3. Step three...',
      rows: 4
    },
    {
      name: 'rollback_plan',
      label: 'Rollback Plan',
      type: 'textarea' as const,
      placeholder: 'Plan to rollback changes if issues occur...',
      rows: 3
    },
    {
      name: 'post_maintenance_verification',
      label: 'Post-Maintenance Verification',
      type: 'textarea' as const,
      placeholder: 'Steps to verify maintenance was successful...',
      rows: 3
    },
    {
      name: 'notes',
      label: 'Additional Notes',
      type: 'textarea' as const,
      placeholder: 'Any additional information...',
      rows: 2
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
            title="Schedule Maintenance Window"
            tableName="maintenance_windows"
            organizationId={params.id as string}
            fields={fields}
            redirectPath={`/organizations/${params.id}/maintenance-windows`}
          />
        </div>
      </div>
    </div>
  )
}
