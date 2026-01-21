# Gamification System - Quick Start Guide

## 🚀 Getting Started

### 1. Run Database Migrations

```bash
# Start Docker services
docker-compose up -d postgres redis

# Run migrations (from backend directory)
cd backend
npm run migrate
```

### 2. Seed Badge Data

```bash
# Seed default badge categories and sample badges
node src/migrations/seed-gamification.js
```

### 3. Verify Installation

```bash
# Run verification script
node src/migrations/final-verification.js
```

## 📊 Database Tables

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `badge_categories` | Badge organization | name, icon_color |
| `badges` | Badge definitions | criteria_type, criteria_value, points_awarded |
| `user_badges` | Earned badges | user_id, badge_id, earned_at |
| `user_points` | Points summary | total_points, category breakdowns |
| `points_history` | Point transactions | activity_type, points_earned, multiplier |
| `achievements` | Unlocked achievements | achievement_type, achievement_data |
| `learning_streaks` | Daily streaks | current_streak_days, longest_streak_days |
| `leaderboards` | User rankings | rank, total_points, ranking_period |

## 💡 Common Use Cases

### Award Points to User

```javascript
const { UserPoint, PointsHistory } = require('./src/models');

// Create or update user points
const [userPoint, created] = await UserPoint.findOrCreate({
  where: { user_id: userId },
  defaults: { total_points: 0 }
});

// Add points
const pointsToAdd = 50;
await userPoint.increment({
  total_points: pointsToAdd,
  quiz_points: pointsToAdd
});

// Record in history
await PointsHistory.create({
  user_id: userId,
  points_earned: pointsToAdd,
  activity_type: 'quiz_completed',
  resource_type: 'quiz',
  resource_id: quizId,
  description: 'Completed JavaScript Basics Quiz'
});
```

### Check and Award Badges

```javascript
const { Badge, UserBadge, UserPoint } = require('./src/models');

// Find badges user might qualify for
const badges = await Badge.findAll({
  where: {
    criteria_type: 'courses_completed',
    is_active: true
  }
});

for (const badge of badges) {
  const coursesCompleted = await getCompletedCoursesCount(userId);
  
  if (coursesCompleted >= badge.criteria_value) {
    // Check if user already has this badge
    const existing = await UserBadge.findOne({
      where: { user_id: userId, badge_id: badge.id }
    });
    
    if (!existing) {
      // Award badge
      await UserBadge.create({
        user_id: userId,
        badge_id: badge.id,
        total_points_from_badge: badge.points_awarded
      });
      
      // Award points
      await awardPoints(userId, badge.points_awarded, 'badge_earned');
    }
  }
}
```

### Update Learning Streak

```javascript
const { LearningStreak } = require('./src/models');
const { Op } = require('sequelize');

const today = new Date().toISOString().split('T')[0];
const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

const [streak, created] = await LearningStreak.findOrCreate({
  where: { user_id: userId },
  defaults: {
    current_streak_days: 1,
    longest_streak_days: 1,
    last_activity_date: today,
    streak_started_at: new Date()
  }
});

if (!created) {
  const lastActivity = streak.last_activity_date;
  
  if (lastActivity === today) {
    // Already counted today
    return;
  } else if (lastActivity === yesterday) {
    // Continue streak
    await streak.increment('current_streak_days');
    await streak.update({ last_activity_date: today });
    
    // Update longest if needed
    if (streak.current_streak_days > streak.longest_streak_days) {
      await streak.update({ longest_streak_days: streak.current_streak_days });
    }
  } else {
    // Streak broken
    await streak.update({
      current_streak_days: 1,
      last_activity_date: today,
      streak_started_at: new Date()
    });
  }
}
```

### Get User Leaderboard Position

```javascript
const { Leaderboard, User } = require('./src/models');

// Get global all-time leaderboard
const leaderboard = await Leaderboard.findAll({
  where: {
    course_id: null,
    ranking_period: 'all_time'
  },
  include: [{
    model: User,
    as: 'user',
    attributes: ['id', 'username', 'first_name', 'last_name']
  }],
  order: [['rank', 'ASC']],
  limit: 100
});

// Get specific user's position
const userPosition = await Leaderboard.findOne({
  where: {
    user_id: userId,
    course_id: null,
    ranking_period: 'all_time'
  }
});
```

### Track Achievement

```javascript
const { Achievement } = require('./src/models');

// Check if user already has this achievement
const existing = await Achievement.findOne({
  where: {
    user_id: userId,
    achievement_type: 'first_course'
  }
});

if (!existing) {
  await Achievement.create({
    user_id: userId,
    achievement_type: 'first_course',
    achievement_data: {
      course_id: courseId,
      course_name: 'JavaScript Fundamentals',
      completed_at: new Date()
    }
  });
}
```

## 📈 Badge Criteria Types

| Criteria Type | Description | Example Value |
|---------------|-------------|---------------|
| `courses_completed` | Number of courses finished | 5 |
| `quiz_score` | Minimum quiz score percentage | 90 |
| `streak_days` | Consecutive days of activity | 7 |
| `assignments_submitted` | Number of assignments | 20 |
| `discussions_participated` | Number of discussion posts | 10 |
| `courses_passed` | Number of courses passed | 10 |
| `total_points` | Total points earned | 1000 |
| `time_spent` | Minutes spent learning | 600 |
| `lessons_completed` | Number of lessons finished | 50 |
| `perfect_quizzes` | Perfect quiz scores | 5 |

