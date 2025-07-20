/*
  # Seed Initial Data for QuickCERT

  1. Administrative Data
    - Sample districts
    - DS offices
    - GN divisions

  2. Test Users
    - Admin user
    - Sample officers
    - Test citizen

  3. Sample Data
    - Test requests for demonstration
*/

-- Insert sample districts
INSERT INTO districts (name, code) VALUES
  ('Colombo', 'COL'),
  ('Gampaha', 'GAM'),
  ('Kalutara', 'KAL'),
  ('Kandy', 'KAN'),
  ('Matale', 'MAT')
ON CONFLICT (code) DO NOTHING;

-- Insert sample DS offices
INSERT INTO ds_offices (district_id, name, code, address, phone, email)
SELECT 
  d.id,
  office_data.name,
  office_data.code,
  office_data.address,
  office_data.phone,
  office_data.email
FROM districts d
CROSS JOIN (
  VALUES 
    ('Colombo', 'Colombo DS Office', 'COL_DS', '123 Main Street, Colombo', '+94112345678', 'colombo.ds@gov.lk'),
    ('Gampaha', 'Gampaha DS Office', 'GAM_DS', '456 Gampaha Road, Gampaha', '+94332345678', 'gampaha.ds@gov.lk'),
    ('Kalutara', 'Kalutara DS Office', 'KAL_DS', '789 Kalutara Street, Kalutara', '+94342345678', 'kalutara.ds@gov.lk'),
    ('Kandy', 'Kandy DS Office', 'KAN_DS', '321 Kandy Road, Kandy', '+94812345678', 'kandy.ds@gov.lk'),
    ('Matale', 'Matale DS Office', 'MAT_DS', '654 Matale Avenue, Matale', '+94662345678', 'matale.ds@gov.lk')
) AS office_data(district_name, name, code, address, phone, email)
WHERE d.name = office_data.district_name
ON CONFLICT (code) DO NOTHING;

-- Insert sample GN divisions
INSERT INTO gn_divisions (ds_office_id, name, code)
SELECT 
  ds.id,
  gn_data.name,
  gn_data.code
FROM ds_offices ds
CROSS JOIN (
  VALUES 
    ('COL_DS', 'Colombo 01', 'COL_01'),
    ('COL_DS', 'Colombo 02', 'COL_02'),
    ('GAM_DS', 'Gampaha Central', 'GAM_01'),
    ('GAM_DS', 'Gampaha East', 'GAM_02'),
    ('KAL_DS', 'Kalutara North', 'KAL_01'),
    ('KAN_DS', 'Kandy Central', 'KAN_01'),
    ('MAT_DS', 'Matale Town', 'MAT_01')
) AS gn_data(ds_code, name, code)
WHERE ds.code = gn_data.ds_code
ON CONFLICT (code) DO NOTHING;

-- Note: User data will be handled through Supabase Auth
-- The users table will be populated when users register through the application
-- Initial admin and test users should be created through the application's registration process