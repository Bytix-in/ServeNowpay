import { NextResponse } from 'next/server'

export async function POST() {
  try {
    return NextResponse.json({
      message: 'Please run the following SQL script in your Supabase SQL editor to add restaurant authentication columns:',
      sql: `
-- First, let's check what columns exist in the restaurants table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'restaurants' 
AND column_name LIKE '%password%'
ORDER BY column_name;

-- If you see a column with misspelled name, run the appropriate rename command:
-- For 'resturant_password_hash' -> 'restaurant_password_hash':
-- ALTER TABLE restaurants RENAME COLUMN resturant_password_hash TO restaurant_password_hash;

-- For other possible misspellings, use one of these:
-- ALTER TABLE restaurants RENAME COLUMN restaurant_password_has TO restaurant_password_hash;
-- ALTER TABLE restaurants RENAME COLUMN restaurent_password_hash TO restaurant_password_hash;

-- Add restaurant_username column if it doesn't exist
ALTER TABLE restaurants 
ADD COLUMN IF NOT EXISTS restaurant_username VARCHAR(255);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_restaurants_username ON restaurants(restaurant_username);

-- Final verification - show all columns
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'restaurants' 
ORDER BY ordinal_position;
      `,
      instructions: [
        '1. Go to your Supabase dashboard',
        '2. Navigate to SQL Editor',
        '3. Create a new query',
        '4. Copy and paste the SQL script above',
        '5. Run the query',
        '6. Verify that the restaurant_username and restaurant_password_hash columns were added successfully'
      ]
    })

  } catch (error) {
    console.error('Migration info error:', error)
    return NextResponse.json({ error: 'Failed to get migration info' }, { status: 500 })
  }
}