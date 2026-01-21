"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Alert } from '@/components/ui/Alert';
import { AchievementTimeline, GamificationStats } from '@/components/gamification';

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

interface AchievementsResponse {
  achievements: Achievement[];
  unlockedAchievements: UnlockedAchievement[];
  stats?: any;
}

export default function StudentAchievementsPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [data, setData] = useState<AchievementsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      setError(null);

      const [unlockedRes, availableRes] = await Promise.all([
        api.get('/api/user/achievements'),
        api.get('/api/achievements/available')
      ]);

      const response = {
        data: {
          unlockedAchievements: unlockedRes.data?.data?.achievements || [],
          achievements: [
            ...(unlockedRes.data?.data?.achievements || []),
            ...(availableRes.data?.data?.availableAchievements || [])
          ]
        }
      };
      setData(response.data?.data || response.data);
    } catch (err: any) {
      console.error('Failed to fetch achievements:', err);
      setError(err.response?.data?.error || 'Failed to load achievements. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchAchievements();
  }, [user]);

  const completion = useMemo(() => {
    const total = data?.achievements?.length || 0;
    const unlocked = data?.unlockedAchievements?.length || 0;
    const percentage = total > 0 ? Math.round((unlocked / total) * 100) : 0;
    return { total, unlocked, percentage };
  }, [data]);

  const statsData = useMemo(() => {
    const base = data?.stats || {};
    return {
      totalPointsEarned: base.totalPointsEarned ?? base.total_points_earned ?? 0,
      totalBadgesEarned: base.totalBadgesEarned ?? base.total_badges_earned ?? 0,
      totalAchievementsUnlocked: base.totalAchievementsUnlocked ?? base.total_achievements_unlocked ?? completion.unlocked,
      currentRank: base.currentRank ?? base.current_rank ?? 0,
      currentStreak: base.currentStreak ?? base.current_streak ?? 0,
      averagePointsPerDay: base.averagePointsPerDay ?? base.average_points_per_day,
      percentile: base.percentile,
      timeSpentLearning: base.timeSpentLearning ?? base.time_spent_learning,
      favoriteBadge: base.favoriteBadge ?? base.favorite_badge,
      mostActiveCourse: base.mostActiveCourse ?? base.most_active_course
    };
  }, [data, completion.unlocked]);

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
          onClick={fetchAchievements}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert type="info" message="No achievement data available." />
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
          <li>
            <Link href="/student/gamification" className="hover:text-gray-900">
              Gamification
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="text-gray-900 font-medium">Achievements</li>
        </ol>
      </nav>

      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Achievements</h1>
        <p className="text-gray-600">Unlock milestones and celebrate your learning progress.</p>
      </header>

      <div className="mb-10">
        <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-xl p-6 border border-green-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {completion.unlocked} / {completion.total} Achievements Unlocked
          </h2>
          <p className="text-gray-600">You're {completion.percentage}% complete.</p>
        </div>
      </div>

      <div className="mb-10">
        <GamificationStats stats={statsData} />
      </div>

      <AchievementTimeline achievements={data.achievements} unlockedAchievements={data.unlockedAchievements} />

      <div className="mt-10 text-center">
        <p className="text-sm text-gray-600 mb-3">Want to earn more achievements?</p>
        <Link
          href="/student/courses"
          className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Continue Learning
        </Link>
      </div>
    </div>
  );
}
