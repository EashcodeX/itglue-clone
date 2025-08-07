'use client'

interface LocationInfoContentProps {
  data: any
  isEditing: boolean
  onChange: (data: any) => void
}

export default function LocationInfoContent({ data, isEditing, onChange }: LocationInfoContentProps) {
  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Location Information</h2>
      <p className="text-gray-500">Location content type - Coming soon!</p>
    </div>
  )
}
