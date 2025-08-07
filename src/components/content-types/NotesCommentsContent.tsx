'use client'

interface NotesCommentsContentProps {
  data: any
  isEditing: boolean
  onChange: (data: any) => void
}

export default function NotesCommentsContent({ data, isEditing, onChange }: NotesCommentsContentProps) {
  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Notes & Comments</h2>
      <p className="text-gray-500">Notes & comments content type - Coming soon!</p>
    </div>
  )
}
