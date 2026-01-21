# Advanced Learning Management System

A comprehensive, modern Learning Management System built with Next.js, Express, PostgreSQL, and Docker.

## 🚀 Features (Phase 1)

- **Complete Authentication System**
  - User registration with email verification
  - Secure login with JWT tokens
  - Password reset flow
  - Role-based access control (Student, Instructor, Admin)
  - Token refresh mechanism
  - Rate limiting on auth endpoints

- **Modern Tech Stack**
  - Backend: Node.js, Express, PostgreSQL, Sequelize ORM
  - Frontend: Next.js 14, React, TypeScript, Tailwind CSS
  - Caching: Redis
  - Containerization: Docker & Docker Compose

- **Security Features**
  - Password hashing with bcrypt
  - JWT authentication
  - Rate limiting
  - CORS protection
  - Helmet.js security headers
  - Input validation with Joi
  - SQL injection protection (Sequelize)

## 📋 Prerequisites

- Node.js 18+ 
- Docker & Docker Compose
- PostgreSQL 14+ (if running locally without Docker)
- Redis (optional, for token blacklisting)

## 🛠️ Quick Start

### Using Docker (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd advanced-lms
   ```

2. **Set up environment variables**
   ```bash
   # Backend
   cp backend/.env.example backend/.env
   
   # Frontend
   cp frontend/.env.example frontend/.env
   
   # Edit the .env files with your configuration
   ```

3. **Start the application**
   ```bash
   docker-compose up -d
   ```

4. **Run database migrations and seed**
   ```bash
   docker-compose exec backend npm run migrate
   docker-compose exec backend npm run seed
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - Health Check: http://localhost:3001/health

### Local Development (Without Docker)

See [docs/SETUP.md](docs/SETUP.md) for detailed local setup instructions.

## 📁 Project Structure

```
advanced-lms/
├── backend/
│   ├── src/
│   │   ├── config/         # Database, Redis, JWT configuration
│   │   ├── controllers/    # Request handlers
│   │   ├── middleware/     # Auth, RBAC, rate limiting
│   │   ├── models/         # Sequelize models
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── utils/          # Helper functions
│   │   ├── validators/     # Input validation schemas
│   │   └── migrations/     # Database migrations
│   ├── app.js              # Express app setup
│   ├── server.js           # Entry point
│   └── Dockerfile
├── frontend/
│   ├── app/
│   │   ├── (auth)/        # Authentication pages
│   │   ├── dashboard/     # Protected dashboard
│   │   └── layout.tsx     # Root layout
│   ├── components/        # Reusable components
│   ├── lib/               # API client & auth context
│   └── Dockerfile
├── docs/                  # Documentation
├── docker-compose.yml     # Docker orchestration
└── README.md
```

## 🔐 Default Roles & Permissions

The system includes three default roles:

### Student
- View courses and lessons
- Enroll in courses
- Submit assignments
- Take quizzes
- Manage own profile

### Instructor
- All student permissions
- Create and manage courses
- Create lessons and assignments
- Grade student work
- View enrolled students

### Admin
- All instructor permissions
- Manage users
- View audit logs
- System configuration

## 📚 API Documentation

See [docs/API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md) for complete API reference.

### Key Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/verify-email` - Email verification
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `GET /api/auth/me` - Get current user (protected)
- `POST /api/auth/logout` - Logout

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 📖 Additional Documentation

- [Setup Guide](docs/SETUP.md) - Detailed setup instructions
- [Architecture](docs/ARCHITECTURE.md) - System architecture overview
- [API Documentation](docs/API_DOCUMENTATION.md) - Complete API reference
- [Database Schema](docs/DATABASE_SCHEMA.md) - Database structure
- [Contributing](CONTRIBUTING.md) - How to contribute

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines.

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

Built with modern open-source technologies optimized for low-spec hardware.

## 📞 Support

For issues and questions, please open a GitHub issue.

---

**Phase 1 Status**: ✅ Complete
- Authentication System: ✅
- Database Schema: ✅
- Docker Configuration: ✅
- Documentation: ✅
