# Gamification UI Components

Complete set of 20 reusable React/Next.js components for displaying gamification elements in the Advanced LMS application.

## Location
`/frontend/components/gamification/`

## Installation & Import

All components can be imported from the central index file:

```typescript
import {
  PointsCard,
  BadgeGrid,
  StreakDisplay,
  AchievementTimeline,
  LeaderboardTable,
  GamificationDashboard,
  // ... all other components
} from '@/components/gamification';
```

## Component List

### 1. PointsCard
Display user's total points with category breakdown.

**Props:**
- `totalPoints`: number - Total points earned
- `breakdown`: Object - Points by category (courseCompletion, quiz, assignment, discussion, streakBonus)
- `earningRate?`: number - Average points per day
- `lastUpdated?`: string - ISO timestamp of last update

**Features:**
- Animated number counter
- Category progress bars
- Earning rate indicator
- Time ago formatting

### 2. PointsNotification
Toast notification when points are earned.

**Props:**
- `show`: boolean - Whether to show notification
- `points`: number - Points earned
- `activityType`: string - Type of activity (quiz, assignment, etc.)
- `description?`: string - Custom description
- `onClose`: () => void - Close handler
- `autoDismiss?`: boolean - Auto-dismiss after 4 seconds

**Features:**
- Slide-in animation from bottom-right
- Activity icons
- Progress bar for auto-dismiss
- Optional sound effect

### 3. BadgeCard
Display single badge with progress.

**Props:**
- `badge`: Badge object - Badge data
- `earned?`: boolean - Whether user earned this badge
- `earnedDate?`: string - When badge was earned
- `progress?`: Progress object - Current/required values
- `onClick?`: () => void - Click handler

**Features:**
- Difficulty color coding
- Earned/locked states
- Progress bar for incomplete badges
- Hover effects

### 4. BadgeDetailsModal
Full badge information modal.

**Props:**
- `badge`: Badge object - Badge data
- `isOpen`: boolean - Modal visibility
- `onClose`: () => void - Close handler
- `onAward?`: (badgeId: string) => void - Award badge handler (admin)
- `earnedUsers?`: Array - Users who earned this badge
- `isEarned?`: boolean - Whether current user earned it
- `earnedDate?`: string - When current user earned it
- `isAdmin?`: boolean - Show admin controls

**Features:**
- Full description and criteria
- Tips to earn badge
- List of users who earned it
- Admin award button
- Responsive design

### 5. BadgeGrid
Grid display of multiple badges.

**Props:**
- `badges`: Badge[] - Array of badges
- `userBadges?`: UserBadge[] - User's earned badges
- `onBadgeClick?`: (badge) => void - Click handler
- `showProgress?`: boolean - Show progress bars
- `progressData?`: Object - Progress data for each badge
- `itemsPerPage?`: number - Pagination items per page

**Features:**
- Category filtering
- Sorting (name, difficulty, points, earned)
- Pagination
- Responsive grid (1-4 columns)
- Earned-only toggle

### 6. AchievementCard
Display single achievement.

**Props:**
- `achievement`: Achievement object - Achievement data
- `unlocked?`: boolean - Whether achievement is unlocked
- `unlockedAt?`: string - When achievement was unlocked
- `onClick?`: () => void - Click handler

**Features:**
- Locked/unlocked states
- Tooltip on hover
- Pop animation on unlock
- Different visual styles

### 7. AchievementTimeline
Timeline view of achievements.

**Props:**
- `achievements`: Achievement[] - All available achievements
- `unlockedAchievements`: UnlockedAchievement[] - User's unlocked achievements
- `onAchievementClick?`: (achievement) => void - Click handler

**Features:**
- Vertical timeline (desktop)
- Horizontal scroll (mobile)
- Unlock dates
- Summary stats

### 8. StreakDisplay
Show current and longest streak.

**Props:**
- `currentStreak`: number - Current streak length
- `longestStreak`: number - Longest streak achieved
- `lastActivityDate?`: string - Last activity timestamp
- `nextMilestone?`: number - Next milestone day count
- `pointsPerDay?`: number - Points earned per day from streak

**Features:**
- Large flame icon with animation
- Intensity-based colors
- Milestone progress
- Risk warning
- Stats summary

### 9. StreakCalendar
30-day activity heatmap calendar.

