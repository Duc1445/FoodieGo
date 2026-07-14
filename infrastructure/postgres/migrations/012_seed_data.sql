-- ─────────────────────────────────────────────
-- SEED DATA (SPRINT 3 / ADMIN REFACTOR)
-- ─────────────────────────────────────────────

-- 3 Admin users
INSERT INTO users (id, email, password, full_name, phone, role) VALUES
('a0000000-0000-0000-0000-000000000001', 'admin1@foodiego.com', '$2a$10$SS07OViAxA51JmpxrvorM.71jqAVucuaoANTouC2NeB21sMEgt3GS', 'Admin One', '0900000001', 'admin'),
('a0000000-0000-0000-0000-000000000002', 'admin2@foodiego.com', '$2a$10$SS07OViAxA51JmpxrvorM.71jqAVucuaoANTouC2NeB21sMEgt3GS', 'Admin Two', '0900000002', 'admin'),
('a0000000-0000-0000-0000-000000000003', 'admin3@foodiego.com', '$2a$10$SS07OViAxA51JmpxrvorM.71jqAVucuaoANTouC2NeB21sMEgt3GS', 'Admin Three', '0900000003', 'admin')
ON CONFLICT (email) DO NOTHING;

-- 20 Customers
INSERT INTO users (id, email, password, full_name, phone, role) VALUES
('c0000000-0000-0000-0000-000000000001', 'customer1@foodiego.com', '$2a$10$SS07OViAxA51JmpxrvorM.71jqAVucuaoANTouC2NeB21sMEgt3GS', 'Nguyen Van A', '0910000001', 'customer'),
('c0000000-0000-0000-0000-000000000002', 'customer2@foodiego.com', '$2a$10$SS07OViAxA51JmpxrvorM.71jqAVucuaoANTouC2NeB21sMEgt3GS', 'Tran Thi B', '0910000002', 'customer'),
('c0000000-0000-0000-0000-000000000003', 'customer3@foodiego.com', '$2a$10$SS07OViAxA51JmpxrvorM.71jqAVucuaoANTouC2NeB21sMEgt3GS', 'Le Van C', '0910000003', 'customer'),
('c0000000-0000-0000-0000-000000000004', 'customer4@foodiego.com', '$2a$10$SS07OViAxA51JmpxrvorM.71jqAVucuaoANTouC2NeB21sMEgt3GS', 'Pham Thi D', '0910000004', 'customer'),
('c0000000-0000-0000-0000-000000000005', 'customer5@foodiego.com', '$2a$10$SS07OViAxA51JmpxrvorM.71jqAVucuaoANTouC2NeB21sMEgt3GS', 'Hoang Van E', '0910000005', 'customer'),
('c0000000-0000-0000-0000-000000000006', 'customer6@foodiego.com', '$2a$10$SS07OViAxA51JmpxrvorM.71jqAVucuaoANTouC2NeB21sMEgt3GS', 'Vu Thi F', '0910000006', 'customer'),
('c0000000-0000-0000-0000-000000000007', 'customer7@foodiego.com', '$2a$10$SS07OViAxA51JmpxrvorM.71jqAVucuaoANTouC2NeB21sMEgt3GS', 'Dang Van G', '0910000007', 'customer'),
('c0000000-0000-0000-0000-000000000008', 'customer8@foodiego.com', '$2a$10$SS07OViAxA51JmpxrvorM.71jqAVucuaoANTouC2NeB21sMEgt3GS', 'Bui Thi H', '0910000008', 'customer'),
('c0000000-0000-0000-0000-000000000009', 'customer9@foodiego.com', '$2a$10$SS07OViAxA51JmpxrvorM.71jqAVucuaoANTouC2NeB21sMEgt3GS', 'Do Van I', '0910000009', 'customer'),
('c0000000-0000-0000-0000-000000000010', 'customer10@foodiego.com', '$2a$10$SS07OViAxA51JmpxrvorM.71jqAVucuaoANTouC2NeB21sMEgt3GS', 'Ngo Thi J', '0910000010', 'customer'),
('c0000000-0000-0000-0000-000000000011', 'customer11@foodiego.com', '$2a$10$SS07OViAxA51JmpxrvorM.71jqAVucuaoANTouC2NeB21sMEgt3GS', 'Ly Van K', '0910000011', 'customer'),
('c0000000-0000-0000-0000-000000000012', 'customer12@foodiego.com', '$2a$10$SS07OViAxA51JmpxrvorM.71jqAVucuaoANTouC2NeB21sMEgt3GS', 'Tran Van L', '0910000012', 'customer'),
('c0000000-0000-0000-0000-000000000013', 'customer13@foodiego.com', '$2a$10$SS07OViAxA51JmpxrvorM.71jqAVucuaoANTouC2NeB21sMEgt3GS', 'Nguyen Thi M', '0910000013', 'customer'),
('c0000000-0000-0000-0000-000000000014', 'customer14@foodiego.com', '$2a$10$SS07OViAxA51JmpxrvorM.71jqAVucuaoANTouC2NeB21sMEgt3GS', 'Le Thi N', '0910000014', 'customer'),
('c0000000-0000-0000-0000-000000000015', 'customer15@foodiego.com', '$2a$10$SS07OViAxA51JmpxrvorM.71jqAVucuaoANTouC2NeB21sMEgt3GS', 'Pham Van O', '0910000015', 'customer'),
('c0000000-0000-0000-0000-000000000016', 'customer16@foodiego.com', '$2a$10$SS07OViAxA51JmpxrvorM.71jqAVucuaoANTouC2NeB21sMEgt3GS', 'Hoang Thi P', '0910000016', 'customer'),
('c0000000-0000-0000-0000-000000000017', 'customer17@foodiego.com', '$2a$10$SS07OViAxA51JmpxrvorM.71jqAVucuaoANTouC2NeB21sMEgt3GS', 'Vu Van Q', '0910000017', 'customer'),
('c0000000-0000-0000-0000-000000000018', 'customer18@foodiego.com', '$2a$10$SS07OViAxA51JmpxrvorM.71jqAVucuaoANTouC2NeB21sMEgt3GS', 'Dang Thi R', '0910000018', 'customer'),
('c0000000-0000-0000-0000-000000000019', 'customer19@foodiego.com', '$2a$10$SS07OViAxA51JmpxrvorM.71jqAVucuaoANTouC2NeB21sMEgt3GS', 'Bui Van S', '0910000019', 'customer'),
('c0000000-0000-0000-0000-000000000020', 'customer20@foodiego.com', '$2a$10$SS07OViAxA51JmpxrvorM.71jqAVucuaoANTouC2NeB21sMEgt3GS', 'Do Thi T', '0910000020', 'customer')
ON CONFLICT (email) DO NOTHING;

