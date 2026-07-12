-- Seed Data for Da Nang Restaurants

INSERT INTO restaurants (id, name, description, cover_image, logo, rating, total_reviews, delivery_fee, minimum_order, opening_time, closing_time, status, latitude, longitude, is_active)
VALUES ('00000000-0000-4000-9999-000000000001', 'Mi Quang Ba Mua', 'Best Vietnamese food in Da Nang.', 'https://picsum.photos/seed/cover-00000000-0000-4000-9999-000000000001/800/400', 'https://picsum.photos/seed/00000000-0000-4000-9999-000000000001/200/200', 4.8, 157, 15000, 50000, '08:00', '22:00', 'open', 16.066866, 108.189794, true)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, delivery_fee = EXCLUDED.delivery_fee, rating = EXCLUDED.rating;

INSERT INTO restaurants (id, name, description, cover_image, logo, rating, total_reviews, delivery_fee, minimum_order, opening_time, closing_time, status, latitude, longitude, is_active)
VALUES ('00000000-0000-4000-9999-000000000002', 'Banh Xeo Ba Duong', 'Best Vietnamese food in Da Nang.', 'https://picsum.photos/seed/cover-00000000-0000-4000-9999-000000000002/800/400', 'https://picsum.photos/seed/00000000-0000-4000-9999-000000000002/200/200', 4.9, 258, 10000, 50000, '08:00', '22:00', 'open', 16.039584, 108.189324, true)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, delivery_fee = EXCLUDED.delivery_fee, rating = EXCLUDED.rating;

INSERT INTO restaurants (id, name, description, cover_image, logo, rating, total_reviews, delivery_fee, minimum_order, opening_time, closing_time, status, latitude, longitude, is_active)
VALUES ('00000000-0000-4000-9999-000000000003', 'Bun Cha Ca 109', 'Best Vietnamese food in Da Nang.', 'https://picsum.photos/seed/cover-00000000-0000-4000-9999-000000000003/800/400', 'https://picsum.photos/seed/00000000-0000-4000-9999-000000000003/200/200', 4.9, 488, 12000, 50000, '08:00', '22:00', 'open', 16.052551, 108.200194, true)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, delivery_fee = EXCLUDED.delivery_fee, rating = EXCLUDED.rating;

INSERT INTO restaurants (id, name, description, cover_image, logo, rating, total_reviews, delivery_fee, minimum_order, opening_time, closing_time, status, latitude, longitude, is_active)
VALUES ('00000000-0000-4000-9999-000000000004', 'Hai San Nam Danh', 'Best Seafood food in Da Nang.', 'https://picsum.photos/seed/cover-00000000-0000-4000-9999-000000000004/800/400', 'https://picsum.photos/seed/00000000-0000-4000-9999-000000000004/200/200', 4.7, 54, 25000, 50000, '08:00', '22:00', 'open', 16.062532, 108.202302, true)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, delivery_fee = EXCLUDED.delivery_fee, rating = EXCLUDED.rating;

INSERT INTO restaurants (id, name, description, cover_image, logo, rating, total_reviews, delivery_fee, minimum_order, opening_time, closing_time, status, latitude, longitude, is_active)
VALUES ('00000000-0000-4000-9999-000000000005', 'Pizza 4P''s Indochina', 'Best Italian food in Da Nang.', 'https://picsum.photos/seed/cover-00000000-0000-4000-9999-000000000005/800/400', 'https://picsum.photos/seed/00000000-0000-4000-9999-000000000005/200/200', 4.8, 347, 30000, 50000, '08:00', '22:00', 'open', 16.040712, 108.210075, true)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, delivery_fee = EXCLUDED.delivery_fee, rating = EXCLUDED.rating;

INSERT INTO restaurants (id, name, description, cover_image, logo, rating, total_reviews, delivery_fee, minimum_order, opening_time, closing_time, status, latitude, longitude, is_active)
VALUES ('00000000-0000-4000-9999-000000000006', 'Burger Bros', 'Best Western food in Da Nang.', 'https://picsum.photos/seed/cover-00000000-0000-4000-9999-000000000006/800/400', 'https://picsum.photos/seed/00000000-0000-4000-9999-000000000006/200/200', 4.5, 107, 20000, 50000, '08:00', '22:00', 'open', 16.063866, 108.194661, true)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, delivery_fee = EXCLUDED.delivery_fee, rating = EXCLUDED.rating;

INSERT INTO restaurants (id, name, description, cover_image, logo, rating, total_reviews, delivery_fee, minimum_order, opening_time, closing_time, status, latitude, longitude, is_active)
VALUES ('00000000-0000-4000-9999-000000000007', 'Com Ga A Hai', 'Best Vietnamese food in Da Nang.', 'https://picsum.photos/seed/cover-00000000-0000-4000-9999-000000000007/800/400', 'https://picsum.photos/seed/00000000-0000-4000-9999-000000000007/200/200', 4.6, 203, 15000, 50000, '08:00', '22:00', 'open', 16.067819, 108.198646, true)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, delivery_fee = EXCLUDED.delivery_fee, rating = EXCLUDED.rating;

INSERT INTO restaurants (id, name, description, cover_image, logo, rating, total_reviews, delivery_fee, minimum_order, opening_time, closing_time, status, latitude, longitude, is_active)
VALUES ('00000000-0000-4000-9999-000000000008', 'Quan Be Man', 'Best Seafood food in Da Nang.', 'https://picsum.photos/seed/cover-00000000-0000-4000-9999-000000000008/800/400', 'https://picsum.photos/seed/00000000-0000-4000-9999-000000000008/200/200', 4.8, 499, 35000, 50000, '08:00', '22:00', 'open', 16.069194, 108.201639, true)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, delivery_fee = EXCLUDED.delivery_fee, rating = EXCLUDED.rating;

INSERT INTO restaurants (id, name, description, cover_image, logo, rating, total_reviews, delivery_fee, minimum_order, opening_time, closing_time, status, latitude, longitude, is_active)
VALUES ('00000000-0000-4000-9999-000000000009', 'Che Lien', 'Best Dessert food in Da Nang.', 'https://picsum.photos/seed/cover-00000000-0000-4000-9999-000000000009/800/400', 'https://picsum.photos/seed/00000000-0000-4000-9999-000000000009/200/200', 4.7, 202, 10000, 50000, '08:00', '22:00', 'open', 16.056359, 108.193535, true)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, delivery_fee = EXCLUDED.delivery_fee, rating = EXCLUDED.rating;

INSERT INTO restaurants (id, name, description, cover_image, logo, rating, total_reviews, delivery_fee, minimum_order, opening_time, closing_time, status, latitude, longitude, is_active)
VALUES ('00000000-0000-4000-9999-000000000010', 'Bun Bo Hue Ba Thuong', 'Best Vietnamese food in Da Nang.', 'https://picsum.photos/seed/cover-00000000-0000-4000-9999-000000000010/800/400', 'https://picsum.photos/seed/00000000-0000-4000-9999-000000000010/200/200', 4.5, 63, 15000, 50000, '08:00', '22:00', 'open', 16.064100, 108.216442, true)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, delivery_fee = EXCLUDED.delivery_fee, rating = EXCLUDED.rating;

INSERT INTO restaurants (id, name, description, cover_image, logo, rating, total_reviews, delivery_fee, minimum_order, opening_time, closing_time, status, latitude, longitude, is_active)
VALUES ('00000000-0000-4000-9999-000000000011', 'My Hanh Seafood', 'Best Seafood food in Da Nang.', 'https://picsum.photos/seed/cover-00000000-0000-4000-9999-000000000011/800/400', 'https://picsum.photos/seed/00000000-0000-4000-9999-000000000011/200/200', 4.6, 390, 40000, 50000, '08:00', '22:00', 'open', 16.067217, 108.192297, true)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, delivery_fee = EXCLUDED.delivery_fee, rating = EXCLUDED.rating;

INSERT INTO restaurants (id, name, description, cover_image, logo, rating, total_reviews, delivery_fee, minimum_order, opening_time, closing_time, status, latitude, longitude, is_active)
VALUES ('00000000-0000-4000-9999-000000000012', 'Fatfish Restaurant', 'Best Fusion food in Da Nang.', 'https://picsum.photos/seed/cover-00000000-0000-4000-9999-000000000012/800/400', 'https://picsum.photos/seed/00000000-0000-4000-9999-000000000012/200/200', 4.7, 86, 30000, 50000, '08:00', '22:00', 'open', 16.050027, 108.197406, true)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, delivery_fee = EXCLUDED.delivery_fee, rating = EXCLUDED.rating;


