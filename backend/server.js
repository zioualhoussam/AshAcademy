const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5000;

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'ash-jwt-secret-key-2024';

// Environment detection
const isProduction = process.env.NODE_ENV === 'production';

// Log environment variables on startup
console.log('=== ENVIRONMENT VARIABLES ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'SET' : 'NOT SET');
console.log('=============================');

// Simple CORS configuration
app.use(cors({
  origin: true, // Allow all origins for simplicity
  credentials: true
}));

// Then body parsers
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Static files LAST
app.use(express.static(path.join(__dirname, 'frontend')));

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
  console.log('Created data directory:', dataDir);
}

// Database setup
const dbPath = path.join(dataDir, 'ash_database.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database at:', dbPath);
    initializeTables();
  }
});

function initializeTables() {
  console.log('=== INITIALIZING DATABASE TABLES ===');
  
  // Create enrollments table
  db.run(`CREATE TABLE IF NOT EXISTS enrollments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    course TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) {
      console.error('Error creating enrollments table:', err);
    } else {
      console.log(' Enrollments table created successfully');
    }
  });

  // Create contacts table
  db.run(`CREATE TABLE IF NOT EXISTS contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'new',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) {
      console.error('Error creating contacts table:', err);
    } else {
      console.log(' Contacts table created successfully');
    }
  });

  // Create admin users table
  db.run(`CREATE TABLE IF NOT EXISTS admin_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) {
      console.error('Error creating admin_users table:', err);
    } else {
      console.log(' Admin users table created successfully');
      
      // Create default admin user if not exists
      const defaultUsername = 'admin';
      const defaultPassword = 'admin123';
      
      // Check if admin user exists
      db.get('SELECT * FROM admin_users WHERE username = ?', [defaultUsername], (err, user) => {
        if (err) {
          console.error('Error checking admin user:', err);
          return;
        }
        
        if (!user) {
          // Hash the password and create admin user
          const hashedPassword = bcrypt.hashSync(defaultPassword, 10);
          db.run('INSERT INTO admin_users (username, password) VALUES (?, ?)', 
            [defaultUsername, hashedPassword], (err) => {
            if (err) {
              console.error('Error creating default admin user:', err);
            } else {
              console.log(` Default admin user created: ${defaultUsername}/${defaultPassword}`);
            }
          });
        } else {
          console.log(` Admin user already exists: ${defaultUsername}`);
        }
      });
    }
  });
}

// API Routes

// Enrollment endpoint
app.post('/api/enroll', (req, res) => {
  console.log('=== ENROLLMENT REQUEST RECEIVED ===');
  console.log('Request body:', req.body);
  
  const { name, phone, course } = req.body;
  
  // Enhanced validation
  if (!name || !phone || !course) {
    console.log('Validation failed - missing fields');
    return res.status(400).json({ 
      success: false, 
      message: 'Missing required fields: name, phone, and course are required' 
    });
  }
  
  // Name validation
  if (typeof name !== 'string' || name.length < 2 || name.length > 100) {
    console.log('Validation failed - invalid name');
    return res.status(400).json({ 
      success: false, 
      message: 'Name must be between 2 and 100 characters' 
    });
  }
  
  // Phone validation (Moroccan format)
  const phoneRegex = /^(?:(?:\+|00)212|0)[6-7]\d{8}$/;
  const cleanPhone = phone.replace(/\s/g, '');
  if (!phoneRegex.test(cleanPhone)) {
    console.log('Validation failed - invalid phone:', cleanPhone);
    return res.status(400).json({ 
      success: false, 
      message: 'Please enter a valid Moroccan phone number' 
    });
  }
  
  // Course validation
  if (typeof course !== 'string' || course.length < 2 || course.length > 100) {
    console.log('Validation failed - invalid course');
    return res.status(400).json({ 
      success: false, 
      message: 'Please select a valid course' 
    });
  }

  console.log('Validation passed, inserting into database...');
  const sql = 'INSERT INTO enrollments (name, phone, course) VALUES (?, ?, ?)';
  db.run(sql, [name, cleanPhone, course], function(err) {
    if (err) {
      console.error('Error inserting enrollment:', err.message);
      return res.status(500).json({ 
        success: false, 
        message: 'Database error: Unable to save enrollment' 
      });
    }
    
    console.log(`SUCCESS: New enrollment saved - ${name} - ${course} (${cleanPhone}) - ID: ${this.lastID}`);
    res.json({ 
      success: true, 
      message: `Thank you ${name}! Your enrollment for ${course} has been received. We will contact you within 24 hours.`,
      enrollmentId: this.lastID
    });
  });
});

// Contact endpoint
app.post('/api/contact', (req, res) => {
  console.log('=== CONTACT REQUEST RECEIVED ===');
  console.log('Request body:', req.body);
  
  const { name, email, message } = req.body;
  
  // Enhanced validation
  if (!name || !email || !message) {
    console.log('Validation failed - missing fields');
    return res.status(400).json({ 
      success: false, 
      message: 'Missing required fields: name, email, and message are required' 
    });
  }

  // Name validation
  if (typeof name !== 'string' || name.length < 2 || name.length > 100) {
    console.log('Validation failed - invalid name');
    return res.status(400).json({ 
      success: false, 
      message: 'Name must be between 2 and 100 characters' 
    });
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    console.log('Validation failed - invalid email:', email);
    return res.status(400).json({ 
      success: false, 
      message: 'Please enter a valid email address' 
    });
  }

  // Message validation
  if (typeof message !== 'string' || message.length < 10 || message.length > 1000) {
    console.log('Validation failed - invalid message length');
    return res.status(400).json({ 
      success: false, 
      message: 'Message must be between 10 and 1000 characters' 
    });
  }

  console.log('Validation passed, inserting into database...');
  const sql = 'INSERT INTO contacts (name, email, message) VALUES (?, ?, ?)';
  db.run(sql, [name, email, message], function(err) {
    if (err) {
      console.error('Error inserting contact:', err.message);
      return res.status(500).json({ 
        success: false, 
        message: 'Database error: Unable to save contact message' 
      });
    }
    
    console.log(`SUCCESS: New contact saved - ${name} (${email}) - ID: ${this.lastID}`);
    res.json({ 
      success: true, 
      message: `Thank you ${name}! Your message has been received. We'll reply to ${email} within 24 hours.`,
      contactId: this.lastID
    });
  });
});

