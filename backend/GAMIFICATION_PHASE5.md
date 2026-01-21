# Phase 5: Gamification System - Database Schema & Models

## Overview
This document describes the gamification system database structure and Sequelize models created for Phase 5.

## Database Tables Created

### 1. BadgeCategories
Stores badge category types for organizing badges.

**Table Name:** `badge_categories`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier |
| name | VARCHAR | UNIQUE, NOT NULL | Category name (Achievement, Milestone, Skill, Social) |
| description | TEXT | NULLABLE | Category description |
| icon_color | VARCHAR | NULLABLE | Hex color code for category icon |
| created_at | TIMESTAMP | NOT NULL | Creation timestamp |
| updated_at | TIMESTAMP | NOT NULL | Last update timestamp |

**Indexes:**
- `name`

---

### 2. Badges
Stores badge definitions with criteria and rewards.

**Table Name:** `badges`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier |
| name | VARCHAR | UNIQUE, NOT NULL | Badge name |
| description | TEXT | NOT NULL | Badge description |
| category_id | UUID | FK(badge_categories), NOT NULL | Reference to badge category |
| icon_url | VARCHAR | NULLABLE | Badge image path |
| criteria_type | ENUM | NOT NULL | Type of criteria for earning badge |
| criteria_value | INTEGER | NOT NULL | Threshold value for criteria |
| points_awarded | INTEGER | NOT NULL, DEFAULT 0 | Points awarded when badge is earned |
| difficulty_level | ENUM | NOT NULL, DEFAULT 'bronze' | Badge difficulty (bronze/silver/gold/platinum) |
| is_active | BOOLEAN | DEFAULT true | Whether badge is currently active |
| created_at | TIMESTAMP | NOT NULL | Creation timestamp |
| updated_at | TIMESTAMP | NOT NULL | Last update timestamp |

**Criteria Types:**
- `courses_completed`
- `quiz_score`
- `streak_days`
- `assignments_submitted`
- `discussions_participated`
- `courses_passed`
- `total_points`
- `time_spent`
- `lessons_completed`
- `perfect_quizzes`

**Indexes:**
- `category_id`
- `criteria_type`
- `is_active`

---

### 3. UserBadges
Tracks user's earned badges.

**Table Name:** `user_badges`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier |
| user_id | UUID | FK(users), NOT NULL | Reference to user |
| badge_id | UUID | FK(badges), NOT NULL | Reference to badge |
| earned_at | TIMESTAMP | NOT NULL, DEFAULT NOW | When badge was earned |
| total_points_from_badge | INTEGER | NOT NULL, DEFAULT 0 | Points awarded from this badge |
| created_at | TIMESTAMP | NOT NULL | Creation timestamp |

**Unique Constraints:**
- `(user_id, badge_id)` - User can only earn each badge once

**Indexes:**
- `user_id`
- `badge_id`
- `earned_at`

---

### 4. UserPoints
Stores user's point totals and breakdown by category.

**Table Name:** `user_points`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier |
| user_id | UUID | FK(users), UNIQUE, NOT NULL | Reference to user |
| total_points | INTEGER | NOT NULL, DEFAULT 0 | Total points earned |
| course_completion_points | INTEGER | NOT NULL, DEFAULT 0 | Points from completing courses |
| quiz_points | INTEGER | NOT NULL, DEFAULT 0 | Points from quizzes |
| assignment_points | INTEGER | NOT NULL, DEFAULT 0 | Points from assignments |
| discussion_points | INTEGER | NOT NULL, DEFAULT 0 | Points from discussions |
| streak_bonus_points | INTEGER | NOT NULL, DEFAULT 0 | Bonus points from streaks |
| points_history_count | INTEGER | NOT NULL, DEFAULT 0 | Count of point transactions |
| last_points_update | TIMESTAMP | NULLABLE | Last time points were updated |
| created_at | TIMESTAMP | NOT NULL | Creation timestamp |
| updated_at | TIMESTAMP | NOT NULL | Last update timestamp |

**Indexes:**
- `user_id`
- `total_points`

---

### 5. PointsHistory
Detailed history of all point earning activities.

