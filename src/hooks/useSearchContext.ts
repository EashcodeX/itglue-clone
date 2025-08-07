'use client'

import { usePathname, useParams } from 'next/navigation'
import { useMemo, useState, useEffect } from 'react'

export interface SearchContext {
  scope: 'global' | 'organization'
  organizationId?: string
  organizationName?: string
  icon: 'globe' | 'building'
  placeholder: string
  title: string
  description: string
}

export function useSearchContext(): SearchContext {
  const pathname = usePathname()
  const params = useParams()

  return useMemo(() => {
    // Check if we're in an organization-specific context
    const organizationId = params?.id as string
    const isOrganizationContext = pathname?.includes('/organizations/') && organizationId

    if (isOrganizationContext) {
      // Organization-specific search context
      return {
        scope: 'organization',
        organizationId,
        organizationName: undefined, // Will be fetched dynamically
        icon: 'building',
        placeholder: 'Search within this organization - contacts, documents, configurations...',
        title: 'Organization Search',
        description: 'Search all content within this organization including navigation items, page content, contacts, documents, configurations, passwords, and more'
      }
    } else {
      // Global search context
      return {
        scope: 'global',
        organizationId: undefined,
        organizationName: undefined,
        icon: 'globe',
        placeholder: 'Search across all organizations and data globally...',
        title: 'Global Search',
        description: 'Search across all organizations, contacts, documents, configurations, and data in the entire system'
      }
    }
  }, [pathname, params])
}

// Hook to get organization name for context
export function useOrganizationName(organizationId?: string) {
  const [organizationName, setOrganizationName] = useState<string | undefined>(undefined)

  useEffect(() => {
    if (!organizationId) {
      setOrganizationName(undefined)
      return
    }

    const fetchOrganizationName = async () => {
      try {
        const response = await fetch(`/api/organizations/${organizationId}`)
        if (response.ok) {
          const data = await response.json()
          setOrganizationName(data.organization?.name)
        }
      } catch (error) {
        console.error('Failed to fetch organization name:', error)
      }
    }

    fetchOrganizationName()
  }, [organizationId])

  return organizationName
}
