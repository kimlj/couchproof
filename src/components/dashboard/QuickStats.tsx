'use client';

import { useMemo } from 'react';
import { GlassCard, GlassIcon } from '@/components/ui/glass-card';
import { Trophy, Zap, Target, Clock, Mountain, Flame } from 'lucide-react';

interface QuickStatsProps {
  totalDistance: number; // meters
  totalTime: number; // seconds
  totalElevation: number; // meters
  totalCalories: number;
  totalActivities: number;
  longestStreak: number;
}

interface FunStat {
  icon: typeof Trophy;
  label: string;
  value: string;
  description: string;
  theme: 'orange' | 'emerald' | 'cyan' | 'purple' | 'pink' | 'amber';
  bgEmoji: string;
}

export function QuickStats(props: QuickStatsProps) {
  const funStats = useMemo<FunStat[]>(() => {
    const stats: FunStat[] = [];
    const { totalDistance, totalTime, totalElevation, totalCalories, totalActivities, longestStreak } = props;

    // Distance equivalents
    const km = totalDistance / 1000;
    if (km > 0) {
      const marathons = km / 42.195;
      if (marathons >= 1) {
        stats.push({
          icon: Trophy,
          label: 'Marathons Equivalent',
          value: marathons.toFixed(1),
          description: `You've run ${marathons.toFixed(1)} marathon distances!`,
          theme: 'orange',
          bgEmoji: '🏃',
        });
      }

      // Around the world progress (40,075 km)
      const worldPercent = (km / 40075) * 100;
      if (worldPercent >= 0.1) {
        stats.push({
          icon: Target,
          label: 'Around the World',
          value: `${worldPercent.toFixed(2)}%`,
          description: `${worldPercent.toFixed(2)}% of Earth's circumference`,
          theme: 'cyan',
          bgEmoji: '🌍',
        });
      }
    }

    // Elevation - Everests climbed (8,849m)
    if (totalElevation > 0) {
      const everests = totalElevation / 8849;
      stats.push({
        icon: Mountain,
        label: 'Everests Climbed',
        value: everests.toFixed(2),
        description: `${Math.round(totalElevation).toLocaleString()}m total elevation`,
        theme: 'emerald',
        bgEmoji: '🏔️',
      });
    }

    // Calories - Pizzas burned (roughly 2000 cal per pizza)
    if (totalCalories > 0) {
      const pizzas = totalCalories / 2000;
      stats.push({
        icon: Flame,
        label: 'Pizzas Burned',
        value: pizzas.toFixed(1),
        description: `${Math.round(totalCalories).toLocaleString()} total calories`,
        theme: 'pink',
        bgEmoji: '🍕',
      });
    }

    // Streak - prioritize over Active Time
    if (longestStreak > 0) {
      stats.push({
        icon: Zap,
        label: 'Longest Streak',
        value: `${longestStreak} days`,
        description: 'Your best consistency run',
        theme: 'amber',
        bgEmoji: '🔥',
      });
    }

    // Time - Days spent moving (lower priority, may get cut off)
    if (totalTime > 0) {
      const days = totalTime / 86400;
      const hours = totalTime / 3600;
      stats.push({
        icon: Clock,
        label: 'Active Time',
        value: days >= 1 ? `${days.toFixed(1)} days` : `${hours.toFixed(0)}h`,
        description: `${Math.round(hours)} hours of pure effort`,
        theme: 'purple',
        bgEmoji: '⏱️',
      });
    }

    return stats.slice(0, 4); // Show max 4 stats
  }, [props]);

  if (funStats.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {funStats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <GlassCard key={index} theme={stat.theme} className="p-3 relative overflow-hidden">
            {/* Background emoji */}
            <div className="absolute -right-2 -bottom-2 text-6xl opacity-[0.15] pointer-events-none select-none">
              {stat.bgEmoji}
            </div>
            <div className="flex items-start gap-2 relative z-10">
              <GlassIcon theme={stat.theme} className="p-1.5 flex-shrink-0">
                <Icon className="w-3.5 h-3.5" />
              </GlassIcon>
              <div className="min-w-0">
                <p className="text-xs text-slate-400 truncate">{stat.label}</p>
                <p className="text-lg font-bold text-white">{stat.value}</p>
                <p className="text-[10px] text-slate-500 truncate">{stat.description}</p>
              </div>
            </div>
          </GlassCard>
        );
      })}
    </div>
  );
}
