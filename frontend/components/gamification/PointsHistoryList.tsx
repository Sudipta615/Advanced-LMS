import React, { useState } from 'react';
import { Search, Filter, Calendar, Award, BookOpen, MessageSquare, Flame } from 'lucide-react';

interface PointsHistoryEntry {
  id: string;
  activity_type: 'course_completion' | 'quiz' | 'assignment' | 'discussion' | 'streak_bonus' | 'login' | 'lesson_completion';
  description: string;
  points: number;
  timestamp: string;
  resource_id?: string;
  resource_type?: string;
}

interface PointsHistoryListProps {
  history: PointsHistoryEntry[];
  total: number;
  page: number;
  onPageChange: (page: number) => void;
  itemsPerPage?: number;
}

type FilterType = 'all' | 'course_completion' | 'quiz' | 'assignment' | 'discussion' | 'streak_bonus' | 'login' | 'lesson_completion';

export function PointsHistoryList({
  history,
  total,
  page,
  onPageChange,
  itemsPerPage = 10
}: PointsHistoryListProps) {
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  const getActivityIcon = (type: string): { icon: React.ReactNode; color: string } => {
    const icons: Record<string, { icon: React.ReactNode; color: string }> = {
      course_completion: { icon: <BookOpen className="w-5 h-5" />, color: 'bg-blue-100 text-blue-600' },
      quiz: { icon: <Award className="w-5 h-5" />, color: 'bg-green-100 text-green-600' },
      assignment: { icon: <BookOpen className="w-5 h-5" />, color: 'bg-purple-100 text-purple-600' },
      discussion: { icon: <MessageSquare className="w-5 h-5" />, color: 'bg-orange-100 text-orange-600' },
      streak_bonus: { icon: <Flame className="w-5 h-5" />, color: 'bg-red-100 text-red-600' },
      login: { icon: <Calendar className="w-5 h-5" />, color: 'bg-gray-100 text-gray-600' },
      lesson_completion: { icon: <BookOpen className="w-5 h-5" />, color: 'bg-teal-100 text-teal-600' }
    };
    return icons[type] || { icon: <Award className="w-5 h-5" />, color: 'bg-gray-100 text-gray-600' };
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(dateString);
  };

  // Filter and sort history
  const filteredHistory = history
    .filter((entry) => {
      if (filter !== 'all' && entry.activity_type !== filter) return false;
      if (searchQuery && !entry.description.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      const dateA = new Date(a.timestamp).getTime();
      const dateB = new Date(b.timestamp).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);
  const paginatedHistory = filteredHistory.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const filterOptions = [
    { id: 'all' as FilterType, label: 'All Activities' },
    { id: 'course_completion' as FilterType, label: 'Course Completion' },
    { id: 'quiz' as FilterType, label: 'Quizzes' },
    { id: 'assignment' as FilterType, label: 'Assignments' },
    { id: 'discussion' as FilterType, label: 'Discussions' },
    { id: 'streak_bonus' as FilterType, label: 'Streak Bonuses' },
    { id: 'login' as FilterType, label: 'Daily Login' },
    { id: 'lesson_completion' as FilterType, label: 'Lessons' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Points History</h2>
        <p className="text-gray-600">
          Track all the points you've earned through your learning activities.
        </p>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search activities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filter and Sort */}
          <div className="flex items-center gap-3">
            {/* Activity Type Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as FilterType)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {filterOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Order */}
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div className="mt-3 text-sm text-gray-600">
          Showing {paginatedHistory.length} of {filteredHistory.length} entries
          {filteredHistory.length !== total && ` (filtered from ${total})`}
        </div>
      </div>

      {/* Points History List */}
      {paginatedHistory.length > 0 ? (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden md:block">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Activity
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Description
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                    Points
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedHistory.map((entry) => {
                  const { icon, color } = getActivityIcon(entry.activity_type);
                  return (
                    <tr
                      key={entry.id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${color}`}>
                          {icon}
                          <span className="font-medium capitalize">
                            {entry.activity_type.replace(/_/g, ' ')}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-gray-900">{entry.description}</p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="text-lg font-bold text-yellow-600">
                          +{entry.points.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600">
                          <div>{formatDate(entry.timestamp)}</div>
                          <div className="text-xs text-gray-400">{formatTime(entry.timestamp)}</div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile List */}
          <div className="md:hidden">
            {paginatedHistory.map((entry) => {
              const { icon, color } = getActivityIcon(entry.activity_type);
              return (
                <div
                  key={entry.id}
                  className="p-4 border-b border-gray-100"
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${color} flex-shrink-0`}>
                      {icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-900 capitalize mb-1">
                        {entry.activity_type.replace(/_/g, ' ')}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{entry.description}</p>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">{formatTimeAgo(entry.timestamp)}</span>
                        <span className="font-bold text-yellow-600">
                          +{entry.points}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Page {page} of {totalPages}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onPageChange(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (page <= 3) {
                      pageNum = i + 1;
                    } else if (page >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = page - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => onPageChange(pageNum)}
                        className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                          page === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => onPageChange(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <Search className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No entries found
          </h3>
          <p className="text-gray-600">
            Try adjusting your filters or search query.
          </p>
        </div>
      )}

      {/* Summary Stats */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600">
              {filteredHistory.reduce((sum, entry) => sum + entry.points, 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Total Points Shown</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">
              {filteredHistory.length}
            </div>
            <div className="text-sm text-gray-600">Activities</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">
              {filteredHistory.length > 0
                ? Math.round(filteredHistory.reduce((sum, entry) => sum + entry.points, 0) / filteredHistory.length)
                : 0}
            </div>
            <div className="text-sm text-gray-600">Avg Points</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-600">
              {total}
            </div>
            <div className="text-sm text-gray-600">Total Entries</div>
          </div>
        </div>
      </div>
    </div>
  );
}
