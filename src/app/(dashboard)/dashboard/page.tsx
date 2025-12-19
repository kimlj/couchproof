'use client';

import { useState, useEffect, useMemo } from 'react';
import PageContainer from '@/components/layout/PageContainer';
import { ActivityDetailModal } from '@/components/activities/ActivityDetailModal';
import { WeeklyStatsRow } from '@/components/dashboard/WeeklyStatsRow';
import { RouteMap } from '@/components/dashboard/RouteMap';
import { StravaFeed } from '@/components/dashboard/StravaFeed';
import { CalendarHeatmap } from '@/components/dashboard/CalendarHeatmap';
import { AthleteStats } from '@/components/dashboard/AthleteStats';
import { WeeklyRecap } from '@/components/dashboard/WeeklyRecap';
import { DailyRoast } from '@/components/dashboard/DailyRoast';
import { WeekComparison } from '@/components/dashboard/WeekComparison';
import { QuickStats } from '@/components/dashboard/QuickStats';
import { GlassCard } from '@/components/ui/glass-card';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

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
  summaryPolyline?: string;
  gear?: { name: string; type: string };
};

type AthleteStatsData = {
  recentRideCount: number;
  recentRunCount: number;
  recentRideDistance: number;
  recentRunDistance: number;
  recentRideMovingTime: number;
  recentRunMovingTime: number;
  recentRideElevationGain: number;
  recentRunElevationGain: number;
  ytdRideDistance: number;
  ytdRunDistance: number;
  ytdRideElevationGain: number;
  ytdRunElevationGain: number;
  allRideCount: number;
  allRunCount: number;
  allRideDistance: number;
  allRunDistance: number;
  allRideElevationGain: number;
  allRunElevationGain: number;
  biggestRideDistance?: number;
  biggestClimbElevationGain?: number;
};

type UserData = {
  name?: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  sex?: string;
  city?: string;
  country?: string;
  stravaFTP?: number;
  stravaWeight?: number;
  stravaFollowerCount?: number;
  stravaFriendCount?: number;
  stravaPremium?: boolean;
};

type StatsData = {
  activityCount: number;
  athleteStats: AthleteStatsData | null;
  stats?: {
    totalDistance: number;
    totalActivities: number;
    totalElevation: number;
    averageHeartRate?: number;
    maxHeartRate?: number;
  };
};

