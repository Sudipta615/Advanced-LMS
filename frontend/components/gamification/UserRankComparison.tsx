import React from 'react';
import { Trophy, Award, TrendingUp, Flame, Target } from 'lucide-react';

interface RankInfo {
  rank: number;
  totalUsers: number;
  percentile: number;
  change?: number;
}

interface UserRankComparisonProps {
  userId: string;
  courseId?: string;
  globalRank: RankInfo;
  courseRank?: RankInfo;
  streakRank?: RankInfo;
  pointsRank?: RankInfo;
  badgesRank?: RankInfo;
}

export function UserRankComparison({
  userId,
  courseId,
  globalRank,
  courseRank,
  streakRank,
  pointsRank,
  badgesRank
}: UserRankComparisonProps) {
  const getRankColor = (rank: number, total: number): string => {
    const percentile = (rank / total) * 100;
    if (percentile <= 10) return 'text-yellow-600';
    if (percentile <= 25) return 'text-orange-500';
    if (percentile <= 50) return 'text-blue-600';
    return 'text-gray-600';
  };

  const getRankBg = (rank: number, total: number): string => {
    const percentile = (rank / total) * 100;
    if (percentile <= 10) return 'bg-yellow-50 border-yellow-200';
    if (percentile <= 25) return 'bg-orange-50 border-orange-200';
    if (percentile <= 50) return 'bg-blue-50 border-blue-200';
    return 'bg-gray-50 border-gray-200';
  };

  const getPerformanceIndicator = (rank: number, total: number): 'excellent' | 'good' | 'average' | 'improving' => {
    const percentile = (rank / total) * 100;
    if (percentile <= 10) return 'excellent';
    if (percentile <= 25) return 'good';
    if (percentile <= 50) return 'average';
    return 'improving';
  };

  const getPerformanceText = (performance: string): string => {
    switch (performance) {
      case 'excellent':
        return 'Outstanding!';
      case 'good':
        return 'Great job!';
      case 'average':
        return 'Keep going!';
      case 'improving':
        return 'Room to grow';
    }
  };

  const getPerformanceColor = (performance: string): string => {
    switch (performance) {
      case 'excellent':
        return 'text-green-600 bg-green-100';
      case 'good':
        return 'text-blue-600 bg-blue-100';
      case 'average':
        return 'text-yellow-600 bg-yellow-100';
      case 'improving':
        return 'text-gray-600 bg-gray-100';
    }
  };

  const renderRankCard = (
    title: string,
    icon: React.ReactNode,
    rankInfo: RankInfo | undefined,
    isPrimary: boolean = false
  ) => {
    if (!rankInfo) return null;

    const performance = getPerformanceIndicator(rankInfo.rank, rankInfo.totalUsers);
    const performanceColor = getPerformanceColor(performance);

    return (
      <div
        className={`
          rounded-xl border-2 p-5 transition-all duration-300
          ${isPrimary ? 'shadow-lg scale-105' : 'shadow-md hover:shadow-lg'}
          ${getRankBg(rankInfo.rank, rankInfo.totalUsers)}
        `}
      >
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <div className={`p-2 rounded-lg ${performanceColor.split(' ')[1]}`}>
            {icon}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">{title}</h3>
          </div>
        </div>

        {/* Rank Display */}
        <div className="flex items-baseline gap-2 mb-2">
          <span className={`text-3xl font-bold ${getRankColor(rankInfo.rank, rankInfo.totalUsers)}`}>
            #{rankInfo.rank}
          </span>
          <span className="text-sm text-gray-500">
            of {rankInfo.totalUsers.toLocaleString()}
          </span>
        </div>

        {/* Percentile */}
        <div className="mb-3">
          <div className="flex justify-between items-center text-sm mb-1">
            <span className="text-gray-600">Percentile</span>
            <span className={`font-semibold ${getRankColor(rankInfo.rank, rankInfo.totalUsers)}`}>
              Top {rankInfo.percentile}%
            </span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`
                h-full transition-all duration-700 ease-out
                ${performance === 'excellent' ? 'bg-green-500' :
                  performance === 'good' ? 'bg-blue-500' :
                  performance === 'average' ? 'bg-yellow-500' : 'bg-gray-500'
                }
              `}
              style={{ width: `${100 - rankInfo.percentile}%` }}
            />
          </div>
        </div>

        {/* Performance Indicator */}
        <div className={`text-sm font-medium ${performanceColor.split(' ')[0]} flex items-center gap-1`}>
          {performance === 'excellent' && '🏆'}
          {performance === 'good' && '⭐'}
          {performance === 'average' && '📈'}
          {performance === 'improving' && '💪'}
          {getPerformanceText(performance)}
        </div>

        {/* Rank Change */}
        {rankInfo.change !== undefined && (
          <div className="mt-2 flex items-center gap-1 text-sm">
            {rankInfo.change > 0 ? (
              <span className="text-green-600">
                ↑ {rankInfo.change}
              </span>
            ) : rankInfo.change < 0 ? (
              <span className="text-red-600">
                ↓ {Math.abs(rankInfo.change)}
              </span>
            ) : (
              <span className="text-gray-400">
                →
              </span>
            )}
            <span className="text-gray-500">
              from last period
            </span>
          </div>
        )}
      </div>
    );
  };

  const ranks = [
    { title: 'Global', icon: <Trophy className="w-5 h-5 text-yellow-600" />, info: globalRank, isPrimary: true },
    { title: 'Points', icon: <TrendingUp className="w-5 h-5 text-blue-600" />, info: pointsRank },
    { title: 'Badges', icon: <Award className="w-5 h-5 text-purple-600" />, info: badgesRank },
    { title: 'Streak', icon: <Flame className="w-5 h-5 text-orange-600" />, info: streakRank },
    ...(courseId ? [{ title: 'Course', icon: <Target className="w-5 h-5 text-green-600" />, info: courseRank }] : [])
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Rankings</h2>
        <p className="text-gray-600">
          Compare your performance across different categories.
        </p>
      </div>

      {/* Ranks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ranks.map((rank) => (
          <div key={rank.title}>
            {renderRankCard(rank.title, rank.icon, rank.info, rank.isPrimary)}
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Target className="w-6 h-6 text-purple-600" />
          Performance Summary
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {globalRank.percentile}%
            </div>
            <div className="text-sm text-gray-600">Global Percentile</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {ranks.filter(r => r.info && getPerformanceIndicator(r.info.rank, r.info.totalUsers) === 'excellent').length}
            </div>
            <div className="text-sm text-gray-600">Top 10%</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {pointsRank ? `#${pointsRank.rank}` : '-'}
            </div>
            <div className="text-sm text-gray-600">Points Rank</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {badgesRank ? `#${badgesRank.rank}` : '-'}
            </div>
            <div className="text-sm text-gray-600">Badges Rank</div>
          </div>
        </div>
      </div>

      {/* Improvement Tips */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Tips to Improve Rankings</h3>
        <ul className="space-y-3">
          <li className="flex items-start gap-2 text-gray-600">
            <span className="text-green-500 mt-0.5">✓</span>
            <span>Complete lessons and courses daily to maintain your streak</span>
          </li>
          <li className="flex items-start gap-2 text-gray-600">
            <span className="text-green-500 mt-0.5">✓</span>
            <span>Participate in quizzes and assignments to earn more points</span>
          </li>
          <li className="flex items-start gap-2 text-gray-600">
            <span className="text-green-500 mt-0.5">✓</span>
            <span>Engage in discussions to earn bonus points and social badges</span>
          </li>
          <li className="flex items-start gap-2 text-gray-600">
            <span className="text-green-500 mt-0.5">✓</span>
            <span>Aim for perfect quiz scores to unlock achievement badges</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
