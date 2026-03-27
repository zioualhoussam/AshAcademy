# Deployment Guide

This guide covers deployment options for the ASH Educational Center project to production environments.

## 🚀 Quick Deployment Options

### Option 1: Vercel (Recommended for Frontend)
**Best for**: Static frontend hosting with separate backend

#### Steps:
1. **Prepare for Production**
   ```bash
   # Update production URLs in admin.js
   sed -i 's|http://localhost:5000|https://your-backend-url.com|g' admin.js
   ```

2. **Deploy Frontend to Vercel**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Deploy frontend
   cd ASH-Educational-system
   vercel --prod
   ```

3. **Deploy Backend Separately**
   - Choose from: Railway, Render, Heroku, DigitalOcean
   - Follow backend deployment guides below

---

### Option 2: Railway (Full Stack)
**Best for**: Easy full-stack deployment with database

#### Steps:
1. **Create Railway Account**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub

2. **Prepare Project**
   ```bash
   # Create railway.toml
   cat > railway.toml << EOF
   [build]
   builder = "nixpacks"
   
   [deploy]
   startCommand = "node server.js"
   restartPolicyType = "on_failure"
   restartPolicyMaxRetries = 2
   EOF
   
   # Add production environment variables
   echo "NODE_ENV=production" >> .env
   echo "PORT=$PORT" >> .env
   ```

3. **Deploy to Railway**
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli
   
   # Deploy
   railway login
   railway link
   railway up
   ```

---

### Option 3: Render (Full Stack)
**Best for**: Professional hosting with custom domains

#### Steps:
1. **Create Render Account**
   - Go to [render.com](https://render.com)
   - Sign up with GitHub

2. **Prepare Project**
   ```bash
   # Create render.yaml
   cat > render.yaml << EOF
   services:
     type: web
     name: ash-educational-center
     env: node
     buildCommand: "npm install"
     startCommand: "node server.js"
     envVars:
       - key: NODE_ENV
         value: production
       - key: PORT
         value: 10000
   EOF
   ```

3. **Deploy to Render**
   ```bash
   # Install Render CLI
   npm install -g render-cli
   
   # Deploy
   render login
   render yaml
   ```

---

### Option 4: Heroku (Full Stack)
**Best for**: Traditional PaaS with add-ons

#### Steps:
1. **Create Heroku Account**
   - Go to [heroku.com](https://heroku.com)
   - Sign up with GitHub

2. **Prepare Project**
   ```bash
   # Create Procfile
   echo "web: node server.js" > Procfile
   
   # Update package.json
   npm pkg set heroku-postbuild
   npm pkg set start "node server.js"
   
   # Create .env for production
   echo "NODE_ENV=production" >> .env
   echo "PORT=$PORT" >> .env
   ```

3. **Deploy to Heroku**
   ```bash
   # Install Heroku CLI
   npm install -g heroku
   
   # Create app
   heroku create ash-educational-center
   
   # Deploy
   heroku git:remote -a heroku https://git.heroku.com/ash-educational-center.git
   git push heroku main
   ```

---

### Option 5: DigitalOcean App Platform
**Best for**: Full control and scalability

#### Steps:
1. **Create DigitalOcean Account**
   - Go to [digitalocean.com](https://digitalocean.com)
   - Create account

2. **Prepare Project**
   ```bash
   # Create .do/app.yaml
   cat > .do/app.yaml << EOF
   name: ash-educational-center
   services:
     - name: web
       source_dir: /
       github:
         repo: your-username/ash-educational-center
         branch: main
       run_command: node server.js
       environment_slug: node-js
       instance_count: 1
       instance_size_slug: basic-xxs
       envs:
         - key: NODE_ENV
           value: production
         - key: PORT
           value: 8080
   EOF
   ```

3. **Deploy to DigitalOcean**
   ```bash
   # Install doctl
   npm install -g doctl
   
   # Authenticate
   doctl auth init
   
   # Deploy
   doctl apps create --spec .do/app.yaml
   ```

---

## 🔧 Production Configuration

### Environment Variables
Create `.env` file in backend directory:
```env
NODE_ENV=production
PORT=8080
SESSION_SECRET=your-super-secure-session-key-change-this-in-production
DATABASE_URL=./ash_database.db
```

### Security Settings for Production
1. **Update CORS Origins**
   ```javascript
   // In server.js, update CORS origins:
   origin: ['https://yourdomain.com', 'https://www.yourdomain.com']
   ```

2. **Enable HTTPS Redirect**
   ```javascript
   // Add HTTPS redirect middleware
   app.use((req, res, next) => {
     if (req.header('x-forwarded-proto') === 'https') {
       return res.redirect(`https://${req.header('host')}${req.url}`);
     }
     next();
   });
   ```

3. **Database Security**
   ```bash
   # Set proper file permissions
   chmod 600 ash_database.db
   
   # Enable WAL mode for better performance
   sqlite3 ash_database.db "PRAGMA journal_mode=WAL;"
   ```

## 📊 Performance Optimization

### Frontend Optimization
```bash
# Minify CSS and JS
npm install -g clean-css-cli uglify-js

