# Quick Start Guide

Get Advanced-LMS up and running in 5 minutes!

## Prerequisites

- [Docker](https://www.docker.com/get-started) and Docker Compose installed
- Git installed
- 4GB RAM minimum
- 10GB disk space

## Quick Setup with Docker

### 1. Clone the Repository

```bash
git clone <repository-url>
cd advanced-lms
```

### 2. Configure Environment Variables

```bash
# Backend
cp backend/.env.example backend/.env

# Frontend
cp frontend/.env.example frontend/.env.local
```

**Optional**: Edit `backend/.env` if you need custom configuration (default values work for local development).

### 3. Start All Services

```bash
docker-compose up -d
```

This command will:
- Build and start PostgreSQL database
- Build and start Redis cache
- Build and start the backend API
- Build and start the frontend application

### 4. Run Database Migrations

```bash
docker-compose exec backend npm run migrate
```

### 5. Seed Initial Data (Optional)

```bash
docker-compose exec backend npm run seed
```

This creates sample data including:
- Default admin, instructor, and student users
- Sample courses and lessons
- Gamification badges and achievements

### 6. Access the Application

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:3000 | Main application interface |
| **Backend API** | http://localhost:3001 | REST API endpoints |
| **Health Check** | http://localhost:3001/health | API health status |

### 7. Default Login Credentials

After seeding, use these credentials to log in:

**Admin Account:**
- Email: `admin@advancedlms.com`
- Password: `Admin123!@#`

**Instructor Account:**
- Email: `instructor@advancedlms.com`
- Password: `Instructor123!@#`

**Student Account:**
- Email: `student@advancedlms.com`
- Password: `Student123!@#`

⚠️ **Important**: Change these passwords immediately in production!

## Verify Installation

### Check Backend Health

```bash
curl http://localhost:3001/health
```

Expected response:
```json
{
  "success": true,
  "message": "Server is healthy",
  "timestamp": "2024-01-21T..."
}
```

### Check Frontend

Open http://localhost:3000 in your browser. You should see the login page.

### Check Database Connection

```bash
docker-compose exec backend npm run migrate
```

If migrations run successfully, database connection is working.

## Common Commands

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Stop Services

```bash
docker-compose down
```

### Restart Services

```bash
docker-compose restart
```

### Reset Database

```bash
docker-compose down -v  # Remove volumes
docker-compose up -d
docker-compose exec backend npm run migrate
docker-compose exec backend npm run seed
```

## Troubleshooting

### Port Already in Use

If ports 3000, 3001, 5432, or 6379 are already in use:

1. Stop the conflicting service, or
2. Edit `docker-compose.yml` to use different ports

### Database Connection Failed

```bash
# Check if PostgreSQL is running
docker-compose ps

# Restart database
docker-compose restart postgres

# Check logs
docker-compose logs postgres
```

### Frontend Can't Connect to API

1. Check `frontend/.env.local`:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:3001
   ```

2. Ensure backend is running:
   ```bash
   curl http://localhost:3001/health
   ```

## Next Steps

- 📖 **Full Setup Guide**: See [DEVELOPMENT_SETUP.md](./DEVELOPMENT_SETUP.md) for detailed local development
- 🏗️ **Architecture**: Read [ARCHITECTURE.md](./ARCHITECTURE.md) to understand the system
- 📚 **API Documentation**: Check [../backend/API_DOCUMENTATION.md](../backend/API_DOCUMENTATION.md) for API details
- 🎨 **Components**: See [../frontend/COMPONENT_LIBRARY.md](../frontend/COMPONENT_LIBRARY.md) for UI components
- 🚀 **Deployment**: Read [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for production deployment
- 🤝 **Contributing**: See [../CONTRIBUTING.md](../CONTRIBUTING.md) for contribution guidelines

## Get Help

- **Issues**: Common problems are documented in [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- **Questions**: Open a GitHub issue
- **Documentation**: Check the `docs/` directory

## What's Included?

✅ Complete authentication system with JWT  
✅ Course management with sections and lessons  
✅ Quiz and assignment functionality  
✅ Gamification (points, badges, leaderboards)  
✅ Real-time notifications  
✅ Admin dashboard  
✅ Analytics and reporting  
✅ Certificate generation  
✅ Discussion forums  
✅ WCAG 2.1 AA accessible frontend  

Happy learning! 🎓
