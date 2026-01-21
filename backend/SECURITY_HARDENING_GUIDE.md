# Security Hardening Guide - Advanced-LMS

This document outlines the security measures implemented in Phase 6.3 to harden the platform against common threats.

## Implemented Security Measures

### 1. CORS Configuration
- Restricted `origin` to whitelisted domains.
- Allowed `credentials: true` for secure session management.
- Restricted `methods` and `allowedHeaders` (Accept, Content-Type, Authorization, X-CSRF-Token).
- Implemented preflight caching (`maxAge: 3600`).

### 2. Enhanced Security Headers (Helmet)
- **CSP**: Strict Content Security Policy to prevent XSS.
- **HSTS**: Strict-Transport-Security enabled for 1 year.
- **XSS Protection**: `X-XSS-Protection: 1; mode=block`.
- **Frame Options**: `DENY` to prevent clickjacking.
- **Content Type Options**: `nosniff` enabled.

### 3. CSRF Protection
- **Double-Submit Cookie Pattern**: Custom implementation using `__csrf` HTTP-only cookie and `X-CSRF-Token` header.
- **Session-bound Tokens**: Tokens are hashed and stored in Redis for authenticated users.
- **Automatic Validation**: All state-changing requests (POST, PUT, DELETE, PATCH) are protected.

### 4. Input Validation & Sanitization
- **Unified Validation Wrapper**: `validateRequest` middleware handles body, query, and params.
- **Joi Schemas**: Enhanced with strict length limits and sanitization (`trim`, `lowercase`).
  - Email: max 255 chars
  - Password: 8-128 chars
  - Names: max 100 chars
  - Descriptions: max 5000 chars
  - URLs: max 2048 chars
- **XSS Prevention**: User input is treated as plain text; rich text should be rendered with care on the frontend.

### 5. Rate Limiting
- **General Limiter**: 100 requests per 15 minutes per IP.
- **Auth Limiters**: 
  - Login: 5 attempts per 15 minutes.
  - Register: 3 per hour.
  - Password Reset: 3 per hour.
  - Email Verification: 5 per hour.
- **API Limiter**: Per-user limits (1000 req/hour).
- **Endpoint Specific**: 
  - Quiz submissions: 10 per hour.
  - Assignment submissions: 5 per hour.
  - Forum posts: 20 per hour.
  - File uploads: 50 per day.

### 6. JWT Security
- **Strong Secrets**: Recommended minimum 32 characters for JWT secrets.
- **Refresh Token Rotation**: Old refresh tokens are invalidated upon use.
- **Breach Detection**: Detects and blocks reuse of refresh tokens.
- **Blacklisting**: Immediate token invalidation in Redis on logout.

### 7. Database Security
- **Parameterized Queries**: Sequelize used throughout to prevent SQL Injection.
- **SSL/TLS**: Connection pooling and SSL enabled for production database.
- **Environment Variables**: Credentials moved to environment variables.

### 8. Security Logging & Monitoring
- **Security Event Logger**: Logs failed logins, rate limit violations, and unauthorized access attempts.
- **Audit Logs**: Integrated with existing database-driven audit logging.

## OWASP Top 10 Mapping

- **A01:2021-Broken Access Control**: Implemented RBAC and session-bound CSRF tokens.
- **A02:2021-Cryptographic Failures**: Strong password hashing (bcrypt), HSTS, and secure JWTs.
- **A03:2021-Injection**: Parameterized queries and Joi input validation.
- **A04:2021-Insecure Design**: Rate limiting and comprehensive security logging.
- **A05:2021-Security Misconfiguration**: Enhanced Helmet.js and strict CORS.
- **A06:2021-Vulnerable and Outdated Components**: Dependency audit and updates.
- **A07:2021-Identification and Authentication Failures**: Token rotation and account locking (rate limiting).
- **A08:2021-Software and Data Integrity Failures**: Secure cookie attributes and input sanitization.
- **A09:2021-Security Logging and Monitoring Failures**: Security event logger for auditing.
- **A10:2021-Server-Side Request Forgery**: URL and URI validation in schemas.

## Security Checklist for Developers

- [ ] Always use `validateRequest` with a Joi schema for new endpoints.
- [ ] Ensure all string inputs have reasonable `max()` length limits.
- [ ] Never use string interpolation in raw SQL queries; use `replacements`.
- [ ] Use `logSecurityEvent` for sensitive operations or detected anomalies.
- [ ] Keep dependencies updated using `npm audit`.
- [ ] Verify that sensitive information is never included in logs.
- [ ] Use HTTPS only in production.
