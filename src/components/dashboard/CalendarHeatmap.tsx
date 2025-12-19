'use client';

import { useMemo, useState } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { Calendar, ChevronLeft, ChevronRight, Bike, Footprints, Waves, Dumbbell, Activity, Mountain, Heart } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ActivityDay {
  date: string;
  count: number;
  distance: number;
  types: string[];
  activities: Array<{
    id: string;
    name: string;
    type: string;
    distance: number;
  }>;
}

interface CalendarHeatmapProps {
  activities: Array<{
    id: string;
    name: string;
    startDate: string;
    distance: number;
    type: string;
  }>;
  onDayClick?: (date: string, activities: ActivityDay['activities']) => void;
  onActivityClick?: (activityId: string) => void;
}

// Comprehensive activity type mapping
function getActivityIcon(type: string) {
  const normalizedType = type?.toLowerCase() || '';

  // Cycling
  if (['ride', 'virtualride', 'ebikeride', 'mountainbikeride', 'gravelride', 'handcycle', 'velomobile'].includes(normalizedType)) {
    return Bike;
  }
  // Running/Walking
  if (['run', 'virtualrun', 'trailrun', 'walk', 'hike'].includes(normalizedType)) {
    return Footprints;
  }
  // Swimming
  if (['swim', 'openwater', 'openswimwater'].includes(normalizedType)) {
    return Waves;
  }
  // Gym/Strength
  if (['weighttraining', 'workout', 'crossfit', 'elliptical', 'stairstepper', 'rowing', 'rockclimbing'].includes(normalizedType)) {
    return Dumbbell;
  }
  // Cardio
  if (['yoga', 'pilates', 'hiit'].includes(normalizedType)) {
    return Heart;
  }
  // Outdoor
  if (['alpineski', 'backcountryski', 'nordicski', 'snowboard', 'snowshoe', 'iceskate', 'inlineskate', 'rollerski'].includes(normalizedType)) {
    return Mountain;
  }
  // Water sports
  if (['canoeing', 'kayaking', 'kitesurf', 'surfing', 'standuppaddling', 'windsurf', 'sailing'].includes(normalizedType)) {
    return Waves;
  }

  return Activity;
}

function getActivityEmoji(type: string): string {
  const normalizedType = type?.toLowerCase() || '';

  // Cycling
  if (['ride', 'virtualride', 'gravelride'].includes(normalizedType)) return '🚴';
  if (['mountainbikeride'].includes(normalizedType)) return '🚵';
  if (['ebikeride'].includes(normalizedType)) return '🔋🚴';

  // Running/Walking
  if (['run', 'virtualrun'].includes(normalizedType)) return '🏃';
  if (['trailrun'].includes(normalizedType)) return '🏃‍♂️🌲';
  if (['walk'].includes(normalizedType)) return '🚶';
  if (['hike'].includes(normalizedType)) return '🥾';

  // Swimming
  if (['swim'].includes(normalizedType)) return '🏊';

  // Gym/Strength
  if (['weighttraining'].includes(normalizedType)) return '🏋️';
  if (['workout', 'crossfit'].includes(normalizedType)) return '💪';
  if (['elliptical', 'stairstepper'].includes(normalizedType)) return '🏃‍♂️';
  if (['rowing'].includes(normalizedType)) return '🚣';
  if (['rockclimbing'].includes(normalizedType)) return '🧗';

  // Mind/Body
  if (['yoga'].includes(normalizedType)) return '🧘';
  if (['pilates'].includes(normalizedType)) return '🤸';

  // Winter Sports
  if (['alpineski', 'backcountryski', 'nordicski'].includes(normalizedType)) return '⛷️';
  if (['snowboard'].includes(normalizedType)) return '🏂';
  if (['snowshoe'].includes(normalizedType)) return '🥾❄️';
  if (['iceskate'].includes(normalizedType)) return '⛸️';

  // Water Sports
  if (['canoeing', 'kayaking'].includes(normalizedType)) return '🛶';
  if (['surfing', 'kitesurf', 'windsurf'].includes(normalizedType)) return '🏄';
  if (['standuppaddling'].includes(normalizedType)) return '🏄‍♂️';
  if (['sailing'].includes(normalizedType)) return '⛵';

  // Other
  if (['golf'].includes(normalizedType)) return '⛳';
  if (['tennis', 'pickleball', 'racquetball', 'squash', 'badminton'].includes(normalizedType)) return '🎾';
  if (['soccer', 'football'].includes(normalizedType)) return '⚽';
  if (['basketball'].includes(normalizedType)) return '🏀';
  if (['volleyball'].includes(normalizedType)) return '🏐';

  return '💪';
}

