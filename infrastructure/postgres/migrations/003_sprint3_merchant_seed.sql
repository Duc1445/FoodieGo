-- Migration 003 Seed: Sprint 3 Merchant Portal Test Data

-- Insert a test merchant user
INSERT INTO users (id, email, password, full_name, phone, address, role, is_active)
VALUES ('c54ccd81-f944-40cb-a07d-add324dfa6d9', 'merchant@foodiego.com', '$2a$10$makpQ7Xi7O0muww1FQg70et0x0f48NFPvezD5wSAtY.7orYozsaEa', 'Test Merchant', '0987654321', '123 Merchant St', 'merchant', true)
ON CONFLICT (email) DO NOTHING;

-- Link the test merchant to an existing restaurant in the seed data
INSERT INTO user_restaurants (user_id, restaurant_id, role)
VALUES ('c54ccd81-f944-40cb-a07d-add324dfa6d9', '00000000-0000-4000-1111-000000000001', 'owner')
ON CONFLICT (user_id, restaurant_id) DO NOTHING;
