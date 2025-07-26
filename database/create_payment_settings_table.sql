-- Create payment_settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS payment_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    cashfree_client_id VARCHAR(255),
    cashfree_client_secret_encrypted TEXT,
    cashfree_environment VARCHAR(50) DEFAULT 'sandbox',
    is_payment_enabled BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create unique index to ensure one payment setting per restaurant
CREATE UNIQUE INDEX IF NOT EXISTS idx_payment_settings_restaurant_id ON payment_settings(restaurant_id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_payment_settings_enabled ON payment_settings(is_payment_enabled);

-- Verify the table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'payment_settings' 
ORDER BY ordinal_position;