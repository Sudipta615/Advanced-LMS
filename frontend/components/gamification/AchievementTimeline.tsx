import React from 'react';
import { AchievementCard } from './AchievementCard';
import { CheckCircle2, Lock } from 'lucide-react';

interface Achievement {
  id: string;
  name: string;
  description: string;
  achievement_type: string;
  icon: string | null;
  data: any;
}

interface UnlockedAchievement {
  id: string;
  achievement_id: string;
  unlocked_at: string;
  achievement: Achievement;
}

interface AchievementTimelineProps {
  achievements: Achievement[];
  unlockedAchievements: UnlockedAchievement[];
  onAchievementClick?: (achievement: Achievement) => void;
}

export function AchievementTimeline({
  achievements,
  unlockedAchievements,
  onAchievementClick
}: AchievementTimelineProps) {
  // Create a map of unlocked achievements with their unlock dates
  const unlockedMap = new Map(
    unlockedAchievements.map((ua) => [ua.achievement_id, ua.unlocked_at])
  );

  // Sort achievements: unlocked ones by date (newest first), then locked ones
  const sortedAchievements = [...achievements].sort((a, b) => {
    const aUnlocked = unlockedMap.has(a.id);
    const bUnlocked = unlockedMap.has(b.id);

    if (aUnlocked && bUnlocked) {
      const aDate = new Date(unlockedMap.get(a.id)!);
      const bDate = new Date(unlockedMap.get(b.id)!);
      return bDate.getTime() - aDate.getTime();
    }

    if (aUnlocked && !bUnlocked) return -1;
    if (!aUnlocked && bUnlocked) return 1;

    // Both locked - sort by name
    return a.name.localeCompare(b.name);
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

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

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Achievement Timeline</h2>

      {/* Desktop - Vertical Timeline */}
      <div className="hidden md:block">
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200" />

          {/* Timeline Items */}
          <div className="space-y-8">
            {sortedAchievements.map((achievement, index) => {
              const unlocked = unlockedMap.has(achievement.id);
              const unlockedDate = unlockedMap.get(achievement.id);
              const icon = achievement.icon || achievementIcons[achievement.achievement_type] || '⭐';

              return (
                <div
                  key={achievement.id}
                  className="relative flex items-start gap-6 pl-0"
                >
                  {/* Timeline Dot */}
                  <div className="relative z-10 flex-shrink-0 w-16">
                    <div
                      className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl border-4 transition-all ${
                        unlocked
                          ? 'bg-white border-green-500 shadow-lg'
                          : 'bg-gray-100 border-gray-300'
                      }`}
                    >
                      {unlocked ? icon : '🔒'}
                    </div>
                  </div>

                  {/* Achievement Card */}
                  <div className="flex-1 min-w-0">
                    <AchievementCard
                      achievement={achievement}
                      unlocked={unlocked}
                      unlockedAt={unlockedDate}
                      onClick={() => onAchievementClick?.(achievement)}
                    />
                  </div>

                  {/* Date */}
                  {unlocked && unlockedDate && (
                    <div className="flex-shrink-0 text-right">
                      <div className="text-sm text-gray-500 font-medium">
                        {formatDate(unlockedDate)}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile - Horizontal Scroll Timeline */}
      <div className="md:hidden">
        <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
          {sortedAchievements.map((achievement) => {
            const unlocked = unlockedMap.has(achievement.id);
            const unlockedDate = unlockedMap.get(achievement.id);
            const icon = achievement.icon || achievementIcons[achievement.achievement_type] || '⭐';

            return (
              <div
                key={achievement.id}
                className="flex-shrink-0 w-72 snap-start"
              >
                <AchievementCard
                  achievement={achievement}
                  unlocked={unlocked}
                  unlockedAt={unlockedDate}
                  onClick={() => onAchievementClick?.(achievement)}
                />
              </div>
            );
          })}
        </div>

        {/* Scroll Indicator */}
        <div className="text-center text-sm text-gray-500 mt-2">
          ← Swipe to see more achievements →
        </div>
      </div>

      {/* Summary Stats */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mt-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">
              {unlockedAchievements.length}
            </div>
            <div className="text-sm text-gray-600">Unlocked</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-400">
              {achievements.length - unlockedAchievements.length}
            </div>
            <div className="text-sm text-gray-600">Locked</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">
              {Math.round((unlockedAchievements.length / Math.max(achievements.length, 1)) * 100)}%
            </div>
            <div className="text-sm text-gray-600">Progress</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">
              {achievements.length}
            </div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
        </div>
      </div>
    </div>
  );
}
