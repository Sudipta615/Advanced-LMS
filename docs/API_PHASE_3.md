# Phase 3 API Documentation

## Table of Contents
- [Quiz Endpoints](#quiz-endpoints)
- [Assignment Endpoints](#assignment-endpoints)
- [Certificate Endpoints](#certificate-endpoints)
- [Analytics Endpoints](#analytics-endpoints)
- [Communication Endpoints](#communication-endpoints)

---

## Quiz Endpoints

### Create Quiz
**POST** `/api/courses/:courseId/lessons/:lessonId/quizzes`

**Auth Required**: Yes (Instructor/Admin)

**Request Body**:
```json
{
  "title": "JavaScript Fundamentals Quiz",
  "description": "Test your knowledge of JavaScript basics",
  "quiz_type": "graded",
  "total_points": 100,
  "passing_score": 70,
  "time_limit_minutes": 30,
  "allow_retake": true,
  "max_attempts": 3,
  "randomize_questions": false,
  "show_correct_answers": true,
  "shuffle_options": true,
  "display_order": 1
}
```

**Response**: `201 Created`
```json
{
  "success": true,
  "message": "Quiz created successfully",
  "data": {
    "id": "uuid",
    "lesson_id": "uuid",
    "title": "JavaScript Fundamentals Quiz",
    ...
  }
}
```

---

### Get Quiz Details (Instructor)
**GET** `/api/quizzes/:quizId`

**Auth Required**: Yes (Instructor/Admin)

**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "JavaScript Fundamentals Quiz",
    "questions": [
      {
        "id": "uuid",
        "question_text": "What is a closure?",
        "question_type": "multiple_choice",
        "points": 10,
        "answerOptions": [
          {
            "id": "uuid",
            "option_text": "A function with access to parent scope",
            "is_correct": true
          }
        ]
      }
    ]
  }
}
```

---

### Update Quiz
**PUT** `/api/quizzes/:quizId`

**Auth Required**: Yes (Instructor/Admin)

**Request Body**: Same as Create Quiz (all fields optional)

---

### Delete Quiz
**DELETE** `/api/quizzes/:quizId`

**Auth Required**: Yes (Instructor/Admin)

**Note**: Cannot delete quiz with existing attempts

---

### Publish Quiz
**POST** `/api/quizzes/:quizId/publish`

**Auth Required**: Yes (Instructor/Admin)

**Response**: `200 OK`

---

### Add Question to Quiz
**POST** `/api/quizzes/:quizId/questions`

**Auth Required**: Yes (Instructor/Admin)

**Request Body**:
```json
{
  "question_text": "What is the output of console.log(typeof null)?",
  "question_type": "multiple_choice",
  "points": 5,
  "explanation": "In JavaScript, typeof null returns 'object' due to a historical bug.",
  "display_order": 1
}
```

---

### Update Question
**PUT** `/api/quizzes/:quizId/questions/:questionId`

**Auth Required**: Yes (Instructor/Admin)

---

### Delete Question
**DELETE** `/api/quizzes/:quizId/questions/:questionId`

**Auth Required**: Yes (Instructor/Admin)

---

### Add Answer Option
**POST** `/api/quizzes/:quizId/questions/:questionId/options`

**Auth Required**: Yes (Instructor/Admin)

**Request Body**:
```json
{
  "option_text": "object",
  "is_correct": true,
  "display_order": 1
}
```

---

### Start Quiz Attempt (Student)
**GET** `/api/quizzes/:quizId/take`

**Auth Required**: Yes (Student/Instructor/Admin)

**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "attempt_id": "uuid",
    "quiz": {
      "id": "uuid",
      "title": "JavaScript Quiz",
      "time_limit_minutes": 30,
      "questions": [...]
    },
    "attempt_number": 1,
    "max_attempts": 3
  }
}
```

**Note**: 
- Creates a new quiz attempt
- Returns questions without correct answers (unless show_correct_answers is true)
- Randomizes questions/options based on settings

---

### Submit Quiz
**POST** `/api/quiz-attempts/:attemptId/submit`

**Auth Required**: Yes (Student/Instructor/Admin)

**Request Body**:
```json
{
  "time_spent_seconds": 1800,
  "answers": {
    "question-uuid-1": "option-uuid-1",
    "question-uuid-2": "Short answer text",
    "question-uuid-3": "option-uuid-3"
  }
}
```

**Response**: `200 OK`
```json
{
  "success": true,
  "message": "Quiz submitted and graded successfully",
  "data": {
    "attempt_id": "uuid",
    "score": 85.5,
    "passed": true,
    "needs_manual_grading": false
  }
}
```

**Note**: 
- Auto-grades MCQ and true/false questions
- Sets needs_manual_grading=true for essay/short answer questions

---

### Get Attempt Details
**GET** `/api/quiz-attempts/:attemptId`

**Auth Required**: Yes (Owner only)

**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "attempt": {
      "id": "uuid",
      "score": 85.5,
      "passed": true,
      "status": "graded",
      "started_at": "2024-01-21T10:00:00Z",
      "submitted_at": "2024-01-21T10:30:00Z"
    },
    "responses": [
      {
        "question": {...},
        "user_answer": "option-uuid",
        "is_correct": true,
        "points_earned": 10
      }
    ]
  }
}
```

---

### Get My Quiz Attempts
**GET** `/api/quiz-attempts`

**Auth Required**: Yes

**Query Parameters**:
- `page` (default: 1)
- `limit` (default: 10)

---

### Get Quiz Attempts (Instructor)
**GET** `/api/quizzes/:quizId/attempts`

**Auth Required**: Yes (Instructor/Admin)

**Query Parameters**:
- `page` (default: 1)
- `limit` (default: 20)

**Response**: List of all student attempts with scores

---

### Grade Quiz Response
**PUT** `/api/quizzes/responses/:responseId/grade`

**Auth Required**: Yes (Instructor/Admin)

**Request Body**:
```json
{
  "is_correct": true,
  "points_earned": 8.5,
  "instructor_feedback": "Good answer but could be more specific."
}
```

**Note**: For essay and short answer questions

---

### Get Quiz Analytics
**GET** `/api/quizzes/:quizId/analytics`

**Auth Required**: Yes (Instructor/Admin)

**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "total_attempts": 45,
    "average_score": 78.5,
    "pass_rate": 82.22,
    "score_distribution": {
      "0-20": 2,
      "21-40": 3,
      "41-60": 5,
      "61-80": 15,
      "81-100": 20
    }
  }
}
```

---

## Assignment Endpoints

### Create Assignment
**POST** `/api/courses/:courseId/lessons/:lessonId/assignments`

**Auth Required**: Yes (Instructor/Admin)

**Request Body**:
```json
{
  "title": "Build a Todo App",
  "description": "Create a simple todo application using React",
  "instructions": "1. Create React app\n2. Implement CRUD operations\n3. Add styling",
  "total_points": 100,
  "passing_score": 70,
  "due_date": "2024-02-01T23:59:59Z",
  "submission_type": "multi_file",
  "allowed_file_types": ["zip", "pdf"],
  "max_file_size_mb": 50,
  "max_submissions": 3,
  "display_order": 1
}
```

---

### Get Assignment Details
**GET** `/api/assignments/:assignmentId`

**Auth Required**: Yes

**Response**: `200 OK`

---

### Update Assignment
**PUT** `/api/assignments/:assignmentId`

**Auth Required**: Yes (Instructor/Admin)

**Note**: Cannot update if submissions exist

---

### Delete Assignment
**DELETE** `/api/assignments/:assignmentId`

**Auth Required**: Yes (Instructor/Admin)

---

### Submit Assignment
**POST** `/api/assignments/:assignmentId/submit`

**Auth Required**: Yes (Student/Instructor/Admin)

**Content-Type**: `multipart/form-data`

**Form Data**:
- `files` (for file/multi_file types)
- `content` (for text type)
- `external_url` (for url type)

**Example**:
```bash
curl -X POST http://localhost:3001/api/assignments/:id/submit \
  -H "Authorization: Bearer TOKEN" \
  -F "files=@project.zip" \
  -F "content=Here is my submission"
```

**Response**: `201 Created`
```json
{
  "success": true,
  "message": "Assignment submitted successfully",
  "data": {
    "id": "uuid",
    "assignment_id": "uuid",
    "submission_number": 1,
    "submitted_at": "2024-01-21T15:00:00Z",
    "status": "submitted"
  }
}
```

---

### Get My Submissions
**GET** `/api/assignments/:assignmentId/my-submissions`

**Auth Required**: Yes

**Response**: List of student's submissions with grades and feedback

---

### Get All Submissions (Instructor)
**GET** `/api/assignments/:assignmentId/submissions`

**Auth Required**: Yes (Instructor/Admin)

**Query Parameters**:
- `page` (default: 1)
- `limit` (default: 20)
- `status` (optional: submitted, grading, graded, late)

---

### Grade Submission
**PUT** `/api/assignments/:assignmentId/submissions/:submissionId/grade`

**Auth Required**: Yes (Instructor/Admin)

**Request Body**:
```json
{
  "score": 85,
  "feedback": "Great work! The code is clean and well-structured. Consider adding more error handling."
}
```

---

### Get Assignment Analytics
**GET** `/api/assignments/:assignmentId/analytics`

**Auth Required**: Yes (Instructor/Admin)

**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "total_submissions": 38,
    "graded_submissions": 35,
    "average_score": 82.5,
    "on_time_submissions": 32,
    "late_submissions": 6
  }
}
```

---

## Certificate Endpoints

### Generate Certificate
**POST** `/api/enrollments/:enrollmentId/certificate`

**Auth Required**: Yes (Student)

**Response**: `201 Created`
```json
{
  "success": true,
  "message": "Certificate generated successfully",
  "data": {
    "id": "uuid",
    "certificate_number": "CERT-XYZ123",
    "issued_date": "2024-01-21T16:00:00Z",
    "verification_token": "abc123...",
    "certificate_url": "/certificates/uuid.pdf"
  }
}
```

**Note**: Only generates if enrollment status is 'completed' and minimum score met

---

### Get Certificate
**GET** `/api/certificates/:certificateId`

**Auth Required**: Yes

**Response**: Certificate details

---

### Get My Certificates
**GET** `/api/certificates`

**Auth Required**: Yes

**Response**: List of all certificates earned by the user

---

### Verify Certificate (Public)
**GET** `/api/certificates/verify/:verificationToken`

**Auth Required**: No

**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "certificate_number": "CERT-XYZ123",
    "user": {
      "first_name": "John",
      "last_name": "Doe"
    },
    "course": {
      "title": "JavaScript Mastery"
    },
    "issued_date": "2024-01-21T16:00:00Z",
    "expired": false
  }
}
```

