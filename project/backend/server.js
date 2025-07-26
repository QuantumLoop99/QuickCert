const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/public', express.static('public'));


// Database connection
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'JAyas!@#dasun789',
  database: process.env.DB_NAME || 'quickcert'
});

// Test database connection
db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err);
  } else {
    console.log('Connected to MySQL database');
  }
});

// Email configuration
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,                
  secure: true, 
  auth: {
    user: 'isurangadasun3@gmail.com',
    pass: 'awum reob emqs zamx'
  }
});

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'quickcert_secret_key';

// Valid authentication codes for officers
const VALID_AUTH_CODES = {
  'gn_officer': ['GN2024', 'GN2025', 'GNAUTH001', 'GNAUTH002'],
  'ds_officer': ['DS2024', 'DS2025', 'DSAUTH001', 'DSAUTH002']
};

// Function to validate authentication code
function validateAuthCode(userType, authCode) {
  if (!authCode) return false;
  
  const validCodes = VALID_AUTH_CODES[userType];
  if (!validCodes) return false;
  
  return validCodes.includes(authCode.toUpperCase());
}

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Helper function to check officer availability
async function checkOfficerAvailability(dsOfficeId, gnDivisionId) {
  try {
    console.log('Checking officer availability for DS Office:', dsOfficeId, 'GN Division:', gnDivisionId);
    
    // Check for DS Officer
    const [dsOfficers] = await db.promise().query(
      'SELECT id, name FROM users WHERE user_type = "ds_officer" AND ds_office = ? AND status = "active"',
      [dsOfficeId]
    );
    
    // Check for GN Officer (only if gnDivisionId is provided)
    let gnOfficers = [];
    if (gnDivisionId) {
      const [gnResult] = await db.promise().query(
        'SELECT id, name FROM users WHERE user_type = "gn_officer" AND gn_division = ? AND status = "active"',
        [gnDivisionId]
      );
      gnOfficers = gnResult;
    }
    
    console.log('Found DS Officers:', dsOfficers.length, 'GN Officers:', gnOfficers.length);
    
    return {
      hasDS: dsOfficers.length > 0,
      hasGN: gnOfficers.length > 0,
      dsOfficer: dsOfficers[0] || null,
      gnOfficer: gnOfficers[0] || null
    };
  } catch (error) {
    console.error('Error checking officer availability:', error);
    return {
      hasDS: false,
      hasGN: false,
      dsOfficer: null,
      gnOfficer: null
    };
  }
}

