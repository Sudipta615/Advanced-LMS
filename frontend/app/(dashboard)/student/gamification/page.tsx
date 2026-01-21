"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Alert } from '@/components/ui/Alert';
import {
  GamificationDashboard,
  GamificationStats,
  NotificationCenter,
  PointsCard,
  StreakDisplay
} from '@/components/gamification';

type ApiPointsBreakdown = {
  course_completion?: number;
  quiz?: number;
  assignment?: number;
  discussion?: number;
  streak_bonus?: number;
  courseCompletion?: number;
  streakBonus?: number;
};

interface GamificationDashboardResponse {
  points?: {
    total?: number;
    total_points?: number;
    breakdown?: ApiPointsBreakdown;
    earningRate?: number;
    earning_rate?: number;
    lastUpdated?: string;
    last_updated?: string;
  };
  streak?: {
    current?: number;
    current_streak?: number;
    longest?: number;
    longest_streak?: number;
    lastActivityDate?: string;
    last_activity_date?: string;
    nextMilestone?: number;
    next_milestone?: number;
  };
  stats?: {
    totalPointsEarned?: number;
    total_points_earned?: number;
    totalBadgesEarned?: number;
    total_badges_earned?: number;
    totalAchievementsUnlocked?: number;
    total_achievements_unlocked?: number;
    currentRank?: number;
    current_rank?: number;
    currentStreak?: number;
    current_streak?: number;
    averagePointsPerDay?: number;
    average_points_per_day?: number;
    percentile?: number;
    favoriteBadge?: any;
    favorite_badge?: any;
    mostActiveCourse?: any;
    most_active_course?: any;
    timeSpentLearning?: number;
    time_spent_learning?: number;
  };
  notifications?: Array<{
    id: string;
    type: 'points' | 'badge' | 'achievement';
    title: string;
    message: string;
    points?: number;
    badgeName?: string;
    badge_name?: string;
    achievementName?: string;
    achievement_name?: string;
    timestamp: string;
    read?: boolean;
  }>;
}

