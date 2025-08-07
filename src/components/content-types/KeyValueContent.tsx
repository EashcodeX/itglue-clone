'use client'

interface KeyValueContentProps {
  data: any
  isEditing: boolean
  onChange: (data: any) => void
}

export default function KeyValueContent({ data, isEditing, onChange }: KeyValueContentProps) {
  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Key-Value Pairs</h2>
      <p className="text-gray-500">Key-value content type - Coming soon!</p>
    </div>
  )
}
