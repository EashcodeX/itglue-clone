'use client'

import { useEffect, useState } from 'react'

interface PerformanceMetrics {
  fcp: number | null // First Contentful Paint
  lcp: number | null // Largest Contentful Paint
  fid: number | null // First Input Delay
  cls: number | null // Cumulative Layout Shift
  ttfb: number | null // Time to First Byte
}

interface PerformanceMonitorProps {
  onMetrics?: (metrics: PerformanceMetrics) => void
  enableLogging?: boolean
}

export default function PerformanceMonitor({ 
  onMetrics, 
  enableLogging = false 
}: PerformanceMonitorProps) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fcp: null,
    lcp: null,
    fid: null,
    cls: null,
    ttfb: null
  })

  useEffect(() => {
    if (typeof window === 'undefined') return

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        switch (entry.entryType) {
          case 'paint':
            if (entry.name === 'first-contentful-paint') {
              const fcp = entry.startTime
              setMetrics(prev => ({ ...prev, fcp }))
              if (enableLogging) console.log('FCP:', fcp)
            }
            break

          case 'largest-contentful-paint':
            const lcp = entry.startTime
            setMetrics(prev => ({ ...prev, lcp }))
            if (enableLogging) console.log('LCP:', lcp)
            break

          case 'first-input':
            const fid = (entry as any).processingStart - entry.startTime
            setMetrics(prev => ({ ...prev, fid }))
            if (enableLogging) console.log('FID:', fid)
            break

          case 'layout-shift':
            if (!(entry as any).hadRecentInput) {
              const cls = (entry as any).value
              setMetrics(prev => ({ ...prev, cls: (prev.cls || 0) + cls }))
              if (enableLogging) console.log('CLS:', cls)
            }
            break

          case 'navigation':
            const navEntry = entry as PerformanceNavigationTiming
            const ttfb = navEntry.responseStart - navEntry.requestStart
            setMetrics(prev => ({ ...prev, ttfb }))
            if (enableLogging) console.log('TTFB:', ttfb)
            break
        }
      }
    })

    // Observe different performance entry types
    try {
      observer.observe({ entryTypes: ['paint'] })
      observer.observe({ entryTypes: ['largest-contentful-paint'] })
      observer.observe({ entryTypes: ['first-input'] })
      observer.observe({ entryTypes: ['layout-shift'] })
      observer.observe({ entryTypes: ['navigation'] })
    } catch (error) {
      console.warn('Performance Observer not fully supported:', error)
    }

    return () => {
      observer.disconnect()
    }
  }, [enableLogging])

  useEffect(() => {
    if (onMetrics) {
      onMetrics(metrics)
    }
  }, [metrics, onMetrics])

  // Don't render anything in production
  if (process.env.NODE_ENV === 'production') {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-3 rounded-lg text-xs font-mono z-50 max-w-xs">
      <div className="font-semibold mb-2">Performance Metrics</div>
      <div className="space-y-1">
        <div className="flex justify-between">
          <span>FCP:</span>
          <span className={getScoreColor(metrics.fcp, 1800, 3000)}>
            {metrics.fcp ? `${Math.round(metrics.fcp)}ms` : '-'}
          </span>
        </div>
        <div className="flex justify-between">
          <span>LCP:</span>
          <span className={getScoreColor(metrics.lcp, 2500, 4000)}>
            {metrics.lcp ? `${Math.round(metrics.lcp)}ms` : '-'}
          </span>
        </div>
        <div className="flex justify-between">
          <span>FID:</span>
          <span className={getScoreColor(metrics.fid, 100, 300)}>
            {metrics.fid ? `${Math.round(metrics.fid)}ms` : '-'}
          </span>
        </div>
        <div className="flex justify-between">
          <span>CLS:</span>
          <span className={getScoreColor(metrics.cls, 0.1, 0.25, true)}>
            {metrics.cls ? metrics.cls.toFixed(3) : '-'}
          </span>
        </div>
        <div className="flex justify-between">
          <span>TTFB:</span>
          <span className={getScoreColor(metrics.ttfb, 800, 1800)}>
            {metrics.ttfb ? `${Math.round(metrics.ttfb)}ms` : '-'}
          </span>
        </div>
      </div>
    </div>
  )
}

