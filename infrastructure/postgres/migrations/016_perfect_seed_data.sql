-- 016_perfect_seed_data.sql
-- Clear old data to prevent duplication
TRUNCATE users CASCADE;
TRUNCATE orders CASCADE;
TRUNCATE restaurants CASCADE;
TRUNCATE support_tickets CASCADE;
TRUNCATE promotions CASCADE;
TRUNCATE menu_items CASCADE;

-- Insert 1 Admin
INSERT INTO users (id, email, password, full_name, role, approval_status, is_active)
VALUES 
(gen_random_uuid(), 'admin1@foodiego.com', '$2a$10$mrHKsWQHs8RoHTWCpY5kJOcWzrw0t/2s35OxPosBHBT0qY4Fiq7Gm', 'System Admin', 'admin', 'APPROVED', true);

-- Insert 20 Customers
DO $$
DECLARE
  i INTEGER;
BEGIN
  FOR i IN 1..20 LOOP
    INSERT INTO users (id, email, password, full_name, role, approval_status, is_active)
    VALUES 
    (gen_random_uuid(), 'customer' || i || '@foodiego.com', '$2a$10$mrHKsWQHs8RoHTWCpY5kJOcWzrw0t/2s35OxPosBHBT0qY4Fiq7Gm', 'Customer ' || i, 'customer', 'APPROVED', true);
  END LOOP;
END $$;

-- Insert 15 Approved Merchants
DO $$
DECLARE
  i INTEGER;
  u_id UUID;
  r_id UUID;
BEGIN
  FOR i IN 1..15 LOOP
    u_id := gen_random_uuid();
    INSERT INTO users (id, email, password, full_name, role, approval_status, is_active, business_name, business_license, tax_code, avatar_url, restaurant_images)
    VALUES 
    (u_id, 'merchant_appr' || i || '@foodiego.com', '$2a$10$mrHKsWQHs8RoHTWCpY5kJOcWzrw0t/2s35OxPosBHBT0qY4Fiq7Gm', 'Approved Merchant ' || i, 'merchant', 'APPROVED', true, 'Business ' || i, 'LIC-APPR-' || i, 'TAX-APPR-' || i, 'https://picsum.photos/200/300', '["https://picsum.photos/400/300"]');
    
    -- Insert corresponding restaurant
    r_id := gen_random_uuid();
    INSERT INTO restaurants (id, owner_id, name, description, address, phone, is_active, rating)
    VALUES
    (r_id, u_id, 'Restaurant ' || i, 'Desc ' || i, 'Address ' || i, '0901000' || i, true, 4.5);
    
    -- Insert menu items
    INSERT INTO menu_items (id, restaurant_id, name, description, price, is_available)
    VALUES
    (gen_random_uuid(), r_id, 'Item A' || i, 'Desc A', 10.5, true),
    (gen_random_uuid(), r_id, 'Item B' || i, 'Desc B', 15.0, true);
  END LOOP;
END $$;

-- Insert 5 Pending Merchants
DO $$
DECLARE i INTEGER;
BEGIN
  FOR i IN 1..5 LOOP
    INSERT INTO users (id, email, password, full_name, role, approval_status, is_active, business_name, business_license, tax_code)
    VALUES 
    (gen_random_uuid(), 'merchant_pend' || i || '@foodiego.com', '$2a$10$mrHKsWQHs8RoHTWCpY5kJOcWzrw0t/2s35OxPosBHBT0qY4Fiq7Gm', 'Pending Merchant ' || i, 'merchant', 'PENDING', true, 'Business ' || i, 'LIC-PEND-' || i, 'TAX-PEND-' || i);
  END LOOP;
END $$;

-- Insert 2 Rejected Merchants
DO $$
DECLARE i INTEGER;
BEGIN
  FOR i IN 1..2 LOOP
    INSERT INTO users (id, email, password, full_name, role, approval_status, is_active, business_name, business_license, tax_code, rejection_reason)
    VALUES 
    (gen_random_uuid(), 'merchant_rej' || i || '@foodiego.com', '$2a$10$mrHKsWQHs8RoHTWCpY5kJOcWzrw0t/2s35OxPosBHBT0qY4Fiq7Gm', 'Rejected Merchant ' || i, 'merchant', 'REJECTED', true, 'Business ' || i, 'LIC-REJ-' || i, 'TAX-REJ-' || i, 'Missing paperwork');
  END LOOP;
END $$;

