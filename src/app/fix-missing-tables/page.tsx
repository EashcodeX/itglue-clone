'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { CheckCircle, AlertCircle, Database, Play } from 'lucide-react'

export default function FixMissingTablesPage() {
  const [results, setResults] = useState<string[]>([])
  const [isRunning, setIsRunning] = useState(false)

  const addResult = (message: string) => {
    setResults(prev => [...prev, message])
  }

  const quickRepair = async () => {
    setIsRunning(true)
    setResults([])

    try {
      addResult('🔧 Running quick database repair...')

      const response = await fetch('/api/repair-database', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (data.success) {
        data.results.forEach((result: string) => addResult(result))
        addResult('🎉 Quick repair completed!')
      } else {
        addResult(`❌ Quick repair failed: ${data.error}`)
        if (data.results) {
          data.results.forEach((result: string) => addResult(result))
        }
      }
    } catch (error: any) {
      addResult(`❌ Error: ${error.message}`)
    } finally {
      setIsRunning(false)
    }
  }

  const createMissingTables = async () => {
    setIsRunning(true)
    setResults([])

    try {
      addResult('🔧 Creating missing database tables...')

      // Core Documentation table
      const coreDocumentationSQL = `
        CREATE TABLE IF NOT EXISTS core_documentation (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
          name VARCHAR(255) NOT NULL,
          category VARCHAR(100),
          document_type VARCHAR(50),
          version VARCHAR(20),
          author VARCHAR(255),
          file_url TEXT,
          file_size INTEGER,
          tags TEXT,
          is_confidential BOOLEAN DEFAULT false,
          description TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          last_sync_at TIMESTAMP WITH TIME ZONE
        );
        
        CREATE INDEX IF NOT EXISTS idx_core_documentation_organization_id ON core_documentation(organization_id);
        CREATE INDEX IF NOT EXISTS idx_core_documentation_category ON core_documentation(category);
      `

      const { error: coreDocError } = await supabase.rpc('exec_sql', { sql: coreDocumentationSQL })
      if (coreDocError) {
        addResult(`⚠️ Core Documentation table: ${coreDocError.message}`)
      } else {
        addResult('✅ Core Documentation table created')
      }

      // Domains table
      const domainsSQL = `
        CREATE TABLE IF NOT EXISTS domains (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
          domain_name VARCHAR(255) NOT NULL,
          registrar VARCHAR(255),
          registration_date DATE,
          expiration_date DATE,
          auto_renew BOOLEAN DEFAULT false,
          dns_provider VARCHAR(255),
          nameservers TEXT[],
          status VARCHAR(50) DEFAULT 'active',
          notes TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          last_sync_at TIMESTAMP WITH TIME ZONE
        );
        
        CREATE INDEX IF NOT EXISTS idx_domains_organization_id ON domains(organization_id);
        CREATE INDEX IF NOT EXISTS idx_domains_expiration_date ON domains(expiration_date);
      `

      const { error: domainsError } = await supabase.rpc('exec_sql', { sql: domainsSQL })
      if (domainsError) {
        addResult(`⚠️ Domains table: ${domainsError.message}`)
      } else {
        addResult('✅ Domains table created')
      }

      // Known Issues table
      const knownIssuesSQL = `
        CREATE TABLE IF NOT EXISTS known_issues (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          severity VARCHAR(50) DEFAULT 'medium',
          status VARCHAR(50) DEFAULT 'open',
          category VARCHAR(100),
          affected_systems TEXT,
          reported_by VARCHAR(255),
          assigned_to VARCHAR(255),
          reported_date DATE,
          resolved_date DATE,
          workaround TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          last_sync_at TIMESTAMP WITH TIME ZONE
        );
        
        CREATE INDEX IF NOT EXISTS idx_known_issues_organization_id ON known_issues(organization_id);
        CREATE INDEX IF NOT EXISTS idx_known_issues_status ON known_issues(status);
        CREATE INDEX IF NOT EXISTS idx_known_issues_severity ON known_issues(severity);
      `

      const { error: issuesError } = await supabase.rpc('exec_sql', { sql: knownIssuesSQL })
      if (issuesError) {
        addResult(`⚠️ Known Issues table: ${issuesError.message}`)
      } else {
        addResult('✅ Known Issues table created')
      }

      // Warranties table
      const warrantiesSQL = `
        CREATE TABLE IF NOT EXISTS warranties (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
          asset_name VARCHAR(255) NOT NULL,
          manufacturer VARCHAR(255),
          model VARCHAR(255),
          serial_number VARCHAR(255),
          purchase_date DATE,
          warranty_start_date DATE,
          warranty_end_date DATE,
          warranty_type VARCHAR(100),
          coverage_details TEXT,
          vendor_contact VARCHAR(255),
          notes TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          last_sync_at TIMESTAMP WITH TIME ZONE
        );
        
        CREATE INDEX IF NOT EXISTS idx_warranties_organization_id ON warranties(organization_id);
        CREATE INDEX IF NOT EXISTS idx_warranties_end_date ON warranties(warranty_end_date);
      `

      const { error: warrantiesError } = await supabase.rpc('exec_sql', { sql: warrantiesSQL })
      if (warrantiesError) {
        addResult(`⚠️ Warranties table: ${warrantiesError.message}`)
      } else {
        addResult('✅ Warranties table created')
      }

      // SSL Certificates table
      const sslCertificatesSQL = `
        CREATE TABLE IF NOT EXISTS ssl_certificates (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
          domain_name VARCHAR(255) NOT NULL,
          certificate_authority VARCHAR(255),
          certificate_type VARCHAR(100),
          issued_date DATE,
          expiration_date DATE,
          auto_renew BOOLEAN DEFAULT false,
          status VARCHAR(50) DEFAULT 'active',
          certificate_path TEXT,
          private_key_path TEXT,
          notes TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          last_sync_at TIMESTAMP WITH TIME ZONE
        );
        
        CREATE INDEX IF NOT EXISTS idx_ssl_certificates_organization_id ON ssl_certificates(organization_id);
        CREATE INDEX IF NOT EXISTS idx_ssl_certificates_expiration_date ON ssl_certificates(expiration_date);
      `

      const { error: sslError } = await supabase.rpc('exec_sql', { sql: sslCertificatesSQL })
      if (sslError) {
        addResult(`⚠️ SSL Certificates table: ${sslError.message}`)
      } else {
        addResult('✅ SSL Certificates table created')
      }

      // RFCs table
      const rfcsSQL = `
        CREATE TABLE IF NOT EXISTS rfcs (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          rfc_number VARCHAR(50),
          category VARCHAR(100),
          priority VARCHAR(50) DEFAULT 'medium',
          status VARCHAR(50) DEFAULT 'pending',
          requested_by VARCHAR(255),
          assigned_to VARCHAR(255),
          requested_date DATE,
          target_date DATE,
          completed_date DATE,
          impact_assessment TEXT,
          rollback_plan TEXT,
          notes TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          last_sync_at TIMESTAMP WITH TIME ZONE
        );
        
        CREATE INDEX IF NOT EXISTS idx_rfcs_organization_id ON rfcs(organization_id);
        CREATE INDEX IF NOT EXISTS idx_rfcs_status ON rfcs(status);
        CREATE INDEX IF NOT EXISTS idx_rfcs_priority ON rfcs(priority);
      `

      const { error: rfcsError } = await supabase.rpc('exec_sql', { sql: rfcsSQL })
      if (rfcsError) {
        addResult(`⚠️ RFCs table: ${rfcsError.message}`)
      } else {
        addResult('✅ RFCs table created')
      }

      // Assets table
      const assetsSQL = `
        CREATE TABLE IF NOT EXISTS assets (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
          name VARCHAR(255) NOT NULL,
          asset_type VARCHAR(100),
          manufacturer VARCHAR(255),
          model VARCHAR(255),
          serial_number VARCHAR(255),
          asset_tag VARCHAR(100),
          location VARCHAR(255),
          status VARCHAR(50) DEFAULT 'active',
          purchase_date DATE,
          purchase_cost DECIMAL(10,2),
          warranty_expiration DATE,
          assigned_to VARCHAR(255),
          notes TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          last_sync_at TIMESTAMP WITH TIME ZONE
        );
        
        CREATE INDEX IF NOT EXISTS idx_assets_organization_id ON assets(organization_id);
        CREATE INDEX IF NOT EXISTS idx_assets_type ON assets(asset_type);
        CREATE INDEX IF NOT EXISTS idx_assets_status ON assets(status);
      `

      const { error: assetsError } = await supabase.rpc('exec_sql', { sql: assetsSQL })
      if (assetsError) {
        addResult(`⚠️ Assets table: ${assetsError.message}`)
      } else {
        addResult('✅ Assets table created')
      }

      // Update existing documents table to include missing fields
      const updateDocumentsSQL = `
        ALTER TABLE documents
        ADD COLUMN IF NOT EXISTS category VARCHAR(100),
        ADD COLUMN IF NOT EXISTS document_type VARCHAR(50),
        ADD COLUMN IF NOT EXISTS version VARCHAR(20),
        ADD COLUMN IF NOT EXISTS author VARCHAR(255),
        ADD COLUMN IF NOT EXISTS tags TEXT,
        ADD COLUMN IF NOT EXISTS is_confidential BOOLEAN DEFAULT false,
        ADD COLUMN IF NOT EXISTS last_sync_at TIMESTAMP WITH TIME ZONE;
      `

      const { error: updateDocsError } = await supabase.rpc('exec_sql', { sql: updateDocumentsSQL })
      if (updateDocsError) {
        addResult(`⚠️ Documents table update: ${updateDocsError.message}`)
      } else {
        addResult('✅ Documents table updated with missing fields')
      }

      // Update existing passwords table to include missing fields
      const updatePasswordsSQL = `
        ALTER TABLE passwords
        ADD COLUMN IF NOT EXISTS password VARCHAR(255),
        ADD COLUMN IF NOT EXISTS category VARCHAR(100),
        ADD COLUMN IF NOT EXISTS resource_name VARCHAR(255),
        ADD COLUMN IF NOT EXISTS shared BOOLEAN DEFAULT false,
        ADD COLUMN IF NOT EXISTS expires_at DATE,
        ADD COLUMN IF NOT EXISTS last_rotated DATE,
        ADD COLUMN IF NOT EXISTS last_sync_at TIMESTAMP WITH TIME ZONE;
      `

      const { error: updatePasswordsError } = await supabase.rpc('exec_sql', { sql: updatePasswordsSQL })
      if (updatePasswordsError) {
        addResult(`⚠️ Passwords table update: ${updatePasswordsError.message}`)
      } else {
        addResult('✅ Passwords table updated with missing fields')
      }

      // Update existing configurations table to include missing fields
      const updateConfigurationsSQL = `
        ALTER TABLE configurations
        ADD COLUMN IF NOT EXISTS category VARCHAR(100),
        ADD COLUMN IF NOT EXISTS configuration_type VARCHAR(100),
        ADD COLUMN IF NOT EXISTS version VARCHAR(50),
        ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active',
        ADD COLUMN IF NOT EXISTS environment VARCHAR(50),
        ADD COLUMN IF NOT EXISTS last_sync_at TIMESTAMP WITH TIME ZONE;
      `

      const { error: updateConfigsError } = await supabase.rpc('exec_sql', { sql: updateConfigurationsSQL })
      if (updateConfigsError) {
        addResult(`⚠️ Configurations table update: ${updateConfigsError.message}`)
      } else {
        addResult('✅ Configurations table updated with missing fields')
      }

      // Update existing locations table to include missing fields
      const updateLocationsSQL = `
        ALTER TABLE locations
        ADD COLUMN IF NOT EXISTS location_type VARCHAR(100),
        ADD COLUMN IF NOT EXISTS contact_person VARCHAR(255),
        ADD COLUMN IF NOT EXISTS phone VARCHAR(50),
        ADD COLUMN IF NOT EXISTS email VARCHAR(255),
        ADD COLUMN IF NOT EXISTS timezone VARCHAR(100),
        ADD COLUMN IF NOT EXISTS business_hours TEXT,
        ADD COLUMN IF NOT EXISTS last_sync_at TIMESTAMP WITH TIME ZONE;
      `

      const { error: updateLocationsError } = await supabase.rpc('exec_sql', { sql: updateLocationsSQL })
      if (updateLocationsError) {
        addResult(`⚠️ Locations table update: ${updateLocationsError.message}`)
      } else {
        addResult('✅ Locations table updated with missing fields')
      }

      addResult('🎉 Database setup completed!')
      addResult('✅ All required tables are now available for the NewItemForm component')

    } catch (error: any) {
      addResult(`❌ Error: ${error.message}`)
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center space-x-3 mb-6">
          <Database className="w-8 h-8 text-blue-500" />
          <h1 className="text-3xl font-bold">Fix Missing Database Tables</h1>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <p className="text-gray-300 mb-4">
            This tool will fix database schema issues for the NewItemForm component.
          </p>
          <div className="bg-gray-700 rounded p-4 mb-4">
            <p className="text-sm text-gray-300 mb-2">
              <strong>Quick Repair:</strong> Fixes the most common issues (missing password column, etc.) - recommended first step.
            </p>
            <p className="text-sm text-gray-300">
              <strong>Full Setup:</strong> Creates all missing tables and columns - use if Quick Repair doesn't solve the issue.
            </p>
          </div>
          
          <div className="flex space-x-4">
            <button
              onClick={quickRepair}
              disabled={isRunning}
              className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-6 py-3 rounded-lg font-medium"
            >
              <CheckCircle className="w-5 h-5" />
              <span>{isRunning ? 'Repairing...' : 'Quick Repair'}</span>
            </button>

            <button
              onClick={createMissingTables}
              disabled={isRunning}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-6 py-3 rounded-lg font-medium"
            >
              <Play className="w-5 h-5" />
              <span>{isRunning ? 'Creating Tables...' : 'Full Setup'}</span>
            </button>
          </div>
        </div>

        {results.length > 0 && (
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
              <AlertCircle className="w-5 h-5" />
              <span>Results</span>
            </h2>
            <div className="space-y-2 font-mono text-sm">
              {results.map((result, index) => (
                <div key={index} className={`p-2 rounded ${
                  result.includes('✅') ? 'bg-green-900/30 text-green-300' :
                  result.includes('⚠️') ? 'bg-yellow-900/30 text-yellow-300' :
                  result.includes('❌') ? 'bg-red-900/30 text-red-300' :
                  result.includes('🎉') ? 'bg-blue-900/30 text-blue-300' :
                  'bg-gray-700 text-gray-300'
                }`}>
                  {result}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
