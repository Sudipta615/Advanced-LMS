# Component Library Documentation

Complete reference for all reusable components in the Advanced-LMS frontend.

## Table of Contents

- [UI Components](#ui-components)
  - [Alert](#alert)
  - [LoadingSpinner](#loadingspinner)
  - [Pagination](#pagination)
  - [ProgressBar](#progressbar)
- [Course Components](#course-components)
  - [CourseCard](#coursecard)
  - [FilterSidebar](#filtersidebar)
  - [SearchBar](#searchbar)
- [Gamification Components](#gamification-components)
  - [BadgeCard](#badgecard)
  - [BadgeGrid](#badgegrid)
  - [LeaderboardTable](#leaderboardtable)
  - [PointsCard](#pointscard)
  - [GamificationDashboard](#gamificationdashboard)
  - [StreakDisplay](#streakdisplay)
- [Patterns & Best Practices](#patterns--best-practices)
- [Accessibility Guidelines](#accessibility-guidelines)
- [Styling Conventions](#styling-conventions)

---

## UI Components

### Alert

Display notifications and messages to users with different severity levels.

**Location:** `components/ui/Alert.tsx`

**Props:**
```typescript
interface AlertProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  onClose?: () => void;
}
```

**Usage:**
```tsx
import { Alert } from '@/components/ui/Alert';

// Success message
<Alert 
  type="success" 
  message="Your changes have been saved successfully!" 
/>

// Error with dismiss button
<Alert 
  type="error" 
  message="Failed to load data. Please try again." 
  onClose={() => setShowAlert(false)}
/>

// Warning
<Alert 
  type="warning" 
  message="Your session will expire in 5 minutes." 
/>

// Info
<Alert 
  type="info" 
  message="New features are now available!" 
/>
```

**Features:**
- Four severity levels with distinct styling
- Optional close button
- ARIA attributes for screen readers
- Appropriate `aria-live` regions (assertive for errors, polite for others)
- Icon indicators for each type

**Accessibility:**
- `role="alert"` for screen reader announcements
- `aria-live` for dynamic content updates
- `aria-atomic="true"` to read entire message
- Descriptive close button label

---

### LoadingSpinner

Animated loading indicator for async operations.

**Location:** `components/ui/LoadingSpinner.tsx`

**Props:**
```typescript
interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;  // Tailwind color class
  label?: string;  // Screen reader label
}
```

**Usage:**
```tsx
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

// Default (medium size, blue)
<LoadingSpinner />

// Large spinner
<LoadingSpinner size="large" />

// Custom color
<LoadingSpinner 
  color="text-green-600" 
  label="Loading courses" 
/>

// Small inline spinner
<button disabled>
  <LoadingSpinner size="small" />
  <span className="ml-2">Saving...</span>
</button>
```

**Features:**
- Three size options
- Customizable color
- Smooth animation
- Screen reader friendly

**Accessibility:**
- `role="status"` for loading state
- `aria-live="polite"` for non-intrusive updates
- Customizable aria-label for context

---

### Pagination

Navigation component for paginated content.

**Location:** `components/ui/Pagination.tsx`

**Props:**
```typescript
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  ariaLabel?: string;
}
```

**Usage:**
```tsx
import { Pagination } from '@/components/ui/Pagination';

<Pagination 
  currentPage={currentPage}
  totalPages={10}
  onPageChange={(page) => setCurrentPage(page)}
  ariaLabel="Course list pagination"
/>
```

**Features:**
- Smart page number display (shows first, last, and pages around current)
- Ellipsis for skipped pages
- Previous/Next buttons
- Disabled state for boundary pages
- Hides when only one page

**Accessibility:**
- `<nav>` semantic element
- `aria-label` for navigation context
- `aria-current="page"` for current page
- Disabled buttons have `aria-disabled`
- Keyboard navigable with proper focus states

---

### ProgressBar

Visual progress indicator.

**Location:** `components/ui/ProgressBar.tsx`

**Props:**
```typescript
interface ProgressBarProps {
  value: number;       // 0-100
  max?: number;        // Default: 100
  label?: string;
  showPercentage?: boolean;
  color?: string;
}
```

**Usage:**
```tsx
import { ProgressBar } from '@/components/ui/ProgressBar';

// Course completion
<ProgressBar 
  value={75} 
  label="Course Progress" 
  showPercentage 
/>

// Custom color
<ProgressBar 
  value={90} 
  label="Quiz Score" 
  color="bg-green-500" 
/>
```

**Features:**
- Smooth animations
- Percentage display option
- Customizable colors
- Responsive design

**Accessibility:**
- `role="progressbar"`
- `aria-valuenow`, `aria-valuemin`, `aria-valuemax`
- `aria-label` for context

---

## Course Components

### CourseCard

Display course information in a card format.

**Location:** `components/courses/CourseCard.tsx`

**Props:**
```typescript
interface CourseCardProps {
  course: {
    id: string;
    title: string;
    description: string;
    thumbnailUrl?: string;
    level: 'beginner' | 'intermediate' | 'advanced';
    duration: number;
    enrollmentCount?: number;
    rating?: number;
    instructor: {
      name: string;
    };
  };
  onEnroll?: () => void;
}
```

**Usage:**
```tsx
import { CourseCard } from '@/components/courses/CourseCard';

<CourseCard 
  course={courseData}
  onEnroll={() => handleEnroll(courseData.id)}
/>

// In a grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {courses.map(course => (
    <CourseCard key={course.id} course={course} />
  ))}
</div>
```

**Features:**
- Course thumbnail with fallback
- Level indicator badge
- Duration display
- Enrollment count
- Rating stars
- Instructor information
- Enroll button
- Hover effects

**Accessibility:**
- `<article>` semantic element
- `aria-labelledby` for card heading
- Descriptive image alt text
- Proper heading hierarchy

---

### FilterSidebar

Sidebar for filtering course listings.

**Location:** `components/courses/FilterSidebar.tsx`

**Props:**
```typescript
interface FilterSidebarProps {
  filters: {
    categories: string[];
    levels: string[];
    priceRanges: string[];
  };
  selectedFilters: {
    category?: string;
    level?: string;
    priceRange?: string;
  };
  onFilterChange: (filters: any) => void;
  onClearFilters: () => void;
}
```

**Usage:**
```tsx
import { FilterSidebar } from '@/components/courses/FilterSidebar';

<FilterSidebar 
  filters={{
    categories: ['Web Development', 'Data Science', 'Design'],
    levels: ['beginner', 'intermediate', 'advanced'],
    priceRanges: ['free', '$0-$50', '$50-$100', '$100+']
  }}
  selectedFilters={selectedFilters}
  onFilterChange={setFilters}
  onClearFilters={() => setFilters({})}
/>
```

**Features:**
- Collapsible sections
- Checkbox/radio selections
- Clear all filters button
- Active filter count badge
- Mobile responsive

---

### SearchBar

Search input with auto-complete suggestions.

**Location:** `components/courses/SearchBar.tsx`

**Props:**
```typescript
interface SearchBarProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  suggestions?: string[];
}
```

**Usage:**
```tsx
import { SearchBar } from '@/components/courses/SearchBar';

<SearchBar 
  placeholder="Search courses..."
  onSearch={(query) => fetchCourses(query)}
  suggestions={['JavaScript', 'Python', 'React']}
/>
```

**Features:**
- Debounced search input
- Auto-complete dropdown
- Keyboard navigation (arrow keys)
- Clear button
- Search icon

---

## Gamification Components

### BadgeCard

Display a single badge with details.

**Location:** `components/gamification/BadgeCard.tsx`

**Props:**
```typescript
interface BadgeCardProps {
  badge: {
    id: string;
    name: string;
    description: string;
    iconUrl: string;
    difficultyLevel: string;
    pointsAwarded: number;
  };
  earned?: boolean;
  progress?: number;
  onClick?: () => void;
}
```

**Usage:**
```tsx
import { BadgeCard } from '@/components/gamification/BadgeCard';

// Earned badge
<BadgeCard 
  badge={badgeData}
  earned={true}
/>

// Badge with progress
<BadgeCard 
  badge={badgeData}
  earned={false}
  progress={75}
  onClick={() => showBadgeDetails(badgeData.id)}
/>
```

**Features:**
- Visual distinction for earned vs locked badges
- Progress indicator for in-progress badges
- Difficulty level indicator
- Points display
- Hover effects
- Click to view details

---

### BadgeGrid

Grid layout for displaying multiple badges.

**Location:** `components/gamification/BadgeGrid.tsx`

**Props:**
```typescript
interface BadgeGridProps {
  badges: Badge[];
  userBadges: UserBadge[];
  onBadgeClick?: (badgeId: string) => void;
  filterCategory?: string;
}
```

**Usage:**
```tsx
import { BadgeGrid } from '@/components/gamification/BadgeGrid';

<BadgeGrid 
  badges={allBadges}
  userBadges={earnedBadges}
  onBadgeClick={showBadgeModal}
  filterCategory="learning"
/>
```

**Features:**
- Responsive grid layout
- Category filtering
- Earned/locked badge indication
- Progress tracking
- Empty state
- Loading state

**Accessibility:**
- `<section>` with heading
- Badge filter has `role="navigation"`
- `aria-pressed` on filter buttons
- Live region for filter updates

---

### LeaderboardTable

Display user rankings and points.

**Location:** `components/gamification/LeaderboardTable.tsx`

**Props:**
```typescript
interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  currentUserId?: string;
  period: 'all_time' | 'monthly' | 'weekly';
  onPeriodChange: (period: string) => void;
}
```

**Usage:**
```tsx
import { LeaderboardTable } from '@/components/gamification/LeaderboardTable';

<LeaderboardTable 
  entries={leaderboardData}
  currentUserId={user.id}
  period="all_time"
  onPeriodChange={setPeriod}
/>
```

**Features:**
- Rank display with medals for top 3
- User highlighting
- Period tabs (all time, monthly, weekly)
- Points and badges count
- Responsive design
- Scroll to current user

**Accessibility:**
- `<table>` with proper headers
- `scope="col"` on headers
- Row highlighting for current user
- Tab navigation for period selection
- `aria-label` throughout

---

### PointsCard

Display user's points summary.

**Location:** `components/gamification/PointsCard.tsx`

**Props:**
```typescript
interface PointsCardProps {
  totalPoints: number;
  todayPoints?: number;
  rank?: number;
  nextMilestone?: {
    points: number;
    badge: string;
  };
}
```

**Usage:**
```tsx
import { PointsCard } from '@/components/gamification/PointsCard';

<PointsCard 
  totalPoints={1250}
  todayPoints={35}
  rank={42}
  nextMilestone={{
    points: 1500,
    badge: 'Expert Learner'
  }}
/>
```

**Features:**
- Total points display
- Daily points indicator
- Current rank
- Next milestone preview
- Progress to next level
- Animated numbers

---

### GamificationDashboard

Comprehensive dashboard for gamification features.

**Location:** `components/gamification/GamificationDashboard.tsx`

**Props:**
```typescript
interface GamificationDashboardProps {
  userId: string;
}
```

**Usage:**
```tsx
import { GamificationDashboard } from '@/components/gamification/GamificationDashboard';

<GamificationDashboard userId={user.id} />
```

**Features:**
- Tab interface (Points, Badges, Achievements, Leaderboard)
- Real-time data fetching
- Loading states
- Error handling
- Responsive layout

**Sections:**
1. **Points Tab:**
   - Points summary
   - Points history with pagination
   - Activity breakdown

2. **Badges Tab:**
   - Earned badges
   - Badge progress
   - Badge categories

3. **Achievements Tab:**
   - Unlocked achievements
   - Achievement timeline
   - Available achievements

4. **Leaderboard Tab:**
   - Global rankings
   - Period filters
   - User rank indicator

**Accessibility:**
- ARIA tab pattern implementation
- `role="tablist"`, `role="tab"`, `role="tabpanel"`
- `aria-selected` on active tab
- `aria-controls` and `aria-labelledby` connections
- Keyboard navigation (Arrow keys, Home, End)

---

### StreakDisplay

Show learning streak information.

**Location:** `components/gamification/StreakDisplay.tsx`

**Props:**
```typescript
interface StreakDisplayProps {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string;
}
```

**Usage:**
```tsx
import { StreakDisplay } from '@/components/gamification/StreakDisplay';

<StreakDisplay 
  currentStreak={7}
  longestStreak={15}
  lastActivityDate="2024-01-21"
/>
```

**Features:**
- Current streak counter
- Longest streak record
- Streak maintenance indicator
- Motivational messages
- Fire emoji animation

---

## Patterns & Best Practices

### Component Structure

**Standard Component Template:**
```typescript
import React from 'react';

interface ComponentProps {
  // Props definition
}

export function Component({ prop1, prop2 }: ComponentProps) {
  // State and hooks
  const [state, setState] = useState();
  
  // Event handlers
  const handleEvent = () => {
    // Logic
  };
  
  // Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
}
```

### State Management

**Local State:**
```typescript
// Use useState for component-specific state
const [isOpen, setIsOpen] = useState(false);
```

**Global State:**
```typescript
// Use Context API for shared state
const { user } = useAuth();
```

### API Integration

**Fetching Data:**
```typescript
import { useEffect, useState } from 'react';
import api from '@/lib/api';

function Component() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/endpoint');
        setData(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  if (loading) return <LoadingSpinner />;
  if (error) return <Alert type="error" message={error} />;
  if (!data) return null;
  
  return <div>{/* Render data */}</div>;
}
```

### Error Handling

**Try-Catch Pattern:**
```typescript
const handleSubmit = async () => {
  try {
    setLoading(true);
    setError(null);
    
    const response = await api.post('/endpoint', data);
    
    setSuccess(true);
    // Handle success
  } catch (error) {
    setError(error.response?.data?.message || 'An error occurred');
  } finally {
    setLoading(false);
  }
};
```

### Form Handling

**Controlled Components:**
```typescript
function Form() {
  const [values, setValues] = useState({
    name: '',
    email: ''
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues({
      ...values,
      [e.target.name]: e.target.value
    });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Submit logic
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input 
        name="name" 
        value={values.name} 
        onChange={handleChange} 
      />
      <input 
        name="email" 
        value={values.email} 
        onChange={handleChange} 
      />
      <button type="submit">Submit</button>
    </form>
  );
}
```

---

## Accessibility Guidelines

All components follow WCAG 2.1 AA standards. See [ACCESSIBILITY_GUIDE.md](./ACCESSIBILITY_GUIDE.md) for complete guidelines.

### Key Requirements

1. **Semantic HTML:** Use appropriate HTML elements
2. **Keyboard Navigation:** All interactive elements accessible via keyboard
3. **Focus Management:** Visible focus indicators
4. **ARIA Attributes:** Use when semantic HTML isn't sufficient
5. **Color Contrast:** Minimum 4.5:1 for text
6. **Screen Readers:** Provide context with labels and descriptions

### Quick Reference

**Buttons:**
```tsx
<button 
  aria-label="Close dialog"
  onClick={handleClose}
>
  <X aria-hidden="true" />
</button>
```

**Forms:**
```tsx
<label htmlFor="email">
  Email Address
</label>
<input 
  id="email"
  type="email"
  aria-required="true"
  aria-invalid={hasError}
  aria-describedby={hasError ? "email-error" : undefined}
/>
{hasError && (
  <p id="email-error" role="alert">
    Please enter a valid email
  </p>
)}
```

**Dynamic Content:**
```tsx
<div 
  role="status" 
  aria-live="polite"
>
  {message}
</div>
```

---

## Styling Conventions

### Tailwind CSS

We use Tailwind CSS for styling. Follow these conventions:

**Responsive Design:**
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Mobile: 1 column, Tablet: 2 columns, Desktop: 3 columns */}
</div>
```

**Hover and Focus States:**
```tsx
<button className="bg-blue-600 hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2">
  Click me
</button>
```

**Dark Mode Support:**
```tsx
<div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
  Content
</div>
```

### Custom CSS

For complex styles, use CSS modules:

```css
/* Component.module.css */
.component {
  /* Custom styles */
}
```

```tsx
import styles from './Component.module.css';

<div className={styles.component}>
  Content
</div>
```

### Class Composition

Use `clsx` for conditional classes:

```tsx
import clsx from 'clsx';

<div className={clsx(
  'base-class',
  isActive && 'active-class',
  'another-class'
)}>
  Content
</div>
```

---

## Testing Components

### Unit Tests

```typescript
// Component.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Component } from './Component';

describe('Component', () => {
  it('renders correctly', () => {
    render(<Component />);
    expect(screen.getByText('Content')).toBeInTheDocument();
  });
  
  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<Component onClick={handleClick} />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

---

## Contributing

When creating new components:

1. **Follow existing patterns** in component structure
2. **Include TypeScript types** for all props
3. **Add accessibility features** (ARIA, semantic HTML)
4. **Make responsive** (mobile-first approach)
5. **Document props and usage** in this file
6. **Write tests** for component behavior
7. **Follow naming conventions** (PascalCase for components)

---

## Additional Resources

- **Accessibility Guide:** [ACCESSIBILITY_GUIDE.md](./ACCESSIBILITY_GUIDE.md)
- **Tailwind Docs:** [tailwindcss.com](https://tailwindcss.com)
- **React Docs:** [react.dev](https://react.dev)
- **Next.js Docs:** [nextjs.org/docs](https://nextjs.org/docs)
- **ARIA Patterns:** [w3.org/WAI/ARIA](https://www.w3.org/WAI/ARIA/apg/)

---

Last Updated: 2024-01-21