export default function DashboardPage() {
  const [activities, setActivities] = useState<ActivityData[]>([]);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedActivity, setSelectedActivity] = useState<ActivityData | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [activitiesRes, statsRes, userRes] = await Promise.all([
          fetch('/api/activities?limit=100'),
          fetch('/api/stats'),
          fetch('/api/me'),
        ]);

        if (activitiesRes.ok) {
          const activitiesData = await activitiesRes.json();
          setActivities(activitiesData.activities || []);
        }

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }

        if (userRes.ok) {
          const userData = await userRes.json();
          setUser(userData.user);
          if (userData.user?.lastStravaSync) {
            setLastSyncTime(userData.user.lastStravaSync);
          }
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Calculate weekly stats from activities
  const weeklyStats = useMemo(() => {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - 7);

    const weeklyActivities = activities.filter((a) => new Date(a.startDate) >= weekStart);

    return {
      distance: weeklyActivities.reduce((sum, a) => sum + a.distance, 0),
      calories: weeklyActivities.reduce((sum, a) => sum + (a.calories || 0), 0),
      activities: weeklyActivities.length,
      elevation: weeklyActivities.reduce((sum, a) => sum + (a.totalElevationGain || 0), 0),
      time: weeklyActivities.reduce((sum, a) => sum + a.movingTime, 0),
    };
  }, [activities]);

  // Last week stats for comparison
  const lastWeekStats = useMemo(() => {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - 14);
    const weekEnd = new Date(now);
    weekEnd.setDate(now.getDate() - 7);

    const lastWeekActivities = activities.filter((a) => {
      const date = new Date(a.startDate);
      return date >= weekStart && date < weekEnd;
    });

    return {
      distance: lastWeekActivities.reduce((sum, a) => sum + a.distance, 0),
      calories: lastWeekActivities.reduce((sum, a) => sum + (a.calories || 0), 0),
      activities: lastWeekActivities.length,
      elevation: lastWeekActivities.reduce((sum, a) => sum + (a.totalElevationGain || 0), 0),
      time: lastWeekActivities.reduce((sum, a) => sum + a.movingTime, 0),
    };
  }, [activities]);

  // Recent 4 weeks count
  const recent4WeeksCount = useMemo(() => {
    const athleteStats = stats?.athleteStats;
    if (athleteStats) {
      return (athleteStats.recentRideCount || 0) + (athleteStats.recentRunCount || 0);
    }
    const now = new Date();
    const fourWeeksAgo = new Date(now);
    fourWeeksAgo.setDate(now.getDate() - 28);
    return activities.filter((a) => new Date(a.startDate) >= fourWeeksAgo).length;
  }, [activities, stats]);

  // Get last activity with polyline for map
  const lastActivityWithRoute = useMemo(() => {
    return activities.find((a) => a.summaryPolyline);
  }, [activities]);

  // Calculate aggregate heart rate stats
  const heartRateStats = useMemo(() => {
    const activitiesWithHR = activities.filter((a) => a.averageHeartrate);
    if (activitiesWithHR.length === 0) return { avg: undefined, max: undefined };

    const avgHR =
      activitiesWithHR.reduce((sum, a) => sum + (a.averageHeartrate || 0), 0) /
      activitiesWithHR.length;
    const maxHR = Math.max(...activitiesWithHR.map((a) => a.maxHeartrate || 0));

    return { avg: avgHR, max: maxHR > 0 ? maxHR : undefined };
  }, [activities]);

  // Total stats from all activities
  const totalStats = useMemo(() => {
    return {
      distance: activities.reduce((sum, a) => sum + a.distance, 0),
      time: activities.reduce((sum, a) => sum + a.movingTime, 0),
      elevation: activities.reduce((sum, a) => sum + (a.totalElevationGain || 0), 0),
      calories: activities.reduce((sum, a) => sum + (a.calories || 0), 0),
    };
  }, [activities]);

  // Calculate current streak and days since last activity
  const streakInfo = useMemo(() => {
    if (activities.length === 0) {
      return { currentStreak: 0, longestStreak: 0, daysSinceLastActivity: 999 };
    }

    const sortedActivities = [...activities].sort(
      (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    );

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastActivityDate = new Date(sortedActivities[0].startDate);
    lastActivityDate.setHours(0, 0, 0, 0);

    const daysSinceLastActivity = Math.floor(
      (today.getTime() - lastActivityDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Calculate streaks
    const activityDates = new Set(
      activities.map((a) => new Date(a.startDate).toISOString().split('T')[0])
    );

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    const checkDate = new Date(today);

    // Current streak
    while (true) {
      const dateStr = checkDate.toISOString().split('T')[0];
      if (activityDates.has(dateStr)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (currentStreak === 0) {
        // Allow checking yesterday if today has no activity
        checkDate.setDate(checkDate.getDate() - 1);
        const yesterdayStr = checkDate.toISOString().split('T')[0];
        if (activityDates.has(yesterdayStr)) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      } else {
        break;
      }
    }

    // Longest streak (simplified)
    const sortedDates = Array.from(activityDates).sort();
    for (let i = 0; i < sortedDates.length; i++) {
      const current = new Date(sortedDates[i]);
      const prev = i > 0 ? new Date(sortedDates[i - 1]) : null;

      if (prev) {
        const diffDays = Math.floor(
          (current.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24)
        );
        if (diffDays === 1) {
          tempStreak++;
        } else {
          tempStreak = 1;
        }
      } else {
        tempStreak = 1;
      }

      if (tempStreak > longestStreak) {
        longestStreak = tempStreak;
      }
    }

    return { currentStreak, longestStreak, daysSinceLastActivity };
  }, [activities]);

  // Average activities per week
  const avgActivitiesPerWeek = useMemo(() => {
    if (activities.length === 0) return 0;
    const dates = activities.map((a) => new Date(a.startDate).getTime());
    const oldest = Math.min(...dates);
    const newest = Math.max(...dates);
    const weeks = Math.max(1, (newest - oldest) / (1000 * 60 * 60 * 24 * 7));
    return activities.length / weeks;
  }, [activities]);

  // Handle activity click from feed
  const handleActivityClick = (activity: any) => {
    const fullActivity = activities.find((a) => a.id === activity.id);
    if (fullActivity) {
      setSelectedActivity(fullActivity);
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
        </div>
      </PageContainer>
    );
  }

  const athleteStats = stats?.athleteStats;
  const longestDistance = athleteStats?.biggestRideDistance || 0;
  const biggestClimb = athleteStats?.biggestClimbElevationGain || 0;

  return (
    <PageContainer>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">The Proof</h1>
          <p className="text-sm text-slate-400">
            {lastSyncTime
              ? `Synced ${new Date(lastSyncTime).toLocaleDateString()}`
              : "Evidence you're not a couch potato"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-xs text-emerald-400 font-medium">Active</span>
          </div>
        </div>
      </motion.div>

      {/* Row 1: Weekly Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <WeeklyStatsRow
          weeklyDistance={weeklyStats.distance}
          weeklyCalories={weeklyStats.calories}
          weeklyActivities={weeklyStats.activities}
          weeklyElevation={weeklyStats.elevation}
          weeklyTime={weeklyStats.time}
          recentActivities4Weeks={recent4WeeksCount}
        />
      </motion.div>

      {/* Row 2: Map + Feed + Calendar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6"
      >
        {/* Left/Center: Route Map */}
        <div className="lg:col-span-2">
          <RouteMap
            polyline={lastActivityWithRoute?.summaryPolyline}
            activityName={lastActivityWithRoute?.name}
            distance={lastActivityWithRoute?.distance}
            elevationGain={lastActivityWithRoute?.totalElevationGain}
            movingTime={lastActivityWithRoute?.movingTime}
            city={lastActivityWithRoute?.city}
            activityType={lastActivityWithRoute?.type}
            className="h-full"
          />
        </div>

        {/* Right Column: Feed + Calendar */}
        <div className="flex flex-col gap-4">
          <StravaFeed
            activities={activities.slice(0, 4).map((a) => ({
              id: a.id,
              name: a.name,
              type: a.type,
              distance: a.distance,
              movingTime: a.movingTime,
              startDate: a.startDate,
              kudosCount: a.kudosCount,
              city: a.city,
              totalElevationGain: a.totalElevationGain,
              averageHeartrate: a.averageHeartrate,
              averageSpeed: a.averageSpeed,
              calories: a.calories,
            }))}
            maxItems={4}
            onActivityClick={handleActivityClick}
          />
          <div className="flex-1">
            <CalendarHeatmap
              activities={activities.map((a) => ({
                id: a.id,
                name: a.name,
                startDate: a.startDate,
                distance: a.distance,
                movingTime: a.movingTime,
                type: a.type,
              }))}
              onActivityClick={(activityId) => {
                const activity = activities.find((a) => a.id === activityId);
                if (activity) {
                  setSelectedActivity(activity);
                }
              }}
              className="h-full"
            />
          </div>
        </div>
      </motion.div>

      {/* Row 3: Weekly Recap + Daily Roast + Week Comparison */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6"
      >
        <WeeklyRecap thisWeek={weeklyStats} lastWeek={lastWeekStats} />
        <DailyRoast
          daysSinceLastActivity={streakInfo.daysSinceLastActivity}
          totalActivities={activities.length}
          currentStreak={streakInfo.currentStreak}
          weeklyDistance={weeklyStats.distance}
          avgActivitiesPerWeek={avgActivitiesPerWeek}
          userName={user?.firstName || user?.name}
        />
        <WeekComparison
          thisWeek={{
            distance: weeklyStats.distance,
            activities: weeklyStats.activities,
            time: weeklyStats.time,
            elevation: weeklyStats.elevation,
          }}
          lastWeek={{
            distance: lastWeekStats.distance,
            activities: lastWeekStats.activities,
            time: lastWeekStats.time,
            elevation: lastWeekStats.elevation,
          }}
        />
      </motion.div>

      {/* Row 4: Fun Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-6"
      >
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
          Fun Facts
        </h3>
        <QuickStats
          totalDistance={totalStats.distance}
          totalTime={totalStats.time}
          totalElevation={totalStats.elevation}
          totalCalories={totalStats.calories}
          totalActivities={activities.length}
          longestStreak={streakInfo.longestStreak}
        />
      </motion.div>

      {/* Row 5: Athlete Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <AthleteStats
          name={
            user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || undefined
          }
          avatarUrl={user?.avatarUrl || undefined}
          sex={user?.sex || undefined}
          city={user?.city || undefined}
          country={user?.country || undefined}
          weight={user?.stravaWeight || undefined}
          ftp={user?.stravaFTP || undefined}
          avgHeartRate={heartRateStats.avg}
          maxHeartRate={heartRateStats.max}
          totalElevation={
            athleteStats
              ? (athleteStats.allRideElevationGain || 0) + (athleteStats.allRunElevationGain || 0)
              : totalStats.elevation
          }
          longestDistance={longestDistance}
          biggestClimb={biggestClimb}
          followerCount={user?.stravaFollowerCount || undefined}
          friendCount={user?.stravaFriendCount || undefined}
          isPremium={user?.stravaPremium || false}
        />
      </motion.div>

      {/* Activity Detail Modal */}
      <ActivityDetailModal
        activity={selectedActivity}
        open={!!selectedActivity}
        onClose={() => setSelectedActivity(null)}
      />
    </PageContainer>
  );
}
