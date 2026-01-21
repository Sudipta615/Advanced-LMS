import React, { useState } from 'react';
import { Lock, Unlock, Info } from 'lucide-react';

interface Achievement {
  id: string;
  name: string;
  description: string;
  achievement_type: string;
  icon: string | null;
  data: any;
}

interface AchievementCardProps {
  achievement: Achievement;
  unlocked?: boolean;
  unlockedAt?: string;
  onClick?: () => void;
}

export function AchievementCard({
  achievement,
  unlocked = false,
  unlockedAt,
  onClick
}: AchievementCardProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  const achievementIcons: Record<string, string> = {
    first_course: '🚀',
    first_quiz_passed: '🎯',
    first_assignment_submitted: '📝',
    course_completed: '🎓',
    perfect_quiz: '💯',
    streak_master: '🔥',
    discussion_participant: '💬',
    all_courses_completed: '🏆'
  };

  const icon = achievement.icon || achievementIcons[achievement.achievement_type] || '⭐';

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  const CardWrapper = onClick ? 'button' : 'div';
  const wrapperProps = onClick
    ? {
        onClick: handleClick,
        className: 'w-full text-left',
        'aria-label': achievement.name
      }
    : { className: 'w-full' };

  return (
    <CardWrapper
      {...wrapperProps}
      className={`
        relative bg-white rounded-xl shadow-md overflow-hidden
        transition-all duration-300
        ${unlocked ? 'hover:shadow-xl hover:scale-105' : 'opacity-60 grayscale'}
        ${onClick ? 'cursor-pointer' : ''}
      `}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* Status Bar */}
      <div
        className={`h-1 ${
          unlocked ? 'bg-gradient-to-r from-green-400 to-green-600' : 'bg-gray-300'
        }`}
      />

      <div className="p-5">
        {/* Icon and Status */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-14 h-14 rounded-xl flex items-center justify-center text-3xl ${
                unlocked
                  ? 'bg-gradient-to-br from-green-100 to-green-200'
                  : 'bg-gray-100'
              }`}
            >
              {icon}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-lg">
                {achievement.name}
              </h3>
              <div className="flex items-center gap-1 text-sm">
                {unlocked ? (
                  <>
                    <Unlock className="w-4 h-4 text-green-600" />
                    <span className="text-green-600 font-medium">Unlocked</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-400">Locked</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Info Icon */}
          {onClick && (
            <Info className="w-5 h-5 text-gray-400 hover:text-blue-600 transition-colors" />
          )}
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {achievement.description}
        </p>

        {/* Additional Info */}
        {unlocked && unlockedAt ? (
          <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg">
            <Unlock className="w-4 h-4" />
            <span>Unlocked on {formatDate(unlockedAt)}</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 px-3 py-2 rounded-lg">
            <Lock className="w-4 h-4" />
            <span>Complete the required activities to unlock</span>
          </div>
        )}
      </div>

      {/* Tooltip */}
      {showTooltip && onClick && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 bg-gray-900 text-white text-sm rounded-lg p-3 shadow-xl z-10">
          <div className="font-semibold mb-1">{achievement.name}</div>
          <div className="text-gray-300 text-xs">{achievement.description}</div>
          {/* Arrow */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-3 h-3 bg-gray-900" />
        </div>
      )}
    </CardWrapper>
  );
}