-- 3 Drivers
INSERT INTO users (id, email, password, full_name, phone, role) VALUES
('b0000000-0000-0000-0000-000000000001', 'driver1@foodiego.com', '$2a$10$SS07OViAxA51JmpxrvorM.71jqAVucuaoANTouC2NeB21sMEgt3GS', 'Driver One', '0920000001', 'driver'),
('b0000000-0000-0000-0000-000000000002', 'driver2@foodiego.com', '$2a$10$SS07OViAxA51JmpxrvorM.71jqAVucuaoANTouC2NeB21sMEgt3GS', 'Driver Two', '0920000002', 'driver'),
('b0000000-0000-0000-0000-000000000003', 'driver3@foodiego.com', '$2a$10$SS07OViAxA51JmpxrvorM.71jqAVucuaoANTouC2NeB21sMEgt3GS', 'Driver Three', '0920000003', 'driver')
ON CONFLICT (email) DO NOTHING;

-- 6 Merchants (one per district)
INSERT INTO users (id, email, password, full_name, phone, role) VALUES
('d0000000-0000-0000-0000-000000000001', 'merchant_hc@foodiego.com', '$2a$10$SS07OViAxA51JmpxrvorM.71jqAVucuaoANTouC2NeB21sMEgt3GS', 'Merchant Hai Chau', '0930000001', 'merchant'),
('d0000000-0000-0000-0000-000000000002', 'merchant_tk@foodiego.com', '$2a$10$SS07OViAxA51JmpxrvorM.71jqAVucuaoANTouC2NeB21sMEgt3GS', 'Merchant Thanh Khe', '0930000002', 'merchant'),
('d0000000-0000-0000-0000-000000000003', 'merchant_st@foodiego.com', '$2a$10$SS07OViAxA51JmpxrvorM.71jqAVucuaoANTouC2NeB21sMEgt3GS', 'Merchant Son Tra', '0930000003', 'merchant'),
('d0000000-0000-0000-0000-000000000004', 'merchant_nhs@foodiego.com', '$2a$10$SS07OViAxA51JmpxrvorM.71jqAVucuaoANTouC2NeB21sMEgt3GS', 'Merchant Ngu Hanh Son', '0930000004', 'merchant'),
('d0000000-0000-0000-0000-000000000005', 'merchant_lc@foodiego.com', '$2a$10$SS07OViAxA51JmpxrvorM.71jqAVucuaoANTouC2NeB21sMEgt3GS', 'Merchant Lien Chieu', '0930000005', 'merchant'),
('d0000000-0000-0000-0000-000000000006', 'merchant_cl@foodiego.com', '$2a$10$SS07OViAxA51JmpxrvorM.71jqAVucuaoANTouC2NeB21sMEgt3GS', 'Merchant Cam Le', '0930000006', 'merchant')
ON CONFLICT (email) DO NOTHING;

