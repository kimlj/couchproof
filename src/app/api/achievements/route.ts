import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { getAchievementProgress } from '@/lib/achievements/progress';
import { checkAchievements, saveUnlockedAchievements } from '@/lib/achievements/check';

/**
 * GET /api/achievements
 * Get all achievements with progress for the authenticated user
 */
export async function GET() {
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

    // Get achievement progress
    const progress = await getAchievementProgress(dbUser.id);

    return NextResponse.json({
      achievements: progress,
      total: progress.length,
      unlocked: progress.filter((p) => p.isUnlocked).length,
    });
  } catch (error) {
    console.error('Error fetching achievements:', error);
    return NextResponse.json(
      { error: 'Failed to fetch achievements' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/achievements
 * Check for new achievements after an activity
 * Body: { activityId?: string }
 */
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { activityId } = body;

    // Check for new achievements
    const newlyUnlocked = await checkAchievements(dbUser.id, activityId);

    // Save newly unlocked achievements
    if (newlyUnlocked.length > 0) {
      await saveUnlockedAchievements(dbUser.id, newlyUnlocked);
    }

    return NextResponse.json({
      newAchievements: newlyUnlocked.map((u) => ({
        achievement: u.achievement,
        activityId: u.activityId,
      })),
      count: newlyUnlocked.length,
    });
  } catch (error) {
    console.error('Error checking achievements:', error);
    return NextResponse.json(
      { error: 'Failed to check achievements' },
      { status: 500 }
    );
  }
}
