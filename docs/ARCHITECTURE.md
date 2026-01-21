# System Architecture - Advanced LMS

## Overview

The Advanced Learning Management System is built using a modern, scalable microservices-inspired architecture with clear separation of concerns. The system is designed to run efficiently on low-spec hardware while maintaining high performance and security standards.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
│  ┌────────────────────────────────────────────────────────┐ │
│  │          Next.js Frontend (Port 3000)                   │ │
│  │  - React Components                                     │ │
│  │  - Tailwind CSS Styling                                 │ │
│  │  - Client-side Routing                                  │ │
│  │  - Auth Context & State Management                      │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTP/HTTPS
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      API Layer                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │        Express.js Backend (Port 3001)                   │ │
│  │  ┌──────────────────────────────────────────────────┐  │ │
│  │  │  Middleware Stack                                 │  │ │
│  │  │  - Helmet (Security Headers)                      │  │ │
│  │  │  - CORS                                            │  │ │
│  │  │  - Rate Limiting                                   │  │ │
│  │  │  - Authentication                                  │  │ │
│  │  │  - RBAC Authorization                              │  │ │
│  │  │  - Request Validation                              │  │ │
│  │  │  - Error Handling                                  │  │ │
│  │  └──────────────────────────────────────────────────┘  │ │
│  │  ┌──────────────────────────────────────────────────┐  │ │
│  │  │  Route Handlers                                    │  │ │
│  │  │  - Auth Routes                                     │  │ │
│  │  │  - (Future: Course, Lesson, User Routes)          │  │ │
│  │  └──────────────────────────────────────────────────┘  │ │
│  │  ┌──────────────────────────────────────────────────┐  │ │
│  │  │  Controllers                                       │  │ │
│  │  │  - Request/Response Handling                       │  │ │
│  │  │  - Input Validation                                │  │ │
│  │  └──────────────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Business Logic Layer                      │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Services                                               │ │
│  │  - AuthService (User authentication & authorization)    │ │
│  │  - EmailService (Email notifications)                   │ │
│  │  - TokenService (JWT management)                        │ │
│  │  - (Future: CourseService, LessonService, etc.)        │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Data Access Layer                         │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Sequelize ORM                                          │ │
│  │  - Models (User, Role, PasswordResetToken, AuditLog)   │ │
│  │  - Query Building                                       │ │
│  │  - Relationships & Associations                         │ │
│  │  - Migrations                                           │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Storage Layer                             │
│  ┌──────────────────────┐    ┌──────────────────────────┐  │
│  │  PostgreSQL Database  │    │   Redis Cache            │  │
│  │  (Port 5432)          │    │   (Port 6379)            │  │
│  │  - Users              │    │   - Token Blacklist      │  │
│  │  - Roles              │    │   - Session Data         │  │
│  │  - PasswordResetTokens│    │   - Rate Limit Counters  │  │
│  │  - AuditLogs          │    │                          │  │
│  │  - (Future: Courses,  │    │                          │  │
│  │    Lessons, etc.)     │    │                          │  │
│  └──────────────────────┘    └──────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Technology Stack

### Frontend

- **Next.js 14** - React framework with App Router
- **React 18** - UI library
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client
- **Lucide React** - Icon library

### Backend

- **Node.js 18** - JavaScript runtime
- **Express.js** - Web application framework
- **Sequelize** - ORM for PostgreSQL
- **PostgreSQL 14** - Relational database
- **Redis 7** - In-memory data store
- **JWT** - Token-based authentication
- **Bcrypt** - Password hashing
- **Joi** - Input validation
- **Nodemailer** - Email sending

### DevOps & Deployment

- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Alpine Linux** - Minimal Docker base images

## Design Patterns

### 1. MVC Pattern (Backend)

- **Models**: Define data structure and database schema
- **Controllers**: Handle HTTP requests/responses
- **Services**: Business logic layer
- **Routes**: API endpoint definitions

### 2. Repository Pattern

