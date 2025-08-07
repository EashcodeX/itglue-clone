'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { AlertTriangle, CheckCircle, Info, X } from 'lucide-react'

export type NotificationType = 'success' | 'error' | 'warning' | 'info'

export interface Notification {
  id: string
  type: NotificationType
  title?: string
  message: string
  duration?: number
  persistent?: boolean
  action?: {
    label: string
    onClick: () => void
  }
}

interface NotificationContextType {
  notifications: Notification[]
  addNotification: (notification: Omit<Notification, 'id'>) => string
  removeNotification: (id: string) => void
  clearAll: () => void
  success: (message: string, options?: Partial<Notification>) => string
  error: (message: string, options?: Partial<Notification>) => string
  warning: (message: string, options?: Partial<Notification>) => string
  info: (message: string, options?: Partial<Notification>) => string
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newNotification: Notification = {
      id,
      duration: 5000,
      ...notification
    }

    setNotifications(prev => [...prev, newNotification])

    // Auto-remove after duration (unless persistent)
    if (!newNotification.persistent && newNotification.duration) {
      setTimeout(() => {
        removeNotification(id)
      }, newNotification.duration)
    }

    return id
  }, [])

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id))
  }, [])

  const clearAll = useCallback(() => {
    setNotifications([])
  }, [])

  const success = useCallback((message: string, options?: Partial<Notification>) => {
    return addNotification({ type: 'success', message, ...options })
  }, [addNotification])

  const error = useCallback((message: string, options?: Partial<Notification>) => {
    return addNotification({ 
      type: 'error', 
      message, 
      duration: 8000, // Longer duration for errors
      ...options 
    })
  }, [addNotification])

  const warning = useCallback((message: string, options?: Partial<Notification>) => {
    return addNotification({ type: 'warning', message, ...options })
  }, [addNotification])

  const info = useCallback((message: string, options?: Partial<Notification>) => {
    return addNotification({ type: 'info', message, ...options })
  }, [addNotification])

  const value = {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
    success,
    error,
    warning,
    info
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}

function NotificationContainer() {
  const { notifications, removeNotification } = useNotifications()

  if (notifications.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onDismiss={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  )
}

function NotificationItem({ 
  notification, 
  onDismiss 
}: { 
  notification: Notification
  onDismiss: () => void 
}) {
  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-400" />
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-red-400" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-400" />
      case 'info':
        return <Info className="w-5 h-5 text-blue-400" />
    }
  }

  const getBackgroundColor = () => {
    switch (notification.type) {
      case 'success':
        return 'bg-green-900/90 border-green-600'
      case 'error':
        return 'bg-red-900/90 border-red-600'
      case 'warning':
        return 'bg-yellow-900/90 border-yellow-600'
      case 'info':
        return 'bg-blue-900/90 border-blue-600'
    }
  }

  const getTextColor = () => {
    switch (notification.type) {
      case 'success':
        return 'text-green-100'
      case 'error':
        return 'text-red-100'
      case 'warning':
        return 'text-yellow-100'
      case 'info':
        return 'text-blue-100'
    }
  }

  return (
    <div className={`${getBackgroundColor()} border rounded-lg p-4 shadow-lg animate-in slide-in-from-right duration-300`}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-0.5">
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          {notification.title && (
            <h4 className={`${getTextColor()} font-medium mb-1`}>
              {notification.title}
            </h4>
          )}
          <p className={`${getTextColor()} text-sm`}>
            {notification.message}
          </p>
          {notification.action && (
            <button
              onClick={notification.action.onClick}
              className={`mt-2 text-xs font-medium ${
                notification.type === 'success' ? 'text-green-300 hover:text-green-200' :
                notification.type === 'error' ? 'text-red-300 hover:text-red-200' :
                notification.type === 'warning' ? 'text-yellow-300 hover:text-yellow-200' :
                'text-blue-300 hover:text-blue-200'
              } transition-colors`}
            >
              {notification.action.label}
            </button>
          )}
        </div>
        <button
          onClick={onDismiss}
          className="flex-shrink-0 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

// Hook for handling async operations with notifications
export function useAsyncOperation() {
  const { success, error } = useNotifications()

  const execute = useCallback(async <T,>(
    operation: () => Promise<T>,
    options?: {
      successMessage?: string
      errorMessage?: string
      loadingMessage?: string
    }
  ): Promise<T | null> => {
    try {
      const result = await operation()
      
      if (options?.successMessage) {
        success(options.successMessage)
      }
      
      return result
    } catch (err) {
      const errorMessage = options?.errorMessage || 
        (err instanceof Error ? err.message : 'An unexpected error occurred')
      
      error(errorMessage, {
        persistent: true,
        action: {
          label: 'Retry',
          onClick: () => execute(operation, options)
        }
      })
      
      return null
    }
  }, [success, error])

  return { execute }
}

export default NotificationContext
