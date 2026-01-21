import React from 'react';
import { Trophy, TrendingUp, TrendingDown, Award, Target } from 'lucide-react';

interface RankComparison {
  rank: number;
  totalUsers: number;
  percentile: number;
  points: number;
  averagePoints: number;
  aboveAverage: boolean;
}

interface Neighbor {
  rank: number;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
  total_points: number;
}

interface LeaderboardRankProps {
  userRank: number;
  comparison: RankComparison;
  period?: 'all_time' | 'monthly' | 'weekly';
  neighbors?: {
    above?: Neighbor;
    below?: Neighbor;
  };
  milestones?: number[];
}

export function LeaderboardRank({
  userRank,
  comparison,
  period = 'all_time',
  neighbors,
  milestones = [10, 50, 100, 500, 1000]
}: LeaderboardRankProps) {
  const getRankColor = (rank: number): string => {
    if (rank <= 10) return 'text-yellow-600';
    if (rank <= 50) return 'text-orange-500';
    if (rank <= 100) return 'text-blue-600';
    return 'text-gray-600';
  };

  const getRankBadge = (rank: number): string => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    if (rank <= 10) return '⭐';
    if (rank <= 50) return '🌟';
    if (rank <= 100) return '✨';
    return '';
  };

  const getPerformanceClass = (aboveAverage: boolean): string => {
    return aboveAverage
      ? 'bg-green-50 border-green-200'
      : 'bg-red-50 border-red-200';
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

  const earnedMilestones = milestones.filter((m) => userRank <= m);

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Trophy className="w-6 h-6" />
              Your Ranking
            </h2>
            <p className="text-blue-100 text-sm mt-1">{getPeriodLabel()}</p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold text-white">
              #{userRank}
            </div>
            <div className="text-blue-100 text-sm">
              of {comparison.totalUsers.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Main Stats */}
      <div className="p-6 space-y-4">
        {/* Percentile Badge */}
        <div className={`
          rounded-lg p-4 border-2
          ${getPerformanceClass(comparison.aboveAverage)}
        `}>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600 mb-1">Performance</div>
              <div className="text-2xl font-bold text-gray-900">
                Top {comparison.percentile}%
              </div>
            </div>
            {comparison.aboveAverage ? (
              <TrendingUp className="w-10 h-10 text-green-600" />
            ) : (
              <TrendingDown className="w-10 h-10 text-red-600" />
            )}
          </div>
          <div className="mt-2 text-sm">
            {comparison.aboveAverage ? (
              <span className="text-green-700">
                You're performing better than {comparison.percentile}% of users!
              </span>
            ) : (
              <span className="text-red-700">
                Keep learning to climb the rankings!
              </span>
            )}
          </div>
        </div>

        {/* Points Comparison */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Your Points</div>
            <div className="text-2xl font-bold text-yellow-600">
              {comparison.points.toLocaleString()}
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Average</div>
            <div className="text-2xl font-bold text-gray-600">
              {comparison.averagePoints.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Rank Badge */}
        {getRankBadge(userRank) && (
          <div className="flex items-center gap-2 bg-yellow-50 rounded-lg p-4">
            <div className="text-3xl">{getRankBadge(userRank)}</div>
            <div>
              <div className="font-semibold text-gray-900">
                {userRank <= 3 ? 'Top 3' : userRank <= 10 ? 'Top 10' : userRank <= 100 ? 'Top 100' : 'Achievement'}
              </div>
              <div className="text-sm text-gray-600">
                You're in the elite!
              </div>
            </div>
          </div>
        )}

        {/* Milestones */}
        {milestones.length > 0 && (
          <div>
            <div className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Target className="w-4 h-4" />
              Milestones Achieved
            </div>
            <div className="flex flex-wrap gap-2">
              {milestones.map((milestone) => (
                <div
                  key={milestone}
                  className={`
                    px-3 py-1.5 rounded-full text-sm font-medium
                    ${userRank <= milestone
                      ? 'bg-green-100 text-green-700 border border-green-300'
                      : 'bg-gray-100 text-gray-400 border border-gray-200'
                    }
                  `}
                >
                  Top {milestone}
                  {userRank <= milestone && <Award className="inline w-4 h-4 ml-1" />}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Neighbors */}
        {neighbors && (neighbors.above || neighbors.below) && (
          <div>
            <div className="text-sm font-semibold text-gray-700 mb-3">
              Nearby Rankings
            </div>
            <div className="space-y-2">
              {neighbors.above && (
                <div className="flex items-center gap-3 bg-blue-50 rounded-lg p-3">
                  <div className="text-sm font-semibold text-blue-600 w-12">
                    #{neighbors.above.rank}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">
                      {neighbors.above.first_name} {neighbors.above.last_name}
                    </div>
                    <div className="text-xs text-gray-600">
                      {neighbors.above.total_points.toLocaleString()} points
                    </div>
                  </div>
                  <TrendingUp className="w-5 h-5 text-blue-500" />
                </div>
              )}

              {neighbors.below && (
                <div className="flex items-center gap-3 bg-purple-50 rounded-lg p-3">
                  <div className="text-sm font-semibold text-purple-600 w-12">
                    #{neighbors.below.rank}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">
                      {neighbors.below.first_name} {neighbors.below.last_name}
                    </div>
                    <div className="text-xs text-gray-600">
                      {neighbors.below.total_points.toLocaleString()} points
                    </div>
                  </div>
                  <TrendingDown className="w-5 h-5 text-purple-500" />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Points to next rank */}
        {neighbors?.above && (
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">
              Points needed to reach rank #{neighbors.above.rank}
            </div>
            <div className="text-2xl font-bold text-orange-600">
              {(neighbors.above.total_points - comparison.points).toLocaleString()} pts
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