// Routes

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const {
      userType,
      name,
      title,
      nic,
      dob,
      phone,
      address,
      employeeType,
      email,
      password,
      district,
      dsOffice,
      gnDivision,
      authCode
    } = req.body;

    console.log('Registration attempt:', { userType, email, authCode });

    // Validate authentication code for officers
    if (userType === 'gn_officer' || userType === 'ds_officer') {
      if (!validateAuthCode(userType, authCode)) {
        console.log('Invalid auth code:', authCode, 'for user type:', userType);
        return res.status(400).json({ 
          error: `Invalid authentication code for ${userType.replace('_', ' ')}. Please contact your supervisor for the correct code.` 
        });
      }
    }

    // Check if user exists
    const [existingUser] = await db.promise().query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'User already exists with this email address' });
    }

    // Validate required fields based on user type
    if (userType === 'citizen') {
      if (!nic || !dob || !address || !employeeType) {
        return res.status(400).json({ error: 'Missing required fields for citizen registration' });
      }
    }

    if (!district || !dsOffice) {
      return res.status(400).json({ error: 'District and DS Office are required' });
    }

    if ((userType === 'citizen' || userType === 'gn_officer') && !gnDivision) {
      return res.status(400).json({ error: 'GN Division is required' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const [result] = await db.promise().query(
      `INSERT INTO users (user_type, name, title, nic, dob, phone, address, 
       employee_type, email, password, district, ds_office, gn_division, auth_code, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
      [userType, name, title, nic, dob, phone, address, employeeType, 
       email, hashedPassword, district, dsOffice, gnDivision, authCode]
    );

    console.log('User registered successfully:', { userId: result.insertId, email, userType });

    res.status(201).json({ 
      message: 'User registered successfully', 
      userId: result.insertId 
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle specific MySQL errors
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Email address is already registered' });
    }
    
    if (error.code === 'ER_BAD_NULL_ERROR') {
      return res.status(400).json({ error: 'Missing required information' });
    }
    
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const [users] = await db.promise().query(
      'SELECT * FROM users WHERE email = ? AND status = "active"',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = users[0];
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, userType: user.user_type },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        userType: user.user_type,
        dsOffice: user.ds_office,
        gnDivision: user.gn_division
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Location Routes
app.get('/api/locations/districts', async (req, res) => {
  try {
    const [districts] = await db.promise().query('SELECT * FROM districts ORDER BY name');
    res.json(districts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch districts' });
  }
});

app.get('/api/locations/ds-offices/:districtId', async (req, res) => {
  try {
    const [dsOffices] = await db.promise().query(
      'SELECT * FROM ds_offices WHERE district_id = ? ORDER BY name',
      [req.params.districtId]
    );
    res.json(dsOffices);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch DS offices' });
  }
});

app.get('/api/locations/gn-divisions/:dsOfficeId', async (req, res) => {
  try {
    const [gnDivisions] = await db.promise().query(
      'SELECT * FROM gn_divisions WHERE ds_office_id = ? ORDER BY name',
      [req.params.dsOfficeId]
    );
    res.json(gnDivisions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch GN divisions' });
  }
});

// NEW: Officer availability check endpoint
app.get('/api/officers/availability', authenticateToken, async (req, res) => {
  try {
    // Get current user's location details
    const [user] = await db.promise().query(
      'SELECT ds_office, gn_division, employee_type FROM users WHERE id = ?',
      [req.user.userId]
    );

    if (user.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = user[0];
    const availability = await checkOfficerAvailability(userData.ds_office, userData.gn_division);
    
    // Determine what request types are allowed
    const canSubmitWorking = availability.hasDS && availability.hasGN;
    const canSubmitRetired = availability.hasDS;
    
    res.json({
      availability,
      permissions: {
        canSubmitWorking,
        canSubmitRetired,
        employeeType: userData.employee_type
      },
      messages: {
        noGN: `You cannot submit working requests because a GN Officer for your GN Division has not yet registered in the system.`,
        noDS: `A DS Officer for your DS Office has not yet registered. Request submission is currently unavailable.`,
        allAvailable: 'All request types are available for submission.'
      }
    });
  } catch (error) {
    console.error('Error checking officer availability:', error);
    res.status(500).json({ error: 'Failed to check officer availability' });
  }
});

// Request Routes
app.post('/api/requests', authenticateToken, async (req, res) => {
  try {
    console.log('=== REQUEST SUBMISSION START ===');
    console.log('User:', req.user);
    console.log('Request body:', JSON.stringify(req.body, null, 2));

    const {
      requestType,
      incomeYear,
      reason,
      paymentRef,
      incomeSources,
      pensionType,
      retirementDate,
      pensionNumber,
      workedInstitute
    } = req.body;

    // Get user's location details
    const [user] = await db.promise().query(
      'SELECT ds_office, gn_division, employee_type FROM users WHERE id = ?',
      [req.user.userId]
    );

    if (user.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = user[0];
    
    // Check officer availability before allowing submission
    const availability = await checkOfficerAvailability(userData.ds_office, userData.gn_division);
    
    // Validate officer availability based on request type
    if (requestType === 'working') {
      if (!availability.hasGN) {
        return res.status(400).json({ 
          error: 'Cannot submit working request: No GN Officer registered for your GN Division.' 
        });
      }
      if (!availability.hasDS) {
        return res.status(400).json({ 
          error: 'Cannot submit working request: No DS Officer registered for your DS Office.' 
        });
      }
    } else if (requestType === 'retired') {
      if (!availability.hasDS) {
        return res.status(400).json({ 
          error: 'Cannot submit retired request: No DS Officer registered for your DS Office.' 
        });
      }
    }

    // Validate required fields
    if (!requestType || !reason || !paymentRef) {
      console.log('Missing basic required fields');
      return res.status(400).json({ error: 'Missing required fields: requestType, reason, or paymentRef' });
    }

    // Validate based on request type
    if (requestType === 'working') {
      console.log('Validating working person request...');
      console.log('Income sources:', incomeSources);
      
      if (!incomeSources || !Array.isArray(incomeSources) || incomeSources.length === 0) {
        console.log('No income sources provided');
        return res.status(400).json({ error: 'Working person requests must include at least one income source' });
      }
      
      // Validate each income source
      for (let i = 0; i < incomeSources.length; i++) {
        const source = incomeSources[i];
        console.log(`Validating income source ${i + 1}:`, source);
        
        if (!source.type || !source.income || parseFloat(source.income) <= 0) {
          return res.status(400).json({ error: `Income source ${i + 1} must have a valid income amount greater than 0` });
        }
      }
    } else if (requestType === 'retired') {
      console.log('Validating retired person request...');
      if (!incomeYear || !pensionType || !pensionNumber || !retirementDate || !workedInstitute) {
        console.log('Missing retired person fields');
        return res.status(400).json({ error: 'Missing required fields for retired person request' });
      }
    } else {
      console.log('Invalid request type:', requestType);
      return res.status(400).json({ error: 'Invalid request type. Must be "working" or "retired"' });
    }

    // Determine initial status based on request type and officer availability
    let initialStatus = 'submitted';
    if (requestType === 'retired') {
      initialStatus = 'under_ds_review'; // Retired requests go directly to DS officer
    } else if (requestType === 'working') {
      initialStatus = 'under_gn_review'; // Working requests start with GN review
    }

    console.log('Inserting request with status:', initialStatus);

    let insertQuery = '';
    let insertValues = [];

    if (requestType === 'working') {
      // For working requests, don't include income_year or pension fields at all
      insertQuery = `INSERT INTO requests (user_id, request_type, reason, payment_ref, 
                     income_sources, status, created_at) 
                     VALUES (?, ?, ?, ?, ?, ?, NOW())`;
      insertValues = [
        req.user.userId,
        requestType,
        reason,
        paymentRef,
        JSON.stringify(incomeSources),
        initialStatus
      ];
    } else if (requestType === 'retired') {
      // For retired requests, include all pension-related fields
      insertQuery = `INSERT INTO requests (user_id, request_type, income_year, reason, payment_ref, 
                     pension_type, retirement_date, pension_number, worked_institute, status, created_at) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`;
      insertValues = [
        req.user.userId,
        requestType,
        parseInt(incomeYear), // Ensure it's an integer
        reason,
        paymentRef,
        pensionType,
        retirementDate,
        pensionNumber,
        workedInstitute,
        initialStatus
      ];
    }

    console.log('Executing query:', insertQuery);
    console.log('With values:', insertValues);

    const [result] = await db.promise().query(insertQuery, insertValues);

    console.log('Request inserted successfully with ID:', result.insertId);

    // Send notification email
    const [userDetails] = await db.promise().query('SELECT email, name FROM users WHERE id = ?', [req.user.userId]);
    
    if (userDetails.length > 0) {
      try {
        const statusText = initialStatus === 'under_gn_review' ? 'Submitted for GN Review' : 'Submitted for DS Review';
        
        await transporter.sendMail({
          from: 'isurangadasun3@gmail.com',
          to: userDetails[0].email,
          subject: 'QuickCERT - Request Submitted Successfully',
          html: `
            <h2>Request Submitted Successfully</h2>
            <p>Dear ${userDetails[0].name},</p>
            <p>Your income statement request has been submitted successfully.</p>
            <p>Request Reference: QC${result.insertId.toString().padStart(6, '0')}</p>
            <p>Request Type: ${requestType === 'working' ? 'Working Person' : 'Retired Person'}</p>
            ${incomeYear ? `<p>Income Year: ${incomeYear}</p>` : ''}
            <p>Status: ${statusText}</p>
            <p>You will be notified once your request is processed.</p>
            <br>
            <p>Best regards,<br>QuickCERT Team</p>
          `
        });
        console.log('Email sent successfully');
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
        // Don't fail the request if email fails
      }
    }

    console.log('=== REQUEST SUBMISSION SUCCESS ===');

    res.status(201).json({ 
      message: 'Request submitted successfully', 
      requestId: result.insertId,
      referenceNo: `QC${result.insertId.toString().padStart(6, '0')}`,
      status: initialStatus
    });
  } catch (error) {
    console.error('=== REQUEST SUBMISSION ERROR ===');
    console.error('Error details:', error);
    console.error('Stack trace:', error.stack);
    
    // Handle specific database errors
    if (error.code === 'ER_TRUNCATED_WRONG_VALUE_FOR_FIELD') {
      return res.status(400).json({ error: 'Invalid data format. Please check all fields and try again.' });
    }
    
    res.status(500).json({ error: 'Failed to submit request. Please try again.' });
  }
});

app.get('/api/requests/user', authenticateToken, async (req, res) => {
  try {
    const [requests] = await db.promise().query(
      `SELECT id, CONCAT('QC', LPAD(id, 6, '0')) as reference_no, 
       request_type, income_year, status, created_at, updated_at 
       FROM requests WHERE user_id = ? ORDER BY created_at DESC`,
      [req.user.userId]
    );
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
});

app.get('/api/requests/:id/status', authenticateToken, async (req, res) => {
  try {
    const [requests] = await db.promise().query(
      `SELECT r.*, u.name as user_name, 
       CONCAT('QC', LPAD(r.id, 6, '0')) as reference_no
       FROM requests r 
       JOIN users u ON r.user_id = u.id 
       WHERE r.id = ? AND r.user_id = ?`,
      [req.params.id, req.user.userId]
    );

    if (requests.length === 0) {
      return res.status(404).json({ error: 'Request not found' });
    }

    res.json(requests[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch request status' });
  }
});

// Officer Routes - UPDATED to filter by officer's assigned location
app.get('/api/requests/pending', authenticateToken, async (req, res) => {
  try {
    let query = '';
    let params = [];

    console.log('Fetching pending requests for user type:', req.user.userType);

    // Get current user's location details
    const [currentUser] = await db.promise().query(
      'SELECT ds_office, gn_division FROM users WHERE id = ?',
      [req.user.userId]
    );

    if (currentUser.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userLocation = currentUser[0];

    if (req.user.userType === 'gn_officer') {
      // GN officers only see working requests from their GN division that are submitted or under GN review
      query = `SELECT r.*, u.name as user_name, u.phone, u.address, u.nic, u.gn_division,
               CONCAT('QC', LPAD(r.id, 6, '0')) as reference_no
               FROM requests r 
               JOIN users u ON r.user_id = u.id 
               WHERE r.status IN ('submitted', 'under_gn_review') 
               AND r.request_type = 'working'
               AND u.gn_division = ?
               ORDER BY r.created_at ASC`;
      params = [userLocation.gn_division];
    } else if (req.user.userType === 'ds_officer') {
      // DS officers see:
      // 1. Working requests from their DS office that are GN approved
      // 2. Retired requests from their DS office that are under DS review
      query = `SELECT r.*, u.name as user_name, u.phone, u.address, u.nic, u.ds_office,
               CONCAT('QC', LPAD(r.id, 6, '0')) as reference_no
               FROM requests r 
               JOIN users u ON r.user_id = u.id 
               WHERE ((r.status = 'gn_approved' AND r.request_type = 'working') 
                      OR (r.status = 'under_ds_review' AND r.request_type = 'retired'))
               AND u.ds_office = ?
               ORDER BY r.created_at ASC`;
      params = [userLocation.ds_office];
    } else {
      return res.status(403).json({ error: 'Access denied. Only officers can view pending requests.' });
    }

    const [requests] = await db.promise().query(query, params);
    console.log(`Found ${requests.length} pending requests for ${req.user.userType} in location:`, userLocation);
    
    // Debug: Log the first request to see what data we're getting
    if (requests.length > 0) {
      console.log('Sample request data:', {
        id: requests[0].id,
        user_name: requests[0].user_name,
        phone: requests[0].phone,
        address: requests[0].address,
        nic: requests[0].nic,
        income_sources: requests[0].income_sources ? 'Present' : 'Missing',
        income_sources_length: requests[0].income_sources ? requests[0].income_sources.length : 0
      });
    }
    
    res.json(requests);
  } catch (error) {
    console.error('Failed to fetch pending requests:', error);
    res.status(500).json({ error: 'Failed to fetch pending requests' });
  }
});

app.put('/api/requests/:id/review', authenticateToken, async (req, res) => {
  try {
    const { action, comments, monthlyIncomeData } = req.body;
    const requestId = req.params.id;

    console.log('Review request:', { requestId, action, userType: req.user.userType });

    // Validate action
    if (!action || !['approve', 'reject'].includes(action)) {
      return res.status(400).json({ error: 'Invalid action. Must be "approve" or "reject"' });
    }

    // Check if request exists and get current status
    const [currentRequest] = await db.promise().query(
      'SELECT * FROM requests WHERE id = ?',
      [requestId]
    );

    if (currentRequest.length === 0) {
      return res.status(404).json({ error: 'Request not found' });
    }

    const request = currentRequest[0];
    let newStatus = '';

    // Determine new status based on user type and action
    if (req.user.userType === 'gn_officer') {
      if (request.request_type !== 'working') {
        return res.status(403).json({ error: 'GN officers can only review working person requests' });
      }
      newStatus = action === 'approve' ? 'gn_approved' : 'gn_rejected';
    } else if (req.user.userType === 'ds_officer') {
      newStatus = action === 'approve' ? 'ds_approved' : 'ds_rejected';
    } else {
      return res.status(403).json({ error: 'Only officers can review requests' });
    }

    // Update request
    await db.promise().query(
      `UPDATE requests SET status = ?, review_comments = ?, 
       monthly_income_data = ?, reviewed_by = ?, reviewed_at = NOW() 
       WHERE id = ?`,
      [newStatus, comments, JSON.stringify(monthlyIncomeData), req.user.userId, requestId]
    );

    console.log('Request updated:', { requestId, newStatus });

    // Generate PDF if approved by DS Officer
    if (newStatus === 'ds_approved') {
      try {
        await generateIncomeStatementPDF(requestId);
      } catch (pdfError) {
        console.error('PDF generation failed:', pdfError);
        // Don't fail the review if PDF generation fails
      }
    }

    // Send notification email
    const [requestData] = await db.promise().query(
      'SELECT r.*, u.email, u.name FROM requests r JOIN users u ON r.user_id = u.id WHERE r.id = ?',
      [requestId]
    );

    if (requestData.length > 0) {
      const req_data = requestData[0];
      try {
        let statusMessage = '';
        if (newStatus === 'gn_approved') {
          statusMessage = 'Your request has been approved by the GN Officer and forwarded to the DS Officer for final review.';
        } else if (newStatus === 'ds_approved') {
          statusMessage = 'Your request has been approved and your income statement is ready for download.';
        } else {
          statusMessage = `Your request has been ${action}d.`;
        }

        await transporter.sendMail({
          from: 'isurangadasun3@gmail.com',
          to: req_data.email,
          subject: `QuickCERT - Request ${action === 'approve' ? 'Approved' : 'Rejected'}`,
          html: `
            <h2>Request ${action === 'approve' ? 'Approved' : 'Rejected'}</h2>
            <p>Dear ${req_data.name},</p>
            <p>${statusMessage}</p>
            <p>Request Reference: ${`QC${requestId.toString().padStart(6, '0')}`}</p>
            ${comments ? `<p>Comments: ${comments}</p>` : ''}
            ${newStatus === 'ds_approved' ? '<p>Your income statement is ready for download from your dashboard.</p>' : ''}
            <br>
            <p>Best regards,<br>QuickCERT Team</p>
          `
        });
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
        // Don't fail the review if email fails
      }
    }

    res.json({ 
      message: `Request ${action}d successfully`,
      newStatus: newStatus
    });
  } catch (error) {
    console.error('Review error:', error);
    res.status(500).json({ error: 'Failed to update request' });
  }
});

const ejs = require('ejs');
const puppeteer = require('puppeteer');

async function generateIncomeStatementPDF(request_id) {
  try {
    const [requests] = await db.promise().query(
      `SELECT r.*, u.name, u.nic, u.address, u.gn_division, u.ds_office
       FROM requests r
       JOIN users u ON r.user_id = u.id
       WHERE r.id = ?`,
      [request_id]
    );

    if (!requests.length) throw new Error('Request not found');
    const request = requests[0];

    const isWorking = request.request_type === 'working';
    const templatePath = path.join(__dirname, 'templates', isWorking ? 'working-certificate.ejs' : 'retired-certificate.ejs');

    const verificationCode = `QC${request.id}${Date.now().toString().slice(-4)}`;

    // 🔧 Use enriched request for ds/gn office names
    const [requestRows] = await db.promise().query(
      `SELECT 
        r.*, 
        u.name, u.nic, u.address,
        gn.name AS gn_division_name,
        ds.name AS ds_office_name
      FROM requests r
      JOIN users u ON r.user_id = u.id
      LEFT JOIN gn_divisions gn ON u.gn_division = gn.id
      LEFT JOIN ds_offices ds ON u.ds_office = ds.id
      WHERE r.id = ?`,
      [request_id]
    );

    if (!requestRows.length) throw new Error('Joined data not found');
    const enrichedRequest = requestRows[0]; // ✅ This has ds_office_name and gn_division_name

    const templateData = {
      citizenName: request.name,
      citizenAddress: request.address,
      citizenNIC: request.nic,
      dsOfficeName: enrichedRequest.ds_office_name || 'N/A',
      gnDivision: enrichedRequest.gn_division_name || 'N/A',
      officerName: 'Bhagya Welivita',
      caseNumber: request.id.toString().padStart(6, '0'),
      approvalDate: new Date().toLocaleDateString(),
      verificationCode: verificationCode,
      qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=https://quickcert.gov.lk/verify/${request.id}`,
      referenceNo: `QC${request.id.toString().padStart(6, '0')}`,
    };

    await db.promise().query('UPDATE requests SET verification_code = ? WHERE id = ?', [verificationCode, request.id]);

    if (isWorking) {
      const incomeSourcesRaw = request.income_sources;
      const incomeSources = typeof incomeSourcesRaw === 'string' ? JSON.parse(incomeSourcesRaw || '[]') : incomeSourcesRaw;

      const totalAnnualIncome = incomeSources.reduce((sum, s) => sum + (parseFloat(s.income || 0) * 12), 0);

      templateData.incomeSources = incomeSources.map((src, idx) => ({
        ...src,
        annualAmount: (parseFloat(src.income || 0) * 12).toFixed(2),
        index: idx + 1
      }));
      templateData.totalAnnualIncome = totalAnnualIncome.toFixed(2);
      templateData.currentYear = new Date().getFullYear();
      templateData.nextYear = templateData.currentYear + 1;

    } else {
      let monthlyData = {};
      if (request.monthly_income_data) {
        try {
          monthlyData = typeof request.monthly_income_data === 'string'
            ? JSON.parse(request.monthly_income_data)
            : request.monthly_income_data;
        } catch (err) {
          console.error('Failed to parse monthly_income_data:', err);
          monthlyData = {};
        }
      }

      const monthlyBreakdown = Array.isArray(monthlyData.monthlyBreakdown)
        ? monthlyData.monthlyBreakdown
        : [];

      const monthlyArray = monthlyBreakdown.map((m) => ({
        basic: parseFloat(m.basic || 0).toFixed(2),
        allowances: parseFloat(m.allowances || 0).toFixed(2),
        bonus: parseFloat(m.bonus || 0).toFixed(2),
        tax: parseFloat(m.tax || 0).toFixed(2),
        deductions: parseFloat(m.deductions || 0).toFixed(2),
        net: parseFloat(m.net || 0).toFixed(2)
      }));

      const yearlyTotals = {
        basic: (parseFloat(monthlyData?.yearlyTotals?.basic || 0)).toFixed(2),
        allowances: (parseFloat(monthlyData?.yearlyTotals?.allowances || 0)).toFixed(2),
        bonus: (parseFloat(monthlyData?.yearlyTotals?.bonus || 0)).toFixed(2),
        tax: (parseFloat(monthlyData?.yearlyTotals?.tax || 0)).toFixed(2),
        deductions: (parseFloat(monthlyData?.yearlyTotals?.deductions || 0)).toFixed(2),
        net: (parseFloat(monthlyData?.yearlyTotals?.net || 0)).toFixed(2)
      };

      const averageMonthly = parseFloat(monthlyData?.averageMonthly || (yearlyTotals.net / 12)).toFixed(2);

      templateData.monthlyData = monthlyArray;
      templateData.yearlyTotals = yearlyTotals;
      templateData.totalAnnualIncome = yearlyTotals.net;
      templateData.averageMonthly = averageMonthly;
      templateData.pensionType = request.pension_type || 'N/A';
      templateData.pensionNumber = request.pension_number || 'N/A';
      templateData.retirementDate = request.retirement_date || 'N/A';
      templateData.requestedYear = request.income_year || new Date().getFullYear();
      templateData.currentYear = new Date().getFullYear();
      templateData.capitalize = (text) =>
        text ? text.charAt(0).toUpperCase() + text.slice(1).toLowerCase() : '';
    }

    const htmlContent = await ejs.renderFile(templatePath, templateData);

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      landscape: !isWorking,
      printBackground: true,
      margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' }
    });

    await browser.close();

    const documentsDir = path.join(__dirname, 'documents');
    if (!fs.existsSync(documentsDir)) {
      fs.mkdirSync(documentsDir, { recursive: true });
    }

    const filename = `income_statement_${request.id}.pdf`;
    const filepath = path.join(documentsDir, filename);
    fs.writeFileSync(filepath, pdfBuffer);

    await db.promise().query('UPDATE requests SET document_path = ? WHERE id = ?', [filename, request.id]);

    console.log('PDF generated successfully:', filename);
  } catch (error) {
    console.error('PDF generation failed:', error);
    throw error;
  }
}




