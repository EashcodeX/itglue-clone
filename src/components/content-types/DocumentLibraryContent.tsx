'use client'

interface DocumentLibraryContentProps {
  data: any
  isEditing: boolean
  onChange: (data: any) => void
}

export default function DocumentLibraryContent({ data, isEditing, onChange }: DocumentLibraryContentProps) {
  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Document Library</h2>
      <p className="text-gray-500">Document library content type - Coming soon!</p>
    </div>
  )
}
