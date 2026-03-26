const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5000;

// Environment detection
const isProduction = process.env.NODE_ENV === 'production';
const isHttps = process.env.HTTPS === 'true' || isProduction;

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'ash-jwt-secret-key';

// Session middleware MUST come first
app.use(session({
  secret: process.env.SESSION_SECRET || 'ash-educational-secret-key',
  resave: false,
  saveUninitialized: false,
  name: 'ash-admin-session',
  cookie: { 
    secure: false, // Temporarily disable to test
    maxAge: 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'lax' // Use 'lax' for both environments
  }
}));

// Then CORS - Updated for production
const allowedOrigins = [
  'http://localhost:5000', 
  'http://127.0.0.1:5000',
  'https://ash-educational-center-production.up.railway.app'
];

app.use(cors({
  credentials: true,
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, or same-origin)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Then body parsers
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Static files LAST
app.use(express.static(path.join(__dirname, 'frontend')));

// Database setup
const db = new sqlite3.Database('./data/ash_database.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
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
      const defaultPassword = bcrypt.hashSync('admin123', 10);
      db.run(`INSERT OR IGNORE INTO admin_users (username, password) VALUES (?, ?)`, 
        ['admin', defaultPassword]);
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
    timestamp: new Date().toISOString(),
    session: req.session 
  });
});

// Simple test endpoint without auth
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API is working',
    timestamp: new Date().toISOString(),
    headers: {
      cookie: req.headers.cookie ? 'present' : 'missing',
      origin: req.headers.origin || 'same-origin'
    }
  });
});

// Simple session debug endpoint
app.get('/api/session-debug', (req, res) => {
  res.json({
    sessionId: req.sessionID,
    session: req.session,
    cookies: req.headers.cookie,
    origin: req.headers.origin,
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      isProduction,
      isHttps
    }
  });
});

// Test endpoint for debugging
app.get('/api/admin/test', (req, res) => {
  console.log('=== AUTH DEBUG INFO ===');
  console.log('Environment:', { NODE_ENV: process.env.NODE_ENV, isProduction, isHttps });
  console.log('Session ID:', req.sessionID);
  console.log('Session data:', req.session);
  console.log('Cookies:', req.headers.cookie);
  console.log('Origin:', req.headers.origin);
  console.log('User-Agent:', req.headers['user-agent']);
  res.json({ 
    environment: { NODE_ENV: process.env.NODE_ENV, isProduction, isHttps },
    sessionId: req.sessionID,
    session: req.session,
    cookies: req.headers.cookie,
    origin: req.headers.origin
  });
});

// Admin Authentication Middleware - Supports both Session and JWT
function requireAuth(req, res, next) {
  console.log('=== AUTH MIDDLEWARE ===');
  console.log('Session ID:', req.sessionID);
  console.log('Session data:', req.session);
  console.log('Origin:', req.headers.origin);
  console.log('Authorization header:', req.headers.authorization);
  
  // Check session first
  if (req.session && req.session.authenticated) {
    console.log('✅ Authenticated via session, proceeding...');
    return next();
  }
  
  // Check JWT token as fallback
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      console.log('✅ Authenticated via JWT, proceeding...');
      req.user = decoded.user; // Attach user to request
      return next();
    } catch (jwtError) {
      console.log('❌ JWT verification failed:', jwtError.message);
    }
  }
  
  console.log('❌ Auth failed - no valid session or JWT');
  console.log('Session exists:', !!req.session);
  console.log('Session authenticated:', req.session?.authenticated);
  console.log('Has Authorization header:', !!authHeader);
  
  res.status(401).json({ 
    success: false, 
    message: 'Authentication required',
    debug: {
      hasSession: !!req.session,
      sessionId: req.sessionID,
      isAuthenticated: req.session?.authenticated,
      hasAuthHeader: !!authHeader
    }
  });
}

// Admin login endpoint
app.post('/api/admin/login', (req, res) => {
  console.log('Login attempt:', req.body);
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username and password required' });
  }
  
  const sql = 'SELECT * FROM admin_users WHERE username = ?';
  db.get(sql, [username], (err, user) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    
    console.log('User found:', user);
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    req.session.authenticated = true;
    req.session.user = { id: user.id, username: user.username };
    console.log('Session set:', req.session);
    
    // Create JWT token as fallback
    const token = jwt.sign(
      { user: { id: user.id, username: user.username } },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // Save session before responding
    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
        // Fallback to JWT only if session fails
        return res.json({ 
          success: true, 
          message: 'Login successful (JWT only)',
          token: token,
          user: { id: user.id, username: user.username }
        });
      }
      console.log('Session saved successfully');
      res.json({ 
        success: true, 
        message: 'Login successful',
        token: token, // Include JWT as fallback
        user: { id: user.id, username: user.username }
      });
    });
  });
});

// Admin logout endpoint
app.post('/api/admin/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Logout failed' });
    }
    res.json({ success: true, message: 'Logout successful' });
  });
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
