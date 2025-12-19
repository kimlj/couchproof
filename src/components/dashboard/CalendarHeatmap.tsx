'use client';

import { useMemo } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { Calendar } from 'lucide-react';

interface ActivityDay {
  date: string;
  count: number;
  distance?: number;
}

interface CalendarHeatmapProps {
  activities: Array<{
    startDate: string;
    distance: number;
  }>;
  weeks?: number;
}

function getIntensityClass(count: number): string {
  if (count === 0) return 'bg-slate-800/50';
  if (count === 1) return 'bg-emerald-900/60';
  if (count === 2) return 'bg-emerald-700/70';
  if (count === 3) return 'bg-emerald-500/80';
  return 'bg-emerald-400';
}

export function CalendarHeatmap({ activities, weeks = 12 }: CalendarHeatmapProps) {
  const { grid, activityMap, totalDays, activeDays } = useMemo(() => {
    // Create activity map
    const activityMap = new Map<string, ActivityDay>();

    activities.forEach((activity) => {
      const date = new Date(activity.startDate).toISOString().split('T')[0];
      const existing = activityMap.get(date);
      if (existing) {
        existing.count += 1;
        existing.distance = (existing.distance || 0) + activity.distance;
      } else {
        activityMap.set(date, {
          date,
          count: 1,
          distance: activity.distance,
        });
      }
    });

    // Generate grid for last N weeks
    const today = new Date();
    const grid: Array<Array<{ date: string; count: number }>> = [];

    // Start from the most recent Sunday
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - startDate.getDay() - (weeks - 1) * 7);

    let totalDays = 0;
    let activeDays = 0;

    for (let week = 0; week < weeks; week++) {
      const weekData: Array<{ date: string; count: number }> = [];
      for (let day = 0; day < 7; day++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + week * 7 + day);

        // Don't include future dates
        if (currentDate > today) {
          weekData.push({ date: '', count: -1 });
        } else {
          const dateStr = currentDate.toISOString().split('T')[0];
          const activity = activityMap.get(dateStr);
          const count = activity?.count || 0;
          weekData.push({ date: dateStr, count });
          totalDays++;
          if (count > 0) activeDays++;
        }
      }
      grid.push(weekData);
    }

    return { grid, activityMap, totalDays, activeDays };
  }, [activities, weeks]);

  const consistencyRate = totalDays > 0 ? Math.round((activeDays / totalDays) * 100) : 0;

  return (
    <GlassCard theme="emerald" className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white">Calendar Heatmap</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-emerald-400 font-medium">{consistencyRate}%</span>
          <Calendar className="w-4 h-4 text-slate-500" />
        </div>
      </div>

      <div className="flex gap-1">
        {/* Day labels */}
        <div className="flex flex-col gap-1 pr-1">
          <div className="h-3 text-[10px] text-slate-600"></div>
          <div className="h-3 text-[10px] text-slate-600">M</div>
          <div className="h-3 text-[10px] text-slate-600"></div>
          <div className="h-3 text-[10px] text-slate-600">W</div>
          <div className="h-3 text-[10px] text-slate-600"></div>
          <div className="h-3 text-[10px] text-slate-600">F</div>
          <div className="h-3 text-[10px] text-slate-600"></div>
        </div>

        {/* Grid */}
        <div className="flex gap-1 flex-1 overflow-hidden">
          {grid.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-1">
              {week.map((day, dayIndex) => (
                <div
                  key={`${weekIndex}-${dayIndex}`}
                  className={`w-3 h-3 rounded-sm transition-colors ${
                    day.count === -1
                      ? 'bg-transparent'
                      : getIntensityClass(day.count)
                  }`}
                  title={
                    day.date && day.count >= 0
                      ? `${day.date}: ${day.count} ${day.count === 1 ? 'activity' : 'activities'}`
                      : ''
                  }
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-2 mt-3">
        <span className="text-[10px] text-slate-600">Less</span>
        <div className="flex gap-1">
          <div className="w-2.5 h-2.5 rounded-sm bg-slate-800/50" />
          <div className="w-2.5 h-2.5 rounded-sm bg-emerald-900/60" />
          <div className="w-2.5 h-2.5 rounded-sm bg-emerald-700/70" />
          <div className="w-2.5 h-2.5 rounded-sm bg-emerald-500/80" />
          <div className="w-2.5 h-2.5 rounded-sm bg-emerald-400" />
        </div>
        <span className="text-[10px] text-slate-600">More</span>
      </div>
    </GlassCard>
  );
}
