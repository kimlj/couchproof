import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { generateActivitySummary } from '@/lib/ai/generate';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get activity ID from request body
    const body = await request.json();
    const { activityId } = body;

    if (!activityId) {
      return NextResponse.json({ error: 'Activity ID required' }, { status: 400 });
    }

    // Get user from database
    const dbUser = await prisma.user.findUnique({
      where: { email: user.email! },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get activity with gear
    const activity = await prisma.activity.findFirst({
      where: {
        id: activityId,
        userId: dbUser.id,
      },
      include: {
        gear: true,
      },
    });

    if (!activity) {
      return NextResponse.json({ error: 'Activity not found' }, { status: 404 });
    }

    // Check if summary already exists
    if (activity.aiSummary) {
      return NextResponse.json({
        content: activity.aiSummary,
        cached: true,
        generatedAt: activity.aiSummaryGeneratedAt,
      });
    }

    // Get user context for better summaries
    const recentActivities = await prisma.activity.findMany({
      where: {
        userId: dbUser.id,
        type: activity.type,
        id: { not: activity.id }, // Exclude current activity
      },
      orderBy: { startDate: 'desc' },
      take: 30,
      include: {
        gear: {
          select: { id: true, name: true },
        },
      },
    });

    const avgDistance = recentActivities.length > 0
      ? recentActivities.reduce((sum, a) => sum + a.distance, 0) / recentActivities.length
      : undefined;
    const avgTime = recentActivities.length > 0
      ? recentActivities.reduce((sum, a) => sum + a.movingTime, 0) / recentActivities.length
      : undefined;

    // Location analysis - is this a usual place?
    const activitiesAtSameLocation = activity.city
      ? recentActivities.filter(a => a.city === activity.city).length
      : 0;
    const isNewLocation = Boolean(activity.city) && activitiesAtSameLocation === 0;
    const isUsualLocation = activitiesAtSameLocation >= 3;

    // Time of day analysis
    const activityHour = activity.startDateLocal.getHours();
    const getTimeOfDay = (hour: number) => {
      if (hour >= 5 && hour < 9) return 'early_morning';
      if (hour >= 9 && hour < 12) return 'morning';
      if (hour >= 12 && hour < 14) return 'midday';
      if (hour >= 14 && hour < 17) return 'afternoon';
      if (hour >= 17 && hour < 20) return 'evening';
      return 'night';
    };
    const currentTimeOfDay = getTimeOfDay(activityHour);
    const activitiesAtSameTime = recentActivities.filter(a => {
      const hour = a.startDateLocal.getHours();
      return getTimeOfDay(hour) === currentTimeOfDay;
    }).length;
    const isNewTimeOfDay = activitiesAtSameTime === 0;
    const isUsualTime = activitiesAtSameTime >= 3;

    // Gear analysis - is this new gear?
    let gearContext: {
      name: string;
      type: string;
      totalDistance: number;
      isNew: boolean;
      isFirstUse: boolean;
      usageCount: number;
    } | undefined;

    if (activity.gear) {
      const gearUsageCount = recentActivities.filter(a => a.gear?.id === activity.gearId).length;
      const gearAgeInDays = Math.floor(
        (activity.startDate.getTime() - activity.gear.createdAt.getTime()) / (1000 * 60 * 60 * 24)
      );

      gearContext = {
        name: activity.gear.name,
        type: activity.gear.type,
        totalDistance: activity.gear.distance, // in meters
        isNew: gearAgeInDays <= 14, // Gear added in last 2 weeks
        isFirstUse: gearUsageCount === 0,
        usageCount: gearUsageCount,
      };
    }

    // Get current streak
    const athleteStats = await prisma.athleteStats.findUnique({
      where: { userId: dbUser.id },
    });

    // Generate summary with enriched context
    const result = await generateActivitySummary(
      dbUser.id,
      {
        id: activity.id,
        name: activity.name,
        type: activity.type,
        sportType: activity.sportType || undefined,
        distance: activity.distance,
        movingTime: activity.movingTime,
        elapsedTime: activity.elapsedTime,
        totalElevationGain: activity.totalElevationGain || undefined,
        averageSpeed: activity.averageSpeed || undefined,
        maxSpeed: activity.maxSpeed || undefined,
        averageHeartrate: activity.averageHeartrate || undefined,
        maxHeartrate: activity.maxHeartrate || undefined,
        averageWatts: activity.averageWatts || undefined,
        calories: activity.calories || undefined,
        kudosCount: activity.kudosCount,
        achievementCount: activity.achievementCount,
        prCount: activity.prCount,
        startDate: activity.startDate,
        startDateLocal: activity.startDateLocal,
        city: activity.city || undefined,
        country: activity.country || undefined,
      },
      {
        firstName: dbUser.firstName || dbUser.name || undefined,
        averageDistance: avgDistance,
        averageTime: avgTime,
        currentStreak: athleteStats?.recentRideCount || 0,
        recentTrend: 'steady',
      },
      {
        isNewLocation,
        isUsualLocation,
        locationVisitCount: activitiesAtSameLocation,
        isNewTimeOfDay,
        isUsualTime,
        timeOfDay: currentTimeOfDay,
        gear: gearContext,
      }
    );

    // Save summary to activity
    await prisma.activity.update({
      where: { id: activity.id },
      data: {
        aiSummary: result.content,
        aiSummaryGeneratedAt: new Date(),
      },
    });

    return NextResponse.json({
      content: result.content,
      cached: false,
      generationId: result.generationId,
      generatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error generating activity summary:', error);
    return NextResponse.json(
      { error: 'Failed to generate summary' },
      { status: 500 }
    );
  }
}

// GET endpoint to fetch summary for an activity (if exists)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const activityId = searchParams.get('activityId');

    if (!activityId) {
      return NextResponse.json({ error: 'Activity ID required' }, { status: 400 });
    }

    // Get user from database
    const dbUser = await prisma.user.findUnique({
      where: { email: user.email! },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get activity with summary
    const activity = await prisma.activity.findFirst({
      where: {
        id: activityId,
        userId: dbUser.id,
      },
      select: {
        aiSummary: true,
        aiSummaryGeneratedAt: true,
      },
    });

    if (!activity) {
      return NextResponse.json({ error: 'Activity not found' }, { status: 404 });
    }

    return NextResponse.json({
      content: activity.aiSummary,
      generatedAt: activity.aiSummaryGeneratedAt,
      exists: !!activity.aiSummary,
    });
  } catch (error) {
    console.error('Error fetching activity summary:', error);
    return NextResponse.json(
      { error: 'Failed to fetch summary' },
      { status: 500 }
    );
  }
}