-- CATEGORIES

























-- MENU ITEMS
INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_available, preparation_time, display_order)
VALUES ('00000000-0000-4000-7777-000000000001', '00000000-0000-4000-9999-000000000001', '44444444-4444-4444-4444-444444444444', 'Mi Quang Ga', 'Delicious Mi Quang Ga prepared fresh.', 110000, 'https://picsum.photos/seed/00000000-0000-4000-7777-000000000001/300/300', true, 15, 1)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, name = EXCLUDED.name;

INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_available, preparation_time, display_order)
VALUES ('00000000-0000-4000-7777-000000000002', '00000000-0000-4000-9999-000000000001', '55555555-5555-5555-5555-555555555555', 'Mi Quang Ech', 'Delicious Mi Quang Ech prepared fresh.', 72000, 'https://picsum.photos/seed/00000000-0000-4000-7777-000000000002/300/300', true, 15, 2)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, name = EXCLUDED.name;

INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_available, preparation_time, display_order)
VALUES ('00000000-0000-4000-7777-000000000003', '00000000-0000-4000-9999-000000000001', '55555555-5555-5555-5555-555555555555', 'Mi Quang Tom Thit', 'Delicious Mi Quang Tom Thit prepared fresh.', 73000, 'https://picsum.photos/seed/00000000-0000-4000-7777-000000000003/300/300', true, 15, 3)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, name = EXCLUDED.name;

INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_available, preparation_time, display_order)
VALUES ('00000000-0000-4000-7777-000000000004', '00000000-0000-4000-9999-000000000001', '44444444-4444-4444-4444-444444444444', 'Mi Quang Dac Biet', 'Delicious Mi Quang Dac Biet prepared fresh.', 59000, 'https://picsum.photos/seed/00000000-0000-4000-7777-000000000004/300/300', true, 15, 4)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, name = EXCLUDED.name;

INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_available, preparation_time, display_order)
VALUES ('00000000-0000-4000-7777-000000000005', '00000000-0000-4000-9999-000000000001', '11111111-1111-1111-1111-111111111111', 'Banh Trang Nuong', 'Delicious Banh Trang Nuong prepared fresh.', 127000, 'https://picsum.photos/seed/00000000-0000-4000-7777-000000000005/300/300', true, 15, 5)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, name = EXCLUDED.name;

INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_available, preparation_time, display_order)
VALUES ('00000000-0000-4000-7777-000000000006', '00000000-0000-4000-9999-000000000001', '22222222-2222-2222-2222-222222222222', 'Sua Bap', 'Delicious Sua Bap prepared fresh.', 62000, 'https://picsum.photos/seed/00000000-0000-4000-7777-000000000006/300/300', true, 15, 6)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, name = EXCLUDED.name;

INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_available, preparation_time, display_order)
VALUES ('00000000-0000-4000-7777-000000000007', '00000000-0000-4000-9999-000000000001', '44444444-4444-4444-4444-444444444444', 'Tra Da', 'Delicious Tra Da prepared fresh.', 101000, 'https://picsum.photos/seed/00000000-0000-4000-7777-000000000007/300/300', true, 15, 7)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, name = EXCLUDED.name;

INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_available, preparation_time, display_order)
VALUES ('00000000-0000-4000-7777-000000000008', '00000000-0000-4000-9999-000000000001', '22222222-2222-2222-2222-222222222222', 'Tra Tac', 'Delicious Tra Tac prepared fresh.', 112000, 'https://picsum.photos/seed/00000000-0000-4000-7777-000000000008/300/300', true, 15, 8)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, name = EXCLUDED.name;

INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_available, preparation_time, display_order)
VALUES ('00000000-0000-4000-7777-000000000009', '00000000-0000-4000-9999-000000000001', '55555555-5555-5555-5555-555555555555', 'Ram Cuon', 'Delicious Ram Cuon prepared fresh.', 104000, 'https://picsum.photos/seed/00000000-0000-4000-7777-000000000009/300/300', true, 15, 9)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, name = EXCLUDED.name;

INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_available, preparation_time, display_order)
VALUES ('00000000-0000-4000-7777-000000000010', '00000000-0000-4000-9999-000000000001', '33333333-3333-3333-3333-333333333333', 'Banh Beo', 'Delicious Banh Beo prepared fresh.', 86000, 'https://picsum.photos/seed/00000000-0000-4000-7777-000000000010/300/300', true, 15, 10)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, name = EXCLUDED.name;

INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_available, preparation_time, display_order)
VALUES ('00000000-0000-4000-7777-000000000011', '00000000-0000-4000-9999-000000000002', '11111111-1111-1111-1111-111111111111', 'Banh Xeo Dac Biet', 'Delicious Banh Xeo Dac Biet prepared fresh.', 108000, 'https://picsum.photos/seed/00000000-0000-4000-7777-000000000011/300/300', true, 15, 1)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, name = EXCLUDED.name;

INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_available, preparation_time, display_order)
VALUES ('00000000-0000-4000-7777-000000000012', '00000000-0000-4000-9999-000000000002', '55555555-5555-5555-5555-555555555555', 'Nem Lui', 'Delicious Nem Lui prepared fresh.', 42000, 'https://picsum.photos/seed/00000000-0000-4000-7777-000000000012/300/300', true, 15, 2)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, name = EXCLUDED.name;

INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_available, preparation_time, display_order)
VALUES ('00000000-0000-4000-7777-000000000013', '00000000-0000-4000-9999-000000000002', '22222222-2222-2222-2222-222222222222', 'Thit Nuong', 'Delicious Thit Nuong prepared fresh.', 55000, 'https://picsum.photos/seed/00000000-0000-4000-7777-000000000013/300/300', true, 15, 3)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, name = EXCLUDED.name;

INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_available, preparation_time, display_order)
VALUES ('00000000-0000-4000-7777-000000000014', '00000000-0000-4000-9999-000000000002', '55555555-5555-5555-5555-555555555555', 'Bun Thit Nuong', 'Delicious Bun Thit Nuong prepared fresh.', 125000, 'https://picsum.photos/seed/00000000-0000-4000-7777-000000000014/300/300', true, 15, 4)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, name = EXCLUDED.name;

INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_available, preparation_time, display_order)
VALUES ('00000000-0000-4000-7777-000000000015', '00000000-0000-4000-9999-000000000002', '22222222-2222-2222-2222-222222222222', 'Tra Da', 'Delicious Tra Da prepared fresh.', 41000, 'https://picsum.photos/seed/00000000-0000-4000-7777-000000000015/300/300', true, 15, 5)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, name = EXCLUDED.name;

INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_available, preparation_time, display_order)
VALUES ('00000000-0000-4000-7777-000000000016', '00000000-0000-4000-9999-000000000002', '55555555-5555-5555-5555-555555555555', 'Nuoc Mia', 'Delicious Nuoc Mia prepared fresh.', 115000, 'https://picsum.photos/seed/00000000-0000-4000-7777-000000000016/300/300', true, 15, 6)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, name = EXCLUDED.name;

INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_available, preparation_time, display_order)
VALUES ('00000000-0000-4000-7777-000000000017', '00000000-0000-4000-9999-000000000002', '22222222-2222-2222-2222-222222222222', 'Banh Khoai', 'Delicious Banh Khoai prepared fresh.', 34000, 'https://picsum.photos/seed/00000000-0000-4000-7777-000000000017/300/300', true, 15, 7)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, name = EXCLUDED.name;

INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_available, preparation_time, display_order)
VALUES ('00000000-0000-4000-7777-000000000018', '00000000-0000-4000-9999-000000000002', '22222222-2222-2222-2222-222222222222', 'Banh Cuon', 'Delicious Banh Cuon prepared fresh.', 94000, 'https://picsum.photos/seed/00000000-0000-4000-7777-000000000018/300/300', true, 15, 8)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, name = EXCLUDED.name;

INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_available, preparation_time, display_order)
VALUES ('00000000-0000-4000-7777-000000000019', '00000000-0000-4000-9999-000000000002', '22222222-2222-2222-2222-222222222222', 'Sua Dau Nanh', 'Delicious Sua Dau Nanh prepared fresh.', 78000, 'https://picsum.photos/seed/00000000-0000-4000-7777-000000000019/300/300', true, 15, 9)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, name = EXCLUDED.name;

INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_available, preparation_time, display_order)
VALUES ('00000000-0000-4000-7777-000000000020', '00000000-0000-4000-9999-000000000002', '11111111-1111-1111-1111-111111111111', 'Goi Cuon', 'Delicious Goi Cuon prepared fresh.', 124000, 'https://picsum.photos/seed/00000000-0000-4000-7777-000000000020/300/300', true, 15, 10)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, name = EXCLUDED.name;

INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_available, preparation_time, display_order)
VALUES ('00000000-0000-4000-7777-000000000021', '00000000-0000-4000-9999-000000000003', '33333333-3333-3333-3333-333333333333', 'Bun Cha Ca Dac Biet', 'Delicious Bun Cha Ca Dac Biet prepared fresh.', 92000, 'https://picsum.photos/seed/00000000-0000-4000-7777-000000000021/300/300', true, 15, 1)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, name = EXCLUDED.name;

INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_available, preparation_time, display_order)
VALUES ('00000000-0000-4000-7777-000000000022', '00000000-0000-4000-9999-000000000003', '44444444-4444-4444-4444-444444444444', 'Bun Rieu Cua', 'Delicious Bun Rieu Cua prepared fresh.', 50000, 'https://picsum.photos/seed/00000000-0000-4000-7777-000000000022/300/300', true, 15, 2)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, name = EXCLUDED.name;

INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_available, preparation_time, display_order)
VALUES ('00000000-0000-4000-7777-000000000023', '00000000-0000-4000-9999-000000000003', '55555555-5555-5555-5555-555555555555', 'Bun Cha Ca Nho', 'Delicious Bun Cha Ca Nho prepared fresh.', 99000, 'https://picsum.photos/seed/00000000-0000-4000-7777-000000000023/300/300', true, 15, 3)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, name = EXCLUDED.name;

INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_available, preparation_time, display_order)
VALUES ('00000000-0000-4000-7777-000000000024', '00000000-0000-4000-9999-000000000003', '44444444-4444-4444-4444-444444444444', 'Cha Ca Them', 'Delicious Cha Ca Them prepared fresh.', 117000, 'https://picsum.photos/seed/00000000-0000-4000-7777-000000000024/300/300', true, 15, 4)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, name = EXCLUDED.name;

INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_available, preparation_time, display_order)
VALUES ('00000000-0000-4000-7777-000000000025', '00000000-0000-4000-9999-000000000003', '11111111-1111-1111-1111-111111111111', 'Sua Bap', 'Delicious Sua Bap prepared fresh.', 74000, 'https://picsum.photos/seed/00000000-0000-4000-7777-000000000025/300/300', true, 15, 5)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, name = EXCLUDED.name;

INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_available, preparation_time, display_order)
VALUES ('00000000-0000-4000-7777-000000000026', '00000000-0000-4000-9999-000000000003', '44444444-4444-4444-4444-444444444444', 'Sua Hat Sen', 'Delicious Sua Hat Sen prepared fresh.', 114000, 'https://picsum.photos/seed/00000000-0000-4000-7777-000000000026/300/300', true, 15, 6)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, name = EXCLUDED.name;

INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_available, preparation_time, display_order)
VALUES ('00000000-0000-4000-7777-000000000027', '00000000-0000-4000-9999-000000000003', '44444444-4444-4444-4444-444444444444', 'Sua Dau Xanh', 'Delicious Sua Dau Xanh prepared fresh.', 120000, 'https://picsum.photos/seed/00000000-0000-4000-7777-000000000027/300/300', true, 15, 7)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, name = EXCLUDED.name;

INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_available, preparation_time, display_order)
VALUES ('00000000-0000-4000-7777-000000000028', '00000000-0000-4000-9999-000000000003', '33333333-3333-3333-3333-333333333333', 'Nuoc Ep Cam', 'Delicious Nuoc Ep Cam prepared fresh.', 85000, 'https://picsum.photos/seed/00000000-0000-4000-7777-000000000028/300/300', true, 15, 8)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, name = EXCLUDED.name;

INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_available, preparation_time, display_order)
VALUES ('00000000-0000-4000-7777-000000000029', '00000000-0000-4000-9999-000000000003', '44444444-4444-4444-4444-444444444444', 'Tra Chanh', 'Delicious Tra Chanh prepared fresh.', 34000, 'https://picsum.photos/seed/00000000-0000-4000-7777-000000000029/300/300', true, 15, 9)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, name = EXCLUDED.name;

INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_available, preparation_time, display_order)
VALUES ('00000000-0000-4000-7777-000000000030', '00000000-0000-4000-9999-000000000003', '11111111-1111-1111-1111-111111111111', 'Tra Dao', 'Delicious Tra Dao prepared fresh.', 85000, 'https://picsum.photos/seed/00000000-0000-4000-7777-000000000030/300/300', true, 15, 10)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, name = EXCLUDED.name;

INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_available, preparation_time, display_order)
VALUES ('00000000-0000-4000-7777-000000000031', '00000000-0000-4000-9999-000000000004', '22222222-2222-2222-2222-222222222222', 'Muc Hap Hanh', 'Delicious Muc Hap Hanh prepared fresh.', 111000, 'https://picsum.photos/seed/00000000-0000-4000-7777-000000000031/300/300', true, 15, 1)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, name = EXCLUDED.name;

INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_available, preparation_time, display_order)
VALUES ('00000000-0000-4000-7777-000000000032', '00000000-0000-4000-9999-000000000004', '22222222-2222-2222-2222-222222222222', 'Tom Hum Nuong', 'Delicious Tom Hum Nuong prepared fresh.', 93000, 'https://picsum.photos/seed/00000000-0000-4000-7777-000000000032/300/300', true, 15, 2)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, name = EXCLUDED.name;

INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_available, preparation_time, display_order)
VALUES ('00000000-0000-4000-7777-000000000033', '00000000-0000-4000-9999-000000000004', '33333333-3333-3333-3333-333333333333', 'Ngao Hap Thai', 'Delicious Ngao Hap Thai prepared fresh.', 121000, 'https://picsum.photos/seed/00000000-0000-4000-7777-000000000033/300/300', true, 15, 3)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, name = EXCLUDED.name;

INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_available, preparation_time, display_order)
VALUES ('00000000-0000-4000-7777-000000000034', '00000000-0000-4000-9999-000000000004', '44444444-4444-4444-4444-444444444444', 'Chip Chip Hap', 'Delicious Chip Chip Hap prepared fresh.', 52000, 'https://picsum.photos/seed/00000000-0000-4000-7777-000000000034/300/300', true, 15, 4)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, name = EXCLUDED.name;

INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_available, preparation_time, display_order)
VALUES ('00000000-0000-4000-7777-000000000035', '00000000-0000-4000-9999-000000000004', '44444444-4444-4444-4444-444444444444', 'Oc Huong Rang Muoi', 'Delicious Oc Huong Rang Muoi prepared fresh.', 113000, 'https://picsum.photos/seed/00000000-0000-4000-7777-000000000035/300/300', true, 15, 5)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, name = EXCLUDED.name;

INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_available, preparation_time, display_order)
VALUES ('00000000-0000-4000-7777-000000000036', '00000000-0000-4000-9999-000000000004', '33333333-3333-3333-3333-333333333333', 'Cua Rang Me', 'Delicious Cua Rang Me prepared fresh.', 56000, 'https://picsum.photos/seed/00000000-0000-4000-7777-000000000036/300/300', true, 15, 6)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, name = EXCLUDED.name;

INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_available, preparation_time, display_order)
VALUES ('00000000-0000-4000-7777-000000000037', '00000000-0000-4000-9999-000000000004', '44444444-4444-4444-4444-444444444444', 'Ca Mu Hap Xi Dau', 'Delicious Ca Mu Hap Xi Dau prepared fresh.', 51000, 'https://picsum.photos/seed/00000000-0000-4000-7777-000000000037/300/300', true, 15, 7)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, name = EXCLUDED.name;

INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_available, preparation_time, display_order)
VALUES ('00000000-0000-4000-7777-000000000038', '00000000-0000-4000-9999-000000000004', '33333333-3333-3333-3333-333333333333', 'Lau Hai San', 'Delicious Lau Hai San prepared fresh.', 51000, 'https://picsum.photos/seed/00000000-0000-4000-7777-000000000038/300/300', true, 15, 8)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, name = EXCLUDED.name;

INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_available, preparation_time, display_order)
VALUES ('00000000-0000-4000-7777-000000000039', '00000000-0000-4000-9999-000000000004', '33333333-3333-3333-3333-333333333333', 'Salad Rong Bien', 'Delicious Salad Rong Bien prepared fresh.', 119000, 'https://picsum.photos/seed/00000000-0000-4000-7777-000000000039/300/300', true, 15, 9)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, name = EXCLUDED.name;

INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_available, preparation_time, display_order)
VALUES ('00000000-0000-4000-7777-000000000040', '00000000-0000-4000-9999-000000000004', '22222222-2222-2222-2222-222222222222', 'Soju', 'Delicious Soju prepared fresh.', 61000, 'https://picsum.photos/seed/00000000-0000-4000-7777-000000000040/300/300', true, 15, 10)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, name = EXCLUDED.name;

INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_available, preparation_time, display_order)
VALUES ('00000000-0000-4000-7777-000000000041', '00000000-0000-4000-9999-000000000005', '55555555-5555-5555-5555-555555555555', 'Mi Quang Ga', 'Delicious Mi Quang Ga prepared fresh.', 66000, 'https://picsum.photos/seed/00000000-0000-4000-7777-000000000041/300/300', true, 15, 1)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, name = EXCLUDED.name;

INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_available, preparation_time, display_order)
VALUES ('00000000-0000-4000-7777-000000000042', '00000000-0000-4000-9999-000000000005', '55555555-5555-5555-5555-555555555555', 'Mi Quang Ech', 'Delicious Mi Quang Ech prepared fresh.', 87000, 'https://picsum.photos/seed/00000000-0000-4000-7777-000000000042/300/300', true, 15, 2)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, name = EXCLUDED.name;

INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_available, preparation_time, display_order)
VALUES ('00000000-0000-4000-7777-000000000043', '00000000-0000-4000-9999-000000000005', '44444444-4444-4444-4444-444444444444', 'Mi Quang Tom Thit', 'Delicious Mi Quang Tom Thit prepared fresh.', 96000, 'https://picsum.photos/seed/00000000-0000-4000-7777-000000000043/300/300', true, 15, 3)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, name = EXCLUDED.name;

INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_available, preparation_time, display_order)
VALUES ('00000000-0000-4000-7777-000000000044', '00000000-0000-4000-9999-000000000005', '33333333-3333-3333-3333-333333333333', 'Mi Quang Dac Biet', 'Delicious Mi Quang Dac Biet prepared fresh.', 58000, 'https://picsum.photos/seed/00000000-0000-4000-7777-000000000044/300/300', true, 15, 4)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, name = EXCLUDED.name;

INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_available, preparation_time, display_order)
VALUES ('00000000-0000-4000-7777-000000000045', '00000000-0000-4000-9999-000000000005', '44444444-4444-4444-4444-444444444444', 'Banh Trang Nuong', 'Delicious Banh Trang Nuong prepared fresh.', 113000, 'https://picsum.photos/seed/00000000-0000-4000-7777-000000000045/300/300', true, 15, 5)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, name = EXCLUDED.name;

INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_available, preparation_time, display_order)
VALUES ('00000000-0000-4000-7777-000000000046', '00000000-0000-4000-9999-000000000005', '22222222-2222-2222-2222-222222222222', 'Sua Bap', 'Delicious Sua Bap prepared fresh.', 43000, 'https://picsum.photos/seed/00000000-0000-4000-7777-000000000046/300/300', true, 15, 6)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, name = EXCLUDED.name;

INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_available, preparation_time, display_order)
VALUES ('00000000-0000-4000-7777-000000000047', '00000000-0000-4000-9999-000000000005', '22222222-2222-2222-2222-222222222222', 'Tra Da', 'Delicious Tra Da prepared fresh.', 128000, 'https://picsum.photos/seed/00000000-0000-4000-7777-000000000047/300/300', true, 15, 7)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, name = EXCLUDED.name;

INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_available, preparation_time, display_order)
VALUES ('00000000-0000-4000-7777-000000000048', '00000000-0000-4000-9999-000000000005', '22222222-2222-2222-2222-222222222222', 'Tra Tac', 'Delicious Tra Tac prepared fresh.', 115000, 'https://picsum.photos/seed/00000000-0000-4000-7777-000000000048/300/300', true, 15, 8)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, name = EXCLUDED.name;

INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_available, preparation_time, display_order)
VALUES ('00000000-0000-4000-7777-000000000049', '00000000-0000-4000-9999-000000000005', '22222222-2222-2222-2222-222222222222', 'Ram Cuon', 'Delicious Ram Cuon prepared fresh.', 44000, 'https://picsum.photos/seed/00000000-0000-4000-7777-000000000049/300/300', true, 15, 9)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, name = EXCLUDED.name;

INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_available, preparation_time, display_order)
VALUES ('00000000-0000-4000-7777-000000000050', '00000000-0000-4000-9999-000000000005', '33333333-3333-3333-3333-333333333333', 'Banh Beo', 'Delicious Banh Beo prepared fresh.', 94000, 'https://picsum.photos/seed/00000000-0000-4000-7777-000000000050/300/300', true, 15, 10)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, name = EXCLUDED.name;

INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_available, preparation_time, display_order)
VALUES ('00000000-0000-4000-7777-000000000051', '00000000-0000-4000-9999-000000000006', '55555555-5555-5555-5555-555555555555', 'Banh Xeo Dac Biet', 'Delicious Banh Xeo Dac Biet prepared fresh.', 67000, 'https://picsum.photos/seed/00000000-0000-4000-7777-000000000051/300/300', true, 15, 1)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, name = EXCLUDED.name;

INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_available, preparation_time, display_order)
VALUES ('00000000-0000-4000-7777-000000000052', '00000000-0000-4000-9999-000000000006', '44444444-4444-4444-4444-444444444444', 'Nem Lui', 'Delicious Nem Lui prepared fresh.', 116000, 'https://picsum.photos/seed/00000000-0000-4000-7777-000000000052/300/300', true, 15, 2)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, name = EXCLUDED.name;

INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_available, preparation_time, display_order)
VALUES ('00000000-0000-4000-7777-000000000053', '00000000-0000-4000-9999-000000000006', '11111111-1111-1111-1111-111111111111', 'Thit Nuong', 'Delicious Thit Nuong prepared fresh.', 32000, 'https://picsum.photos/seed/00000000-0000-4000-7777-000000000053/300/300', true, 15, 3)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, name = EXCLUDED.name;

INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_available, preparation_time, display_order)
VALUES ('00000000-0000-4000-7777-000000000054', '00000000-0000-4000-9999-000000000006', '33333333-3333-3333-3333-333333333333', 'Bun Thit Nuong', 'Delicious Bun Thit Nuong prepared fresh.', 95000, 'https://picsum.photos/seed/00000000-0000-4000-7777-000000000054/300/300', true, 15, 4)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, name = EXCLUDED.name;

INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_available, preparation_time, display_order)
VALUES ('00000000-0000-4000-7777-000000000055', '00000000-0000-4000-9999-000000000006', '11111111-1111-1111-1111-111111111111', 'Tra Da', 'Delicious Tra Da prepared fresh.', 105000, 'https://picsum.photos/seed/00000000-0000-4000-7777-000000000055/300/300', true, 15, 5)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, name = EXCLUDED.name;

INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_available, preparation_time, display_order)
VALUES ('00000000-0000-4000-7777-000000000056', '00000000-0000-4000-9999-000000000006', '55555555-5555-5555-5555-555555555555', 'Nuoc Mia', 'Delicious Nuoc Mia prepared fresh.', 104000, 'https://picsum.photos/seed/00000000-0000-4000-7777-000000000056/300/300', true, 15, 6)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, name = EXCLUDED.name;

INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_available, preparation_time, display_order)
VALUES ('00000000-0000-4000-7777-000000000057', '00000000-0000-4000-9999-000000000006', '11111111-1111-1111-1111-111111111111', 'Banh Khoai', 'Delicious Banh Khoai prepared fresh.', 99000, 'https://picsum.photos/seed/00000000-0000-4000-7777-000000000057/300/300', true, 15, 7)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, name = EXCLUDED.name;

INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_available, preparation_time, display_order)
VALUES ('00000000-0000-4000-7777-000000000058', '00000000-0000-4000-9999-000000000006', '33333333-3333-3333-3333-333333333333', 'Banh Cuon', 'Delicious Banh Cuon prepared fresh.', 68000, 'https://picsum.photos/seed/00000000-0000-4000-7777-000000000058/300/300', true, 15, 8)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, name = EXCLUDED.name;

INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_available, preparation_time, display_order)
VALUES ('00000000-0000-4000-7777-000000000059', '00000000-0000-4000-9999-000000000006', '44444444-4444-4444-4444-444444444444', 'Sua Dau Nanh', 'Delicious Sua Dau Nanh prepared fresh.', 58000, 'https://picsum.photos/seed/00000000-0000-4000-7777-000000000059/300/300', true, 15, 9)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, name = EXCLUDED.name;

INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_available, preparation_time, display_order)
VALUES ('00000000-0000-4000-7777-000000000060', '00000000-0000-4000-9999-000000000006', '22222222-2222-2222-2222-222222222222', 'Goi Cuon', 'Delicious Goi Cuon prepared fresh.', 101000, 'https://picsum.photos/seed/00000000-0000-4000-7777-000000000060/300/300', true, 15, 10)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, name = EXCLUDED.name;

INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_available, preparation_time, display_order)
VALUES ('00000000-0000-4000-7777-000000000061', '00000000-0000-4000-9999-000000000007', '11111111-1111-1111-1111-111111111111', 'Bun Cha Ca Dac Biet', 'Delicious Bun Cha Ca Dac Biet prepared fresh.', 98000, 'https://picsum.photos/seed/00000000-0000-4000-7777-000000000061/300/300', true, 15, 1)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, name = EXCLUDED.name;

INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_available, preparation_time, display_order)
VALUES ('00000000-0000-4000-7777-000000000062', '00000000-0000-4000-9999-000000000007', '33333333-3333-3333-3333-333333333333', 'Bun Rieu Cua', 'Delicious Bun Rieu Cua prepared fresh.', 86000, 'https://picsum.photos/seed/00000000-0000-4000-7777-000000000062/300/300', true, 15, 2)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, name = EXCLUDED.name;

INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_available, preparation_time, display_order)
VALUES ('00000000-0000-4000-7777-000000000063', '00000000-0000-4000-9999-000000000007', '11111111-1111-1111-1111-111111111111', 'Bun Cha Ca Nho', 'Delicious Bun Cha Ca Nho prepared fresh.', 123000, 'https://picsum.photos/seed/00000000-0000-4000-7777-000000000063/300/300', true, 15, 3)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, name = EXCLUDED.name;

INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_available, preparation_time, display_order)
VALUES ('00000000-0000-4000-7777-000000000064', '00000000-0000-4000-9999-000000000007', '44444444-4444-4444-4444-444444444444', 'Cha Ca Them', 'Delicious Cha Ca Them prepared fresh.', 54000, 'https://picsum.photos/seed/00000000-0000-4000-7777-000000000064/300/300', true, 15, 4)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, name = EXCLUDED.name;

INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_available, preparation_time, display_order)
VALUES ('00000000-0000-4000-7777-000000000065', '00000000-0000-4000-9999-000000000007', '33333333-3333-3333-3333-333333333333', 'Sua Bap', 'Delicious Sua Bap prepared fresh.', 42000, 'https://picsum.photos/seed/00000000-0000-4000-7777-000000000065/300/300', true, 15, 5)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, name = EXCLUDED.name;

INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_available, preparation_time, display_order)
VALUES ('00000000-0000-4000-7777-000000000066', '00000000-0000-4000-9999-000000000007', '22222222-2222-2222-2222-222222222222', 'Sua Hat Sen', 'Delicious Sua Hat Sen prepared fresh.', 44000, 'https://picsum.photos/seed/00000000-0000-4000-7777-000000000066/300/300', true, 15, 6)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, name = EXCLUDED.name;

INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_available, preparation_time, display_order)
VALUES ('00000000-0000-4000-7777-000000000067', '00000000-0000-4000-9999-000000000007', '11111111-1111-1111-1111-111111111111', 'Sua Dau Xanh', 'Delicious Sua Dau Xanh prepared fresh.', 109000, 'https://picsum.photos/seed/00000000-0000-4000-7777-000000000067/300/300', true, 15, 7)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, name = EXCLUDED.name;

INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_available, preparation_time, display_order)
VALUES ('00000000-0000-4000-7777-000000000068', '00000000-0000-4000-9999-000000000007', '33333333-3333-3333-3333-333333333333', 'Nuoc Ep Cam', 'Delicious Nuoc Ep Cam prepared fresh.', 96000, 'https://picsum.photos/seed/00000000-0000-4000-7777-000000000068/300/300', true, 15, 8)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, name = EXCLUDED.name;

INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_available, preparation_time, display_order)
VALUES ('00000000-0000-4000-7777-000000000069', '00000000-0000-4000-9999-000000000007', '11111111-1111-1111-1111-111111111111', 'Tra Chanh', 'Delicious Tra Chanh prepared fresh.', 65000, 'https://picsum.photos/seed/00000000-0000-4000-7777-000000000069/300/300', true, 15, 9)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, name = EXCLUDED.name;

INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_available, preparation_time, display_order)
VALUES ('00000000-0000-4000-7777-000000000070', '00000000-0000-4000-9999-000000000007', '22222222-2222-2222-2222-222222222222', 'Tra Dao', 'Delicious Tra Dao prepared fresh.', 101000, 'https://picsum.photos/seed/00000000-0000-4000-7777-000000000070/300/300', true, 15, 10)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, name = EXCLUDED.name;

INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_available, preparation_time, display_order)
VALUES ('00000000-0000-4000-7777-000000000071', '00000000-0000-4000-9999-000000000008', '33333333-3333-3333-3333-333333333333', 'Muc Hap Hanh', 'Delicious Muc Hap Hanh prepared fresh.', 34000, 'https://picsum.photos/seed/00000000-0000-4000-7777-000000000071/300/300', true, 15, 1)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, name = EXCLUDED.name;

INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_available, preparation_time, display_order)
VALUES ('00000000-0000-4000-7777-000000000072', '00000000-0000-4000-9999-000000000008', '44444444-4444-4444-4444-444444444444', 'Tom Hum Nuong', 'Delicious Tom Hum Nuong prepared fresh.', 97000, 'https://picsum.photos/seed/00000000-0000-4000-7777-000000000072/300/300', true, 15, 2)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, name = EXCLUDED.name;

INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_available, preparation_time, display_order)
VALUES ('00000000-0000-4000-7777-000000000073', '00000000-0000-4000-9999-000000000008', '11111111-1111-1111-1111-111111111111', 'Ngao Hap Thai', 'Delicious Ngao Hap Thai prepared fresh.', 73000, 'https://picsum.photos/seed/00000000-0000-4000-7777-000000000073/300/300', true, 15, 3)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, name = EXCLUDED.name;

INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_available, preparation_time, display_order)
VALUES ('00000000-0000-4000-7777-000000000074', '00000000-0000-4000-9999-000000000008', '11111111-1111-1111-1111-111111111111', 'Chip Chip Hap', 'Delicious Chip Chip Hap prepared fresh.', 56000, 'https://picsum.photos/seed/00000000-0000-4000-7777-000000000074/300/300', true, 15, 4)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, name = EXCLUDED.name;

INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_available, preparation_time, display_order)
VALUES ('00000000-0000-4000-7777-000000000075', '00000000-0000-4000-9999-000000000008', '33333333-3333-3333-3333-333333333333', 'Oc Huong Rang Muoi', 'Delicious Oc Huong Rang Muoi prepared fresh.', 120000, 'https://picsum.photos/seed/00000000-0000-4000-7777-000000000075/300/300', true, 15, 5)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, name = EXCLUDED.name;

INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_available, preparation_time, display_order)
VALUES ('00000000-0000-4000-7777-000000000076', '00000000-0000-4000-9999-000000000008', '33333333-3333-3333-3333-333333333333', 'Cua Rang Me', 'Delicious Cua Rang Me prepared fresh.', 77000, 'https://picsum.photos/seed/00000000-0000-4000-7777-000000000076/300/300', true, 15, 6)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, name = EXCLUDED.name;

INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_available, preparation_time, display_order)
VALUES ('00000000-0000-4000-7777-000000000077', '00000000-0000-4000-9999-000000000008', '33333333-3333-3333-3333-333333333333', 'Ca Mu Hap Xi Dau', 'Delicious Ca Mu Hap Xi Dau prepared fresh.', 56000, 'https://picsum.photos/seed/00000000-0000-4000-7777-000000000077/300/300', true, 15, 7)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, name = EXCLUDED.name;

INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_available, preparation_time, display_order)
VALUES ('00000000-0000-4000-7777-000000000078', '00000000-0000-4000-9999-000000000008', '44444444-4444-4444-4444-444444444444', 'Lau Hai San', 'Delicious Lau Hai San prepared fresh.', 85000, 'https://picsum.photos/seed/00000000-0000-4000-7777-000000000078/300/300', true, 15, 8)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, name = EXCLUDED.name;

INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_available, preparation_time, display_order)
VALUES ('00000000-0000-4000-7777-000000000079', '00000000-0000-4000-9999-000000000008', '22222222-2222-2222-2222-222222222222', 'Salad Rong Bien', 'Delicious Salad Rong Bien prepared fresh.', 112000, 'https://picsum.photos/seed/00000000-0000-4000-7777-000000000079/300/300', true, 15, 9)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, name = EXCLUDED.name;

INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_available, preparation_time, display_order)
VALUES ('00000000-0000-4000-7777-000000000080', '00000000-0000-4000-9999-000000000008', '22222222-2222-2222-2222-222222222222', 'Soju', 'Delicious Soju prepared fresh.', 66000, 'https://picsum.photos/seed/00000000-0000-4000-7777-000000000080/300/300', true, 15, 10)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, name = EXCLUDED.name;

INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_available, preparation_time, display_order)
VALUES ('00000000-0000-4000-7777-000000000081', '00000000-0000-4000-9999-000000000009', '11111111-1111-1111-1111-111111111111', 'Mi Quang Ga', 'Delicious Mi Quang Ga prepared fresh.', 91000, 'https://picsum.photos/seed/00000000-0000-4000-7777-000000000081/300/300', true, 15, 1)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, name = EXCLUDED.name;

INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_available, preparation_time, display_order)
VALUES ('00000000-0000-4000-7777-000000000082', '00000000-0000-4000-9999-000000000009', '55555555-5555-5555-5555-555555555555', 'Mi Quang Ech', 'Delicious Mi Quang Ech prepared fresh.', 56000, 'https://picsum.photos/seed/00000000-0000-4000-7777-000000000082/300/300', true, 15, 2)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, name = EXCLUDED.name;

INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_available, preparation_time, display_order)
VALUES ('00000000-0000-4000-7777-000000000083', '00000000-0000-4000-9999-000000000009', '33333333-3333-3333-3333-333333333333', 'Mi Quang Tom Thit', 'Delicious Mi Quang Tom Thit prepared fresh.', 88000, 'https://picsum.photos/seed/00000000-0000-4000-7777-000000000083/300/300', true, 15, 3)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, name = EXCLUDED.name;

INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_available, preparation_time, display_order)
VALUES ('00000000-0000-4000-7777-000000000084', '00000000-0000-4000-9999-000000000009', '11111111-1111-1111-1111-111111111111', 'Mi Quang Dac Biet', 'Delicious Mi Quang Dac Biet prepared fresh.', 87000, 'https://picsum.photos/seed/00000000-0000-4000-7777-000000000084/300/300', true, 15, 4)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, name = EXCLUDED.name;

INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_available, preparation_time, display_order)
VALUES ('00000000-0000-4000-7777-000000000085', '00000000-0000-4000-9999-000000000009', '33333333-3333-3333-3333-333333333333', 'Banh Trang Nuong', 'Delicious Banh Trang Nuong prepared fresh.', 61000, 'https://picsum.photos/seed/00000000-0000-4000-7777-000000000085/300/300', true, 15, 5)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, name = EXCLUDED.name;

INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_available, preparation_time, display_order)
VALUES ('00000000-0000-4000-7777-000000000086', '00000000-0000-4000-9999-000000000009', '55555555-5555-5555-5555-555555555555', 'Sua Bap', 'Delicious Sua Bap prepared fresh.', 38000, 'https://picsum.photos/seed/00000000-0000-4000-7777-000000000086/300/300', true, 15, 6)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, name = EXCLUDED.name;

INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_available, preparation_time, display_order)
VALUES ('00000000-0000-4000-7777-000000000087', '00000000-0000-4000-9999-000000000009', '33333333-3333-3333-3333-333333333333', 'Tra Da', 'Delicious Tra Da prepared fresh.', 120000, 'https://picsum.photos/seed/00000000-0000-4000-7777-000000000087/300/300', true, 15, 7)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, name = EXCLUDED.name;

INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_available, preparation_time, display_order)
VALUES ('00000000-0000-4000-7777-000000000088', '00000000-0000-4000-9999-000000000009', '44444444-4444-4444-4444-444444444444', 'Tra Tac', 'Delicious Tra Tac prepared fresh.', 70000, 'https://picsum.photos/seed/00000000-0000-4000-7777-000000000088/300/300', true, 15, 8)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, name = EXCLUDED.name;

INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_available, preparation_time, display_order)
VALUES ('00000000-0000-4000-7777-000000000089', '00000000-0000-4000-9999-000000000009', '11111111-1111-1111-1111-111111111111', 'Ram Cuon', 'Delicious Ram Cuon prepared fresh.', 121000, 'https://picsum.photos/seed/00000000-0000-4000-7777-000000000089/300/300', true, 15, 9)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, name = EXCLUDED.name;

INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_available, preparation_time, display_order)
VALUES ('00000000-0000-4000-7777-000000000090', '00000000-0000-4000-9999-000000000009', '22222222-2222-2222-2222-222222222222', 'Banh Beo', 'Delicious Banh Beo prepared fresh.', 64000, 'https://picsum.photos/seed/00000000-0000-4000-7777-000000000090/300/300', true, 15, 10)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, name = EXCLUDED.name;

INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_available, preparation_time, display_order)
VALUES ('00000000-0000-4000-7777-000000000091', '00000000-0000-4000-9999-000000000010', '44444444-4444-4444-4444-444444444444', 'Banh Xeo Dac Biet', 'Delicious Banh Xeo Dac Biet prepared fresh.', 114000, 'https://picsum.photos/seed/00000000-0000-4000-7777-000000000091/300/300', true, 15, 1)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, name = EXCLUDED.name;

INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_available, preparation_time, display_order)
VALUES ('00000000-0000-4000-7777-000000000092', '00000000-0000-4000-9999-000000000010', '33333333-3333-3333-3333-333333333333', 'Nem Lui', 'Delicious Nem Lui prepared fresh.', 97000, 'https://picsum.photos/seed/00000000-0000-4000-7777-000000000092/300/300', true, 15, 2)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, name = EXCLUDED.name;

INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_available, preparation_time, display_order)
VALUES ('00000000-0000-4000-7777-000000000093', '00000000-0000-4000-9999-000000000010', '44444444-4444-4444-4444-444444444444', 'Thit Nuong', 'Delicious Thit Nuong prepared fresh.', 52000, 'https://picsum.photos/seed/00000000-0000-4000-7777-000000000093/300/300', true, 15, 3)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, name = EXCLUDED.name;

INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_available, preparation_time, display_order)
VALUES ('00000000-0000-4000-7777-000000000094', '00000000-0000-4000-9999-000000000010', '11111111-1111-1111-1111-111111111111', 'Bun Thit Nuong', 'Delicious Bun Thit Nuong prepared fresh.', 69000, 'https://picsum.photos/seed/00000000-0000-4000-7777-000000000094/300/300', true, 15, 4)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, name = EXCLUDED.name;

INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_available, preparation_time, display_order)
VALUES ('00000000-0000-4000-7777-000000000095', '00000000-0000-4000-9999-000000000010', '44444444-4444-4444-4444-444444444444', 'Tra Da', 'Delicious Tra Da prepared fresh.', 41000, 'https://picsum.photos/seed/00000000-0000-4000-7777-000000000095/300/300', true, 15, 5)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, name = EXCLUDED.name;

INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_available, preparation_time, display_order)
VALUES ('00000000-0000-4000-7777-000000000096', '00000000-0000-4000-9999-000000000010', '11111111-1111-1111-1111-111111111111', 'Nuoc Mia', 'Delicious Nuoc Mia prepared fresh.', 119000, 'https://picsum.photos/seed/00000000-0000-4000-7777-000000000096/300/300', true, 15, 6)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, name = EXCLUDED.name;

INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_available, preparation_time, display_order)
VALUES ('00000000-0000-4000-7777-000000000097', '00000000-0000-4000-9999-000000000010', '33333333-3333-3333-3333-333333333333', 'Banh Khoai', 'Delicious Banh Khoai prepared fresh.', 51000, 'https://picsum.photos/seed/00000000-0000-4000-7777-000000000097/300/300', true, 15, 7)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, name = EXCLUDED.name;

INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_available, preparation_time, display_order)
VALUES ('00000000-0000-4000-7777-000000000098', '00000000-0000-4000-9999-000000000010', '33333333-3333-3333-3333-333333333333', 'Banh Cuon', 'Delicious Banh Cuon prepared fresh.', 111000, 'https://picsum.photos/seed/00000000-0000-4000-7777-000000000098/300/300', true, 15, 8)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, name = EXCLUDED.name;

INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_available, preparation_time, display_order)
VALUES ('00000000-0000-4000-7777-000000000099', '00000000-0000-4000-9999-000000000010', '11111111-1111-1111-1111-111111111111', 'Sua Dau Nanh', 'Delicious Sua Dau Nanh prepared fresh.', 92000, 'https://picsum.photos/seed/00000000-0000-4000-7777-000000000099/300/300', true, 15, 9)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, name = EXCLUDED.name;

INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_available, preparation_time, display_order)
VALUES ('00000000-0000-4000-7777-000000000100', '00000000-0000-4000-9999-000000000010', '22222222-2222-2222-2222-222222222222', 'Goi Cuon', 'Delicious Goi Cuon prepared fresh.', 45000, 'https://picsum.photos/seed/00000000-0000-4000-7777-000000000100/300/300', true, 15, 10)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, name = EXCLUDED.name;

INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_available, preparation_time, display_order)
VALUES ('00000000-0000-4000-7777-000000000101', '00000000-0000-4000-9999-000000000011', '44444444-4444-4444-4444-444444444444', 'Bun Cha Ca Dac Biet', 'Delicious Bun Cha Ca Dac Biet prepared fresh.', 34000, 'https://picsum.photos/seed/00000000-0000-4000-7777-000000000101/300/300', true, 15, 1)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, name = EXCLUDED.name;

INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_available, preparation_time, display_order)
VALUES ('00000000-0000-4000-7777-000000000102', '00000000-0000-4000-9999-000000000011', '55555555-5555-5555-5555-555555555555', 'Bun Rieu Cua', 'Delicious Bun Rieu Cua prepared fresh.', 101000, 'https://picsum.photos/seed/00000000-0000-4000-7777-000000000102/300/300', true, 15, 2)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, name = EXCLUDED.name;

INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_available, preparation_time, display_order)
VALUES ('00000000-0000-4000-7777-000000000103', '00000000-0000-4000-9999-000000000011', '11111111-1111-1111-1111-111111111111', 'Bun Cha Ca Nho', 'Delicious Bun Cha Ca Nho prepared fresh.', 69000, 'https://picsum.photos/seed/00000000-0000-4000-7777-000000000103/300/300', true, 15, 3)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, name = EXCLUDED.name;

INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_available, preparation_time, display_order)
VALUES ('00000000-0000-4000-7777-000000000104', '00000000-0000-4000-9999-000000000011', '44444444-4444-4444-4444-444444444444', 'Cha Ca Them', 'Delicious Cha Ca Them prepared fresh.', 77000, 'https://picsum.photos/seed/00000000-0000-4000-7777-000000000104/300/300', true, 15, 4)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, name = EXCLUDED.name;

INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_available, preparation_time, display_order)
VALUES ('00000000-0000-4000-7777-000000000105', '00000000-0000-4000-9999-000000000011', '33333333-3333-3333-3333-333333333333', 'Sua Bap', 'Delicious Sua Bap prepared fresh.', 121000, 'https://picsum.photos/seed/00000000-0000-4000-7777-000000000105/300/300', true, 15, 5)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, name = EXCLUDED.name;

INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_available, preparation_time, display_order)
VALUES ('00000000-0000-4000-7777-000000000106', '00000000-0000-4000-9999-000000000011', '33333333-3333-3333-3333-333333333333', 'Sua Hat Sen', 'Delicious Sua Hat Sen prepared fresh.', 36000, 'https://picsum.photos/seed/00000000-0000-4000-7777-000000000106/300/300', true, 15, 6)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, name = EXCLUDED.name;

INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_available, preparation_time, display_order)
VALUES ('00000000-0000-4000-7777-000000000107', '00000000-0000-4000-9999-000000000011', '33333333-3333-3333-3333-333333333333', 'Sua Dau Xanh', 'Delicious Sua Dau Xanh prepared fresh.', 55000, 'https://picsum.photos/seed/00000000-0000-4000-7777-000000000107/300/300', true, 15, 7)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, name = EXCLUDED.name;

INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_available, preparation_time, display_order)
VALUES ('00000000-0000-4000-7777-000000000108', '00000000-0000-4000-9999-000000000011', '22222222-2222-2222-2222-222222222222', 'Nuoc Ep Cam', 'Delicious Nuoc Ep Cam prepared fresh.', 118000, 'https://picsum.photos/seed/00000000-0000-4000-7777-000000000108/300/300', true, 15, 8)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, name = EXCLUDED.name;

INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_available, preparation_time, display_order)
VALUES ('00000000-0000-4000-7777-000000000109', '00000000-0000-4000-9999-000000000011', '55555555-5555-5555-5555-555555555555', 'Tra Chanh', 'Delicious Tra Chanh prepared fresh.', 128000, 'https://picsum.photos/seed/00000000-0000-4000-7777-000000000109/300/300', true, 15, 9)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, name = EXCLUDED.name;

INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_available, preparation_time, display_order)
VALUES ('00000000-0000-4000-7777-000000000110', '00000000-0000-4000-9999-000000000011', '55555555-5555-5555-5555-555555555555', 'Tra Dao', 'Delicious Tra Dao prepared fresh.', 49000, 'https://picsum.photos/seed/00000000-0000-4000-7777-000000000110/300/300', true, 15, 10)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, name = EXCLUDED.name;

INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_available, preparation_time, display_order)
VALUES ('00000000-0000-4000-7777-000000000111', '00000000-0000-4000-9999-000000000012', '55555555-5555-5555-5555-555555555555', 'Muc Hap Hanh', 'Delicious Muc Hap Hanh prepared fresh.', 108000, 'https://picsum.photos/seed/00000000-0000-4000-7777-000000000111/300/300', true, 15, 1)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, name = EXCLUDED.name;

INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_available, preparation_time, display_order)
VALUES ('00000000-0000-4000-7777-000000000112', '00000000-0000-4000-9999-000000000012', '11111111-1111-1111-1111-111111111111', 'Tom Hum Nuong', 'Delicious Tom Hum Nuong prepared fresh.', 36000, 'https://picsum.photos/seed/00000000-0000-4000-7777-000000000112/300/300', true, 15, 2)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, name = EXCLUDED.name;

INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_available, preparation_time, display_order)
VALUES ('00000000-0000-4000-7777-000000000113', '00000000-0000-4000-9999-000000000012', '11111111-1111-1111-1111-111111111111', 'Ngao Hap Thai', 'Delicious Ngao Hap Thai prepared fresh.', 106000, 'https://picsum.photos/seed/00000000-0000-4000-7777-000000000113/300/300', true, 15, 3)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, name = EXCLUDED.name;

INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_available, preparation_time, display_order)
VALUES ('00000000-0000-4000-7777-000000000114', '00000000-0000-4000-9999-000000000012', '55555555-5555-5555-5555-555555555555', 'Chip Chip Hap', 'Delicious Chip Chip Hap prepared fresh.', 101000, 'https://picsum.photos/seed/00000000-0000-4000-7777-000000000114/300/300', true, 15, 4)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, name = EXCLUDED.name;

INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_available, preparation_time, display_order)
VALUES ('00000000-0000-4000-7777-000000000115', '00000000-0000-4000-9999-000000000012', '22222222-2222-2222-2222-222222222222', 'Oc Huong Rang Muoi', 'Delicious Oc Huong Rang Muoi prepared fresh.', 106000, 'https://picsum.photos/seed/00000000-0000-4000-7777-000000000115/300/300', true, 15, 5)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, name = EXCLUDED.name;

INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_available, preparation_time, display_order)
VALUES ('00000000-0000-4000-7777-000000000116', '00000000-0000-4000-9999-000000000012', '44444444-4444-4444-4444-444444444444', 'Cua Rang Me', 'Delicious Cua Rang Me prepared fresh.', 55000, 'https://picsum.photos/seed/00000000-0000-4000-7777-000000000116/300/300', true, 15, 6)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, name = EXCLUDED.name;

INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_available, preparation_time, display_order)
VALUES ('00000000-0000-4000-7777-000000000117', '00000000-0000-4000-9999-000000000012', '55555555-5555-5555-5555-555555555555', 'Ca Mu Hap Xi Dau', 'Delicious Ca Mu Hap Xi Dau prepared fresh.', 34000, 'https://picsum.photos/seed/00000000-0000-4000-7777-000000000117/300/300', true, 15, 7)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, name = EXCLUDED.name;

INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_available, preparation_time, display_order)
VALUES ('00000000-0000-4000-7777-000000000118', '00000000-0000-4000-9999-000000000012', '11111111-1111-1111-1111-111111111111', 'Lau Hai San', 'Delicious Lau Hai San prepared fresh.', 112000, 'https://picsum.photos/seed/00000000-0000-4000-7777-000000000118/300/300', true, 15, 8)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, name = EXCLUDED.name;

INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_available, preparation_time, display_order)
VALUES ('00000000-0000-4000-7777-000000000119', '00000000-0000-4000-9999-000000000012', '11111111-1111-1111-1111-111111111111', 'Salad Rong Bien', 'Delicious Salad Rong Bien prepared fresh.', 97000, 'https://picsum.photos/seed/00000000-0000-4000-7777-000000000119/300/300', true, 15, 9)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, name = EXCLUDED.name;

INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_available, preparation_time, display_order)
VALUES ('00000000-0000-4000-7777-000000000120', '00000000-0000-4000-9999-000000000012', '11111111-1111-1111-1111-111111111111', 'Soju', 'Delicious Soju prepared fresh.', 31000, 'https://picsum.photos/seed/00000000-0000-4000-7777-000000000120/300/300', true, 15, 10)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, name = EXCLUDED.name;


-- MERCHANT ACCOUNTS
INSERT INTO users (email, password, full_name, role) VALUES ('merchant_miquangbamua@foodiego.com', '$2b$10$rBV2JDeWW3.vKBBnpkVkpOUwG0Q2K6mOGpT0Gk5dRfBN/8kQR1.9a', 'Mi Quang Ba Mua Merchant', 'merchant') ON CONFLICT (email) DO NOTHING;
INSERT INTO users (email, password, full_name, role) VALUES ('merchant_banhxeobaduong@foodiego.com', '$2b$10$rBV2JDeWW3.vKBBnpkVkpOUwG0Q2K6mOGpT0Gk5dRfBN/8kQR1.9a', 'Banh Xeo Ba Duong Merchant', 'merchant') ON CONFLICT (email) DO NOTHING;
INSERT INTO users (email, password, full_name, role) VALUES ('merchant_bunchaca109@foodiego.com', '$2b$10$rBV2JDeWW3.vKBBnpkVkpOUwG0Q2K6mOGpT0Gk5dRfBN/8kQR1.9a', 'Bun Cha Ca 109 Merchant', 'merchant') ON CONFLICT (email) DO NOTHING;
INSERT INTO users (email, password, full_name, role) VALUES ('merchant_haisannamdanh@foodiego.com', '$2b$10$rBV2JDeWW3.vKBBnpkVkpOUwG0Q2K6mOGpT0Gk5dRfBN/8kQR1.9a', 'Hai San Nam Danh Merchant', 'merchant') ON CONFLICT (email) DO NOTHING;
INSERT INTO users (email, password, full_name, role) VALUES ('merchant_pizza4psindochina@foodiego.com', '$2b$10$rBV2JDeWW3.vKBBnpkVkpOUwG0Q2K6mOGpT0Gk5dRfBN/8kQR1.9a', 'Pizza 4P''s Indochina Merchant', 'merchant') ON CONFLICT (email) DO NOTHING;
INSERT INTO users (email, password, full_name, role) VALUES ('merchant_burgerbros@foodiego.com', '$2b$10$rBV2JDeWW3.vKBBnpkVkpOUwG0Q2K6mOGpT0Gk5dRfBN/8kQR1.9a', 'Burger Bros Merchant', 'merchant') ON CONFLICT (email) DO NOTHING;
INSERT INTO users (email, password, full_name, role) VALUES ('merchant_comgaahai@foodiego.com', '$2b$10$rBV2JDeWW3.vKBBnpkVkpOUwG0Q2K6mOGpT0Gk5dRfBN/8kQR1.9a', 'Com Ga A Hai Merchant', 'merchant') ON CONFLICT (email) DO NOTHING;
INSERT INTO users (email, password, full_name, role) VALUES ('merchant_quanbeman@foodiego.com', '$2b$10$rBV2JDeWW3.vKBBnpkVkpOUwG0Q2K6mOGpT0Gk5dRfBN/8kQR1.9a', 'Quan Be Man Merchant', 'merchant') ON CONFLICT (email) DO NOTHING;
INSERT INTO users (email, password, full_name, role) VALUES ('merchant_chelien@foodiego.com', '$2b$10$rBV2JDeWW3.vKBBnpkVkpOUwG0Q2K6mOGpT0Gk5dRfBN/8kQR1.9a', 'Che Lien Merchant', 'merchant') ON CONFLICT (email) DO NOTHING;
INSERT INTO users (email, password, full_name, role) VALUES ('merchant_bunbohuebathuong@foodiego.com', '$2b$10$rBV2JDeWW3.vKBBnpkVkpOUwG0Q2K6mOGpT0Gk5dRfBN/8kQR1.9a', 'Bun Bo Hue Ba Thuong Merchant', 'merchant') ON CONFLICT (email) DO NOTHING;
INSERT INTO users (email, password, full_name, role) VALUES ('merchant_myhanhseafood@foodiego.com', '$2b$10$rBV2JDeWW3.vKBBnpkVkpOUwG0Q2K6mOGpT0Gk5dRfBN/8kQR1.9a', 'My Hanh Seafood Merchant', 'merchant') ON CONFLICT (email) DO NOTHING;
INSERT INTO users (email, password, full_name, role) VALUES ('merchant_fatfishrestaurant@foodiego.com', '$2b$10$rBV2JDeWW3.vKBBnpkVkpOUwG0Q2K6mOGpT0Gk5dRfBN/8kQR1.9a', 'Fatfish Restaurant Merchant', 'merchant') ON CONFLICT (email) DO NOTHING;
INSERT INTO inventory_stock (stock_item_id, total_quantity, reserved_quantity) SELECT id::varchar, 100, 0 FROM menu_items ON CONFLICT DO NOTHING;
