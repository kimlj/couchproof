'use client';

import { PageContainer } from '@/components/layout/PageContainer';
import { StatsOverview } from '@/components/dashboard/StatsOverview';
import { ActivityCalendar } from '@/components/dashboard/ActivityCalendar';
import { useActivities } from '@/hooks/useActivities';
import { useStats } from '@/hooks/useStats';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { calculateUserStats } from '@/lib/stats/calculateUserStats';

export default function DashboardPage() {
  const { activities, loading: activitiesLoading } = useActivities();
  const { stats, loading: statsLoading } = useStats();

  if (activitiesLoading || statsLoading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner size="lg" />
        </div>
      </PageContainer>
    );
  }

  const userStats = stats || calculateUserStats(activities);

  return (
    <PageContainer title="Dashboard" description="Your fitness overview">
      <div className="space-y-6">
        <StatsOverview stats={userStats} />
        <ActivityCalendar activities={activities} />
      </div>
    </PageContainer>
  );
}
