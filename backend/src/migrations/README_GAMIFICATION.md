# Gamification System Migrations & Seed Data

## Overview
This directory contains all database migrations and seed data for the Phase 5 Gamification System.

## Migration Files (In Order)

1. `20240124000001-create-badge-categories-table.js` - Badge category types table
2. `20240124000002-create-badges-table.js` - Badge definitions table
3. `20240124000003-create-user-badges-table.js` - User earned badges table
4. `20240124000004-create-user-points-table.js` - User points summary table
5. `20240124000005-create-points-history-table.js` - Points transaction history table
6. `20240124000006-create-achievements-table.js` - User achievements table
7. `20240124000007-create-learning-streaks-table.js` - Learning streaks table
8. `20240124000008-create-leaderboards-table.js` - Leaderboard rankings table

## Seed Files

- `seed-gamification.js` - Seeds badge categories and sample badges

## Running Migrations

### Development (Local)
```bash
# Set DATABASE_URL environment variable
export DATABASE_URL="postgresql://lms_user:lms_password@localhost:5432/advanced_lms"

# Run all migrations
npm run migrate
```

### Docker
```bash
# From project root
docker-compose exec backend npm run migrate
```

## Running Seeds

### Seed Gamification Data
```bash
# From backend directory
node src/migrations/seed-gamification.js
```

This will create:
- 4 Badge Categories
- 15 Sample Badges

## Verification Scripts

### Test All Models Exist
```bash
node src/migrations/test-models.js
```

### Verify Migration Structure
```bash
node src/migrations/verify-migrations.js
```

### Verify Model Structure
```bash
node src/migrations/verify-model-structure.js
```

### Final Comprehensive Verification
```bash
node src/migrations/final-verification.js
```

## Migration Dependencies

These migrations depend on existing tables:
- `users` table (for user_id foreign keys)
- `courses` table (for course_id foreign keys in leaderboards)

Ensure these tables exist before running gamification migrations.

## Rollback

Each migration includes a `down` method for rollback:

```bash
# Rollback last migration
npx sequelize-cli db:migrate:undo

# Rollback specific migration
npx sequelize-cli db:migrate:undo --name 20240124000008-create-leaderboards-table.js

# Rollback all gamification migrations
npx sequelize-cli db:migrate:undo:all --to 20240123000006-create-user-preferences-table.js
```

## Table Relationships

```
users (existing)
  ├── user_badges.user_id
  ├── user_points.user_id
  ├── points_history.user_id
  ├── achievements.user_id
  ├── learning_streaks.user_id
  └── leaderboards.user_id

courses (existing)
  └── leaderboards.course_id

badge_categories
  └── badges.category_id

badges
  └── user_badges.badge_id
```

## Index Summary

All tables include strategic indexes for performance:
- Foreign key columns (user_id, course_id, badge_id, category_id)
- Query columns (total_points, rank, created_at, activity_type)
- Unique constraints to prevent duplicates

## Enum Types

The following enum types are defined:

### badges.criteria_type
- courses_completed
- quiz_score
- streak_days
- assignments_submitted
- discussions_participated
- courses_passed
- total_points
- time_spent
- lessons_completed
- perfect_quizzes

### badges.difficulty_level
- bronze
- silver
- gold
- platinum

### points_history.activity_type
- quiz_completed
- assignment_submitted
- course_completed
- discussion_participated
- lesson_completed
- badge_earned
- streak_bonus
- daily_login

### achievements.achievement_type
- first_course
- first_quiz_passed
- first_assignment
- first_discussion_post
- weekly_goal
- perfect_week
- comeback_learner

### leaderboards.ranking_period
- all_time
- monthly
- weekly

## Important Notes

1. All tables use UUID primary keys for consistency
2. Foreign key constraints ensure referential integrity
3. Unique constraints prevent duplicate entries (e.g., earning same badge twice)
4. Timestamps are stored as `created_at` and `updated_at` in snake_case
5. All migrations are idempotent and can be safely re-run

## Troubleshooting

### Migration Fails on Foreign Key
Ensure the `users` and `courses` tables exist before running gamification migrations.

### Seed Data Already Exists
The seed script uses `findOrCreate` to prevent duplicates. Safe to run multiple times.

### Model Import Errors
Ensure all models are exported in `/backend/src/models/index.js`.

## Next Steps

After running migrations and seeds:
1. Verify all tables created: Check PostgreSQL with `\dt` command
2. Verify seed data: Query badge_categories and badges tables
3. Implement gamification service layer
4. Create API endpoints
5. Build frontend components
