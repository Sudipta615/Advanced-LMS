# Advanced LMS API Documentation

## Phase 1: Authentication API

### Base URL
`http://localhost:3001/api`

### Authentication Endpoints

#### POST /auth/register
Register a new user

**Request Body:**
```json
{
  "email": "user@example.com",
  "username": "username",
  "password": "Password123!",
  "confirmPassword": "Password123!",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration successful. Please check your email for verification."
}
```

#### POST /auth/verify-email
Verify user email

**Request Body:**
```json
{
  "token": "verification-token"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Email verified successfully."
}
```

#### POST /auth/login
User login

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123!"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "jwt-access-token",
    "refreshToken": "jwt-refresh-token",
    "user": {
      "id": "user-id",
      "email": "user@example.com",
      "username": "username",
      "firstName": "John",
      "lastName": "Doe",
      "role": "student"
    }
  }
}
```

#### POST /auth/refresh-token
Refresh access token

**Request Body:**
```json
{
  "refreshToken": "jwt-refresh-token"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "new-jwt-access-token",
    "refreshToken": "new-jwt-refresh-token"
  }
}
```

#### POST /auth/logout
Logout and blacklist token

**Headers:**
```
Authorization: Bearer jwt-access-token
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully."
}
```

#### POST /auth/forgot-password
Request password reset

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset email sent."
}
```

#### POST /auth/reset-password
Reset password

**Request Body:**
```json
{
  "token": "reset-token",
  "password": "NewPassword123!",
  "confirmPassword": "NewPassword123!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset successfully."
}
```

#### GET /auth/me
Get current user

**Headers:**
```
Authorization: Bearer jwt-access-token
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user-id",
    "email": "user@example.com",
    "username": "username",
    "firstName": "John",
    "lastName": "Doe",
    "role": "student",
    "isEmailVerified": true
  }
}
```

## Phase 2: Course Management API

### Course Endpoints

#### GET /courses
Get all courses with pagination and filtering

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `search`: Search term for course title
- `category`: Category slug
- `difficulty`: Difficulty level (beginner, intermediate, advanced)
- `tags`: Comma-separated list of tags
- `status`: Course status (admin only: draft, published, archived)

**Headers:**
```
Authorization: Bearer jwt-access-token (optional)
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "course-id",
      "title": "Course Title",
      "slug": "course-title",
      "description": "Course description",
      "thumbnail_url": "https://example.com/image.jpg",
      "instructor": {
        "first_name": "John",
        "last_name": "Doe"
      },
      "difficulty_level": "beginner",
      "price": 0.00,
      "estimated_hours": 10.5,
      "category": {
        "name": "Technology",
        "slug": "technology"
      },
      "isEnrolled": false,
      "completionPercentage": 0,
      "enrollmentStatus": null
    }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}
```

#### GET /courses/:id
Get course by ID

**Headers:**
```
Authorization: Bearer jwt-access-token (optional)
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "course-id",
    "title": "Course Title",
    "slug": "course-title",
    "description": "Course description",
    "content": "Detailed course content",
    "thumbnail_url": "https://example.com/image.jpg",
    "instructor": {
      "id": "instructor-id",
      "first_name": "John",
      "last_name": "Doe",
      "profile_picture_url": "https://example.com/avatar.jpg"
    },
    "category": {
      "name": "Technology",
      "slug": "technology"
    },
    "difficulty_level": "beginner",
    "estimated_hours": 10.5,
    "price": 0.00,
    "language": "en",
    "status": "published",
    "is_featured": false,
    "tags": ["javascript", "programming"],
    "prerequisites": [
      {
        "course_id": "prerequisite-course-id",
        "title": "Prerequisite Course",
        "slug": "prerequisite-course",
        "min_completion_percentage": 100
      }
    ],
    "sections": [
      {
        "id": "section-id",
        "title": "Section Title",
        "description": "Section description",
        "display_order": 1,
        "lessons": [
          {
            "id": "lesson-id",
            "title": "Lesson Title",
            "description": "Lesson description",
            "lesson_type": "text",
            "duration_minutes": 30,
            "is_published": true
          }
        ]
      }
    ],
    "isEnrolled": false,
    "enrollmentStatus": null,
    "completionPercentage": 0
  }
}
```

#### POST /courses
Create a new course (Instructor/Admin only)

**Headers:**
```
Authorization: Bearer jwt-access-token
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Course Title",
  "description": "Course description",
  "category_id": "category-id",
  "difficulty_level": "beginner",
  "estimated_hours": 10.5,
  "price": 0.00,
  "tags": ["javascript", "programming"],
  "prerequisites": ["prerequisite-course-id"],
  "status": "draft"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "course-id",
    "title": "Course Title",
    "slug": "course-title",
    "description": "Course description",
    "category_id": "category-id",
    "instructor_id": "instructor-id",
    "status": "draft",
    "created_at": "2024-01-21T00:00:00.000Z",
    "updated_at": "2024-01-21T00:00:00.000Z"
  }
}
```

