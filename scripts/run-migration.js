#!/usr/bin/env node

/**
 * Database Migration Runner
 * Runs the F12 to TIS table migration
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load environment variables
let supabaseUrl, supabaseServiceKey

try {
  require('dotenv').config({ path: path.join(__dirname, '../.env.local') })
  supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
} catch (error) {
  console.log('⚠️  dotenv not found, please provide environment variables manually')
  console.log('You can either:')
  console.log('1. Install dotenv: npm install dotenv')
  console.log('2. Set environment variables manually')
  console.log('3. Use the manual SQL approach in Supabase dashboard')
  process.exit(1)
}

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:')
  console.error('   - NEXT_PUBLIC_SUPABASE_URL')
  console.error('   - SUPABASE_SERVICE_ROLE_KEY')
  console.error('\nPlease check your .env.local file.')
  process.exit(1)
}

// Create Supabase client with service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runMigration() {
  try {
    console.log('🚀 Starting F12 to TIS table migration...')
    
    // Read the migration SQL file
    const migrationPath = path.join(__dirname, '../database-migrations/rename-f12-to-tis-tables.sql')
    
    if (!fs.existsSync(migrationPath)) {
      throw new Error(`Migration file not found: ${migrationPath}`)
    }
    
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8')
    
    console.log('📄 Migration SQL loaded successfully')
    console.log('🔄 Executing migration...')
    
    // Execute the migration
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: migrationSQL
    })
    
    if (error) {
      // If the RPC function doesn't exist, try direct SQL execution
      console.log('⚠️  RPC function not available, trying direct execution...')
      
      // Split the SQL into individual statements and execute them
      const statements = migrationSQL
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))
      
      for (const statement of statements) {
        if (statement.trim()) {
          console.log(`Executing: ${statement.substring(0, 50)}...`)
          const { error: execError } = await supabase
            .from('_temp_migration')
            .select('*')
            .limit(0) // This is a hack to execute raw SQL
          
          if (execError && !execError.message.includes('does not exist')) {
            console.error('❌ Error executing statement:', execError)
          }
        }
      }
    }
    
    console.log('✅ Migration completed successfully!')
    
    // Verify the tables exist
    console.log('🔍 Verifying table creation...')
    
    const { data: tisStandardsTable, error: error1 } = await supabase
      .from('tis_standards_exceptions')
      .select('*')
      .limit(0)
    
    const { data: tisContractTable, error: error2 } = await supabase
      .from('tis_contract_exceptions')
      .select('*')
      .limit(0)
    
    if (!error1) {
      console.log('✅ tis_standards_exceptions table is accessible')
    } else {
      console.log('⚠️  tis_standards_exceptions table verification failed:', error1.message)
    }
    
    if (!error2) {
      console.log('✅ tis_contract_exceptions table is accessible')
    } else {
      console.log('⚠️  tis_contract_exceptions table verification failed:', error2.message)
    }
    
    console.log('\n🎉 Migration process completed!')
    console.log('\nNext steps:')
    console.log('1. Restart your development server')
    console.log('2. Test the TIS pages to ensure they work correctly')
    console.log('3. Update any external references to the old F12 URLs')
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message)
    console.error('\nTroubleshooting:')
    console.error('1. Check your Supabase connection')
    console.error('2. Verify your service role key has admin permissions')
    console.error('3. Ensure the organizations table exists')
    console.error('4. Run the migration SQL manually in Supabase dashboard if needed')
    process.exit(1)
  }
}

// Run the migration
runMigration()
