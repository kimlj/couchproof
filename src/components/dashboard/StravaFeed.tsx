'use client';

import { GlassCard, GlassIcon } from '@/components/ui/glass-card';
import { Activity, Bike, Footprints, ThumbsUp, Clock } from 'lucide-react';

interface ActivityItem {
  id: string;
  name: string;
  type: string;
  distance: number;
  movingTime: number;
  startDate: string;
  kudosCount?: number;
  city?: string;
}

interface StravaFeedProps {
  activities: ActivityItem[];
  maxItems?: number;
}

function formatDistance(meters: number): string {
  const km = meters / 1000;
  return `${km.toFixed(1)} km`;
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

function timeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getActivityIcon(type: string) {
  switch (type?.toLowerCase()) {
    case 'ride':
    case 'virtualride':
    case 'ebikeride':
    case 'mountainbikeride':
    case 'gravelride':
      return Bike;
    case 'run':
    case 'virtualrun':
    case 'trailrun':
      return Footprints;
    default:
      return Activity;
  }
}

function getActivityColor(type: string): 'orange' | 'emerald' | 'cyan' {
  switch (type?.toLowerCase()) {
    case 'ride':
    case 'virtualride':
    case 'ebikeride':
    case 'mountainbikeride':
    case 'gravelride':
      return 'orange';
    case 'run':
    case 'virtualrun':
    case 'trailrun':
      return 'emerald';
    default:
      return 'cyan';
  }
}

export function StravaFeed({ activities, maxItems = 4 }: StravaFeedProps) {
  const displayActivities = activities.slice(0, maxItems);

  return (
    <GlassCard theme="slate" className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white">Strava Feed Lite</h3>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-xs text-slate-500">Live</span>
        </div>
      </div>

      {displayActivities.length === 0 ? (
        <div className="py-6 text-center">
          <Activity className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <p className="text-sm text-slate-500">No recent activities</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {displayActivities.map((activity) => {
            const Icon = getActivityIcon(activity.type);
            const color = getActivityColor(activity.type);
            return (
              <div
                key={activity.id}
                className="flex items-center gap-3 p-2 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 transition-colors cursor-pointer"
              >
                <GlassIcon theme={color} className="p-1.5 flex-shrink-0">
                  <Icon className="w-3.5 h-3.5" />
                </GlassIcon>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{activity.name}</p>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span>{formatDistance(activity.distance)}</span>
                    <span>•</span>
                    <span>{timeAgo(activity.startDate)}</span>
                  </div>
                </div>
                {activity.kudosCount !== undefined && activity.kudosCount > 0 && (
                  <div className="flex items-center gap-1 text-orange-400">
                    <ThumbsUp className="w-3 h-3" />
                    <span className="text-xs font-medium">{activity.kudosCount}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </GlassCard>
  );
}
