# AchievementService Documentation

## Overview

The AchievementService provides a comprehensive system for managing user achievements in the Learning Management System. It handles checking, unlocking, and retrieving achievements based on user activities and triggers.

## Achievement Types

The system supports 7 different achievement types:

1. **first_course** - Complete your first course (100 points)
2. **first_quiz_passed** - Pass your first quiz with score ≥ 50% (50 points)
3. **first_assignment** - Submit your first assignment (25 points)
4. **first_discussion_post** - Make your first discussion comment (25 points)
5. **weekly_goal** - Earn 500+ points in a week (200 points)
6. **perfect_week** - Get 100% on all activities in a week (300 points)
7. **comeback_learner** - Return after 7+ days of inactivity (75 points)

## Core Methods

### 1. checkAndUnlockAchievements(userId, triggerType, triggerData = {})

Main method to check and unlock achievements based on trigger events.

**Parameters:**
- `userId` (string): User's UUID
- `triggerType` (string): Event that triggered the check
- `triggerData` (object): Additional data about the trigger event

**Trigger Types:**
- `'quiz_completed'`: Check first_quiz, perfect_week, weekly_goal, comeback
- `'course_completed'`: Check first_course, perfect_week, weekly_goal
- `'assignment_submitted'`: Check first_assignment, perfect_week, weekly_goal
- `'discussion_participated'`: Check first_discussion_post, weekly_goal
- `'lesson_completed'`: Check weekly_goal, perfect_week
- `'daily_check'`: Check weekly_goal, perfect_week, comeback
- `'week_ended'`: Check weekly_goal, perfect_week

**Returns:**
```javascript
{
  achievementsUnlocked: ['first_course', 'weekly_goal'],
  pointsAwarded: 300
}
```

### 2. Individual Achievement Check Methods

#### checkFirstCourseAchievement(userId)
Checks if user has completed their first course.

#### checkFirstQuizAchievement(userId)
Checks if user has passed their first quiz with score ≥ 50%.

#### checkFirstAssignmentAchievement(userId)
Checks if user has submitted their first assignment.

#### checkFirstDiscussionAchievement(userId)
Checks if user has made their first discussion post.

#### checkWeeklyGoalAchievement(userId)
Checks if user has earned 500+ points in the past 7 days.

#### checkPerfectWeekAchievement(userId)
Checks if user has completed all activities with 100% scores in the past 7 days.

#### checkComebackLearnerAchievement(userId)
Checks if user is returning after 7+ days of inactivity.

### 3. Retrieval Methods

#### getUnlockedAchievements(userId)
Returns all achievements unlocked by a user.

**Returns:**
```javascript
{
  achievements: [
    {
      id: 'uuid',
      type: 'first_course',
      unlockedAt: '2024-01-15T10:30:00Z',
      data: { courseId: 'course-uuid', courseName: 'Intro to JS', completedAt: '2024-01-15T10:30:00Z' },
      details: { name: 'First Course', icon: '🎓', points: 100 }
    }
  ],
  count: 1
}
```

#### getAvailableAchievements(userId)
Returns achievements available to unlock with progress information.

**Returns:**
```javascript
{
  availableAchievements: [
    {
      type: 'first_quiz_passed',
      name: 'Quiz Master',
      description: 'Pass your first quiz with a score of 50% or higher',
      icon: '🧠',
      points: 50,
      progress: {
        current: 0,
        required: 1,
        percentage: 0,
        description: '0/1 quizzes passed with 50%+ score'
      }
    }
  ],
  count: 6
}
```

#### getAllAchievements()
Returns all possible achievement types.

**Returns:**
```javascript
{
  achievements: [
    {
      type: 'first_course',
      name: 'First Course',
      description: 'Complete your first course',
      icon: '🎓',
      points: 100
    }
  ],
  count: 7
}
```

#### hasAchievement(userId, achievementType)
Checks if user already has a specific achievement.

**Returns:** `boolean`

#### getAchievementDetails(achievementType)
Returns detailed information about a specific achievement type.

**Returns:**
```javascript
{
  type: 'first_course',
  name: 'First Course',
  description: 'Complete your first course',
  icon: '🎓',
  points: 100,
  howToUnlock: 'Complete any course in the platform'
}
```

### 4. Helper Methods

#### unlockAchievement(userId, achievementType, achievementData = {})
Manually unlocks an achievement for a user.

**Parameters:**
- `achievementData` (object): Contextual data to store with the achievement

#### createAchievementNotification(userId, achievement)
Creates a notification when an achievement is unlocked.

## Usage Examples

### Basic Achievement Check
```javascript
const AchievementService = require('./services/AchievementService');

// Check achievements after quiz completion
const result = await AchievementService.checkAndUnlockAchievements(
  'user-uuid',
  'quiz_completed',
  { quizId: 'quiz-uuid', score: 85, passed: true }
);

console.log('Achievements unlocked:', result.achievementsUnlocked);
console.log('Points awarded:', result.pointsAwarded);
```

### Get User's Progress
```javascript
// Get all unlocked achievements
const unlocked = await AchievementService.getUnlockedAchievements('user-uuid');
console.log('User has', unlocked.count, 'achievements');

// Get available achievements with progress
const available = await AchievementService.getAvailableAchievements('user-uuid');
available.availableAchievements.forEach(achievement => {
  console.log(`${achievement.name}: ${achievement.progress.description}`);
});
```

### Manual Achievement Unlock
```javascript
// Force unlock an achievement (e.g., for testing or admin purposes)
const achievement = await AchievementService.unlockAchievement(
  'user-uuid',
  'first_course',
  { courseId: 'course-uuid', courseName: 'Test Course', completedAt: new Date() }
);
```

## Integration Points

The AchievementService should be called from various parts of your application:

1. **Quiz Completion**: After grading a quiz attempt
2. **Assignment Submission**: When an assignment is submitted
3. **Course Completion**: When a course is marked as completed
4. **Discussion Participation**: When a comment is posted
5. **Daily Tasks**: For periodic checks (weekly goals, streaks)
6. **Admin Tools**: For manual achievement management

## Error Handling

All methods include proper error handling and will:
- Log errors to console
- Return meaningful error messages
- Use database transactions for data consistency
- Handle edge cases gracefully

## Database Requirements

The service requires the following models to be properly set up:
- `Achievement`
- `User`
- `PointsHistory`
- `LearningStreak`
- `QuizAttempt`
- `AssignmentSubmission`
- `Course`
- `CourseDiscussion`
- `DiscussionComment`
- `Enrollment`
- `Notification`

## Performance Considerations

- Uses efficient database queries with proper indexes
- Prevents duplicate achievements with unique constraints
- Uses transactions to maintain data consistency
- Implements proper date filtering for time-based achievements

## Testing

Use the provided test file to verify the service:
```bash
node src/services/testAchievementServiceBasic.js
```

This will verify that all methods are properly implemented and accessible.