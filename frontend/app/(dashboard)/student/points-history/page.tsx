"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Alert } from '@/components/ui/Alert';
import { PointsHistoryList, PointsCard } from '@/components/gamification';

interface PointsHistoryEntry {
  id: string;
  activity_type: 'course_completion' | 'quiz' | 'assignment' | 'discussion' | 'streak_bonus' | 'login' | 'lesson_completion';
  description: string;
  points: number;
  timestamp: string;
  resource_id?: string;
  resource_type?: string;
}

interface PointsHistoryResponse {
  history: PointsHistoryEntry[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  summary?: {
    totalPoints: number;
    todayPoints: number;
    weekPoints: number;
    monthPoints: number;
    breakdown: {
      courseCompletion: number;
      quiz: number;
      assignment: number;
      discussion: number;
      streakBonus: number;
    };
  };
}

export default function StudentPointsHistoryPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [data, setData] = useState<PointsHistoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const fetchPointsHistory = async (currentPage: number) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get(`/api/user/points/history?page=${currentPage}&limit=20`);
      setData(response.data?.data || response.data);
    } catch (err: any) {
      console.error('Failed to fetch points history:', err);
      setError(err.response?.data?.error || 'Failed to load points history. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchPointsHistory(page);
  }, [user, page]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
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
          onClick={() => fetchPointsHistory(page)}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data || !data.history) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert type="info" message="No points history available." />
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
          <li className="text-gray-900 font-medium">Points History</li>
        </ol>
      </nav>

      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Points History</h1>
        <p className="text-gray-600">View all your points transactions and earning activity.</p>
      </header>

      {data.summary && (
        <div className="mb-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <PointsCard
              totalPoints={data.summary.totalPoints}
              breakdown={data.summary.breakdown}
              earningRate={0}
            />
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 shadow-md">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Stats</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Today</p>
                <p className="text-2xl font-bold text-blue-600">+{data.summary.todayPoints.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">This Week</p>
                <p className="text-2xl font-bold text-purple-600">+{data.summary.weekPoints.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-green-600">+{data.summary.monthPoints.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {data.history.length > 0 ? (
        <PointsHistoryList
          history={data.history}
          total={data.pagination.total}
          page={page}
          onPageChange={handlePageChange}
          itemsPerPage={data.pagination.limit}
        />
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg mb-4">No points history yet.</p>
          <p className="text-gray-600 mb-6">Start learning to earn your first points!</p>
          <Link
            href="/student/courses"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Browse Courses
          </Link>
        </div>
      )}
    </div>
  );
}