function formatDistance(meters: number): string {
  if (meters === 0) return '';
  const km = meters / 1000;
  return `${km.toFixed(1)} km`;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export function CalendarHeatmap({ activities, onDayClick, onActivityClick }: CalendarHeatmapProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const { calendarDays, activityMap, monthStats, currentStreak } = useMemo(() => {
    // Create activity map
    const activityMap = new Map<string, ActivityDay>();

    activities.forEach((activity) => {
      const date = new Date(activity.startDate).toISOString().split('T')[0];
      const existing = activityMap.get(date);
      if (existing) {
        existing.count += 1;
        existing.distance += activity.distance;
        if (!existing.types.includes(activity.type)) {
          existing.types.push(activity.type);
        }
        existing.activities.push({
          id: activity.id,
          name: activity.name,
          type: activity.type,
          distance: activity.distance,
        });
      } else {
        activityMap.set(date, {
          date,
          count: 1,
          distance: activity.distance,
          types: [activity.type],
          activities: [{
            id: activity.id,
            name: activity.name,
            type: activity.type,
            distance: activity.distance,
          }],
        });
      }
    });

    // Calculate current streak
    let currentStreak = 0;
    const today = new Date();
    const checkDate = new Date(today);

    while (true) {
      const dateStr = checkDate.toISOString().split('T')[0];
      if (activityMap.has(dateStr)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (currentStreak === 0) {
        // Check yesterday if today has no activity
        checkDate.setDate(checkDate.getDate() - 1);
        const yesterdayStr = checkDate.toISOString().split('T')[0];
        if (activityMap.has(yesterdayStr)) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      } else {
        break;
      }
    }

    // Generate calendar for current month
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();

    const calendarDays: Array<{ date: string; day: number; isCurrentMonth: boolean; data: ActivityDay | null; isToday: boolean; isFuture: boolean }> = [];

    // Previous month days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const day = prevMonthLastDay - i;
      const date = new Date(year, month - 1, day).toISOString().split('T')[0];
      calendarDays.push({
        date,
        day,
        isCurrentMonth: false,
        data: activityMap.get(date) || null,
        isToday: false,
        isFuture: false,
      });
    }

    // Current month days
    const todayStr = new Date().toISOString().split('T')[0];
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day).toISOString().split('T')[0];
      const isToday = date === todayStr;
      const isFuture = new Date(date) > new Date();
      calendarDays.push({
        date,
        day,
        isCurrentMonth: true,
        data: activityMap.get(date) || null,
        isToday,
        isFuture,
      });
    }

    // Next month days to fill the grid
    const remainingDays = 42 - calendarDays.length; // 6 rows * 7 days
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day).toISOString().split('T')[0];
      calendarDays.push({
        date,
        day,
        isCurrentMonth: false,
        data: activityMap.get(date) || null,
        isToday: false,
        isFuture: true,
      });
    }

    // Month stats
    const monthActivities = activities.filter((a) => {
      const actDate = new Date(a.startDate);
      return actDate.getFullYear() === year && actDate.getMonth() === month;
    });

    const monthStats = {
      activities: monthActivities.length,
      distance: monthActivities.reduce((sum, a) => sum + a.distance, 0),
      activeDays: new Set(monthActivities.map((a) => new Date(a.startDate).toISOString().split('T')[0])).size,
    };

    return { calendarDays, activityMap, monthStats, currentStreak };
  }, [activities, currentDate]);

  const goToPrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <GlassCard theme="emerald" className="p-2.5">
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-medium text-white">
          {currentStreak > 0 && <span className="text-orange-400">🔥{currentStreak}</span>}
        </span>
        <div className="flex items-center">
          <button onClick={goToPrevMonth} className="p-0.5 hover:bg-slate-800/50 rounded">
            <ChevronLeft className="w-3 h-3 text-slate-400" />
          </button>
          <button onClick={goToToday} className="px-1 text-[9px] text-slate-400 hover:text-white">
            {MONTHS[currentDate.getMonth()].slice(0, 3)}
          </button>
          <button onClick={goToNextMonth} className="p-0.5 hover:bg-slate-800/50 rounded">
            <ChevronRight className="w-3 h-3 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-px">
        {DAYS.map((day) => (
          <div key={day} className="text-center text-[7px] text-slate-600">{day.charAt(0)}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <TooltipProvider>
        <div className="grid grid-cols-7 gap-0.5 mt-0.5">
          {calendarDays.map((day, index) => {
            const hasActivity = day.data && day.data.count > 0;
            const activityCount = day.data?.count || 0;
            const types = day.data?.types || [];

            let content: React.ReactNode = <span className="text-[7px]">{day.day}</span>;
            let bgClass = day.isCurrentMonth ? 'bg-slate-800/40' : 'bg-slate-800/20';
            let textClass = day.isCurrentMonth ? 'text-slate-500' : 'text-slate-700';

            if (day.isToday) {
              bgClass = 'bg-cyan-500/30 ring-1 ring-cyan-500/50';
              textClass = 'text-cyan-400';
            }

            if (hasActivity && day.isCurrentMonth) {
              bgClass = activityCount > 1 ? 'bg-emerald-500/40' : 'bg-emerald-500/25';
              content = activityCount > 1
                ? <span className="text-[7px] font-bold text-emerald-300">{activityCount}</span>
                : <span className="text-[9px]">{getActivityEmoji(types[0])}</span>;
            }

            return (
              <Tooltip key={index}>
                <TooltipTrigger asChild>
                  <div
                    onClick={() => {
                      if (hasActivity && day.data) {
                        if (day.data.activities.length === 1 && onActivityClick) {
                          onActivityClick(day.data.activities[0].id);
                        } else if (onDayClick) {
                          onDayClick(day.date, day.data.activities);
                        }
                      }
                    }}
                    className={`aspect-square flex items-center justify-center rounded-sm ${bgClass} ${textClass} ${hasActivity ? 'cursor-pointer hover:ring-1 hover:ring-emerald-400/50' : ''}`}
                  >
                    {content}
                  </div>
                </TooltipTrigger>
                {hasActivity && day.data && (
                  <TooltipContent side="top" className="bg-slate-900/95 border-slate-700/50 p-2 z-[100]">
                    <p className="text-[10px] font-medium text-white mb-1">
                      {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </p>
                    <div className="space-y-1 max-h-24 overflow-y-auto">
                      {day.data.activities.map((act, i) => (
                        <div key={i} onClick={(e) => { e.stopPropagation(); onActivityClick?.(act.id); }}
                          className="flex items-center gap-1.5 text-[10px] p-0.5 rounded hover:bg-slate-800/50 cursor-pointer">
                          <span>{getActivityEmoji(act.type)}</span>
                          <span className="text-slate-300 truncate max-w-[100px]">{act.name}</span>
                        </div>
                      ))}
                    </div>
                  </TooltipContent>
                )}
              </Tooltip>
            );
          })}
        </div>
      </TooltipProvider>

      {/* Footer */}
      <div className="flex justify-between mt-1 text-[8px] text-slate-600">
        <span>{monthStats.activeDays}d</span>
        <span>{monthStats.activities} 💪</span>
      </div>
    </GlassCard>
  );
}
