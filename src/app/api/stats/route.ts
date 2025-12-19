import { NextResponse } from 'next/server';
import { getCurrentDbUser } from '@/lib/auth/getCurrentUser';
import { prisma } from '@/lib/prisma';
import { calculateUserStats } from '@/lib/stats/calculateUserStats';
import { calculatePersonalityTraits } from '@/lib/stats/calculateTraits';
import { calculateTimingPatterns } from '@/lib/stats/calculateTiming';
import type { Activity } from '@/types';

export async function GET() {
  try {
    const user = await getCurrentDbUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch activities from database
    const dbActivities = await prisma.activity.findMany({
      where: { userId: user.id },
      orderBy: { startDate: 'desc' },
    });

    // Map Prisma activities to Activity type
    const activities: Activity[] = dbActivities.map((a) => ({
      id: a.id,
      stravaId: a.stravaId ? parseInt(a.stravaId) : 0,
      name: a.name,
      type: a.type,
      sportType: a.sportType || a.type,
      distance: a.distance,
      duration: a.movingTime,
      elevation: a.totalElevationGain || 0,
      startDate: a.startDate,
      description: a.description,
      polyline: a.summaryPolyline,
      averageSpeed: a.averageSpeed || undefined,
      maxSpeed: a.maxSpeed || undefined,
      averageHeartrate: a.averageHeartrate,
      maxHeartrate: a.maxHeartrate,
      averageWatts: a.averageWatts,
      calories: a.calories,
      kudosCount: a.kudosCount,
      commentCount: a.commentCount,
      achievementCount: a.achievementCount,
      startLat: a.startLat,
      startLng: a.startLng,
      endLat: a.endLat,
      endLng: a.endLng,
    }));

    // Fetch athlete stats (from Strava sync)
    const athleteStats = await prisma.athleteStats.findUnique({
      where: { userId: user.id },
    });

    // Fetch personality if already calculated
    const personality = await prisma.personality.findUnique({
      where: { userId: user.id },
    });

    // Calculate stats from activities
    const stats = calculateUserStats(activities);
    const traits = calculatePersonalityTraits(activities);
    const timing = calculateTimingPatterns(activities);

    return NextResponse.json({
      stats,
      traits,
      timing,
      athleteStats,
      personality,
      activityCount: activities.length,
    });
  } catch (error) {
    console.error('Error calculating stats:', error);
    return NextResponse.json(
      { error: 'Failed to calculate stats' },
      { status: 500 }
    );
  }
}
