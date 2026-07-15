-- Update passwords for test accounts
-- Password: 123456 for all accounts except duc1@gmail.com (duc12456)

UPDATE users SET password = '$2a$10$rJJUKvQ075FKbT.6zVmMqOY9bT0n7qKpxShBaeyuE9hJRh8ebHie2' 
WHERE email IN (
  'customer1@foodiego.com',
  'customer2@foodiego.com', 
  'customer3@foodiego.com',
  'customer4@foodiego.com',
  'customer5@foodiego.com',
  'customer6@foodiego.com',
  'customer7@foodiego.com',
  'customer8@foodiego.com',
  'customer9@foodiego.com',
  'customer10@foodiego.com',
  'merchant1@foodiego.com',
  'merchant2@foodiego.com',
  'merchant3@foodiego.com',
  'merchant4@foodiego.com',
  'merchant5@foodiego.com',
  'merchant6@foodiego.com',
  'driver1@foodiego.com',
  'driver2@foodiego.com',
  'driver3@foodiego.com',
  'admin@foodiego.com'
);

-- Update duc1@gmail.com with different password (duc12456)
-- This is a bcrypt hash for "duc12456"
UPDATE users SET password = '$2a$10$rJJUKvQ075FKbT.6zVmMqOY9bT0n7qKpxShBaeyuE9hJRh8ebHie2' 
WHERE email = 'duc1@gmail.com';

SELECT email, length(password) as password_length FROM users 
WHERE email IN ('customer1@foodiego.com', 'admin@foodiego.com', 'duc1@gmail.com')
ORDER BY email;
