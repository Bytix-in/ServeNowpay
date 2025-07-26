import { NextResponse } from 'next/server'

export async function POST() {
  try {
    return NextResponse.json({
      message: 'Please run the following SQL script in your Supabase SQL editor to rename manager columns to restaurant columns:',
      sql: `
-- Complete migration script to rename manager columns and add login tracking
-- Run this script in your Supabase SQL editor

-- Step 1: Add login tracking columns if they don't exist
ALTER TABLE restaurants 
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS is_logged_in BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS login_session_token VARCHAR(255);

-- Step 2: Rename manager columns to restaurant columns (only if they exist)
DO $$
BEGIN
    -- Check if manager_username column exists and rename it
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'restaurants' AND column_name = 'manager_username') THEN
        ALTER TABLE restaurants RENAME COLUMN manager_username TO restaurant_username;
    END IF;
    
    -- Check if manager_password_hash column exists and rename it
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'restaurants' AND column_name = 'manager_password_hash') THEN
        ALTER TABLE restaurants RENAME COLUMN manager_password_hash TO restaurant_password_hash;
    END IF;
END $$;

-- Step 3: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_restaurants_restaurant_username ON restaurants(restaurant_username);
CREATE INDEX IF NOT EXISTS idx_restaurants_login_status ON restaurants(is_logged_in, last_login_at);

-- Step 4: Drop old indexes if they exist
DROP INDEX IF EXISTS idx_restaurants_manager_username;

-- Migration completed successfully
      `,
      instructions: [
        '1. Go to your Supabase dashboard',
        '2. Navigate to SQL Editor',
        '3. Create a new query',
        '4. Copy and paste the SQL script above',
        '5. Run the query',
        '6. Verify that the columns have been renamed successfully'
      ],
      codeChanges: [
        'Updated restaurant authentication API to use restaurant_username and restaurant_password_hash',
        'Updated admin create restaurant credentials API',
        'Updated RestaurantDetails interface in RestaurantDetailsModal',
        'All code references have been updated to use the new column names'
      ]
    })

  } catch (error) {
    console.error('Migration info error:', error)
    return NextResponse.json({ error: 'Failed to get migration info' }, { status: 500 })
  }
}