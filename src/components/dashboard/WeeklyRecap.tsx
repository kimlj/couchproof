'use client';

import { useState, useEffect } from 'react';
import { GlassCard, GlassIcon } from '@/components/ui/glass-card';
import { Sparkles, TrendingUp, TrendingDown, Minus, Loader2, RefreshCw } from 'lucide-react';

interface WeeklyRecapProps {
  thisWeek: {
    distance: number;
    activities: number;
    calories: number;
    elevation: number;
    time: number;
  };
  lastWeek: {
    distance: number;
    activities: number;
    calories: number;
    elevation: number;
    time: number;
  };
}

function formatDistance(meters: number): string {
  return `${(meters / 1000).toFixed(1)} km`;
}

function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function getChangePercent(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

function getTrendIcon(change: number) {
  if (change > 5) return TrendingUp;
  if (change < -5) return TrendingDown;
  return Minus;
}

function getTrendColor(change: number): string {
  if (change > 5) return 'text-emerald-400';
  if (change < -5) return 'text-red-400';
  return 'text-slate-400';
}

export function WeeklyRecap({ thisWeek, lastWeek }: WeeklyRecapProps) {
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const distanceChange = getChangePercent(thisWeek.distance, lastWeek.distance);
  const activitiesChange = getChangePercent(thisWeek.activities, lastWeek.activities);
  const caloriesChange = getChangePercent(thisWeek.calories, lastWeek.calories);

  // Generate a fun local summary without API call
  const generateLocalSummary = () => {
    const summaries: string[] = [];

    if (thisWeek.activities === 0) {
      return "🛋️ Rest week? The couch is calling... but so is that PR you've been eyeing!";
    }

    if (distanceChange > 50) {
      summaries.push("You went absolutely BEAST MODE this week! 🚀");
    } else if (distanceChange > 20) {
      summaries.push("Solid progress! You're building momentum 💪");
    } else if (distanceChange > 0) {
      summaries.push("Steady gains! Consistency is key 🔑");
    } else if (distanceChange < -30) {
      summaries.push("Taking it easy? Recovery is part of the game 😴");
    } else if (distanceChange < 0) {
      summaries.push("Slight dip from last week, but you showed up! 👊");
    } else {
      summaries.push("Consistent week! You're in a good rhythm 🎯");
    }

    if (thisWeek.activities >= 5) {
      summaries.push("5+ activities? You're basically a machine!");
    } else if (thisWeek.activities >= 3) {
      summaries.push("Great activity count - keeping that routine tight!");
    }

    if (thisWeek.calories > 3000) {
      summaries.push(`${Math.round(thisWeek.calories)} calories torched 🔥`);
    }

    return summaries.join(' ');
  };

  useEffect(() => {
    setAiSummary(generateLocalSummary());
  }, [thisWeek, lastWeek]);

  const TrendIconDistance = getTrendIcon(distanceChange);
  const TrendIconActivities = getTrendIcon(activitiesChange);

  return (
    <GlassCard theme="purple" className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <GlassIcon theme="purple" className="p-1.5">
            <Sparkles className="w-3.5 h-3.5" />
          </GlassIcon>
          <h3 className="text-sm font-semibold text-white">Weekly Recap</h3>
        </div>
        <span className="text-xs text-slate-500">vs last week</span>
      </div>

      {/* Stats Comparison */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center">
          <p className="text-lg font-bold text-white">{formatDistance(thisWeek.distance)}</p>
          <div className={`flex items-center justify-center gap-1 ${getTrendColor(distanceChange)}`}>
            <TrendIconDistance className="w-3 h-3" />
            <span className="text-xs">{distanceChange > 0 ? '+' : ''}{distanceChange}%</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Distance</p>
        </div>

        <div className="text-center">
          <p className="text-lg font-bold text-white">{thisWeek.activities}</p>
          <div className={`flex items-center justify-center gap-1 ${getTrendColor(activitiesChange)}`}>
            <TrendIconActivities className="w-3 h-3" />
            <span className="text-xs">{activitiesChange > 0 ? '+' : ''}{activitiesChange}%</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Activities</p>
        </div>

        <div className="text-center">
          <p className="text-lg font-bold text-white">{formatTime(thisWeek.time)}</p>
          <div className={`flex items-center justify-center gap-1 ${getTrendColor(getChangePercent(thisWeek.time, lastWeek.time))}`}>
            {(() => {
              const Icon = getTrendIcon(getChangePercent(thisWeek.time, lastWeek.time));
              return <Icon className="w-3 h-3" />;
            })()}
            <span className="text-xs">
              {getChangePercent(thisWeek.time, lastWeek.time) > 0 ? '+' : ''}
              {getChangePercent(thisWeek.time, lastWeek.time)}%
            </span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Time</p>
        </div>
      </div>

      {/* AI Summary */}
      <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
        <p className="text-sm text-slate-300 leading-relaxed">
          {aiSummary || 'Loading your weekly recap...'}
        </p>
      </div>
    </GlassCard>
  );
}