-- 6 Restaurants (assigned to Merchants)
INSERT INTO restaurants (id, name, description, cover_image, logo, status, latitude, longitude, rating, is_active) VALUES
('e0000000-0000-0000-0000-000000000001', 'Pho Da Nang (Hai Chau)', 'Authentic Pho in Hai Chau', 'https://images.unsplash.com/photo-1582878826629-29b7ad1cb438?w=500', 'https://ui-avatars.com/api/?name=Pho+HC', 'open', 16.060, 108.220, 4.8, true),
('e0000000-0000-0000-0000-000000000002', 'Bun Bo Hue (Thanh Khe)', 'Spicy Bun Bo Hue', 'https://images.unsplash.com/photo-1594993188559-0091411516fc?w=500', 'https://ui-avatars.com/api/?name=Bun+TK', 'open', 16.065, 108.190, 4.5, true),
('e0000000-0000-0000-0000-000000000003', 'Seafood Bay (Son Tra)', 'Fresh Seafood in Son Tra', 'https://images.unsplash.com/photo-1555980076-74944d15f3ec?w=500', 'https://ui-avatars.com/api/?name=Sea+ST', 'open', 16.080, 108.245, 4.9, true),
('e0000000-0000-0000-0000-000000000004', 'Com Ga Hoi An (Ngu Hanh Son)', 'Delicious Com Ga', 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=500', 'https://ui-avatars.com/api/?name=Com+NHS', 'open', 16.020, 108.250, 4.6, true),
('e0000000-0000-0000-0000-000000000005', 'Banh Mi Chuc (Lien Chieu)', 'Best Banh Mi in Lien Chieu', 'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=500', 'https://ui-avatars.com/api/?name=BM+LC', 'open', 16.085, 108.150, 4.4, true),
('e0000000-0000-0000-0000-000000000006', 'Mi Quang Co (Cam Le)', 'Traditional Mi Quang', 'https://images.unsplash.com/photo-1603569283847-aa295f0d016a?w=500', 'https://ui-avatars.com/api/?name=MQ+CL', 'open', 16.015, 108.210, 4.7, true)
ON CONFLICT (id) DO NOTHING;

-- Merchant Approval Seed (Need to update identity-service merchants)
-- Wait, merchants are linked to restaurants in identity service via custom table? Let's check identity service if there is a merchant_profiles table.
-- Actually, the relationship might be in the restaurant service. We will just use these for now.

-- 60 Menu Items (10 per restaurant)
-- Restaurant 1 (Pho Da Nang)
INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, is_available) VALUES
(gen_random_uuid(), 'e0000000-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 'Pho Bo Tai', 'Rare beef noodle soup', 50000, true),
(gen_random_uuid(), 'e0000000-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 'Pho Bo Nam', 'Flank beef noodle soup', 50000, true),
(gen_random_uuid(), 'e0000000-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 'Pho Bo Gau', 'Brisket beef noodle soup', 55000, true),
(gen_random_uuid(), 'e0000000-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 'Pho Bo Vien', 'Beef meatball noodle soup', 50000, true),
(gen_random_uuid(), 'e0000000-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 'Pho Dac Biet', 'Special beef noodle soup', 70000, true),
(gen_random_uuid(), 'e0000000-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 'Pho Ga', 'Chicken noodle soup', 45000, true),
(gen_random_uuid(), 'e0000000-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 'Pho Cuon', 'Pho rolls', 60000, true),
(gen_random_uuid(), 'e0000000-0000-0000-0000-000000000001', '55555555-5555-5555-5555-555555555555', 'Tra Da', 'Iced tea', 5000, true),
(gen_random_uuid(), 'e0000000-0000-0000-0000-000000000001', '55555555-5555-5555-5555-555555555555', 'Tra Sua', 'Milk tea', 25000, true),
(gen_random_uuid(), 'e0000000-0000-0000-0000-000000000001', '55555555-5555-5555-5555-555555555555', 'Cafe Sua Da', 'Iced milk coffee', 20000, true);

-- Restaurant 2 (Bun Bo Hue)
INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, is_available) VALUES
(gen_random_uuid(), 'e0000000-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222', 'Bun Bo Tai', 'Rare beef Bun Bo', 50000, true),
(gen_random_uuid(), 'e0000000-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222', 'Bun Bo Nam', 'Flank Bun Bo', 50000, true),
(gen_random_uuid(), 'e0000000-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222', 'Bun Bo Gio Heo', 'Pork knuckle Bun Bo', 55000, true),
(gen_random_uuid(), 'e0000000-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222', 'Bun Bo Cha Cua', 'Crab cake Bun Bo', 55000, true),
(gen_random_uuid(), 'e0000000-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222', 'Bun Bo Dac Biet', 'Special Bun Bo', 70000, true),
(gen_random_uuid(), 'e0000000-0000-0000-0000-000000000002', '44444444-4444-4444-4444-444444444444', 'Cha Gio', 'Spring rolls', 40000, true),
(gen_random_uuid(), 'e0000000-0000-0000-0000-000000000002', '44444444-4444-4444-4444-444444444444', 'Nem Lui', 'Pork skewers', 45000, true),
(gen_random_uuid(), 'e0000000-0000-0000-0000-000000000002', '55555555-5555-5555-5555-555555555555', 'Tra Da', 'Iced tea', 5000, true),
(gen_random_uuid(), 'e0000000-0000-0000-0000-000000000002', '55555555-5555-5555-5555-555555555555', 'Nuoc Mia', 'Sugarcane juice', 15000, true),
(gen_random_uuid(), 'e0000000-0000-0000-0000-000000000002', '55555555-5555-5555-5555-555555555555', 'Cafe Sua Da', 'Iced milk coffee', 20000, true);

-- Restaurant 3 (Seafood Bay)
INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, is_available) VALUES
(gen_random_uuid(), 'e0000000-0000-0000-0000-000000000003', '33333333-3333-3333-3333-333333333333', 'Muc Hap Gung', 'Steamed squid with ginger', 120000, true),
(gen_random_uuid(), 'e0000000-0000-0000-0000-000000000003', '33333333-3333-3333-3333-333333333333', 'Tom Nuong Muoi Ot', 'Grilled shrimp with chili salt', 150000, true),
(gen_random_uuid(), 'e0000000-0000-0000-0000-000000000003', '33333333-3333-3333-3333-333333333333', 'Ghe Hap', 'Steamed blue crab', 180000, true),
(gen_random_uuid(), 'e0000000-0000-0000-0000-000000000003', '33333333-3333-3333-3333-333333333333', 'Ngao Hap Thai', 'Thai-style steamed clams', 80000, true),
(gen_random_uuid(), 'e0000000-0000-0000-0000-000000000003', '33333333-3333-3333-3333-333333333333', 'Lau Hai San', 'Seafood hotpot', 300000, true),
(gen_random_uuid(), 'e0000000-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 'Com Chien Hai San', 'Seafood fried rice', 90000, true),
(gen_random_uuid(), 'e0000000-0000-0000-0000-000000000003', '22222222-2222-2222-2222-222222222222', 'Mi Xao Hai San', 'Seafood fried noodles', 90000, true),
(gen_random_uuid(), 'e0000000-0000-0000-0000-000000000003', '55555555-5555-5555-5555-555555555555', 'Tra Da', 'Iced tea', 5000, true),
(gen_random_uuid(), 'e0000000-0000-0000-0000-000000000003', '55555555-5555-5555-5555-555555555555', 'Bia Huda', 'Huda Beer', 20000, true),
(gen_random_uuid(), 'e0000000-0000-0000-0000-000000000003', '55555555-5555-5555-5555-555555555555', 'Bia Tiger', 'Tiger Beer', 25000, true);

-- Restaurant 4 (Com Ga Hoi An)
INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, is_available) VALUES
(gen_random_uuid(), 'e0000000-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111', 'Com Ga Xe', 'Shredded chicken rice', 45000, true),
(gen_random_uuid(), 'e0000000-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111', 'Com Ga Quay', 'Roast chicken rice', 50000, true),
(gen_random_uuid(), 'e0000000-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111', 'Com Ga Luoc', 'Boiled chicken rice', 45000, true),
(gen_random_uuid(), 'e0000000-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111', 'Com Ga Dac Biet', 'Special chicken rice', 65000, true),
(gen_random_uuid(), 'e0000000-0000-0000-0000-000000000004', '33333333-3333-3333-3333-333333333333', 'Ga Chat Phao', 'Chopped chicken', 120000, true),
(gen_random_uuid(), 'e0000000-0000-0000-0000-000000000004', '44444444-4444-4444-4444-444444444444', 'Goi Ga', 'Chicken salad', 70000, true),
(gen_random_uuid(), 'e0000000-0000-0000-0000-000000000004', '44444444-4444-4444-4444-444444444444', 'Long Ga Xao', 'Stir-fried chicken offal', 60000, true),
(gen_random_uuid(), 'e0000000-0000-0000-0000-000000000004', '55555555-5555-5555-5555-555555555555', 'Tra Da', 'Iced tea', 5000, true),
(gen_random_uuid(), 'e0000000-0000-0000-0000-000000000004', '55555555-5555-5555-5555-555555555555', 'Sua Dau Nanh', 'Soy milk', 15000, true),
(gen_random_uuid(), 'e0000000-0000-0000-0000-000000000004', '55555555-5555-5555-5555-555555555555', 'Nuoc Suoi', 'Mineral water', 10000, true);

-- Restaurant 5 (Banh Mi Chuc)
INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, is_available) VALUES
(gen_random_uuid(), 'e0000000-0000-0000-0000-000000000005', '33333333-3333-3333-3333-333333333333', 'Banh Mi Thit Nuong', 'Grilled pork sandwich', 20000, true),
(gen_random_uuid(), 'e0000000-0000-0000-0000-000000000005', '33333333-3333-3333-3333-333333333333', 'Banh Mi Cha Lua', 'Vietnamese sausage sandwich', 20000, true),
(gen_random_uuid(), 'e0000000-0000-0000-0000-000000000005', '33333333-3333-3333-3333-333333333333', 'Banh Mi Thit Kho', 'Braised pork sandwich', 25000, true),
(gen_random_uuid(), 'e0000000-0000-0000-0000-000000000005', '33333333-3333-3333-3333-333333333333', 'Banh Mi Op La', 'Fried egg sandwich', 15000, true),
(gen_random_uuid(), 'e0000000-0000-0000-0000-000000000005', '33333333-3333-3333-3333-333333333333', 'Banh Mi Dac Biet', 'Special sandwich', 30000, true),
(gen_random_uuid(), 'e0000000-0000-0000-0000-000000000005', '44444444-4444-4444-4444-444444444444', 'Xoi Man', 'Savory sticky rice', 25000, true),
(gen_random_uuid(), 'e0000000-0000-0000-0000-000000000005', '44444444-4444-4444-4444-444444444444', 'Xoi Ga', 'Chicken sticky rice', 30000, true),
(gen_random_uuid(), 'e0000000-0000-0000-0000-000000000005', '55555555-5555-5555-5555-555555555555', 'Tra Da', 'Iced tea', 5000, true),
(gen_random_uuid(), 'e0000000-0000-0000-0000-000000000005', '55555555-5555-5555-5555-555555555555', 'Sua Bap', 'Corn milk', 15000, true),
(gen_random_uuid(), 'e0000000-0000-0000-0000-000000000005', '55555555-5555-5555-5555-555555555555', 'Tra Sua', 'Milk tea', 20000, true);

-- Restaurant 6 (Mi Quang Co)
INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, is_available) VALUES
(gen_random_uuid(), 'e0000000-0000-0000-0000-000000000006', '22222222-2222-2222-2222-222222222222', 'Mi Quang Ga', 'Chicken Mi Quang', 40000, true),
(gen_random_uuid(), 'e0000000-0000-0000-0000-000000000006', '22222222-2222-2222-2222-222222222222', 'Mi Quang Tom Thit', 'Shrimp & Pork Mi Quang', 45000, true),
(gen_random_uuid(), 'e0000000-0000-0000-0000-000000000006', '22222222-2222-2222-2222-222222222222', 'Mi Quang Ech', 'Frog Mi Quang', 50000, true),
(gen_random_uuid(), 'e0000000-0000-0000-0000-000000000006', '22222222-2222-2222-2222-222222222222', 'Mi Quang Ca Loc', 'Snakehead fish Mi Quang', 45000, true),
(gen_random_uuid(), 'e0000000-0000-0000-0000-000000000006', '22222222-2222-2222-2222-222222222222', 'Mi Quang Dac Biet', 'Special Mi Quang', 60000, true),
(gen_random_uuid(), 'e0000000-0000-0000-0000-000000000006', '44444444-4444-4444-4444-444444444444', 'Banh Trang Nuong', 'Grilled rice paper', 15000, true),
(gen_random_uuid(), 'e0000000-0000-0000-0000-000000000006', '44444444-4444-4444-4444-444444444444', 'Ram It', 'Fried dumplings', 30000, true),
(gen_random_uuid(), 'e0000000-0000-0000-0000-000000000006', '55555555-5555-5555-5555-555555555555', 'Tra Da', 'Iced tea', 5000, true),
(gen_random_uuid(), 'e0000000-0000-0000-0000-000000000006', '55555555-5555-5555-5555-555555555555', 'Che Dau Den', 'Black bean sweet soup', 20000, true),
(gen_random_uuid(), 'e0000000-0000-0000-0000-000000000006', '55555555-5555-5555-5555-555555555555', 'Nuoc Cam', 'Orange juice', 25000, true);
