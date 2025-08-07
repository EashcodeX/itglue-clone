-- Migration Script: Rename F12 tables to TIS tables
-- This script renames the existing F12 tables to TIS tables while preserving all data

-- Step 1: Rename f12_standards_exceptions to tis_standards_exceptions
-- Check if the old table exists and new table doesn't exist
DO $$
BEGIN
    -- Check if f12_standards_exceptions exists and tis_standards_exceptions doesn't
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'f12_standards_exceptions')
       AND NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'tis_standards_exceptions') THEN
        
        -- Rename the table
        ALTER TABLE f12_standards_exceptions RENAME TO tis_standards_exceptions;
        
        -- Update any indexes that might reference the old table name
        -- (PostgreSQL automatically renames indexes, but we'll be explicit)
        
        RAISE NOTICE 'Successfully renamed f12_standards_exceptions to tis_standards_exceptions';
    ELSE
        RAISE NOTICE 'Table f12_standards_exceptions does not exist or tis_standards_exceptions already exists';
    END IF;
END $$;

-- Step 2: Rename f12_contract_exceptions to tis_contract_exceptions
DO $$
BEGIN
    -- Check if f12_contract_exceptions exists and tis_contract_exceptions doesn't
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'f12_contract_exceptions')
       AND NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'tis_contract_exceptions') THEN
        
        -- Rename the table
        ALTER TABLE f12_contract_exceptions RENAME TO tis_contract_exceptions;
        
        RAISE NOTICE 'Successfully renamed f12_contract_exceptions to tis_contract_exceptions';
    ELSE
        RAISE NOTICE 'Table f12_contract_exceptions does not exist or tis_contract_exceptions already exists';
    END IF;
END $$;

-- Step 3: Create the tables if they don't exist at all (for new installations)
-- Create tis_standards_exceptions table if it doesn't exist
CREATE TABLE IF NOT EXISTS tis_standards_exceptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    exception_title VARCHAR(255) NOT NULL,
    standard_reference VARCHAR(255) NOT NULL,
    exception_type VARCHAR(50) CHECK (exception_type IN ('temporary', 'permanent', 'conditional')) NOT NULL,
    severity VARCHAR(50) CHECK (severity IN ('low', 'medium', 'high', 'critical')) NOT NULL,
    description TEXT NOT NULL,
    justification TEXT NOT NULL,
    risk_assessment TEXT NOT NULL,
    mitigation_plan TEXT,
    approved_by VARCHAR(255),
    approval_date TIMESTAMP WITH TIME ZONE,
    expiry_date TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) CHECK (status IN ('pending', 'approved', 'rejected', 'expired')) DEFAULT 'pending',
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tis_contract_exceptions table if it doesn't exist
CREATE TABLE IF NOT EXISTS tis_contract_exceptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    contract_reference VARCHAR(255) NOT NULL,
    exception_title VARCHAR(255) NOT NULL,
    contract_section VARCHAR(255) NOT NULL,
    exception_type VARCHAR(50) CHECK (exception_type IN ('pricing', 'terms', 'scope', 'timeline', 'other')) NOT NULL,
    description TEXT NOT NULL,
    business_justification TEXT NOT NULL,
    financial_impact DECIMAL(12,2),
    risk_level VARCHAR(50) CHECK (risk_level IN ('low', 'medium', 'high', 'critical')) NOT NULL,
    approved_by VARCHAR(255),
    approval_date TIMESTAMP WITH TIME ZONE,
    effective_date TIMESTAMP WITH TIME ZONE,
    expiry_date TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) CHECK (status IN ('pending', 'approved', 'rejected', 'expired')) DEFAULT 'pending',
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 4: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tis_standards_exceptions_org_id ON tis_standards_exceptions(organization_id);
CREATE INDEX IF NOT EXISTS idx_tis_standards_exceptions_status ON tis_standards_exceptions(status);
CREATE INDEX IF NOT EXISTS idx_tis_standards_exceptions_severity ON tis_standards_exceptions(severity);
CREATE INDEX IF NOT EXISTS idx_tis_standards_exceptions_created_at ON tis_standards_exceptions(created_at);

CREATE INDEX IF NOT EXISTS idx_tis_contract_exceptions_org_id ON tis_contract_exceptions(organization_id);
CREATE INDEX IF NOT EXISTS idx_tis_contract_exceptions_status ON tis_contract_exceptions(status);
CREATE INDEX IF NOT EXISTS idx_tis_contract_exceptions_risk_level ON tis_contract_exceptions(risk_level);
CREATE INDEX IF NOT EXISTS idx_tis_contract_exceptions_created_at ON tis_contract_exceptions(created_at);

-- Step 5: Create updated_at triggers for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic updated_at timestamp
DROP TRIGGER IF EXISTS update_tis_standards_exceptions_updated_at ON tis_standards_exceptions;
CREATE TRIGGER update_tis_standards_exceptions_updated_at
    BEFORE UPDATE ON tis_standards_exceptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tis_contract_exceptions_updated_at ON tis_contract_exceptions;
CREATE TRIGGER update_tis_contract_exceptions_updated_at
    BEFORE UPDATE ON tis_contract_exceptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Step 6: Grant appropriate permissions (adjust as needed for your setup)
-- GRANT ALL PRIVILEGES ON tis_standards_exceptions TO your_app_user;
-- GRANT ALL PRIVILEGES ON tis_contract_exceptions TO your_app_user;

-- Migration completed
SELECT 'TIS tables migration completed successfully' AS result;
