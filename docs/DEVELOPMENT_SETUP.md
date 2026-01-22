# Development Setup Guide

Complete guide for setting up Advanced-LMS for local development.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start (Docker)](#quick-start-docker)
- [Manual Setup (Without Docker)](#manual-setup-without-docker)
- [Database Operations](#database-operations)
- [Development Tools](#development-tools)
- [Code Style & Standards](#code-style--standards)
- [Environment Variables](#environment-variables)
- [Common Issues](#common-issues)
- [Testing](#testing)

## Prerequisites

### Required Software

| Software | Minimum Version | Recommended | Notes |
|----------|----------------|-------------|-------|
| **Node.js** | 18.x | 20.x LTS | JavaScript runtime |
| **npm** | 9.x | 10.x | Package manager |
| **PostgreSQL** | 14.x | 16.x | Database (or use Docker) |
| **Redis** | 6.x | 7.x | Cache (or use Docker) |
| **Git** | 2.x | Latest | Version control |
| **Docker** | 20.x | Latest | Optional but recommended |
| **Docker Compose** | 2.x | Latest | Optional but recommended |

### System Requirements

- **RAM**: 4GB minimum, 8GB recommended
- **Disk Space**: 10GB free space
- **OS**: Linux, macOS, or Windows 10/11 with WSL2

### Recommended IDE

- **Visual Studio Code** with extensions:
  - ESLint
  - Prettier
  - PostgreSQL
  - Docker
  - REST Client
  - GitLens

## Quick Start (Docker)

This is the **recommended** approach for local development.

### 1. Clone Repository

```bash
git clone <repository-url>
cd advanced-lms
```

### 2. Setup Environment Files

```bash
# Backend environment
cp backend/.env.example backend/.env

# Frontend environment
cp frontend/.env.example frontend/.env.local
```

### 3. Start All Services

```bash
# Build and start all containers
docker-compose up -d

# View logs (optional)
docker-compose logs -f
```

This starts:
- PostgreSQL on port 5432
- Redis on port 6379
- Backend API on port 3001
- Frontend on port 3000

### 4. Initialize Database

```bash
# Run migrations
docker-compose exec backend npm run migrate

# Seed initial data
docker-compose exec backend npm run seed
```

### 5. Verify Installation

```bash
# Check backend health
curl http://localhost:3001/health

# Open frontend in browser
open http://localhost:3000
```

### Docker Commands Reference

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# Stop and remove volumes (full reset)
docker-compose down -v

# Restart a specific service
docker-compose restart backend
docker-compose restart frontend

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Execute commands in container
docker-compose exec backend npm run migrate
docker-compose exec backend sh

# Rebuild containers
docker-compose up -d --build

# View running containers
docker-compose ps
```

## Manual Setup (Without Docker)

For developers who prefer not to use Docker.

### Backend Setup

#### 1. Install Dependencies

```bash
cd backend
npm install
```

#### 2. Install and Configure PostgreSQL

**On macOS (Homebrew):**
```bash
brew install postgresql@16
brew services start postgresql@16
```

**On Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**On Windows:**
Download and install from [postgresql.org](https://www.postgresql.org/download/windows/)

#### 3. Create Database

```bash
# Access PostgreSQL
psql postgres

# Create user and database
CREATE USER lms_user WITH PASSWORD 'your_password';
CREATE DATABASE advanced_lms OWNER lms_user;
GRANT ALL PRIVILEGES ON DATABASE advanced_lms TO lms_user;
\q
```

#### 4. Install and Configure Redis

**On macOS (Homebrew):**
```bash
brew install redis
brew services start redis
```

**On Ubuntu/Debian:**
```bash
sudo apt install redis-server
sudo systemctl start redis-server
sudo systemctl enable redis-server
```

**On Windows:**
Download from [redis.io](https://redis.io/download) or use WSL2

#### 5. Configure Backend Environment

Edit `backend/.env`:

```env
# Server
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=advanced_lms
DB_USER=lms_user
DB_PASSWORD=your_password

# Redis
REDIS_URL=redis://localhost:6379

# JWT Secrets (generate secure random strings)
JWT_SECRET=your_very_long_random_string_here_at_least_32_chars
JWT_REFRESH_SECRET=another_very_long_random_string_here
JWT_EXPIRY=1h
JWT_REFRESH_EXPIRY=7d

# Email (for development, use Mailtrap or similar)
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your_mailtrap_user
SMTP_PASS=your_mailtrap_pass

# Security
CSRF_TOKEN_SECRET=random_csrf_secret_string

# File Upload
MAX_FILE_SIZE=52428800
ALLOWED_FILE_TYPES=pdf,doc,docx,jpg,png

# Maintenance Mode
MAINTENANCE_MODE=false
```

**Generate Secure Secrets:**
```bash
# Generate random strings for JWT secrets
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

#### 6. Run Migrations and Seed Data

```bash
# Run database migrations
npm run migrate

# Seed initial data
npm run seed
```

#### 7. Start Backend Server

```bash
# Development mode (auto-reload)
npm run dev

# Production mode
npm start
```

Backend should now be running on `http://localhost:3001`

### Frontend Setup

#### 1. Install Dependencies

```bash
cd frontend
npm install
```

#### 2. Configure Frontend Environment

Edit `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME=Advanced LMS
```

#### 3. Start Frontend Development Server

```bash
npm run dev
```

Frontend should now be running on `http://localhost:3000`

### Verify Manual Setup

1. **Check Backend:**
   ```bash
   curl http://localhost:3001/health
   ```

2. **Check Frontend:**
   Open http://localhost:3000 in browser

3. **Check Database:**
   ```bash
   psql -U lms_user -d advanced_lms -c "SELECT COUNT(*) FROM users;"
   ```

4. **Check Redis:**
   ```bash
   redis-cli ping
   # Should return: PONG
   ```

## Database Operations

### Creating Migrations

```bash
# Docker
docker-compose exec backend npm run migrate:create migration_name

# Local
cd backend
npm run migrate:create migration_name
```

This creates a new migration file in `backend/src/migrations/`

### Running Migrations

```bash
# Docker
docker-compose exec backend npm run migrate

# Local
cd backend
npm run migrate
```

### Rolling Back Migrations

```bash
# Docker
docker-compose exec backend npm run migrate:rollback

# Local
cd backend
npm run migrate:rollback
```

### Seeding Database

```bash
# Docker
docker-compose exec backend npm run seed

# Local
cd backend
npm run seed
```

The seed script creates:
- Default roles (student, instructor, admin)
- Sample users for each role
- Sample courses with sections and lessons
- Gamification badges and achievements
- Quiz questions and assignments

### Database Backup

```bash
# Create backup
pg_dump -U lms_user advanced_lms > backup.sql

# Restore backup
psql -U lms_user advanced_lms < backup.sql
```

### Connect to Database

```bash
# Docker
docker-compose exec postgres psql -U lms_user -d advanced_lms

# Local
psql -U lms_user -d advanced_lms
```

Useful SQL commands:
```sql
-- List all tables
\dt

-- Describe table structure
\d users

-- View table data
SELECT * FROM users LIMIT 10;

-- Exit
\q
```

## Development Tools

### Browser DevTools

- **Chrome DevTools**: F12 or Cmd+Option+I
- **React DevTools**: Install browser extension
- **Redux DevTools**: Install browser extension (if using Redux)

### API Testing

**Using curl:**
```bash
# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@advancedlms.com","password":"Admin123!@#"}'

# Get courses (with token)
curl http://localhost:3001/api/courses \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Using Postman/Insomnia:**
1. Import the OpenAPI spec: `backend/openapi.yaml`
2. Set base URL to `http://localhost:3001`
3. Add Authorization header with JWT token

### Database Management

**Command Line:**
```bash
psql -U lms_user -d advanced_lms
```

**GUI Tools:**
- [pgAdmin](https://www.pgadmin.org/) - Full-featured PostgreSQL GUI
- [DBeaver](https://dbeaver.io/) - Universal database tool
- [Postico](https://eggerapps.at/postico/) - macOS only

**VS Code Extensions:**
- PostgreSQL by Chris Kolkman

### Redis Management

**Command Line:**
```bash
redis-cli

# Common commands
KEYS *          # List all keys
GET key_name    # Get value
DEL key_name    # Delete key
FLUSHALL        # Clear all data (use carefully!)
```

**GUI Tools:**
- [RedisInsight](https://redis.com/redis-enterprise/redis-insight/)
- [Medis](https://getmedis.com/) - macOS only

## Code Style & Standards

### ESLint Configuration

Backend uses ESLint for code quality:

```bash
# Check for linting errors
cd backend
npm run lint

# Auto-fix issues
npm run lint:fix
```

### Prettier Configuration

Format code consistently:

```bash
# Format code
cd backend
npm run format

# Check formatting
npm run format:check
```

### TypeScript (Frontend)

Frontend uses TypeScript with strict mode:

```bash
# Type checking
cd frontend
npm run type-check

# Build check
npm run build
```

### Naming Conventions

**Backend (JavaScript):**
- Files: `camelCase.js` (e.g., `authController.js`)
- Classes: `PascalCase` (e.g., `AuthService`)
- Functions: `camelCase` (e.g., `getUserById`)
- Constants: `UPPER_SNAKE_CASE` (e.g., `MAX_LOGIN_ATTEMPTS`)

**Frontend (TypeScript):**
- Components: `PascalCase.tsx` (e.g., `LoginForm.tsx`)
- Hooks: `use` prefix + `camelCase` (e.g., `useAuth`)
- Utilities: `camelCase.ts` (e.g., `formatDate.ts`)
- Types/Interfaces: `PascalCase` (e.g., `UserProfile`)

### Git Commit Messages

Follow conventional commits:

```
type(scope): subject

body

footer
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Examples:
```
feat(auth): add password reset functionality
fix(courses): resolve pagination issue
docs(api): update authentication endpoints
```

## Environment Variables

### Backend Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `NODE_ENV` | Environment | Yes | `development` |
| `PORT` | Server port | Yes | `3001` |
| `FRONTEND_URL` | Frontend URL for CORS | Yes | `http://localhost:3000` |
| `DB_HOST` | PostgreSQL host | Yes | `localhost` |
| `DB_PORT` | PostgreSQL port | Yes | `5432` |
| `DB_NAME` | Database name | Yes | `advanced_lms` |
| `DB_USER` | Database user | Yes | - |
| `DB_PASSWORD` | Database password | Yes | - |
| `REDIS_URL` | Redis connection URL | Yes | `redis://localhost:6379` |
| `JWT_SECRET` | JWT signing secret | Yes | - |
| `JWT_REFRESH_SECRET` | Refresh token secret | Yes | - |
| `JWT_EXPIRY` | Access token expiry | No | `1h` |
| `JWT_REFRESH_EXPIRY` | Refresh token expiry | No | `7d` |
| `SMTP_HOST` | Email server host | Yes | - |
| `SMTP_PORT` | Email server port | Yes | `587` |
| `SMTP_USER` | Email username | Yes | - |
| `SMTP_PASS` | Email password | Yes | - |
| `MAX_FILE_SIZE` | Max upload size (bytes) | No | `52428800` |
| `ALLOWED_FILE_TYPES` | Allowed file extensions | No | `pdf,doc,docx,jpg,png` |

### Frontend Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | Yes | `http://localhost:3001` |
| `NEXT_PUBLIC_APP_NAME` | Application name | No | `Advanced LMS` |

## Common Issues

### Port Already in Use

**Problem:** Port 3000, 3001, 5432, or 6379 already in use.

**Solution:**
```bash
# Find process using port
lsof -i :3001

# Kill process
kill -9 <PID>

# Or use different ports in .env files
```

### Database Connection Failed

**Problem:** Cannot connect to PostgreSQL.

**Solutions:**
1. Check PostgreSQL is running:
   ```bash
   # Docker
   docker-compose ps postgres
   
   # Local
   brew services list | grep postgresql
   sudo systemctl status postgresql
   ```

2. Verify credentials in `.env`
3. Check PostgreSQL is accepting connections:
   ```bash
   psql -U lms_user -d advanced_lms -h localhost
   ```

### Redis Connection Failed

**Problem:** Cannot connect to Redis.

**Solutions:**
1. Check Redis is running:
   ```bash
   # Docker
   docker-compose ps redis
   
   # Local
   redis-cli ping
   ```

2. Verify `REDIS_URL` in `.env`

### Migration Errors

**Problem:** Migration fails to run.

**Solutions:**
1. Check database connection
2. Ensure migrations table exists:
   ```sql
   CREATE TABLE IF NOT EXISTS migrations (
     id SERIAL PRIMARY KEY,
     name VARCHAR(255),
     run_on TIMESTAMP DEFAULT NOW()
   );
   ```
3. Check migration file syntax
4. Roll back and retry:
   ```bash
   npm run migrate:rollback
   npm run migrate
   ```

### Frontend Can't Reach Backend

**Problem:** API calls fail with network error.

**Solutions:**
1. Verify backend is running:
   ```bash
   curl http://localhost:3001/health
   ```

2. Check `NEXT_PUBLIC_API_URL` in `frontend/.env.local`
3. Verify CORS configuration in `backend/src/config/corsConfig.js`
4. Check browser console for CORS errors

### Module Not Found Errors

**Problem:** Import errors or module not found.

**Solution:**
```bash
# Clean install dependencies
rm -rf node_modules package-lock.json
npm install

# Docker: rebuild containers
docker-compose up -d --build
```

### Email Not Sending

**Problem:** Email verification or password reset emails not received.

**Solutions:**
1. Check SMTP credentials in `.env`
2. For development, use [Mailtrap](https://mailtrap.io/) or [MailHog](https://github.com/mailhog/MailHog)
3. Check email service logs
4. Verify email is not in spam folder

## Testing

### Running Tests

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

### Writing Tests

**Backend Test Example:**
```javascript
// backend/tests/auth.test.js
const request = require('supertest');
const app = require('../app');

describe('POST /api/auth/login', () => {
  it('should login with valid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'Test123!@#'
      });
    
    expect(response.status).toBe(200);
    expect(response.body.data).toHaveProperty('accessToken');
  });
});
```

**Frontend Test Example:**
```typescript
// frontend/components/__tests__/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import Button from '../Button';

describe('Button', () => {
  it('should call onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

## Next Steps

- 📚 **API Documentation**: [../backend/API_DOCUMENTATION.md](../backend/API_DOCUMENTATION.md)
- 🏗️ **Architecture**: [ARCHITECTURE.md](./ARCHITECTURE.md)
- 🗄️ **Database Schema**: [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)
- 🎨 **Components**: [../frontend/COMPONENT_LIBRARY.md](../frontend/COMPONENT_LIBRARY.md)
- 🚀 **Deployment**: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
- 🐛 **Troubleshooting**: [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- 🤝 **Contributing**: [../CONTRIBUTING.md](../CONTRIBUTING.md)

## Get Help

- Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for common issues
- Open a GitHub issue for bugs or questions
- Review existing documentation in `docs/` directory

Happy coding! 🚀
