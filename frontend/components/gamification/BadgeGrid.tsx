import React, { useState, useMemo } from 'react';
import { BadgeCard } from './BadgeCard';
import { Filter, ArrowUpDown } from 'lucide-react';

interface BadgeProgress {
  current: number;
  required: number;
  percentage: number;
}

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

interface UserBadge {
  badge_id: string;
  earned_at: string;
}

interface BadgeGridProps {
  badges: Badge[];
  userBadges?: UserBadge[];
  onBadgeClick?: (badge: Badge) => void;
  showProgress?: boolean;
  progressData?: Record<string, BadgeProgress>;
  itemsPerPage?: number;
}

type FilterType = 'all' | 'achievement' | 'milestone' | 'skill' | 'social';
type SortType = 'name' | 'difficulty' | 'points' | 'earned';

export function BadgeGrid({
  badges,
  userBadges = [],
  onBadgeClick,
  showProgress = false,
  progressData = {},
  itemsPerPage = 12
}: BadgeGridProps) {
  const [filter, setFilter] = useState<FilterType>('all');
  const [sort, setSort] = useState<SortType>('difficulty');
  const [page, setPage] = useState(1);
  const [showEarnedOnly, setShowEarnedOnly] = useState(false);

  const earnedBadgeIds = new Set(userBadges.map((ub) => ub.badge_id));

  const filteredAndSortedBadges = useMemo(() => {
    let result = [...badges];

    // Filter by category
    if (filter !== 'all') {
      result = result.filter(
        (badge) => badge.category.name.toLowerCase() === filter
      );
    }

    // Filter by earned status
    if (showEarnedOnly) {
      result = result.filter((badge) => earnedBadgeIds.has(badge.id));
    }

    // Sort
    result.sort((a, b) => {
      switch (sort) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'difficulty':
          const difficultyOrder = { platinum: 0, gold: 1, silver: 2, bronze: 3 };
          return difficultyOrder[a.difficulty_level] - difficultyOrder[b.difficulty_level];
        case 'points':
          return b.points - a.points;
        case 'earned':
          const aEarned = earnedBadgeIds.has(a.id);
          const bEarned = earnedBadgeIds.has(b.id);
          if (aEarned && !bEarned) return -1;
          if (!aEarned && bEarned) return 1;
          return 0;
        default:
          return 0;
      }
    });

    return result;
  }, [badges, filter, sort, earnedBadgeIds, showEarnedOnly]);

  const totalPages = Math.ceil(filteredAndSortedBadges.length / itemsPerPage);
  const paginatedBadges = filteredAndSortedBadges.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const handleBadgeClick = (badge: Badge) => {
    if (onBadgeClick) {
      onBadgeClick(badge);
    }
  };

  const getBadgeProgress = (badgeId: string): BadgeProgress | undefined => {
    return progressData[badgeId];
  };

  const getUserBadgeData = (badgeId: string) => {
    const userBadge = userBadges.find((ub) => ub.badge_id === badgeId);
    return userBadge;
  };

  return (
    <div className="space-y-6">
      {/* Filters and Sort */}
      <section className="bg-white rounded-lg shadow-md p-4" aria-labelledby="badge-filter-heading">
        <h2 id="badge-filter-heading" className="sr-only">Filter and sort badges</h2>
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          {/* Category Filter */}
          <nav className="flex flex-wrap gap-2" aria-label="Badge categories">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500`}
              aria-current={filter === 'all' ? 'page' : undefined}
              aria-pressed={filter === 'all'}
            >
              All
            </button>
            <button
              onClick={() => setFilter('achievement')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filter === 'achievement'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500`}
              aria-current={filter === 'achievement' ? 'page' : undefined}
              aria-pressed={filter === 'achievement'}
            >
              Achievement
            </button>
            <button
              onClick={() => setFilter('milestone')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filter === 'milestone'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500`}
              aria-current={filter === 'milestone' ? 'page' : undefined}
              aria-pressed={filter === 'milestone'}
            >
              Milestone
            </button>
            <button
              onClick={() => setFilter('skill')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filter === 'skill'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500`}
              aria-current={filter === 'skill' ? 'page' : undefined}
              aria-pressed={filter === 'skill'}
            >
              Skill
            </button>
            <button
              onClick={() => setFilter('social')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filter === 'social'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500`}
              aria-current={filter === 'social' ? 'page' : undefined}
              aria-pressed={filter === 'social'}
            >
              Social
            </button>
          </nav>

          {/* Sort and Earned Toggle */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4 text-gray-500" aria-hidden="true" />
              <label htmlFor="badge-sort" className="sr-only">Sort badges</label>
              <select
                id="badge-sort"
                value={sort}
                onChange={(e) => setSort(e.target.value as SortType)}
                className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
              >
                <option value="difficulty">Difficulty</option>
                <option value="name">Name</option>
                <option value="points">Points</option>
                <option value="earned">Earned</option>
              </select>
            </div>

            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={showEarnedOnly}
                onChange={(e) => setShowEarnedOnly(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
                aria-label="Show earned badges only"
              />
              Earned Only
            </label>
          </div>
        </div>

        {/* Results Count */}
        <p className="mt-3 text-sm text-gray-600" aria-live="polite">
          Showing {paginatedBadges.length} of {filteredAndSortedBadges.length} badges
        </p>
      </section>

      {/* Badge Grid */}
      {paginatedBadges.length > 0 ? (
        <section
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          aria-label={`Badges grid, ${paginatedBadges.length} badges`}
        >
          {paginatedBadges.map((badge) => (
            <BadgeCard
              key={badge.id}
              badge={badge}
              earned={earnedBadgeIds.has(badge.id)}
              earnedDate={getUserBadgeData(badge.id)?.earned_at}
              progress={showProgress ? getBadgeProgress(badge.id) : undefined}
              onClick={() => handleBadgeClick(badge)}
            />
          ))}
        </section>
      ) : (
        <div className="text-center py-12" role="status">
          <Filter className="w-16 h-16 mx-auto text-gray-300 mb-4" aria-hidden="true" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No badges found
          </h3>
          <p className="text-gray-600">
            Try adjusting your filters to see more badges.
          </p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <nav
          className="flex justify-center items-center gap-2"
          role="navigation"
          aria-label="Badge grid pagination"
        >
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
            aria-label="Go to previous page"
            aria-disabled={page === 1}
          >
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
            <button
              key={pageNum}
              onClick={() => setPage(pageNum)}
              className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                page === pageNum
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500`}
              aria-label={`Go to page ${pageNum}`}
              aria-current={page === pageNum ? 'page' : undefined}
            >
              {pageNum}
            </button>
          ))}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
            aria-label="Go to next page"
            aria-disabled={page === totalPages}
          >
            Next
          </button>
        </nav>
      )}
    </div>
  );
}
