/**
 * Strava Disconnect Endpoint
 * POST /api/strava/disconnect
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    // Get authenticated user from Supabase session
    const supabase = await createClient();
    const { data: { user: supabaseUser } } = await supabase.auth.getUser();

    if (!supabaseUser?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: supabaseUser.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Clear Strava connection data
    await prisma.user.update({
      where: { id: user.id },
      data: {
        stravaId: null,
        stravaAccessToken: null,
        stravaRefreshToken: null,
        stravaTokenExpires: null,
        stravaConnectedAt: null,
        stravaScope: null,
        stravaFollowerCount: null,
        stravaFriendCount: null,
        stravaFTP: null,
        stravaWeight: null,
        stravaPremium: false,
        stravaCreatedAt: null,
        lastStravaSync: null,
      },
    });

    // Optionally delete athlete stats
    await prisma.athleteStats.deleteMany({
      where: { userId: user.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error disconnecting Strava:', error);
    return NextResponse.json(
      { error: 'Failed to disconnect Strava' },
      { status: 500 }
    );
  }
}
