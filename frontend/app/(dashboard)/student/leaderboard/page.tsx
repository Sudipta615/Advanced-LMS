"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Alert } from '@/components/ui/Alert';
import {
  LeaderboardTable,
  LeaderboardPeriodTabs,
  LeaderboardRank,
  UserRankComparison
} from '@/components/gamification';

interface LeaderboardEntry {
  rank: number;
  user_id: string;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
  total_points: number;
  badges_count: number;
  courses_completed: number;
  rank_change?: number;
}

interface LeaderboardResponse {
  leaderboard: LeaderboardEntry[];
  userRank?: {
    rank: number;
    totalUsers: number;
    percentile: number;
    rankChange?: number;
  };
  period: 'all_time' | 'monthly' | 'weekly';
}

export default function StudentLeaderboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [data, setData] = useState<LeaderboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<'all_time' | 'monthly' | 'weekly'>('all_time');

  const fetchLeaderboard = async (selectedPeriod: 'all_time' | 'monthly' | 'weekly') => {
    try {
      setLoading(true);
      setError(null);

      const [leaderboardRes, rankRes] = await Promise.all([
        api.get(`/api/leaderboards/global?period=${selectedPeriod}`),
        api.get(`/api/user/rank?period=${selectedPeriod}`)
      ]);

      const response = {
        data: {
          leaderboard: leaderboardRes.data?.data?.leaderboard || [],
          userRank: rankRes.data?.data,
          period: selectedPeriod
        }
      };
      setData(response.data?.data || response.data);
    } catch (err: any) {
      console.error('Failed to fetch leaderboard:', err);
      setError(err.response?.data?.error || 'Failed to load leaderboard. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchLeaderboard(period);
  }, [user, period]);

  const handlePeriodChange = (newPeriod: 'all_time' | 'monthly' | 'weekly') => {
    setPeriod(newPeriod);
  };

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
          onClick={() => fetchLeaderboard(period)}
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
        <Alert type="info" message="No leaderboard data available." />
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
          <li className="text-gray-900 font-medium">Leaderboard</li>
        </ol>
      </nav>

      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Leaderboard</h1>
        <p className="text-gray-600">See how you rank among other learners and compete for the top spot.</p>
      </header>

      <div className="mb-8">
        <LeaderboardPeriodTabs period={period} onPeriodChange={handlePeriodChange} />
      </div>

      {data.userRank && (
        <div className="mb-8">
          <LeaderboardRank
            userRank={data.userRank.rank}
            comparison={{
              rank: data.userRank.rank,
              totalUsers: data.userRank.totalUsers,
              percentile: data.userRank.percentile,
              points: 0,
              averagePoints: 0,
              aboveAverage: data.userRank.percentile <= 50
            }}
            period={period}
          />
        </div>
      )}

      {data.leaderboard && data.leaderboard.length > 0 ? (
        <div className="mb-8">
          <LeaderboardTable
            leaderboard={data.leaderboard}
            period={period}
            userRank={data.userRank?.rank}
            userId={user.id}
          />
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No leaderboard data available for this period.</p>
        </div>
      )}

      <div className="mt-10">
        <UserRankComparison
          userId={user.id}
          globalRank={
            data.userRank
              ? {
                  rank: data.userRank.rank,
                  totalUsers: data.userRank.totalUsers,
                  percentile: data.userRank.percentile,
                  change: data.userRank.rankChange
                }
              : {
                  rank: 0,
                  totalUsers: 0,
                  percentile: 0
                }
          }
        />
      </div>

      <div className="mt-10 text-center">
        <p className="text-sm text-gray-600 mb-3">Climb the rankings by earning more points!</p>
        <Link
          href="/student/courses"
          className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Start Learning
        </Link>
      </div>
    </div>
  );
}