---

## Analytics Endpoints

### Student Dashboard
**GET** `/api/analytics/student/dashboard`

**Auth Required**: Yes (Student)

**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "courses_enrolled": 5,
    "courses_completed": 2,
    "average_quiz_score": 82.5,
    "assignments_submitted": 12,
    "assignments_pending": 3,
    "certificates_earned": 2,
    "recent_quiz_scores": [...]
  }
}
```

---

### Student Progress
**GET** `/api/analytics/student/progress`

**Auth Required**: Yes (Student)

**Response**: Detailed progress for each enrolled course

---

### Instructor Dashboard
**GET** `/api/analytics/instructor/dashboard`

**Auth Required**: Yes (Instructor/Admin)

**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "total_courses": 10,
    "published_courses": 8,
    "total_students": 245,
    "average_completion": 65.8,
    "completion_rate": 55.2
  }
}
```

---

### Instructor Course Analytics
**GET** `/api/analytics/instructor/courses`

**Auth Required**: Yes (Instructor/Admin)

**Response**: Per-course analytics (enrollments, completion rates, etc.)

---

### Course Student Progress
**GET** `/api/analytics/instructor/students/:courseId`

**Auth Required**: Yes (Instructor/Admin)

**Response**: Individual student progress for specific course

---

### Admin Overview
**GET** `/api/analytics/admin/overview`

