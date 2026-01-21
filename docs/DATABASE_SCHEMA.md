# Database Schema - Advanced LMS

## Overview

The database schema is designed for a comprehensive Learning Management System with support for authentication, authorization, and audit trails. The schema uses UUID primary keys for security and PostgreSQL-specific features for optimal performance.

## Entity Relationship Diagram

```
┌─────────────────┐
│     roles       │
│─────────────────│
│ id (PK)         │◄────────┐
│ name            │         │
│ permissions     │         │
│ created_at      │         │
└─────────────────┘         │
                            │
                            │ (1:N)
                            │
┌─────────────────────────┐│
│        users             ││
│──────────────────────────││
│ id (PK)                  ││
│ email (unique)           ││
│ username (unique)        ││
│ password_hash            ││
│ first_name               ││
│ last_name                ││
│ profile_picture_url      ││
│ bio                      ││
│ role_id (FK)             │┘
│ is_email_verified        │
│ email_verification_token │
│ is_active                │
│ last_login               │
│ created_at               │
│ updated_at               │
│ deleted_at               │
└──────────────────────────┘
         │                    
         │                    
         │ (1:N)              
         │                    
         ├──────────────────────────────┐
         │                              │
         │                              │
         ▼                              ▼
┌──────────────────────────┐  ┌────────────────────┐
│password_reset_tokens     │  │   audit_logs       │
│──────────────────────────│  │────────────────────│
│ id (PK)                  │  │ id (PK)            │
│ user_id (FK)             │  │ user_id (FK)       │
│ token (unique)           │  │ action             │
│ expires_at               │  │ resource_type      │
│ used_at                  │  │ resource_id        │
│ created_at               │  │ changes            │
└──────────────────────────┘  │ ip_address         │
                               │ user_agent         │
                               │ created_at         │
                               └────────────────────┘
```

## Tables

### roles

Defines user roles and their associated permissions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique role identifier |
| name | ENUM | NOT NULL, UNIQUE | Role name ('student', 'instructor', 'admin') |
| permissions | JSON | NOT NULL, DEFAULT [] | Array of permission strings |
| created_at | TIMESTAMP | NOT NULL | Creation timestamp |

**Indexes:**
- Primary key on `id`
- Unique constraint on `name`

**Seeded Data:**
```sql
-- student role
{
  "name": "student",
  "permissions": [
    "course:view", "course:enroll",
    "lesson:view",
    "assignment:submit",
    "quiz:take",
    "profile:view", "profile:edit"
  ]
}

-- instructor role
{
  "name": "instructor",
  "permissions": [
    "course:view", "course:create", "course:edit", "course:delete",
    "lesson:view", "lesson:create", "lesson:edit", "lesson:delete",
    "assignment:view", "assignment:create", "assignment:edit", "assignment:grade",
    "quiz:view", "quiz:create", "quiz:edit",
    "student:view",
    "profile:view", "profile:edit"
  ]
}

-- admin role
{
  "name": "admin",
  "permissions": [
    "user:view", "user:create", "user:edit", "user:delete",
    "course:view", "course:create", "course:edit", "course:delete",
    "lesson:view", "lesson:create", "lesson:edit", "lesson:delete",
    "assignment:view", "assignment:create", "assignment:edit", "assignment:delete", "assignment:grade",
    "quiz:view", "quiz:create", "quiz:edit", "quiz:delete",
    "role:manage",
    "audit:view",
    "system:manage"
  ]
}
```

---

### users