function getScoreColor(
  value: number | null, 
  goodThreshold: number, 
  poorThreshold: number,
  isReverse = false
): string {
  if (value === null) return 'text-gray-400'
  
  if (isReverse) {
    if (value <= goodThreshold) return 'text-green-400'
    if (value <= poorThreshold) return 'text-yellow-400'
    return 'text-red-400'
  } else {
    if (value <= goodThreshold) return 'text-green-400'
    if (value <= poorThreshold) return 'text-yellow-400'
    return 'text-red-400'
  }
}

// Hook for performance metrics
export function usePerformanceMetrics() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fcp: null,
    lcp: null,
    fid: null,
    cls: null,
    ttfb: null
  })

  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const collectMetrics = () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      const paint = performance.getEntriesByType('paint')
      
      const newMetrics: PerformanceMetrics = {
        fcp: paint.find(entry => entry.name === 'first-contentful-paint')?.startTime || null,
        lcp: null,
        fid: null,
        cls: null,
        ttfb: navigation ? navigation.responseStart - navigation.requestStart : null
      }

      setMetrics(newMetrics)
      setIsLoading(false)
    }

    // Collect initial metrics
    if (document.readyState === 'complete') {
      collectMetrics()
    } else {
      window.addEventListener('load', collectMetrics)
    }

    return () => {
      window.removeEventListener('load', collectMetrics)
    }
  }, [])

  return { metrics, isLoading }
}

// Performance analytics helper
export class PerformanceAnalytics {
  private static instance: PerformanceAnalytics
  private metrics: PerformanceMetrics = {
    fcp: null,
    lcp: null,
    fid: null,
    cls: null,
    ttfb: null
  }

  static getInstance(): PerformanceAnalytics {
    if (!PerformanceAnalytics.instance) {
      PerformanceAnalytics.instance = new PerformanceAnalytics()
    }
    return PerformanceAnalytics.instance
  }

  updateMetrics(newMetrics: Partial<PerformanceMetrics>): void {
    this.metrics = { ...this.metrics, ...newMetrics }
  }

  getMetrics(): PerformanceMetrics {
    return { ...this.metrics }
  }

  getScore(): { score: number; rating: 'good' | 'needs-improvement' | 'poor' } {
    const { fcp, lcp, fid, cls } = this.metrics
    
    let score = 0
    let count = 0

    if (fcp !== null) {
      score += fcp <= 1800 ? 100 : fcp <= 3000 ? 50 : 0
      count++
    }

    if (lcp !== null) {
      score += lcp <= 2500 ? 100 : lcp <= 4000 ? 50 : 0
      count++
    }

    if (fid !== null) {
      score += fid <= 100 ? 100 : fid <= 300 ? 50 : 0
      count++
    }

    if (cls !== null) {
      score += cls <= 0.1 ? 100 : cls <= 0.25 ? 50 : 0
      count++
    }

    const averageScore = count > 0 ? score / count : 0
    
    return {
      score: averageScore,
      rating: averageScore >= 90 ? 'good' : averageScore >= 50 ? 'needs-improvement' : 'poor'
    }
  }

  // Send metrics to analytics service
  async sendToAnalytics(): Promise<void> {
    if (process.env.NODE_ENV !== 'production') return

    try {
      const metrics = this.getMetrics()
      const score = this.getScore()

      // Send to your analytics service
      await fetch('/api/analytics/performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metrics,
          score,
          timestamp: Date.now(),
          userAgent: navigator.userAgent,
          url: window.location.href
        })
      })
    } catch (error) {
      console.error('Failed to send performance metrics:', error)
    }
  }
}
