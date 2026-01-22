# Contributing to Advanced LMS

Thank you for your interest in contributing to the Advanced Learning Management System! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors. We expect all participants to:

- Use welcoming and inclusive language
- Be respectful of differing viewpoints
- Accept constructive criticism gracefully
- Focus on what is best for the community
- Show empathy towards other community members

### Unacceptable Behavior

- Harassment, discriminatory comments, or personal attacks
- Trolling or insulting comments
- Publishing others' private information without permission
- Any conduct that would be inappropriate in a professional setting

## Getting Started

### Prerequisites

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/your-username/advanced-lms.git
   cd advanced-lms
   ```
3. Set up the upstream remote:
   ```bash
   git remote add upstream https://github.com/original-repo/advanced-lms.git
   ```
4. Follow the [Setup Guide](docs/SETUP.md) to get the project running

### Finding Issues

- Look for issues labeled `good first issue` or `help wanted`
- Check the project board for current priorities
- Feel free to propose new features or improvements

## Development Workflow

### 1. Create a Branch

Always create a new branch for your work:

```bash
git checkout -b feature/your-feature-name
```

Branch naming conventions:
- `feature/` - New features (e.g., `feature/course-management`)
- `fix/` - Bug fixes (e.g., `fix/login-validation`)
- `docs/` - Documentation updates (e.g., `docs/api-examples`)
- `refactor/` - Code refactoring (e.g., `refactor/auth-service`)
- `test/` - Test additions (e.g., `test/auth-endpoints`)

### 2. Make Your Changes

- Write clean, maintainable code
- Follow the coding standards (see below)
- Add comments for complex logic
- Update documentation as needed
- Write tests for new features

### 3. Test Your Changes

Before submitting:

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# Run the application
docker-compose up -d
# Manually test your changes
```

### 4. Keep Your Branch Updated

Regularly sync with the main branch:

```bash
git fetch upstream
git rebase upstream/main
```

### 5. Submit Pull Request