**Auth Required**: Yes (Admin)

**Response**: System-wide statistics

---

### Admin User Analytics
**GET** `/api/analytics/admin/users`

**Auth Required**: Yes (Admin)

**Response**: User growth, active users, role distribution

---

### Admin Course Analytics
**GET** `/api/analytics/admin/courses`

**Auth Required**: Yes (Admin)

**Response**: Popular courses, completion rates, instructor performance

---

## Communication Endpoints

### Create Announcement
**POST** `/api/courses/:courseId/announcements`

**Auth Required**: Yes (Instructor/Admin)

**Request Body**:
```json
{
  "title": "Important Update",
  "content": "The quiz deadline has been extended to next Friday.",
  "pin_to_top": false,
  "expires_at": "2024-02-01T00:00:00Z"
}
```

**Note**: Automatically creates notifications for all enrolled students

---

### Get Course Announcements
**GET** `/api/courses/:courseId/announcements`

**Auth Required**: Yes

**Query Parameters**:
- `page` (default: 1)
- `limit` (default: 10)

**Response**: Paginated list of announcements (pinned first)

---

### Update Announcement
**PUT** `/api/announcements/:announcementId`

**Auth Required**: Yes (Instructor/Admin)

---

### Delete Announcement
**DELETE** `/api/announcements/:announcementId`

