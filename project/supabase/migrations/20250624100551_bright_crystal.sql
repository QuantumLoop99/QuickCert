-- QuickCERT Database Schema
-- Run this script to create the complete database structure

CREATE DATABASE IF NOT EXISTS quickcert;
USE quickcert;

-- Districts table
CREATE TABLE districts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- DS Offices table
CREATE TABLE ds_offices (
    id INT PRIMARY KEY AUTO_INCREMENT,
    district_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (district_id) REFERENCES districts(id)
);

-- GN Divisions table
CREATE TABLE gn_divisions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    ds_office_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ds_office_id) REFERENCES ds_offices(id)
);

-- Users table
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_type ENUM('citizen', 'gn_officer', 'ds_officer', 'admin') NOT NULL,
    name VARCHAR(100) NOT NULL,
    title VARCHAR(50),
    nic VARCHAR(20),
    dob DATE,
    phone VARCHAR(15),
    address TEXT,
    employee_type ENUM('working', 'retired'),
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    district VARCHAR(100),
    ds_office VARCHAR(100),
    gn_division VARCHAR(100),
    auth_code VARCHAR(50),
    status ENUM('active', 'inactive', 'pending') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Requests table
CREATE TABLE requests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    request_type ENUM('working', 'retired') NOT NULL,
    reason TEXT,
    payment_ref VARCHAR(50),
    income_sources JSON,
    pension_type VARCHAR(100),
    retirement_date DATE,
    pension_number VARCHAR(50),
    worked_institute VARCHAR(100),
    status ENUM('submitted', 'under_gn_review', 'gn_approved', 'gn_rejected', 'under_ds_review', 'ds_approved', 'ds_rejected') DEFAULT 'submitted',
    review_comments TEXT,
    monthly_income_data JSON,
    document_path VARCHAR(255),
    reviewed_by INT,
    reviewed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (reviewed_by) REFERENCES users(id)
);

-- Feedback table
CREATE TABLE feedback (
    id INT PRIMARY KEY AUTO_INCREMENT,
    request_id INT NOT NULL,
    user_id INT NOT NULL,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    comments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (request_id) REFERENCES requests(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);