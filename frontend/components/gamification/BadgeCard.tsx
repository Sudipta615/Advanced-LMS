import React from 'react';
import { CheckCircle2, Lock } from 'lucide-react';

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
    name: string;
    color: string;
    icon: string;
  };
}

interface BadgeCardProps {
  badge: Badge;
  earned?: boolean;
  earnedDate?: string;
  progress?: BadgeProgress;
  onClick?: () => void;
}

export function BadgeCard({
  badge,
  earned = false,
  earnedDate,
  progress,
  onClick
}: BadgeCardProps) {
  const difficultyColors = {
    bronze: {
      bg: 'bg-amber-100',
      border: 'border-amber-300',
      text: 'text-amber-700',
      glow: 'hover:shadow-amber-200'
    },
    silver: {
      bg: 'bg-gray-100',
      border: 'border-gray-300',
      text: 'text-gray-700',
      glow: 'hover:shadow-gray-200'
    },
    gold: {
      bg: 'bg-yellow-100',
      border: 'border-yellow-400',
      text: 'text-yellow-700',
      glow: 'hover:shadow-yellow-200'
    },
    platinum: {
      bg: 'bg-slate-100',
      border: 'border-slate-300',
      text: 'text-slate-700',
      glow: 'hover:shadow-slate-200'
    }
  };

  const difficulty = difficultyColors[badge.difficulty_level];
  const isClickable = onClick !== undefined;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const CardWrapper = isClickable ? 'button' : 'div';
  const wrapperProps = isClickable
    ? { onClick, className: 'w-full text-left' }
    : { className: 'w-full' };

  return (
    <CardWrapper
      {...wrapperProps}
      className={`
        bg-white rounded-xl shadow-md overflow-hidden
        transition-all duration-300
        ${!earned ? 'opacity-70 grayscale' : ''}
        ${isClickable ? 'cursor-pointer hover:scale-105 hover:shadow-xl' : ''}
        ${difficulty.glow}
      `}
    >
      {/* Badge Icon Section */}
      <div className={`relative h-32 ${difficulty.bg} flex items-center justify-center`}>
        {earned && (
          <div className="absolute top-2 right-2">
            <CheckCircle2 className="w-6 h-6 text-green-500" fill="currentColor" />
          </div>
        )}
        {!earned && (
          <div className="absolute top-2 right-2">
            <Lock className="w-5 h-5 text-gray-400" />
          </div>
        )}
        {badge.icon ? (
          <img
            src={badge.icon}
            alt={badge.name}
            className="w-20 h-20 object-contain"
          />
        ) : (
          <div
            className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl ${difficulty.text}`}
            style={{ backgroundColor: badge.category.color }}
          >
            {badge.category.icon}
          </div>
        )}
      </div>

      {/* Badge Info */}
      <div className={`p-4 border-t-2 ${difficulty.border}`}>
        {/* Category Badge */}
        <div className="flex items-center gap-2 mb-2">
          <span
            className="text-xs px-2 py-1 rounded-full text-white font-medium"
            style={{ backgroundColor: badge.category.color }}
          >
            {badge.category.icon} {badge.category.name}
          </span>
          <span
            className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${difficulty.bg} ${difficulty.text}`}
          >
            {badge.difficulty_level}
          </span>
        </div>

        {/* Badge Name */}
        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">
          {badge.name}
        </h3>

        {/* Points */}
        <div className="flex items-center gap-1 text-sm text-yellow-600 font-medium mb-2">
          <span>⭐</span>
          <span>{badge.points} points</span>
        </div>

        {/* Progress or Earned Date */}
        {earned ? (
          <div className="text-xs text-green-600 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Earned on {earnedDate ? formatDate(earnedDate) : 'Unknown'}
          </div>
        ) : progress ? (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-gray-600">
              <span>Progress</span>
              <span>
                {progress.current} / {progress.required}
              </span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-500`}
                style={{ width: `${Math.min(progress.percentage, 100)}%` }}
              />
            </div>
            <div className="text-xs text-gray-500 text-center">
              {progress.percentage >= 100
                ? 'Ready to unlock!'
                : `${progress.percentage.toFixed(0)}% to unlock`}
            </div>
          </div>
        ) : (
          <div className="text-xs text-gray-500 italic">
            {progress?.current || 0} / {badge.criteria_value} to unlock
          </div>
        )}
      </div>
    </CardWrapper>
  );
}
