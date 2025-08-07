'use client'

import { useState } from 'react'
import { Database, Copy, CheckCircle, AlertTriangle, ExternalLink } from 'lucide-react'

export default function ManualDatabaseSetupPage() {
  const [copied, setCopied] = useState<string | null>(null)

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const sqlCommands = {
    dropTable: `DROP TABLE IF EXISTS passwords CASCADE;`,
    createTable: `CREATE TABLE passwords (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  username VARCHAR(255),
  password VARCHAR(255),
  url TEXT,
  notes TEXT,
  category VARCHAR(100),
  resource_name VARCHAR(255),
  shared BOOLEAN DEFAULT false,
  expires_at DATE,
  last_rotated DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);`,
    createIndexes: `CREATE INDEX idx_passwords_organization_id ON passwords(organization_id);
CREATE INDEX idx_passwords_category ON passwords(category);
CREATE INDEX idx_passwords_expires_at ON passwords(expires_at);`,
    addSampleData: `INSERT INTO passwords (organization_id, name, username, password, category, url, notes) VALUES
('00000000-0000-0000-0000-000000000001', 'Sample Admin Account', 'admin', 'sample123', 'System', 'https://example.com', 'Sample password entry for testing');`
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center space-x-3 mb-6">
          <Database className="w-8 h-8 text-blue-500" />
          <h1 className="text-3xl font-bold">Manual Database Setup</h1>
        </div>

        <div className="bg-yellow-900/30 border border-yellow-500 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-6 h-6 text-yellow-500 mt-1" />
            <div>
              <h2 className="text-yellow-400 font-semibold mb-2">Database Admin Access Required</h2>
              <p className="text-yellow-200 text-sm">
                The automatic schema fixes require database admin privileges that aren't available in the hosted Supabase environment.
                You'll need to run these SQL commands manually in your Supabase dashboard.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">How to Fix the Password Schema Issue</h2>
          
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold">1</div>
              <div>
                <p className="text-gray-300">
                  Go to your <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 inline-flex items-center">
                    Supabase Dashboard <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold">2</div>
              <div>
                <p className="text-gray-300">Navigate to your project → SQL Editor</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold">3</div>
              <div>
                <p className="text-gray-300">Run the SQL commands below in order</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Step 1: Drop existing table */}
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-red-400">Step 1: Drop Existing Table (Optional)</h3>
              <button
                onClick={() => copyToClipboard(sqlCommands.dropTable, 'drop')}
                className="flex items-center space-x-1 bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded text-sm"
              >
                {copied === 'drop' ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied === 'drop' ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
            <p className="text-gray-400 text-sm mb-3">Only run this if you want to start fresh (will delete all existing passwords)</p>
            <pre className="bg-gray-900 p-4 rounded text-sm overflow-x-auto">
              <code className="text-red-300">{sqlCommands.dropTable}</code>
            </pre>
          </div>

          {/* Step 2: Create new table */}
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-green-400">Step 2: Create Passwords Table</h3>
              <button
                onClick={() => copyToClipboard(sqlCommands.createTable, 'create')}
                className="flex items-center space-x-1 bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded text-sm"
              >
                {copied === 'create' ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied === 'create' ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
            <p className="text-gray-400 text-sm mb-3">Creates the passwords table with all required columns including the missing 'password' field</p>
            <pre className="bg-gray-900 p-4 rounded text-sm overflow-x-auto">
              <code className="text-green-300">{sqlCommands.createTable}</code>
            </pre>
          </div>

          {/* Step 3: Create indexes */}
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-blue-400">Step 3: Create Indexes</h3>
              <button
                onClick={() => copyToClipboard(sqlCommands.createIndexes, 'indexes')}
                className="flex items-center space-x-1 bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded text-sm"
              >
                {copied === 'indexes' ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied === 'indexes' ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
            <p className="text-gray-400 text-sm mb-3">Creates indexes for better query performance</p>
            <pre className="bg-gray-900 p-4 rounded text-sm overflow-x-auto">
              <code className="text-blue-300">{sqlCommands.createIndexes}</code>
            </pre>
          </div>

          {/* Step 4: Add sample data */}
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-purple-400">Step 4: Add Sample Data (Optional)</h3>
              <button
                onClick={() => copyToClipboard(sqlCommands.addSampleData, 'sample')}
                className="flex items-center space-x-1 bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded text-sm"
              >
                {copied === 'sample' ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied === 'sample' ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
            <p className="text-gray-400 text-sm mb-3">Adds a sample password entry to test the setup</p>
            <pre className="bg-gray-900 p-4 rounded text-sm overflow-x-auto">
              <code className="text-purple-300">{sqlCommands.addSampleData}</code>
            </pre>
          </div>
        </div>

        <div className="bg-green-900/30 border border-green-500 rounded-lg p-4 mt-6">
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-6 h-6 text-green-500 mt-1" />
            <div>
              <h3 className="text-green-400 font-semibold mb-2">After Running the SQL Commands</h3>
              <p className="text-green-200 text-sm">
                Once you've run these commands in your Supabase dashboard, return to the password creation form and try creating a password again. 
                The schema cache issue should be resolved.
              </p>
            </div>
          </div>
        </div>

        <div className="text-center mt-8">
          <p className="text-gray-400 text-sm">
            Need help? Check the{' '}
            <a href="https://supabase.com/docs/guides/database" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
              Supabase Database Documentation
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
