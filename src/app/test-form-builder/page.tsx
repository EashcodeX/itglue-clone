'use client'

import { useState } from 'react'
import FormBuilder, { FormElement } from '@/components/FormBuilder'

export default function TestFormBuilder() {
  const [elements, setElements] = useState<FormElement[]>([])
  const [isEditing, setIsEditing] = useState(true)

  const handleElementsChange = (newElements: FormElement[]) => {
    setElements(newElements)
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="p-6 border-b border-gray-600">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Test Form Builder</h1>
            <p className="text-gray-400 mt-1">This is what the FormBuilder should look like</p>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`px-4 py-2 rounded ${
              isEditing 
                ? 'bg-green-600 hover:bg-green-700' 
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isEditing ? 'Stop Editing' : 'Start Editing'}
          </button>
        </div>
      </div>

      <div className="h-[calc(100vh-120px)]">
        <FormBuilder
          elements={elements}
          isEditing={isEditing}
          onChange={handleElementsChange}
        />
      </div>

      {/* Debug Info */}
      <div className="fixed bottom-4 right-4 bg-gray-800 p-4 rounded-lg border border-gray-600 max-w-sm">
        <h3 className="text-sm font-semibold mb-2">Debug Info</h3>
        <div className="text-xs text-gray-400 space-y-1">
          <div>Elements: {elements.length}</div>
          <div>Editing: {isEditing ? 'Yes' : 'No'}</div>
          <div className="mt-2">
            <div className="text-gray-300">Expected Features:</div>
            <ul className="list-disc list-inside text-xs space-y-1 mt-1">
              <li>Right panel with form elements</li>
              <li>Blue + buttons to add elements</li>
              <li>Drag & drop to reorder</li>
              <li>Element properties panel</li>
              <li>Preview/Edit toggle</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