**Props:**
- `calendarData`: CalendarDay[] - Array of day data
- `currentStreak?`: number - Current streak length
- `onDayClick?`: (day) => void - Day click handler

**Features:**
- GitHub-style heatmap
- 5 intensity levels
- Hover tooltips
- Today indicator
- Responsive design
- Stats summary

### 10. LeaderboardTable
Display leaderboard as sortable table.

**Props:**
- `leaderboard`: LeaderboardEntry[] - Leaderboard data
- `period?`: 'all_time' | 'monthly' | 'weekly' - Time period
- `userRank?`: number - Current user's rank
- `userId?`: string - Current user's ID
- `onPageChange?`: (page) => void - Page change handler
- `itemsPerPage?`: number - Items per page

**Features:**
- Sortable columns
- Medals for top 3
- User row highlighting
- Rank change indicators
- Pagination
- Responsive table

### 11. LeaderboardRank
Display user's rank and comparison.

**Props:**
- `userRank`: number - User's rank
- `comparison`: RankComparison object - Comparison data
- `period?`: 'all_time' | 'monthly' | 'weekly' - Time period
- `neighbors?`: Object - Users above/below
- `milestones?`: number[] - Milestone ranks

**Features:**
- Percentile display
- Performance indicator
- Neighbor rankings
- Milestone badges
- Points to next rank

### 12. PointsProgress
Progress toward next badge/milestone.

**Props:**
- `badges`: Badge[] - All badges
- `userBadges`: Set<string> - User's earned badge IDs
- `progressData`: Object - Progress for each badge
- `currentPoints`: number - User's current points
- `nextMilestone?`: number - Next points milestone

**Features:**
- Next badge display
- Points milestone progress
- Badge collection progress
- Time estimates
- Quick stats

### 13. BadgeProgressBar
Single badge progress indicator.

**Props:**
- `badge`: Badge object - Badge data
- `currentValue`: number - Current progress value
- `criteriaValue?`: number - Required value (default: badge.criteria_value)
- `showIcon?`: boolean - Show badge icon
- `compact?`: boolean - Compact layout

**Features:**
- Progress bar with percentage
- Color-coded completion
- Time to unlock estimate
- Full/compact modes

### 14. GamificationDashboard
Main gamification dashboard component.

**Props:**
- `userId`: string - User ID to fetch data for

**Features:**
- Tabbed interface
- Points overview
- Badge showcase
- Streak info
- Achievements timeline
- Leaderboard preview
- Loading and error states
- Responsive layout

### 15. LeaderboardPeriodTabs
Tabs/buttons to switch leaderboard periods.

**Props:**
- `period`: 'all_time' | 'monthly' | 'weekly' - Current period
- `onPeriodChange`: (period) => void - Change handler

**Features:**
- Smooth transitions
- Active indicator
- Period descriptions
- Icons

### 16. PointsHistoryList
Display paginated points history.

**Props:**
- `history`: PointsHistoryEntry[] - History entries
- `total`: number - Total entries
- `page`: number - Current page
- `onPageChange`: (page) => void - Page change handler
- `itemsPerPage?`: number - Items per page

**Features:**
- Activity type filtering
- Search functionality
- Sort by date
- Pagination
- Responsive table/list
- Summary stats

### 17. NotificationCenter
Display stack of notifications.

**Props:**
- `notifications`: Notification[] - Notifications to display
- `onDismiss?`: (id) => void - Dismiss handler
- `onRead?`: (id) => void - Read handler
- `autoDismiss?`: boolean - Auto-dismiss notifications
- `autoDismissDelay?`: number - Delay in ms

**Features:**
- Multiple notification types
- Color-coded by type
- Auto-dismiss with progress bar
- Stack positioning
- Animations
- Mark as read

### 18. LearningStreakReminder
Prompt/reminder to maintain streak.

**Props:**
- `currentStreak`: number - Current streak
- `nextMilestone`: number - Next milestone day
- `daysUntilReset?`: number - Days until streak resets
- `isAtRisk?`: boolean - Whether streak is at risk
- `onContinueLearning?`: () => void - CTA handler

**Features:**
- Risk alerts with pulse animation
- Encouraging messages
- Milestone progress
- Stats display
- CTA button

### 19. UserRankComparison
Compare user's rank in different contexts.

