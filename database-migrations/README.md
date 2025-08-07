# Database Migration: F12 to TIS

This directory contains the database migration scripts to rename F12 tables to TIS tables after the global find-and-replace operation.

## Overview

The codebase has been updated to use "TIS" instead of "F12" throughout. This migration updates the database schema to match the code changes.

## What This Migration Does

1. **Renames existing tables** (if they exist):
   - `f12_standards_exceptions` → `tis_standards_exceptions`
   - `f12_contract_exceptions` → `tis_contract_exceptions`

2. **Creates new tables** (if they don't exist):
   - Creates `tis_standards_exceptions` with proper schema
   - Creates `tis_contract_exceptions` with proper schema

3. **Adds indexes** for better performance
4. **Sets up triggers** for automatic `updated_at` timestamp updates

## Running the Migration

### Option 1: Automated Script (Recommended)

```bash
# From the project root directory
node scripts/run-migration.js
```

This script will:
- Check your environment variables
- Connect to Supabase
- Execute the migration SQL
- Verify the tables were created successfully

### Option 2: Manual SQL Execution

If the automated script doesn't work, you can run the SQL manually:

1. Open your Supabase dashboard
2. Go to the SQL Editor
3. Copy and paste the contents of `rename-f12-to-tis-tables.sql`
4. Execute the SQL

## Prerequisites

- Node.js installed
- Supabase project set up
- Environment variables configured in `.env.local`:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`

## Verification

After running the migration, verify it worked by:

1. **Check the Supabase dashboard** - Tables tab should show the new TIS tables
2. **Test the application** - Visit the TIS pages and ensure they load without errors
3. **Check the browser console** - Should not show database errors

## Troubleshooting

### Error: "relation does not exist"

This means the migration hasn't been run yet or failed. Try:
1. Run the migration script again
2. Check your Supabase connection
3. Verify your service role key has admin permissions

### Error: "table already exists"

This is normal if you're re-running the migration. The script is designed to be idempotent.

### Permission Errors

Ensure your `SUPABASE_SERVICE_ROLE_KEY` has the necessary permissions to:
- Create tables
- Rename tables
- Create indexes
- Create triggers

## Schema Details

### TIS Standards Exceptions Table

```sql
CREATE TABLE tis_standards_exceptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    exception_title VARCHAR(255) NOT NULL,
    standard_reference VARCHAR(255) NOT NULL,
    exception_type VARCHAR(50) CHECK (exception_type IN ('temporary', 'permanent', 'conditional')),
    severity VARCHAR(50) CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    description TEXT NOT NULL,
    justification TEXT NOT NULL,
    risk_assessment TEXT NOT NULL,
    mitigation_plan TEXT,
    approved_by VARCHAR(255),
    approval_date TIMESTAMP WITH TIME ZONE,
    expiry_date TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) CHECK (status IN ('pending', 'approved', 'rejected', 'expired')),
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### TIS Contract Exceptions Table

```sql
CREATE TABLE tis_contract_exceptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    contract_reference VARCHAR(255) NOT NULL,
    exception_title VARCHAR(255) NOT NULL,
    contract_section VARCHAR(255) NOT NULL,
    exception_type VARCHAR(50) CHECK (exception_type IN ('pricing', 'terms', 'scope', 'timeline', 'other')),
    description TEXT NOT NULL,
    business_justification TEXT NOT NULL,
    financial_impact DECIMAL(12,2),
    risk_level VARCHAR(50) CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
    approved_by VARCHAR(255),
    approval_date TIMESTAMP WITH TIME ZONE,
    effective_date TIMESTAMP WITH TIME ZONE,
    expiry_date TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) CHECK (status IN ('pending', 'approved', 'rejected', 'expired')),
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Post-Migration Steps

1. **Restart your development server** to clear any cached references
2. **Test all TIS functionality** to ensure everything works correctly
3. **Update any external references** to the old F12 URLs
4. **Consider updating your backup/restore procedures** to reference the new table names

## Rollback (if needed)

If you need to rollback the changes:

```sql
-- Rename tables back (only if needed)
ALTER TABLE tis_standards_exceptions RENAME TO f12_standards_exceptions;
ALTER TABLE tis_contract_exceptions RENAME TO f12_contract_exceptions;
```

Note: You would also need to revert the code changes to use F12 instead of TIS.