// Updated review endpoint with better PDF generation handling
app.put('/api/requests/:id/review', authenticateToken, async (req, res) => {
  try {
    const { action, comments, monthlyIncomeData } = req.body;
    const requestId = req.params.id;

    console.log('Review request:', { requestId, action, userType: req.user.userType });

    if (!action || !['approve', 'reject'].includes(action)) {
      return res.status(400).json({ error: 'Invalid action. Must be "approve" or "reject"' });
    }

    const [requestRows] = await db.promise().query('SELECT * FROM requests WHERE id = ?', [requestId]);
    if (requestRows.length === 0) return res.status(404).json({ error: 'Request not found' });

    const request = requestRows[0];
    let newStatus = '';

    if (req.user.userType === 'gn_officer') {
      if (request.request_type !== 'working') {
        return res.status(403).json({ error: 'GN officers can only review working requests' });
      }
      newStatus = action === 'approve' ? 'gn_approved' : 'gn_rejected';
    } else if (req.user.userType === 'ds_officer') {
      newStatus = action === 'approve' ? 'ds_approved' : 'ds_rejected';
    } else {
      return res.status(403).json({ error: 'Only officers can review requests' });
    }

    const monthlyIncomeToStore = request.request_type === 'retired' && action === 'approve'
      ? JSON.stringify(monthlyIncomeData || {})
      : null;

    await db.promise().query(
      `UPDATE requests SET status = ?, review_comments = ?, monthly_income_data = ?, reviewed_by = ?, reviewed_at = NOW() WHERE id = ?`,
      [newStatus, comments, monthlyIncomeToStore, req.user.userId, requestId]
    );

    console.log('Request updated:', { requestId, newStatus });

    if (newStatus === 'ds_approved') {
      try {
        console.log('Generating PDF...');
        await generateIncomeStatementPDF(requestId);
        console.log('PDF successfully generated.');
      } catch (err) {
        console.error('PDF generation failed:', err);
        await db.promise().query('UPDATE requests SET status = ? WHERE id = ?', ['under_ds_review', requestId]);
        return res.status(500).json({ error: 'Request approved but PDF generation failed. Please try again.' });
      }
    }

    const [userDataRows] = await db.promise().query(
      'SELECT r.*, u.email, u.name FROM requests r JOIN users u ON r.user_id = u.id WHERE r.id = ?',
      [requestId]
    );

    if (userDataRows.length > 0) {
      const reqData = userDataRows[0];
      let statusMsg = '';
      if (newStatus === 'gn_approved') statusMsg = 'Approved by GN Officer and forwarded.';
      else if (newStatus === 'ds_approved') statusMsg = 'Approved and income statement ready.';
      else statusMsg = `Your request has been ${action}d.`;

      try {
        await transporter.sendMail({
          from: 'isurangadasun3@gmail.com',
          to: reqData.email,
          subject: `QuickCERT - Request ${action === 'approve' ? 'Approved' : 'Rejected'}`,
          html: `
            <h2>Request ${action === 'approve' ? 'Approved' : 'Rejected'}</h2>
            <p>Dear ${reqData.name},</p>
            <p>${statusMsg}</p>
            <p>Reference: QC${requestId.toString().padStart(6, '0')}</p>
            ${comments ? `<p>Comments: ${comments}</p>` : ''}
            ${newStatus === 'ds_approved' ? '<p>Your document is ready for download.</p>' : ''}
            <p>Best regards,<br>QuickCERT Team</p>
          `
        });
      } catch (emailErr) {
        console.error('Email failed:', emailErr);
      }
    }

    res.json({ message: `Request ${action}d successfully`, newStatus });

  } catch (err) {
    console.error('Review error:', err);
    res.status(500).json({ error: 'Failed to process request review.' });
  }
});