**Table Name:** `points_history`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier |
| user_id | UUID | FK(users), NOT NULL | Reference to user |
| points_earned | INTEGER | NOT NULL | Points earned in this transaction |
| activity_type | ENUM | NOT NULL | Type of activity |
| resource_type | VARCHAR | NULLABLE | Type of resource (quiz, assignment, etc.) |
| resource_id | VARCHAR | NULLABLE | ID of the resource |
| multiplier | DECIMAL(5,2) | NOT NULL, DEFAULT 1.0 | Point multiplier applied |
| description | TEXT | NULLABLE | Description of the activity |
| created_at | TIMESTAMP | NOT NULL | Creation timestamp |

**Activity Types:**
- `quiz_completed`
- `assignment_submitted`
- `course_completed`
- `discussion_participated`
- `lesson_completed`
- `badge_earned`
- `streak_bonus`
- `daily_login`

**Indexes:**
- `user_id`
- `created_at`
- `activity_type`

---

### 6. Achievements
Tracks user's unlocked achievements.

**Table Name:** `achievements`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier |
| user_id | UUID | FK(users), NOT NULL | Reference to user |
| achievement_type | ENUM | NOT NULL | Type of achievement |
| achievement_data | JSON | NULLABLE | Contextual data for achievement |
| unlocked_at | TIMESTAMP | NOT NULL, DEFAULT NOW | When achievement was unlocked |
| created_at | TIMESTAMP | NOT NULL | Creation timestamp |

**Achievement Types:**
- `first_course`
- `first_quiz_passed`
- `first_assignment`
- `first_discussion_post`
- `weekly_goal`
- `perfect_week`
- `comeback_learner`

**Indexes:**
- `user_id`
- `achievement_type`
- `unlocked_at`

---

### 7. LearningStreaks
Tracks user's daily learning streaks.

**Table Name:** `learning_streaks`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier |
| user_id | UUID | FK(users), UNIQUE, NOT NULL | Reference to user |
| current_streak_days | INTEGER | NOT NULL, DEFAULT 0 | Current consecutive days |
| longest_streak_days | INTEGER | NOT NULL, DEFAULT 0 | Longest streak achieved |
| last_activity_date | DATE | NULLABLE | Last date user had activity |
| streak_started_at | TIMESTAMP | NULLABLE | When current streak started |
| created_at | TIMESTAMP | NOT NULL | Creation timestamp |
| updated_at | TIMESTAMP | NOT NULL | Last update timestamp |

**Indexes:**
- `user_id`
- `current_streak_days`

---

### 8. Leaderboards
Calculates and stores user rankings.

**Table Name:** `leaderboards`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier |
| user_id | UUID | FK(users), NOT NULL | Reference to user |
| course_id | UUID | FK(courses), NULLABLE | Course-specific leaderboard (null for global) |
| rank | INTEGER | NOT NULL | User's rank position |
| total_points | INTEGER | NOT NULL, DEFAULT 0 | Total points for ranking |
| badges_count | INTEGER | NOT NULL, DEFAULT 0 | Number of badges earned |
| courses_completed | INTEGER | NOT NULL, DEFAULT 0 | Number of courses completed |
| ranking_period | ENUM | NOT NULL, DEFAULT 'all_time' | Time period for ranking |
| updated_at | TIMESTAMP | NOT NULL | Last update timestamp |
| created_at | TIMESTAMP | NOT NULL | Creation timestamp |

**Ranking Periods:**
- `all_time`
- `monthly`
- `weekly`

**Unique Constraints:**
- `(user_id, course_id, ranking_period)` - One entry per user per period per course

**Indexes:**
- `course_id`
- `ranking_period`
- `rank`
- `total_points`

---

## Sequelize Models

### Model Files Created

1. **BadgeCategory.js** - Badge category model
2. **Badge.js** - Badge definition model
3. **UserBadge.js** - User earned badges model
4. **UserPoint.js** - User points summary model
5. **PointsHistory.js** - Points transaction history model
6. **Achievement.js** - User achievements model
7. **LearningStreak.js** - Learning streak tracking model
8. **Leaderboard.js** - Leaderboard entries model

### Model Associations