# Optimize images
npm install -g imagemin-cli

# Build production version
npm run build
```

### Backend Optimization
```bash
# Enable compression
npm install compression

# Add to server.js
const compression = require('compression');
app.use(compression());

# Add request logging
const morgan = require('morgan');
app.use(morgan('combined'));
```

## 🔍 Monitoring & Logging

### Application Monitoring
```javascript
// Add to server.js
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log', level: 'info' })
  ]
});

// Replace console.log with logger
logger.info('Application started');
```

### Health Checks
```javascript
// Add to server.js
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});
```

## 🚨 Important Security Notes

### Production Checklist
- [ ] Change default admin credentials
- [ ] Use environment variables for secrets
- [ ] Enable HTTPS with valid certificates
- [ ] Set up proper CORS origins
- [ ] Implement rate limiting
- [ ] Add request logging and monitoring
- [ ] Set up database backups
- [ ] Configure firewall rules
- [ ] Test all endpoints thoroughly

### Database Backups
```bash
# Automated backup script
cat > backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
sqlite3 ash_database.db ".backup backup_$DATE.db"
echo "Backup created: backup_$DATE.db"
EOF

chmod +x backup.sh

# Add to crontab (run daily at 2 AM)
crontab -e
0 2 * * * /path/to/backup.sh
```

## 🌐 Domain & SSL Setup

### Custom Domain Configuration
```nginx
# Example Nginx configuration
server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    
    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;
    
    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $scheme;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 📱 Mobile App Deployment

### Progressive Web App (PWA)
```bash
# Create manifest.json
cat > public/manifest.json << EOF
{
  "name": "ASH Educational Center",
  "short_name": "ASH Education",
  "description": "Educational management system",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#1a2f55",
  "theme_color": "#1a2f55",
  "orientation": "portrait"
}
EOF

# Create service worker
cat > public/sw.js << 'EOF'
const CACHE_NAME = 'ash-educational-v1';
const urlsToCache = [
  '/',
  '/ash-educational-center.html',
  '/admin.html'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
EOF
```

## 🔄 CI/CD Pipeline

### GitHub Actions
Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: |
        cd backend
        npm ci
        
    - name: Deploy to Railway
      run: |
        npx railway deploy
      env:
        RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
```

## 📞 Troubleshooting Deployment

### Common Issues & Solutions

#### Port Already in Use
```bash
# Find and kill process
lsof -ti:8080
kill -9 <PID>

# Or use different port
export PORT=8081
```

#### Database Connection Issues
```bash
# Check database permissions
ls -la ash_database.db

# Recreate database
rm ash_database.db
node server.js  # Will recreate with proper schema
```

#### CORS Issues
```javascript
// Debug CORS
app.use((req, res, next) => {
  console.log('Origin:', req.headers.origin);
  console.log('Method:', req.method);
  next();
});
```

#### Memory Issues
```bash
# Monitor memory usage
node --max-old-space-size=4096 server.js

# Add memory monitoring
setInterval(() => {
  const used = process.memoryUsage();
  console.log('Memory:', used);
}, 60000); // Every minute
```

## 🎯 Production Deployment Checklist

### Pre-Deployment
- [ ] Test all functionality locally
- [ ] Update environment variables
- [ ] Change default passwords
- [ ] Optimize images and assets
- [ ] Set up monitoring
- [ ] Prepare database backups
- [ ] Test SSL certificates

### Post-Deployment
- [ ] Verify all endpoints are working
- [ ] Test admin functionality
- [ ] Check database connectivity
- [ ] Monitor performance metrics
- [ ] Set up alerting for errors
- [ ] Test mobile responsiveness
- [ ] Verify CORS configuration
- [ ] Test form submissions
- [ ] Check SSL certificate validity

---

**Choose the deployment option that best fits your needs and follow the specific guide!**
