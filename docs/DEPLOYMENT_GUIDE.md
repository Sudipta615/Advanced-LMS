# Deployment Guide

Complete guide for deploying Advanced-LMS to production.

## Table of Contents

- [Pre-Deployment Checklist](#pre-deployment-checklist)
- [Environment Configuration](#environment-configuration)
- [Database Deployment](#database-deployment)
- [Docker Deployment](#docker-deployment)
- [Cloud Deployment Options](#cloud-deployment-options)
- [Reverse Proxy Setup](#reverse-proxy-setup)
- [SSL/TLS Configuration](#ssltls-configuration)
- [Monitoring & Logging](#monitoring--logging)
- [Backup & Disaster Recovery](#backup--disaster-recovery)
- [Post-Deployment](#post-deployment)
- [Rollback Procedures](#rollback-procedures)
- [Security Hardening](#security-hardening)

## Pre-Deployment Checklist

Before deploying to production, ensure:

### Code Quality
- [ ] All tests passing (`npm test` in backend and frontend)
- [ ] No TypeScript errors (`npm run type-check` in frontend)
- [ ] Code linting passes (`npm run lint`)
- [ ] Security vulnerabilities checked (`npm audit`)
- [ ] Performance testing completed
- [ ] Code reviewed and approved

### Security
- [ ] All secrets are environment variables (no hardcoded credentials)
- [ ] Strong JWT secrets generated (64+ characters)
- [ ] CSRF protection enabled
- [ ] Rate limiting configured
- [ ] CORS properly configured for production domain
- [ ] Helmet.js security headers enabled
- [ ] SQL injection protection verified (Sequelize parameterized queries)
- [ ] XSS protection enabled
- [ ] Input validation on all endpoints

### Infrastructure
- [ ] Production database created and secured
- [ ] Redis instance provisioned
- [ ] SSL certificates obtained
- [ ] DNS records configured
- [ ] Load balancer configured (if applicable)
- [ ] CDN configured for static assets (if applicable)
- [ ] Backup system in place

### Configuration
- [ ] Production `.env` files configured
- [ ] Email service configured (SMTP)
- [ ] File storage configured (local or S3)
- [ ] Logging configured (file or external service)
- [ ] Monitoring configured

### Documentation
- [ ] Deployment runbook updated
- [ ] Team notified of deployment
- [ ] Rollback plan documented

## Environment Configuration

### Production Environment Variables

Create `backend/.env` for production:

```env
# ======================
# Server Configuration
# ======================
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://yourdomain.com

# ======================
# Database Configuration
# ======================
DB_HOST=your-db-host.com
DB_PORT=5432
DB_NAME=advanced_lms_prod
DB_USER=lms_production_user
DB_PASSWORD=STRONG_DATABASE_PASSWORD_HERE

# Connection Pool Settings
DB_POOL_MAX=20
DB_POOL_MIN=5
DB_POOL_ACQUIRE=30000
DB_POOL_IDLE=10000

# ======================
# Redis Configuration
# ======================
REDIS_URL=redis://your-redis-host:6379
REDIS_PASSWORD=STRONG_REDIS_PASSWORD

# ======================
# JWT Configuration
# ======================
# Generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=YOUR_64_CHARACTER_RANDOM_STRING_HERE
JWT_REFRESH_SECRET=ANOTHER_64_CHARACTER_RANDOM_STRING_HERE
JWT_EXPIRY=1h
JWT_REFRESH_EXPIRY=7d

# ======================
# Email Configuration
# ======================
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=YOUR_SENDGRID_API_KEY
SMTP_FROM=noreply@yourdomain.com
SMTP_FROM_NAME=Advanced LMS

# ======================
# Security
# ======================
CSRF_TOKEN_SECRET=YOUR_CSRF_SECRET_64_CHARS
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# ======================
# File Upload
# ======================
MAX_FILE_SIZE=52428800
ALLOWED_FILE_TYPES=pdf,doc,docx,jpg,jpeg,png,gif
UPLOAD_PATH=/var/uploads

# S3 Configuration (if using AWS S3)
# AWS_ACCESS_KEY_ID=your_access_key
# AWS_SECRET_ACCESS_KEY=your_secret_key
# AWS_S3_BUCKET=your-bucket-name
# AWS_REGION=us-east-1

# ======================
# Logging
# ======================
LOG_LEVEL=info
LOG_PATH=/var/log/advanced-lms

# ======================
# Rate Limiting
# ======================
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# ======================
# Maintenance
# ======================
MAINTENANCE_MODE=false

# ======================
# Analytics (Optional)
# ======================
# SENTRY_DSN=your_sentry_dsn
# GA_TRACKING_ID=your_google_analytics_id
```

Create `frontend/.env.production`:

```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_APP_NAME=Advanced LMS
# NEXT_PUBLIC_GA_ID=your_google_analytics_id
# NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
```

### Generate Secure Secrets

```bash
# Generate JWT secrets
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Generate multiple at once
for i in {1..3}; do node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"; done
```

## Database Deployment

### PostgreSQL Production Setup

#### Using Managed Database (Recommended)

**AWS RDS:**
1. Create RDS PostgreSQL instance
2. Choose production-appropriate instance size (e.g., db.t3.medium)
3. Enable Multi-AZ for high availability
4. Configure automated backups (retention: 7-30 days)
5. Enable encryption at rest
6. Set up security groups to allow backend access only

**DigitalOcean Managed Database:**
1. Create PostgreSQL cluster
2. Choose appropriate plan based on usage
3. Enable automatic backups
4. Configure trusted sources (backend IP/network)

**Heroku Postgres:**
1. Add Heroku Postgres add-on
2. Choose Standard or Premium tier for production
3. Automatic backups included

#### Self-Hosted PostgreSQL

```bash
# Install PostgreSQL 16
sudo apt update
sudo apt install postgresql-16 postgresql-contrib-16

# Secure PostgreSQL
sudo -u postgres psql

# Create production database and user
CREATE USER lms_prod WITH PASSWORD 'STRONG_PASSWORD_HERE';
CREATE DATABASE advanced_lms_prod OWNER lms_prod;
GRANT ALL PRIVILEGES ON DATABASE advanced_lms_prod TO lms_prod;

# Configure PostgreSQL for production
# Edit /etc/postgresql/16/main/postgresql.conf
max_connections = 100
shared_buffers = 256MB
effective_cache_size = 1GB
work_mem = 4MB
maintenance_work_mem = 64MB

# Enable SSL
ssl = on
ssl_cert_file = '/etc/ssl/certs/server.crt'
ssl_key_file = '/etc/ssl/private/server.key'

# Configure authentication
# Edit /etc/postgresql/16/main/pg_hba.conf
hostssl  all  all  0.0.0.0/0  md5

# Restart PostgreSQL
sudo systemctl restart postgresql
```

### Run Production Migrations

```bash
# Using Docker
docker-compose -f docker-compose.prod.yml exec backend npm run migrate

# Direct connection
cd backend
NODE_ENV=production npm run migrate
```

### Database Performance Tuning

```sql
-- Create indexes for common queries
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_enrollments_user_id ON enrollments(user_id);
CREATE INDEX idx_enrollments_course_id ON enrollments(course_id);
CREATE INDEX idx_courses_status ON courses(status);
CREATE INDEX idx_lessons_section_id ON lessons(section_id);

-- Analyze tables for query optimization
ANALYZE;

-- Set up automatic vacuuming
ALTER TABLE users SET (autovacuum_vacuum_scale_factor = 0.1);
ALTER TABLE enrollments SET (autovacuum_vacuum_scale_factor = 0.1);
```

## Docker Deployment

### Production Docker Compose

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
      args:
        NODE_ENV: production
    container_name: lms-backend-prod
    restart: always
    ports:
      - "3001:3001"
    environment:
      NODE_ENV: production
    env_file:
      - backend/.env
    volumes:
      - uploads:/var/uploads
      - logs:/var/log/advanced-lms
    depends_on:
      - postgres
      - redis
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    networks:
      - lms-network

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      args:
        NEXT_PUBLIC_API_URL: https://api.yourdomain.com
    container_name: lms-frontend-prod
    restart: always
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
    depends_on:
      - backend
    networks:
      - lms-network

  postgres:
    image: postgres:16-alpine
    container_name: lms-postgres-prod
    restart: always
    environment:
      POSTGRES_DB: advanced_lms_prod
      POSTGRES_USER: lms_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      PGDATA: /var/lib/postgresql/data/pgdata
    volumes:
      - postgres-data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    networks:
      - lms-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U lms_user -d advanced_lms_prod"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: lms-redis-prod
    restart: always
    command: redis-server --requirepass ${REDIS_PASSWORD}
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    networks:
      - lms-network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  nginx:
    image: nginx:alpine
    container_name: lms-nginx
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
      - nginx-cache:/var/cache/nginx
    depends_on:
      - frontend
      - backend
    networks:
      - lms-network

volumes:
  postgres-data:
  redis-data:
  uploads:
  logs:
  nginx-cache:

networks:
  lms-network:
    driver: bridge
```

### Build and Deploy

```bash
# Build images
docker-compose -f docker-compose.prod.yml build

# Start services
docker-compose -f docker-compose.prod.yml up -d

# Run migrations
docker-compose -f docker-compose.prod.yml exec backend npm run migrate

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Check status
docker-compose -f docker-compose.prod.yml ps
```

## Cloud Deployment Options

### AWS EC2 Deployment

#### 1. Launch EC2 Instance

```bash
# Instance recommendations:
# - t3.medium (2 vCPU, 4GB RAM) for small/medium traffic
# - t3.large (2 vCPU, 8GB RAM) for medium/high traffic
# - t3.xlarge (4 vCPU, 16GB RAM) for high traffic

# AMI: Ubuntu 22.04 LTS
# Storage: 30GB+ SSD
```

#### 2. Configure Security Groups

Allow inbound traffic:
- SSH (22) from your IP
- HTTP (80) from anywhere
- HTTPS (443) from anywhere
- PostgreSQL (5432) from backend security group only
- Redis (6379) from backend security group only

#### 3. Setup EC2 Instance

```bash
# SSH into instance
ssh -i your-key.pem ubuntu@your-ec2-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Clone repository
git clone <your-repo-url>
cd advanced-lms

# Configure environment
cp backend/.env.example backend/.env
# Edit backend/.env with production values

# Deploy
docker-compose -f docker-compose.prod.yml up -d
```

#### 4. Configure AWS RDS & ElastiCache

Use managed services instead of containerized DB:

```env
# backend/.env
DB_HOST=your-rds-endpoint.amazonaws.com
REDIS_URL=redis://your-elasticache-endpoint.amazonaws.com:6379
```

### Heroku Deployment

#### Backend Deployment

```bash
# Install Heroku CLI
# Login
heroku login

# Create app
heroku create your-app-backend

# Add PostgreSQL
heroku addons:create heroku-postgresql:standard-0

# Add Redis
heroku addons:create heroku-redis:premium-0

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=$(openssl rand -hex 64)
heroku config:set JWT_REFRESH_SECRET=$(openssl rand -hex 64)
heroku config:set FRONTEND_URL=https://your-frontend.herokuapp.com

# Deploy
git subtree push --prefix backend heroku main

# Run migrations
heroku run npm run migrate

# View logs
heroku logs --tail
```

#### Frontend Deployment (Vercel Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel --prod

# Set environment variables in Vercel dashboard
# NEXT_PUBLIC_API_URL=https://your-app-backend.herokuapp.com
```

### DigitalOcean App Platform

```bash
# Install doctl
# Connect to DigitalOcean

# Create app spec (app.yaml)
doctl apps create --spec app.yaml

# Monitor deployment
doctl apps list
```

`app.yaml`:
```yaml
name: advanced-lms
services:
  - name: backend
    dockerfile_path: backend/Dockerfile
    source_dir: backend
    github:
      repo: your-username/advanced-lms
      branch: main
    envs:
      - key: NODE_ENV
        value: production
    http_port: 3001
  
  - name: frontend
    dockerfile_path: frontend/Dockerfile
    source_dir: frontend
    envs:
      - key: NEXT_PUBLIC_API_URL
        value: ${backend.PUBLIC_URL}
    http_port: 3000

databases:
  - name: postgres
    engine: PG
    version: "16"
  
  - name: redis
    engine: REDIS
    version: "7"
```

### Railway Deployment

1. Visit [railway.app](https://railway.app)
2. Connect GitHub repository
3. Add PostgreSQL and Redis services
4. Configure environment variables
5. Deploy automatically on push

## Reverse Proxy Setup

### Nginx Configuration

Create `/etc/nginx/sites-available/advancedlms`:

```nginx
# Upstream servers
upstream backend {
    server localhost:3001;
}

upstream frontend {
    server localhost:3000;
}

# HTTP redirect to HTTPS
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    location / {
        return 301 https://$server_name$request_uri;
    }
}

# HTTPS server for frontend
server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    
    # SSL certificates
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Logging
    access_log /var/log/nginx/advancedlms-access.log;
    error_log /var/log/nginx/advancedlms-error.log;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    
    # Proxy to frontend
    location / {
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Proxy to backend API
    location /api {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Increase timeouts for long-running requests
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # Rate limiting
        limit_req zone=api_limit burst=20 nodelay;
    }
    
    # Static files caching
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://frontend;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Health check endpoint
    location /health {
        proxy_pass http://backend/health;
        access_log off;
    }
}

# Rate limiting zone
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=100r/m;
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/advancedlms /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## SSL/TLS Configuration

### Using Let's Encrypt (Certbot)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Test automatic renewal
sudo certbot renew --dry-run

# Auto-renewal is configured via systemd timer
sudo systemctl status certbot.timer
```

### Manual SSL Certificate

If using purchased SSL certificate:

```bash
# Copy certificates
sudo cp yourdomain.com.crt /etc/nginx/ssl/
sudo cp yourdomain.com.key /etc/nginx/ssl/
sudo chmod 600 /etc/nginx/ssl/yourdomain.com.key

# Update nginx config to point to certificates
ssl_certificate /etc/nginx/ssl/yourdomain.com.crt;
ssl_certificate_key /etc/nginx/ssl/yourdomain.com.key;
```

## Monitoring & Logging

### Application Logging

**Backend Logging:**
```javascript
// backend/src/utils/logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ 
      filename: '/var/log/advanced-lms/error.log', 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: '/var/log/advanced-lms/combined.log' 
    })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

module.exports = logger;
```

### Error Tracking (Sentry)

```bash
# Install Sentry
npm install @sentry/node @sentry/tracing

# Backend integration
# backend/app.js
const Sentry = require('@sentry/node');

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0
});

app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.errorHandler());
```

### Performance Monitoring

**New Relic:**
```bash
npm install newrelic

# Add to backend/server.js (first line)
require('newrelic');
```

**DataDog:**
```bash
npm install dd-trace

# backend/server.js
require('dd-trace').init();
```

### Uptime Monitoring

Use services like:
- **UptimeRobot**: Free tier available, 5-min checks
- **Pingdom**: Enterprise monitoring
- **StatusCake**: Free tier with SSL monitoring
- **Better Uptime**: Modern interface, good free tier

Configure monitors for:
- Frontend homepage: `https://yourdomain.com`
- Backend health: `https://api.yourdomain.com/health`
- Database connection

### Log Aggregation

**ELK Stack (Elasticsearch, Logstash, Kibana):**
```bash
# Install Filebeat
curl -L -O https://artifacts.elastic.co/downloads/beats/filebeat/filebeat-8.11.0-amd64.deb
sudo dpkg -i filebeat-8.11.0-amd64.deb

# Configure Filebeat
sudo nano /etc/filebeat/filebeat.yml

# Start Filebeat
sudo systemctl start filebeat
```

**Alternative: Papertrail, Loggly, or Splunk**

## Backup & Disaster Recovery

### Database Backups

**Automated Daily Backups:**
```bash
#!/bin/bash
# /usr/local/bin/backup-db.sh

BACKUP_DIR="/var/backups/advanced-lms"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/db_backup_$DATE.sql"

# Create backup directory
mkdir -p $BACKUP_DIR

# Dump database
pg_dump -h localhost -U lms_user -d advanced_lms_prod > $BACKUP_FILE

# Compress backup
gzip $BACKUP_FILE

# Delete backups older than 30 days
find $BACKUP_DIR -name "db_backup_*.sql.gz" -mtime +30 -delete

# Upload to S3 (optional)
# aws s3 cp $BACKUP_FILE.gz s3://your-bucket/backups/

echo "Backup completed: $BACKUP_FILE.gz"
```

**Setup Cron Job:**
```bash
sudo crontab -e

# Add line (daily at 2 AM)
0 2 * * * /usr/local/bin/backup-db.sh >> /var/log/db-backup.log 2>&1
```

### Application Backup

```bash
#!/bin/bash
# Backup uploads and configuration
tar -czf /var/backups/advanced-lms/app_backup_$(date +%Y%m%d).tar.gz \
  /var/uploads \
  /path/to/advanced-lms/backend/.env \
  /etc/nginx/sites-available/advancedlms
```

### Disaster Recovery Plan

1. **RTO (Recovery Time Objective)**: 4 hours
2. **RPO (Recovery Point Objective)**: 24 hours

**Recovery Steps:**
1. Provision new server
2. Install dependencies
3. Restore database from latest backup
4. Deploy latest code
5. Restore uploads/files
6. Update DNS
7. Verify functionality

## Post-Deployment

### Verification Checklist

- [ ] Frontend accessible via HTTPS
- [ ] Backend API responding: `curl https://api.yourdomain.com/health`
- [ ] Login functionality working
- [ ] Database queries executing correctly
- [ ] Email sending (test registration/password reset)
- [ ] File uploads working
- [ ] Certificates valid and auto-renewing
- [ ] Monitoring alerts configured
- [ ] Logs being written correctly
- [ ] Backups running automatically

### Smoke Tests

```bash
# Health check
curl https://api.yourdomain.com/health

# Login test
curl -X POST https://api.yourdomain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!@#"}'

# Get courses
curl https://api.yourdomain.com/api/courses

# Check SSL
curl -vI https://yourdomain.com 2>&1 | grep "SSL connection"
```

### Performance Testing

```bash
# Install Apache Bench
sudo apt install apache2-utils

# Test backend
ab -n 1000 -c 10 https://api.yourdomain.com/health

# Test frontend
ab -n 100 -c 10 https://yourdomain.com/
```

### Security Scan

```bash
# SSL test
curl https://www.ssllabs.com/ssltest/analyze.html?d=yourdomain.com

# Security headers
curl -I https://yourdomain.com

# Port scan
nmap -sV yourdomain.com
```

## Rollback Procedures

### Application Rollback

```bash
# Using Docker
docker-compose -f docker-compose.prod.yml down
git checkout <previous-commit>
docker-compose -f docker-compose.prod.yml up -d --build

# Using PM2 or systemd
git checkout <previous-commit>
npm install
pm2 restart all
```

### Database Rollback

```bash
# Rollback one migration
npm run migrate:rollback

# Restore from backup
psql -U lms_user -d advanced_lms_prod < /var/backups/db_backup_20240121.sql
```

### Zero-Downtime Deployment

Use blue-green deployment:

```bash
# Start new version on different port
docker-compose -f docker-compose.blue.yml up -d

# Test new version
curl http://localhost:3002/health

# Switch nginx to new version
sudo nano /etc/nginx/sites-available/advancedlms
# Change upstream port to 3002

sudo nginx -t
sudo systemctl reload nginx

# Verify traffic on new version
# Stop old version
docker-compose -f docker-compose.green.yml down
```

## Security Hardening

See [../backend/SECURITY_HARDENING_GUIDE.md](../backend/SECURITY_HARDENING_GUIDE.md) for complete security guide.

### Quick Security Checklist

- [ ] Firewall configured (ufw, security groups)
- [ ] SSH key-based authentication only
- [ ] Regular security updates automated
- [ ] Non-root user for application
- [ ] Secrets in environment variables only
- [ ] Rate limiting enabled
- [ ] CORS properly configured
- [ ] HTTPS enforced
- [ ] Security headers (HSTS, CSP, etc.)
- [ ] SQL injection protection (parameterized queries)
- [ ] XSS protection
- [ ] CSRF protection
- [ ] Regular vulnerability scans

## Maintenance

See [MAINTENANCE.md](./MAINTENANCE.md) for ongoing maintenance tasks.

### Regular Tasks

- **Daily**: Monitor logs and error rates
- **Weekly**: Review security alerts, check backups
- **Monthly**: Update dependencies, review performance
- **Quarterly**: Security audit, disaster recovery test

## Support

- **Documentation**: [Full documentation index](../README.md)
- **Troubleshooting**: [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- **Security**: [SECURITY_HARDENING_GUIDE.md](../backend/SECURITY_HARDENING_GUIDE.md)
- **Performance**: [PERFORMANCE_GUIDE.md](../backend/PERFORMANCE_GUIDE.md)

---

**Deployment completed successfully! 🚀**
