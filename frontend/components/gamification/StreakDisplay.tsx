import React, { useState, useEffect } from 'react';
import { Flame, TrendingUp, Calendar, Award } from 'lucide-react';

interface StreakDisplayProps {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate?: string;
  nextMilestone?: number;
  pointsPerDay?: number;
}

export function StreakDisplay({
  currentStreak,
  longestStreak,
  lastActivityDate,
  nextMilestone = 30,
  pointsPerDay = 10
}: StreakDisplayProps) {
  const [animateFlame, setAnimateFlame] = useState(false);

  useEffect(() => {
    setAnimateFlame(true);
    const timer = setTimeout(() => setAnimateFlame(false), 500);
    return () => clearTimeout(timer);
  }, [currentStreak]);

  const getStreakIntensity = (streak: number): { color: string; bg: string } => {
    if (streak >= 30) return { color: 'text-red-600', bg: 'bg-red-50' };
    if (streak >= 14) return { color: 'text-orange-500', bg: 'bg-orange-50' };
    if (streak >= 7) return { color: 'text-yellow-600', bg: 'bg-yellow-50' };
    return { color: 'text-blue-600', bg: 'bg-blue-50' };
  };

  const intensity = getStreakIntensity(currentStreak);

  const getDaysUntilReset = (): number | null => {
    if (!lastActivityDate) return null;
    const lastDate = new Date(lastActivityDate);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, 2 - diffDays); // Assuming 2-day grace period
  };

  const daysUntilReset = getDaysUntilReset();
  const isAtRisk = daysUntilReset !== null && daysUntilReset <= 1;

  const getNextMilestone = (): number => {
    if (currentStreak >= 30) return 60;
    if (currentStreak >= 14) return 30;
    if (currentStreak >= 7) return 14;
    return 7;
  };

  const milestone = getNextMilestone();
  const progress = Math.min((currentStreak / milestone) * 100, 100);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div
      className={`bg-white rounded-xl shadow-lg p-6 transition-all duration-300 ${
        isAtRisk ? 'ring-2 ring-red-400' : ''
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Flame className={`w-8 h-8 ${intensity.color}`} />
          Learning Streak
        </h2>
        {isAtRisk && (
          <div className="flex items-center gap-1 text-red-600 bg-red-50 px-3 py-1 rounded-full text-sm font-medium animate-pulse">
            <span>⚠️</span>
            <span>At Risk!</span>
          </div>
        )}
      </div>

      {/* Current Streak Display */}
      <div
        className={`
          relative ${intensity.bg} rounded-xl p-8 mb-6 text-center
          ${animateFlame ? 'animate-pulse' : ''}
        `}
      >
        {/* Flame Icon */}
        <div className="mb-4">
          <Flame
            className={`
              w-24 h-24 mx-auto ${intensity.color}
              ${animateFlame ? 'scale-110 transition-transform' : ''}
            `}
          />
        </div>

        {/* Streak Count */}
        <div className="text-6xl font-bold text-gray-900 mb-2">
          {currentStreak}
        </div>
        <div className="text-xl text-gray-700 font-medium">
          Day Streak!
        </div>

        {/* Streak Message */}
        <div className="mt-3 text-sm text-gray-600">
          {currentStreak === 0 && 'Start your learning journey today!'}
          {currentStreak > 0 && currentStreak < 7 && 'You\'re on fire! Keep it up!'}
          {currentStreak >= 7 && currentStreak < 14 && 'Great consistency! 🔥'}
          {currentStreak >= 14 && currentStreak < 30 && 'Amazing dedication! 🌟'}
          {currentStreak >= 30 && 'Legendary status! 🏆'}
        </div>
      </div>

      {/* Streak Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Longest Streak */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-2 text-gray-600 mb-2">
            <Award className="w-5 h-5" />
            <span className="text-sm font-medium">Best Streak</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {longestStreak} days
          </div>
        </div>

        {/* Points from Streaks */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-2 text-gray-600 mb-2">
            <TrendingUp className="w-5 h-5" />
            <span className="text-sm font-medium">Streak Points</span>
          </div>
          <div className="text-2xl font-bold text-yellow-600">
            +{(currentStreak * pointsPerDay).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Milestone Progress */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">
            Next Milestone: {milestone} Days
          </span>
          <span className="text-sm text-gray-600">
            {currentStreak} / {milestone}
          </span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`
              h-full bg-gradient-to-r from-blue-400 to-purple-500
              transition-all duration-700 ease-out
            `}
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {milestone - currentStreak > 0
            ? `${milestone - currentStreak} days to go!`
            : 'Milestone achieved! 🎉'}
        </div>
      </div>

      {/* Last Activity & Warning */}
      <div className="space-y-3">
        {lastActivityDate && (
          <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
            <Calendar className="w-4 h-4" />
            <span>Last activity: {formatDate(lastActivityDate)}</span>
          </div>
        )}

        {isAtRisk && daysUntilReset !== null && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-red-800 font-medium mb-1">
              <span>⚠️</span>
              <span>Streak at risk!</span>
            </div>
            <p className="text-sm text-red-700">
              {daysUntilReset === 0
                ? 'Complete a lesson today to maintain your streak!'
                : `You have ${daysUntilReset} day${daysUntilReset > 1 ? 's' : ''} left to keep your streak alive.`}
            </p>
          </div>
        )}

        {!isAtRisk && currentStreak > 0 && daysUntilReset !== null && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-green-800 font-medium">
              <span>✅</span>
              <span>Streak is safe! Keep it going!</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
