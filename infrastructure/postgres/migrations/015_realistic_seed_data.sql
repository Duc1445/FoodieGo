-- ─────────────────────────────────────────────
-- REALISTIC SEED DATA (Merchants, Shippers, Customers)
-- ─────────────────────────────────────────────

DO $$
DECLARE
    i INT;
    cust_id UUID;
    merch_id UUID;
    ship_id UUID;
    rest_id UUID;
    admin_id UUID;
BEGIN
    -- 1. Create 1 Additional Admin
    INSERT INTO users (email, password, full_name, phone, address, role, is_active, approval_status, avatar_url)
    VALUES (
        'admin2@foodiego.com', 
        '$2a$10$SS07OViAxA51JmpxrvorM.71jqAVucuaoANTouC2NeB21sMEgt3GS', 
        'System Admin 2', '0901234567', 'Admin HQ', 'admin', true, 'APPROVED', 'https://i.pravatar.cc/150?u=admin2'
    ) ON CONFLICT (email) DO NOTHING;

    -- 2. Create 20 Active Customers
    FOR i IN 1..20 LOOP
        INSERT INTO users (email, password, full_name, phone, address, role, is_active, approval_status, avatar_url)
        VALUES (
            'customer' || i || '@foodiego.com',
            '$2a$10$SS07OViAxA51JmpxrvorM.71jqAVucuaoANTouC2NeB21sMEgt3GS',
            'Customer ' || i,
            '09100000' || LPAD(i::text, 2, '0'),
            i || ' Customer Street, City',
            'customer',
            true,
            'APPROVED',
            'https://i.pravatar.cc/150?u=cust' || i
        ) ON CONFLICT (email) DO NOTHING;
    END LOOP;

    -- 3. Create 15 Approved Merchants
    FOR i IN 1..15 LOOP
        INSERT INTO users (email, password, full_name, phone, address, role, is_active, approval_status, avatar_url, business_name, business_license, tax_code)
        VALUES (
            'merchant_appr' || i || '@foodiego.com',
            '$2a$10$SS07OViAxA51JmpxrvorM.71jqAVucuaoANTouC2NeB21sMEgt3GS',
            'Approved Merchant ' || i,
            '09200000' || LPAD(i::text, 2, '0'),
            i || ' Merchant Ave, District 1',
            'merchant',
            true,
            'APPROVED',
            'https://i.pravatar.cc/150?u=merch_appr' || i,
            'Restaurant Business ' || i,
            'LIC-' || i || '987654321',
            'TAX-' || i || '123456789'
        ) RETURNING id INTO merch_id;

        -- Create a restaurant for the approved merchant
        INSERT INTO restaurants (name, description, owner_id, address, phone, district, ward)
        VALUES (
            'Restaurant ' || i,
            'Delicious food from Restaurant ' || i,
            merch_id,
            i || ' Merchant Ave, District 1',
            '09200000' || LPAD(i::text, 2, '0'),
            'District 1',
            'Ward ' || i
        );
    END LOOP;

    -- 4. Create 5 Pending Merchants
    FOR i IN 1..5 LOOP
        INSERT INTO users (email, password, full_name, phone, address, role, is_active, approval_status, avatar_url, business_name, business_license, tax_code)
        VALUES (
            'merchant_pend' || i || '@foodiego.com',
            '$2a$10$SS07OViAxA51JmpxrvorM.71jqAVucuaoANTouC2NeB21sMEgt3GS',
            'Pending Merchant ' || i,
            '09300000' || LPAD(i::text, 2, '0'),
            i || ' Pending Blvd, District 2',
            'merchant',
            true,
            'PENDING',
            'https://i.pravatar.cc/150?u=merch_pend' || i,
            'Pending Business ' || i,
            'LIC-P' || i || '987654321',
            'TAX-P' || i || '123456789'
        ) ON CONFLICT (email) DO NOTHING;
    END LOOP;

    -- 5. Create 2 Rejected Merchants
    FOR i IN 1..2 LOOP
        INSERT INTO users (email, password, full_name, phone, address, role, is_active, approval_status, avatar_url, business_name, business_license, tax_code, rejection_reason)
        VALUES (
            'merchant_rej' || i || '@foodiego.com',
            '$2a$10$SS07OViAxA51JmpxrvorM.71jqAVucuaoANTouC2NeB21sMEgt3GS',
            'Rejected Merchant ' || i,
            '09400000' || LPAD(i::text, 2, '0'),
            i || ' Reject Road, District 3',
            'merchant',
            true,
            'REJECTED',
            'https://i.pravatar.cc/150?u=merch_rej' || i,
            'Rejected Business ' || i,
            'LIC-R' || i || '987654321',
            'TAX-R' || i || '123456789',
            'Missing required documentation'
        ) ON CONFLICT (email) DO NOTHING;
    END LOOP;

    -- 6. Create 10 Approved Shippers
    FOR i IN 1..10 LOOP
        INSERT INTO users (email, password, full_name, phone, address, role, is_active, approval_status, avatar_url, identity_card, driver_license, vehicle_type, vehicle_plate)
        VALUES (
            'shipper_appr' || i || '@foodiego.com',
            '$2a$10$SS07OViAxA51JmpxrvorM.71jqAVucuaoANTouC2NeB21sMEgt3GS',
            'Approved Shipper ' || i,
            '09500000' || LPAD(i::text, 2, '0'),
            i || ' Shipper Lane, District 4',
            'shipper',
            true,
            'APPROVED',
            'https://i.pravatar.cc/150?u=ship_appr' || i,
            'ID-' || i || '11111',
            'DL-' || i || '22222',
            'Motorbike',
            '59-X' || i || ' ' || (1000 + i)
        ) ON CONFLICT (email) DO NOTHING;
    END LOOP;

    -- 7. Create 3 Pending Shippers
    FOR i IN 1..3 LOOP
        INSERT INTO users (email, password, full_name, phone, address, role, is_active, approval_status, avatar_url, identity_card, driver_license, vehicle_type, vehicle_plate)
        VALUES (
            'shipper_pend' || i || '@foodiego.com',
            '$2a$10$SS07OViAxA51JmpxrvorM.71jqAVucuaoANTouC2NeB21sMEgt3GS',
            'Pending Shipper ' || i,
            '09600000' || LPAD(i::text, 2, '0'),
            i || ' Pend Ship Way, District 5',
            'shipper',
            true,
            'PENDING',
            'https://i.pravatar.cc/150?u=ship_pend' || i,
            'ID-P' || i || '11111',
            'DL-P' || i || '22222',
            'Motorbike',
            '59-P' || i || ' ' || (2000 + i)
        ) ON CONFLICT (email) DO NOTHING;
    END LOOP;

    -- 8. Create 2 Rejected Shippers
    FOR i IN 1..2 LOOP
        INSERT INTO users (email, password, full_name, phone, address, role, is_active, approval_status, avatar_url, identity_card, driver_license, vehicle_type, vehicle_plate, rejection_reason)
        VALUES (
            'shipper_rej' || i || '@foodiego.com',
            '$2a$10$SS07OViAxA51JmpxrvorM.71jqAVucuaoANTouC2NeB21sMEgt3GS',
            'Rejected Shipper ' || i,
            '09700000' || LPAD(i::text, 2, '0'),
            i || ' Rej Ship Street, District 6',
            'shipper',
            true,
            'REJECTED',
            'https://i.pravatar.cc/150?u=ship_rej' || i,
            'ID-R' || i || '11111',
            'DL-R' || i || '22222',
            'Motorbike',
            '59-R' || i || ' ' || (3000 + i),
            'Invalid Driver License'
        ) ON CONFLICT (email) DO NOTHING;
    END LOOP;

    -- 9. Seed Support Tickets (From different roles)
    -- We assume the admin_id is the default admin
    SELECT id INTO admin_id FROM users WHERE email = 'admin@foodiego.com' LIMIT 1;
    SELECT id INTO cust_id FROM users WHERE role = 'customer' AND email = 'customer1@foodiego.com' LIMIT 1;
    SELECT id INTO merch_id FROM users WHERE role = 'merchant' AND email = 'merchant_appr1@foodiego.com' LIMIT 1;
    SELECT id INTO ship_id FROM users WHERE role = 'shipper' AND email = 'shipper_appr1@foodiego.com' LIMIT 1;

    IF admin_id IS NOT NULL THEN
        -- Customer Tickets
        FOR i IN 1..5 LOOP
            INSERT INTO support_tickets (ticket_number, customer_id, issue_type, description, priority, status, assigned_admin)
            VALUES (
                'TKT-CUST-' || i,
                cust_id,
                'Order Issue',
                'My order is delayed. Please check.',
                'MEDIUM',
                CASE WHEN i % 2 = 0 THEN 'OPEN' ELSE 'CLOSED' END,
                admin_id
            ) ON CONFLICT (ticket_number) DO NOTHING;
        END LOOP;

        -- Merchant Tickets
        FOR i IN 1..5 LOOP
            INSERT INTO support_tickets (ticket_number, merchant_id, issue_type, description, priority, status, assigned_admin)
            VALUES (
                'TKT-MERCH-' || i,
                merch_id,
                'Payout Issue',
                'I have not received the payout for yesterday.',
                'HIGH',
                CASE WHEN i % 2 = 0 THEN 'IN_PROGRESS' ELSE 'OPEN' END,
                admin_id
            ) ON CONFLICT (ticket_number) DO NOTHING;
        END LOOP;

        -- Shipper Tickets
        FOR i IN 1..5 LOOP
            INSERT INTO support_tickets (ticket_number, shipper_id, issue_type, description, priority, status, assigned_admin)
            VALUES (
                'TKT-SHIP-' || i,
                ship_id,
                'App Bug',
                'Cannot mark order as delivered in the app.',
                'URGENT',
                'OPEN',
                admin_id
            ) ON CONFLICT (ticket_number) DO NOTHING;
        END LOOP;
    END IF;

    -- 10. Seed Promotions
    FOR i IN 1..10 LOOP
        INSERT INTO promotions (code, discount_type, discount_value, min_order_value, max_discount_value, usage_limit, is_active)
        VALUES (
            'PROMO202' || i,
            CASE WHEN i % 2 = 0 THEN 'percentage' ELSE 'fixed' END,
            CASE WHEN i % 2 = 0 THEN 10 ELSE 5.00 END,
            CASE WHEN i % 2 = 0 THEN 0 ELSE 10.00 END,
            CASE WHEN i % 2 = 0 THEN 20.00 ELSE NULL END,
            100 + i,
            true
        ) ON CONFLICT (code) DO NOTHING;
    END LOOP;

END $$;
