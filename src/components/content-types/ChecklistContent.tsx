'use client'

interface ChecklistContentProps {
  data: any
  isEditing: boolean
  onChange: (data: any) => void
}

export default function ChecklistContent({ data, isEditing, onChange }: ChecklistContentProps) {
  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Checklist</h2>
      <p className="text-gray-500">Checklist content type - Coming soon!</p>
    </div>
  )
}
