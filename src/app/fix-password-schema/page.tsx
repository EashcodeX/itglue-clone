'use client'

import { useState } from 'react'
import { Wrench, CheckCircle, AlertTriangle, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function FixPasswordSchemaPage() {
  const [fixing, setFixing] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleFix = async () => {
    setFixing(true)
    setResult(null)
    
    try {
      const response = await fetch('/api/fix-password-column', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      const data = await response.json()
      
      if (data.success) {
        setSuccess(true)
        setResult('✅ Password schema fixed successfully! You can now create passwords.')
      } else {
        setSuccess(false)
        setResult(`❌ Fix failed: ${data.error}`)
      }
    } catch (error: any) {
      setSuccess(false)
      setResult(`❌ Error: ${error.message}`)
    } finally {
      setFixing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center space-x-3 mb-6">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-700 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <Wrench className="w-8 h-8 text-blue-500" />
          <h1 className="text-3xl font-bold">Fix Password Schema</h1>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <div className="flex items-start space-x-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-yellow-500 mt-1" />
            <div>
              <h2 className="text-xl font-semibold mb-2">Schema Issue Detected</h2>
              <p className="text-gray-300 mb-4">
                The passwords table is missing the required 'password' column. This prevents creating new password entries.
              </p>
              <p className="text-gray-400 text-sm">
                This tool will add the missing column and other required fields to fix the issue.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">What this fix will do:</h3>
          <ul className="space-y-2 text-gray-300">
            <li className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Add missing 'password' column to passwords table</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Add 'category' column for password categorization</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Add 'resource_name' column for resource identification</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Add 'shared' and date columns for password management</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Test the fix by attempting a sample insert</span>
            </li>
          </ul>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <button
            onClick={handleFix}
            disabled={fixing}
            className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-6 py-3 rounded-lg font-medium mb-4"
          >
            <Wrench className="w-5 h-5" />
            <span>{fixing ? 'Fixing Schema...' : 'Fix Password Schema'}</span>
          </button>

          {result && (
            <div className={`p-4 rounded-lg ${
              success 
                ? 'bg-green-900/30 border border-green-500' 
                : 'bg-red-900/30 border border-red-500'
            }`}>
              <p className={`${success ? 'text-green-300' : 'text-red-300'}`}>
                {result}
              </p>
              {success && (
                <div className="mt-3 pt-3 border-t border-green-500/30">
                  <p className="text-green-400 text-sm">
                    You can now go back and try creating a password again. The schema issue should be resolved.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-6 text-center">
          <p className="text-gray-400 text-sm">
            If this fix doesn't resolve the issue, try the comprehensive database setup at{' '}
            <a href="/fix-missing-tables" className="text-blue-400 hover:text-blue-300">
              /fix-missing-tables
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
