# API Documentation - Advanced LMS

Base URL: `http://localhost:3001`

## Table of Contents

- [Authentication](#authentication)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [Endpoints](#endpoints)

## Authentication

Most endpoints require authentication via JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <your_access_token>
```

### Token Types

- **Access Token**: Short-lived (15 minutes), used for API requests
- **Refresh Token**: Long-lived (7 days), used to obtain new access tokens

## Error Handling

All error responses follow this format:

```json
{
  "success": false,
  "message": "Error message here",
  "errors": ["Detailed error 1", "Detailed error 2"]
}
```

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate resource)
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

## Rate Limiting

| Endpoint | Limit | Window |
|----------|-------|--------|
| `/api/auth/register` | 5 requests | 15 minutes |
| `/api/auth/login` | 5 requests | 5 minutes |
| `/api/auth/forgot-password` | 3 requests | 15 minutes |
| All other endpoints | 100 requests | 15 minutes |

## Endpoints

### Health Check

#### GET /health

Check if the server is running.

**Response:**
```json
{
  "success": true,
  "message": "Server is healthy",
  "timestamp": "2024-01-20T10:00:00.000Z"
}
```

---

### Authentication Endpoints

#### POST /api/auth/register

Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "username": "johndoe",
  "password": "Password123!",
  "confirmPassword": "Password123!",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Validation Rules:**
- `email`: Valid email format, unique
- `username`: 3-30 alphanumeric characters, unique
- `password`: Minimum 8 characters, must contain uppercase, lowercase, number, and special character
- `confirmPassword`: Must match password
- `firstName`, `lastName`: 2-50 characters

**Success Response (201):**
```json
{
  "success": true,
  "message": "Registration successful. Please check your email to verify your account.",
  "data": {
    "user": {
      "id": "uuid-here",
      "email": "user@example.com",
      "username": "johndoe",
      "firstName": "John",
      "lastName": "Doe"
    }
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Validation error",
  "errors": ["Email already registered"]
}
```

---

#### POST /api/auth/verify-email

Verify email address using the token sent via email.

**Request Body:**
```json
{
  "token": "verification-token-here"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Invalid verification token"
}
```

---

#### POST /api/auth/login

Authenticate user and receive tokens.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123!"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid-here",
      "email": "user@example.com",
      "username": "johndoe",
      "firstName": "John",
      "lastName": "Doe",
      "role": "student",
      "permissions": [
        "course:view",
        "course:enroll",
        "lesson:view",
        "assignment:submit",
        "quiz:take",
        "profile:view",
        "profile:edit"
      ]
    },
    "accessToken": "jwt-access-token",
    "refreshToken": "jwt-refresh-token"
  }
}
```

**Error Responses:**

*Invalid credentials (400):*
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

*Email not verified (400):*
```json
{
  "success": false,
  "message": "Please verify your email before logging in"
}
```

*Account inactive (400):*
```json
{
  "success": false,
  "message": "Account is inactive. Please contact support."
}
```

---

#### POST /api/auth/refresh-token

Obtain a new access token using a refresh token.

**Request Body:**
```json
{
  "refreshToken": "your-refresh-token"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "new-jwt-access-token",
    "refreshToken": "new-jwt-refresh-token"
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "message": "Invalid refresh token"
}
```

---

#### POST /api/auth/logout

**Protected Route** - Requires authentication

Logout user and blacklist current token.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

#### POST /api/auth/forgot-password

Request a password reset link.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "If the email exists, a password reset link has been sent"
}
```

**Note:** This endpoint always returns success to prevent email enumeration attacks.

---

#### POST /api/auth/reset-password

Reset password using the token from email.

**Request Body:**
```json
{
  "token": "reset-token-from-email",
  "password": "NewPassword123!",
  "confirmPassword": "NewPassword123!"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

**Error Responses:**

*Invalid/expired token (400):*
```json
{
  "success": false,
  "message": "Invalid or expired reset token"
}
```

*Token already used (400):*
```json
{
  "success": false,
  "message": "Reset token has already been used"
}
```

---

#### GET /api/auth/me

**Protected Route** - Requires authentication

Get current authenticated user's profile.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid-here",
      "email": "user@example.com",
      "username": "johndoe",
      "firstName": "John",
      "lastName": "Doe",
      "profilePictureUrl": null,
      "bio": null,
      "role": "student",
      "permissions": [
        "course:view",
        "course:enroll",
        "lesson:view",
        "assignment:submit",
        "quiz:take",
        "profile:view",
        "profile:edit"
      ],
      "isEmailVerified": true,
      "lastLogin": "2024-01-20T10:00:00.000Z",
      "createdAt": "2024-01-15T08:00:00.000Z"
    }
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

---

## Example Usage

### cURL Examples

**Register:**
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "username": "johndoe",
    "password": "Password123!",
    "confirmPassword": "Password123!",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "Password123!"
  }'
