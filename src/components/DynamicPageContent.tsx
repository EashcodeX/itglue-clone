'use client'

import { useState, useEffect } from 'react'
import { Save } from 'lucide-react'
import { PageContent, PageContentService } from '@/lib/page-content-service'
import RichTextContent from './content-types/RichTextContent'
import ContactFormContent from './content-types/ContactFormContent'
import FormDataContent from './content-types/FormDataContent'

interface DynamicPageContentProps {
  content: PageContent
  isEditing: boolean
  onSave: (contentData: any) => void
}

export default function DynamicPageContent({ content, isEditing, onSave }: DynamicPageContentProps) {
  const [contentData, setContentData] = useState(content.content_data)
  const [hasChanges, setHasChanges] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setContentData(content.content_data)
    setHasChanges(false)
  }, [content])

  const handleContentChange = (newData: any) => {
    setContentData(newData)
    setHasChanges(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await onSave(contentData)
      setHasChanges(false)
    } finally {
      setSaving(false)
    }
  }

  const renderContentByType = () => {
    const commonProps = {
      data: contentData,
      isEditing,
      onChange: handleContentChange
    }

    switch (content.content_type) {
      case 'rich-text':
        return <RichTextContent {...commonProps} />

      case 'contact-form':
        return <ContactFormContent {...commonProps} />

      case 'form-data':
        return <FormDataContent {...commonProps} />

      default:
        return (
          <div className="p-6 text-center">
            <p className="text-gray-400">Unknown content type: {content.content_type}</p>
            <p className="text-sm text-gray-500 mt-2">
              This content type is not supported yet.
            </p>
          </div>
        )
    }
  }

  return (
    <div className="relative">
      {/* Save button for editing mode */}
      {isEditing && hasChanges && (
        <div className="sticky top-0 z-10 bg-blue-900/20 border-b border-blue-800 px-6 py-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-blue-300">You have unsaved changes</p>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}

      {/* Content area */}
      <div className="min-h-[400px]">
        {renderContentByType()}
      </div>

      {/* Content type info */}
      {isEditing && (
        <div className="border-t border-gray-700 px-6 py-4 bg-gray-900">
          <div className="flex items-center justify-between text-sm text-gray-400">
            <span>Content Type: {PageContentService.getContentType(content.content_type)?.name || content.content_type}</span>
            <span>Last updated: {new Date(content.updated_at).toLocaleDateString()}</span>
          </div>
        </div>
      )}
    </div>
  )
}
