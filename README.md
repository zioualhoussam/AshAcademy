# ASH Educational Center

A modern, full-stack educational management system with student enrollment, contact management, and admin dashboard.

## 🚀 Features

### Frontend (ASH Educational System)
- **Responsive Design**: Mobile-first, modern UI with smooth animations
- **Student Enrollment**: Interactive form with real-time validation
- **Contact Management**: Professional contact form with message handling
- **Course Showcase**: Beautiful course listings with detailed information
- **Board Games Section**: Interactive gaming activities display
- **Toast Notifications**: User-friendly feedback system
- **Loading States**: Professional loading indicators
- **Form Validation**: Comprehensive client-side validation

### Admin Dashboard
- **Secure Authentication**: Session-based login system
- **Enrollment Management**: Approve/reject student enrollments
- **Contact Management**: View and manage contact submissions
- **Real-time Statistics**: Dashboard with live data updates
- **Status Tracking**: Monitor enrollment and contact statuses
- **Responsive Interface**: Works on all device sizes

### Backend (Node.js + Express + SQLite)
- **RESTful API**: Clean, well-structured endpoints
- **Database**: SQLite for simplicity and reliability
- **Authentication**: Secure session management with bcrypt
- **Input Validation**: Comprehensive server-side validation
- **Error Handling**: Robust error management and logging
- **CORS Protection**: Proper cross-origin resource sharing

## 🛠 Tech Stack

### Frontend
- **HTML5**: Semantic, accessible markup
- **CSS3**: Modern styling with animations and transitions
- **JavaScript (ES6+)**: Modern JavaScript with async/await
- **Google Fonts**: Professional typography (Playfair Display, DM Sans)

### Backend
- **Node.js**: JavaScript runtime environment
- **Express.js**: Web application framework
- **SQLite**: Lightweight, file-based database
- **bcryptjs**: Password hashing and comparison
- **express-session**: Session management
- **express-validator**: Input validation (if needed)

## 📁 Project Structure

```
pie/
├── ASH-Educational-system/
│   ├── ash-educational-center.html  # Main frontend application
│   ├── admin.html                  # Admin dashboard interface
│   ├── ash.js                      # Main frontend JavaScript
│   ├── admin.js                    # Admin dashboard JavaScript
│   └── ash.png                      # Logo/branding image
└── backend/
    ├── server.js                    # Express server and API endpoints
    ├── package.json                 # Node.js dependencies
    ├── ash_database.db             # SQLite database (auto-created)
    └── node_modules/               # Installed dependencies
```

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v14 or higher)
- **npm** (comes with Node.js)
- **Modern web browser** (Chrome, Firefox, Safari, Edge)

### Installation & Setup

1. **Clone/Download** the project
   ```bash
   cd pie
   ```

2. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Start Development Server**
   ```bash
   cd backend
   npm run dev
   ```

4. **Access Applications**
   - **Main Website**: http://localhost:5000
   - **Admin Dashboard**: http://localhost:5000/admin

5. **Quick Deploy** (Windows)
   ```bash
   deploy.bat
   ```

6. **Quick Deploy** (Unix/Linux/Mac)
   ```bash
   chmod +x deploy.sh
   ./deploy.sh
   ```

## 🔐 Default Credentials

**Admin Login:**
- **Username**: `admin`
- **Password**: `admin123`

> ⚠️ **Security Note**: Change these credentials in production!

## 📚 API Documentation

### Authentication Endpoints

#### POST `/api/admin/login`
Login to admin dashboard.
```json
{
  "username": "admin",
  "password": "admin123"
}
```

#### POST `/api/admin/logout`
Logout from admin dashboard.
```json
{}
```

### Data Management Endpoints

#### GET `/api/admin/stats`
Get dashboard statistics.
```json
{
  "success": true,
  "data": {
    "totalEnrollments": 15,
    "totalContacts": 8,
    "pendingEnrollments": 3
  }
}
```

#### GET `/api/admin/enrollments`
Get all enrollment records.
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "John Doe",
      "phone": "+1234567890",
      "course": "High School Preparation",
      "status": "pending",
      "created_at": "2024-03-25T10:00:00.000Z"
    }
  ]
}
```

#### PUT `/api/admin/enrollments/:id/status`
Update enrollment status (approve/reject).
```json
{
  "status": "approved"
}
```

#### GET `/api/admin/contacts`
Get all contact submissions.
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Jane Smith",
      "email": "jane@example.com",
      "message": "I'm interested in your courses...",
      "status": "new",
      "created_at": "2024-03-25T10:00:00.000Z"
    }
  ]
}
```