#### PUT /courses/:id
Update a course (Instructor/Admin or course creator only)

**Headers:**
```
Authorization: Bearer jwt-access-token
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Updated Course Title",
  "description": "Updated course description",
  "category_id": "category-id",
  "difficulty_level": "intermediate",
  "estimated_hours": 15.0,
  "price": 29.99,
  "tags": ["javascript", "advanced"],
  "prerequisites": ["prerequisite-course-id"],
  "status": "published"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "course-id",
    "title": "Updated Course Title",
    "slug": "updated-course-title",
    "description": "Updated course description",
    "category_id": "category-id",
    "instructor_id": "instructor-id",
    "status": "published",
    "created_at": "2024-01-21T00:00:00.000Z",
    "updated_at": "2024-01-21T00:00:00.000Z"
  }
}
```

#### DELETE /courses/:id
Delete a course (Admin or course creator only)

**Headers:**
```
Authorization: Bearer jwt-access-token
```

**Response:**
```json
{
  "success": true,
  "message": "Course deleted successfully"
}
```

### Section Endpoints

#### GET /courses/:id/sections
Get all sections for a course

**Headers:**
```
Authorization: Bearer jwt-access-token (optional)
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "section-id",
      "course_id": "course-id",
      "title": "Section Title",
      "description": "Section description",
      "display_order": 1,
      "lessons": [
        {
          "id": "lesson-id",
          "title": "Lesson Title",
          "description": "Lesson description",
          "lesson_type": "text",
          "duration_minutes": 30,
          "is_published": true,
          "isCompleted": false,
          "completed_at": null
        }
      ]
    }
  ]
}
```

#### POST /courses/:id/sections
Create a new section (Instructor/Admin or course creator only)

**Headers:**
```
Authorization: Bearer jwt-access-token
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Section Title",
  "description": "Section description",
  "display_order": 1
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "section-id",
    "course_id": "course-id",
    "title": "Section Title",
    "description": "Section description",
    "display_order": 1,
    "created_at": "2024-01-21T00:00:00.000Z",
    "updated_at": "2024-01-21T00:00:00.000Z"
  }
}
```

#### PUT /courses/:id/sections/:sectionId
Update a section (Instructor/Admin or course creator only)

**Headers:**
```
Authorization: Bearer jwt-access-token
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Updated Section Title",
  "description": "Updated section description",
  "display_order": 2
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "section-id",
    "course_id": "course-id",
    "title": "Updated Section Title",
    "description": "Updated section description",
    "display_order": 2,
    "created_at": "2024-01-21T00:00:00.000Z",
    "updated_at": "2024-01-21T00:00:00.000Z"
  }
}
```

#### DELETE /courses/:id/sections/:sectionId
Delete a section (Instructor/Admin or course creator only)

**Headers:**
```
Authorization: Bearer jwt-access-token
```

**Response:**
```json
{
  "success": true,
  "message": "Section deleted successfully"
}
```

### Lesson Endpoints

#### GET /lessons/:id
Get lesson by ID

**Headers:**
```
Authorization: Bearer jwt-access-token (optional)
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "lesson-id",
    "title": "Lesson Title",
    "description": "Lesson description",
    "content": "Lesson content",
    "lesson_type": "text",
    "video_url": null,
    "video_provider": null,
    "self_hosted_video_path": null,
    "document_paths": [],
    "external_links": [],
    "markdown_content": "# Lesson Content\n\nThis is the lesson content in markdown format.",
    "duration_minutes": 30,
    "is_published": true,
    "requires_completion": true,
    "isCompleted": false,
    "completed_at": null
  }
}
```

#### POST /courses/:id/sections/:sectionId/lessons
Create a new lesson (Instructor/Admin or course creator only)

**Headers:**
```
Authorization: Bearer jwt-access-token
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Lesson Title",
  "description": "Lesson description",
  "content": "Lesson content",
  "lesson_type": "text",
  "markdown_content": "# Lesson Content\n\nThis is the lesson content in markdown format.",
  "duration_minutes": 30,
  "is_published": true,
  "requires_completion": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "lesson-id",
    "section_id": "section-id",
    "title": "Lesson Title",
    "description": "Lesson description",
    "content": "Lesson content",
    "lesson_type": "text",
    "markdown_content": "# Lesson Content\n\nThis is the lesson content in markdown format.",
    "duration_minutes": 30,
    "is_published": true,
    "requires_completion": true,
    "created_at": "2024-01-21T00:00:00.000Z",
    "updated_at": "2024-01-21T00:00:00.000Z"
  }
}
```