- Sequelize ORM abstracts database operations
- Models act as repositories
- Clean separation between data access and business logic

### 3. Middleware Chain

- Request processing pipeline
- Each middleware handles specific concerns (auth, validation, rate limiting)
- Error handling middleware catches and formats errors

### 4. Provider Pattern (Frontend)

- AuthProvider wraps the application
- Context API for global state management
- Custom hooks (useAuth) for accessing auth state

### 5. Layered Architecture

Clear separation of concerns:
1. **Presentation Layer** (Frontend) - UI components
2. **API Layer** (Backend routes) - HTTP interface
3. **Business Logic Layer** (Services) - Core functionality
4. **Data Access Layer** (Models/ORM) - Database operations
5. **Storage Layer** (Database) - Data persistence

## Security Architecture

### Authentication Flow

```
1. User Registration
   ├─ Input validation (Joi)
   ├─ Password hashing (bcrypt, 10 rounds)
   ├─ Generate email verification token (UUID)
   ├─ Store user in database
   ├─ Send verification email
   └─ Log audit trail

2. Email Verification
   ├─ Receive token from email link
   ├─ Validate token exists and matches
   ├─ Mark email as verified
   ├─ Clear verification token
   └─ Allow login

3. Login
   ├─ Validate credentials
   ├─ Check email verified
   ├─ Check account active
   ├─ Compare password hash
   ├─ Generate JWT access token (15min)
   ├─ Generate JWT refresh token (7days)
   ├─ Update last_login timestamp
   ├─ Log audit trail
   └─ Return tokens + user data

4. Protected Request
   ├─ Extract token from Authorization header
   ├─ Check token blacklist (Redis)
   ├─ Verify JWT signature
   ├─ Check token expiration
   ├─ Load user from database
   ├─ Check user is active
   ├─ Attach user to request
   └─ Continue to route handler

5. Token Refresh
   ├─ Validate refresh token
   ├─ Generate new access token
   ├─ Generate new refresh token
   └─ Return new tokens

6. Logout
   ├─ Add token to blacklist (Redis)
   ├─ Log audit trail
   └─ Client clears stored tokens
```

### Security Layers

1. **Network Security**
   - CORS configured for specific origin
   - Helmet.js security headers
   - Rate limiting on all endpoints

2. **Authentication Security**
   - JWT with short-lived access tokens
   - Refresh token rotation
   - Token blacklisting on logout
   - Email verification required

3. **Authorization Security**
   - Role-based access control (RBAC)
   - Permission-based authorization
   - Protected routes middleware

4. **Data Security**
   - Password hashing with bcrypt
   - SQL injection prevention (Sequelize)
   - Input validation and sanitization
   - Secure token generation (UUID)

5. **Application Security**
   - Environment variable configuration
   - Secrets not in source code
   - Audit logging for all auth actions
   - Error messages don't leak info

## Data Flow

### Registration Flow

```
Frontend                Backend                 Database                Email
   │                       │                       │                      │
   ├──POST /register──────>│                       │                      │
   │                       ├──Validate input       │                      │
   │                       ├──Hash password        │                      │
   │                       ├──INSERT user─────────>│                      │
   │                       │<──User created────────┤                      │
   │                       ├──INSERT audit log────>│                      │
   │                       ├──Send verification email──────────────────>│
   │<──Success response────┤                       │                      │
   │                       │                       │                      │
```

### Login Flow

```
Frontend                Backend                 Database                Redis
   │                       │                       │                      │
   ├──POST /login────────>│                       │                      │
   │                       ├──SELECT user────────>│                      │
   │                       │<──User data───────────┤                      │
   │                       ├──Verify password      │                      │
   │                       ├──Generate tokens      │                      │
   │                       ├──UPDATE last_login───>│                      │
   │                       ├──INSERT audit log────>│                      │
   │<──Tokens + user data──┤                       │                      │
   ├──Store tokens         │                       │                      │
   │                       │                       │                      │
```

