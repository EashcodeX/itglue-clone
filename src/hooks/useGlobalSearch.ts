'use client'

import { useState, useEffect, useCallback } from 'react'

export function useGlobalSearch() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  const openSearch = useCallback(() => {
    setIsSearchOpen(true)
  }, [])

  const closeSearch = useCallback(() => {
    setIsSearchOpen(false)
  }, [])

  const toggleSearch = useCallback(() => {
    setIsSearchOpen(prev => !prev)
  }, [])

  // Global keyboard listener for "Q" key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger if user is typing in an input field
      const target = event.target as HTMLElement
      const isInputField = target.tagName === 'INPUT' || 
                          target.tagName === 'TEXTAREA' || 
                          target.contentEditable === 'true' ||
                          target.closest('[contenteditable="true"]')

      // Don't trigger if search is already open
      if (isInputField || isSearchOpen) {
        return
      }

      // Check for "Q" key (case insensitive)
      if (event.key.toLowerCase() === 'q' && !event.ctrlKey && !event.metaKey && !event.altKey) {
        event.preventDefault()
        openSearch()
      }

      // Also support Ctrl+K or Cmd+K as alternative shortcuts
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        openSearch()
      }
    }

    // Add event listener to document
    document.addEventListener('keydown', handleKeyDown)

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isSearchOpen, openSearch])

  // Close search on escape key (handled in GlobalSearch component)
  // This is just for external control if needed
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isSearchOpen) {
        closeSearch()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isSearchOpen, closeSearch])

  return {
    isSearchOpen,
    openSearch,
    closeSearch,
    toggleSearch
  }
}