#### PUT /lessons/:id
Update a lesson (Instructor/Admin or course creator only)

**Headers:**
```
Authorization: Bearer jwt-access-token
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Updated Lesson Title",
  "description": "Updated lesson description",
  "content": "Updated lesson content",
  "lesson_type": "text",
  "markdown_content": "# Updated Lesson Content\n\nThis is the updated lesson content in markdown format.",
  "duration_minutes": 45,
  "is_published": true,
  "requires_completion": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "lesson-id",
    "section_id": "section-id",
    "title": "Updated Lesson Title",
    "description": "Updated lesson description",
    "content": "Updated lesson content",
    "lesson_type": "text",
    "markdown_content": "# Updated Lesson Content\n\nThis is the updated lesson content in markdown format.",
    "duration_minutes": 45,
    "is_published": true,
    "requires_completion": true,
    "created_at": "2024-01-21T00:00:00.000Z",
    "updated_at": "2024-01-21T00:00:00.000Z"
  }
}
```

#### DELETE /lessons/:id
Delete a lesson (Instructor/Admin or course creator only)

**Headers:**
```
Authorization: Bearer jwt-access-token
```

**Response:**
```json
{
  "success": true,
  "message": "Lesson deleted successfully"
}
```

### Enrollment Endpoints

#### POST /enrollments
Enroll in a course (Authenticated student only)

**Headers:**
```
Authorization: Bearer jwt-access-token
Content-Type: application/json
```

**Request Body:**
```json
{
  "course_id": "course-id"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "enrollment-id",
    "user_id": "user-id",
    "course_id": "course-id",
    "enrolled_at": "2024-01-21T00:00:00.000Z",
    "completion_percentage": 0,
    "status": "active",
    "created_at": "2024-01-21T00:00:00.000Z",
    "updated_at": "2024-01-21T00:00:00.000Z"
  }
}
```

#### GET /enrollments
Get user's enrollments (Authenticated user only)

