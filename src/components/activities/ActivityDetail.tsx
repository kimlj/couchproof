'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/shared/Badge';
import { formatDistance, formatDuration, formatDateTime } from '@/lib/utils/formatters';
import type { Activity } from '@/types';

interface ActivityDetailProps {
  activity: Activity;
}

export function ActivityDetail({ activity }: ActivityDetailProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">{activity.name}</h1>
          <p className="text-muted-foreground">{formatDateTime(activity.startDate)}</p>
        </div>
        <Badge variant="primary" size="lg">
          {activity.type}
        </Badge>
      </div>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Activity Stats</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Distance</p>
            <p className="text-2xl font-bold">{formatDistance(activity.distance)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Duration</p>
            <p className="text-2xl font-bold">{formatDuration(activity.duration)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Elevation Gain</p>
            <p className="text-2xl font-bold">{activity.elevation || 0}m</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Type</p>
            <p className="text-2xl font-bold">{activity.type}</p>
          </div>
        </div>
      </Card>

      {activity.description && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Description</h2>
          <p className="text-muted-foreground">{activity.description}</p>
        </Card>
      )}
    </div>
  );
}
