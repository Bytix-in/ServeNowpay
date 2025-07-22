-- Fix RLS policies for orders table to allow public order creation

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Restaurant owners can view their orders" ON orders;
DROP POLICY IF EXISTS "Restaurant owners can update their orders" ON orders;

-- Create new policies that allow public order creation
CREATE POLICY "Anyone can insert orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view orders" ON orders FOR SELECT USING (true);
CREATE POLICY "Anyone can update orders" ON orders FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete orders" ON orders FOR DELETE USING (true);

-- Also ensure menu_items and restaurants have proper policies
DROP POLICY IF EXISTS "Anyone can view restaurants" ON restaurants;
DROP POLICY IF EXISTS "Anyone can insert restaurants" ON restaurants;
DROP POLICY IF EXISTS "Anyone can update restaurants" ON restaurants;
DROP POLICY IF EXISTS "Anyone can delete restaurants" ON restaurants;

CREATE POLICY "Enable read access for all users" ON restaurants FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON restaurants FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON restaurants FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON restaurants FOR DELETE USING (true);

DROP POLICY IF EXISTS "Anyone can view menu items" ON menu_items;
DROP POLICY IF EXISTS "Anyone can insert menu items" ON menu_items;
DROP POLICY IF EXISTS "Anyone can update menu items" ON menu_items;
DROP POLICY IF EXISTS "Anyone can delete menu items" ON menu_items;

CREATE POLICY "Enable read access for all users" ON menu_items FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON menu_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON menu_items FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON menu_items FOR DELETE USING (true);