import React from 'react';
import { Trophy, Clock, Target, Award } from 'lucide-react';

interface Badge {
  id: string;
  name: string;
  points: number;
  difficulty_level: 'bronze' | 'silver' | 'gold' | 'platinum';
  icon: string | null;
  criteria_type: string;
  criteria_value: number;
}

interface BadgeProgress {
  current: number;
  required: number;
  percentage: number;
}

interface PointsProgressProps {
  badges: Badge[];
  userBadges: Set<string>;
  progressData: Record<string, BadgeProgress>;
  currentPoints: number;
  nextMilestone?: number;
}

export function PointsProgress({
  badges,
  userBadges,
  progressData,
  currentPoints,
  nextMilestone = 1000
}: PointsProgressProps) {
  // Find next badge to unlock
  const nextBadge = badges
    .filter((b) => !userBadges.has(b.id))
    .sort((a, b) => {
      const aProgress = progressData[a.id]?.percentage || 0;
      const bProgress = progressData[b.id]?.percentage || 0;
      return bProgress - aProgress;
    })[0];

  // Calculate points milestones
  const pointsMilestones = [500, 1000, 2500, 5000, 10000, 25000, 50000];
  const currentMilestoneIndex = pointsMilestones.findIndex((m) => m > currentPoints);
  const prevMilestone = currentMilestoneIndex === 0 ? 0 : pointsMilestones[currentMilestoneIndex - 1];
  const nextPointsMilestone = pointsMilestones[currentMilestoneIndex] || pointsMilestones[pointsMilestones.length - 1];

  const getMilestoneProgress = () => {
    if (currentPoints >= nextPointsMilestone) return 100;
    const range = nextPointsMilestone - prevMilestone;
    const progress = ((currentPoints - prevMilestone) / range) * 100;
    return Math.max(0, Math.min(100, progress));
  };

  const getProgressColor = (percentage: number): string => {
    if (percentage >= 80) return 'from-green-400 to-green-600';
    if (percentage >= 50) return 'from-yellow-400 to-yellow-600';
    if (percentage >= 25) return 'from-orange-400 to-orange-600';
    return 'from-red-400 to-red-600';
  };

  const getTimeToUnlock = (progress: BadgeProgress): string => {
    const remaining = progress.required - progress.current;
    if (remaining <= 0) return 'Ready!';

    // Rough estimate based on activity type
    const timePerActivity: Record<string, number> = {
      courses_completed: 7, // days
      quiz_score: 1,
      streak_days: 1,
      lessons_completed: 0.5,
      assignments_completed: 3,
      discussion_posts: 0.25,
      quiz_perfect_score: 2,
      course_speed: 14
    };

    // Get criteria type from badge
    const badge = badges.find((b) => progressData[b.id] === progress);
    if (!badge) return 'Keep learning!';

    const days = remaining * (timePerActivity[badge.criteria_type] || 1);
    if (days < 1) return 'Almost there!';
    if (days < 7) return `~${Math.round(days)} day${days > 1 ? 's' : ''}`;
    if (days < 30) return `~${Math.round(days / 7)} weeks`;
    return `~${Math.round(days / 30)} months`;
  };

  const earnedBadgesCount = userBadges.size;
  const totalBadges = badges.length;
  const badgesProgress = Math.round((earnedBadgesCount / totalBadges) * 100);

  return (
    <div className="space-y-6">
      {/* Points Milestone Progress */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-6 h-6 text-yellow-500" />
          <h3 className="text-lg font-semibold text-gray-900">
            Points Milestone
          </h3>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">
              Next milestone: <span className="font-semibold text-gray-900">
                {nextPointsMilestone.toLocaleString()} points
              </span>
            </span>
            <span className="text-sm font-bold text-blue-600">
              {currentPoints.toLocaleString()} / {nextPointsMilestone.toLocaleString()}
            </span>
          </div>
          <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`
                h-full bg-gradient-to-r transition-all duration-700 ease-out
                ${getProgressColor(getMilestoneProgress())}
              `}
              style={{ width: `${getMilestoneProgress()}%` }}
            />
          </div>
          <div className="text-center text-sm text-gray-600">
            {nextPointsMilestone - currentPoints.toLocaleString()} more points needed
          </div>
        </div>
      </div>

      {/* Next Badge */}
      {nextBadge && progressData[nextBadge.id] && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-6 h-6 text-purple-500" />
            <h3 className="text-lg font-semibold text-gray-900">
              Next Badge
            </h3>
          </div>
          <div className="flex items-start gap-4">
            {/* Badge Icon */}
            <div className="flex-shrink-0">
              {nextBadge.icon ? (
                <img
                  src={nextBadge.icon}
                  alt={nextBadge.name}
                  className="w-20 h-20 object-contain"
                />
              ) : (
                <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center text-4xl">
                  🏅
                </div>
              )}
            </div>

            {/* Badge Info */}
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-gray-900 mb-1">
                {nextBadge.name}
              </h4>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm px-2 py-1 rounded-full bg-purple-100 text-purple-700 capitalize">
                  {nextBadge.difficulty_level}
                </span>
                <span className="text-sm text-yellow-600 font-medium">
                  +{nextBadge.points} pts
                </span>
              </div>

              {/* Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Progress</span>
                  <span className="font-semibold text-gray-900">
                    {progressData[nextBadge.id].current} / {progressData[nextBadge.id].required}
                  </span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`
                      h-full bg-gradient-to-r transition-all duration-500 ease-out
                      ${getProgressColor(progressData[nextBadge.id].percentage)}
                    `}
                    style={{ width: `${Math.min(progressData[nextBadge.id].percentage, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>
                    {progressData[nextBadge.id].percentage.toFixed(0)}% complete
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {getTimeToUnlock(progressData[nextBadge.id])}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Badges Progress */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-6 h-6 text-green-500" />
          <h3 className="text-lg font-semibold text-gray-900">
            Badge Collection
          </h3>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">
              Badges earned
            </span>
            <span className="text-sm font-bold text-green-600">
              {earnedBadgesCount} / {totalBadges}
            </span>
          </div>
          <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-700 ease-out"
              style={{ width: `${badgesProgress}%` }}
            />
          </div>
          <div className="grid grid-cols-3 gap-2 mt-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{earnedBadgesCount}</div>
              <div className="text-xs text-gray-600">Earned</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{totalBadges - earnedBadgesCount}</div>
              <div className="text-xs text-gray-600">Locked</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{badgesProgress}%</div>
              <div className="text-xs text-gray-600">Complete</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
        <h4 className="font-semibold text-gray-900 mb-4">Quick Stats</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-2xl font-bold text-blue-600">
              {currentPoints.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Total Points</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">
              {earnedBadgesCount}
            </div>
            <div className="text-sm text-gray-600">Badges</div>
          </div>
        </div>
      </div>
    </div>
  );
}
