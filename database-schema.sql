-- ServeNow Database Schema for Supabase
-- This script creates all the required tables for the ServeNow restaurant management system

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types/enums
CREATE TYPE user_role AS ENUM ('admin', 'restaurant');
CREATE TYPE order_status AS ENUM ('pending', 'in_progress', 'completed', 'served', 'cancelled');
CREATE TYPE payment_status AS ENUM ('pending', 'verifying', 'completed', 'failed', 'not_configured');
CREATE TYPE order_priority AS ENUM ('low', 'medium', 'high');
CREATE TYPE order_type AS ENUM ('dine_in', 'takeout', 'delivery');
CREATE TYPE restaurant_status AS ENUM ('active', 'inactive');
CREATE TYPE cashfree_environment AS ENUM ('sandbox', 'production');
CREATE TYPE transaction_status AS ENUM ('pending', 'completed', 'failed', 'cancelled');
CREATE TYPE table_status AS ENUM ('available', 'occupied', 'reserved', 'cleaning');

-- 1. USERS TABLE
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for users table
CREATE INDEX idx_users_email ON users(email);

-- 2. RESTAURANTS TABLE
CREATE TABLE restaurants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
    owner_name VARCHAR(255),
    phone_number VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    cuisine_tags TEXT,
    seating_capacity INTEGER,
    status restaurant_status DEFAULT 'active',
    restaurant_username VARCHAR(255) UNIQUE,
    restaurant_password_hash VARCHAR(255),
    is_logged_in BOOLEAN DEFAULT FALSE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    login_session_token VARCHAR(255),
    webhook_configured BOOLEAN DEFAULT FALSE,
    webhook_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for restaurants table
CREATE INDEX idx_restaurants_slug ON restaurants(slug);
CREATE INDEX idx_restaurants_username ON restaurants(restaurant_username);
CREATE INDEX idx_restaurants_owner_id ON restaurants(owner_id);
CREATE INDEX idx_restaurants_status ON restaurants(status);

-- 3. MENU_ITEMS TABLE
CREATE TABLE menu_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL CHECK (price > 0),
    description TEXT NOT NULL,
    preparation_time INTEGER NOT NULL CHECK (preparation_time > 0), -- in minutes
    image_url TEXT,
    image_data TEXT, -- base64 encoded image data
    dish_type VARCHAR(100),
    ingredients TEXT,
    tags TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for menu_items table
CREATE INDEX idx_menu_items_restaurant_id ON menu_items(restaurant_id);
CREATE INDEX idx_menu_items_dish_type ON menu_items(dish_type);
CREATE INDEX idx_menu_items_name ON menu_items(name);

-- 4. ORDERS TABLE
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    table_number VARCHAR(50) NOT NULL,
    items JSONB NOT NULL, -- Array of order items with structure: [{id, name, quantity, price, total}]
    total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount > 0),
    status order_status DEFAULT 'pending',
    payment_status payment_status DEFAULT 'pending',
    payment_id VARCHAR(255),
    payment_gateway_order_id VARCHAR(255),
    unique_order_id VARCHAR(6) UNIQUE, -- 6-character unique order ID for customers
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for orders table
CREATE INDEX idx_orders_restaurant_id ON orders(restaurant_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_unique_order_id ON orders(unique_order_id);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_orders_customer_phone ON orders(customer_phone);

-- 5. PAYMENT_SETTINGS TABLE
CREATE TABLE payment_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL UNIQUE REFERENCES restaurants(id) ON DELETE CASCADE,
    cashfree_client_id VARCHAR(255),
    cashfree_client_secret_encrypted TEXT, -- Encrypted client secret
    cashfree_environment cashfree_environment DEFAULT 'sandbox',
    is_payment_enabled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for payment_settings table
CREATE INDEX idx_payment_settings_restaurant_id ON payment_settings(restaurant_id);

-- 6. TRANSACTIONS TABLE
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    payment_gateway VARCHAR(50) DEFAULT 'cashfree',
    gateway_transaction_id VARCHAR(255),
    gateway_order_id VARCHAR(255),
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    currency VARCHAR(3) DEFAULT 'INR',
    status transaction_status DEFAULT 'pending',
    gateway_response JSONB, -- Store complete gateway response
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for transactions table
CREATE INDEX idx_transactions_restaurant_id ON transactions(restaurant_id);
CREATE INDEX idx_transactions_order_id ON transactions(order_id);
CREATE INDEX idx_transactions_gateway_transaction_id ON transactions(gateway_transaction_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to all tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_restaurants_updated_at BEFORE UPDATE ON restaurants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON menu_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payment_settings_updated_at BEFORE UPDATE ON payment_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can view their own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own data" ON users FOR UPDATE USING (auth.uid() = id);

-- Create policies for restaurants table
CREATE POLICY "Restaurants are viewable by everyone" ON restaurants FOR SELECT USING (true);
CREATE POLICY "Restaurant owners can update their restaurants" ON restaurants FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Admins can manage all restaurants" ON restaurants FOR ALL USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND users.email IN ('admin@servenow.com')
    )
);

