'use client'

import { useParams } from 'next/navigation'
import NewItemForm from '@/components/NewItemForm'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'

export default function NewCoreDocumentationPage() {
  const params = useParams()

  const fields = [
    {
      name: 'document_name',
      label: 'Document Name',
      type: 'text' as const,
      required: true,
      placeholder: 'Enter document name'
    },
    {
      name: 'document_type',
      label: 'Document Type',
      type: 'select' as const,
      required: true,
      options: [
        { value: 'pdf', label: 'PDF' },
        { value: 'word', label: 'Word Document' },
        { value: 'excel', label: 'Excel Spreadsheet' },
        { value: 'powerpoint', label: 'PowerPoint' },
        { value: 'text', label: 'Text File' },
        { value: 'image', label: 'Image' },
        { value: 'other', label: 'Other' }
      ]
    },
    {
      name: 'category',
      label: 'Category',
      type: 'select' as const,
      required: true,
      options: [
        { value: 'policy', label: 'Policy' },
        { value: 'procedure', label: 'Procedure' },
        { value: 'manual', label: 'Manual' },
        { value: 'contract', label: 'Contract' },
        { value: 'specification', label: 'Specification' },
        { value: 'template', label: 'Template' },
        { value: 'other', label: 'Other' }
      ]
    },
    {
      name: 'status',
      label: 'Status',
      type: 'select' as const,
      required: true,
      options: [
        { value: 'active', label: 'Active' },
        { value: 'draft', label: 'Draft' },
        { value: 'under_review', label: 'Under Review' },
        { value: 'archived', label: 'Archived' }
      ]
    },
    {
      name: 'access_level',
      label: 'Access Level',
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
      name: 'version',
      label: 'Version',
      type: 'text' as const,
      placeholder: 'e.g., 1.0, 2.1'
    },
    {
      name: 'author',
      label: 'Author',
      type: 'text' as const,
      placeholder: 'Document author'
    },
    {
      name: 'file_url',
      label: 'File URL',
      type: 'text' as const,
      placeholder: 'https://example.com/document.pdf'
    },
    {
      name: 'file_size_kb',
      label: 'File Size (KB)',
      type: 'number' as const,
      placeholder: '1024'
    },
    {
      name: 'last_reviewed_date',
      label: 'Last Reviewed Date',
      type: 'date' as const
    },
    {
      name: 'next_review_date',
      label: 'Next Review Date',
      type: 'date' as const
    },
    {
      name: 'tags',
      label: 'Tags',
      type: 'text' as const,
      placeholder: 'Comma-separated tags'
    },
    {
      name: 'is_confidential',
      label: 'Confidential Document',
      type: 'checkbox' as const
    },
    {
      name: 'approval_required',
      label: 'Approval Required',
      type: 'checkbox' as const
    },
    {
      name: 'approved_by',
      label: 'Approved By',
      type: 'text' as const,
      placeholder: 'Approver name'
    },
    {
      name: 'approved_date',
      label: 'Approved Date',
      type: 'date' as const
    },
    {
      name: 'description',
      label: 'Description',
      type: 'textarea' as const,
      placeholder: 'Document description and purpose...',
      rows: 4
    },
    {
      name: 'notes',
      label: 'Notes',
      type: 'textarea' as const,
      placeholder: 'Additional notes...',
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
            title="New Core Documentation"
            tableName="core_documentation"
            organizationId={params.id as string}
            fields={fields}
            redirectPath={`/organizations/${params.id}/core-documentation`}
          />
        </div>
      </div>
    </div>
  )
}
