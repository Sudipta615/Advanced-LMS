# Setup Guide - Advanced LMS

This guide provides detailed instructions for setting up the Advanced Learning Management System in both development and production environments.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Docker Setup (Recommended)](#docker-setup-recommended)
- [Local Development Setup](#local-development-setup)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Software

- **Node.js** 18.0 or higher
- **npm** 9.0 or higher
- **Docker** 20.10 or higher
- **Docker Compose** 2.0 or higher

### Optional (for local development)

- **PostgreSQL** 14 or higher
- **Redis** 7 or higher

### System Requirements

- **Minimum**: Intel i3 8th gen (or equivalent), 8GB RAM, 10GB disk space
- **Recommended**: Intel i5 or higher, 16GB RAM, 20GB disk space

## Docker Setup (Recommended)

Docker is the recommended way to run the application as it handles all dependencies automatically.

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd advanced-lms
```

### Step 2: Configure Environment Variables

#### Backend Configuration

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` with your settings:

```env
NODE_ENV=development
PORT=3001

# Database
DATABASE_URL=postgresql://lms_user:lms_password@postgres:5432/advanced_lms

# Redis
REDIS_URL=redis://redis:6379

# JWT (CHANGE THESE IN PRODUCTION!)
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d

# Email Configuration (Gmail example)
EMAIL_SERVICE=smtp
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password
EMAIL_FROM=noreply@advancedlms.com

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

#### Frontend Configuration

```bash
cp frontend/.env.example frontend/.env
```

Edit `frontend/.env`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME=Advanced LMS
```

### Step 3: Start Services

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Check service status
docker-compose ps
```

### Step 4: Initialize Database

```bash
# Run migrations
docker-compose exec backend npm run migrate

# Seed default roles
docker-compose exec backend npm run seed
```

### Step 5: Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health

### Managing Docker Services

```bash
# Stop services
docker-compose down

# Stop and remove volumes (WARNING: deletes all data)
docker-compose down -v

# Restart a specific service
docker-compose restart backend

# View logs for specific service
docker-compose logs -f backend

# Rebuild after code changes
docker-compose up -d --build
```

## Local Development Setup

### Step 1: Install PostgreSQL

#### Ubuntu/Debian

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### macOS

```bash
brew install postgresql@14
brew services start postgresql@14
```

#### Windows

Download and install from [PostgreSQL Official Website](https://www.postgresql.org/download/windows/)

### Step 2: Create Database

```bash
# Login to PostgreSQL
sudo -u postgres psql

# Create database and user
CREATE DATABASE advanced_lms;
CREATE USER lms_user WITH PASSWORD 'lms_password';
GRANT ALL PRIVILEGES ON DATABASE advanced_lms TO lms_user;
\q
```

### Step 3: Install Redis (Optional)

#### Ubuntu/Debian

```bash
sudo apt install redis-server
sudo systemctl start redis
sudo systemctl enable redis
```

#### macOS

```bash
brew install redis
brew services start redis
```

### Step 4: Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your local settings
# Change DATABASE_URL to: postgresql://lms_user:lms_password@localhost:5432/advanced_lms
# Change REDIS_URL to: redis://localhost:6379

# Run migrations
npm run migrate

# Seed database
npm run seed

# Start development server
npm run dev
```

The backend will start on http://localhost:3001

### Step 5: Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env if needed

# Start development server
npm run dev
```

The frontend will start on http://localhost:3000

## Environment Variables

### Backend Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| NODE_ENV | Environment (development/production) | development | No |
| PORT | Backend server port | 3001 | No |
| DATABASE_URL | PostgreSQL connection string | - | Yes |
| REDIS_URL | Redis connection string | - | No |
| JWT_SECRET | Secret key for JWT tokens | - | Yes |
| JWT_EXPIRY | Access token expiry | 15m | No |
| REFRESH_TOKEN_EXPIRY | Refresh token expiry | 7d | No |
| EMAIL_HOST | SMTP server host | smtp.gmail.com | Yes* |
| EMAIL_PORT | SMTP server port | 587 | Yes* |
| EMAIL_USER | Email account username | - | Yes* |
| EMAIL_PASSWORD | Email account password | - | Yes* |
| EMAIL_FROM | From email address | - | Yes* |
| FRONTEND_URL | Frontend application URL | http://localhost:3000 | Yes |

*Email configuration is required for email verification and password reset features.

### Frontend Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| NEXT_PUBLIC_API_URL | Backend API URL | http://localhost:3001 | Yes |
| NEXT_PUBLIC_APP_NAME | Application name | Advanced LMS | No |

## Database Setup

### Running Migrations

Migrations create the database schema:

```bash
# With Docker
docker-compose exec backend npm run migrate

# Local
cd backend && npm run migrate
```

### Seeding Data

Seeds populate default roles and permissions:

```bash
# With Docker
docker-compose exec backend npm run seed

# Local
cd backend && npm run seed
```

### Database Reset (Development Only)

```bash
# WARNING: This will delete all data!

# Stop services
docker-compose down

# Remove volumes
docker volume rm advanced-lms_postgres_data

# Restart and reinitialize
docker-compose up -d
docker-compose exec backend npm run migrate
docker-compose exec backend npm run seed
```

## Email Configuration

### Gmail Setup

1. Enable 2-Factor Authentication on your Google account
2. Generate an App Password:
   - Go to Google Account Settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password
3. Use the app password in `EMAIL_PASSWORD`

### Other Email Providers

Update `EMAIL_HOST` and `EMAIL_PORT` accordingly:

- **Outlook**: smtp.office365.com:587
- **Yahoo**: smtp.mail.yahoo.com:587
- **SendGrid**: smtp.sendgrid.net:587

## Troubleshooting

### Backend won't start

**Check database connection:**
```bash
docker-compose logs postgres
```

**Check backend logs:**
```bash
docker-compose logs backend
```

**Common issues:**
- Database not ready: Wait a few seconds and try again
- Port already in use: Change PORT in backend/.env
- Missing environment variables: Check .env file

### Frontend won't connect to backend

**Verify backend is running:**
```bash
curl http://localhost:3001/health
```

**Check CORS settings:**
Ensure `FRONTEND_URL` in backend/.env matches your frontend URL

### Database migration fails

**Reset and retry:**
```bash
docker-compose down -v
docker-compose up -d
docker-compose exec backend npm run migrate
```

### Email not sending

**Check credentials:**
- Verify EMAIL_USER and EMAIL_PASSWORD
- Check if app password is needed (Gmail)
- Test SMTP connection

**Development workaround:**
Emails will be logged to console if email service is not configured

### Redis connection issues

Redis is optional. The application will work without it, but token blacklisting will be disabled.

### Docker build issues

**Clear Docker cache:**
```bash
docker-compose down
docker system prune -a
docker-compose up -d --build
```

### Low-spec hardware optimization

**Reduce Docker resource limits** in `docker-compose.yml`:
```yaml
deploy:
  resources:
    limits:
      memory: 256M  # Reduce from 512M
```

**Enable swap** if running out of memory:
```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

## Production Deployment

### Security Checklist

- [ ] Change JWT_SECRET to a strong random value
- [ ] Use strong database passwords
- [ ] Enable HTTPS/SSL
- [ ] Configure firewall rules
- [ ] Set NODE_ENV=production
- [ ] Enable rate limiting
- [ ] Regular backups
- [ ] Monitor logs

### Recommended Production Setup

1. Use managed PostgreSQL (AWS RDS, DigitalOcean, etc.)
2. Use Redis for session management
3. Deploy behind a reverse proxy (Nginx)
4. Use environment-specific .env files
5. Implement automated backups
6. Set up monitoring and logging

## Getting Help

- Check the [API Documentation](API_DOCUMENTATION.md)
- Review [Architecture](ARCHITECTURE.md)
- Open an issue on GitHub
- Check existing issues for solutions

## Next Steps

After successful setup:

1. Register a new user at http://localhost:3000/register
2. Check your email for verification (or logs in development)
3. Log in at http://localhost:3000/login
4. Access the dashboard

Proceed to Phase 2 development for course management features!
