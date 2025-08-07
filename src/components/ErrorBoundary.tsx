'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home, Bug, Mail } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
    this.setState({
      error,
      errorInfo
    })

    // Log error to monitoring service
    this.logErrorToService(error, errorInfo)
  }

  logErrorToService = (error: Error, errorInfo: ErrorInfo) => {
    // In a real app, send to error monitoring service like Sentry
    const errorData = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    }

    console.log('Error logged:', errorData)
    // Example: Sentry.captureException(error, { contexts: { react: errorInfo } })
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  handleReload = () => {
    window.location.reload()
  }

  handleGoHome = () => {
    window.location.href = '/'
  }

  handleReportBug = () => {
    const subject = encodeURIComponent(`Bug Report: ${this.state.error?.message || 'Unknown Error'}`)
    const body = encodeURIComponent(`
Error Details:
- Message: ${this.state.error?.message || 'Unknown'}
- Stack: ${this.state.error?.stack || 'Not available'}
- URL: ${window.location.href}
- Timestamp: ${new Date().toISOString()}
- User Agent: ${navigator.userAgent}

Component Stack:
${this.state.errorInfo?.componentStack || 'Not available'}

Please describe what you were doing when this error occurred:
[Your description here]
    `)
    
    window.open(`mailto:support@itglue.com?subject=${subject}&body=${body}`)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-6">
          <div className="max-w-2xl w-full">
            <div className="bg-gray-800 rounded-lg p-8 text-center">
              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="w-8 h-8 text-white" />
              </div>
              
              <h1 className="text-2xl font-semibold mb-4">Something went wrong</h1>
              <p className="text-gray-400 mb-6">
                We're sorry, but something unexpected happened. Our team has been notified and is working on a fix.
              </p>

              {/* Error Details (Development Mode) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="bg-gray-900 rounded-lg p-4 mb-6 text-left">
                  <h3 className="text-lg font-medium mb-2 text-red-400">Error Details (Development)</h3>
                  <div className="text-sm text-gray-300 space-y-2">
                    <div>
                      <strong>Message:</strong> {this.state.error.message}
                    </div>
                    {this.state.error.stack && (
                      <div>
                        <strong>Stack:</strong>
                        <pre className="mt-1 text-xs bg-gray-800 p-2 rounded overflow-x-auto">
                          {this.state.error.stack}
                        </pre>
                      </div>
                    )}
                    {this.state.errorInfo?.componentStack && (
                      <div>
                        <strong>Component Stack:</strong>
                        <pre className="mt-1 text-xs bg-gray-800 p-2 rounded overflow-x-auto">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={this.handleRetry}
                  className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Try Again</span>
                </button>
                
                <button
                  onClick={this.handleReload}
                  className="flex items-center justify-center space-x-2 bg-gray-700 hover:bg-gray-600 px-6 py-3 rounded-lg transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Reload Page</span>
                </button>
                
                <button
                  onClick={this.handleGoHome}
                  className="flex items-center justify-center space-x-2 bg-gray-700 hover:bg-gray-600 px-6 py-3 rounded-lg transition-colors"
                >
                  <Home className="w-4 h-4" />
                  <span>Go Home</span>
                </button>
              </div>

              {/* Report Bug */}
              <div className="mt-6 pt-6 border-t border-gray-700">
                <p className="text-sm text-gray-400 mb-3">
                  If this problem persists, please let us know:
                </p>
                <button
                  onClick={this.handleReportBug}
                  className="flex items-center justify-center space-x-2 text-blue-400 hover:text-blue-300 mx-auto"
                >
                  <Bug className="w-4 h-4" />
                  <span>Report Bug</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Hook for functional components to handle errors
export const useErrorHandler = () => {
  const handleError = (error: Error, errorInfo?: any) => {
    console.error('Error handled:', error, errorInfo)
    
    // Log to monitoring service
    const errorData = {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      ...errorInfo
    }

    console.log('Error logged:', errorData)
    // Example: Sentry.captureException(error, { extra: errorInfo })
  }

  return { handleError }
}

// Error notification component
export const ErrorNotification = ({ 
  error, 
  onDismiss, 
  onRetry 
}: { 
  error: string
  onDismiss: () => void
  onRetry?: () => void 
}) => {
  return (
    <div className="fixed top-4 right-4 bg-red-900/90 border border-red-600 rounded-lg p-4 max-w-md z-50">
      <div className="flex items-start space-x-3">
        <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="text-red-200 font-medium mb-1">Error</h4>
          <p className="text-red-100 text-sm">{error}</p>
          <div className="flex items-center space-x-2 mt-3">
            {onRetry && (
              <button
                onClick={onRetry}
                className="text-xs bg-red-600 hover:bg-red-700 px-2 py-1 rounded transition-colors"
              >
                Retry
              </button>
            )}
            <button
              onClick={onDismiss}
              className="text-xs text-red-300 hover:text-red-200 transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Success notification component
export const SuccessNotification = ({ 
  message, 
  onDismiss 
}: { 
  message: string
  onDismiss: () => void 
}) => {
  return (
    <div className="fixed top-4 right-4 bg-green-900/90 border border-green-600 rounded-lg p-4 max-w-md z-50">
      <div className="flex items-start space-x-3">
        <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="flex-1">
          <p className="text-green-100 text-sm">{message}</p>
          <button
            onClick={onDismiss}
            className="text-xs text-green-300 hover:text-green-200 transition-colors mt-2"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  )
}
