import React, { useState, useEffect } from 'react';
import { PointsCard } from './PointsCard';
import { BadgeGrid } from './BadgeGrid';
import { StreakDisplay } from './StreakDisplay';
import { AchievementTimeline } from './AchievementTimeline';
import { LeaderboardTable } from './LeaderboardTable';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { Alert } from '../ui/Alert';
import { Tabs, Trophy, Award, Flame, Target, History, Layout } from 'lucide-react';

interface GamificationDashboardProps {
  userId: string;
}

export function GamificationDashboard({ userId }: GamificationDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'badges' | 'achievements' | 'leaderboard'>('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for gamification data
  const [pointsData, setPointsData] = useState({
    totalPoints: 0,
    breakdown: {
      courseCompletion: 0,
      quiz: 0,
      assignment: 0,
      discussion: 0,
      streakBonus: 0
    },
    earningRate: 0,
    lastUpdated: ''
  });

  const [streakData, setStreakData] = useState({
    currentStreak: 0,
    longestStreak: 0,
    lastActivityDate: '',
    nextMilestone: 30
  });

  const [badges, setBadges] = useState<any[]>([]);
  const [userBadges, setuserBadges] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [unlockedAchievements, setUnlockedAchievements] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [userRank, setUserRank] = useState<number | undefined>();

  useEffect(() => {
    fetchGamificationData();
  }, [userId]);

  const fetchGamificationData = async () => {
    try {
      setLoading(true);
      setError(null);

      // In a real implementation, these would be actual API calls
      // For now, we'll simulate the data structure

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Set mock data
      setPointsData({
        totalPoints: 2500,
        breakdown: {
          courseCompletion: 1000,
          quiz: 600,
          assignment: 500,
          discussion: 200,
          streakBonus: 200
        },
        earningRate: 45,
        lastUpdated: new Date().toISOString()
      });

      setStreakData({
        currentStreak: 12,
        longestStreak: 21,
        lastActivityDate: new Date().toISOString(),
        nextMilestone: 30
      });

      setBadges([]);
      setuserBadges([]);
      setAchievements([]);
      setUnlockedAchievements([]);
      setLeaderboard([]);
      setUserRank(15);

    } catch (err) {
      setError('Failed to load gamification data. Please try again.');
      console.error('Error fetching gamification data:', err);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'overview' as const, label: 'Overview', icon: Layout },
    { id: 'badges' as const, label: 'Badges', icon: Award },
    { id: 'achievements' as const, label: 'Achievements', icon: Trophy },
    { id: 'leaderboard' as const, label: 'Leaderboard', icon: Target }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert type="error" message={error} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Gamification Dashboard
        </h1>
        <p className="text-gray-600">
          Track your progress, earn badges, and compete with others!
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="flex border-b border-gray-200 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-6 py-4 font-medium transition-colors whitespace-nowrap
                  ${activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Points Card */}
              <div>
                <PointsCard
                  totalPoints={pointsData.totalPoints}
                  breakdown={pointsData.breakdown}
                  earningRate={pointsData.earningRate}
                  lastUpdated={pointsData.lastUpdated}
                />
              </div>

              {/* Streak Display */}
              <div>
                <StreakDisplay
                  currentStreak={streakData.currentStreak}
                  longestStreak={streakData.longestStreak}
                  lastActivityDate={streakData.lastActivityDate}
                  nextMilestone={streakData.nextMilestone}
                />
              </div>

              {/* Quick Stats */}
              <div className="lg:col-span-2">
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Target className="w-6 h-6 text-purple-600" />
                    Quick Stats
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <div className="text-2xl font-bold text-blue-600">
                        {pointsData.totalPoints.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">Total Points</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <div className="text-2xl font-bold text-yellow-600">
                        {userBadges.length}
                      </div>
                      <div className="text-sm text-gray-600">Badges Earned</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <div className="text-2xl font-bold text-green-600">
                        {streakData.currentStreak}
                      </div>
                      <div className="text-sm text-gray-600">Day Streak</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <div className="text-2xl font-bold text-purple-600">
                        #{userRank || '-'}
                      </div>
                      <div className="text-sm text-gray-600">Your Rank</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'badges' && (
            <div>
              <BadgeGrid
                badges={badges}
                userBadges={userBadges}
                showProgress={true}
                progressData={{}}
              />
            </div>
          )}

          {activeTab === 'achievements' && (
            <div>
              <AchievementTimeline
                achievements={achievements}
                unlockedAchievements={unlockedAchievements}
              />
            </div>
          )}

          {activeTab === 'leaderboard' && (
            <div>
              <LeaderboardTable
                leaderboard={leaderboard}
                period="all_time"
                userRank={userRank}
                userId={userId}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
