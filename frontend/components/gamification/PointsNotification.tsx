import React, { useEffect, useState } from 'react';
import { X, CheckCircle2, TrendingUp } from 'lucide-react';

interface PointsNotificationProps {
  show: boolean;
  points: number;
  activityType: string;
  description?: string;
  onClose: () => void;
  autoDismiss?: boolean;
}

type ActivityType = 'course' | 'quiz' | 'assignment' | 'discussion' | 'streak' | 'login';

export function PointsNotification({
  show,
  points,
  activityType,
  description,
  onClose,
  autoDismiss = true
}: PointsNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const activityIcons: Record<ActivityType, { icon: string; emoji: string }> = {
    course: { icon: '📚', emoji: '📚' },
    quiz: { icon: '🎯', emoji: '🎯' },
    assignment: { icon: '✍️', emoji: '✍️' },
    discussion: { icon: '💬', emoji: '💬' },
    streak: { icon: '🔥', emoji: '🔥' },
    login: { icon: '👋', emoji: '👋' }
  };

  const getActivityDescription = (type: string): string => {
    if (description) return description;

    const descriptions: Record<string, string> = {
      course: 'Lesson completed!',
      quiz: 'Quiz completed!',
      assignment: 'Assignment submitted!',
      discussion: 'Discussion posted!',
      streak: 'Streak bonus earned!',
      login: 'Daily login bonus!'
    };

    return descriptions[type] || 'Points earned!';
  };

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      setIsExiting(false);

      // Play notification sound if available
      try {
        const audio = new Audio('/sounds/points-earned.mp3');
        audio.volume = 0.3;
        audio.play().catch(() => {
          // Ignore audio play errors
        });
      } catch {
        // Ignore audio errors
      }

      if (autoDismiss) {
        const timer = setTimeout(() => {
          handleClose();
        }, 4000);

        return () => clearTimeout(timer);
      }
    }
  }, [show, autoDismiss]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 300);
  };

  if (!isVisible) return null;

  const activityInfo = activityIcons[activityType as ActivityType] || { icon: '⭐', emoji: '⭐' };

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 transition-all duration-300 ${
        isExiting ? 'translate-y-4 opacity-0' : 'translate-y-0 opacity-100'
      }`}
      role="alert"
      aria-live="polite"
    >
      <div className="bg-white rounded-lg shadow-2xl border-l-4 border-yellow-500 p-4 min-w-[320px] max-w-sm animate-pulse">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Content */}
        <div className="flex items-center gap-3">
          {/* Icon */}
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-2xl">
              {activityInfo.emoji}
            </div>
          </div>

          {/* Text Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <span className="text-sm font-semibold text-gray-900">
                +{points.toLocaleString()} Points
              </span>
            </div>
            <p className="text-sm text-gray-600">
              {getActivityDescription(activityType)}
            </p>
          </div>

          {/* Trending Icon */}
          <div className="flex-shrink-0">
            <div className="bg-green-100 rounded-full p-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-3 h-1 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all duration-[4000ms] ease-linear"
            style={{ width: isExiting ? '0%' : '100%' }}
          />
        </div>
      </div>
    </div>
  );
}
