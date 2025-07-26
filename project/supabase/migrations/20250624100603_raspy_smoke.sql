-- QuickCERT Sample Data
-- Run this after schema.sql to populate with initial data

USE quickcert;

-- Insert Districts
INSERT INTO districts (name) VALUES 
('Colombo'), 
('Kandy'), 
('Galle'), 
('Matara'), 
('Kurunegala'),
('Anuradhapura'),
('Polonnaruwa'),
('Badulla'),
('Ratnapura'),
('Kegalle');

-- Insert DS Offices
INSERT INTO ds_offices (district_id, name) VALUES 
-- Colombo District
(1, 'Colombo DS Office'), 
(1, 'Homagama DS Office'),
(1, 'Kesbewa DS Office'),
(1, 'Moratuwa DS Office'),
-- Kandy District
(2, 'Kandy DS Office'), 
(2, 'Gampola DS Office'),
(2, 'Hatton DS Office'),
-- Galle District
(3, 'Galle DS Office'),
(3, 'Ambalangoda DS Office'),
-- Matara District
(4, 'Matara DS Office'),
(4, 'Weligama DS Office'),
-- Kurunegala District
(5, 'Kurunegala DS Office'),
(5, 'Kuliyapitiya DS Office'),
-- Other Districts
(6, 'Anuradhapura DS Office'),
(7, 'Polonnaruwa DS Office'),
(8, 'Badulla DS Office'),
(9, 'Ratnapura DS Office'),
(10, 'Kegalle DS Office');

-- Insert GN Divisions
INSERT INTO gn_divisions (ds_office_id, name) VALUES 
-- Colombo DS Office
(1, 'Colombo 01'), (1, 'Colombo 02'), (1, 'Colombo 03'), (1, 'Colombo 04'),
-- Homagama DS Office
(2, 'Homagama North'), (2, 'Homagama South'), (2, 'Homagama East'),
-- Kesbewa DS Office
(3, 'Kesbewa Central'), (3, 'Kesbewa North'),
-- Moratuwa DS Office
(4, 'Moratuwa Central'), (4, 'Moratuwa South'),
-- Kandy DS Office
(5, 'Kandy Central'), (5, 'Kandy East'), (5, 'Kandy West'),
-- Gampola DS Office
(6, 'Gampola North'), (6, 'Gampola South'),
-- Hatton DS Office
(7, 'Hatton Central'), (7, 'Hatton East'),
-- Galle DS Office
(8, 'Galle Central'), (8, 'Galle North'),
-- Ambalangoda DS Office
(9, 'Ambalangoda Central'), (9, 'Ambalangoda South'),
-- Matara DS Office
(10, 'Matara Central'), (10, 'Matara East'),
-- Weligama DS Office
(11, 'Weligama Central'), (11, 'Weligama North'),
-- Kurunegala DS Office
(12, 'Kurunegala Central'), (12, 'Kurunegala North'),
-- Kuliyapitiya DS Office
(13, 'Kuliyapitiya Central'), (13, 'Kuliyapitiya East'),
-- Other DS Offices
(14, 'Anuradhapura Central'),
(15, 'Polonnaruwa Central'),
(16, 'Badulla Central'),
(17, 'Ratnapura Central'),
(18, 'Kegalle Central');

-- Insert Admin User (password: admin123)
-- Password hash for 'admin123' using bcrypt
INSERT INTO users (user_type, name, email, password, status) 
VALUES ('admin', 'System Administrator', 'admin@quickcert.gov.lk', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'active');

-- Insert Sample Officer Users for Testing
-- GN Officer (password: gn123)
INSERT INTO users (user_type, name, email, password, phone, district, ds_office, gn_division, auth_code, status) 
VALUES ('gn_officer', 'Sunil Perera', 'gn.officer@quickcert.gov.lk', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '0771234567', '1', '1', '1', 'GN2024', 'active');

-- DS Officer (password: ds123)
INSERT INTO users (user_type, name, email, password, phone, district, ds_office, auth_code, status) 
VALUES ('ds_officer', 'Kamala Silva', 'ds.officer@quickcert.gov.lk', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '0771234568', '1', '1', 'DS2024', 'active');

-- Insert Sample Citizen for Testing (password: citizen123)
INSERT INTO users (user_type, name, title, nic, dob, phone, address, employee_type, email, password, district, ds_office, gn_division, status) 
VALUES ('citizen', 'Nimal Fernando', 'Mr', '199012345678', '1990-05-15', '0771234569', '123, Main Street, Colombo 01', 'working', 'citizen@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '1', '1', '1', 'active');