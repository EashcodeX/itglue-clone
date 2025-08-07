'use client'

import { useState } from 'react'
import {
  CheckSquare,
  Square,
  Edit,
  Trash2,
  Archive,
  Download,
  Upload,
  Copy,
  Tag,
  Users,
  X,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'

interface BulkOperationsProps {
  selectedItems: string[]
  totalItems: number
  onSelectAll: () => void
  onDeselectAll: () => void
  onBulkEdit: (action: string, data?: any) => void
  itemType: string
}

interface BulkAction {
  id: string
  label: string
  icon: React.ReactNode
  color: string
  requiresConfirmation?: boolean
  requiresInput?: boolean
}

export default function BulkOperations({
  selectedItems,
  totalItems,
  onSelectAll,
  onDeselectAll,
  onBulkEdit,
  itemType
}: BulkOperationsProps) {
  const [showConfirmation, setShowConfirmation] = useState<string | null>(null)
  const [showInput, setShowInput] = useState<string | null>(null)
  const [inputValue, setInputValue] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  const bulkActions: BulkAction[] = [
    {
      id: 'edit',
      label: 'Bulk Edit',
      icon: <Edit className="w-4 h-4" />,
      color: 'bg-blue-600 hover:bg-blue-700',
      requiresInput: true
    },
    {
      id: 'delete',
      label: 'Delete',
      icon: <Trash2 className="w-4 h-4" />,
      color: 'bg-red-600 hover:bg-red-700',
      requiresConfirmation: true
    },
    {
      id: 'archive',
      label: 'Archive',
      icon: <Archive className="w-4 h-4" />,
      color: 'bg-yellow-600 hover:bg-yellow-700',
      requiresConfirmation: true
    },
    {
      id: 'export',
      label: 'Export',
      icon: <Download className="w-4 h-4" />,
      color: 'bg-green-600 hover:bg-green-700'
    },
    {
      id: 'duplicate',
      label: 'Duplicate',
      icon: <Copy className="w-4 h-4" />,
      color: 'bg-purple-600 hover:bg-purple-700'
    },
    {
      id: 'tag',
      label: 'Add Tags',
      icon: <Tag className="w-4 h-4" />,
      color: 'bg-indigo-600 hover:bg-indigo-700',
      requiresInput: true
    },
    {
      id: 'assign',
      label: 'Assign Users',
      icon: <Users className="w-4 h-4" />,
      color: 'bg-teal-600 hover:bg-teal-700',
      requiresInput: true
    }
  ]

  const handleAction = async (action: BulkAction) => {
    if (action.requiresConfirmation) {
      setShowConfirmation(action.id)
      return
    }

    if (action.requiresInput) {
      setShowInput(action.id)
      return
    }

    await executeBulkAction(action.id)
  }

  const executeBulkAction = async (actionId: string, data?: any) => {
    setIsProcessing(true)
    try {
      await onBulkEdit(actionId, data)
      setShowConfirmation(null)
      setShowInput(null)
      setInputValue('')
    } catch (error) {
      console.error('Bulk operation failed:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleConfirm = () => {
    if (showConfirmation) {
      executeBulkAction(showConfirmation)
    }
  }

  const handleInputSubmit = () => {
    if (showInput && inputValue.trim()) {
      executeBulkAction(showInput, inputValue.trim())
    }
  }

  if (selectedItems.length === 0) {
    return null
  }

  return (
    <>
      {/* Bulk Operations Bar */}
      <div className="bg-blue-900/50 border border-blue-600/50 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <button
                onClick={selectedItems.length === totalItems ? onDeselectAll : onSelectAll}
                className="p-1 text-blue-400 hover:text-blue-300"
              >
                {selectedItems.length === totalItems ? (
                  <CheckSquare className="w-5 h-5" />
                ) : (
                  <Square className="w-5 h-5" />
                )}
              </button>
              <span className="text-blue-200">
                {selectedItems.length} of {totalItems} {itemType}(s) selected
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              {bulkActions.map((action) => (
                <button
                  key={action.id}
                  onClick={() => handleAction(action)}
                  disabled={isProcessing}
                  className={`flex items-center space-x-2 px-3 py-2 rounded text-sm text-white transition-colors disabled:opacity-50 ${action.color}`}
                >
                  {action.icon}
                  <span>{action.label}</span>
                </button>
              ))}
            </div>
          </div>
          
          <button
            onClick={onDeselectAll}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-yellow-400" />
              <h3 className="text-lg font-semibold text-white">Confirm Action</h3>
            </div>
            
            <p className="text-gray-300 mb-6">
              Are you sure you want to {showConfirmation} {selectedItems.length} {itemType}(s)? 
              This action cannot be undone.
            </p>
            
            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={() => setShowConfirmation(null)}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={isProcessing}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors disabled:opacity-50"
              >
                {isProcessing ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Input Modal */}
      {showInput && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <Edit className="w-6 h-6 text-blue-400" />
              <h3 className="text-lg font-semibold text-white">
                {bulkActions.find(a => a.id === showInput)?.label}
              </h3>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {showInput === 'tag' && 'Enter tags (comma-separated)'}
                {showInput === 'assign' && 'Enter user emails (comma-separated)'}
                {showInput === 'edit' && 'Enter new value'}
              </label>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={
                  showInput === 'tag' ? 'urgent, review, important' :
                  showInput === 'assign' ? 'user1@example.com, user2@example.com' :
                  'Enter value...'
                }
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && handleInputSubmit()}
              />
            </div>
            
            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={() => {
                  setShowInput(null)
                  setInputValue('')
                }}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleInputSubmit}
                disabled={isProcessing || !inputValue.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors disabled:opacity-50"
              >
                {isProcessing ? 'Processing...' : 'Apply'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
