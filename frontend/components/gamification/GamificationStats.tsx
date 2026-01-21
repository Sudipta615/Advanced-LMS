import React from 'react';
import { Trophy, Flame, Award, Target, BookOpen, Clock, TrendingUp, Star } from 'lucide-react';

interface GamificationStatsProps {
  stats: {
    totalPointsEarned: number;
    totalBadgesEarned: number;
    totalAchievementsUnlocked: number;
    currentRank: number;
    currentStreak: number;
    favoriteBadge?: {
      name: string;
      icon: string | null;
      points: number;
    };
    mostActiveCourse?: {
      id: string;
      title: string;
      lessonsCompleted: number;
      timeSpent: number;
    };
    timeSpentLearning?: number; // in minutes
    averagePointsPerDay?: number;
    percentile?: number;
  };
}

export function GamificationStats({
  stats
}: GamificationStatsProps) {
  const formatTime = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  const getRankColor = (rank: number): string => {
    if (rank <= 10) return 'text-yellow-600';
    if (rank <= 50) return 'text-orange-500';
    if (rank <= 100) return 'text-blue-600';
    return 'text-gray-600';
  };

  const getStreakColor = (streak: number): string => {
    if (streak >= 30) return 'text-purple-600';
    if (streak >= 14) return 'text-orange-500';
    if (streak >= 7) return 'text-yellow-600';
    return 'text-blue-600';
  };

  const getPercentileColor = (percentile: number): string => {
    if (percentile >= 90) return 'text-green-600';
    if (percentile >= 70) return 'text-blue-600';
    if (percentile >= 50) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const statCards = [
    {
      icon: <Trophy className="w-6 h-6 text-yellow-500" />,
      label: 'Total Points',
      value: stats.totalPointsEarned.toLocaleString(),
      color: 'from-yellow-50 to-orange-50',
      borderColor: 'border-yellow-200'
    },
    {
      icon: <Award className="w-6 h-6 text-purple-500" />,
      label: 'Badges Earned',
      value: stats.totalBadgesEarned,
      color: 'from-purple-50 to-blue-50',
      borderColor: 'border-purple-200'
    },
    {
      icon: <Flame className="w-6 h-6 text-orange-500" />,
      label: 'Current Streak',
      value: `${stats.currentStreak} days`,
      color: 'from-orange-50 to-red-50',
      borderColor: 'border-orange-200',
      textColor: getStreakColor(stats.currentStreak)
    },
    {
      icon: <Target className="w-6 h-6 text-blue-500" />,
      label: 'Current Rank',
      value: `#${stats.currentRank}`,
      color: 'from-blue-50 to-indigo-50',
      borderColor: 'border-blue-200',
      textColor: getRankColor(stats.currentRank)
    }
  ];

  const secondaryStats = [
    {
      icon: <Star className="w-5 h-5 text-green-500" />,
      label: 'Achievements Unlocked',
      value: stats.totalAchievementsUnlocked
    },
    {
      icon: <TrendingUp className="w-5 h-5 text-blue-500" />,
      label: 'Avg Points / Day',
      value: stats.averagePointsPerDay ? stats.averagePointsPerDay.toLocaleString() : 'N/A'
    },
    {
      icon: <Clock className="w-5 h-5 text-purple-500" />,
      label: 'Time Spent Learning',
      value: stats.timeSpentLearning ? formatTime(stats.timeSpentLearning) : 'N/A'
    },
    {
      icon: <Trophy className="w-5 h-5 text-yellow-500" />,
      label: 'Percentile',
      value: stats.percentile ? `Top ${stats.percentile}%` : 'N/A',
      textColor: stats.percentile ? getPercentileColor(stats.percentile) : 'text-gray-600'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Gamification Statistics</h2>
        <p className="text-gray-600">
          Your learning journey at a glance.
        </p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, index) => (
          <div
            key={index}
            className={`
              bg-gradient-to-br ${card.color} rounded-xl border-2 ${card.borderColor}
              p-5 shadow-md hover:shadow-lg transition-shadow duration-300
            `}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                {card.icon}
              </div>
            </div>
            <div className={`text-3xl font-bold ${card.textColor || 'text-gray-900'} mb-1`}>
              {card.value}
            </div>
            <div className="text-sm text-gray-600">
              {card.label}
            </div>
          </div>
        ))}
      </div>

      {/* Secondary Stats */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Additional Statistics
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {secondaryStats.map((stat, index) => (
            <div
              key={index}
              className="bg-gray-50 rounded-lg p-4 text-center hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                {stat.icon}
              </div>
              <div className={`text-2xl font-bold ${stat.textColor || 'text-gray-900'} mb-1`}>
                {stat.value}
              </div>
              <div className="text-xs text-gray-600">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Favorite Badge */}
      {stats.favoriteBadge && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            Favorite Badge
          </h3>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-xl bg-white shadow-lg flex items-center justify-center text-4xl">
              {stats.favoriteBadge.icon ? (
                <img
                  src={stats.favoriteBadge.icon}
                  alt={stats.favoriteBadge.name}
                  className="w-16 h-16 object-contain"
                />
              ) : (
                '🏅'
              )}
            </div>
            <div className="flex-1">
              <h4 className="text-xl font-bold text-gray-900 mb-1">
                {stats.favoriteBadge.name}
              </h4>
              <div className="flex items-center gap-2 text-yellow-600 font-medium">
                <span>⭐</span>
                <span>{stats.favoriteBadge.points} points</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Most Active Course */}
      {stats.mostActiveCourse && (
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-500" />
            Most Active Course
          </h3>
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 rounded-xl bg-white shadow-lg flex items-center justify-center">
              <BookOpen className="w-10 h-10 text-blue-500" />
            </div>
            <div className="flex-1">
              <h4 className="text-xl font-bold text-gray-900 mb-2">
                {stats.mostActiveCourse.title}
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600">Lessons Completed</div>
                  <div className="text-lg font-semibold text-blue-600">
                    {stats.mostActiveCourse.lessonsCompleted}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Time Spent</div>
                  <div className="text-lg font-semibold text-purple-600">
                    {formatTime(stats.mostActiveCourse.timeSpent)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Performance Insights */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-green-800 font-medium mb-2">
              <Trophy className="w-5 h-5" />
              <span>Strengths</span>
            </div>
            <ul className="space-y-1 text-sm text-green-700">
              <li>• Strong point accumulation rate</li>
              <li>• Consistent learning streak</li>
              <li>• Active badge collection</li>
            </ul>
          </div>
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-blue-800 font-medium mb-2">
              <Target className="w-5 h-5" />
              <span>Goals</span>
            </div>
            <ul className="space-y-1 text-sm text-blue-700">
              <li>• Continue building streak</li>
              <li>• Complete more achievements</li>
              <li>• Climb the leaderboard</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
