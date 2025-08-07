'use client'

import { useState, useEffect } from 'react'
import { 
  Plus, 
  Type, 
  AlignLeft, 
  Upload, 
  MapPin, 
  ChevronDown, 
  CheckSquare, 
  Circle, 
  Calendar, 
  Hash,
  GripVertical,
  Settings,
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react'

export interface FormElement {
  id: string
  type: 'text' | 'textarea' | 'file' | 'location' | 'select' | 'checkbox' | 'radio' | 'date' | 'number'
  label: string
  placeholder?: string
  required: boolean
  options?: string[] // For select, checkbox, radio
  validation?: {
    minLength?: number
    maxLength?: number
    min?: number
    max?: number
  }
}

interface FormBuilderProps {
  elements: FormElement[]
  isEditing: boolean
  onChange: (elements: FormElement[]) => void
}

const FORM_ELEMENT_TYPES = [
  {
    type: 'text',
    label: 'Text Field',
    icon: Type,
    description: 'Single line text input'
  },
  {
    type: 'textarea',
    label: 'Text Area',
    icon: AlignLeft,
    description: 'Multi-line text input'
  },
  {
    type: 'file',
    label: 'File Upload',
    icon: Upload,
    description: 'Document/file upload'
  },
  {
    type: 'location',
    label: 'Location',
    icon: MapPin,
    description: 'Address/location field'
  },
  {
    type: 'select',
    label: 'Dropdown',
    icon: ChevronDown,
    description: 'Select from options'
  },
  {
    type: 'checkbox',
    label: 'Checkboxes',
    icon: CheckSquare,
    description: 'Multiple choice (multiple answers)'
  },
  {
    type: 'radio',
    label: 'Radio Buttons',
    icon: Circle,
    description: 'Multiple choice (single answer)'
  },
  {
    type: 'date',
    label: 'Date',
    icon: Calendar,
    description: 'Date picker'
  },
  {
    type: 'number',
    label: 'Number',
    icon: Hash,
    description: 'Numeric input'
  }
] as const

export default function FormBuilder({ elements, isEditing, onChange }: FormBuilderProps) {
  const [selectedElement, setSelectedElement] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  const addElement = (type: FormElement['type']) => {
    const newElement: FormElement = {
      id: `element_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      label: `New ${type} field`,
      placeholder: type === 'textarea' ? 'Enter your response...' : 'Type here...',
      required: false,
      options: ['select', 'checkbox', 'radio'].includes(type) ? ['Option 1', 'Option 2'] : undefined
    }

    const updatedElements = [...elements, newElement]
    console.log('➕ Added form element:', newElement.type, 'Total elements:', updatedElements.length)
    onChange(updatedElements)
    setSelectedElement(newElement.id)
  }

  const updateElement = (id: string, updates: Partial<FormElement>) => {
    const updatedElements = elements.map(el => 
      el.id === id ? { ...el, ...updates } : el
    )
    onChange(updatedElements)
  }

  const removeElement = (id: string) => {
    const updatedElements = elements.filter(el => el.id !== id)
    onChange(updatedElements)
    if (selectedElement === id) {
      setSelectedElement(null)
    }
  }

  const moveElement = (fromIndex: number, toIndex: number) => {
    const newElements = [...elements]
    const [movedElement] = newElements.splice(fromIndex, 1)
    newElements.splice(toIndex, 0, movedElement)
    onChange(newElements)
  }

  const addOption = (elementId: string) => {
    const element = elements.find(el => el.id === elementId)
    if (element && element.options) {
      const newOptions = [...element.options, `Option ${element.options.length + 1}`]
      updateElement(elementId, { options: newOptions })
    }
  }

  const updateOption = (elementId: string, optionIndex: number, value: string) => {
    const element = elements.find(el => el.id === elementId)
    if (element && element.options) {
      const newOptions = [...element.options]
      newOptions[optionIndex] = value
      updateElement(elementId, { options: newOptions })
    }
  }

  const removeOption = (elementId: string, optionIndex: number) => {
    const element = elements.find(el => el.id === elementId)
    if (element && element.options && element.options.length > 1) {
      const newOptions = element.options.filter((_, index) => index !== optionIndex)
      updateElement(elementId, { options: newOptions })
    }
  }

  return (
    <div className="flex h-full">
      {/* Main Form Area */}
      <div className="flex-1 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Form Builder</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center space-x-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm text-white"
            >
              {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span>{showPreview ? 'Edit' : 'Preview'}</span>
            </button>
          </div>
        </div>

        {/* Form Elements */}
        <div className="space-y-4">
          {elements.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Type className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">Start Building Your Form</p>
              <p className="text-sm mb-4">Add elements from the panel on the right to get started</p>

              {/* Quick Start Suggestions */}
              <div className="bg-gray-800 rounded-lg p-6 max-w-md mx-auto">
                <h3 className="text-white font-medium mb-3">Quick Start:</h3>
                <div className="space-y-2 text-sm text-left">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs text-white">+</div>
                    <span>Click the <strong className="text-blue-400">+ buttons</strong> on the right to add form elements</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <GripVertical className="w-4 h-4 text-gray-500" />
                    <span>Drag elements to reorder them</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Settings className="w-4 h-4 text-gray-500" />
                    <span>Click elements to configure properties</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Eye className="w-4 h-4 text-gray-500" />
                    <span>Use Preview to test your form</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            elements.map((element, index) => (
              <FormElementEditor
                key={element.id}
                element={element}
                index={index}
                isSelected={selectedElement === element.id}
                isEditing={isEditing && !showPreview}
                showPreview={showPreview}
                onSelect={() => setSelectedElement(element.id)}
                onUpdate={(updates) => updateElement(element.id, updates)}
                onRemove={() => removeElement(element.id)}
                onMove={moveElement}
                onAddOption={() => addOption(element.id)}
                onUpdateOption={(optionIndex, value) => updateOption(element.id, optionIndex, value)}
                onRemoveOption={(optionIndex) => removeOption(element.id, optionIndex)}
              />
            ))
          )}
        </div>
      </div>

      {/* Right Panel - Form Elements */}
      {isEditing && !showPreview && (
        <div className="w-80 bg-gray-700 border-l border-gray-600 p-4">
          <div className="sticky top-0 bg-gray-700 pb-4">
            <h3 className="text-lg font-semibold text-white mb-2">Add Form Elements</h3>
            <p className="text-sm text-gray-300 mb-4">Click the + button to add elements to your form</p>

            {/* Quick Add - Most Common Elements */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-300 mb-2">Quick Add</h4>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => addElement('text')}
                  className="flex items-center space-x-2 p-2 bg-blue-600 hover:bg-blue-700 rounded text-sm text-white transition-colors"
                >
                  <Type className="w-4 h-4" />
                  <span>Text</span>
                </button>
                <button
                  onClick={() => addElement('textarea')}
                  className="flex items-center space-x-2 p-2 bg-blue-600 hover:bg-blue-700 rounded text-sm text-white transition-colors"
                >
                  <AlignLeft className="w-4 h-4" />
                  <span>Textarea</span>
                </button>
                <button
                  onClick={() => addElement('select')}
                  className="flex items-center space-x-2 p-2 bg-blue-600 hover:bg-blue-700 rounded text-sm text-white transition-colors"
                >
                  <ChevronDown className="w-4 h-4" />
                  <span>Dropdown</span>
                </button>
                <button
                  onClick={() => addElement('checkbox')}
                  className="flex items-center space-x-2 p-2 bg-blue-600 hover:bg-blue-700 rounded text-sm text-white transition-colors"
                >
                  <CheckSquare className="w-4 h-4" />
                  <span>Checkbox</span>
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-300 mb-3 border-t border-gray-600 pt-4">All Form Elements</h4>
            {FORM_ELEMENT_TYPES.map((elementType) => {
              const Icon = elementType.icon
              return (
                <div
                  key={elementType.type}
                  className="group flex items-center justify-between p-3 bg-gray-600 rounded-lg hover:bg-gray-500 transition-all duration-200 border border-transparent hover:border-blue-500/30"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center group-hover:bg-gray-600 transition-colors">
                      <Icon className="w-5 h-5 text-gray-300 group-hover:text-white" />
                    </div>
                    <div>
                      <div className="text-white font-medium">{elementType.label}</div>
                      <div className="text-xs text-gray-400">{elementType.description}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => addElement(elementType.type)}
                    className="w-10 h-10 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center justify-center text-white transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-blue-500/25"
                    title={`Add ${elementType.label}`}
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              )
            })}
          </div>

          {/* Element Properties Panel */}
          {selectedElement && (
            <ElementPropertiesPanel
              element={elements.find(el => el.id === selectedElement)!}
              onUpdate={(updates) => updateElement(selectedElement, updates)}
            />
          )}
        </div>
      )}
    </div>
  )
}

// Form Element Editor Component
interface FormElementEditorProps {
  element: FormElement
  index: number
  isSelected: boolean
  isEditing: boolean
  showPreview: boolean
  onSelect: () => void
  onUpdate: (updates: Partial<FormElement>) => void
  onRemove: () => void
  onMove: (fromIndex: number, toIndex: number) => void
  onAddOption: () => void
  onUpdateOption: (optionIndex: number, value: string) => void
  onRemoveOption: (optionIndex: number) => void
}

function FormElementEditor({
  element,
  index,
  isSelected,
  isEditing,
  showPreview,
  onSelect,
  onUpdate,
  onRemove,
  onMove,
  onAddOption,
  onUpdateOption,
  onRemoveOption
}: FormElementEditorProps) {
  const renderFormElement = () => {
    const baseInputClasses = "w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"

    switch (element.type) {
      case 'text':
        return (
          <input
            type="text"
            placeholder={element.placeholder}
            className={baseInputClasses}
            disabled={!showPreview}
          />
        )

      case 'textarea':
        return (
          <textarea
            placeholder={element.placeholder}
            rows={4}
            className={baseInputClasses}
            disabled={!showPreview}
          />
        )

      case 'file':
        return (
          <div className="border-2 border-dashed border-gray-500 rounded-lg p-6 text-center">
            <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-gray-400">Click to upload or drag and drop</p>
          </div>
        )

      case 'location':
        return (
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Street Address"
              className={baseInputClasses}
              disabled={!showPreview}
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="City"
                className={baseInputClasses}
                disabled={!showPreview}
              />
              <input
                type="text"
                placeholder="State/Province"
                className={baseInputClasses}
                disabled={!showPreview}
              />
            </div>
          </div>
        )

      case 'select':
        return (
          <select className={baseInputClasses} disabled={!showPreview}>
            <option value="">Choose an option</option>
            {element.options?.map((option, idx) => (
              <option key={idx} value={option}>{option}</option>
            ))}
          </select>
        )

      case 'checkbox':
        return (
          <div className="space-y-2">
            {element.options?.map((option, idx) => (
              <label key={idx} className="flex items-center space-x-2 text-white">
                <input
                  type="checkbox"
                  className="rounded border-gray-500 bg-gray-600 text-blue-600 focus:ring-blue-500"
                  disabled={!showPreview}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        )

      case 'radio':
        return (
          <div className="space-y-2">
            {element.options?.map((option, idx) => (
              <label key={idx} className="flex items-center space-x-2 text-white">
                <input
                  type="radio"
                  name={element.id}
                  className="border-gray-500 bg-gray-600 text-blue-600 focus:ring-blue-500"
                  disabled={!showPreview}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        )

      case 'date':
        return (
          <input
            type="date"
            className={baseInputClasses}
            disabled={!showPreview}
          />
        )

      case 'number':
        return (
          <input
            type="number"
            placeholder={element.placeholder}
            className={baseInputClasses}
            disabled={!showPreview}
          />
        )

      default:
        return null
    }
  }

  return (
    <div
      className={`group border rounded-lg p-4 transition-all cursor-pointer ${
        isSelected && isEditing
          ? 'border-blue-500 bg-gray-700 shadow-lg shadow-blue-500/20'
          : 'border-gray-600 bg-gray-800 hover:border-gray-500 hover:bg-gray-750'
      }`}
      onClick={onSelect}
    >
      {/* Element Header */}
      {isEditing && (
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 px-2 py-1 bg-gray-700 rounded group-hover:bg-gray-600 transition-colors">
              <GripVertical className="w-4 h-4 text-gray-400 cursor-move group-hover:text-gray-300" />
              <span className="text-sm text-gray-400 group-hover:text-gray-300">
                {FORM_ELEMENT_TYPES.find(t => t.type === element.type)?.label}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={(e) => {
                e.stopPropagation()
                onRemove()
              }}
              className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-all"
              title="Delete element"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Element Label */}
      <div className="mb-3">
        {isEditing && !showPreview ? (
          <input
            type="text"
            value={element.label}
            onChange={(e) => onUpdate({ label: e.target.value })}
            className="w-full bg-transparent text-white font-medium border-none outline-none focus:bg-gray-600 rounded px-2 py-1"
            placeholder="Question label"
          />
        ) : (
          <label className="block text-white font-medium mb-2">
            {element.label}
            {element.required && <span className="text-red-400 ml-1">*</span>}
          </label>
        )}
      </div>

      {/* Form Element */}
      {renderFormElement()}

      {/* Options Editor for select, checkbox, radio */}
      {isEditing && !showPreview && ['select', 'checkbox', 'radio'].includes(element.type) && (
        <div className="mt-4 space-y-2">
          <div className="text-sm text-gray-400 mb-2">Options:</div>
          {element.options?.map((option, idx) => (
            <div key={idx} className="flex items-center space-x-2">
              <input
                type="text"
                value={option}
                onChange={(e) => onUpdateOption(idx, e.target.value)}
                className="flex-1 px-2 py-1 bg-gray-600 border border-gray-500 rounded text-white text-sm"
              />
              {element.options!.length > 1 && (
                <button
                  onClick={() => onRemoveOption(idx)}
                  className="p-1 text-gray-400 hover:text-red-400"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
          <button
            onClick={onAddOption}
            className="text-sm text-blue-400 hover:text-blue-300"
          >
            + Add option
          </button>
        </div>
      )}
    </div>
  )
}

// Element Properties Panel Component
interface ElementPropertiesPanelProps {
  element: FormElement
  onUpdate: (updates: Partial<FormElement>) => void
}

function ElementPropertiesPanel({ element, onUpdate }: ElementPropertiesPanelProps) {
  return (
    <div className="mt-6 pt-6 border-t border-gray-600">
      <h4 className="text-white font-medium mb-4">Element Properties</h4>

      <div className="space-y-4">
        {/* Label */}
        <div>
          <label className="block text-sm text-gray-300 mb-1">Label</label>
          <input
            type="text"
            value={element.label}
            onChange={(e) => onUpdate({ label: e.target.value })}
            className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white text-sm"
          />
        </div>

        {/* Placeholder */}
        {['text', 'textarea', 'number'].includes(element.type) && (
          <div>
            <label className="block text-sm text-gray-300 mb-1">Placeholder</label>
            <input
              type="text"
              value={element.placeholder || ''}
              onChange={(e) => onUpdate({ placeholder: e.target.value })}
              className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white text-sm"
            />
          </div>
        )}

        {/* Required */}
        <div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={element.required}
              onChange={(e) => onUpdate({ required: e.target.checked })}
              className="rounded border-gray-500 bg-gray-600 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-300">Required field</span>
          </label>
        </div>

        {/* Validation for text fields */}
        {['text', 'textarea'].includes(element.type) && (
          <div className="space-y-2">
            <label className="block text-sm text-gray-300">Text Length</label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <input
                  type="number"
                  placeholder="Min"
                  value={element.validation?.minLength || ''}
                  onChange={(e) => onUpdate({
                    validation: {
                      ...element.validation,
                      minLength: e.target.value ? parseInt(e.target.value) : undefined
                    }
                  })}
                  className="w-full px-2 py-1 bg-gray-600 border border-gray-500 rounded text-white text-sm"
                />
              </div>
              <div>
                <input
                  type="number"
                  placeholder="Max"
                  value={element.validation?.maxLength || ''}
                  onChange={(e) => onUpdate({
                    validation: {
                      ...element.validation,
                      maxLength: e.target.value ? parseInt(e.target.value) : undefined
                    }
                  })}
                  className="w-full px-2 py-1 bg-gray-600 border border-gray-500 rounded text-white text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* Validation for number fields */}
        {element.type === 'number' && (
          <div className="space-y-2">
            <label className="block text-sm text-gray-300">Number Range</label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <input
                  type="number"
                  placeholder="Min"
                  value={element.validation?.min || ''}
                  onChange={(e) => onUpdate({
                    validation: {
                      ...element.validation,
                      min: e.target.value ? parseInt(e.target.value) : undefined
                    }
                  })}
                  className="w-full px-2 py-1 bg-gray-600 border border-gray-500 rounded text-white text-sm"
                />
              </div>
              <div>
                <input
                  type="number"
                  placeholder="Max"
                  value={element.validation?.max || ''}
                  onChange={(e) => onUpdate({
                    validation: {
                      ...element.validation,
                      max: e.target.value ? parseInt(e.target.value) : undefined
                    }
                  })}
                  className="w-full px-2 py-1 bg-gray-600 border border-gray-500 rounded text-white text-sm"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
