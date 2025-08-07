'use client'

import { useGlobalSearch } from '@/hooks/useGlobalSearch'
import GlobalSearch from './GlobalSearch'

interface GlobalSearchProviderProps {
  children: React.ReactNode
}

export default function GlobalSearchProvider({ children }: GlobalSearchProviderProps) {
  const { isSearchOpen, closeSearch } = useGlobalSearch()

  return (
    <>
      {children}
      <GlobalSearch isOpen={isSearchOpen} onClose={closeSearch} />
    </>
  )
}
