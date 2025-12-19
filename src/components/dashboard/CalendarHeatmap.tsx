'use client';

import { useMemo } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { Calendar, Bike, Footprints, Waves, Activity } from 'lucide-react';
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
  weeks?: number;
  onDayClick?: (date: string, activities: ActivityDay['activities']) => void;
}

function getActivityIcon(type: string) {
  switch (type?.toLowerCase()) {
    case 'ride':
    case 'virtualride':
    case 'ebikeride':
    case 'mountainbikeride':
    case 'gravelride':
      return Bike;
    case 'run':
    case 'virtualrun':
    case 'trailrun':
      return Footprints;
    case 'swim':
      return Waves;
    default:
      return Activity;
  }
}

function getActivityEmoji(type: string): string {
  switch (type?.toLowerCase()) {
    case 'ride':
    case 'virtualride':
    case 'ebikeride':
    case 'mountainbikeride':
    case 'gravelride':
      return '🚴';
    case 'run':
    case 'virtualrun':
    case 'trailrun':
      return '🏃';
    case 'swim':
      return '🏊';
    case 'walk':
    case 'hike':
      return '🚶';
    case 'yoga':
      return '🧘';
    case 'weighttraining':
      return '🏋️';
    default:
      return '💪';
  }
}

function formatDistance(meters: number): string {
  const km = meters / 1000;
  return `${km.toFixed(1)} km`;
}

export function CalendarHeatmap({ activities, weeks = 12, onDayClick }: CalendarHeatmapProps) {
  const { grid, activityMap, totalDays, activeDays, currentStreak } = useMemo(() => {
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

    // Generate grid for last N weeks
    const today = new Date();
    const grid: Array<Array<{ date: string; data: ActivityDay | null; isFuture: boolean }>> = [];

    // Start from the most recent Sunday
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - startDate.getDay() - (weeks - 1) * 7);

    let totalDays = 0;
    let activeDays = 0;

    // Calculate current streak
    let currentStreak = 0;
    const checkDate = new Date(today);
    while (true) {
      const dateStr = checkDate.toISOString().split('T')[0];
      if (activityMap.has(dateStr)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    for (let week = 0; week < weeks; week++) {
      const weekData: Array<{ date: string; data: ActivityDay | null; isFuture: boolean }> = [];
      for (let day = 0; day < 7; day++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + week * 7 + day);

        const isFuture = currentDate > today;
        const dateStr = currentDate.toISOString().split('T')[0];
        const data = activityMap.get(dateStr) || null;

        weekData.push({ date: dateStr, data, isFuture });

        if (!isFuture) {
          totalDays++;
          if (data) activeDays++;
        }
      }
      grid.push(weekData);
    }

    return { grid, activityMap, totalDays, activeDays, currentStreak };
  }, [activities, weeks]);

  const consistencyRate = totalDays > 0 ? Math.round((activeDays / totalDays) * 100) : 0;

  return (
    <GlassCard theme="emerald" className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-white">Activity Calendar</h3>
          <p className="text-xs text-slate-500">{currentStreak > 0 ? `🔥 ${currentStreak} day streak` : 'Start your streak!'}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-emerald-400 font-medium">{consistencyRate}%</span>
          <Calendar className="w-4 h-4 text-slate-500" />
        </div>
      </div>

      <TooltipProvider>
        <div className="flex gap-1">
          {/* Day labels */}
          <div className="flex flex-col gap-1 pr-1">
            <div className="h-3.5 text-[10px] text-slate-600"></div>
            <div className="h-3.5 text-[10px] text-slate-600 flex items-center">M</div>
            <div className="h-3.5 text-[10px] text-slate-600"></div>
            <div className="h-3.5 text-[10px] text-slate-600 flex items-center">W</div>
            <div className="h-3.5 text-[10px] text-slate-600"></div>
            <div className="h-3.5 text-[10px] text-slate-600 flex items-center">F</div>
            <div className="h-3.5 text-[10px] text-slate-600"></div>
          </div>

          {/* Grid */}
          <div className="flex gap-1 flex-1 overflow-hidden">
            {grid.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-1">
                {week.map((day, dayIndex) => {
                  if (day.isFuture) {
                    return (
                      <div
                        key={`${weekIndex}-${dayIndex}`}
                        className="w-3.5 h-3.5 rounded-sm bg-transparent"
                      />
                    );
                  }

                  const hasActivity = day.data && day.data.count > 0;
                  const activityCount = day.data?.count || 0;
                  const types = day.data?.types || [];

                  // Determine what to show
                  let content: React.ReactNode = null;
                  let bgClass = 'bg-slate-800/50';

                  if (hasActivity) {
                    if (activityCount === 1) {
                      // Single activity - show icon
                      const Icon = getActivityIcon(types[0]);
                      bgClass = 'bg-emerald-500/20';
                      content = <Icon className="w-2 h-2 text-emerald-400" />;
                    } else {
                      // Multiple activities - show count
                      bgClass = 'bg-emerald-500/40';
                      content = <span className="text-[8px] font-bold text-emerald-300">{activityCount}</span>;
                    }
                  }

                  return (
                    <Tooltip key={`${weekIndex}-${dayIndex}`}>
                      <TooltipTrigger asChild>
                        <div
                          onClick={() => hasActivity && onDayClick?.(day.date, day.data!.activities)}
                          className={`w-3.5 h-3.5 rounded-sm transition-all flex items-center justify-center ${bgClass} ${hasActivity ? 'cursor-pointer hover:scale-110 hover:ring-1 hover:ring-emerald-400/50' : ''}`}
                        >
                          {content}
                        </div>
                      </TooltipTrigger>
                      {hasActivity && day.data && (
                        <TooltipContent
                          side="top"
                          className="bg-slate-900/95 backdrop-blur-xl border-slate-700/50 p-3 shadow-xl"
                        >
                          <div className="space-y-2">
                            <p className="text-xs font-medium text-white">
                              {new Date(day.date).toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </p>
                            <div className="space-y-1.5">
                              {day.data.activities.map((act, i) => (
                                <div key={i} className="flex items-center gap-2 text-xs">
                                  <span>{getActivityEmoji(act.type)}</span>
                                  <span className="text-slate-300 truncate max-w-[120px]">{act.name}</span>
                                  <span className="text-slate-500">{formatDistance(act.distance)}</span>
                                </div>
                              ))}
                            </div>
                            <p className="text-[10px] text-slate-500 pt-1 border-t border-slate-700/50">
                              Total: {formatDistance(day.data.distance)}
                            </p>
                          </div>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </TooltipProvider>

      {/* Legend */}
      <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-700/30">
        <div className="flex items-center gap-3 text-[10px] text-slate-500">
          <span className="flex items-center gap-1">
            <Bike className="w-2.5 h-2.5" /> Ride
          </span>
          <span className="flex items-center gap-1">
            <Footprints className="w-2.5 h-2.5" /> Run
          </span>
          <span className="flex items-center gap-1">
            <span className="text-[8px] font-bold bg-emerald-500/40 rounded px-1">2+</span> Multi
          </span>
        </div>
        <span className="text-[10px] text-slate-500">{activeDays} active days</span>
      </div>
    </GlassCard>
  );
}
