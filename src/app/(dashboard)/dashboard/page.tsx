'use client';

import { useState, useEffect } from 'react';
import PageContainer from '@/components/layout/PageContainer';
import { ActivityDetailModal } from '@/components/activities/ActivityDetailModal';
import { GlassCard, GlassIcon } from '@/components/ui/glass-card';
import { Activity, Brain, Trophy, TrendingUp, Bike, Footprints, Loader2, Heart, Zap, Mountain } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

type ActivityData = {
  id: string;
  name: string;
  type: string;
  sportType?: string;
  startDate: string;
  startDateLocal?: string;
  distance: number;
  movingTime: number;
  elapsedTime?: number;
  totalElevationGain?: number;
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
  gear?: { name: string; type: string };
};

type AthleteStats = {
  recentRideCount: number;
  recentRunCount: number;
  ytdRideDistance: number;
  ytdRunDistance: number;
  allRideCount: number;
  allRunCount: number;
};

type StatsData = {
  activityCount: number;
  athleteStats: AthleteStats | null;
};

function formatDistance(meters: number): string {
  const km = meters / 1000;
  return km >= 1000 ? `${(km / 1000).toFixed(1)}k km` : `${km.toFixed(1)} km`;
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

function timeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
  return date.toLocaleDateString();
}

function getActivityIcon(type: string) {
  switch (type?.toLowerCase()) {
    case 'ride':
    case 'virtualride':
      return Bike;
    case 'run':
    case 'virtualrun':
      return Footprints;
    default:
      return Activity;
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
    default:
      return 'from-cyan-500 to-purple-500';
  }
}

export default function DashboardPage() {
  const [activities, setActivities] = useState<ActivityData[]>([]);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [achievementCount, setAchievementCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedActivity, setSelectedActivity] = useState<ActivityData | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [activitiesRes, statsRes, achievementsRes] = await Promise.all([
          fetch('/api/activities?limit=5'),
          fetch('/api/stats'),
          fetch('/api/achievements'),
        ]);

        if (activitiesRes.ok) {
          const activitiesData = await activitiesRes.json();
          setActivities(activitiesData.activities || []);
        }

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }

        if (achievementsRes.ok) {
          const achievementsData = await achievementsRes.json();
          setAchievementCount(achievementsData.unlocked || 0);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const athleteStats = stats?.athleteStats;
  const totalActivities = athleteStats
    ? (athleteStats.allRideCount || 0) + (athleteStats.allRunCount || 0)
    : stats?.activityCount || 0;
  const recentActivities = athleteStats
    ? (athleteStats.recentRideCount || 0) + (athleteStats.recentRunCount || 0)
    : activities.length;
  const totalDistance = athleteStats
    ? (athleteStats.ytdRideDistance || 0) + (athleteStats.ytdRunDistance || 0)
    : 0;

  const statsCards = [
    {
      label: 'Total Activities',
      value: totalActivities.toString(),
      icon: Activity,
      theme: 'blue' as const,
    },
    {
      label: 'This Year',
      value: formatDistance(totalDistance),
      icon: TrendingUp,
      theme: 'emerald' as const,
    },
    {
      label: 'Recent (4 weeks)',
      value: recentActivities.toString(),
      icon: Brain,
      theme: 'pink' as const,
    },
    {
      label: 'Achievements',
      value: achievementCount.toString(),
      icon: Trophy,
      theme: 'orange' as const,
    },
  ];

  if (loading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">
          Welcome back!
        </h1>
        <p className="text-slate-400">
          Here's your activity summary
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <GlassCard theme={stat.theme} className="p-5">
                <GlassIcon theme={stat.theme} className="mb-4">
                  <Icon className="w-5 h-5" />
                </GlassIcon>
                <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-sm text-slate-400">{stat.label}</div>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>

      {/* Recent Activity Section */}
      <GlassCard theme="slate" className="p-6">
        <h2 className="text-xl font-bold text-white mb-4">Recent Activity</h2>

        {activities.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="w-12 h-12 text-slate-600/50 mx-auto mb-3" />
            <p className="text-slate-400 mb-2">No activities yet</p>
            <p className="text-sm text-slate-500">
              Connect Strava to sync your activities or upload a GPX file
            </p>
          </div>
        ) : (
          <TooltipProvider>
            <div className="space-y-3">
              {activities.map((activity) => {
                const Icon = getActivityIcon(activity.type);
                const activityTheme = activity.type?.toLowerCase().includes('ride') ? 'orange' : 'emerald';
                return (
                  <Tooltip key={activity.id}>
                    <TooltipTrigger asChild>
                      <div>
                        <GlassCard
                          theme={activityTheme as 'orange' | 'emerald'}
                          hover
                          onClick={() => setSelectedActivity(activity)}
                          className="flex items-center gap-4"
                        >
                          <GlassIcon theme={activityTheme as 'orange' | 'emerald'} className="flex-shrink-0">
                            <Icon className="w-5 h-5" />
                          </GlassIcon>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{activity.name}</p>
                            <p className="text-xs text-slate-400">
                              {formatDistance(activity.distance)} • {formatDuration(activity.movingTime)} • {timeAgo(activity.startDate)}
                            </p>
                          </div>
                          {activity.kudosCount !== undefined && activity.kudosCount > 0 && (
                            <span className="text-orange-400 text-sm font-medium">👍 {activity.kudosCount}</span>
                          )}
                        </GlassCard>
                      </div>
                    </TooltipTrigger>
                      <TooltipContent side="right" className="bg-slate-900/95 backdrop-blur-xl border-slate-700/50 p-4 max-w-xs shadow-xl">
                        <div className="space-y-2">
                          <p className="font-semibold text-white">{activity.name}</p>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="text-slate-400">Distance:</span>
                              <span className="text-white ml-1">{formatDistance(activity.distance)}</span>
                            </div>
                            <div>
                              <span className="text-slate-400">Time:</span>
                              <span className="text-white ml-1">{formatDuration(activity.movingTime)}</span>
                            </div>
                            {activity.totalElevationGain && (
                              <div>
                                <span className="text-slate-400">Elevation:</span>
                                <span className="text-white ml-1">{activity.totalElevationGain}m</span>
                              </div>
                            )}
                            {activity.averageSpeed && (
                              <div>
                                <span className="text-slate-400">Speed:</span>
                                <span className="text-white ml-1">{formatSpeed(activity.averageSpeed)}</span>
                              </div>
                            )}
                            {activity.averageHeartrate && (
                              <div className="flex items-center gap-1">
                                <Heart className="w-3 h-3 text-red-400" />
                                <span className="text-white">{Math.round(activity.averageHeartrate)} bpm</span>
                              </div>
                            )}
                            {activity.averageWatts && (
                              <div className="flex items-center gap-1">
                                <Zap className="w-3 h-3 text-yellow-400" />
                                <span className="text-white">{Math.round(activity.averageWatts)} W</span>
                              </div>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-2">Click for full details</p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            </TooltipProvider>
          )}
      </GlassCard>

      {/* Activity Detail Modal */}
      <ActivityDetailModal
        activity={selectedActivity}
        open={!!selectedActivity}
        onClose={() => setSelectedActivity(null)}
      />
    </PageContainer>
  );
}
