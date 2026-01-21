import React, { useState, useEffect } from 'react';
import { Award, TrendingUp, Clock } from 'lucide-react';

interface PointsBreakdown {
  courseCompletion: number;
  quiz: number;
  assignment: number;
  discussion: number;
  streakBonus: number;
}

interface PointsCardProps {
  totalPoints: number;
  breakdown: PointsBreakdown;
  earningRate?: number;
  lastUpdated?: string;
}

export function PointsCard({
  totalPoints,
  breakdown,
  earningRate = 0,
  lastUpdated
}: PointsCardProps) {
  const [displayPoints, setDisplayPoints] = useState(0);

  useEffect(() => {
    const duration = 1000;
    const steps = 60;
    const increment = totalPoints / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= totalPoints) {
        setDisplayPoints(totalPoints);
        clearInterval(timer);
      } else {
        setDisplayPoints(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [totalPoints]);

  const breakdownItems = [
    { key: 'courseCompletion', label: 'Course Completion', value: breakdown.courseCompletion, color: 'bg-blue-500' },
    { key: 'quiz', label: 'Quizzes', value: breakdown.quiz, color: 'bg-green-500' },
    { key: 'assignment', label: 'Assignments', value: breakdown.assignment, color: 'bg-purple-500' },
    { key: 'discussion', label: 'Discussions', value: breakdown.discussion, color: 'bg-orange-500' },
    { key: 'streakBonus', label: 'Streak Bonus', value: breakdown.streakBonus, color: 'bg-red-500' },
  ];

  const formatTimeAgo = (dateString?: string) => {
    if (!dateString) return 'Just now';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Award className="w-8 h-8 text-yellow-500" />
          Points Overview
        </h2>
        {earningRate > 0 && (
          <div className="flex items-center gap-1 text-green-600 bg-green-50 px-3 py-1 rounded-full text-sm font-medium">
            <TrendingUp className="w-4 h-4" />
            +{earningRate}/day
          </div>
        )}
      </div>

      {/* Total Points Display */}
      <div className="text-center py-8 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl mb-6">
        <div className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-orange-600 mb-2">
          {displayPoints.toLocaleString()}
        </div>
        <div className="text-gray-600 font-medium">Total Points</div>
      </div>

      {/* Breakdown by Category */}
      <div className="space-y-4 mb-6">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
          Points Breakdown
        </h3>
        {breakdownItems.map((item) => {
          const percentage = totalPoints > 0 ? (item.value / totalPoints) * 100 : 0;
          return (
            <div key={item.key} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{item.label}</span>
                <span className="text-sm font-semibold text-gray-900">
                  {item.value.toLocaleString()}
                </span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full ${item.color} transition-all duration-1000 ease-out`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Last Updated */}
      {lastUpdated && (
        <div className="flex items-center justify-center text-sm text-gray-500 pt-4 border-t">
          <Clock className="w-4 h-4 mr-2" />
          Updated {formatTimeAgo(lastUpdated)}
        </div>
      )}
    </div>
  );
}
