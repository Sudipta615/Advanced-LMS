"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Alert } from '@/components/ui/Alert';
import { StreakDisplay, StreakCalendar, LearningStreakReminder } from '@/components/gamification';

interface CalendarDay {
  date: string;
  intensity: number;
  count: number;
  hasActivity: boolean;
}

interface StreaksResponse {
  streak: {
    currentStreak: number;
    longestStreak: number;
    lastActivityDate?: string;
    nextMilestone?: number;
    daysUntilReset?: number;
    isAtRisk?: boolean;
  };
  calendar: CalendarDay[];
}

export default function StudentStreaksPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [data, setData] = useState<StreaksResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStreaks = async () => {
    try {
      setLoading(true);
      setError(null);

      const [streakRes, calendarRes] = await Promise.all([
        api.get('/api/user/streaks'),
        api.get('/api/user/streaks/calendar?days=30')
      ]);

      const response = {
        data: {
          streak: streakRes.data?.data,
          calendar: calendarRes.data?.data?.calendar || []
        }
      };
      setData(response.data?.data || response.data);
    } catch (err: any) {
      console.error('Failed to fetch streak data:', err);
      setError(err.response?.data?.error || 'Failed to load streak data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchStreaks();
  }, [user]);

  const reminderData = useMemo(() => {
    const streak = data?.streak;
    const current = streak?.currentStreak ?? 0;
    const nextMilestone = streak?.nextMilestone ?? (current >= 30 ? 60 : current >= 14 ? 30 : current >= 7 ? 14 : 7);
    return {
      currentStreak: current,
      nextMilestone,
      daysUntilReset: streak?.daysUntilReset,
      isAtRisk: streak?.isAtRisk
    };
  }, [data]);

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
          onClick={fetchStreaks}
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
        <Alert type="info" message="No streak data available." />
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
          <li className="text-gray-900 font-medium">Streaks</li>
        </ol>
      </nav>

      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Learning Streaks</h1>
        <p className="text-gray-600">Maintain your streak and visualize your learning activity over time.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <StreakDisplay
          currentStreak={data.streak.currentStreak}
          longestStreak={data.streak.longestStreak}
          lastActivityDate={data.streak.lastActivityDate}
          nextMilestone={data.streak.nextMilestone}
        />

        <LearningStreakReminder
          currentStreak={reminderData.currentStreak}
          nextMilestone={reminderData.nextMilestone}
          daysUntilReset={reminderData.daysUntilReset}
          isAtRisk={reminderData.isAtRisk}
          onContinueLearning={() => router.push('/student/courses')}
        />
      </div>

      <div className="mb-8">
        <StreakCalendar calendarData={data.calendar} currentStreak={data.streak.currentStreak} />
      </div>

      <div className="mt-10 text-center">
        <p className="text-sm text-gray-600 mb-3">Need to keep your streak alive?</p>
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
