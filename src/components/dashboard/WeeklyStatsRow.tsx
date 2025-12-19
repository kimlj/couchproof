'use client';

import { GlassCard, GlassIcon } from '@/components/ui/glass-card';
import { TrendingUp, Flame, Activity, Mountain, Timer, Footprints } from 'lucide-react';
import { motion } from 'framer-motion';

interface WeeklyStatsRowProps {
  weeklyDistance: number; // meters
  weeklyCalories: number;
  weeklyActivities: number;
  weeklyElevation: number; // meters
  weeklyTime: number; // seconds
  recentActivities4Weeks: number;
}

function formatDistance(meters: number): string {
  const km = meters / 1000;
  return km >= 100 ? `${km.toFixed(0)}` : `${km.toFixed(1)}`;
}

function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

function formatCalories(cal: number): string {
  if (cal >= 1000) {
    return `${(cal / 1000).toFixed(1)}k`;
  }
  return cal.toFixed(0);
}

export function WeeklyStatsRow({
  weeklyDistance,
  weeklyCalories,
  weeklyActivities,
  weeklyElevation,
  weeklyTime,
  recentActivities4Weeks,
}: WeeklyStatsRowProps) {
  const stats = [
    {
      label: 'Total Weekly Distance',
      value: formatDistance(weeklyDistance),
      unit: 'km',
      icon: TrendingUp,
      theme: 'emerald' as const,
      highlight: true,
    },
    {
      label: 'Calories Burned',
      value: formatCalories(weeklyCalories),
      unit: 'kcal',
      icon: Flame,
      theme: 'orange' as const,
    },
    {
      label: 'Training Load',
      value: weeklyActivities.toString(),
      unit: weeklyActivities === 1 ? 'activity' : 'activities',
      icon: Activity,
      theme: 'blue' as const,
    },
    {
      label: 'Recent 4 Weeks',
      value: recentActivities4Weeks.toString(),
      unit: 'activities',
      icon: Footprints,
      theme: 'pink' as const,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <GlassCard theme={stat.theme} className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-400 truncate">{stat.label}</span>
                <GlassIcon theme={stat.theme} className="p-1.5">
                  <Icon className="w-3.5 h-3.5" />
                </GlassIcon>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className={`text-2xl font-bold ${stat.highlight ? 'text-emerald-400' : 'text-white'}`}>
                  {stat.value}
                </span>
                <span className="text-xs text-slate-500">{stat.unit}</span>
              </div>
            </GlassCard>
          </motion.div>
        );
      })}
    </div>
  );
}
