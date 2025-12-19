'use client';

import { GlassCard, GlassIcon } from '@/components/ui/glass-card';
import { Activity, Bike, Footprints, ThumbsUp, Clock, TrendingUp, Heart, Mountain, Zap } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ActivityItem {
  id: string;
  name: string;
  type: string;
  distance: number;
  movingTime: number;
  startDate: string;
  kudosCount?: number;
  city?: string;
  totalElevationGain?: number;
  averageHeartrate?: number;
  averageSpeed?: number;
  calories?: number;
}

interface StravaFeedProps {
  activities: ActivityItem[];
  maxItems?: number;
  onActivityClick?: (activity: ActivityItem) => void;
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

function formatSpeed(speedMs: number): string {
  const kmh = speedMs * 3.6;
  return `${kmh.toFixed(1)} km/h`;
}

function formatPace(speedMs: number): string {
  if (speedMs <= 0) return '--:--';
  const paceSecsPerKm = 1000 / speedMs;
  const mins = Math.floor(paceSecsPerKm / 60);
  const secs = Math.floor(paceSecsPerKm % 60);
  return `${mins}:${secs.toString().padStart(2, '0')} /km`;
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

function isRunType(type: string): boolean {
  return ['run', 'virtualrun', 'trailrun'].includes(type?.toLowerCase());
}

export function StravaFeed({ activities, maxItems = 4, onActivityClick }: StravaFeedProps) {
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
        <TooltipProvider>
          <div className="space-y-2.5">
            {displayActivities.map((activity) => {
              const Icon = getActivityIcon(activity.type);
              const color = getActivityColor(activity.type);
              const isRun = isRunType(activity.type);

              return (
                <Tooltip key={activity.id}>
                  <TooltipTrigger asChild>
                    <div
                      onClick={() => onActivityClick?.(activity)}
                      className="flex items-center gap-3 p-2 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 transition-all cursor-pointer hover:scale-[1.01]"
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
                  </TooltipTrigger>
                  <TooltipContent
                    side="left"
                    className="bg-slate-900/95 backdrop-blur-xl border-slate-700/50 p-4 max-w-xs shadow-xl"
                  >
                    <div className="space-y-3">
                      <div>
                        <p className="font-semibold text-white">{activity.name}</p>
                        <p className="text-xs text-slate-400">
                          {new Date(activity.startDate).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
                          <div>
                            <p className="text-xs text-slate-500">Distance</p>
                            <p className="text-sm font-medium text-white">{formatDistance(activity.distance)}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-blue-400" />
                          <div>
                            <p className="text-xs text-slate-500">Duration</p>
                            <p className="text-sm font-medium text-white">{formatDuration(activity.movingTime)}</p>
                          </div>
                        </div>

                        {activity.averageSpeed && (
                          <div className="flex items-center gap-2">
                            <Zap className="w-3.5 h-3.5 text-yellow-400" />
                            <div>
                              <p className="text-xs text-slate-500">{isRun ? 'Pace' : 'Speed'}</p>
                              <p className="text-sm font-medium text-white">
                                {isRun ? formatPace(activity.averageSpeed) : formatSpeed(activity.averageSpeed)}
                              </p>
                            </div>
                          </div>
                        )}

                        {activity.totalElevationGain && activity.totalElevationGain > 0 && (
                          <div className="flex items-center gap-2">
                            <Mountain className="w-3.5 h-3.5 text-emerald-400" />
                            <div>
                              <p className="text-xs text-slate-500">Elevation</p>
                              <p className="text-sm font-medium text-white">{Math.round(activity.totalElevationGain)}m</p>
                            </div>
                          </div>
                        )}

                        {activity.averageHeartrate && (
                          <div className="flex items-center gap-2">
                            <Heart className="w-3.5 h-3.5 text-red-400" />
                            <div>
                              <p className="text-xs text-slate-500">Avg HR</p>
                              <p className="text-sm font-medium text-white">{Math.round(activity.averageHeartrate)} bpm</p>
                            </div>
                          </div>
                        )}

                        {activity.calories && activity.calories > 0 && (
                          <div className="flex items-center gap-2">
                            <Activity className="w-3.5 h-3.5 text-orange-400" />
                            <div>
                              <p className="text-xs text-slate-500">Calories</p>
                              <p className="text-sm font-medium text-white">{Math.round(activity.calories)} kcal</p>
                            </div>
                          </div>
                        )}
                      </div>

                      <p className="text-xs text-slate-500 pt-1 border-t border-slate-700/50">
                        Click for full details
                      </p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </TooltipProvider>
      )}
    </GlassCard>
  );
}
