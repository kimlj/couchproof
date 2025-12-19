import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { getAchievementById } from '@/lib/achievements/definitions';
import { getAchievementProgress } from '@/lib/achievements/progress';

/**
 * GET /api/achievements/[id]
 * Get a specific achievement with progress
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from database
    const dbUser = await prisma.user.findUnique({
      where: { email: user.email! },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const achievementId = params.id;

    // Get achievement definition
    const achievement = getAchievementById(achievementId);

    if (!achievement) {
      return NextResponse.json({ error: 'Achievement not found' }, { status: 404 });
    }

    // Get all progress
    const allProgress = await getAchievementProgress(dbUser.id);

    // Find specific achievement progress
    const progress = allProgress.find((p) => p.achievement.id === achievementId);

    if (!progress) {
      return NextResponse.json({ error: 'Progress not found' }, { status: 404 });
    }

    // Get related user achievement if unlocked
    let unlockedDetails = null;
    if (progress.isUnlocked) {
      const userAchievement = await prisma.userAchievement.findFirst({
        where: {
          userId: dbUser.id,
          achievementId: achievement.id,
        },
      });

      if (userAchievement) {
        // Fetch activity separately if activityId exists
        let activity = null;
        if (userAchievement.activityId) {
          activity = await prisma.activity.findUnique({
            where: { id: userAchievement.activityId },
            select: {
              id: true,
              name: true,
              type: true,
              distance: true,
              startDate: true,
            },
          });
        }

        unlockedDetails = {
          unlockedAt: userAchievement.unlockedAt,
          activity,
          notified: userAchievement.notified,
        };
      }
    }

    return NextResponse.json({
      achievement: progress.achievement,
      progress: {
        currentValue: progress.currentValue,
        targetValue: progress.targetValue,
        percentage: progress.percentage,
        isUnlocked: progress.isUnlocked,
        unlockedAt: progress.unlockedAt,
      },
      unlockedDetails,
    });
  } catch (error) {
    console.error('Error fetching achievement:', error);
    return NextResponse.json(
      { error: 'Failed to fetch achievement' },
      { status: 500 }
    );
  }
}
