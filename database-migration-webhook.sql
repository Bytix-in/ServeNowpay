-- Database Migration: Add webhook configuration fields to restaurants table
-- Run this in your Supabase SQL Editor

-- Add webhook configuration columns to restaurants table
ALTER TABLE restaurants 
ADD COLUMN IF NOT EXISTS webhook_configured BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS webhook_url TEXT;

-- Add index for webhook_configured for better query performance
CREATE INDEX IF NOT EXISTS idx_restaurants_webhook_configured ON restaurants(webhook_configured);

-- Update existing restaurants to have webhook_configured = false (default)
UPDATE restaurants 
SET webhook_configured = FALSE 
WHERE webhook_configured IS NULL;

-- Add comment to document the new fields
COMMENT ON COLUMN restaurants.webhook_configured IS 'Whether Cashfree webhook has been configured for this restaurant';
COMMENT ON COLUMN restaurants.webhook_url IS 'The webhook URL configured with Cashfree for payment notifications';

-- Enable Supabase Realtime for orders table (for payment status updates)
-- Check if orders table is already in the publication
DO $$
BEGIN
    -- Try to add the table to the publication
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE orders;
        RAISE NOTICE 'Added orders table to supabase_realtime publication';
    EXCEPTION WHEN duplicate_object THEN
        RAISE NOTICE 'Orders table is already in supabase_realtime publication - skipping';
    END;
END $$;

-- Verify the changes
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'restaurants' 
AND column_name IN ('webhook_configured', 'webhook_url');

-- Verify Realtime is enabled for orders table
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' 
AND tablename = 'orders';