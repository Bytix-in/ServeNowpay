-- Update Order Workflow: Add 'served' status and fix existing orders
-- Run this in your Supabase SQL Editor

-- 1. Add 'served' status to the order_status enum
ALTER TYPE order_status ADD VALUE 'served';

-- 2. Update existing orders that have payment_status = 'completed' but status = 'completed'
-- These should be 'pending' (newly placed orders waiting for restaurant acceptance)
UPDATE orders 
SET status = 'pending'
WHERE payment_status = 'completed' 
AND status = 'completed';

-- 3. Verify the changes
SELECT 
    status,
    payment_status,
    COUNT(*) as count
FROM orders 
GROUP BY status, payment_status
ORDER BY status, payment_status;

-- 4. Check a few sample orders
SELECT 
    unique_order_id,
    customer_name,
    status,
    payment_status,
    created_at
FROM orders 
ORDER BY created_at DESC 
LIMIT 10;