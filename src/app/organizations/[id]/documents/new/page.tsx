'use client'

import { useParams } from 'next/navigation'
import NewItemForm from '@/components/NewItemForm'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'

export default function NewDocumentPage() {
  const params = useParams()

  const fields = [
    {
      name: 'name',
      label: 'Document Name',
      type: 'text' as const,
      required: true,
      placeholder: 'Enter document name'
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
        { value: 'diagram', label: 'Diagram' },
        { value: 'specification', label: 'Specification' },
        { value: 'other', label: 'Other' }
      ]
    },
    {
      name: 'document_type',
      label: 'Document Type',
      type: 'select' as const,
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
      name: 'file_size',
      label: 'File Size (KB)',
      type: 'number' as const,
      placeholder: '1024'
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
      name: 'description',
      label: 'Description',
      type: 'textarea' as const,
      placeholder: 'Document description and notes...',
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
            title="New Document"
            tableName="documents"
            organizationId={params.id as string}
            fields={fields}
            redirectPath={`/organizations/${params.id}/documents`}
          />
        </div>
      </div>
    </div>
  )
}