```

**Get Current User:**
```bash
curl -X GET http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### JavaScript/Axios Examples

**Register:**
```javascript
const response = await axios.post('http://localhost:3001/api/auth/register', {
  email: 'user@example.com',
  username: 'johndoe',
  password: 'Password123!',
  confirmPassword: 'Password123!',
  firstName: 'John',
  lastName: 'Doe'
});
```

**Login:**
```javascript
const response = await axios.post('http://localhost:3001/api/auth/login', {
  email: 'user@example.com',
  password: 'Password123!'
});

const { accessToken, refreshToken, user } = response.data.data;
```

**Authenticated Request:**
```javascript
const response = await axios.get('http://localhost:3001/api/auth/me', {
  headers: {
    Authorization: `Bearer ${accessToken}`
  }
});
```

**Refresh Token:**
```javascript
const response = await axios.post('http://localhost:3001/api/auth/refresh-token', {
  refreshToken: refreshToken
});

const { accessToken: newAccessToken } = response.data.data;
```

## Permissions System

### Available Permissions

**Course Permissions:**
- `course:view` - View courses
- `course:create` - Create courses
- `course:edit` - Edit courses
- `course:delete` - Delete courses
- `course:enroll` - Enroll in courses

**Lesson Permissions:**
- `lesson:view` - View lessons
- `lesson:create` - Create lessons
- `lesson:edit` - Edit lessons
- `lesson:delete` - Delete lessons

**Assignment Permissions:**
- `assignment:view` - View assignments
- `assignment:create` - Create assignments
- `assignment:edit` - Edit assignments
- `assignment:delete` - Delete assignments
- `assignment:submit` - Submit assignments
- `assignment:grade` - Grade assignments

**Quiz Permissions:**
- `quiz:view` - View quizzes
- `quiz:create` - Create quizzes
- `quiz:edit` - Edit quizzes
- `quiz:delete` - Delete quizzes
- `quiz:take` - Take quizzes

**User Permissions:**
- `user:view` - View users
- `user:create` - Create users
- `user:edit` - Edit users
- `user:delete` - Delete users

**System Permissions:**
- `profile:view` - View own profile
- `profile:edit` - Edit own profile
- `student:view` - View students
- `role:manage` - Manage roles
- `audit:view` - View audit logs
- `system:manage` - System management

### Role-Permission Mapping

**Student Role:**
- course:view, course:enroll
- lesson:view
- assignment:submit
- quiz:take
- profile:view, profile:edit

**Instructor Role:**
- All student permissions
- course:create, course:edit, course:delete
- lesson:create, lesson:edit, lesson:delete
- assignment:view, assignment:create, assignment:edit, assignment:grade
- quiz:create, quiz:edit
- student:view

**Admin Role:**
- All instructor permissions
- user:view, user:create, user:edit, user:delete
- assignment:delete, quiz:delete
- role:manage
- audit:view
- system:manage

## Audit Logging

All authentication actions are automatically logged to the `audit_logs` table:

- User registration
- User login
- Password reset
- User logout

Each log entry includes:
- User ID
- Action performed
- Resource type and ID
- IP address
- User agent
- Timestamp

Admins can view audit logs for security and compliance purposes.

## Best Practices

1. **Store tokens securely** - Use httpOnly cookies or secure storage
2. **Refresh tokens proactively** - Refresh before expiry
3. **Handle 401 errors** - Implement automatic token refresh
4. **Logout properly** - Always call logout endpoint
5. **Validate input** - Client-side validation for better UX
6. **Handle rate limits** - Implement exponential backoff
7. **Never expose tokens** - Don't log or expose tokens in URLs

## Coming Soon (Phase 2+)

- Course management endpoints
- Lesson CRUD operations
- Assignment and quiz management
- Enrollment system
- Progress tracking
- Certificate generation

---

For implementation details, see the source code in `/backend/src/routes/authRoutes.js`
