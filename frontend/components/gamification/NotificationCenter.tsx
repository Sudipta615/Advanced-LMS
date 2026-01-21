import React, { useEffect, useState } from 'react';
import { X, Award, Trophy, Flame, CheckCircle2 } from 'lucide-react';

export type NotificationType = 'points' | 'badge' | 'achievement';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  points?: number;
  badgeName?: string;
  achievementName?: string;
  timestamp: string;
  read?: boolean;
}

interface NotificationCenterProps {
  notifications: Notification[];
  onDismiss?: (id: string) => void;
  onRead?: (id: string) => void;
  autoDismiss?: boolean;
  autoDismissDelay?: number;
}

export function NotificationCenter({
  notifications,
  onDismiss,
  onRead,
  autoDismiss = true,
  autoDismissDelay = 5000
}: NotificationCenterProps) {
  const [visibleNotifications, setVisibleNotifications] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Mark all new notifications as visible
    const newVisible = new Set(visibleNotifications);
    notifications.forEach((n) => newVisible.add(n.id));
    setVisibleNotifications(newVisible);

    // Auto-dismiss notifications
    if (autoDismiss) {
      notifications.forEach((notification) => {
        if (!notification.read) {
          const timer = setTimeout(() => {
            handleDismiss(notification.id);
          }, autoDismissDelay);

          return () => clearTimeout(timer);
        }
      });
    }
  }, [notifications, autoDismiss, autoDismissDelay]);

  const handleDismiss = (id: string) => {
    setVisibleNotifications((prev) => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
    onDismiss?.(id);
  };

  const handleRead = (id: string) => {
    onRead?.(id);
  };

  const getNotificationIcon = (notification: Notification): React.ReactNode => {
    switch (notification.type) {
      case 'points':
        return <Flame className="w-6 h-6" />;
      case 'badge':
        return <Award className="w-6 h-6" />;
      case 'achievement':
        return <Trophy className="w-6 h-6" />;
      default:
        return <CheckCircle2 className="w-6 h-6" />;
    }
  };

  const getNotificationColors = (type: NotificationType): { bg: string; border: string; iconBg: string } => {
    switch (type) {
      case 'points':
        return {
          bg: 'bg-gradient-to-r from-yellow-50 to-orange-50',
          border: 'border-yellow-200',
          iconBg: 'bg-yellow-100 text-yellow-600'
        };
      case 'badge':
        return {
          bg: 'bg-gradient-to-r from-purple-50 to-blue-50',
          border: 'border-purple-200',
          iconBg: 'bg-purple-100 text-purple-600'
        };
      case 'achievement':
        return {
          bg: 'bg-gradient-to-r from-green-50 to-teal-50',
          border: 'border-green-200',
          iconBg: 'bg-green-100 text-green-600'
        };
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          iconBg: 'bg-gray-100 text-gray-600'
        };
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-3 max-w-md w-full pointer-events-none">
      {notifications.map((notification) => {
        if (!visibleNotifications.has(notification.id)) return null;

        const colors = getNotificationColors(notification.type);
        const icon = getNotificationIcon(notification);

        return (
          <div
            key={notification.id}
            className={`
              pointer-events-auto bg-white rounded-xl shadow-2xl border-l-4 ${colors.border}
              transform transition-all duration-300
              animate-slide-in-right
            `}
            style={{
              animation: 'slideInRight 0.3s ease-out'
            }}
            role="alert"
            aria-live="polite"
          >
            <div className={`p-4 ${colors.bg}`}>
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {/* Icon */}
                  <div className={`p-2 rounded-lg ${colors.iconBg} flex-shrink-0`}>
                    {icon}
                  </div>

                  {/* Title and Time */}
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm">
                      {notification.title}
                    </h4>
                    <span className="text-xs text-gray-500">
                      {formatTimeAgo(notification.timestamp)}
                    </span>
                  </div>
                </div>

                {/* Close Button */}
                <button
                  onClick={() => handleDismiss(notification.id)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-white/50 rounded-lg"
                  aria-label="Dismiss notification"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Message */}
              <p className="text-sm text-gray-700 mb-3">
                {notification.message}
              </p>

              {/* Additional Info */}
              {notification.points && (
                <div className="flex items-center gap-2 text-sm font-semibold text-yellow-600 mb-2">
                  <Flame className="w-4 h-4" />
                  <span>+{notification.points.toLocaleString()} points</span>
                </div>
              )}

              {notification.badgeName && (
                <div className="flex items-center gap-2 text-sm font-semibold text-purple-600 mb-2">
                  <Award className="w-4 h-4" />
                  <span>{notification.badgeName}</span>
                </div>
              )}

              {notification.achievementName && (
                <div className="flex items-center gap-2 text-sm font-semibold text-green-600 mb-2">
                  <Trophy className="w-4 h-4" />
                  <span>{notification.achievementName}</span>
                </div>
              )}

              {/* Mark as Read */}
              {!notification.read && onRead && (
                <button
                  onClick={() => handleRead(notification.id)}
                  className="w-full mt-2 py-2 px-3 bg-white/60 hover:bg-white/80 rounded-lg text-sm font-medium text-gray-700 transition-colors"
                >
                  Mark as Read
                </button>
              )}
            </div>

            {/* Progress Bar for Auto-Dismiss */}
            {autoDismiss && !notification.read && (
              <div className="h-1 bg-gray-100 rounded-b-xl overflow-hidden">
                <div
                  className={`
                    h-full bg-gradient-to-r transition-all duration-[5000ms] ease-linear
                    ${notification.type === 'points'
                      ? 'from-yellow-400 to-orange-500'
                      : notification.type === 'badge'
                        ? 'from-purple-400 to-blue-500'
                        : 'from-green-400 to-teal-500'
                    }
                  `}
                  style={{
                    width: '100%',
                    animation: 'countdown 5s linear forwards'
                  }}
                />
              </div>
            )}
          </div>
        );
      })}

      {/* Notification Count */}
      {notifications.filter(n => visibleNotifications.has(n.id)).length > 1 && (
        <div className="bg-gray-900 text-white rounded-full px-4 py-2 text-sm font-medium shadow-lg pointer-events-auto">
          {notifications.filter(n => visibleNotifications.has(n.id)).length} new notification{notifications.length > 1 ? 's' : ''}
        </div>
      )}

      <style jsx>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes countdown {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }

        .animate-slide-in-right {
          animation: slideInRight 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