// Enhanced document download endpoint
app.get('/api/requests/:id/review', authenticateToken, async (req, res) => {
  try {
    const requestId = req.params.id;

    const [requests] = await db.promise().query(
      `SELECT r.*, u.name, u.nic, u.address, u.email, u.gn_division, u.ds_office
       FROM requests r
       JOIN users u ON r.user_id = u.id
       WHERE r.id = ?`,
      [requestId]
    );

    if (requests.length === 0) {
      return res.status(404).json({ error: 'Request not found' });
    }

    const request = requests[0];
    res.json({ request });

  } catch (err) {
    console.error('Error fetching request:', err);
    res.status(500).json({ error: 'Failed to fetch request details.' });
  }
});


// Feedback
app.post('/api/feedback', authenticateToken, async (req, res) => {
  try {
    const { requestId, rating, comments } = req.body;

    await db.promise().query(
      'INSERT INTO feedback (request_id, user_id, rating, comments, created_at) VALUES (?, ?, ?, ?, NOW())',
      [requestId, req.user.userId, rating, comments]
    );

    res.json({ message: 'Feedback submitted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
});

// Admin Routes
app.get('/api/admin/stats', authenticateToken, async (req, res) => {
  try {
    if (req.user.userType !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const [totalRequests] = await db.promise().query('SELECT COUNT(*) as count FROM requests');
    const [pendingRequests] = await db.promise().query('SELECT COUNT(*) as count FROM requests WHERE status IN ("submitted", "under_gn_review", "gn_approved", "under_ds_review")');
    const [approvedRequests] = await db.promise().query('SELECT COUNT(*) as count FROM requests WHERE status = "ds_approved"');
    const [rejectedRequests] = await db.promise().query('SELECT COUNT(*) as count FROM requests WHERE status IN ("gn_rejected", "ds_rejected")');

    res.json({
      totalRequests: totalRequests[0].count,
      pendingRequests: pendingRequests[0].count,
      approvedRequests: approvedRequests[0].count,
      rejectedRequests: rejectedRequests[0].count
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

app.post('/api/verify-certificate', async (req, res) => {
  const { verificationCode } = req.body;

  if (!verificationCode) {
    return res.status(400).json({ error: 'Verification code is required' });
  }

  try {
    const [rows] = await db.promise().query(
      `SELECT r.*, u.name, u.nic, u.address, u.phone
       FROM requests r
       JOIN users u ON r.user_id = u.id
       WHERE r.verification_code = ? AND r.status = 'ds_approved'`,
      [verificationCode]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Invalid or unverified certificate code' });
    }

    const result = rows[0];

    res.json({
      message: 'Certificate verified successfully',
      data: {
        name: result.name,
        nic: result.nic,
        address: result.address,
        phone: result.phone,
        request_type: result.request_type,
        income_year: result.income_year,
        pension_number: result.pension_number,
        retirement_date: result.retirement_date,
        verification_code: result.verification_code,
        reason: result.reason,
        created_at: result.created_at,
        reference_no: `QC${result.id.toString().padStart(6, '0')}`,
        status: result.status,
        income_sources: result.income_sources,
        pension_type: result.pension_type,
        reference_no: `QC${result.id.toString().padStart(6, '0')}`
      }
    });
  } catch (error) {
    console.error('Verification failed:', error);
    res.status(500).json({ error: 'Verification failed due to server error' });
  }
});


app.get('/api/requests/:id/document', async (req, res) => {
  try {
    const requestId = req.params.id;

    const [rows] = await db.promise().query(
      'SELECT document_path FROM requests WHERE id = ?',
      [requestId]
    );

    if (!rows.length) {
      return res.status(404).json({ error: 'Request not found' });
    }

    const docPath = rows[0].document_path;

    if (!docPath) {
      return res.status(404).json({ error: 'Document not generated yet' });
    }

    const filePath = path.join(__dirname, 'documents', docPath);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Document file not found on server' });
    }

    res.download(filePath, docPath);
  } catch (err) {
    console.error('Error in document download:', err);
    res.status(500).json({ error: 'Failed to download document' });
  }
});



// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
