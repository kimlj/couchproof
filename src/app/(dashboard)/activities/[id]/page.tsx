'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { PageContainer } from '@/components/layout/PageContainer';
import { ActivityDetail } from '@/components/activities/ActivityDetail';
import { ActivityMap } from '@/components/activities/ActivityMap';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import type { Activity } from '@/types';

export default function ActivityDetailPage() {
  const params = useParams();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const response = await fetch(`/api/activities/${params.id}`);
        if (!response.ok) throw new Error('Failed to fetch activity');
        const data = await response.json();
        setActivity(data.activity);
      } catch (error) {
        console.error('Error fetching activity:', error);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchActivity();
    }
  }, [params.id]);

  if (loading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner size="lg" />
        </div>
      </PageContainer>
    );
  }

  if (!activity) {
    return (
      <PageContainer>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Activity not found</p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="space-y-6">
        {activity.polyline && <ActivityMap polyline={activity.polyline} />}
        <ActivityDetail activity={activity} />
      </div>
    </PageContainer>
  );
}
