'use client'

import { useState, useEffect } from 'react'
import FormBuilder, { FormElement } from '../FormBuilder'

interface FormDataContentProps {
  data: {
    formTitle: string
    elements: FormElement[]
    submissions?: any[]
  }
  isEditing: boolean
  onChange: (data: any) => void
}

export default function FormDataContent({ data, isEditing, onChange }: FormDataContentProps) {
  const [formTitle, setFormTitle] = useState(data.formTitle || 'Custom Form')
  const [elements, setElements] = useState<FormElement[]>(data.elements || [])

  useEffect(() => {
    setFormTitle(data.formTitle || 'Custom Form')
    setElements(data.elements || [])
  }, [data])

  const handleTitleChange = (newTitle: string) => {
    setFormTitle(newTitle)
    const updatedData = { ...data, formTitle: newTitle }
    console.log('📝 Form title changed:', newTitle)
    onChange(updatedData)
  }

  const handleElementsChange = (newElements: FormElement[]) => {
    setElements(newElements)
    const updatedData = { ...data, elements: newElements }
    console.log('🔧 Form elements updated:', newElements.length, 'elements')
    console.log('📊 Form structure:', newElements.map(el => ({ type: el.type, label: el.label })))
    onChange(updatedData)
  }

  return (
    <div className="h-full">
      {/* Form Title */}
      <div className="p-6 border-b border-gray-600">
        {isEditing ? (
          <input
            type="text"
            value={formTitle}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="text-2xl font-bold bg-transparent text-white border-none outline-none focus:bg-gray-700 rounded px-2 py-1 w-full"
            placeholder="Form Title"
          />
        ) : (
          <h1 className="text-2xl font-bold text-white">{formTitle}</h1>
        )}
      </div>

      {/* Form Builder */}
      <div className="flex-1">
        <FormBuilder
          elements={elements}
          isEditing={isEditing}
          onChange={handleElementsChange}
        />
      </div>
    </div>
  )
}