**Props:**
- `userId`: string - User ID
- `courseId?`: string - Course ID for course ranking
- `globalRank`: RankInfo object - Global ranking data
- `courseRank?`: RankInfo object - Course ranking data
- `streakRank?`: RankInfo object - Streak ranking data
- `pointsRank?`: RankInfo object - Points ranking data
- `badgesRank?`: RankInfo object - Badges ranking data

**Features:**
- Multi-context rankings
- Percentile indicators
- Performance comparison
- Improvement tips
- Summary stats

### 20. GamificationStats
Show gamification statistics summary.

**Props:**
- `stats`: Stats object - Complete stats data including:
  - `totalPointsEarned`: number
  - `totalBadgesEarned`: number
  - `totalAchievementsUnlocked`: number
  - `currentRank`: number
  - `currentStreak`: number
  - `favoriteBadge?`: Badge object
  - `mostActiveCourse?`: Course object
  - `timeSpentLearning?`: number (minutes)
  - `averagePointsPerDay?`: number
  - `percentile?`: number

**Features:**
- Main stats grid
- Secondary statistics
- Favorite badge display
- Most active course
- Performance insights

## Design Patterns

### TypeScript
All components use TypeScript with strict prop typing:

```typescript
interface ComponentProps {
  requiredProp: string;
  optionalProp?: string;
}

export function Component({ requiredProp, optionalProp }: ComponentProps) {
  // Component logic
}
```

### Tailwind CSS
- Mobile-first responsive design
- Consistent color palette
- Gradient backgrounds for visual appeal
- Shadow and hover effects for interactivity

### Animations
- CSS transitions for smooth state changes
- Keyframe animations for entrance effects
- Pulse effects for important alerts
- Scale effects on hover

### Accessibility
- ARIA labels for interactive elements
- Keyboard navigation support
- Semantic HTML structure
- Focus indicators
- Alt text for images/icons

## Common Props

### Badge Interface
```typescript
interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string | null;
  criteria_type: string;
  criteria_value: number;
  points: number;
  difficulty_level: 'bronze' | 'silver' | 'gold' | 'platinum';
  category: {
    id: string;
    name: string;
    color: string;
    icon: string;
  };
}
```

### Achievement Interface
```typescript
interface Achievement {
  id: string;
  name: string;
  description: string;
  achievement_type: string;
  icon: string | null;
  data: any;
}
```

### PointsHistoryEntry Interface
```typescript
interface PointsHistoryEntry {
  id: string;
  activity_type: 'course_completion' | 'quiz' | 'assignment' | 'discussion' | 'streak_bonus' | 'login' | 'lesson_completion';
  description: string;
  points: number;
  timestamp: string;
  resource_id?: string;
  resource_type?: string;
}
```

## Usage Examples

### Basic Points Card
```typescript
import { PointsCard } from '@/components/gamification';

<PointsCard
  totalPoints={2500}
  breakdown={{
    courseCompletion: 1000,
    quiz: 600,
    assignment: 500,
    discussion: 200,
    streakBonus: 200
  }}
  earningRate={45}
  lastUpdated={new Date().toISOString()}
/>
```

### Badge Grid with Filtering
```typescript
import { BadgeGrid } from '@/components/gamification';

<BadgeGrid
  badges={badges}
  userBadges={userBadges}
  showProgress={true}
  progressData={progressData}
  onBadgeClick={(badge) => setSelectedBadge(badge)}
/>
```

### Leaderboard Table
```typescript
import { LeaderboardTable } from '@/components/gamification';

<LeaderboardTable
  leaderboard={leaderboardData}
  period="all_time"
  userRank={15}
  userId={currentUser.id}
  itemsPerPage={10}
/>
```

### Gamification Dashboard
```typescript
import { GamificationDashboard } from '@/components/gamification';

<GamificationDashboard userId={currentUser.id} />
```

## Icon Library
Components use `lucide-react` for consistent iconography:
```bash
npm install lucide-react
```

## Dark Mode Support
All components are designed to work with dark mode. Use Tailwind's `dark:` classes to customize dark mode appearance.

## Browser Support
- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES6+ JavaScript support required
- CSS Grid and Flexbox support required

## Performance Considerations
- Components use React.memo where appropriate
- Virtual scrolling for large lists (consider implementing for BadgeGrid with many items)
- Lazy loading for images
- Debounced search and filter inputs (implement in parent components)

## Future Enhancements
- Virtual scrolling for large datasets
- More animation options
- Customizable themes
- Internationalization support
- Advanced filtering options
- Export functionality for stats
