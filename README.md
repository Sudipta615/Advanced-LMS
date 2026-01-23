# 🎓 Advanced Learning Management System

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-brightgreen)](https://nodejs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)

A comprehensive, modern Learning Management System (LMS) designed for educational institutions, corporate training, and online course platforms. Built with cutting-edge technologies and optimized for performance on any hardware.

---

## 📑 Table of Contents

- [Project Overview](#project-overview)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Quick Start Guide](#quick-start-guide)
- [Local Development Setup](#local-development-setup)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [User Roles & Permissions](#user-roles--permissions)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [Performance Tips](#performance-tips)
- [Common Issues & Troubleshooting](#common-issues--troubleshooting)
- [Development Workflow](#development-workflow)
- [Additional Resources](#additional-resources)

---

## 🎯 Project Overview

The Advanced LMS is a full-featured learning platform that enables:

- **Students** to browse courses, track progress, complete assessments, earn certificates, and compete on leaderboards
- **Instructors** to create and manage courses, design assessments, grade assignments, and monitor student progress
- **Administrators** to manage users, moderate content, configure system settings, and view comprehensive analytics

### What Makes It Special?

✨ **Modern Tech Stack** - Built with Next.js 14, TypeScript, and Express for optimal performance
🚀 **Fast & Lightweight** - Optimized to run smoothly even on low-spec hardware (2GB RAM works!)
🎮 **Gamified Learning** - Points, badges, achievements, streaks, and leaderboards keep learners engaged
🔒 **Enterprise-Grade Security** - JWT auth, RBAC, rate limiting, CSRF protection, and more
📊 **Rich Analytics** - Comprehensive dashboards for students, instructors, and admins
🎨 **Beautiful UI** - Responsive, accessible design with Tailwind CSS

---

## ✨ Key Features

### 🔐 Authentication & User Management
- ✅ User registration with email verification
- ✅ Secure login with JWT tokens & refresh token mechanism
- ✅ Password reset via email
- ✅ Role-based access control (Student, Instructor, Admin)
- ✅ Profile management with avatar upload
- ✅ User preferences & notifications settings
- ✅ Account ban moderation system

### 📚 Course Management & Learning
- ✅ Create, edit, and publish courses
- ✅ Organize courses into sections and lessons
- ✅ Rich content support (text, video, documents)
- ✅ Course categories and tags
- ✅ Prerequisite course requirements
- ✅ Course approval workflow
- ✅ Enrollment management
- ✅ Progress tracking (lesson completion, course progress)
- ✅ Course discussions and Q&A
- ✅ Course announcements

### 📝 Assessments
- **Quizzes:**
  - Multiple choice questions
  - Automatic grading
  - Quiz attempts tracking
  - Time limits and passing scores
- **Assignments:**
  - File upload support
  - Manual grading by instructors
  - Feedback system
  - Submission history

### 🏆 Certificates & Achievements
- ✅ Auto-generated certificates upon course completion
- ✅ Customizable certificate templates
- ✅ Badge system for various achievements
- ✅ Achievement categories
- ✅ Badge display on user profiles

### 📊 Analytics & Progress Tracking
- ✅ Student progress dashboards
- ✅ Instructor course analytics
- ✅ Admin system-wide analytics
- ✅ Enrollment statistics
- ✅ Completion rates
- ✅ Quiz and assignment performance
- ✅ Engagement metrics

### 🎮 Gamification System
- ✅ **Points System** - Earn points for completing lessons, quizzes, and courses
- ✅ **Badges** - Unlock badges for achievements (e.g., "First Course", "Quiz Master")
- ✅ **Achievements** - Milestone accomplishments with rewards
- ✅ **Learning Streaks** - Track consecutive days of learning
- ✅ **Leaderboards** - Global and course-specific rankings
- ✅ **Points History** - Track point earnings and spending

### 🛠️ Admin Features
- ✅ User management (view, edit, ban, delete)
- ✅ Content moderation
- ✅ Course approval system
- ✅ System settings configuration
- ✅ Audit logs for all actions
- ✅ Database backup and restore
- ✅ Maintenance mode toggle

### 💬 Communication Features
- ✅ In-app announcements
- ✅ Course discussions
- ✅ Email notifications (configurable)
- ✅ User-to-user messaging system

### ⚡ Performance Optimization
- ✅ Redis caching for frequently accessed data
- ✅ Database query optimization
- ✅ Compression middleware
- ✅ Lazy loading for images and content
- ✅ Optimized bundle sizes
- ✅ Health check endpoints

---

## 🛠 Technology Stack

### Backend
- **Runtime:** Node.js 18+ (also compatible with Bun for better performance)
- **Framework:** Express.js
- **Database:** PostgreSQL 14+
- **ORM:** Sequelize
- **Cache:** Redis 7+
- **Authentication:** JWT (jsonwebtoken)
- **Validation:** Joi
- **Security:** Helmet, bcrypt, express-rate-limit, CORS

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **HTTP Client:** Axios
- **Icons:** Lucide React
- **State Management:** React Context API

### Infrastructure
- **Containerization:** Docker & Docker Compose
- **Database:** PostgreSQL (Docker container)
- **Cache:** Redis (Docker container)
- **Process Manager:** PM2 (production)

---

## 📋 Prerequisites

### Required Software

| Software | Minimum Version | Recommended | Installation |
|----------|----------------|-------------|--------------|
| **Bun** | 1.0+ | Latest | `curl -fsSL https://bun.sh/install \| bash` |
| **Node.js** | 18.x | 20.x LTS | [nodejs.org](https://nodejs.org/) |
| **Docker** | 20.x | Latest | [docker.com](https://www.docker.com/) |
| **Docker Compose** | 2.x | Latest | Included with Docker |
| **Git** | 2.x | Latest | [git-scm.com](https://git-scm.com/) |

> **💡 Tip:** Bun is recommended for development as it's faster and uses less memory, especially beneficial on older hardware. However, Node.js works perfectly fine too.

### System Requirements

- **RAM:** 2GB minimum, 4GB+ recommended
- **Disk Space:** 10GB free space
- **OS:** Linux, macOS, or Windows 10/11 with WSL2
- **CPU:** Any modern processor (dual-core or better)

> **🚀 Great for Low-Spec Hardware!** This project is optimized to run smoothly on machines with as little as 2GB RAM. Docker containers are configured with memory limits to prevent resource exhaustion.

---

## 🚀 Quick Start Guide

### Using Docker (Easiest Way)

This is the **recommended method** for most users. Docker handles all dependencies automatically.

#### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd advanced-lms
```

#### Step 2: Set Up Environment Variables

```bash
# Backend environment
cp backend/.env.example backend/.env

# Frontend environment
cp frontend/.env.example frontend/.env
```

> **⚠️ Important:** Edit the `.env` files and update sensitive values (JWT secrets, database passwords, email settings) before running in production.

#### Step 3: Start the Application

```bash
# Start all services (PostgreSQL, Redis, Backend, Frontend)
docker-compose up -d

# View logs to see startup progress
docker-compose logs -f
```

This will start:
- PostgreSQL database on port 5432
- Redis cache on port 6379
- Backend API on port 3001
- Frontend web app on port 3000

#### Step 4: Run Database Migrations

```bash
# Run database migrations to create tables
docker-compose exec backend bun run migrate

# Seed database with initial data (optional)
docker-compose exec backend bun run seed
```

#### Step 5: Access the Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3001
- **API Health Check:** http://localhost:3001/health
- **API Documentation:** http://localhost:3001/api/docs (if enabled)

#### Step 6: Verify Everything is Running

```bash
# Check all services status
docker-compose ps

# All services should show "Up" status
```

Congratulations! 🎉 Your LMS is now running!

---

## 💻 Local Development Setup

### Running Without Docker (Advanced)

If you prefer to run services directly on your machine instead of using Docker.

#### Step 1: Install Dependencies

```bash
# Backend
cd backend
bun install  # or: npm install

# Frontend
cd ../frontend
bun install  # or: npm install
```

#### Step 2: Set Up PostgreSQL Locally

```bash
# Install PostgreSQL 14+ (if not already installed)
# macOS: brew install postgresql@14
# Ubuntu: sudo apt-get install postgresql-14

# Start PostgreSQL service
brew services start postgresql@14  # macOS
# or
sudo systemctl start postgresql   # Linux

# Create database
createdb advanced_lms

# Create user and grant privileges
psql -d postgres
CREATE USER lms_user WITH PASSWORD 'lms_password';
GRANT ALL PRIVILEGES ON DATABASE advanced_lms TO lms_user;
\q
```

#### Step 3: Set Up Redis Locally

```bash
# Install Redis (if not already installed)
# macOS: brew install redis
# Ubuntu: sudo apt-get install redis-server

# Start Redis service
brew services start redis  # macOS
# or
sudo systemctl start redis   # Linux
```

#### Step 4: Configure Environment Variables

Edit `backend/.env`:

```env
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://lms_user:lms_password@localhost:5432/advanced_lms

# Redis
REDIS_URL=redis://localhost:6379

# JWT (Change these in production!)
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=another-secret-key-for-refresh-tokens
JWT_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Email (Optional - for development, you can skip)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

Edit `frontend/.env`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME=Advanced LMS
```

#### Step 5: Run Database Migrations

```bash
cd backend
bun run migrate  # or: npm run migrate
bun run seed     # or: npm run seed (optional)
```

#### Step 6: Start Backend

```bash
cd backend
bun run dev  # or: npm run dev

# Backend will run on http://localhost:3001
```

#### Step 7: Start Frontend (in a new terminal)

```bash
cd frontend
bun run dev  # or: npm run dev

# Frontend will run on http://localhost:3000
```

---

## 🔧 Environment Variables

### Backend Environment Variables (.env)

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NODE_ENV` | Environment (development/production) | `development` | No |
| `PORT` | Backend server port | `3001` | No |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:3000` | Yes |
| `DATABASE_URL` | PostgreSQL connection string | - | Yes |
| `REDIS_URL` | Redis connection string | - | Yes |
| `JWT_SECRET` | Secret for signing JWT tokens | - | Yes |
| `JWT_REFRESH_SECRET` | Secret for refresh tokens | - | Yes |
| `JWT_EXPIRY` | Access token expiry time | `15m` | No |
| `JWT_REFRESH_EXPIRY` | Refresh token expiry time | `7d` | No |
| `SMTP_HOST` | Email server host | `smtp.gmail.com` | No |
| `SMTP_PORT` | Email server port | `587` | No |
| `SMTP_USER` | Email username | - | No |
| `SMTP_PASS` | Email password | - | No |
| `CSRF_TOKEN_SECRET` | Secret for CSRF tokens | - | Yes |
| `MAX_FILE_SIZE` | Max upload size in bytes | `52428800` | No |
| `ALLOWED_FILE_TYPES` | Allowed file extensions | `pdf,doc,docx,jpg,png` | No |
| `MAINTENANCE_MODE` | Enable maintenance mode | `false` | No |

### Frontend Environment Variables (.env)

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:3001` | Yes |
| `NEXT_PUBLIC_APP_NAME` | Application name | `Advanced LMS` | No |

> **💡 Note:** Frontend variables must start with `NEXT_PUBLIC_` to be exposed to the browser.

---

## 📁 Project Structure

```
advanced-lms/
├── backend/                    # Node.js/Express backend
│   ├── src/
│   │   ├── config/            # Database, Redis, JWT configuration
│   │   │   ├── database.js    # Sequelize database connection
│   │   │   ├── redis.js       # Redis client setup
│   │   │   └── jwt.js         # JWT configuration
│   │   ├── controllers/       # Request handlers
│   │   │   ├── authController.js
│   │   │   ├── courseController.js
│   │   │   ├── userController.js
│   │   │   └── ...
│   │   ├── middleware/        # Custom middleware
│   │   │   ├── auth.js        # Authentication middleware
│   │   │   ├── rbac.js        # Role-based access control
│   │   │   ├── rateLimiter.js # Rate limiting
│   │   │   ├── cache.js       # Redis caching
│   │   │   └── maintenance.js # Maintenance mode check
│   │   ├── models/            # Sequelize models (database tables)
│   │   │   ├── User.js
│   │   │   ├── Course.js
│   │   │   ├── Enrollment.js
│   │   │   ├── Quiz.js
│   │   │   ├── Assignment.js
│   │   │   ├── Certificate.js
│   │   │   ├── Badge.js
│   │   │   ├── Achievement.js
│   │   │   └── ... (30+ models)
│   │   ├── routes/            # API route definitions
│   │   │   ├── authRoutes.js
│   │   │   ├── courseRoutes.js
│   │   │   ├── gamificationRoutes.js
│   │   │   └── ...
│   │   ├── services/          # Business logic
│   │   │   ├── authService.js
│   │   │   ├── courseService.js
│   │   │   ├── cacheService.js
│   │   │   └── ...
│   │   ├── utils/             # Helper functions
│   │   │   ├── logger.js
│   │   │   ├── validators.js
│   │   │   └── ...
│   │   ├── validators/        # Joi validation schemas
│   │   │   ├── authValidator.js
│   │   │   └── ...
│   │   └── migrations/        # Database migrations
│   │       ├── runner.js      # Migration runner
│   │       └── seed.js        # Database seeder
│   ├── app.js                 # Express app setup
│   ├── server.js              # Entry point
│   ├── .env.example           # Environment template
│   ├── Dockerfile             # Docker image definition
│   └── package.json           # Backend dependencies
│
├── frontend/                   # Next.js 14 frontend
│   ├── app/                   # Next.js App Router pages
│   │   ├── (auth)/           # Authentication pages group
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── verify-email/
│   │   ├── (dashboard)/      # Protected dashboard pages
│   │   │   ├── student/
│   │   │   ├── instructor/
│   │   │   └── admin/
│   │   ├── courses/          # Course-related pages
│   │   ├── learning/         # Learning interface
│   │   ├── profile/          # User profile
│   │   ├── layout.tsx        # Root layout
│   │   └── page.tsx          # Homepage
│   ├── components/           # Reusable React components
│   │   ├── auth/             # Auth-related components
│   │   ├── courses/          # Course components
│   │   ├── gamification/     # Points, badges, leaderboards
│   │   ├── shared/           # Common UI components
│   │   └── ui/               # Base UI components
│   ├── lib/                  # Utilities and configurations
│   │   ├── api.js            # Axios API client
│   │   └── auth-provider.tsx # Auth context
│   ├── public/               # Static assets
│   ├── .env.example          # Environment template
│   ├── Dockerfile            # Docker image definition
│   ├── next.config.js        # Next.js configuration
│   ├── tailwind.config.js    # Tailwind CSS configuration
│   └── package.json          # Frontend dependencies
│
├── docs/                     # Documentation
│   ├── API_DOCUMENTATION.md  # Complete API reference
│   ├── ARCHITECTURE.md       # System architecture
│   ├── DATABASE_SCHEMA.md    # Database structure
│   ├── SETUP.md              # Setup instructions
│   ├── TROUBLESHOOTING.md    # Common issues
│   ├── DEVELOPMENT_SETUP.md  # Dev environment setup
│   ├── DEPLOYMENT_GUIDE.md   # Production deployment
│   └── MAINTENANCE.md        # Maintenance procedures
│
├── docker-compose.yml        # Docker orchestration
├── .gitignore               # Git ignore rules
├── CONTRIBUTING.md          # Contribution guidelines
└── README.md                # This file
```

---

## 👥 User Roles & Permissions

### 🎓 Student

Students are learners who enroll in courses and complete lessons.

| Capability | Description |
|------------|-------------|
| Browse Courses | View all published courses |
| Enroll | Enroll in available courses |
| Learn Content | Access lessons, videos, materials |
| Take Quizzes | Complete quizzes and see results |
| Submit Assignments | Upload assignment submissions |
| Track Progress | View course completion progress |
| Earn Points | Gain points for activities |
| Earn Badges | Unlock achievements and badges |
| View Leaderboards | See rankings on leaderboards |
| Manage Profile | Edit personal information |
| Participate in Discussions | Post questions and answers |
| Receive Certificates | Get certificates upon course completion |

### 👨‍🏫 Instructor

Instructors create and manage courses and assess student work.

| Student Capabilities | + Instructor Capabilities |
|---------------------|---------------------------|
| All student features | Create and edit courses |
| | Add lessons and content |
| | Create quizzes and assignments |
| | Grade student assignments |
| | View enrolled students |
| | Track student progress |
| | Respond to discussions |
| | Send course announcements |
| | View course analytics |

### 🔧 Administrator

Administrators have full system control.

| Instructor Capabilities | + Admin Capabilities |
|-----------------------|----------------------|
| All instructor features | Manage all users |
| | Approve courses |
| | Ban/unban users |
| | Moderate content |
| | Configure system settings |
| | View audit logs |
| | Backup and restore database |
| | Toggle maintenance mode |
| | View system-wide analytics |
| | Manage badges and achievements |

---

## 🏃 Running the Application

### Docker Commands

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# Restart all services
docker-compose restart

# View logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f backend
docker-compose logs -f frontend

# Execute commands in backend container
docker-compose exec backend bun run migrate
docker-compose exec backend bun run seed

# Check service status
docker-compose ps

# Rebuild containers
docker-compose up -d --build

# Remove everything (including volumes)
docker-compose down -v
```

### Database Migrations

```bash
# Docker
docker-compose exec backend bun run migrate

# Local
cd backend
bun run migrate
```

### Database Seeding

```bash
# Docker
docker-compose exec backend bun run seed

# Local
cd backend
bun run seed
```

### Health Checks

```bash
# Backend health
curl http://localhost:3001/health

# Expected response:
# {
#   "status": "ok",
#   "database": "connected",
#   "redis": "connected"
# }
```

### Accessing the Application

- **Frontend:** Open http://localhost:3000 in your browser
- **Backend API:** http://localhost:3001/api
- **API Documentation:** See `docs/API_DOCUMENTATION.md`

---

## 🔌 API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | User login | No |
| POST | `/api/auth/logout` | User logout | Yes |
| POST | `/api/auth/verify-email` | Verify email address | No |
| POST | `/api/auth/forgot-password` | Request password reset | No |
| POST | `/api/auth/reset-password` | Reset password | No |
| POST | `/api/auth/refresh-token` | Refresh access token | No |
| GET | `/api/auth/me` | Get current user | Yes |

### Users

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/users/:id` | Get user profile | Yes |
| PUT | `/api/users/:id` | Update user profile | Yes (own or admin) |
| PUT | `/api/users/:id/password` | Change password | Yes (own) |
| POST | `/api/users/:id/avatar` | Upload avatar | Yes (own) |
| GET | `/api/users/:id/progress` | Get user progress | Yes (own or admin) |

### Courses

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/courses` | List all courses | No |
| GET | `/api/courses/:id` | Get course details | No |
| POST | `/api/courses` | Create course | Yes (Instructor+) |
| PUT | `/api/courses/:id` | Update course | Yes (Owner+) |
| DELETE | `/api/courses/:id` | Delete course | Yes (Owner+) |
| GET | `/api/courses/:id/sections` | Get course sections | No |
| POST | `/api/courses/:id/sections` | Create section | Yes (Owner+) |
| GET | `/api/courses/:id/enrollments` | Get enrollments | Yes (Owner+) |

### Lessons

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/courses/:courseId/lessons/:lessonId` | Get lesson | Yes (Enrolled) |
| POST | `/api/courses/:courseId/lessons` | Create lesson | Yes (Owner+) |
| PUT | `/api/courses/:courseId/lessons/:lessonId` | Update lesson | Yes (Owner+) |
| DELETE | `/api/courses/:courseId/lessons/:lessonId` | Delete lesson | Yes (Owner+) |
| POST | `/api/lessons/:id/complete` | Mark lesson complete | Yes (Enrolled) |

### Enrollments

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/courses/:id/enroll` | Enroll in course | Yes (Student) |
| DELETE | `/api/enrollments/:id` | Unenroll from course | Yes (Student) |
| GET | `/api/enrollments/user` | Get my enrollments | Yes |

### Quizzes

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/courses/:courseId/quizzes` | List quizzes | Yes (Enrolled) |
| GET | `/api/quizzes/:id` | Get quiz details | Yes (Enrolled) |
| POST | `/api/quizzes` | Create quiz | Yes (Instructor+) |
| POST | `/api/quizzes/:id/attempt` | Submit quiz attempt | Yes (Enrolled) |
| GET | `/api/quizzes/:id/attempts` | Get quiz attempts | Yes (Enrolled/Owner) |

### Assignments

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/courses/:courseId/assignments` | List assignments | Yes (Enrolled) |
| GET | `/api/assignments/:id` | Get assignment | Yes (Enrolled) |
| POST | `/api/assignments` | Create assignment | Yes (Instructor+) |
| POST | `/api/assignments/:id/submit` | Submit assignment | Yes (Enrolled) |
| GET | `/api/assignments/:id/submissions` | Get submissions | Yes (Owner+) |
| PUT | `/api/assignment-submissions/:id/grade` | Grade submission | Yes (Instructor+) |

### Certificates

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/certificates` | Get my certificates | Yes |
| GET | `/api/certificates/:id` | Get certificate | Yes (Owner) |
| POST | `/api/certificates/generate` | Generate certificate | Yes (System) |

### Gamification

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/gamification/points` | Get user points | Yes |
| GET | `/api/gamification/badges` | Get user badges | Yes |
| GET | `/api/gamification/achievements` | Get achievements | Yes |
| GET | `/api/gamification/streak` | Get learning streak | Yes |
| GET | `/api/gamification/leaderboard` | Get leaderboard | Yes |
| GET | `/api/gamification/history` | Get points history | Yes |

### Discussions

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/courses/:id/discussions` | Get discussions | Yes (Enrolled) |
| POST | `/api/courses/:id/discussions` | Create discussion | Yes (Enrolled) |
| POST | `/api/discussions/:id/comments` | Add comment | Yes (Enrolled) |

### Analytics

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/analytics/user/:id` | Get user analytics | Yes (Own/Admin) |
| GET | `/api/analytics/course/:id` | Get course analytics | Yes (Instructor+) |
| GET | `/api/analytics/system` | Get system analytics | Yes (Admin) |

### Admin

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/admin/users` | List all users | Admin |
| PUT | `/api/admin/users/:id/ban` | Ban user | Admin |
| PUT | `/api/admin/users/:id/unban` | Unban user | Admin |
| POST | `/api/admin/courses/:id/approve` | Approve course | Admin |
| GET | `/api/admin/audit-logs` | Get audit logs | Admin |
| POST | `/api/admin/backup` | Create backup | Admin |
| GET | `/api/admin/settings` | Get settings | Admin |
| PUT | `/api/admin/settings` | Update settings | Admin |

> **📖 Complete API Reference:** See `docs/API_DOCUMENTATION.md` for detailed request/response examples.

---

## ⚡ Performance Tips

### Why Use Bun?

Bun is a modern JavaScript runtime that's significantly faster and more memory-efficient than Node.js:

- **Faster startup:** 4-5x faster cold starts
- **Lower memory usage:** Up to 30% less RAM consumption
- **Better for old hardware:** Runs smoothly on machines with limited resources
- **Drop-in compatible:** Works with existing Node.js packages

```bash
# Using Bun instead of Node.js
bun install      # Instead of npm install
bun run dev      # Instead of npm run dev
bun run migrate  # Instead of npm run migrate
```

### Redis Caching

The system uses Redis for caching frequently accessed data:

- User sessions and tokens
- Course catalogs
- Quiz questions
- Leaderboard rankings
- API responses

> **💡 Tip:** If you're running on low-spec hardware, Redis helps reduce database load significantly.

### Optimization Features

| Feature | Benefit |
|---------|---------|
| **Response Compression** | Reduces data transfer by 70-80% |
| **Database Connection Pooling** | Efficient connection management |
| **Lazy Loading** | Components load only when needed |
| **Code Splitting** | Smaller initial bundle sizes |
| **Image Optimization** | Next.js automatic image optimization |
| **Rate Limiting** | Prevents abuse and reduces load |

### Monitoring Performance

```bash
# Check Docker container resource usage
docker stats

# Check logs for slow queries
docker-compose logs backend | grep "slow query"

# Check Redis memory usage
docker-compose exec redis redis-cli info memory
```

---

## 🔧 Common Issues & Troubleshooting

### Database Connection Issues

**Problem:** `SequelizeConnectionError: connect ECONNREFUSED`

**Solutions:**

1. **Check if PostgreSQL is running:**
   ```bash
   # Docker
   docker-compose ps postgres

   # Local
   brew services list | grep postgresql  # macOS
   sudo systemctl status postgresql      # Linux
   ```

2. **Start PostgreSQL:**
   ```bash
   # Docker
   docker-compose up -d postgres

   # Local
   brew services start postgresql@14     # macOS
   sudo systemctl start postgresql       # Linux
   ```

3. **Verify connection string in `.env`:**
   ```env
   # Docker (internal network)
   DATABASE_URL=postgresql://lms_user:lms_password@postgres:5432/advanced_lms

   # Local
   DATABASE_URL=postgresql://lms_user:lms_password@localhost:5432/advanced_lms
   ```

### Port Already in Use

**Problem:** `Error: listen EADDRINUSE: address already in use :::3001`

**Solutions:**

1. **Find and kill the process:**
   ```bash
   # Find process using the port
   lsof -i :3001
   # or
   netstat -tulpn | grep :3001

   # Kill the process
   kill -9 <PID>
   ```

2. **Use a different port:**
   Edit `.env` and change `PORT=3001` to `PORT=3002`

### Permission Denied

**Problem:** `Error: EACCES: permission denied`

**Solutions:**

1. **Fix file permissions:**
   ```bash
   # Give execute permission to scripts
   chmod +x backend/src/migrations/runner.js

   # Fix directory permissions
   sudo chown -R $USER:$USER .
   ```

2. **Don't use sudo** unless absolutely necessary. It can cause permission issues with Docker volumes.

### Docker Containers Won't Start

**Problem:** Containers exit immediately or fail to start

**Solutions:**

1. **Check logs:**
   ```bash
   docker-compose logs
   docker-compose logs backend
   ```

2. **Rebuild containers:**
   ```bash
   docker-compose down
   docker-compose up -d --build
   ```

3. **Clear Docker cache:**
   ```bash
   docker-compose down -v
   docker system prune -a
   docker-compose up -d --build
   ```

### Redis Connection Failed

**Problem:** `Error: Redis connection failed`

**Solutions:**

1. **Check Redis status:**
   ```bash
   docker-compose ps redis
   docker-compose logs redis
   ```

2. **Restart Redis:**
   ```bash
   docker-compose restart redis
   ```

3. **Test Redis connection:**
   ```bash
   docker-compose exec redis redis-cli ping
   # Should return: PONG
   ```

### Frontend Can't Connect to Backend

**Problem:** API calls fail with connection errors

**Solutions:**

1. **Verify both services are running:**
   ```bash
   docker-compose ps
   ```

2. **Check frontend API URL:**
   In `frontend/.env`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001
   ```

3. **Check CORS settings in backend:**
   In `backend/.env`:
   ```env
   FRONTEND_URL=http://localhost:3000
   ```

### Migration Errors

**Problem:** Database migration fails

**Solutions:**

1. **Check migration status:**
   ```bash
   docker-compose exec backend bun run migrate
   ```

2. **Reset database (⚠️ deletes all data):**
   ```bash
   docker-compose exec postgres psql -U lms_user -d advanced_lms -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
   docker-compose exec backend bun run migrate
   docker-compose exec backend bun run seed
   ```

3. **Check for migration conflicts:**
   ```bash
   docker-compose exec backend psql -U lms_user -d advanced_lms -c "SELECT * FROM SequelizeMeta;"
   ```

### How to View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
docker-compose logs -f redis

# Last 100 lines
docker-compose logs --tail=100 backend
```

### Something Else is Broken?

1. **Check the documentation:** `docs/TROUBLESHOOTING.md` has more detailed solutions
2. **Check GitHub Issues:** Search for similar problems
3. **Create an issue:** Include your OS, Docker version, and error logs

---

## 🔄 Development Workflow

### Making Changes

1. **Create a feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes:**
   - Edit code files
   - Add new features
   - Fix bugs

3. **Test your changes:**
   ```bash
   # Start services
   docker-compose up -d

   # Run migrations if needed
   docker-compose exec backend bun run migrate

   # Test manually in browser
   # Or run automated tests (if available)
   ```

4. **Commit your changes:**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

5. **Push and create PR:**
   ```bash
   git push origin feature/your-feature-name
   ```

### Adding New Features

1. **Backend API endpoint:**
   - Create controller in `backend/src/controllers/`
   - Create service in `backend/src/services/`
   - Add route in `backend/src/routes/`
   - Add validation in `backend/src/validators/`
   - Update API documentation

2. **Frontend page:**
   - Create page in `frontend/app/`
   - Create components in `frontend/components/`
   - Add API calls to `lib/api.js`
   - Update types as needed

3. **Database changes:**
   - Create migration file in `backend/src/migrations/`
   - Update/create model in `backend/src/models/`
   - Run migration: `bun run migrate`
   - Update schema docs

### Testing

```bash
# Backend tests (if available)
cd backend
bun test

# Frontend tests (if available)
cd frontend
bun test

# Linting
cd frontend
bun run lint

# Type checking
cd frontend
bunx tsc --noEmit
```

### Code Style

- **Backend:** Follow existing code style, use descriptive variable names
- **Frontend:** Follow React best practices, use TypeScript strictly
- **Comments:** Only comment complex logic, avoid obvious comments
- **Formatting:** Use consistent indentation (2 spaces) and line length

---

## 📚 Additional Resources

### Documentation

| Document | Description |
|----------|-------------|
| [API Documentation](docs/API_DOCUMENTATION.md) | Complete API reference with examples |
| [Architecture](docs/ARCHITECTURE.md) | System architecture and design patterns |
| [Database Schema](docs/DATABASE_SCHEMA.md) | Complete database structure |
| [Setup Guide](docs/SETUP.md) | Detailed setup instructions |
| [Development Setup](docs/DEVELOPMENT_SETUP.md) | Development environment setup |
| [Deployment Guide](docs/DEPLOYMENT_GUIDE.md) | Production deployment |
| [Troubleshooting](docs/TROUBLESHOOTING.md) | Common issues and solutions |
| [Maintenance](docs/MAINTENANCE.md) | System maintenance procedures |

### Contributing

- **Contributing Guidelines:** [CONTRIBUTING.md](CONTRIBUTING.md)
- Please read before submitting pull requests
- Follow the code of conduct
- Report bugs via GitHub Issues

### Support

- **GitHub Issues:** [Create an issue](https://github.com/your-repo/issues)
- **Documentation:** Check the `docs/` folder first
- **Email:** support@example.com (replace with actual)

### License

MIT License - see [LICENSE](LICENSE) file for details

---

## 🙏 Acknowledgments

Built with modern open-source technologies:
- [Next.js](https://nextjs.org/) - React framework
- [Express](https://expressjs.com/) - Web framework
- [PostgreSQL](https://www.postgresql.org/) - Database
- [Redis](https://redis.io/) - Caching
- [Docker](https://www.docker.com/) - Containerization
- [Tailwind CSS](https://tailwindcss.com/) - Styling

---

## 📞 Getting Started Checklist

- [ ] Clone the repository
- [ ] Install Docker & Docker Compose
- [ ] Copy and configure `.env` files
- [ ] Run `docker-compose up -d`
- [ ] Run `docker-compose exec backend bun run migrate`
- [ ] Run `docker-compose exec backend bun run seed` (optional)
- [ ] Access http://localhost:3000
- [ ] Register a new account
- [ ] Explore the features!

---

**Ready to build your learning platform? 🚀**

Start with the Quick Start guide above, and refer to the documentation in the `docs/` folder for more detailed information.

Happy coding! 💻