**Auth Required**: Yes (Instructor/Admin)

---

### Get My Notifications
**GET** `/api/notifications`

**Auth Required**: Yes

**Query Parameters**:
- `page` (default: 1)
- `limit` (default: 20)
- `type` (optional: course_update, assignment_due, quiz_grade, announcement, comment_reply, enrollment)
- `read` (optional: true/false)

**Response**: `200 OK`
```json
{
  "success": true,
  "data": [...],
  "unread_count": 5,
  "pagination": {...}
}
```

---

### Mark Notification as Read
**PUT** `/api/notifications/:notificationId/read`

**Auth Required**: Yes

---

### Mark All Notifications as Read
**PUT** `/api/notifications/read-all`

**Auth Required**: Yes

---

### Delete Notification
**DELETE** `/api/notifications/:notificationId`

**Auth Required**: Yes

---

### Create Discussion
**POST** `/api/courses/:courseId/discussions`

**Auth Required**: Yes

**Request Body**:
```json
{
  "title": "Question about Closures",
  "lesson_id": "uuid" // optional
}
```

---

### Get Course Discussions
**GET** `/api/courses/:courseId/discussions`

**Auth Required**: Yes

**Query Parameters**:
- `page` (default: 1)
- `limit` (default: 20)

**Response**: Paginated list of discussions (pinned first)

---

### Add Comment
**POST** `/api/discussions/:discussionId/comments`

**Auth Required**: Yes

**Request Body**:
```json
{
  "content": "This is my comment",
  "parent_comment_id": "uuid" // optional, for replies
}
```

**Note**: Creates notification for parent comment author (if reply)

---

### Get Discussion Comments
**GET** `/api/discussions/:discussionId/comments`

**Auth Required**: Yes

**Query Parameters**:
- `page` (default: 1)
- `limit` (default: 50)

**Response**: Threaded comments with replies

---

### Update Comment
**PUT** `/api/comments/:commentId`

**Auth Required**: Yes (Owner only)

**Request Body**:
```json
{
  "content": "Updated comment text"
}
```

---

### Like Comment
**POST** `/api/comments/:commentId/like`

**Auth Required**: Yes

**Response**: Increments likes_count

---

### Mark Comment as Answer
**PUT** `/api/comments/:commentId/mark-answer`

**Auth Required**: Yes (Discussion creator only)

**Response**: Marks comment as the accepted answer

---

## Error Responses

All endpoints use consistent error responses:

**400 Bad Request**:
```json
{
  "success": false,
  "message": "Validation error",
  "errors": ["Title must be at least 3 characters"]
}
```

**401 Unauthorized**:
```json
{
  "success": false,
  "message": "Authentication required"
}
```

**403 Forbidden**:
```json
{
  "success": false,
  "message": "You do not have permission to perform this action"
}
```

**404 Not Found**:
```json
{
  "success": false,
  "message": "Resource not found"
}
```

**500 Internal Server Error**:
```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## Rate Limiting

- General API: 100 requests per 15 minutes
- Quiz submission: Subject to quiz attempt limits
- Assignment submission: Subject to assignment submission limits

---

## Authentication

All protected endpoints require JWT token in Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

Get token from:
- `POST /api/auth/login`
- `POST /api/auth/register`

Token refresh:
- Tokens expire after 24 hours
- Use refresh token mechanism (see Phase 1 docs)

---

## Pagination

All paginated endpoints return:

```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}
```

Default: `page=1`, `limit=10` (or 20 for some endpoints)

---

## File Uploads

Assignment submission endpoints accept multipart/form-data:

**Allowed File Types**:
- Documents: PDF, DOC, DOCX, TXT, ZIP
- Maximum Size: 50MB (configurable per assignment)
- Multiple Files: Up to 5 files per submission

**Example**:
```bash
curl -X POST http://localhost:3001/api/assignments/:id/submit \
  -H "Authorization: Bearer TOKEN" \
  -F "files=@file1.pdf" \
  -F "files=@file2.zip"
```