### Public Endpoints

#### POST `/api/enroll`
Submit enrollment form.
```json
{
  "name": "John Doe",
  "phone": "+1234567890",
  "course": "High School Preparation"
}
```

#### POST `/api/contact`
Submit contact form.
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com", 
  "message": "I'm interested in your courses..."
}
```

## 🎨 Frontend Features

### Form Validation
- **Real-time validation** with immediate feedback
- **Input sanitization** to prevent XSS attacks
- **Loading states** during form submission
- **Error messages** with clear, helpful text

### User Experience
- **Smooth animations** and transitions
- **Responsive design** for all screen sizes
- **Toast notifications** for user feedback
- **Mobile-friendly** navigation and interactions

### Admin Dashboard
- **Modern interface** with intuitive navigation
- **Real-time updates** without page refresh
- **Confirmation dialogs** for destructive actions
- **Status badges** for visual feedback
- **Data tables** with sorting and filtering

## 🔒 Security Features

### Authentication
- **Password hashing** with bcrypt (10 rounds)
- **Session management** with secure cookies
- **CSRF protection** through same-site cookies
- **Rate limiting** (can be easily added)
- **Input validation** on both client and server

### Data Protection
- **SQL injection prevention** with parameterized queries
- **XSS protection** through input sanitization
- **CORS configuration** for cross-origin requests
- **Secure headers** for enhanced security

## 🗄 Database Schema

### Enrollments Table
```sql
CREATE TABLE enrollments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  course TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Contacts Table
```sql
CREATE TABLE contacts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Admin Users Table
```sql
CREATE TABLE admin_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 🌐 Deployment

### Development
```bash
npm run dev  # If using nodemon
node server.js
```

### Production
```bash
# Set environment variables
export NODE_ENV=production
export PORT=80

# Install PM2 for process management
npm install -g pm2

# Start with PM2
pm2 start server.js --name "ash-educational"
```

### Environment Variables
```bash
NODE_ENV=development
PORT=5000
SESSION_SECRET=your-secret-key-here
```

## 🧪 Testing

### Frontend Testing
- Open browser developer tools
- Test form validation with various inputs
- Test responsive design on different screen sizes
- Verify toast notifications appear correctly

### Backend Testing
```bash
# Test health endpoint
curl http://localhost:5000/api/health

# Test authentication
curl -X POST -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' \
  http://localhost:5000/api/admin/login
```

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the backend directory:
```env
NODE_ENV=development
PORT=5000
SESSION_SECRET=your-super-secret-session-key
```

### Customization
- **Colors**: Modify CSS variables in `ash-educational-center.html`
- **Fonts**: Change Google Fonts import
- **Courses**: Update course options in enrollment form
- **Branding**: Replace logo and company information

## 🐛 Troubleshooting

### Common Issues

#### Server Won't Start
```bash
# Check if port is in use
netstat -an | grep :5000

# Kill existing process
taskkill /F /IM node.exe
```

#### Authentication Not Working
1. Clear browser cookies and cache
2. Check backend console for errors
3. Verify session middleware order
4. Test with different browser/incognito mode

#### Database Errors
```bash
# Recreate database
rm ash_database.db
node server.js  # Will auto-recreate with proper schema
```

#### Frontend Not Loading
1. Check browser console for JavaScript errors
2. Verify static file serving is working
3. Test network requests in browser dev tools

## 📈 Performance Optimization

### Frontend
- **Image optimization**: Compress logos and images
- **CSS minification**: For production builds
- **JavaScript bundling**: Combine and minify JS files
- **Lazy loading**: For large datasets

### Backend
- **Database indexing**: Add indexes for frequently queried fields
- **Response caching**: Cache static responses
- **Connection pooling**: For high-traffic scenarios
- **Compression**: Enable gzip compression

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch
3. **Make** your changes with clear commit messages
4. **Test** thoroughly before submitting
5. **Follow** the existing code style and patterns

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).

## 📞 Support

For support and questions:
- **Issues**: Create an issue on GitHub
- **Discussions**: Use GitHub Discussions
- **Email**: [your-email@example.com]

---

**ASH Educational Center** - Empowering education through technology 🎓