-- Insert 10 Approved Shippers
DO $$
DECLARE i INTEGER;
BEGIN
  FOR i IN 1..10 LOOP
    INSERT INTO users (id, email, password, full_name, role, approval_status, is_active, identity_card, driver_license, vehicle_type, vehicle_plate)
    VALUES 
    (gen_random_uuid(), 'shipper_appr' || i || '@foodiego.com', '$2a$10$mrHKsWQHs8RoHTWCpY5kJOcWzrw0t/2s35OxPosBHBT0qY4Fiq7Gm', 'Approved Shipper ' || i, 'shipper', 'APPROVED', true, 'ID-APPR-' || i, 'DL-APPR-' || i, 'Motorbike', 'PL-APPR-' || i);
  END LOOP;
END $$;

-- Insert 3 Pending Shippers
DO $$
DECLARE i INTEGER;
BEGIN
  FOR i IN 1..3 LOOP
    INSERT INTO users (id, email, password, full_name, role, approval_status, is_active, identity_card, driver_license, vehicle_type, vehicle_plate)
    VALUES 
    (gen_random_uuid(), 'shipper_pend' || i || '@foodiego.com', '$2a$10$mrHKsWQHs8RoHTWCpY5kJOcWzrw0t/2s35OxPosBHBT0qY4Fiq7Gm', 'Pending Shipper ' || i, 'shipper', 'PENDING', true, 'ID-PEND-' || i, 'DL-PEND-' || i, 'Motorbike', 'PL-PEND-' || i);
  END LOOP;
END $$;

-- Insert 2 Rejected Shippers
DO $$
DECLARE i INTEGER;
BEGIN
  FOR i IN 1..2 LOOP
    INSERT INTO users (id, email, password, full_name, role, approval_status, is_active, identity_card, driver_license, vehicle_type, vehicle_plate, rejection_reason)
    VALUES 
    (gen_random_uuid(), 'shipper_rej' || i || '@foodiego.com', '$2a$10$mrHKsWQHs8RoHTWCpY5kJOcWzrw0t/2s35OxPosBHBT0qY4Fiq7Gm', 'Rejected Shipper ' || i, 'shipper', 'REJECTED', true, 'ID-REJ-' || i, 'DL-REJ-' || i, 'Motorbike', 'PL-REJ-' || i, 'Bad driving record');
  END LOOP;
END $$;

-- Insert 50 Orders
DO $$
DECLARE
  i INTEGER;
  c_id UUID;
  r_id UUID;
  o_id UUID;
BEGIN
  FOR i IN 1..50 LOOP
    SELECT id INTO c_id FROM users WHERE role = 'customer' ORDER BY random() LIMIT 1;
    SELECT id INTO r_id FROM restaurants ORDER BY random() LIMIT 1;
    o_id := gen_random_uuid();
    
    INSERT INTO orders (id, user_id, restaurant_id, status, subtotal, delivery_fee, tax, discount, total)
    VALUES
    (o_id, c_id, r_id, 'COMPLETED', 100.00, 10.00, 5.00, 0, 115.00);
    
    INSERT INTO order_items (id, order_id, menu_item_id, quantity, item_name, item_price, price_version)
    VALUES
    (gen_random_uuid(), o_id, (SELECT id FROM menu_items WHERE restaurant_id = r_id LIMIT 1), 2, 'Item', 50.00, 1);
  END LOOP;
END $$;

-- Insert 25 Tickets
DO $$
DECLARE i INTEGER; u_id UUID;
BEGIN
  FOR i IN 1..25 LOOP
    SELECT id INTO u_id FROM users WHERE role = 'customer' ORDER BY random() LIMIT 1;
    INSERT INTO support_tickets (id, ticket_number, customer_id, issue_type, description, status, priority)
    VALUES
    (gen_random_uuid(), 'TCK-' || i, u_id, 'PAYMENT', 'Issue description ' || i, 
     CASE WHEN i % 3 = 0 THEN 'CLOSED' ELSE 'OPEN' END, 
     CASE WHEN i % 5 = 0 THEN 'HIGH' ELSE 'MEDIUM' END);
  END LOOP;
END $$;

-- Insert 15 Promotions
DO $$
DECLARE i INTEGER;
BEGIN
  FOR i IN 1..15 LOOP
    INSERT INTO promotions (id, code, discount_type, discount_value, max_discount_value, valid_from, valid_until, is_active)
    VALUES
    (gen_random_uuid(), 'PROMO' || i, 'percentage', 10, 20.00, NOW() - interval '10 days', NOW() + interval '10 days', true);
  END LOOP;
END $$;
