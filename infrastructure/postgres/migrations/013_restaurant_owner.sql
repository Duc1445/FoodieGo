ALTER TABLE restaurants
ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS district VARCHAR(100),
ADD COLUMN IF NOT EXISTS ward VARCHAR(100);

-- Update seed data to give restaurants an owner_id so they show up properly if inner joined, 
-- but we are just selecting directly so it's fine.
-- Let's assign an owner_id to some restaurants just in case.
UPDATE restaurants 
SET owner_id = (SELECT id FROM users WHERE role = 'merchant' LIMIT 1),
    address = '123 Test Street',
    district = 'District 1',
    ward = 'Ben Nghe Ward',
    phone = '0123456789'
WHERE owner_id IS NULL;