// Get all enrollments (admin endpoint)
app.get('/api/enrollments', (req, res) => {
  const sql = 'SELECT * FROM enrollments ORDER BY created_at DESC';
  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    res.json({ success: true, data: rows });
  });
});

// Get all contacts (admin endpoint)
app.get('/api/contacts', (req, res) => {
  const sql = 'SELECT * FROM contacts ORDER BY created_at DESC';
  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    res.json({ success: true, data: rows });
  });
});

// Health check endpoint (no auth required)
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString()
  });
});

// Simple test endpoint without auth
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API is working',
    timestamp: new Date().toISOString(),
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
      PORT: process.env.PORT
    },
    headers: {
      origin: req.headers.origin || 'same-origin'
    }
  });
});

// Simple PUT test endpoint without auth
app.put('/api/test', (req, res) => {
  res.json({ 
    message: 'PUT API is working',
    timestamp: new Date().toISOString(),
    method: 'PUT',
    body: req.body,
    headers: {
      authorization: req.headers.authorization || 'missing',
      'content-type': req.headers['content-type'] || 'missing'
    }
  });
});

// PUT test endpoint with auth to isolate the issue
app.put('/api/test-auth', requireAuth, (req, res) => {
  res.json({ 
    message: 'PUT API with auth is working',
    timestamp: new Date().toISOString(),
    method: 'PUT',
    body: req.body,
    user: req.user
  });
});

// JWT Authentication Middleware
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  
  console.log('=== JWT AUTH DEBUG ===');
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Auth header:', authHeader ? 'present' : 'missing');
  console.log('JWT_SECRET used:', JWT_SECRET ? 'set' : 'not set');
  console.log('JWT_SECRET length:', JWT_SECRET ? JWT_SECRET.length : 0);
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('❌ No Authorization header or invalid format');
    return res.status(401).json({ 
      success: false, 
      message: 'Authorization header required' 
    });
  }
  
  const token = authHeader.substring(7); // Remove 'Bearer ' prefix
  console.log('Token received:', token.substring(0, 50) + '...');
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('✅ JWT verification successful for user:', decoded.username);
    console.log('Decoded token:', decoded);
    req.user = decoded; // Attach user info to request
    return next();
  } catch (jwtError) {
    console.log('❌ JWT verification failed:', jwtError.message);
    console.log('JWT error name:', jwtError.name);
    console.log('This usually means JWT_SECRET mismatch or expired token');
    
    // Try to decode without verification to see the token content
    try {
      const decoded = jwt.decode(token);
      console.log('Token content (without verification):', decoded);
    } catch (decodeError) {
      console.log('Token decode failed:', decodeError.message);
    }
    
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid or expired token',
      debug: {
        error: jwtError.message,
        tokenLength: token.length,
        jwtSecretSet: !!JWT_SECRET
      }
    });
  }
}

