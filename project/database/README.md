# QuickCERT Database Setup Guide

## Prerequisites
- MySQL Server 8.0 or higher installed
- MySQL Workbench (optional, for GUI management)
- Node.js and npm installed

## Step-by-Step Setup

### 1. Install MySQL
**Windows:**
- Download MySQL Installer from https://dev.mysql.com/downloads/installer/
- Run installer and select "Developer Default"
- Set root password during installation

**macOS:**
- Install via Homebrew: `brew install mysql`
- Start MySQL: `brew services start mysql`
- Secure installation: `mysql_secure_installation`

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install mysql-server
sudo mysql_secure_installation
```

### 2. Access MySQL
```bash
# Connect to MySQL as root
mysql -u root -p
```

### 3. Create Database and User
```sql
-- Create database
CREATE DATABASE quickcert;

-- Create dedicated user (recommended for production)
CREATE USER 'quickcert_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON quickcert.* TO 'quickcert_user'@'localhost';
FLUSH PRIVILEGES;

-- Exit MySQL
EXIT;
```

### 4. Run Database Scripts
```bash
# Navigate to project directory
cd your-project-directory

# Run schema creation
mysql -u root -p quickcert < database/schema.sql

# Run sample data insertion
mysql -u root -p quickcert < database/seed.sql
```

### 5. Configure Environment Variables
```bash
# Copy example environment file
cp .env.example .env

# Edit .env file with your database credentials
nano .env
```

Update these values in `.env`:
```
DB_HOST=localhost
DB_USER=quickcert_user  # or root
DB_PASSWORD=your_mysql_password
DB_NAME=quickcert
```

### 6. Test Database Connection
```bash
# Install dependencies
npm install

# Test backend connection
npm run server
```

### 7. Verify Database Setup
Connect to MySQL and verify tables:
```sql
USE quickcert;
SHOW TABLES;
SELECT COUNT(*) FROM districts;
SELECT COUNT(*) FROM ds_offices;
SELECT COUNT(*) FROM gn_divisions;
SELECT * FROM users WHERE user_type = 'admin';
```

## Default Login Credentials

### Admin Account
- **Email:** admin@quickcert.gov.lk
- **Password:** admin123

### Test Officer Accounts
- **GN Officer:** gn.officer@quickcert.gov.lk / gn123
- **DS Officer:** ds.officer@quickcert.gov.lk / ds123

### Test Citizen Account
- **Citizen:** citizen@example.com / citizen123

## Troubleshooting

### Connection Issues
1. **Check MySQL Service:**
   ```bash
   # Windows
   net start mysql80
   
   # macOS
   brew services start mysql
   
   # Linux
   sudo systemctl start mysql
   ```

2. **Check Port (default 3306):**
   ```bash
   netstat -an | grep 3306
   ```

3. **Reset Root Password:**
   ```bash
   sudo mysql
   ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'new_password';
   FLUSH PRIVILEGES;
   ```

### Permission Issues
```sql
-- Grant all privileges to user
GRANT ALL PRIVILEGES ON quickcert.* TO 'your_user'@'localhost';
FLUSH PRIVILEGES;
```

### JSON Column Support
Ensure MySQL version 5.7+ for JSON column support used in requests table.

## Production Considerations

1. **Security:**
   - Use strong passwords
   - Create dedicated database user
   - Enable SSL connections
   - Regular backups

2. **Performance:**
   - Add indexes for frequently queried columns
   - Configure MySQL memory settings
   - Monitor query performance

3. **Backup Strategy:**
   ```bash
   # Create backup
   mysqldump -u root -p quickcert > backup_$(date +%Y%m%d).sql
   
   # Restore backup
   mysql -u root -p quickcert < backup_20240101.sql
   ```