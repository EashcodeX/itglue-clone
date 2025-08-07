'use client'

import { useState, useEffect } from 'react'
import { Download, X, Smartphone, Monitor } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    // Check if app is already installed
    const checkInstalled = () => {
      const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches
      const isIOSStandalone = (window.navigator as any).standalone === true
      
      setIsStandalone(isStandaloneMode || isIOSStandalone)
      setIsInstalled(isStandaloneMode || isIOSStandalone)
    }

    // Check if iOS
    const checkIOS = () => {
      const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent)
      setIsIOS(isIOSDevice)
    }

    checkInstalled()
    checkIOS()

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      
      // Show prompt after a delay if not dismissed before
      setTimeout(() => {
        const dismissed = localStorage.getItem('pwa-install-dismissed')
        if (!dismissed && !isInstalled) {
          setShowPrompt(true)
        }
      }, 5000) // Show after 5 seconds
    }

    // Listen for app installed event
    const handleAppInstalled = () => {
      console.log('PWA was installed')
      setIsInstalled(true)
      setShowPrompt(false)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [isInstalled])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      
      console.log(`User response to the install prompt: ${outcome}`)
      
      if (outcome === 'accepted') {
        setIsInstalled(true)
      }
      
      setDeferredPrompt(null)
      setShowPrompt(false)
    } catch (error) {
      console.error('Error during PWA installation:', error)
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem('pwa-install-dismissed', 'true')
    
    // Show again after 7 days
    setTimeout(() => {
      localStorage.removeItem('pwa-install-dismissed')
    }, 7 * 24 * 60 * 60 * 1000)
  }

  // Don't show if already installed or in standalone mode
  if (isInstalled || isStandalone) {
    return null
  }

  // iOS install instructions
  if (isIOS && showPrompt) {
    return (
      <div className="fixed bottom-4 left-4 right-4 bg-blue-900/95 backdrop-blur-sm border border-blue-600 rounded-lg p-4 z-50 max-w-sm mx-auto">
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
            <Smartphone className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-white font-medium mb-1">Install ITGlue App</h3>
            <p className="text-blue-100 text-sm mb-3">
              Add to your home screen for quick access and offline support.
            </p>
            <div className="text-blue-100 text-xs space-y-1">
              <p>1. Tap the Share button <span className="inline-block w-4 h-4 bg-blue-600 rounded text-center">↗</span></p>
              <p>2. Select "Add to Home Screen"</p>
              <p>3. Tap "Add" to install</p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-blue-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    )
  }

  // Standard install prompt
  if (showPrompt && deferredPrompt) {
    return (
      <div className="fixed bottom-4 left-4 right-4 bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-lg p-4 z-50 max-w-sm mx-auto">
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
            <Download className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-white font-medium mb-1">Install ITGlue App</h3>
            <p className="text-gray-300 text-sm mb-3">
              Get quick access and work offline by installing our app.
            </p>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleInstallClick}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-sm transition-colors"
              >
                Install
              </button>
              <button
                onClick={handleDismiss}
                className="text-gray-400 hover:text-gray-300 px-3 py-1.5 text-sm transition-colors"
              >
                Not now
              </button>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    )
  }

  return null
}

// Hook for PWA installation status
export function usePWAInstall() {
  const [isInstalled, setIsInstalled] = useState(false)
  const [isInstallable, setIsInstallable] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    const checkInstallStatus = () => {
      const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches
      const isIOSStandalone = (window.navigator as any).standalone === true
      setIsInstalled(isStandaloneMode || isIOSStandalone)
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setIsInstallable(true)
    }

    const handleAppInstalled = () => {
      setIsInstalled(true)
      setIsInstallable(false)
      setDeferredPrompt(null)
    }

    checkInstallStatus()

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const install = async () => {
    if (!deferredPrompt) return false

    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      
      if (outcome === 'accepted') {
        setIsInstalled(true)
        setIsInstallable(false)
        setDeferredPrompt(null)
        return true
      }
      
      return false
    } catch (error) {
      console.error('PWA installation failed:', error)
      return false
    }
  }

  return {
    isInstalled,
    isInstallable,
    install
  }
}
