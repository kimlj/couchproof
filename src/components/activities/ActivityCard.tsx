'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/shared/Badge';
import { formatDistance, formatDuration, formatRelativeTime, formatSpeed, formatElevation } from '@/lib/utils/formatters';
import { Bike, Footprints, Activity as ActivityIcon, Heart, Zap, Mountain } from 'lucide-react';

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
  averageSpeed?: number;
  maxSpeed?: number;
  averageHeartrate?: number;
  maxHeartrate?: number;
  averageWatts?: number;
  calories?: number;
  kudosCount?: number;
  achievementCount?: number;
  description?: string;
}

interface ActivityCardProps {
  activity: ActivityData;
  onClick?: () => void;
}

function getActivityIcon(type: string) {
  switch (type?.toLowerCase()) {
    case 'ride':
    case 'virtualride':
    case 'ebikeride':
      return Bike;
    case 'run':
    case 'virtualrun':
    case 'trailrun':
      return Footprints;
    default:
      return ActivityIcon;
  }
}

function getActivityColor(type: string) {
  switch (type?.toLowerCase()) {
    case 'ride':
    case 'virtualride':
      return 'from-orange-500 to-red-500';
    case 'run':
    case 'virtualrun':
      return 'from-green-500 to-emerald-500';
    case 'swim':
      return 'from-blue-500 to-cyan-500';
    default:
      return 'from-purple-500 to-pink-500';
  }
}

export function ActivityCard({ activity, onClick }: ActivityCardProps) {
  const Icon = getActivityIcon(activity.type);
  const colorGradient = getActivityColor(activity.type);

  return (
    <Card
      className="p-4 hover:shadow-xl transition-all cursor-pointer hover:scale-[1.01] bg-slate-800/30 backdrop-blur-sm border-slate-700/30 hover:bg-slate-800/50 hover:border-slate-600/50"
      onClick={onClick}
    >
      <div className="flex items-start gap-4">
        {/* Activity Icon */}
        <div className={`p-3 rounded-xl bg-gradient-to-br ${colorGradient} flex-shrink-0`}>
          <Icon className="w-6 h-6 text-white" />
        </div>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between mb-2">
            <div className="min-w-0 flex-1">
              <h3 className="text-base font-semibold text-white truncate">{activity.name}</h3>
              <p className="text-xs text-slate-400">
                {formatRelativeTime(activity.startDate)} • {activity.sportType || activity.type}
              </p>
            </div>
            {activity.kudosCount !== undefined && activity.kudosCount > 0 && (
              <div className="flex items-center gap-1 text-orange-400 text-sm">
                <span>👍</span>
                <span>{activity.kudosCount}</span>
              </div>
            )}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3 mt-3">
            <div>
              <p className="text-xs text-slate-500 mb-0.5">Distance</p>
              <p className="text-sm font-semibold text-white">{formatDistance(activity.distance)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-0.5">Time</p>
              <p className="text-sm font-semibold text-white">{formatDuration(activity.movingTime)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-0.5">Elevation</p>
              <p className="text-sm font-semibold text-white">{formatElevation(activity.totalElevationGain || 0)}</p>
            </div>
          </div>

          {/* Extra Stats */}
          <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
            {activity.averageSpeed && (
              <span>{formatSpeed(activity.averageSpeed)}</span>
            )}
            {activity.averageHeartrate && (
              <span className="flex items-center gap-1">
                <Heart className="w-3 h-3 text-red-400" />
                {Math.round(activity.averageHeartrate)} bpm
              </span>
            )}
            {activity.averageWatts && (
              <span className="flex items-center gap-1">
                <Zap className="w-3 h-3 text-yellow-400" />
                {Math.round(activity.averageWatts)} W
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
