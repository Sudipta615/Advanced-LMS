import React from 'react';
import { X, Award, CheckCircle2, Users, Lightbulb } from 'lucide-react';

interface Badge {
  id: string;
  name: string;
  description: string;
  full_description?: string;
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

interface BadgeUser {
  id: string;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
  earned_at: string;
}

interface BadgeDetailsModalProps {
  badge: Badge;
  isOpen: boolean;
  onClose: () => void;
  onAward?: (badgeId: string) => void;
  earnedUsers?: BadgeUser[];
  isEarned?: boolean;
  earnedDate?: string;
  isAdmin?: boolean;
}

export function BadgeDetailsModal({
  badge,
  isOpen,
  onClose,
  onAward,
  earnedUsers = [],
  isEarned = false,
  earnedDate,
  isAdmin = false
}: BadgeDetailsModalProps) {
  if (!isOpen) return null;

  const difficultyColors = {
    bronze: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-300' },
    silver: { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-300' },
    gold: { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-400' },
    platinum: { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300' }
  };

  const difficulty = difficultyColors[badge.difficulty_level];

  const getCriteriaDescription = (type: string, value: number): string => {
    const descriptions: Record<string, string> = {
      courses_completed: `Complete ${value} courses`,
      quiz_score: `Score ${value}% or higher on a quiz`,
      streak_days: `Maintain a learning streak for ${value} days`,
      lessons_completed: `Complete ${value} lessons`,
      assignments_completed: `Complete ${value} assignments`,
      discussion_posts: `Make ${value} discussion posts`,
      quiz_perfect_score: `Get a perfect score on ${value} quizzes`,
      course_speed: `Complete a course in ${value} days or less`
    };
    return descriptions[type] || 'Complete the required activity';
  };

  const getTips = (): string[] => {
    const tips: Record<string, string[]> = {
      courses_completed: [
        'Enroll in courses that interest you',
        'Set aside dedicated learning time each day',
        'Complete lessons sequentially for better retention'
      ],
      quiz_score: [
        'Review lesson materials before taking quizzes',
        'Take notes during lessons to refer back later',
        'Don\'t rush - take your time on each question'
      ],
      streak_days: [
        'Log in every day, even if just briefly',
        'Complete at least one lesson daily',
        'Set reminders to maintain your streak'
      ],
      lessons_completed: [
        'Break down courses into daily goals',
        'Focus on one lesson at a time',
        'Track your progress regularly'
      ],
      assignments_completed: [
        'Start assignments early',
        'Read instructions carefully',
        'Submit before the deadline'
      ],
      discussion_posts: [
        'Engage with course content actively',
        'Ask thoughtful questions',
        'Help fellow students with their questions'
      ],
      quiz_perfect_score: [
        'Study thoroughly before attempting quizzes',
        'Review incorrect answers to learn from mistakes',
        'Practice with sample questions if available'
      ],
      course_speed: [
        'Stay consistent with your learning schedule',
        'Focus on one course at a time',
        'Avoid skipping sections'
      ]
    };
    return tips[badge.criteria_type] || ['Keep learning and progressing!', 'Stay consistent with your activities'];
  };

  const tips = getTips();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`p-6 ${difficulty.bg} border-b ${difficulty.border}`}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              {/* Badge Icon */}
              <div className="w-20 h-20 rounded-xl bg-white shadow-lg flex items-center justify-center text-4xl">
                {badge.icon ? (
                  <img src={badge.icon} alt={badge.name} className="w-16 h-16 object-contain" />
                ) : (
                  <span style={{ color: badge.category.color }}>{badge.category.icon}</span>
                )}
              </div>

              {/* Badge Info */}
              <div>
                <h2
                  id="modal-title"
                  className="text-2xl font-bold text-gray-900 mb-1"
                >
                  {badge.name}
                </h2>
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className="text-sm px-2 py-1 rounded-full text-white font-medium"
                    style={{ backgroundColor: badge.category.color }}
                  >
                    {badge.category.icon} {badge.category.name}
                  </span>
                  <span
                    className={`text-sm px-2 py-1 rounded-full font-medium capitalize ${difficulty.bg} ${difficulty.text}`}
                  >
                    {badge.difficulty_level}
                  </span>
                  {isEarned && (
                    <span className="text-sm px-2 py-1 rounded-full bg-green-100 text-green-700 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      Earned
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-white/50 rounded-lg"
              aria-label="Close modal"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* Description */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-500" />
              About this Badge
            </h3>
            <p className="text-gray-600">
              {badge.full_description || badge.description}
            </p>
          </div>

          {/* How to Earn */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              How to Earn
            </h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 font-medium">
                {getCriteriaDescription(badge.criteria_type, badge.criteria_value)}
              </p>
            </div>
          </div>

          {/* Points Awarded */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Points Awarded
            </h3>
            <div className="flex items-center gap-2 text-2xl font-bold text-yellow-600">
              <span>⭐</span>
              <span>{badge.points.toLocaleString()} points</span>
            </div>
          </div>

          {/* Tips */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-500" />
              Tips to Earn This Badge
            </h3>
            <ul className="space-y-2">
              {tips.map((tip, index) => (
                <li key={index} className="flex items-start gap-2 text-gray-600">
                  <span className="text-green-500 mt-1">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Users Who Earned It */}
          {earnedUsers.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-500" />
                Users Who Earned This Badge
              </h3>
              <div className="space-y-2">
                {earnedUsers.slice(0, 5).map((user) => (
                  <div key={user.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold">
                      {user.first_name[0]}{user.last_name[0]}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {user.first_name} {user.last_name}
                      </div>
                      <div className="text-xs text-gray-500">
                        Earned {formatDate(user.earned_at)}
                      </div>
                    </div>
                  </div>
                ))}
                {earnedUsers.length > 5 && (
                  <div className="text-center text-sm text-gray-500">
                    +{earnedUsers.length - 5} more users earned this badge
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Earned Date */}
          {isEarned && earnedDate && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 font-medium">
                🎉 You earned this badge on {formatDate(earnedDate)}!
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        {isAdmin && onAward && (
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <button
              onClick={() => onAward(badge.id)}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Award Badge to User
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
