import React from 'react';
import { Award, TrendingUp, Lock } from 'lucide-react';

interface Badge {
  id: string;
  name: string;
  icon: string | null;
  criteria_type: string;
  criteria_value: number;
  description: string;
}

interface BadgeProgressBarProps {
  badge: Badge;
  currentValue: number;
  criteriaValue?: number;
  showIcon?: boolean;
  compact?: boolean;
}

export function BadgeProgressBar({
  badge,
  currentValue,
  criteriaValue,
  showIcon = true,
  compact = false
}: BadgeProgressBarProps) {
  const requiredValue = criteriaValue || badge.criteria_value;
  const percentage = Math.min((currentValue / requiredValue) * 100, 100);
  const isComplete = currentValue >= requiredValue;

  const getProgressColor = (percentage: number): string => {
    if (percentage >= 100) return 'from-green-400 to-green-600';
    if (percentage >= 75) return 'from-green-300 to-green-500';
    if (percentage >= 50) return 'from-yellow-400 to-yellow-600';
    if (percentage >= 25) return 'from-orange-400 to-orange-600';
    return 'from-gray-400 to-gray-600';
  };

  const getProgressText = (percentage: number): string => {
    if (percentage >= 100) return 'Ready to unlock!';
    if (percentage >= 75) return 'Almost there!';
    if (percentage >= 50) return 'Halfway there!';
    if (percentage >= 25) return 'Making progress!';
    return 'Just started';
  };

  const getCriteriaDescription = (type: string, value: number): string => {
    const descriptions: Record<string, string> = {
      courses_completed: `Complete ${value} courses`,
      quiz_score: `Score ${value}%+ on quiz`,
      streak_days: `${value} day streak`,
      lessons_completed: `Complete ${value} lessons`,
      assignments_completed: `Complete ${value} assignments`,
      discussion_posts: `Make ${value} discussion posts`,
      quiz_perfect_score: `Get perfect score on ${value} quizzes`,
      course_speed: `Complete course in ${value} days or less`
    };
    return descriptions[type] || badge.description;
  };

  const progressColor = getProgressColor(percentage);
  const progressText = getProgressText(percentage);

  if (compact) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {showIcon && (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center text-sm">
                {badge.icon ? (
                  <img src={badge.icon} alt={badge.name} className="w-6 h-6" />
                ) : (
                  '🏅'
                )}
              </div>
            )}
            <span className="text-sm font-medium text-gray-900 line-clamp-1">
              {badge.name}
            </span>
          </div>
          <div className="text-sm text-gray-600">
            <span className={isComplete ? 'text-green-600 font-semibold' : ''}>
              {currentValue}
            </span>
            {' '}/ {requiredValue}
          </div>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`
              h-full bg-gradient-to-r transition-all duration-500 ease-out
              ${progressColor}
            `}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        {/* Badge Icon */}
        {showIcon && (
          <div className="flex-shrink-0">
            {badge.icon ? (
              <img
                src={badge.icon}
                alt={badge.name}
                className="w-16 h-16 object-contain"
              />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center text-3xl">
                🏅
              </div>
            )}
          </div>
        )}

        {/* Badge Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-lg mb-1">
            {badge.name}
          </h3>
          <p className="text-sm text-gray-600 mb-2">
            {getCriteriaDescription(badge.criteria_type, requiredValue)}
          </p>
          {isComplete ? (
            <div className="flex items-center gap-1 text-green-600 font-medium">
              <Award className="w-4 h-4" />
              <span>Ready to earn!</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-gray-500 text-sm">
              <Lock className="w-4 h-4" />
              <span>Keep working to unlock</span>
            </div>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">
            Progress
          </span>
          <span className="text-lg font-bold text-gray-900">
            {currentValue} <span className="text-gray-400">/</span>{' '}
            <span className="text-gray-600">{requiredValue}</span>
          </span>
        </div>

        <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`
              h-full bg-gradient-to-r transition-all duration-700 ease-out
              ${progressColor}
            `}
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Percentage and Status */}
        <div className="flex justify-between items-center text-sm">
          <span className="font-semibold text-gray-900">
            {percentage.toFixed(0)}% complete
          </span>
          <span className="text-gray-600">
            {progressText}
          </span>
        </div>

        {/* Activity Type Icon */}
        <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <TrendingUp className="w-4 h-4" />
            <span>{requiredValue - currentValue} more to go</span>
          </div>
        </div>
      </div>

      {/* Complete Indicator */}
      {isComplete && (
        <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center gap-2 text-green-800">
            <Award className="w-5 h-5" />
            <span className="font-semibold">You've met the criteria!</span>
          </div>
        </div>
      )}
    </div>
  );
}
