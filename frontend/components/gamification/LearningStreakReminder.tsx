import React from 'react';
import { Flame, AlertCircle, TrendingUp, BookOpen } from 'lucide-react';

interface LearningStreakReminderProps {
  currentStreak: number;
  nextMilestone: number;
  daysUntilReset?: number;
  isAtRisk?: boolean;
  onContinueLearning?: () => void;
}

export function LearningStreakReminder({
  currentStreak,
  nextMilestone,
  daysUntilReset,
  isAtRisk = false,
  onContinueLearning
}: LearningStreakReminderProps) {
  const getStreakMessage = (streak: number): string => {
    if (streak === 0) return 'Start your learning journey today!';
    if (streak < 7) return 'You\'re building momentum!';
    if (streak < 14) return 'Great consistency!';
    if (streak < 30) return 'Amazing dedication!';
    return 'Legendary status!';
  };

  const getEncouragementMessage = (streak: number, atRisk: boolean): string => {
    if (atRisk) {
      return 'Don\'t let the fire die out! Complete a lesson today to keep your streak going.';
    }
    if (streak === 0) {
      return 'Start learning today and begin your streak!';
    }
    if (streak < 7) {
      return 'Keep going! You\'re doing great!';
    }
    if (streak < 14) {
      return 'You\'re on fire! 🔥 Keep the momentum going!';
    }
    if (streak < 30) {
      return 'Incredible dedication! You\'re almost at the next milestone!';
    }
    return 'You\'re unstoppable! Keep up the amazing work!';
  };

  const getStreakIntensity = (streak: number, atRisk: boolean): string => {
    if (atRisk) return 'text-red-600';
    if (streak >= 30) return 'text-purple-600';
    if (streak >= 14) return 'text-orange-500';
    if (streak >= 7) return 'text-yellow-600';
    return 'text-blue-600';
  };

  const getIntensityBg = (streak: number, atRisk: boolean): string => {
    if (atRisk) return 'bg-red-50 border-red-200';
    if (streak >= 30) return 'bg-purple-50 border-purple-200';
    if (streak >= 14) return 'bg-orange-50 border-orange-200';
    if (streak >= 7) return 'bg-yellow-50 border-yellow-200';
    return 'bg-blue-50 border-blue-200';
  };

  const streakColor = getStreakIntensity(currentStreak, isAtRisk);
  const intensityBg = getIntensityBg(currentStreak, isAtRisk);
  const daysToNextMilestone = nextMilestone - currentStreak;

  return (
    <div
      className={`
        rounded-xl border-2 p-6 transition-all duration-300
        ${intensityBg}
        ${isAtRisk ? 'animate-pulse' : ''}
      `}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className={`
              p-3 rounded-xl
              ${isAtRisk
                ? 'bg-red-100 text-red-600'
                : 'bg-gradient-to-br from-orange-400 to-red-500 text-white'
              }
              ${isAtRisk ? 'animate-pulse' : ''}
            `}
          >
            <Flame className={`w-8 h-8 ${isAtRisk ? '' : ''}`} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              {currentStreak} Day Streak!
            </h3>
            <p className="text-sm text-gray-600">
              {getStreakMessage(currentStreak)}
            </p>
          </div>
        </div>

        {isAtRisk && (
          <div className="flex items-center gap-1 text-red-600 bg-red-100 px-3 py-1.5 rounded-full text-sm font-medium">
            <AlertCircle className="w-4 h-4" />
            <span>At Risk</span>
          </div>
        )}
      </div>

      {/* Warning or Encouragement */}
      <div className={`p-4 rounded-lg mb-4 ${isAtRisk ? 'bg-red-50' : 'bg-white/50'}`}>
        {isAtRisk ? (
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-800 font-semibold mb-1">
                  Your streak is at risk!
                </p>
                <p className="text-red-700 text-sm">
                  {daysUntilReset !== undefined && daysUntilReset > 0
                    ? `You have ${daysUntilReset} day${daysUntilReset > 1 ? 's' : ''} left to complete a lesson.`
                    : 'Complete a lesson today to keep your streak alive!'}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <TrendingUp className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-green-800 font-semibold">
                  Keep up the great work!
                </p>
                <p className="text-green-700 text-sm">
                  {getEncouragementMessage(currentStreak, isAtRisk)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Next Milestone */}
      <div className="bg-white/60 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Next Milestone
          </span>
          <span className={`text-sm font-bold ${streakColor}`}>
            {nextMilestone} Days
          </span>
        </div>
        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
          <span>{currentStreak} / {nextMilestone}</span>
          <span>{daysToNextMilestone} days to go</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`
              h-full bg-gradient-to-r transition-all duration-700 ease-out
              ${isAtRisk
                ? 'from-red-400 to-red-600'
                : currentStreak >= 14
                  ? 'from-purple-400 to-purple-600'
                  : currentStreak >= 7
                    ? 'from-orange-400 to-orange-600'
                    : 'from-blue-400 to-blue-600'
              }
            `}
            style={{ width: `${Math.min((currentStreak / nextMilestone) * 100, 100)}%` }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-white/60 rounded-lg p-3">
          <div className={`text-2xl font-bold ${streakColor}`}>
            {currentStreak * 10}
          </div>
          <div className="text-xs text-gray-600">Streak Points</div>
        </div>
        <div className="bg-white/60 rounded-lg p-3">
          <div className="text-2xl font-bold text-yellow-600">
            {Math.round((currentStreak / 30) * 100)}%
          </div>
          <div className="text-xs text-gray-600">Month Progress</div>
        </div>
      </div>

      {/* CTA Button */}
      <button
        onClick={onContinueLearning}
        className={`
          w-full py-3 px-4 rounded-lg font-semibold flex items-center justify-center gap-2
          transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]
          ${isAtRisk
            ? 'bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-200'
            : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-blue-200'
          }
        `}
      >
        <BookOpen className="w-5 h-5" />
        {isAtRisk ? 'Save My Streak!' : 'Continue Learning'}
      </button>

      {/* Extra Encouragement */}
      {!isAtRisk && currentStreak > 0 && (
        <p className="text-center text-sm text-gray-600 mt-3">
          You've maintained your streak for {currentStreak} {currentStreak === 1 ? 'day' : 'days'}! 🎉
        </p>
      )}
    </div>
  );
}