Stores user account information and profiles.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique user identifier |
| email | VARCHAR(255) | NOT NULL, UNIQUE | User email address |
| username | VARCHAR(255) | NOT NULL, UNIQUE | Unique username |
| password_hash | VARCHAR(255) | NOT NULL | Bcrypt hashed password |
| first_name | VARCHAR(255) | NOT NULL | User's first name |
| last_name | VARCHAR(255) | NOT NULL | User's last name |
| profile_picture_url | VARCHAR(255) | NULL | URL to profile picture |
| bio | TEXT | NULL | User biography |
| role_id | UUID | NOT NULL, FOREIGN KEY | Reference to roles table |
| is_email_verified | BOOLEAN | NOT NULL, DEFAULT false | Email verification status |
| email_verification_token | VARCHAR(255) | NULL | Token for email verification |
| is_active | BOOLEAN | NOT NULL, DEFAULT true | Account active status |
| last_login | TIMESTAMP | NULL | Last login timestamp |
| created_at | TIMESTAMP | NOT NULL | Account creation timestamp |
| updated_at | TIMESTAMP | NOT NULL | Last update timestamp |
| deleted_at | TIMESTAMP | NULL | Soft delete timestamp |

**Indexes:**
- Primary key on `id`
- Unique constraint on `email`
- Unique constraint on `username`
- Index on `role_id` (foreign key)
- Index on `email` (for lookups)
- Index on `username` (for lookups)

**Foreign Keys:**
- `role_id` REFERENCES `roles(id)`

**Constraints:**
- Email must be valid email format (validated by Sequelize)
- Password must meet strength requirements (enforced by application)

**Soft Delete:**
- Uses `deleted_at` for soft deletes (paranoid mode)
- Deleted records are not returned in normal queries
- Can be restored if needed

---

### password_reset_tokens

Temporary tokens for password reset functionality.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique token record identifier |
| user_id | UUID | NOT NULL, FOREIGN KEY | Reference to users table |
| token | VARCHAR(255) | NOT NULL, UNIQUE | Reset token (UUID) |
| expires_at | TIMESTAMP | NOT NULL | Token expiration time (1 hour) |
| used_at | TIMESTAMP | NULL | When token was used |
| created_at | TIMESTAMP | NOT NULL | Token creation timestamp |

**Indexes:**
- Primary key on `id`
- Unique constraint on `token`
- Index on `token` (for fast lookups)
- Index on `user_id` (foreign key)

**Foreign Keys:**
- `user_id` REFERENCES `users(id)`

**Business Rules:**
- Tokens expire after 1 hour
- Tokens can only be used once (`used_at` is set)
- Expired tokens should be cleaned up periodically
- Multiple tokens can exist for a user (only latest is valid)

---

### audit_logs

Immutable audit trail for security and compliance.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique log entry identifier |
| user_id | UUID | NULL, FOREIGN KEY | Reference to users table |
| action | VARCHAR(255) | NOT NULL | Action performed |
| resource_type | VARCHAR(255) | NULL | Type of resource affected |
| resource_id | VARCHAR(255) | NULL | ID of resource affected |
| changes | JSON | NULL | JSON object of changes made |
| ip_address | VARCHAR(45) | NULL | IP address of request |
| user_agent | TEXT | NULL | Browser user agent string |
| created_at | TIMESTAMP | NOT NULL | Log entry timestamp |

**Indexes:**
- Primary key on `id`
- Index on `user_id` (for user activity queries)
- Index on `action` (for action-based queries)
- Index on `created_at` (for time-based queries)

**Foreign Keys:**
- `user_id` REFERENCES `users(id)` (nullable for system actions)

**Logged Actions:**
- `user_registered` - New user registration
- `user_login` - Successful login
- `user_logout` - User logout
- `password_reset` - Password reset completed
- `email_verified` - Email verification completed
- (Future: course actions, enrollment, grades, etc.)

**Immutable:**
- No updates or deletes allowed
- No `updated_at` column
- Provides complete audit trail

---

## Data Types

### UUID
- All primary keys use UUID v4
- Provides security (non-sequential)
- Prevents ID enumeration attacks
- Better for distributed systems

### ENUM
- `roles.name`: Limited to specific values
- Database-enforced data integrity
- Efficient storage