```javascript
// BadgeCategory associations
BadgeCategory.hasMany(Badge, { foreignKey: 'category_id', as: 'badges' });

// Badge associations
Badge.belongsTo(BadgeCategory, { foreignKey: 'category_id', as: 'category' });
Badge.hasMany(UserBadge, { foreignKey: 'badge_id', as: 'userBadges' });

// UserBadge associations
UserBadge.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
UserBadge.belongsTo(Badge, { foreignKey: 'badge_id', as: 'badge' });
User.hasMany(UserBadge, { foreignKey: 'user_id', as: 'userBadges' });

// UserPoint associations
UserPoint.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasOne(UserPoint, { foreignKey: 'user_id', as: 'points' });

// PointsHistory associations
PointsHistory.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(PointsHistory, { foreignKey: 'user_id', as: 'pointsHistory' });

// Achievement associations
Achievement.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(Achievement, { foreignKey: 'user_id', as: 'achievements' });

// LearningStreak associations
LearningStreak.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasOne(LearningStreak, { foreignKey: 'user_id', as: 'learningStreak' });

// Leaderboard associations
Leaderboard.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Leaderboard.belongsTo(Course, { foreignKey: 'course_id', as: 'course' });
User.hasMany(Leaderboard, { foreignKey: 'user_id', as: 'leaderboardEntries' });
Course.hasMany(Leaderboard, { foreignKey: 'course_id', as: 'leaderboardEntries' });
```

---

## Migration Files

All migration files follow the naming convention: `20240124000XXX-create-<table>-table.js`

1. `20240124000001-create-badge-categories-table.js`
2. `20240124000002-create-badges-table.js`
3. `20240124000003-create-user-badges-table.js`
4. `20240124000004-create-user-points-table.js`
5. `20240124000005-create-points-history-table.js`
6. `20240124000006-create-achievements-table.js`
7. `20240124000007-create-learning-streaks-table.js`
8. `20240124000008-create-leaderboards-table.js`

---

## Seed Data

### Seed File: `seed-gamification.js`

Creates default badge categories and sample badges:

**Badge Categories:**
- Achievement (Gold color)
- Milestone (Blue color)
- Skill (Green color)
- Social (Pink color)

**Sample Badges:** 15 badges across different criteria types and difficulty levels

To run the seed:
```bash
node src/migrations/seed-gamification.js
```

---

## Running Migrations

### Using Docker Compose
```bash
docker-compose exec backend npm run migrate
```

### Locally (with DATABASE_URL set)
```bash
cd backend
npm run migrate
```

---

## Model Usage Examples

### Create user points record
```javascript
const { UserPoint } = require('./models');

const userPoints = await UserPoint.create({
  user_id: userId,
  total_points: 0
});
```

### Award badge to user
```javascript
const { UserBadge, Badge } = require('./models');

const badge = await Badge.findOne({ where: { name: 'First Steps' } });
await UserBadge.create({
  user_id: userId,
  badge_id: badge.id,
  total_points_from_badge: badge.points_awarded
});
```

### Track points history
```javascript
const { PointsHistory } = require('./models');

await PointsHistory.create({
  user_id: userId,
  points_earned: 50,
  activity_type: 'quiz_completed',
  resource_type: 'quiz',
  resource_id: quizId,
  description: 'Completed Advanced JavaScript Quiz'
});
```

### Update learning streak
```javascript
const { LearningStreak } = require('./models');

const streak = await LearningStreak.findOne({ where: { user_id: userId } });
await streak.update({
  current_streak_days: streak.current_streak_days + 1,
  last_activity_date: new Date()
});
```

---

## Verification

Run verification scripts to ensure everything is set up correctly:

```bash
# Verify migrations exist
node src/migrations/verify-migrations.js

# Verify models exist
node src/migrations/test-models.js

# Verify model structure
node src/migrations/verify-model-structure.js
```

---

## Next Steps

With the database schema and models in place, the next phase would include:

1. **Services** - Gamification service layer for business logic
2. **Controllers** - API endpoints for gamification features
3. **Routes** - RESTful routes for accessing gamification data
4. **Validators** - Input validation for gamification endpoints
5. **Frontend Integration** - UI components for displaying badges, points, streaks, and leaderboards

---

## Notes

- All tables use UUID as primary keys for consistency
- Foreign key constraints ensure data integrity
- Indexes are added on frequently queried columns for performance
- Enum values are used for type safety
- Timestamps track creation and updates where appropriate
- Unique constraints prevent duplicate entries (e.g., earning same badge twice)
