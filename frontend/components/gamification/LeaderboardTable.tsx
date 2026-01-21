import React, { useState, useMemo } from 'react';
import { Trophy, Medal, ArrowUp, ArrowDown, Minus, User } from 'lucide-react';

interface LeaderboardEntry {
  rank: number;
  user_id: string;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
  total_points: number;
  badges_count: number;
  courses_completed: number;
  rank_change?: number;
}

interface LeaderboardTableProps {
  leaderboard: LeaderboardEntry[];
  period?: 'all_time' | 'monthly' | 'weekly';
  userRank?: number;
  userId?: string;
  onPageChange?: (page: number) => void;
  itemsPerPage?: number;
}

export function LeaderboardTable({
  leaderboard,
  period = 'all_time',
  userRank,
  userId,
  onPageChange,
  itemsPerPage = 10
}: LeaderboardTableProps) {
  const [page, setPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<'rank' | 'points' | 'badges' | 'courses'>('rank');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const sortedLeaderboard = useMemo(() => {
    const sorted = [...leaderboard];
    sorted.sort((a, b) => {
      let comparison = 0;
      switch (sortColumn) {
        case 'rank':
          comparison = a.rank - b.rank;
          break;
        case 'points':
          comparison = a.total_points - b.total_points;
          break;
        case 'badges':
          comparison = a.badges_count - b.badges_count;
          break;
        case 'courses':
          comparison = a.courses_completed - b.courses_completed;
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    return sorted;
  }, [leaderboard, sortColumn, sortDirection]);

  const totalPages = Math.ceil(sortedLeaderboard.length / itemsPerPage);
  const paginatedLeaderboard = sortedLeaderboard.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const handleSort = (column: 'rank' | 'points' | 'badges' | 'courses') => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };

  const getRankDisplay = (rank: number): React.ReactNode => {
    if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Medal className="w-6 h-6 text-amber-700" />;
    return <span className="text-lg font-bold text-gray-700">#{rank}</span>;
  };

  const getRankChange = (change?: number): React.ReactNode => {
    if (change === undefined || change === 0) {
      return <Minus className="w-4 h-4 text-gray-400" />;
    }
    if (change > 0) {
      return (
        <div className="flex items-center text-green-600">
          <ArrowUp className="w-4 h-4" />
          <span className="text-sm font-medium">{change}</span>
        </div>
      );
    }
    return (
      <div className="flex items-center text-red-600">
        <ArrowDown className="w-4 h-4" />
        <span className="text-sm font-medium">{Math.abs(change)}</span>
      </div>
    );
  };

  const getPeriodLabel = () => {
    switch (period) {
      case 'all_time':
        return 'All Time';
      case 'monthly':
        return 'Monthly';
      case 'weekly':
        return 'Weekly';
      default:
        return 'All Time';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Trophy className="w-8 h-8" aria-hidden="true" />
              Leaderboard
            </h2>
            <p className="text-blue-100 mt-1">{getPeriodLabel()} Rankings</p>
          </div>
          {userRank && (
            <div className="bg-white/20 rounded-lg px-4 py-2">
              <div className="text-blue-100 text-sm">Your Rank</div>
              <div className="text-2xl font-bold text-white">#{userRank}</div>
            </div>
          )}
        </div>
      </header>

      {/* Table */}
      <div className="overflow-x-auto">
        <table
          className="w-full"
          role="grid"
          aria-label={`${getPeriodLabel()} Leaderboard`}
        >
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th scope="col" className="px-6 py-4 text-left">
                <button
                  onClick={() => handleSort('rank')}
                  className="flex items-center gap-2 font-semibold text-gray-700 hover:text-blue-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
                  aria-label={`Sort by rank ${sortColumn === 'rank' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : ''}`}
                >
                  Rank
                  {sortColumn === 'rank' && (
                    <span className="text-blue-600" aria-hidden="true">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </button>
              </th>
              <th scope="col" className="px-6 py-4 text-left font-semibold text-gray-700">
                User
              </th>
              <th scope="col" className="px-6 py-4 text-left">
                <button
                  onClick={() => handleSort('points')}
                  className="flex items-center gap-2 font-semibold text-gray-700 hover:text-blue-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
                  aria-label={`Sort by points ${sortColumn === 'points' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : ''}`}
                >
                  Points
                  {sortColumn === 'points' && (
                    <span className="text-blue-600" aria-hidden="true">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </button>
              </th>
              <th scope="col" className="px-6 py-4 text-left">
                <button
                  onClick={() => handleSort('badges')}
                  className="flex items-center gap-2 font-semibold text-gray-700 hover:text-blue-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
                  aria-label={`Sort by badges ${sortColumn === 'badges' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : ''}`}
                >
                  Badges
                  {sortColumn === 'badges' && (
                    <span className="text-blue-600" aria-hidden="true">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </button>
              </th>
              <th scope="col" className="px-6 py-4 text-left">
                <button
                  onClick={() => handleSort('courses')}
                  className="flex items-center gap-2 font-semibold text-gray-700 hover:text-blue-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
                  aria-label={`Sort by courses ${sortColumn === 'courses' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : ''}`}
                >
                  Courses
                  {sortColumn === 'courses' && (
                    <span className="text-blue-600" aria-hidden="true">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </button>
              </th>
              <th scope="col" className="px-6 py-4 text-center font-semibold text-gray-700">
                Change
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedLeaderboard.map((entry) => (
              <tr
                key={entry.user_id}
                className={`
                  border-b border-gray-100 transition-colors hover:bg-gray-50
                  ${entry.user_id === userId ? 'bg-blue-50 hover:bg-blue-100' : ''}
                `}
              >
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center w-10 h-10" aria-label={`Rank ${entry.rank}`}>
                    {getRankDisplay(entry.rank)}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {entry.avatar_url ? (
                      <img
                        src={entry.avatar_url}
                        alt={`${entry.first_name} ${entry.last_name}`}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div
                        className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold"
                        aria-hidden="true"
                      >
                        {entry.first_name[0]}{entry.last_name[0]}
                      </div>
                    )}
                    <div>
                      <div className="font-medium text-gray-900">
                        {entry.first_name} {entry.last_name}
                        {entry.user_id === userId && (
                          <span className="ml-2 text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">
                            You
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-lg font-bold text-yellow-600" aria-label={`${entry.total_points.toLocaleString()} points`}>
                    {entry.total_points.toLocaleString()}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className="text-lg" aria-hidden="true">🏆</span>
                    <span className="font-semibold text-gray-900" aria-label={`${entry.badges_count} badges`}>
                      {entry.badges_count}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="font-semibold text-gray-900" aria-label={`${entry.courses_completed} courses`}>
                    {entry.courses_completed}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-center" aria-label={`Rank change ${entry.rank_change !== undefined ? (entry.rank_change > 0 ? `up ${entry.rank_change}` : entry.rank_change < 0 ? `down ${Math.abs(entry.rank_change)}` : 'no change') : 'not available'}`}>
                    {getRankChange(entry.rank_change)}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {(page - 1) * itemsPerPage + 1} to{' '}
              {Math.min(page * itemsPerPage, sortedLeaderboard.length)} of{' '}
              {sortedLeaderboard.length} entries
            </div>
            <nav
              className="flex items-center gap-2"
              role="navigation"
              aria-label="Leaderboard pagination"
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
                );
              })}
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
          </div>
        </div>
      )}
    </div>
  );
}
