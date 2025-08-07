'use client'

import React, { useState } from 'react'
import { supabase } from '@/lib/supabase'
import {
  AlertTriangle,
  Trash2,
  X,
  Loader
} from 'lucide-react'

interface DeleteConfirmationProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  itemName?: string
  tableName?: string
  itemId?: string
  confirmText?: string
}

export default function DeleteConfirmation({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  itemName,
  tableName,
  itemId,
  confirmText = 'DELETE'
}: DeleteConfirmationProps) {
  const [confirmInput, setConfirmInput] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDelete = async () => {
    if (confirmInput !== confirmText) {
      setError(`Please type "${confirmText}" to confirm deletion`)
      return
    }

    try {
      setDeleting(true)
      setError(null)

      if (tableName && itemId) {
        const { error: deleteError } = await supabase
          .from(tableName)
          .delete()
          .eq('id', itemId)

        if (deleteError) throw deleteError
      }

      onConfirm()
      onClose()
    } catch (error) {
      console.error('Error deleting item:', error)
      setError('Failed to delete item. Please try again.')
    } finally {
      setDeleting(false)
    }
  }

  const handleClose = () => {
    setConfirmInput('')
    setError(null)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white">{title}</h3>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message */}
        <div className="mb-6">
          <p className="text-gray-300 mb-4">{message}</p>
          {itemName && (
            <div className="bg-gray-700 rounded p-3 mb-4">
              <p className="text-sm text-gray-400">Item to be deleted:</p>
              <p className="text-white font-medium">{itemName}</p>
            </div>
          )}
          <div className="bg-red-900/20 border border-red-500 rounded p-3 mb-4">
            <p className="text-red-400 text-sm">
              <strong>Warning:</strong> This action cannot be undone. The item will be permanently deleted.
            </p>
          </div>
        </div>

        {/* Confirmation Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Type <strong>{confirmText}</strong> to confirm deletion:
          </label>
          <input
            type="text"
            value={confirmInput}
            onChange={(e) => setConfirmInput(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
            placeholder={confirmText}
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/20 border border-red-500 rounded p-3 mb-4">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3">
          <button
            onClick={handleClose}
            disabled={deleting}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 text-white rounded text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting || confirmInput !== confirmText}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white rounded text-sm"
          >
            {deleting ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
