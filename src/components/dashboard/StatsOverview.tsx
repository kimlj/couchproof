'use client';

import { StatCard } from '@/components/shared/StatCard';
import { formatDistance, formatDuration } from '@/lib/utils/formatters';
import type { UserStats } from '@/lib/stats/types';

interface StatsOverviewProps {
  stats: UserStats;
}

export function StatsOverview({ stats }: StatsOverviewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Total Distance"
        value={formatDistance(stats.totalDistance)}
        icon="🏃"
      />
      <StatCard
        title="Total Activities"
        value={stats.totalActivities}
        icon="📊"
      />
      <StatCard
        title="Current Streak"
        value={`${stats.currentStreak} days`}
        icon="🔥"
      />
      <StatCard
        title="Longest Run"
        value={formatDistance(stats.longestRun)}
        icon="🏆"
      />
    </div>
  );
}