export default function StudentGamificationDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [dashboard, setDashboard] = useState<GamificationDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all gamification data from multiple endpoints
      const [pointsRes, badgesRes, achievementsRes, streakRes, rankRes] = await Promise.all([
        api.get('/api/user/points'),
        api.get('/api/user/badges'),
        api.get('/api/user/achievements'),
        api.get('/api/user/streaks'),
        api.get('/api/user/rank')
      ]);

      const response = {
        data: {
          points: pointsRes.data?.data,
          badges: badgesRes.data?.data,
          achievements: achievementsRes.data?.data,
          streak: streakRes.data?.data,
          userRank: rankRes.data?.data
        }
      };
      setDashboard(response.data?.data || response.data);
    } catch (err: any) {
      console.error('Failed to fetch gamification dashboard:', err);
      setError(err.response?.data?.error || 'Failed to load gamification dashboard. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchDashboard();
  }, [user]);

  const pointsCardData = useMemo(() => {
    const total = dashboard?.points?.total ?? dashboard?.points?.total_points ?? 0;
    const b = dashboard?.points?.breakdown || {};

    return {
      totalPoints: total,
      breakdown: {
        courseCompletion: b.courseCompletion ?? b.course_completion ?? 0,
        quiz: b.quiz ?? 0,
        assignment: b.assignment ?? 0,
        discussion: b.discussion ?? 0,
        streakBonus: b.streakBonus ?? b.streak_bonus ?? 0
      },
      earningRate: dashboard?.points?.earningRate ?? dashboard?.points?.earning_rate ?? 0,
      lastUpdated: dashboard?.points?.lastUpdated ?? dashboard?.points?.last_updated
    };
  }, [dashboard]);

  const streakCardData = useMemo(() => {
    const s = dashboard?.streak || {};
    return {
      currentStreak: s.current ?? s.current_streak ?? 0,
      longestStreak: s.longest ?? s.longest_streak ?? 0,
      lastActivityDate: s.lastActivityDate ?? s.last_activity_date,
      nextMilestone: s.nextMilestone ?? s.next_milestone
    };
  }, [dashboard]);

  const statsData = useMemo(() => {
    const s = dashboard?.stats || {};
    return {
      totalPointsEarned: s.totalPointsEarned ?? s.total_points_earned ?? pointsCardData.totalPoints,
      totalBadgesEarned: s.totalBadgesEarned ?? s.total_badges_earned ?? 0,
      totalAchievementsUnlocked: s.totalAchievementsUnlocked ?? s.total_achievements_unlocked ?? 0,
      currentRank: s.currentRank ?? s.current_rank ?? 0,
      currentStreak: s.currentStreak ?? s.current_streak ?? streakCardData.currentStreak,
      favoriteBadge: s.favoriteBadge ?? s.favorite_badge,
      mostActiveCourse: s.mostActiveCourse ?? s.most_active_course,
      timeSpentLearning: s.timeSpentLearning ?? s.time_spent_learning,
      averagePointsPerDay: s.averagePointsPerDay ?? s.average_points_per_day,
      percentile: s.percentile
    };
  }, [dashboard, pointsCardData.totalPoints, streakCardData.currentStreak]);

  const notifications = useMemo(() => {
    return (dashboard?.notifications || []).map((n) => ({
      ...n,
      badgeName: n.badgeName ?? n.badge_name,
      achievementName: n.achievementName ?? n.achievement_name
    }));
  }, [dashboard]);

  if (!user) return null;

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <LoadingSpinner size="large" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Alert type="error" message={error} />
        </div>
        <button
          onClick={fetchDashboard}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <nav className="text-sm text-gray-600 mb-6" aria-label="Breadcrumb">
        <ol className="flex items-center gap-2">
          <li>
            <Link href="/dashboard" className="hover:text-gray-900">
              Dashboard
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="text-gray-900 font-medium">Gamification</li>
        </ol>
      </nav>

      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Gamification Dashboard</h1>
        <p className="text-gray-600">Points, badges, achievements, streaks, and rankings — all in one place.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <PointsCard
            totalPoints={pointsCardData.totalPoints}
            breakdown={pointsCardData.breakdown}
            earningRate={pointsCardData.earningRate}
            lastUpdated={pointsCardData.lastUpdated}
          />
        </div>
        <div>
          <StreakDisplay
            currentStreak={streakCardData.currentStreak}
            longestStreak={streakCardData.longestStreak}
            lastActivityDate={streakCardData.lastActivityDate}
            nextMilestone={streakCardData.nextMilestone}
          />
        </div>
      </div>

      <div className="mb-10">
        <GamificationStats stats={statsData} />
      </div>

      {notifications.length > 0 && (
        <section className="mb-10" aria-label="Recent notifications">
          <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
          <NotificationCenter notifications={notifications} />
        </section>
      )}

      <section className="mb-10" aria-label="Gamification tabs">
        <GamificationDashboard userId={user.id} />
      </section>

      <section aria-label="Quick links" className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/student/badges"
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
        >
          <h3 className="text-lg font-bold mb-2">Badges</h3>
          <p className="text-gray-600 text-sm">Browse all badges and track progress.</p>
          <div className="mt-3 text-blue-600 font-semibold">Explore →</div>
        </Link>

        <Link
          href="/student/achievements"
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
        >
          <h3 className="text-lg font-bold mb-2">Achievements</h3>
          <p className="text-gray-600 text-sm">See what you've unlocked and what’s next.</p>
          <div className="mt-3 text-blue-600 font-semibold">View →</div>
        </Link>

        <Link
          href="/student/leaderboard"
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
        >
          <h3 className="text-lg font-bold mb-2">Leaderboard</h3>
          <p className="text-gray-600 text-sm">Compare your rank with other learners.</p>
          <div className="mt-3 text-blue-600 font-semibold">Compete →</div>
        </Link>
      </section>
    </div>
  );
}