See [Pull Request Process](#pull-request-process) below.

## Coding Standards

### General Principles

- **DRY (Don't Repeat Yourself)** - Reuse code through functions and components
- **KISS (Keep It Simple, Stupid)** - Simple solutions are better than complex ones
- **YAGNI (You Aren't Gonna Need It)** - Don't add functionality until needed
- **Separation of Concerns** - Keep different aspects of code separated
- **Single Responsibility** - Each function/class should do one thing well

### Backend (Node.js/Express)

#### File Organization

```
backend/src/
├── config/       # Configuration files
├── controllers/  # Request handlers (thin layer)
├── services/     # Business logic (thick layer)
├── models/       # Database models
├── routes/       # API route definitions
├── middleware/   # Express middleware
├── validators/   # Input validation schemas
└── utils/        # Helper functions
```

#### Naming Conventions

- **Files**: camelCase (e.g., `authController.js`, `emailService.js`)
- **Classes**: PascalCase (e.g., `AuthService`, `EmailService`)
- **Functions**: camelCase (e.g., `getUserById`, `sendEmail`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_LOGIN_ATTEMPTS`)
- **Private functions**: Prefix with underscore (e.g., `_hashPassword`)

#### Code Style

```javascript
// Good
const getUserById = async (userId) => {
  const user = await User.findByPk(userId);
  if (!user) {
    throw new Error('User not found');
  }
  return user;
};

// Bad
const getUser = async (id) => {
  return await User.findByPk(id);
};
```

#### Error Handling

```javascript
// Always use try-catch in async functions
const someController = async (req, res, next) => {
  try {
    // Your code here
  } catch (error) {
    next(error); // Pass to error handler
  }
};

// Throw descriptive errors
if (!user) {
  throw new Error('User not found');
}
```

#### Async/Await

- Always use `async/await` over callbacks
- Use `try-catch` for error handling
- Don't forget to `await` promises

### Frontend (Next.js/React/TypeScript)

#### File Organization

```
frontend/
├── app/          # Next.js App Router pages
├── components/   # Reusable React components
├── lib/          # Utilities, API client, hooks
└── public/       # Static assets
```

#### Naming Conventions

- **Components**: PascalCase (e.g., `Button.tsx`, `LoginForm.tsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useAuth`, `useApi`)
- **Utilities**: camelCase (e.g., `formatDate`, `validateEmail`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_BASE_URL`)

#### Component Structure

```typescript
// Good component structure
interface ButtonProps {
  variant?: 'primary' | 'secondary';
  onClick?: () => void;
  children: React.ReactNode;
}

export default function Button({ variant = 'primary', onClick, children }: ButtonProps) {
  return (
    <button
      className={`btn btn-${variant}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
```

#### TypeScript

- Always define interfaces for props
- Use type inference where possible
- Avoid `any` type
- Use strict mode

#### React Best Practices

- Use functional components
- Use hooks for state and side effects
- Keep components small and focused
- Avoid prop drilling (use context when needed)
- Memoize expensive computations

### CSS/Tailwind

- Use Tailwind utility classes
- Keep consistent spacing (use Tailwind's spacing scale)
- Mobile-first responsive design
- Use semantic class names for custom CSS

### Comments

```javascript
// Good: Explain WHY, not WHAT
// Hash password with bcrypt to protect against rainbow table attacks
const passwordHash = await hashPassword(password);

// Bad: Redundant comment
// Hash the password
const passwordHash = await hashPassword(password);
```

Comment when:
- Complex business logic
- Non-obvious algorithms
- Workarounds or hacks
- TODO items

Don't comment when:
- Code is self-explanatory
- Just repeating what code does

## Commit Guidelines

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

#### Type

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no code change)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

#### Examples

```
feat(auth): add password reset functionality

Implement complete password reset flow including:
- Email token generation
- Secure token validation
- Password update with audit logging

Closes #123
```

```
fix(login): handle rate limit error correctly

Previously, rate limit errors were showing generic message.
Now displays user-friendly message with retry time.

Fixes #456
```

```
docs(api): add examples for all auth endpoints

Added curl and JavaScript examples for each endpoint
to make API easier to understand and use.
```

### Commit Best Practices

- Make atomic commits (one logical change per commit)
- Write clear, descriptive messages
- Reference issue numbers when applicable
- Use present tense ("add feature" not "added feature")
- Keep subject line under 50 characters
- Wrap body at 72 characters

## Pull Request Process

### Before Submitting

- [ ] Code follows project style guidelines
- [ ] All tests pass
- [ ] New tests added for new features
- [ ] Documentation updated
- [ ] No console.log or debug code left
- [ ] Branch is up to date with main
- [ ] Commits are clean and well-organized

### Creating the PR

1. Push your branch to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

2. Create PR on GitHub with description including:
   - What changes were made
   - Why changes were needed
   - How to test the changes
   - Screenshots (if UI changes)
   - Related issues

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## How to Test
1. Step 1
2. Step 2
3. Expected result

## Checklist
- [ ] Code follows style guidelines
- [ ] Tests pass
- [ ] Documentation updated
- [ ] No breaking changes (or documented)

## Screenshots (if applicable)

## Related Issues
Closes #123
```

### Review Process

- Maintainers will review your PR
- Address review comments promptly
- Make changes in new commits (don't force push during review)
- Once approved, maintainer will merge

## Testing Guidelines

### Backend Tests

```javascript
// Use descriptive test names
describe('AuthService', () => {
  describe('login', () => {
    it('should return tokens for valid credentials', async () => {
      // Test implementation
    });

    it('should throw error for invalid password', async () => {
      // Test implementation
    });

    it('should throw error if email not verified', async () => {
      // Test implementation
    });
  });
});
```

### Frontend Tests

```typescript
// Test user interactions and component behavior
describe('LoginForm', () => {
  it('should display validation errors for invalid email', () => {
    // Test implementation
  });

  it('should call login function on form submit', () => {
    // Test implementation
  });

  it('should show loading state during submission', () => {
    // Test implementation
  });
});
```

### Test Coverage

- Aim for 80%+ code coverage
- Test happy paths and error cases
- Test edge cases and boundary conditions
- Mock external dependencies

## Documentation

### Code Documentation

- Add JSDoc comments for functions
- Document complex algorithms
- Include usage examples for utilities

### README Updates

- Keep README current with new features
- Update setup instructions if changed
- Add new environment variables

### API Documentation

- Document all new endpoints
- Include request/response examples
- List all possible error responses
- Update OpenAPI specification (`backend/openapi.yaml`)

### Architecture Documentation

- Update architecture docs for major changes
- Document design decisions
- Add diagrams for complex features

### Component Documentation

When adding new React components:
- Update `frontend/COMPONENT_LIBRARY.md`
- Include props documentation
- Add usage examples
- Document accessibility features

## Security Guidelines

### Code Security

**Never commit sensitive data:**
- No API keys, passwords, or tokens in code
- Use environment variables for secrets
- Add sensitive files to `.gitignore`
- Review commits before pushing

**Input Validation:**
- Validate all user input on backend
- Use Joi schemas for validation
- Sanitize input to prevent XSS
- Use parameterized queries (Sequelize handles this)

**Authentication & Authorization:**
- Always check authentication before accessing protected resources
- Use RBAC middleware for role-based access
- Never trust client-side validation alone
- Implement rate limiting on sensitive endpoints

**Error Messages:**
```javascript
// Bad: Exposes system details
throw new Error('Database connection failed: PostgreSQL timeout');

// Good: Generic user-facing message
throw new Error('Unable to process request. Please try again.');
// Log detailed error server-side for debugging
```

**SQL Injection Prevention:**
```javascript
// Bad: String concatenation
const query = `SELECT * FROM users WHERE email = '${email}'`;

// Good: Parameterized query (Sequelize)
const user = await User.findOne({ where: { email } });
```

**Dependency Security:**
```bash
# Check for vulnerabilities before committing
npm audit

# Fix vulnerabilities
npm audit fix

# Update dependencies regularly
npm update
```

## Performance Guidelines

### Backend Performance

**Avoid N+1 Queries:**
```javascript
// Bad: N+1 queries
const courses = await Course.findAll();
for (let course of courses) {
  course.instructor = await User.findByPk(course.instructorId);
}

// Good: Eager loading
const courses = await Course.findAll({
  include: [{ model: User, as: 'instructor' }]
});
```

**Use Pagination:**
```javascript
// Always paginate large result sets
const { page = 1, limit = 20 } = req.query;
const offset = (page - 1) * limit;

const courses = await Course.findAndCountAll({
  limit,
  offset
});
```

**Implement Caching:**
```javascript
// Cache frequently accessed data
const cacheKey = `courses:all`;
const cached = await redis.get(cacheKey);

if (cached) {
  return JSON.parse(cached);
}

const courses = await Course.findAll();
await redis.set(cacheKey, JSON.stringify(courses), 'EX', 300); // 5 min
return courses;
```

**Database Indexes:**
```sql
-- Add indexes for commonly queried fields
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_enrollments_user_id ON enrollments(user_id);
```

### Frontend Performance

**Code Splitting:**
```typescript
// Lazy load heavy components
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <LoadingSpinner />
});
```

**Image Optimization:**
```tsx
// Use Next.js Image component
import Image from 'next/image';

<Image 
  src="/course-thumbnail.jpg"
  alt="Course thumbnail"
  width={300}
  height={200}
  loading="lazy"
/>
```

**Memoization:**
```typescript
// Memoize expensive computations
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data);
}, [data]);

// Memoize callback functions
const handleClick = useCallback(() => {
  doSomething(id);
}, [id]);
```

**Debounce User Input:**
```typescript
// Debounce search input
const debouncedSearch = useMemo(
  () => debounce((query) => fetchResults(query), 300),
  []
);
```

## Debugging Guidelines

### Backend Debugging

**Logging:**
```javascript
// Use appropriate log levels
logger.info('User logged in', { userId: user.id });
logger.warn('Rate limit approaching', { ip: req.ip });
logger.error('Database error', { error: err.message });

// Avoid logging sensitive data
// Bad: logger.info('User data', { password: user.password });
// Good: logger.info('User data', { userId: user.id });
```

**Debug Mode:**
```bash
# Enable debug logging
DEBUG=* npm run dev

# Node.js inspector
node --inspect server.js
# Then open chrome://inspect in Chrome
```

### Frontend Debugging

**React DevTools:**
- Install React DevTools browser extension
- Inspect component tree
- View props and state
- Track component re-renders

**Console Debugging:**
```typescript
// Temporary debugging (remove before commit)
console.log('Component rendered', { props, state });
console.table(arrayData);

// Production debugging with environment check
if (process.env.NODE_ENV === 'development') {
  console.debug('Debug info', data);
}
```

## Git Workflow

### Branch Strategy

**Branch Types:**
- `main` - Production-ready code
- `develop` - Development branch (if using)
- `feature/*` - New features
- `fix/*` - Bug fixes
- `hotfix/*` - Urgent production fixes
- `docs/*` - Documentation updates

**Branch Naming:**
```bash
feature/user-authentication
fix/login-validation-error
hotfix/critical-security-patch
docs/api-documentation-update
```

### Commit Guidelines

**Commit Message Format:**
```
type(scope): subject

body (optional)

footer (optional)
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding/updating tests
- `chore`: Maintenance tasks

**Examples:**
```bash
feat(auth): add password reset functionality

Implement complete password reset flow including:
- Email token generation
- Secure token validation
- Password update with audit logging

Closes #123

---

fix(courses): resolve pagination issue

Fixed off-by-one error in pagination calculation
that was causing duplicate results on page boundaries.

Fixes #456

---

docs(api): add examples for all auth endpoints

Added curl and JavaScript examples for each endpoint
to make API easier to understand and use.
```

### Pull Request Process

**Before Creating PR:**
- [ ] Code follows style guidelines
- [ ] All tests pass (`npm test`)
- [ ] No console.log or debug code
- [ ] Documentation updated
- [ ] Branch is up to date with main
- [ ] Self-review completed

**PR Description Template:**
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix (non-breaking change)
- [ ] New feature (non-breaking change)
- [ ] Breaking change
- [ ] Documentation update

## How to Test
1. Step 1
2. Step 2
3. Expected result

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] Tests added/updated
- [ ] All tests pass
- [ ] No new warnings
- [ ] Responsive design verified
- [ ] Accessibility verified

## Screenshots (if applicable)

## Related Issues
Closes #123
```

**Code Review Checklist:**

For Reviewers:
- [ ] Code is clear and maintainable
- [ ] No security vulnerabilities
- [ ] Performance considerations addressed
- [ ] Error handling is appropriate
- [ ] Tests cover new functionality
- [ ] Documentation is accurate
- [ ] No breaking changes (or properly documented)
- [ ] Accessibility requirements met

## Questions?

- Open an issue for questions
- Check existing documentation in `docs/` directory
- Review [TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) for common issues
- See [DEVELOPMENT_SETUP.md](docs/DEVELOPMENT_SETUP.md) for setup help

## Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Credited in release notes
- Mentioned in project documentation

## Additional Resources

- **API Documentation**: [backend/API_DOCUMENTATION.md](backend/API_DOCUMENTATION.md)
- **Architecture**: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- **Database Schema**: [docs/DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md)
- **Component Library**: [frontend/COMPONENT_LIBRARY.md](frontend/COMPONENT_LIBRARY.md)
- **Deployment Guide**: [docs/DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md)
- **Troubleshooting**: [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)
- **Performance**: [backend/PERFORMANCE_GUIDE.md](backend/PERFORMANCE_GUIDE.md)
- **Security**: [backend/SECURITY_HARDENING_GUIDE.md](backend/SECURITY_HARDENING_GUIDE.md)
- **Accessibility**: [frontend/ACCESSIBILITY_GUIDE.md](frontend/ACCESSIBILITY_GUIDE.md)

Thank you for contributing to Advanced LMS! 🎓