-- Create policies for menu_items table
CREATE POLICY "Menu items are viewable by everyone" ON menu_items FOR SELECT USING (true);
CREATE POLICY "Menu items can be managed by anyone" ON menu_items FOR ALL USING (true);

-- Create policies for orders table
CREATE POLICY "Orders are viewable by everyone" ON orders FOR SELECT USING (true);
CREATE POLICY "Orders can be managed by anyone" ON orders FOR ALL USING (true);

-- Create policies for payment_settings table
CREATE POLICY "Payment settings are viewable by everyone" ON payment_settings FOR SELECT USING (true);
CREATE POLICY "Payment settings can be managed by anyone" ON payment_settings FOR ALL USING (true);

-- Create policies for transactions table
CREATE POLICY "Transactions are viewable by everyone" ON transactions FOR SELECT USING (true);
CREATE POLICY "Transactions can be managed by anyone" ON transactions FOR ALL USING (true);

-- Insert sample admin user (optional - remove in production)
INSERT INTO users (id, email, name) VALUES 
    ('00000000-0000-0000-0000-000000000001', 'admin@servenow.com', 'System Administrator')
ON CONFLICT (email) DO NOTHING;

-- Create a function to generate unique order IDs
CREATE OR REPLACE FUNCTION generate_unique_order_id()
RETURNS TEXT AS $$
DECLARE
    chars TEXT := '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
    result TEXT := '';
    i INTEGER;
    attempts INTEGER := 0;
    max_attempts INTEGER := 100;
BEGIN
    LOOP
        result := '';
        FOR i IN 1..6 LOOP
            result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
        END LOOP;
        
        -- Check if this ID already exists
        IF NOT EXISTS (SELECT 1 FROM orders WHERE unique_order_id = result) THEN
            RETURN result;
        END IF;
        
        attempts := attempts + 1;
        IF attempts >= max_attempts THEN
            RAISE EXCEPTION 'Could not generate unique order ID after % attempts', max_attempts;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically generate unique_order_id for new orders
CREATE OR REPLACE FUNCTION set_unique_order_id()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.unique_order_id IS NULL THEN
        NEW.unique_order_id := generate_unique_order_id();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_order_unique_id 
    BEFORE INSERT ON orders 
    FOR EACH ROW 
    EXECUTE FUNCTION set_unique_order_id();

-- Create additional useful functions
CREATE OR REPLACE FUNCTION get_restaurant_stats(restaurant_uuid UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_orders', COUNT(*),
        'pending_orders', COUNT(*) FILTER (WHERE status = 'pending'),
        'completed_orders', COUNT(*) FILTER (WHERE status = 'completed'),
        'total_revenue', COALESCE(SUM(total_amount) FILTER (WHERE payment_status = 'completed'), 0),
        'avg_order_value', COALESCE(AVG(total_amount) FILTER (WHERE payment_status = 'completed'), 0)
    ) INTO result
    FROM orders 
    WHERE restaurant_id = restaurant_uuid;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Comments for documentation
COMMENT ON TABLE users IS 'System users including admins and restaurant owners';
COMMENT ON TABLE restaurants IS 'Restaurant information and authentication details';
COMMENT ON TABLE menu_items IS 'Menu items for each restaurant';
COMMENT ON TABLE orders IS 'Customer orders with payment tracking';
COMMENT ON TABLE payment_settings IS 'Payment gateway configurations per restaurant';
COMMENT ON TABLE transactions IS 'Payment transaction records from payment gateways';

COMMENT ON COLUMN orders.items IS 'JSONB array of order items: [{"id": number, "name": string, "quantity": number, "price": number, "total": number}]';
COMMENT ON COLUMN orders.unique_order_id IS '6-character customer-friendly order ID (e.g., "A2B3C4")';
COMMENT ON COLUMN payment_settings.cashfree_client_secret_encrypted IS 'Encrypted Cashfree client secret for security';
COMMENT ON COLUMN transactions.gateway_response IS 'Complete response from payment gateway for debugging';

-- Final verification queries (run these to verify the schema)
-- SELECT table_name, column_name, data_type, is_nullable FROM information_schema.columns WHERE table_schema = 'public' ORDER BY table_name, ordinal_position;
-- SELECT tablename, indexname FROM pg_indexes WHERE schemaname = 'public' ORDER BY tablename;