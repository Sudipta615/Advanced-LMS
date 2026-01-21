import React from 'react';
import { Calendar, TrendingUp, Clock } from 'lucide-react';

type PeriodType = 'all_time' | 'monthly' | 'weekly';

interface LeaderboardPeriodTabsProps {
  period: PeriodType;
  onPeriodChange: (period: PeriodType) => void;
}

export function LeaderboardPeriodTabs({
  period,
  onPeriodChange
}: LeaderboardPeriodTabsProps) {
  const tabs = [
    {
      id: 'all_time' as PeriodType,
      label: 'All Time',
      icon: TrendingUp,
      description: 'Overall rankings'
    },
    {
      id: 'monthly' as PeriodType,
      label: 'Monthly',
      icon: Calendar,
      description: 'This month\'s rankings'
    },
    {
      id: 'weekly' as PeriodType,
      label: 'Weekly',
      icon: Clock,
      description: 'This week\'s rankings'
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-2">
      <div className="flex gap-1 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = period === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onPeriodChange(tab.id)}
              className={`
                flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 whitespace-nowrap
                ${isActive
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }
              `}
              aria-label={`${tab.label} leaderboard`}
              aria-pressed={isActive}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Description */}
      <div className="mt-3 px-3">
        <p className="text-sm text-gray-600">
          {tabs.find((t) => t.id === period)?.description}
        </p>
      </div>
    </div>
  );
}