**Headers:**
```
Authorization: Bearer jwt-access-token
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `status`: Filter by status (active, completed, dropped)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "enrollment-id",
      "user_id": "user-id",
      "course_id": "course-id",
      "enrolled_at": "2024-01-21T00:00:00.000Z",
      "completion_percentage": 50,
      "status": "active",
      "last_accessed_at": "2024-01-21T00:00:00.000Z",
      "course": {
        "id": "course-id",
        "title": "Course Title",
        "slug": "course-title",
        "description": "Course description",
        "thumbnail_url": "https://example.com/image.jpg",
        "difficulty_level": "beginner",
        "estimated_hours": 10.5,
        "instructor": {
          "first_name": "John",
          "last_name": "Doe"
        },
        "category": {
          "name": "Technology"
        }
      }
    }
  ],
  "pagination": {
    "total": 10,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

#### GET /enrollments/:id
Get enrollment by ID (Authenticated user only)

**Headers:**
```
Authorization: Bearer jwt-access-token
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "enrollment-id",
    "user_id": "user-id",
    "course_id": "course-id",
    "enrolled_at": "2024-01-21T00:00:00.000Z",
    "completion_percentage": 50,
    "status": "active",
    "last_accessed_at": "2024-01-21T00:00:00.000Z",
    "course": {
      "id": "course-id",
      "title": "Course Title",
      "slug": "course-title",
      "description": "Course description",
      "thumbnail_url": "https://example.com/image.jpg",
      "difficulty_level": "beginner",
      "estimated_hours": 10.5,
      "instructor": {
        "first_name": "John",
        "last_name": "Doe"
      },
      "category": {
        "name": "Technology"
      },
      "sections": [
        {
          "id": "section-id",
          "title": "Section Title",
          "description": "Section description",
          "display_order": 1,
          "lessons": [
            {
              "id": "lesson-id",
              "title": "Lesson Title",
              "description": "Lesson description",
              "lesson_type": "text",
              "duration_minutes": 30,
              "is_published": true,
              "isCompleted": true,
              "completed_at": "2024-01-21T00:00:00.000Z",
              "time_spent_minutes": 30,
              "notes": "Lesson notes"
            }
          ]
        }
      ]
    }
  }
}
```

#### PUT /enrollments/:id
Update enrollment (Authenticated user only)

**Headers:**
```
Authorization: Bearer jwt-access-token
Content-Type: application/json
```

**Request Body:**
```json
{
  "last_accessed_at": "2024-01-21T00:00:00.000Z"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "enrollment-id",
    "user_id": "user-id",
    "course_id": "course-id",
    "enrolled_at": "2024-01-21T00:00:00.000Z",
    "completion_percentage": 50,
    "status": "active",
    "last_accessed_at": "2024-01-21T00:00:00.000Z",
    "created_at": "2024-01-21T00:00:00.000Z",
    "updated_at": "2024-01-21T00:00:00.000Z"
  }
}
```

#### DELETE /enrollments/:id
Unenroll from a course (Authenticated user only)

**Headers:**
```
Authorization: Bearer jwt-access-token
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully unenrolled from the course"
}
```

### Progress & Completion Endpoints

#### POST /lessons/:id/complete
Mark lesson as complete (Authenticated student only)

**Headers:**
```
Authorization: Bearer jwt-access-token
Content-Type: application/json
```

**Request Body:**
```json
{
  "time_spent_minutes": 30,
  "notes": "Lesson notes"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "lessonCompletion": {
      "id": "lesson-completion-id",
      "user_id": "user-id",
      "lesson_id": "lesson-id",
      "enrollment_id": "enrollment-id",
      "completed_at": "2024-01-21T00:00:00.000Z",
      "time_spent_minutes": 30,
      "notes": "Lesson notes"
    },
    "enrollment": {
      "completion_percentage": 50,
      "status": "active"
    }
  }
}
```

#### GET /courses/:id/progress
Get course progress (Authenticated student or instructor only)

**Headers:**
```
Authorization: Bearer jwt-access-token
```

**Response:**
```json
{
  "success": true,
  "data": {
    "course_id": "course-id",
    "course_title": "Course Title",
    "completion_percentage": 50,
    "completed_lessons": 5,
    "total_lessons": 10,
    "estimated_time_remaining_minutes": 150,
    "sections": [
      {
        "section_id": "section-id",
        "title": "Section Title",
        "completion_percentage": 50,
        "completed_lessons": 2,
        "total_lessons": 4
      }
    ],
    "enrollment_status": "active",
    "enrolled_at": "2024-01-21T00:00:00.000Z"
  }
}
```

#### GET /enrollments/:id/progress
Get enrollment progress details (Authenticated student only)

**Headers:**
```
Authorization: Bearer jwt-access-token
```

**Response:**
```json
{
  "success": true,
  "data": {
    "enrollment_id": "enrollment-id",
    "course_id": "course-id",
    "course_title": "Course Title",
    "completion_percentage": 50,
    "status": "active",
    "enrolled_at": "2024-01-21T00:00:00.000Z",
    "last_accessed_at": "2024-01-21T00:00:00.000Z",
    "lessons": [
      {
        "lesson_id": "lesson-id",
        "lesson_title": "Lesson Title",
        "section_id": "section-id",
        "section_title": "Section Title",
        "is_completed": true,
        "completed_at": "2024-01-21T00:00:00.000Z",
        "time_spent_minutes": 30,
        "notes": "Lesson notes",
        "lesson_type": "text",
        "display_order": 1
      }
    ]
  }
}
```

#### GET /courses/:id/analytics
Get course analytics (Instructor/Admin or course creator only)

**Headers:**
```
Authorization: Bearer jwt-access-token
```

**Response:**
```json
{
  "success": true,
  "data": {
    "course_id": "course-id",
    "course_title": "Course Title",
    "total_enrollments": 100,
    "completed_enrollments": 45,
    "active_enrollments": 50,
    "dropped_enrollments": 5,
    "completion_rate": 45,
    "average_completion_percentage": 65,
    "recent_enrollments": 15,
    "enrollment_trend": {
      "last_30_days": 15
    }
  }
}
```

## Error Handling

The API uses standard HTTP status codes and returns error responses in the following format:

```json
{
  "success": false,
  "message": "Error message"
}
```

Common error status codes:
- `400 Bad Request`: Invalid input data
- `401 Unauthorized`: Authentication required or failed
- `403 Forbidden`: Access denied due to insufficient permissions
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource already exists or conflict
- `413 Payload Too Large`: File size exceeds limit
- `500 Internal Server Error`: Server error

## Rate Limiting

The API implements rate limiting on certain endpoints:
- Authentication endpoints: 5 requests per minute per IP
- Course enrollment: 10 requests per minute per user
- General API: 100 requests per minute per IP

When rate limited, the API returns:
```json
{
  "success": false,
  "message": "Too many requests, please try again later."
}
```

## Authentication

Most endpoints require JWT authentication. Include the access token in the Authorization header:
```
Authorization: Bearer your-jwt-access-token
```

Use the refresh token endpoint to get new access tokens when they expire.

## Pagination

List endpoints support pagination with `page` and `limit` query parameters. The response includes pagination metadata in the `pagination` object.

## File Uploads

File upload endpoints support:
- Documents: PDF, DOC, DOCX, PPT, PPTX, ZIP (max 100MB)
- Videos: MP4, WebM, OGG (max 500MB)
- Thumbnails: JPG, PNG, WebP (max 10MB)

Use multipart/form-data for file uploads.