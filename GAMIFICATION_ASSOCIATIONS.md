# Gamification Model Associations

This document summarizes all associations defined for the gamification system.

## BadgeCategory Model

**Relationships:**
- `hasMany(Badge, { foreignKey: 'category_id', as: 'badges' })` - A badge category can have many badges

**Reverse Association:**
- Defined in Badge model: `belongsTo(BadgeCategory, { foreignKey: 'category_id', as: 'category' })`

## Badge Model

**Relationships:**
- `belongsTo(BadgeCategory, { foreignKey: 'category_id', as: 'category' })` - A badge belongs to a category
- `hasMany(UserBadge, { foreignKey: 'badge_id', as: 'userBadges' })` - A badge can be earned by many users

**Reverse Associations:**
- Defined in BadgeCategory model: `hasMany(Badge, { foreignKey: 'category_id', as: 'badges' })`
- Defined in User model (through UserBadge): `hasMany(UserBadge, { foreignKey: 'user_id', as: 'badges' })`

## UserBadge Model

**Relationships:**
- `belongsTo(User, { foreignKey: 'user_id', as: 'user' })` - A user badge belongs to a user
- `belongsTo(Badge, { foreignKey: 'badge_id', as: 'badge' })` - A user badge is for a specific badge

**Reverse Associations:**
- Defined in User model: `hasMany(UserBadge, { foreignKey: 'user_id', as: 'badges' })`
- Defined in Badge model: `hasMany(UserBadge, { foreignKey: 'badge_id', as: 'userBadges' })`

## UserPoint Model

**Relationships:**
- `belongsTo(User, { foreignKey: 'user_id', as: 'user' })` - User points belong to a user
- `hasMany(PointsHistory, { foreignKey: 'user_id', as: 'pointsHistory' })` - User points have history entries

**Reverse Associations:**
- Defined in User model: `hasOne(UserPoint, { foreignKey: 'user_id', as: 'points' })`
- Defined in PointsHistory model: `belongsTo(User, { foreignKey: 'user_id', as: 'user' })`

## PointsHistory Model

**Relationships:**
- `belongsTo(User, { foreignKey: 'user_id', as: 'user' })` - Points history belongs to a user

**Reverse Associations:**
- Defined in User model: `hasMany(PointsHistory, { foreignKey: 'user_id', as: 'pointsHistory' })`
- Defined in UserPoint model: `hasMany(PointsHistory, { foreignKey: 'user_id', as: 'pointsHistory' })`

## Achievement Model

**Relationships:**
- `belongsTo(User, { foreignKey: 'user_id', as: 'user' })` - An achievement belongs to a user

**Reverse Association:**
- Defined in User model: `hasMany(Achievement, { foreignKey: 'user_id', as: 'achievements' })`

## LearningStreak Model

**Relationships:**
- `belongsTo(User, { foreignKey: 'user_id', as: 'user' })` - A learning streak belongs to a user

**Reverse Association:**
- Defined in User model: `hasOne(LearningStreak, { foreignKey: 'user_id', as: 'streaks' })`

## Leaderboard Model

**Relationships:**
- `belongsTo(User, { foreignKey: 'user_id', as: 'user' })` - A leaderboard entry belongs to a user
- `belongsTo(Course, { foreignKey: 'course_id', as: 'course' })` - A leaderboard entry can be for a course (optional)

**Reverse Associations:**
- Defined in User model: `hasMany(Leaderboard, { foreignKey: 'user_id', as: 'leaderboardEntries' })`
- Defined in Course model: `hasMany(Leaderboard, { foreignKey: 'course_id', as: 'leaderboards' })`

## User Model (Extended with Gamification)

**Gamification Relationships:**
- `hasOne(UserPoint, { foreignKey: 'user_id', as: 'points' })` - A user has points
- `hasMany(UserBadge, { foreignKey: 'user_id', as: 'badges' })` - A user can have many badges
- `hasMany(PointsHistory, { foreignKey: 'user_id', as: 'pointsHistory' })` - A user has points history
- `hasMany(Achievement, { foreignKey: 'user_id', as: 'achievements' })` - A user can have many achievements
- `hasOne(LearningStreak, { foreignKey: 'user_id', as: 'streaks' })` - A user has a learning streak
- `hasMany(Leaderboard, { foreignKey: 'user_id', as: 'leaderboardEntries' })` - A user can have leaderboard entries

## Course Model (Extended with Gamification)

**Gamification Relationships:**
- `hasMany(Leaderboard, { foreignKey: 'course_id', as: 'leaderboards' })` - A course has leaderboard entries

## Example Queries

### Get a user with all gamification data
```javascript
const user = await User.findOne({
  where: { id: userId },
  include: [
    { model: UserPoint, as: 'points' },
    { model: UserBadge, as: 'badges', include: [{ model: Badge, as: 'badge' }] },
    { model: PointsHistory, as: 'pointsHistory', order: [['created_at', 'DESC']], limit: 10 },
    { model: Achievement, as: 'achievements', order: [['unlocked_at', 'DESC']] },
    { model: LearningStreak, as: 'streaks' },
    { model: Leaderboard, as: 'leaderboardEntries', where: { ranking_period: 'all_time' } }
  ]
});
```

### Get course leaderboard
```javascript
const course = await Course.findOne({
  where: { id: courseId },
  include: [
    {
      model: Leaderboard,
      as: 'leaderboards',
      where: { ranking_period: 'all_time' },
      include: [{ model: User, as: 'user' }],
      order: [['rank', 'ASC']]
    }
  ]
});
```

### Get badges by category
```javascript
const category = await BadgeCategory.findOne({
  where: { id: categoryId },
  include: [
    {
      model: Badge,
      as: 'badges',
      include: [{ model: UserBadge, as: 'userBadges' }]
    }
  ]
});
```

### Get user points with history
```javascript
const userPoints = await UserPoint.findOne({
  where: { user_id: userId },
  include: [
    { model: User, as: 'user' },
    {
      model: PointsHistory,
      as: 'pointsHistory',
      order: [['created_at', 'DESC']],
      limit: 20
    }
  ]
});
```

## Association Summary

| Model | Relationship | Foreign Key | Alias |
|-------|-------------|-------------|-------|
| BadgeCategory | hasMany | category_id | badges |
| Badge | belongsTo | category_id | category |
| Badge | hasMany | badge_id | userBadges |
| UserBadge | belongsTo | user_id | user |
| UserBadge | belongsTo | badge_id | badge |
| UserPoint | belongsTo | user_id | user |
| UserPoint | hasMany | user_id | pointsHistory |
| PointsHistory | belongsTo | user_id | user |
| Achievement | belongsTo | user_id | user |
| LearningStreak | belongsTo | user_id | user |
| Leaderboard | belongsTo | user_id | user |
| Leaderboard | belongsTo | course_id | course |
| User | hasOne | user_id | points |
| User | hasMany | user_id | badges |
| User | hasMany | user_id | pointsHistory |
| User | hasMany | user_id | achievements |
| User | hasOne | user_id | streaks |
| User | hasMany | user_id | leaderboardEntries |
| Course | hasMany | course_id | leaderboards |

All associations are bidirectional where applicable and follow the Sequelize best practices for defining relationships.
