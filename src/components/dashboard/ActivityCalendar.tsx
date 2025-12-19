'use client';

import type { Activity } from '@/types';

interface ActivityCalendarProps {
  activities: Activity[];
}

export function ActivityCalendar({ activities }: ActivityCalendarProps) {
  // TODO: Implement calendar heatmap view
  return (
    <div className="border rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Activity Calendar</h3>
      <div className="aspect-video flex items-center justify-center text-muted-foreground">
        Calendar heatmap visualization will go here
      </div>
    </div>
  );
}
