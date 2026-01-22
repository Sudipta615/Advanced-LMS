# Troubleshooting Guide

Common issues and solutions for Advanced-LMS.

## Table of Contents

- [Backend Issues](#backend-issues)
- [Frontend Issues](#frontend-issues)
- [Database Issues](#database-issues)
- [Deployment Issues](#deployment-issues)
- [Performance Issues](#performance-issues)
- [Authentication Issues](#authentication-issues)
- [Email Issues](#email-issues)
- [Docker Issues](#docker-issues)

## Backend Issues

### Server Won't Start

**Symptom:** Backend fails to start or crashes immediately.

**Common Causes & Solutions:**

1. **Port Already in Use**
   ```bash
   # Find process using port 3001
   lsof -i :3001
   # Or on Windows
   netstat -ano | findstr :3001
   
   # Kill the process
   kill -9 <PID>
   # Or on Windows
   taskkill /PID <PID> /F
   
   # Alternative: Use different port in .env
   PORT=3002
   ```

2. **Missing Environment Variables**
   ```bash
   # Check if .env file exists
   ls -la backend/.env
   
   # Copy from example if missing
   cp backend/.env.example backend/.env
   
   # Verify all required variables are set
   cat backend/.env
   ```

3. **Module Not Found Errors**
   ```bash
   # Clean install dependencies
   cd backend
   rm -rf node_modules package-lock.json
   npm install
   
   # Clear npm cache if issues persist
   npm cache clean --force
   npm install
   ```

### Database Connection Errors

**Symptom:** 
```
SequelizeConnectionError: connect ECONNREFUSED 127.0.0.1:5432
```

**Solutions:**

1. **PostgreSQL Not Running**
   ```bash
   # Docker
   docker-compose ps postgres
   docker-compose up -d postgres
   
   # Local macOS
   brew services list | grep postgresql
   brew services start postgresql@16
   
   # Local Ubuntu
   sudo systemctl status postgresql
   sudo systemctl start postgresql
   ```

2. **Wrong Database Credentials**
   ```bash
   # Test connection manually
   psql -h localhost -U lms_user -d advanced_lms
   
   # If fails, verify credentials in .env match database
   # backend/.env
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=lms_user
   DB_PASSWORD=your_password
   DB_NAME=advanced_lms
   ```

3. **Database Doesn't Exist**
   ```sql
   # Connect to PostgreSQL
   psql postgres
   
   # Create database
   CREATE DATABASE advanced_lms;
   
   # Grant permissions
   GRANT ALL PRIVILEGES ON DATABASE advanced_lms TO lms_user;
   ```

4. **Connection Pool Exhausted**
   ```javascript
   // Increase pool size in backend/src/config/database.js
   pool: {
     max: 20,
     min: 5,
     acquire: 30000,
     idle: 10000
   }
   ```

### Redis Connection Errors

**Symptom:**
```
Error: connect ECONNREFUSED 127.0.0.1:6379
```

**Solutions:**

1. **Redis Not Running**
   ```bash
   # Docker
   docker-compose up -d redis
   
   # Local macOS
   brew services start redis
   
   # Local Ubuntu
   sudo systemctl start redis-server
   
   # Test connection
   redis-cli ping
   # Should return: PONG
   ```

2. **Wrong Redis URL**
   ```bash
   # Verify REDIS_URL in backend/.env
   REDIS_URL=redis://localhost:6379
   
   # With password
   REDIS_URL=redis://:password@localhost:6379
   ```

3. **Redis Memory Full**
   ```bash
   # Check Redis memory usage
   redis-cli info memory
   
   # Clear all data (use carefully!)
   redis-cli FLUSHALL
   
   # Set max memory in redis.conf
   maxmemory 256mb
   maxmemory-policy allkeys-lru
   ```

### API Endpoint Not Found

**Symptom:** 404 errors for valid endpoints.

**Solutions:**

1. **Check Route Registration**
   ```javascript
   // Verify in backend/app.js
   app.use('/api/auth', authRoutes);
   app.use('/api/courses', courseRoutes);
   ```

2. **Verify HTTP Method**
   ```bash
   # Wrong
   curl -X GET http://localhost:3001/api/auth/login
   
   # Correct
   curl -X POST http://localhost:3001/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"password"}'
   ```

3. **Check Middleware Order**
   ```javascript
   // Authentication must be before protected routes
   app.use('/api/auth', authRoutes);
   app.use('/api/courses', authenticateToken, courseRoutes);
   ```

### Validation Errors

**Symptom:** 400 Bad Request with validation errors.

**Solution:**
```bash
# Check request body matches schema
# See backend/src/validators/ for validation rules

# Example: Login requires email and password
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "Password123!@#"
  }'
```

### File Upload Issues

**Symptom:** File uploads fail or return errors.

**Solutions:**

1. **File Size Too Large**
   ```env
   # Increase in backend/.env
   MAX_FILE_SIZE=104857600  # 100MB in bytes
   ```

2. **Upload Directory Doesn't Exist**
   ```bash
   # Create upload directory
   mkdir -p /var/uploads
   chmod 755 /var/uploads
   
   # Or in .env
   UPLOAD_PATH=./uploads
   ```

3. **File Type Not Allowed**
   ```env
   # Add allowed types in backend/.env
   ALLOWED_FILE_TYPES=pdf,doc,docx,jpg,png,mp4
   ```

### Rate Limiting Issues

**Symptom:** "Too many requests" error (429).

**Solution:**
```javascript
// Adjust rate limits in backend/src/middleware/rateLimiter.js
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10 // increase from 5 to 10
});

// Clear rate limit for testing
// Redis stores rate limit data
redis-cli KEYS "rate-limit:*" | xargs redis-cli DEL
```

## Frontend Issues

### Build Errors

**Symptom:** `npm run build` fails.

**Solutions:**

1. **TypeScript Errors**
   ```bash
   # Check for type errors
   cd frontend
   npm run type-check
   
   # Fix type errors or temporarily ignore
   // @ts-ignore (use sparingly)
   ```

2. **Module Not Found**
   ```bash
   # Clean install
   cd frontend
   rm -rf .next node_modules package-lock.json
   npm install
   npm run build
   ```

3. **Out of Memory**
   ```bash
   # Increase Node memory
   NODE_OPTIONS=--max-old-space-size=4096 npm run build
   
   # Add to package.json
   "build": "NODE_OPTIONS=--max-old-space-size=4096 next build"
   ```

### Authentication Not Working

**Symptom:** Login successful but redirects back to login page.

**Solutions:**

1. **Token Not Being Stored**
   ```typescript
   // Check localStorage in browser console
   console.log(localStorage.getItem('accessToken'));
   
   // Verify AuthContext is wrapping app
   // frontend/app/layout.tsx
   <AuthProvider>
     {children}
   </AuthProvider>
   ```

2. **CORS Issues**
   ```javascript
   // Verify backend CORS config includes frontend URL
   // backend/src/config/corsConfig.js
   origin: ['http://localhost:3000', 'https://yourdomain.com']
   ```

3. **Token Expired**
   ```typescript
   // Implement token refresh in frontend/lib/api.ts
   if (error.response?.status === 401) {
     // Refresh token logic
     await refreshToken();
     // Retry request
   }
   ```

### API Calls Failing

**Symptom:** Network errors or CORS errors in browser console.

**Solutions:**

1. **Wrong API URL**
   ```env
   # Verify frontend/.env.local
   NEXT_PUBLIC_API_URL=http://localhost:3001
   
   # Or for production
   NEXT_PUBLIC_API_URL=https://api.yourdomain.com
   ```

2. **CORS Errors**
   ```
   Access to XMLHttpRequest at 'http://localhost:3001/api/courses' 
   from origin 'http://localhost:3000' has been blocked by CORS policy
   ```
   
   **Fix:**
   ```javascript
   // backend/src/config/corsConfig.js
   module.exports = {
     origin: ['http://localhost:3000'],
     credentials: true
   };
   ```

3. **Network Request Failed**
   ```bash
   # Check backend is running
   curl http://localhost:3001/health
   
   # Check firewall isn't blocking
   sudo ufw status
   ```

### Styling Issues

**Symptom:** Styles not applying or Tailwind classes not working.

**Solutions:**

1. **Tailwind Not Compiling**
   ```bash
   # Verify tailwind.config.js content paths
   content: [
     './app/**/*.{js,ts,jsx,tsx}',
     './components/**/*.{js,ts,jsx,tsx}',
   ]
   
   # Restart dev server
   npm run dev
   ```

2. **CSS Not Loading**
   ```typescript
   // Verify globals.css imported in layout.tsx
   import './globals.css'
   ```

3. **CSS Caching Issues**
   ```bash
   # Clear Next.js cache
   rm -rf .next
   npm run dev
   
   # Hard refresh browser: Cmd+Shift+R (Mac) or Ctrl+F5 (Windows)
   ```

### Hydration Errors

**Symptom:**
```
Error: Hydration failed because the initial UI does not match 
what was rendered on the server
```

**Solutions:**

1. **Server/Client Mismatch**
   ```typescript
   // Use useEffect for client-only code
   const [mounted, setMounted] = useState(false);
   
   useEffect(() => {
     setMounted(true);
   }, []);
   
   if (!mounted) return null;
   ```

2. **Invalid HTML Nesting**
   ```typescript
   // Wrong: <p> cannot contain <div>
   <p><div>Content</div></p>
   
   // Correct
   <div><div>Content</div></div>
   ```

## Database Issues

### Migration Failures

**Symptom:** Migrations fail to run.

**Solutions:**

1. **Syntax Error in Migration**
   ```bash
   # Check migration file syntax
   cat backend/src/migrations/YYYYMMDD_migration_name.js
   
   # Test migration manually
   npm run migrate:rollback
   npm run migrate
   ```

2. **Migration Already Run**
   ```sql
   -- Check migrations table
   SELECT * FROM migrations;
   
   -- Remove failed migration
   DELETE FROM migrations WHERE name = 'migration_name';
   
   -- Re-run
   npm run migrate
   ```

3. **Foreign Key Constraint**
   ```sql
   -- Drop constraints if needed
   ALTER TABLE table_name DROP CONSTRAINT constraint_name;
   
   -- Then re-run migration
   ```

### Slow Queries

**Symptom:** API endpoints taking 5+ seconds to respond.

**Solutions:**

1. **Missing Indexes**
   ```sql
   -- Check query execution plan
   EXPLAIN ANALYZE SELECT * FROM enrollments WHERE user_id = 'uuid';
   
   -- Add index
   CREATE INDEX idx_enrollments_user_id ON enrollments(user_id);
   ```

2. **N+1 Query Problem**
   ```javascript
   // Bad: Causes N+1 queries
   const courses = await Course.findAll();
   for (let course of courses) {
     course.instructor = await User.findByPk(course.instructorId);
   }
   
   // Good: Use eager loading
   const courses = await Course.findAll({
     include: [{ model: User, as: 'instructor' }]
   });
   ```

3. **Large Result Sets**
   ```javascript
   // Add pagination
   const courses = await Course.findAll({
     limit: 20,
     offset: (page - 1) * 20
   });
   ```

### Connection Pool Exhausted

**Symptom:**
```
SequelizeConnectionAcquireTimeoutError: Operation timeout
```

**Solutions:**

```javascript
// Increase pool size in backend/src/config/database.js
pool: {
  max: 20,        // Increase from 10
  min: 5,
  acquire: 60000, // Increase timeout
  idle: 10000
}

// Ensure connections are released
// Always use try-finally
const connection = await sequelize.connectionManager.getConnection();
try {
  // Use connection
} finally {
  sequelize.connectionManager.releaseConnection(connection);
}
```

### Database Locked (SQLite Development)

**Symptom:** "Database is locked" error (if using SQLite for dev).

**Solution:**
```bash
# Use PostgreSQL instead, even for development
# SQLite is not suitable for concurrent access
```

## Deployment Issues

### Environment Variables Missing

**Symptom:** Application crashes with "undefined" errors in production.

**Solutions:**

1. **Verify All Variables Set**
   ```bash
   # Docker
   docker-compose exec backend env | grep DB_
   
   # Heroku
   heroku config
   
   # AWS/Server
   cat /path/to/app/backend/.env
   ```

2. **Frontend Environment Variables**
   ```bash
   # Next.js requires NEXT_PUBLIC_ prefix for client-side
   # Verify in Vercel/deployment platform dashboard
   NEXT_PUBLIC_API_URL=https://api.yourdomain.com
   ```

### SSL Certificate Errors

**Symptom:** "Your connection is not private" browser warning.

**Solutions:**

1. **Certificate Expired**
   ```bash
   # Check expiry
   echo | openssl s_client -connect yourdomain.com:443 2>/dev/null | openssl x509 -noout -dates
   
   # Renew Let's Encrypt
   sudo certbot renew
   sudo systemctl reload nginx
   ```

2. **Wrong Certificate Path**
   ```nginx
   # Verify paths in nginx config
   ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
   ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
   ```

3. **Mixed Content Errors**
   ```env
   # Ensure API uses HTTPS
   NEXT_PUBLIC_API_URL=https://api.yourdomain.com
   # Not: http://api.yourdomain.com
   ```

### Docker Container Exits Immediately

**Symptom:** Container starts then stops.

**Solutions:**

```bash
# Check logs
docker-compose logs backend

# Common issues:
# 1. Syntax error in code
# 2. Missing environment variable
# 3. Database not ready

# Add health checks and depends_on in docker-compose.yml
depends_on:
  postgres:
    condition: service_healthy

# Verify Dockerfile CMD/ENTRYPOINT
CMD ["node", "server.js"]
```

### Database Migrations Not Running in Production

**Symptom:** Production database schema out of date.

**Solutions:**

```bash
# Docker
docker-compose -f docker-compose.prod.yml exec backend npm run migrate

# Heroku
heroku run npm run migrate

# Direct server access
cd /path/to/app/backend
NODE_ENV=production npm run migrate

# Automate in CI/CD pipeline
# Add to deploy script
npm run migrate && npm start
```

## Performance Issues

### High Response Times

**Symptom:** API endpoints taking 2-5+ seconds.

**Solutions:**

1. **Enable Caching**
   ```javascript
   // Cache frequently accessed data in Redis
   const cachedCourses = await redis.get('courses:all');
   if (cachedCourses) {
     return JSON.parse(cachedCourses);
   }
   
   const courses = await Course.findAll();
   await redis.set('courses:all', JSON.stringify(courses), 'EX', 300); // 5 min
   return courses;
   ```

2. **Optimize Queries**
   ```javascript
   // Use select to limit fields
   const users = await User.findAll({
     attributes: ['id', 'firstName', 'lastName', 'email']
   });
   
   // Add indexes
   CREATE INDEX idx_users_email ON users(email);
   ```

3. **Enable Compression**
   ```javascript
   // Already enabled in backend/app.js
   app.use(compression());
   ```

See [../backend/PERFORMANCE_GUIDE.md](../backend/PERFORMANCE_GUIDE.md) for detailed optimization.

### High Memory Usage

**Symptom:** Application crashes with out-of-memory errors.

**Solutions:**

```bash
# Increase Node memory limit
NODE_OPTIONS=--max-old-space-size=2048 npm start

# Check for memory leaks
node --inspect server.js
# Then use Chrome DevTools to profile memory

# Monitor memory
docker stats lms-backend
```

### Database Running Out of Connections

**Symptom:** "remaining connection slots reserved for non-replication superuser connections"

**Solutions:**

```sql
-- Check current connections
SELECT count(*) FROM pg_stat_activity;

-- Increase max connections in PostgreSQL
ALTER SYSTEM SET max_connections = 200;

-- Restart PostgreSQL
sudo systemctl restart postgresql

-- Ensure connection pool is configured properly
pool: { max: 20, min: 5 }
```

## Authentication Issues

### JWT Token Invalid

**Symptom:** "Invalid token" or "Token expired" errors.

**Solutions:**

1. **Token Expired**
   ```typescript
   // Implement refresh token logic in frontend
   try {
     await api.get('/courses');
   } catch (error) {
     if (error.response?.status === 401) {
       const refreshed = await refreshAccessToken();
       if (refreshed) {
         // Retry request
       }
     }
   }
   ```

2. **Wrong Secret**
   ```bash
   # Verify JWT_SECRET matches between environments
   # Backend and frontend must use same secret
   ```

3. **Malformed Token**
   ```typescript
   // Check token format in browser storage
   // Should be: Bearer <token>
   const token = localStorage.getItem('accessToken');
   console.log(token);
   ```

### Session Not Persisting

**Symptom:** User logged out on page refresh.

**Solutions:**

```typescript
// Verify token is stored persistently
localStorage.setItem('accessToken', token);

// Check AuthContext initializes from storage
useEffect(() => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    setUser(getUserFromToken(token));
  }
}, []);
```

## Email Issues

### Emails Not Sending

**Symptom:** Registration/password reset emails not received.

**Solutions:**

1. **SMTP Configuration**
   ```env
   # Verify SMTP settings in backend/.env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password  # Not regular password!
   ```

2. **Gmail App Password**
   ```
   # For Gmail, use App Password:
   # 1. Enable 2FA on Google Account
   # 2. Go to Google Account > Security > App Passwords
   # 3. Generate password for "Mail"
   # 4. Use that password in SMTP_PASS
   ```

3. **Check Spam Folder**
   ```
   # Emails might be in spam
   # Improve by:
   # - Setting up SPF, DKIM, DMARC records
   # - Using dedicated email service (SendGrid, Mailgun)
   ```

4. **Test Email Service**
   ```javascript
   // Create test endpoint
   app.post('/api/test-email', async (req, res) => {
     await emailService.sendEmail({
       to: req.body.email,
       subject: 'Test Email',
       html: '<p>Test successful</p>'
     });
     res.json({ success: true });
   });
   ```

### Emails Going to Spam

**Solutions:**

1. **Configure DNS Records**
   ```
   # SPF Record
   v=spf1 include:_spf.google.com ~all
   
   # DKIM Record
   # Provided by email service provider
   
   # DMARC Record
   v=DMARC1; p=quarantine; rua=mailto:dmarc@yourdomain.com
   ```

2. **Use Dedicated Email Service**
   ```bash
   # Recommended services:
   # - SendGrid
   # - Mailgun
   # - AWS SES
   # - Postmark
   ```

## Docker Issues

### Docker Build Fails

**Symptom:** `docker-compose build` fails.

**Solutions:**

```bash
# Clean Docker cache
docker system prune -a
docker volume prune

# Rebuild with no cache
docker-compose build --no-cache

# Check Dockerfile syntax
docker-compose config

# Check disk space
df -h
```

### Container Can't Connect to Others

**Symptom:** Backend can't reach database.

**Solutions:**

```bash
# Use service names as hostnames
# backend/.env
DB_HOST=postgres  # Not localhost!
REDIS_URL=redis://redis:6379

# Verify services are on same network
docker network ls
docker network inspect advanced-lms_default

# Check service status
docker-compose ps
```

### Volume Permission Issues

**Symptom:** Permission denied errors in containers.

**Solutions:**

```bash
# Fix volume permissions
sudo chown -R 1000:1000 ./uploads
sudo chmod -R 755 ./uploads

# Or in Dockerfile
RUN mkdir -p /var/uploads && chown node:node /var/uploads
USER node
```

## When to Escalate

If you've tried the solutions above and the issue persists:

1. **Gather Information:**
   - Exact error message
   - Steps to reproduce
   - Environment (OS, Node version, etc.)
   - Logs from all relevant services

2. **Check Existing Issues:**
   - Search GitHub issues
   - Check documentation again

3. **Open New Issue:**
   - Include all gathered information
   - Provide code snippets if relevant
   - Attach logs (remove sensitive data)

## Additional Resources

- **Development Setup**: [DEVELOPMENT_SETUP.md](./DEVELOPMENT_SETUP.md)
- **Deployment Guide**: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
- **Architecture**: [ARCHITECTURE.md](./ARCHITECTURE.md)
- **API Documentation**: [../backend/API_DOCUMENTATION.md](../backend/API_DOCUMENTATION.md)
- **Performance**: [../backend/PERFORMANCE_GUIDE.md](../backend/PERFORMANCE_GUIDE.md)
- **Security**: [../backend/SECURITY_HARDENING_GUIDE.md](../backend/SECURITY_HARDENING_GUIDE.md)

---

Still having issues? Open a GitHub issue with details and we'll help! 🆘
