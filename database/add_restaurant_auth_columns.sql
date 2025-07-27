-- Add missing authentication columns to restaurants table
ALTER TABLE restaurants 
ADD COLUMN IF NOT EXISTS restaurant_username VARCHAR(255),
ADD COLUMN IF NOT EXISTS restaurant_password_hash TEXT;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_restaurants_username ON restaurants(restaurant_username);

-- Verify the table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'restaurants' 
ORDER BY ordinal_position;