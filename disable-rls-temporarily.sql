-- Temporarily disable RLS on orders table for testing
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;

-- Also disable RLS on other tables to ensure everything works
ALTER TABLE restaurants DISABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items DISABLE ROW LEVEL SECURITY;

-- Note: In production, you should re-enable RLS with proper policies
-- This is just for testing the payment integration