'use client'

import { useEffect, useState } from 'react'
import { initializePWA } from '@/lib/pwa'
import { useNotifications } from '@/contexts/NotificationContext'

interface PWAProviderProps {
  children: React.ReactNode
}

export default function PWAProvider({ children }: PWAProviderProps) {
  const { success, info, warning } = useNotifications()
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    const initPWA = async () => {
      try {
        await initializePWA({
          onSuccess: (registration) => {
            console.log('PWA registered successfully')
            setIsInitialized(true)
          },
          onUpdate: (registration) => {
            info('A new version is available!', {
              persistent: true,
              action: {
                label: 'Update',
                onClick: () => {
                  if (registration.waiting) {
                    registration.waiting.postMessage({ type: 'SKIP_WAITING' })
                    window.location.reload()
                  }
                }
              }
            })
          },
          onOffline: () => {
            warning('You are now offline. Some features may be limited.')
          },
          onOnline: () => {
            success('You are back online!')
          }
        })
      } catch (error) {
        console.error('PWA initialization failed:', error)
      }
    }

    // Only initialize in browser environment
    if (typeof window !== 'undefined') {
      initPWA()
    }
  }, [success, info, warning])

  return <>{children}</>
}
