'use client';

import { useState } from 'react';
import { ActivityCard } from './ActivityCard';
import { ActivityDetailModal } from './ActivityDetailModal';
import { EmptyState } from '@/components/shared/EmptyState';
import { Activity as ActivityIcon } from 'lucide-react';

interface ActivityData {
  id: string;
  name: string;
  type: string;
  sportType?: string;
  distance: number;
  movingTime: number;
  elapsedTime?: number;
  totalElevationGain?: number;
  startDate: string;
  startDateLocal?: string;
  averageSpeed?: number;
  maxSpeed?: number;
  averageHeartrate?: number;
  maxHeartrate?: number;
  averageWatts?: number;
  maxWatts?: number;
  calories?: number;
  kudosCount?: number;
  commentCount?: number;
  achievementCount?: number;
  prCount?: number;
  description?: string;
  city?: string;
  state?: string;
  country?: string;
  gear?: {
    name: string;
    type: string;
  };
}

interface ActivityListProps {
  activities: ActivityData[];
}

export function ActivityList({ activities }: ActivityListProps) {
  const [selectedActivity, setSelectedActivity] = useState<ActivityData | null>(null);

  if (activities.length === 0) {
    return (
      <div className="text-center py-12">
        <ActivityIcon className="w-16 h-16 text-slate-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">No activities yet</h3>
        <p className="text-slate-400">
          Connect Strava and sync to see your activities here
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {activities.map((activity) => (
          <ActivityCard
            key={activity.id}
            activity={activity}
            onClick={() => setSelectedActivity(activity)}
          />
        ))}
      </div>

      <ActivityDetailModal
        activity={selectedActivity}
        open={!!selectedActivity}
        onClose={() => setSelectedActivity(null)}
      />
    </>
  );
}