// Admin login endpoint
app.post('/api/admin/login', (req, res) => {
  console.log('=== LOGIN ATTEMPT ===');
  console.log('Request body:', req.body);
  
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ 
      success: false, 
      message: 'Username and password are required' 
    });
  }
  
  // Look up user in database
  const sql = 'SELECT * FROM admin_users WHERE username = ?';
  db.get(sql, [username], (err, user) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    
    if (!user) {
      console.log('User not found:', username);
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid username or password' 
      });
    }
    
    // Verify password
    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) {
      console.log('Invalid password for user:', username);
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid username or password' 
      });
    }
    
    // Generate JWT token
    console.log('=== JWT TOKEN GENERATION ===');
    console.log('JWT_SECRET used for signing:', JWT_SECRET ? 'set' : 'not set');
    console.log('JWT_SECRET length:', JWT_SECRET ? JWT_SECRET.length : 0);
    
    const token = jwt.sign(
      { 
        id: user.id, 
        username: user.username,
        iat: Math.floor(Date.now() / 1000)
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    console.log('✅ JWT token generated successfully');
    console.log('Token length:', token.length);
    console.log('Token preview:', token.substring(0, 50) + '...');
    
    console.log('✅ Login successful for user:', username);
    res.json({ 
      success: true, 
      message: 'Login successful',
      token: token,
      user: {
        id: user.id,
        username: user.username
      }
    });
  });
});

// Simple admin logout endpoint
app.post('/api/admin/logout', (req, res) => {
  res.json({ success: true, message: 'Logout successful' });
});

// Protected admin endpoints
app.get('/api/admin/enrollments', requireAuth, (req, res) => {
  const sql = 'SELECT * FROM enrollments ORDER BY created_at DESC';
  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    res.json({ success: true, data: rows });
  });
});

app.put('/api/admin/enrollments/:id/status', requireAuth, (req, res) => {
  console.log('Update enrollment status - params:', req.params);
  console.log('Update enrollment status - body:', req.body);
  
  const { id } = req.params;
  const { status } = req.body;
  
  if (!['approved', 'rejected', 'pending'].includes(status)) {
    console.log('Invalid status:', status);
    return res.status(400).json({ success: false, message: 'Invalid status' });
  }
  
  const sql = 'UPDATE enrollments SET status = ? WHERE id = ?';
  console.log('Executing SQL:', sql);
  console.log('With values:', [status, id]);
  
  db.run(sql, [status, id], function(err) {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    
    console.log('Database changes:', this.changes);
    if (this.changes === 0) {
      console.log('No enrollment found with id:', id);
      return res.status(404).json({ success: false, message: 'Enrollment not found' });
    }
    
    console.log('Update successful');
    res.json({ 
      success: true, 
      message: `Enrollment ${status} successfully` 
    });
  });
});

app.get('/api/admin/contacts', requireAuth, (req, res) => {
  const sql = 'SELECT * FROM contacts ORDER BY created_at DESC';
  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    res.json({ success: true, data: rows });
  });
});

app.get('/api/admin/stats', requireAuth, (req, res) => {
  const enrollmentsSql = 'SELECT COUNT(*) as count FROM enrollments';
  const contactsSql = 'SELECT COUNT(*) as count FROM contacts';
  const pendingSql = 'SELECT COUNT(*) as count FROM enrollments WHERE status = "pending"';
  const approvedSql = 'SELECT COUNT(*) as count FROM enrollments WHERE status = "approved"';
  
  db.get(enrollmentsSql, [], (err, enrollRow) => {
    if (err) return res.status(500).json({ success: false, message: 'Database error' });
    
    db.get(contactsSql, [], (err, contactRow) => {
      if (err) return res.status(500).json({ success: false, message: 'Database error' });
      
      db.get(pendingSql, [], (err, pendingRow) => {
        if (err) return res.status(500).json({ success: false, message: 'Database error' });
        
        db.get(approvedSql, [], (err, approvedRow) => {
          if (err) return res.status(500).json({ success: false, message: 'Database error' });
          
          res.json({
            success: true,
            total: enrollRow.count,
            contacts: contactRow.count,
            pending: pendingRow.count,
            approved: approvedRow.count
          });
        });
      });
    });
  });
});

// Serve frontend for all other routes
app.get('*', (req, res) => {
  // Check if it's the admin route
  if (req.path.startsWith('/admin')) {
    res.sendFile(path.join(__dirname, 'frontend/admin.html'));
  } else {
    res.sendFile(path.join(__dirname, 'frontend/ash-educational-center.html'));
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 ASH Educational Backend running on http://localhost:${PORT}`);
});
