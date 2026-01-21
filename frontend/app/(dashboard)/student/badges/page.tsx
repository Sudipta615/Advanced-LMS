"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Alert } from '@/components/ui/Alert';
import {
  BadgeGrid,
  BadgeDetailsModal,
  PointsProgress
} from '@/components/gamification';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string | null;
  criteria_type: string;
  criteria_value: number;
  points: number;
  difficulty_level: 'bronze' | 'silver' | 'gold' | 'platinum';
  category: {
    id: string;
    name: string;
    color: string;
    icon: string;
  };
}

interface UserBadge {
  badge_id: string;
  earned_at: string;
}

interface BadgeProgress {
  current: number;
  required: number;
  percentage: number;
}

interface BadgesResponse {
  badges: Badge[];
  userBadges: UserBadge[];
  progress?: Record<string, BadgeProgress>;
}

export default function StudentBadgesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<BadgesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchBadges = async () => {
    try {
      setLoading(true);
      setError(null);

      const [allBadgesRes, userBadgesRes, progressRes] = await Promise.all([
        api.get('/api/badges'),
        api.get('/api/user/badges'),
        api.get('/api/user/badges/progress').catch(() => ({ data: { data: {} } }))
      ]);

      const response = {
        data: {
          badges: allBadgesRes.data?.data?.badges || [],
          userBadges: userBadgesRes.data?.data?.badges || [],
          progress: progressRes.data?.data || {}
        }
      };
      setData(response.data?.data || response.data);
    } catch (err: any) {
      console.error('Failed to fetch badges:', err);
      setError(err.response?.data?.error || 'Failed to load badges. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchBadges();
  }, [user]);

  const handleBadgeClick = (badge: Badge) => {
    setSelectedBadge(badge);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedBadge(null);
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
          onClick={fetchBadges}
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
        <Alert type="info" message="No badge data available." />
      </div>
    );
  }

  const earnedCount = data.userBadges?.length || 0;
  const totalCount = data.badges?.length || 0;
  const earnedPercentage = totalCount > 0 ? Math.round((earnedCount / totalCount) * 100) : 0;

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
          <li className="text-gray-900 font-medium">Badges</li>
        </ol>
      </nav>

      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Badges</h1>
        <p className="text-gray-600">
          Discover and unlock badges as you progress through your learning journey.
        </p>
      </header>

      <div className="mb-8 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-200">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              {earnedCount} / {totalCount} Badges Earned
            </h2>
            <p className="text-sm text-gray-600">You're {earnedPercentage}% complete!</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right">
              <p className="text-sm text-gray-600">Keep collecting to unlock more rewards</p>
            </div>
          </div>
        </div>
        {/* Progress info displayed in grid below */}
      </div>

      {data.badges && data.badges.length > 0 ? (
        <BadgeGrid
          badges={data.badges}
          userBadges={data.userBadges || []}
          onBadgeClick={handleBadgeClick}
          showProgress={true}
          progressData={data.progress || {}}
        />
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No badges available yet.</p>
        </div>
      )}

      {selectedBadge && isModalOpen && (
        <BadgeDetailsModal
          badge={selectedBadge}
          isEarned={data.userBadges?.some((ub) => ub.badge_id === selectedBadge.id) || false}
          progress={data.progress?.[selectedBadge.id]}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}