### JSON
- `roles.permissions`: Array of permission strings
- `audit_logs.changes`: Object containing changes
- PostgreSQL JSON type with indexing support

### TIMESTAMP
- All timestamps include timezone
- Stored in UTC
- Converted to local time by application

## Relationships

### One-to-Many

**roles → users**
- One role has many users
- Each user has exactly one role
- Cannot delete role if users exist (foreign key constraint)

**users → password_reset_tokens**
- One user can have multiple reset tokens
- Typically only latest token is valid
- Old tokens remain for audit purposes

**users → audit_logs**
- One user has many audit log entries
- User can be null for system actions
- Cascade delete not enabled (preserve audit trail)

## Indexes Strategy

### Primary Indexes (Automatic)
- All primary keys (UUID)
- All unique constraints

### Foreign Key Indexes
- `users.role_id`
- `password_reset_tokens.user_id`
- `audit_logs.user_id`

### Lookup Indexes
- `users.email` - Frequent login lookups
- `users.username` - Profile lookups
- `password_reset_tokens.token` - Reset token validation
- `audit_logs.action` - Audit queries by action
- `audit_logs.created_at` - Time-based audit queries

## Query Optimization

### Most Common Queries

**User Login:**
```sql
SELECT u.*, r.* 
FROM users u
JOIN roles r ON u.role_id = r.id
WHERE u.email = ? AND u.deleted_at IS NULL;
```
- Uses index on `users.email`
- Join is efficient with foreign key index

**Check Reset Token:**
```sql
SELECT * FROM password_reset_tokens
WHERE token = ? AND expires_at > NOW() AND used_at IS NULL;
```
- Uses unique index on `token`
- Very fast lookup (O(1))

**User Audit Trail:**
```sql
SELECT * FROM audit_logs
WHERE user_id = ?
ORDER BY created_at DESC
LIMIT 50;
```
- Uses index on `user_id`
- Index on `created_at` for sorting

## Database Maintenance

### Regular Tasks

**Clean Expired Tokens:**
```sql
DELETE FROM password_reset_tokens
WHERE expires_at < NOW() - INTERVAL '7 days';
```
- Run daily
- Keeps table size manageable

**Archive Old Audit Logs:**
```sql
-- Move logs older than 1 year to archive table
INSERT INTO audit_logs_archive
SELECT * FROM audit_logs
WHERE created_at < NOW() - INTERVAL '1 year';

DELETE FROM audit_logs
WHERE created_at < NOW() - INTERVAL '1 year';
```
- Run monthly/quarterly
- Maintains performance

### Backups

- Daily full backups
- Point-in-time recovery enabled
- Test restoration quarterly

### Monitoring

- Table sizes
- Index usage statistics
- Query performance
- Connection pool status
- Lock contention

## Migration Strategy

### Creating Migrations

Sequelize handles migrations automatically with `sequelize.sync()`. For production, use explicit migrations:

```bash
npm run migrate
```

### Rollback Strategy

Soft deletes allow data recovery:
- User accounts can be restored
- No data loss on "delete"
- Audit trail preserved

## Security Considerations

### SQL Injection Prevention
- Sequelize ORM handles parameterization
- No raw SQL with user input
- All queries use prepared statements

### Sensitive Data
- Passwords are hashed (never stored plain)
- Tokens are UUIDs (cryptographically random)
- Email verification tokens expire

### Audit Trail
- All authentication actions logged
- IP addresses recorded
- Cannot be modified or deleted
- Compliance ready

## Future Schema (Phase 2+)

Planned tables for future phases:

- **courses** - Course information
- **lessons** - Lesson content
- **enrollments** - User course enrollments
- **assignments** - Assignment details
- **submissions** - Student submissions
- **quizzes** - Quiz definitions
- **quiz_attempts** - Quiz attempts and scores
- **certificates** - Generated certificates
- **notifications** - User notifications
- **files** - Uploaded files metadata

---

For implementation details, see `/backend/src/models/` directory.
