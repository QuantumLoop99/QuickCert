/*
  # QuickCERT Database Schema

  1. New Tables
    - `districts` - Administrative districts
    - `ds_offices` - Divisional Secretariat offices
    - `gn_divisions` - Grama Niladhari divisions
    - `users` - System users (citizens, officers, admin)
    - `requests` - Certificate requests
    - `request_documents` - Document attachments for requests
    - `notifications` - System notifications

  2. Security
    - Enable RLS on all tables
    - Add policies for role-based access control
    - Secure user authentication and authorization

  3. Features
    - Complete administrative hierarchy (District -> DS -> GN)
    - Multi-role user system
    - Document management
    - Request tracking and status management
    - Notification system
*/

-- Create districts table
CREATE TABLE IF NOT EXISTS districts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  code text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);

-- Create DS offices table
CREATE TABLE IF NOT EXISTS ds_offices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  district_id uuid REFERENCES districts(id) ON DELETE CASCADE,
  name text NOT NULL,
  code text NOT NULL UNIQUE,
  address text,
  phone text,
  email text,
  created_at timestamptz DEFAULT now()
);

-- Create GN divisions table
CREATE TABLE IF NOT EXISTS gn_divisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ds_office_id uuid REFERENCES ds_offices(id) ON DELETE CASCADE,
  name text NOT NULL,
  code text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  full_name text NOT NULL,
  nic text UNIQUE,
  phone text,
  address text,
  user_type text NOT NULL CHECK (user_type IN ('citizen', 'gn_officer', 'ds_officer', 'admin')),
  gn_division_id uuid REFERENCES gn_divisions(id),
  ds_office_id uuid REFERENCES ds_offices(id),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create requests table
CREATE TABLE IF NOT EXISTS requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  request_type text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'gn_review', 'ds_review', 'approved', 'rejected', 'completed')),
  gn_division_id uuid REFERENCES gn_divisions(id),
  ds_office_id uuid REFERENCES ds_offices(id),
  request_data jsonb NOT NULL DEFAULT '{}',
  gn_officer_id uuid REFERENCES users(id),
  ds_officer_id uuid REFERENCES users(id),
  gn_reviewed_at timestamptz,
  ds_reviewed_at timestamptz,
  gn_comments text,
  ds_comments text,
  rejection_reason text,
  certificate_number text UNIQUE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create request documents table
CREATE TABLE IF NOT EXISTS request_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid REFERENCES requests(id) ON DELETE CASCADE,
  document_type text NOT NULL,
  file_name text NOT NULL,
  file_path text NOT NULL,
  file_size integer,
  mime_type text,
  uploaded_at timestamptz DEFAULT now()
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ds_offices ENABLE ROW LEVEL SECURITY;
ALTER TABLE gn_divisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE request_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for districts (public read access)
CREATE POLICY "Anyone can read districts"
  ON districts FOR SELECT
  TO authenticated, anon
  USING (true);

-- Create policies for ds_offices (public read access)
CREATE POLICY "Anyone can read DS offices"
  ON ds_offices FOR SELECT
  TO authenticated, anon
  USING (true);

-- Create policies for gn_divisions (public read access)
CREATE POLICY "Anyone can read GN divisions"
  ON gn_divisions FOR SELECT
  TO authenticated, anon
  USING (true);

-- Create policies for users
CREATE POLICY "Users can read own data"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = id::text);

-- Create policies for requests
CREATE POLICY "Users can read own requests"
  ON requests FOR SELECT
  TO authenticated
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can create own requests"
  ON requests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own requests"
  ON requests FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = user_id::text);

-- Create policies for request_documents
CREATE POLICY "Users can read own request documents"
  ON request_documents FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM requests 
    WHERE requests.id = request_documents.request_id 
    AND requests.user_id::text = auth.uid()::text
  ));

CREATE POLICY "Users can insert own request documents"
  ON request_documents FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM requests 
    WHERE requests.id = request_documents.request_id 
    AND requests.user_id::text = auth.uid()::text
  ));

-- Create policies for notifications
CREATE POLICY "Users can read own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = user_id::text);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ds_offices_district_id ON ds_offices(district_id);
CREATE INDEX IF NOT EXISTS idx_gn_divisions_ds_office_id ON gn_divisions(ds_office_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_nic ON users(nic);
CREATE INDEX IF NOT EXISTS idx_users_user_type ON users(user_type);
CREATE INDEX IF NOT EXISTS idx_requests_user_id ON requests(user_id);
CREATE INDEX IF NOT EXISTS idx_requests_status ON requests(status);
CREATE INDEX IF NOT EXISTS idx_requests_gn_division_id ON requests(gn_division_id);
CREATE INDEX IF NOT EXISTS idx_requests_ds_office_id ON requests(ds_office_id);
CREATE INDEX IF NOT EXISTS idx_request_documents_request_id ON request_documents(request_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);