### Protected Request Flow

```
Frontend                Backend                 Database                Redis
   │                       │                       │                      │
   ├──GET /me (+ token)──>│                       │                      │
   │                       ├──Check blacklist─────────────────────────>│
   │                       │<──Not blacklisted──────────────────────────┤
   │                       ├──Verify JWT           │                      │
   │                       ├──SELECT user────────>│                      │
   │                       │<──User data───────────┤                      │
   │<──User profile────────┤                       │                      │
   │                       │                       │                      │
```

## Database Schema

### Tables

1. **roles**
   - Primary table for user roles
   - Contains permissions as JSON
   - Seeded with default roles

2. **users**
   - User accounts and profiles
   - Foreign key to roles
   - Soft delete support (paranoid)

3. **password_reset_tokens**
   - Temporary tokens for password reset
   - One-hour expiry
   - Tracks if token used

4. **audit_logs**
   - Immutable audit trail
   - Tracks all authentication actions
   - Includes IP and user agent

### Relationships

```
roles (1) ──────< (N) users
users (1) ──────< (N) password_reset_tokens
users (1) ──────< (N) audit_logs
```

## Scalability Considerations

### Current Design (Phase 1)

- Single backend server
- Single database instance
- Redis for caching
- Suitable for 100-1000 concurrent users

### Future Scaling Options (Phase 2+)

1. **Horizontal Scaling**
   - Multiple backend instances behind load balancer
   - Shared PostgreSQL and Redis
   - Session persistence in Redis

2. **Database Scaling**
   - Read replicas for queries
   - Connection pooling (already configured)
   - Database indexing optimization

3. **Caching Strategy**
   - Redis for frequently accessed data
   - API response caching
   - Static asset CDN

4. **Microservices Split**
   - Auth service
   - Course service
   - User service
   - Notification service

## Performance Optimization

### Backend

- Connection pooling (max: 10, min: 2)
- Efficient database queries with indexes
- JWT for stateless authentication
- Redis for token blacklist (O(1) lookups)
- Rate limiting prevents abuse

### Frontend

- Next.js App Router for optimal performance
- Client-side caching of user data
- Automatic code splitting
- Static asset optimization
- Lazy loading components

### Docker

- Alpine Linux base images (minimal size)
- Multi-stage builds
- Resource limits configured
- Health checks for reliability

## Monitoring & Logging

### Logging

- Console logging in development
- Structured logging for production
- Audit logs in database
- Error tracking

### Health Checks

- `/health` endpoint for monitoring
- Docker health checks configured
- Database connection verification
- Redis connection verification

## Development Workflow

```
1. Local Development
   ├─ Edit code
   ├─ Hot reload (nodemon/next dev)
   └─ Test manually

2. Docker Development
   ├─ docker-compose up
   ├─ Volume mounts for live reload
   └─ Test in containerized environment

3. Production Build
   ├─ docker-compose build
   ├─ Run migrations
   ├─ Seed data
   └─ docker-compose up -d
```

## Future Architecture Enhancements

### Phase 2
- File upload service (S3-compatible)
- WebSocket for real-time features
- Background job processing (Bull/Redis)

### Phase 3
- Elasticsearch for search
- GraphQL API option
- Message queue (RabbitMQ)
- Microservices architecture

### Phase 4
- Kubernetes deployment
- Auto-scaling
- Multi-region support
- CDN integration

## Best Practices Implemented

1. **Separation of Concerns** - Each layer has single responsibility
2. **DRY Principle** - Reusable services and middleware
3. **Security by Default** - Multiple security layers
4. **Error Handling** - Centralized error handling
5. **Input Validation** - All inputs validated
6. **Database Indexing** - Optimized queries
7. **Environment Configuration** - 12-factor app principles
8. **Audit Trail** - All critical actions logged
9. **Type Safety** - TypeScript on frontend
10. **Container Orchestration** - Docker Compose for consistency

---

For implementation details, refer to the source code and inline documentation.
