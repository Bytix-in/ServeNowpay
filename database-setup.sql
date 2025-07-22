-- Create restaurants table (owner_id can be NULL for demo restaurants)
CREATE TABLE IF NOT EXISTS restaurants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create menu_items table
CREATE TABLE IF NOT EXISTS menu_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  description TEXT,
  preparation_time INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  table_number VARCHAR(10) NOT NULL,
  items JSONB NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  payment_status VARCHAR(50) DEFAULT 'pending',
  payment_id VARCHAR(255),
  payment_gateway_order_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payment_settings table for restaurant payment configurations
CREATE TABLE IF NOT EXISTS payment_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE UNIQUE,
  cashfree_client_id VARCHAR(255),
  cashfree_client_secret_encrypted TEXT,
  cashfree_environment VARCHAR(20) DEFAULT 'sandbox',
  is_payment_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create transactions table for payment tracking
CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  payment_gateway VARCHAR(50) DEFAULT 'cashfree',
  gateway_transaction_id VARCHAR(255),
  gateway_order_id VARCHAR(255),
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'INR',
  status VARCHAR(50) DEFAULT 'pending',
  gateway_response JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert demo restaurants for testing
INSERT INTO restaurants (id, name, slug, owner_id) 
VALUES 
  ('demo-restaurant-id', 'Demo Restaurant', 'mycafe', NULL),
  ('550e8400-e29b-41d4-a716-446655440000', 'Demo Cafe', 'demo-restaurant', NULL)
ON CONFLICT (slug) DO NOTHING;

-- Insert demo menu items
INSERT INTO menu_items (id, restaurant_id, name, price, description, preparation_time)
VALUES 
  ('1', 'demo-restaurant-id', 'Butter Chicken', 299.00, 'Creamy tomato-based curry with tender chicken pieces', 20),
  ('2', 'demo-restaurant-id', 'Biryani', 249.00, 'Fragrant basmati rice with spiced meat and vegetables', 30),
  ('3', 'demo-restaurant-id', 'Naan Bread', 49.00, 'Fresh baked Indian flatbread', 5),
  ('4', '550e8400-e29b-41d4-a716-446655440000', 'Cappuccino', 120.00, 'Rich espresso with steamed milk foam', 5),
  ('5', '550e8400-e29b-41d4-a716-446655440000', 'Croissant', 80.00, 'Buttery, flaky pastry', 3)
ON CONFLICT (id) DO NOTHING;

-- Enable Row Level Security (RLS)
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view restaurants" ON restaurants;
DROP POLICY IF EXISTS "Anyone can insert restaurants" ON restaurants;
DROP POLICY IF EXISTS "Anyone can update restaurants" ON restaurants;
DROP POLICY IF EXISTS "Anyone can delete restaurants" ON restaurants;
DROP POLICY IF EXISTS "Anyone can view menu items" ON menu_items;
DROP POLICY IF EXISTS "Anyone can insert menu items" ON menu_items;
DROP POLICY IF EXISTS "Anyone can update menu items" ON menu_items;
DROP POLICY IF EXISTS "Anyone can delete menu items" ON menu_items;

-- Create policies for restaurants table
CREATE POLICY "Enable read access for all users" ON restaurants FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON restaurants FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON restaurants FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON restaurants FOR DELETE USING (true);

-- Create policies for menu_items table
CREATE POLICY "Enable read access for all users" ON menu_items FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON menu_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON menu_items FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON menu_items FOR DELETE USING (true);

-- Create policies for orders table
CREATE POLICY "Anyone can insert orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Restaurant owners can view their orders" ON orders FOR SELECT USING (
  restaurant_id IN (
    SELECT id FROM restaurants WHERE owner_id = auth.uid()
  )
);
CREATE POLICY "Restaurant owners can update their orders" ON orders FOR UPDATE USING (
  restaurant_id IN (
    SELECT id FROM restaurants WHERE owner_id = auth.uid()
  )
);