## 🎯 Activity Types

| Activity Type | Points Category | Common Use |
|---------------|----------------|------------|
| `quiz_completed` | quiz_points | Quiz submission |
| `assignment_submitted` | assignment_points | Assignment submission |
| `course_completed` | course_completion_points | Course finished |
| `discussion_participated` | discussion_points | Forum post/comment |
| `lesson_completed` | course_completion_points | Lesson finished |
| `badge_earned` | total_points | Badge awarded |
| `streak_bonus` | streak_bonus_points | Daily streak milestone |
| `daily_login` | total_points | First login of day |

## 🏆 Achievement Types

| Achievement Type | When to Award |
|------------------|---------------|
| `first_course` | User completes first course |
| `first_quiz_passed` | User passes first quiz |
| `first_assignment` | User submits first assignment |
| `first_discussion_post` | User makes first forum post |
| `weekly_goal` | User meets weekly learning goal |
| `perfect_week` | User completes all daily goals in a week |
| `comeback_learner` | User returns after 30+ days |

## 📊 Sample Queries

### Get User's Badge Collection
```javascript
const userBadges = await UserBadge.findAll({
  where: { user_id: userId },
  include: [{
    model: Badge,
    as: 'badge',
    include: [{
      model: BadgeCategory,
      as: 'category'
    }]
  }],
  order: [['earned_at', 'DESC']]
});
```

### Get User's Points Breakdown
```javascript
const points = await UserPoint.findOne({
  where: { user_id: userId }
});

const breakdown = {
  total: points.total_points,
  courses: points.course_completion_points,
  quizzes: points.quiz_points,
  assignments: points.assignment_points,
  discussions: points.discussion_points,
  streaks: points.streak_bonus_points
};
```

### Get Recent Point Activities
```javascript
const recentActivity = await PointsHistory.findAll({
  where: { user_id: userId },
  order: [['created_at', 'DESC']],
  limit: 20
});
```

### Get Available Badges
```javascript
const availableBadges = await Badge.findAll({
  where: { is_active: true },
  include: [{
    model: BadgeCategory,
    as: 'category'
  }],
  order: [
    ['difficulty_level', 'ASC'],
    ['criteria_value', 'ASC']
  ]
});
```

## 🔧 Maintenance Tasks

### Recalculate User Points
```javascript
const recalculateUserPoints = async (userId) => {
  const history = await PointsHistory.findAll({
    where: { user_id: userId }
  });
  
  const totals = {
    total_points: 0,
    course_completion_points: 0,
    quiz_points: 0,
    assignment_points: 0,
    discussion_points: 0,
    streak_bonus_points: 0
  };
  
  history.forEach(entry => {
    totals.total_points += entry.points_earned;
    
    switch(entry.activity_type) {
      case 'course_completed':
      case 'lesson_completed':
        totals.course_completion_points += entry.points_earned;
        break;
      case 'quiz_completed':
        totals.quiz_points += entry.points_earned;
        break;
      case 'assignment_submitted':
        totals.assignment_points += entry.points_earned;
        break;
      case 'discussion_participated':
        totals.discussion_points += entry.points_earned;
        break;
      case 'streak_bonus':
        totals.streak_bonus_points += entry.points_earned;
        break;
    }
  });
  
  await UserPoint.upsert({
    user_id: userId,
    ...totals,
    points_history_count: history.length,
    last_points_update: new Date()
  });
};
```

### Update Leaderboards
```javascript
const updateLeaderboards = async (period = 'all_time', courseId = null) => {
  // Get users with points, ordered by total
  const users = await UserPoint.findAll({
    order: [['total_points', 'DESC']]
  });
  
  // Update rankings
  for (let i = 0; i < users.length; i++) {
    const userPoint = users[i];
    const badgeCount = await UserBadge.count({
      where: { user_id: userPoint.user_id }
    });
    
    const coursesCompleted = await Enrollment.count({
      where: {
        user_id: userPoint.user_id,
        status: 'completed'
      }
    });
    
    await Leaderboard.upsert({
      user_id: userPoint.user_id,
      course_id: courseId,
      rank: i + 1,
      total_points: userPoint.total_points,
      badges_count: badgeCount,
      courses_completed: coursesCompleted,
      ranking_period: period
    });
  }
};
```

## 📝 Next Steps

1. **Create Services** - Implement `gamificationService.js` with business logic
2. **Create Controllers** - Add API endpoints for gamification features
3. **Add Routes** - Register gamification routes
4. **Create Validators** - Add input validation
5. **Add Event Hooks** - Trigger gamification on user actions
6. **Build Frontend** - Create UI components for badges, points, streaks, leaderboards

## 📚 Additional Resources

- Full documentation: `GAMIFICATION_PHASE5.md`
- Completion summary: `../PHASE5_GAMIFICATION_COMPLETE.md`
- Verification scripts in: `src/migrations/`
