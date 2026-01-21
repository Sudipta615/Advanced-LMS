import React, { useState } from 'react';
import { Flame, Calendar as CalendarIcon } from 'lucide-react';

interface CalendarDay {
  date: string;
  intensity: number; // 0-4
  count: number;
  hasActivity: boolean;
}

interface StreakCalendarProps {
  calendarData: CalendarDay[];
  currentStreak?: number;
  onDayClick?: (day: CalendarDay) => void;
}

export function StreakCalendar({
  calendarData,
  currentStreak = 0,
  onDayClick
}: StreakCalendarProps) {
  const [hoveredDay, setHoveredDay] = useState<CalendarDay | null>(null);

  // Sort dates and group by week
  const sortedData = [...calendarData].sort((a, b) =>
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Get unique dates for the last 30 days
  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 29);

  const last30Days: CalendarDay[] = [];
  for (let i = 0; i < 30; i++) {
    const date = new Date(thirtyDaysAgo);
    date.setDate(thirtyDaysAgo.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    const dayData = calendarData.find((d) => d.date === dateStr);

    last30Days.push(
      dayData || {
        date: dateStr,
        intensity: 0,
        count: 0,
        hasActivity: false
      }
    );
  }

  // Organize into weeks (7 days each)
  const weeks: CalendarDay[][] = [];
  for (let i = 0; i < last30Days.length; i += 7) {
    weeks.push(last30Days.slice(i, i + 7));
  }

  // Get intensity color
  const getIntensityColor = (intensity: number): string => {
    switch (intensity) {
      case 0:
        return 'bg-gray-100 hover:bg-gray-200';
      case 1:
        return 'bg-green-200 hover:bg-green-300';
      case 2:
        return 'bg-green-400 hover:bg-green-500';
      case 3:
        return 'bg-green-600 hover:bg-green-700';
      case 4:
        return 'bg-green-800 hover:bg-green-900';
      default:
        return 'bg-gray-100';
    }
  };

  const getIntensityLabel = (intensity: number): string => {
    switch (intensity) {
      case 0:
        return 'No activity';
      case 1:
        return 'Low';
      case 2:
        return 'Medium';
      case 3:
        return 'High';
      case 4:
        return 'Very high';
      default:
        return 'No activity';
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const isToday = (dateStr: string) => {
    return dateStr === today.toISOString().split('T')[0];
  };

  const getMonthLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short' });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Flame className="w-8 h-8 text-orange-500" />
          Activity Calendar
        </h2>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span className="font-semibold text-orange-600">{currentStreak}</span>
          <span>day streak</span>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="space-y-1">
        {/* Weekday Labels */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-xs text-gray-500 text-center font-medium">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Rows */}
        <div className="space-y-1">
          {weeks.map((week, weekIndex) => {
            const firstDayOfWeek = week[0];
            const showMonthLabel = weekIndex === 0 || new Date(firstDayOfWeek.date).getDate() <= 7;

            return (
              <div key={weekIndex} className="flex items-center gap-1">
                {/* Month Label */}
                {showMonthLabel && (
                  <div className="w-8 text-xs text-gray-500 font-medium">
                    {getMonthLabel(firstDayOfWeek.date)}
                  </div>
                )}
                {!showMonthLabel && <div className="w-8" />}

                {/* Days */}
                <div className="grid grid-cols-7 gap-1 flex-1">
                  {week.map((day) => (
                    <button
                      key={day.date}
                      onClick={() => onDayClick?.(day)}
                      onMouseEnter={() => setHoveredDay(day)}
                      onMouseLeave={() => setHoveredDay(null)}
                      className={`
                        relative w-8 h-8 rounded transition-all duration-200
                        ${getIntensityColor(day.intensity)}
                        ${isToday(day.date) ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
                        hover:scale-110 hover:z-10
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                      `}
                      aria-label={`${formatDate(day.date)}: ${day.count} activities (${getIntensityLabel(day.intensity)})`}
                      title={`${formatDate(day.date)}: ${day.count} activities`}
                    >
                      {day.hasActivity && day.count > 0 && (
                        <span className="absolute bottom-0.5 right-0.5 w-1.5 h-1.5 bg-blue-500 rounded-full" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Less</span>
          {[0, 1, 2, 3, 4].map((level) => (
            <div
              key={level}
              className={`w-4 h-4 rounded ${getIntensityColor(level)}`}
              title={getIntensityLabel(level)}
            />
          ))}
          <span className="text-xs text-gray-500">More</span>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-600">
          <div className="w-4 h-4 rounded bg-gray-100 ring-2 ring-blue-500 ring-offset-2" />
          <span>Today</span>
        </div>
      </div>

      {/* Hover Tooltip */}
      {hoveredDay && (
        <div className="fixed bg-gray-900 text-white text-sm rounded-lg p-3 shadow-xl z-50 pointer-events-none">
          <div className="font-semibold mb-1">{formatDate(hoveredDay.date)}</div>
          <div className="text-gray-300">
            {hoveredDay.hasActivity ? (
              <>
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-orange-400" />
                  <span>{hoveredDay.count} activit{hoveredDay.count === 1 ? 'y' : 'ies'}</span>
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {getIntensityLabel(hoveredDay.intensity)} intensity
                </div>
              </>
            ) : (
              <span>No activity</span>
            )}
          </div>
        </div>
      )}

      {/* Stats Summary */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-green-600">
              {calendarData.filter((d) => d.hasActivity).length}
            </div>
            <div className="text-xs text-gray-600">Active days</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">
              {calendarData.reduce((sum, d) => sum + d.count, 0)}
            </div>
            <div className="text-xs text-gray-600">Total activities</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">
              {Math.round((calendarData.filter((d) => d.hasActivity).length / 30) * 100)}%
            </div>
            <div className="text-xs text-gray-600">Activity rate</div>
          </div>
        </div>
      </div>
    </div>
  );
}
