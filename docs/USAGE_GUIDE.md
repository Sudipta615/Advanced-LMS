# Advanced LMS Usage Guide

## Table of Contents

1. [Getting Started](#getting-started)
2. [Student Features](#student-features)
   - [Browsing Courses](#browsing-courses)
   - [Enrolling in Courses](#enrolling-in-courses)
   - [Learning Interface](#learning-interface)
   - [Tracking Progress](#tracking-progress)
3. [Instructor Features](#instructor-features)
   - [Creating Courses](#creating-courses)
   - [Managing Course Content](#managing-course-content)
   - [Course Analytics](#course-analytics)
4. [Administrator Features](#administrator-features)
5. [API Usage](#api-usage)
6. [Troubleshooting](#troubleshooting)

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Docker (for containerized deployment)
- Redis (for caching and rate limiting)

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/your-repo/advanced-lms.git
cd advanced-lms
```

2. **Set up environment variables:**
Copy `.env.example` to `.env` and configure your database and other settings.

3. **Install dependencies:**
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

4. **Run database migrations:**
```bash
docker-compose exec backend npm run migrate
```

5. **Seed initial data:**
```bash
docker-compose exec backend npm run seed
```

6. **Start the application:**
```bash
docker-compose up -d
```

The application will be available at:
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:3001`

## Student Features

### Browsing Courses

1. **Access the course catalog:**
   - Navigate to `/courses` in the frontend
   - Or use the API endpoint: `GET /api/courses`

2. **Filter and search courses:**
   - Use the sidebar filters for categories, difficulty levels, and tags
   - Use the search bar to find courses by title or keywords
   - Sort by newest, popular, or price

3. **View course details:**
   - Click on any course card to see detailed information
   - View course description, instructor, prerequisites, and content preview
   - See enrollment status and progress if already enrolled

### Enrolling in Courses

1. **Enroll in a course:**
   - Click the "Enroll Now" button on the course detail page
   - If the course has prerequisites, you'll need to complete them first
   - Free courses enroll immediately, paid courses will redirect to payment

2. **Check enrollment status:**
   - View your enrolled courses at `/student/courses`
   - See active, completed, and dropped courses
   - Track your progress through each course

### Learning Interface

1. **Access the course player:**
   - Click "Continue Learning" on an enrolled course
   - Or navigate to `/learning/:courseId`

2. **Navigate through lessons:**
   - Use the sidebar to see all sections and lessons
   - Lessons are marked as completed when finished
   - Progress is automatically saved

3. **Complete lessons:**
   - Watch videos, read content, or complete assignments
   - Click "Mark as Complete" when finished
   - Add notes to lessons for future reference

4. **Track time spent:**
   - The system automatically tracks time spent on lessons
   - View estimated time remaining for course completion

### Tracking Progress

1. **View overall progress:**
   - See completion percentage on course cards
   - View detailed progress breakdown by section

2. **Check lesson completion:**
   - Completed lessons are marked with checkmarks
   - See time spent and notes for each lesson

3. **Monitor course analytics:**
   - View estimated time to completion
   - Track your learning pace and progress

## Instructor Features

### Creating Courses

1. **Start course creation:**
   - Navigate to `/instructor/courses`
   - Click "Create New Course"

2. **Fill in course details:**
   - Title, description, and category
   - Difficulty level, estimated hours, and price
   - Tags, prerequisites, and visibility settings

3. **Save and publish:**
   - Save as draft to work on later
   - Publish when ready for students

### Managing Course Content

1. **Access course editor:**
   - Go to `/instructor/courses/:id/content`
   - Or click "Edit Course Content" from your courses list

2. **Create sections:**
   - Add sections to organize your course content
   - Set display order for sections
   - Add descriptions for each section

3. **Add lessons:**
   - Create different types of lessons (video, text, document, quiz, assignment)
   - Upload videos or documents
   - Add YouTube/Vimeo embeds
   - Write markdown content for text lessons
   - Set lesson duration and completion requirements

4. **Organize content:**
   - Drag and drop to reorder sections and lessons
   - Publish/unpublish individual lessons
   - Set prerequisites between lessons

### Course Analytics

1. **View course analytics:**
   - Navigate to `/instructor/courses/:id/analytics`
   - Or click "View Analytics" from your courses list

2. **Monitor enrollment:**
   - See total enrollments and completion rates
   - Track active, completed, and dropped students

3. **Analyze progress:**
   - View average completion percentage
   - See recent enrollment trends
   - Monitor student engagement

4. **Export data:**
   - Export analytics data for reporting
   - Generate completion certificates

## Administrator Features

### User Management
- View and manage all users
- Assign roles and permissions
- Monitor user activity

### Course Management
- View and edit all courses
- Manage categories and tags
- Feature or archive courses

### System Analytics
- Monitor platform-wide metrics
- Track enrollment trends
- View revenue reports

### Content Moderation
- Review reported content
- Manage course quality
- Handle disputes and issues

## API Usage

### Authentication

All API requests require authentication using JWT tokens:

```javascript
// Get access token from login
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});

const { accessToken } = response.data;

// Use token in subsequent requests
const coursesResponse = await fetch('/api/courses', {
  headers: { 
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  }
});
```

### Course Management

**Create a course:**
```javascript
const courseData = {
  title: 'Introduction to JavaScript',
  description: 'Learn JavaScript fundamentals',
  category_id: 'category-uuid',
  difficulty_level: 'beginner',
  estimated_hours: 10,
  price: 0,
  tags: ['javascript', 'programming']
};

const response = await fetch('/api/courses', {
  method: 'POST',
  headers: { 
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(courseData)
});
```

**Get course details:**
```javascript
const response = await fetch('/api/courses/course-uuid', {
  headers: { 
    'Authorization': `Bearer ${accessToken}`
  }
});
```

### Enrollment Management

**Enroll in a course:**
```javascript
const response = await fetch('/api/enrollments', {
  method: 'POST',
  headers: { 
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ course_id: 'course-uuid' })
});
```

**Get user enrollments:**
```javascript
const response = await fetch('/api/enrollments', {
  headers: { 
    'Authorization': `Bearer ${accessToken}`
  }
});
```

### Progress Tracking

**Mark lesson as complete:**
```javascript
const response = await fetch('/api/lessons/lesson-uuid/complete', {
  method: 'POST',
  headers: { 
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ 
    time_spent_minutes: 30,
    notes: 'Completed the lesson and understood the concepts'
  })
});
```

**Get course progress:**
```javascript
const response = await fetch('/api/courses/course-uuid/progress', {
  headers: { 
    'Authorization': `Bearer ${accessToken}`
  }
});
```

## Troubleshooting

### Common Issues

**Authentication Problems:**
- Ensure tokens are valid and not expired
- Check token storage in localStorage
- Verify JWT secret matches between frontend and backend

**Course Access Issues:**
- Check if course is published
- Verify user enrollment status
- Confirm user has required permissions

**Progress Tracking Issues:**
- Ensure lessons are properly marked as complete
- Check enrollment status is active
- Verify lesson completion requirements

### Debugging Tips

1. **Check API responses:**
   - Use browser developer tools to inspect network requests
   - Look for error messages in response bodies

2. **Review logs:**
   - Check backend logs for errors
   - Look for validation failures or database issues

3. **Test with Postman:**
   - Use Postman or similar tools to test API endpoints directly
   - Verify request/response formats

4. **Database verification:**
   - Check database records for consistency
   - Verify foreign key relationships

### Support

For additional help:
- Check the [API Documentation](API_DOCUMENTATION.md)
- Review the [Database Schema](DATABASE_SCHEMA.md)
- Consult the development team

## Best Practices

### Course Creation
- Use clear, descriptive titles and descriptions
- Organize content into logical sections
- Set appropriate difficulty levels
- Add relevant tags for discoverability
- Include prerequisites when necessary

### Student Engagement
- Encourage regular progress tracking
- Provide clear learning objectives
- Use a mix of content types (video, text, quizzes)
- Offer certificates for course completion

### Performance Optimization
- Use pagination for large datasets
- Implement caching for frequently accessed data
- Optimize images and videos for web delivery
- Use lazy loading for course content

### Security
- Always use HTTPS
- Validate all user input
- Implement proper authentication and authorization
- Regularly update dependencies
- Monitor for suspicious activity

This usage guide provides comprehensive instructions for using the Advanced LMS platform, covering student learning, instructor course management, and administrator functions. The guide includes API usage examples and troubleshooting tips to help users get the most out of the system.