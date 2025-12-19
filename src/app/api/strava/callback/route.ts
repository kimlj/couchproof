/**
 * Strava OAuth - Handle Callback
 * GET /api/strava/callback
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { STRAVA_CONFIG } from '@/lib/strava/config';
import { exchangeToken, getAthlete, getAthleteStats } from '@/lib/strava/api';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    // Handle authorization denial
    if (error) {
      console.error('Strava auth error:', error);
      return NextResponse.redirect(
        new URL(`/dashboard?error=strava_denied`, request.url)
      );
    }

    // Validate required parameters
    if (!code) {
      return NextResponse.redirect(
        new URL(`/dashboard?error=missing_code`, request.url)
      );
    }

    // Parse state to get return URL and link info
    let returnTo = '/dashboard';
    let linkToUserEmail: string | null = null;
    if (state) {
      try {
        const stateData = JSON.parse(Buffer.from(state, 'base64').toString());
        returnTo = stateData.returnTo || '/dashboard';
        linkToUserEmail = stateData.linkToUser || null;
      } catch (e) {
        console.warn('Failed to parse state parameter:', e);
      }
    }

    // Exchange authorization code for tokens
    const tokenResponse = await exchangeToken(code);

    if (!tokenResponse.athlete) {
      throw new Error('No athlete data returned from Strava');
    }

    const stravaAthlete = tokenResponse.athlete;

    // Fetch full athlete profile and stats
    const [athleteProfile, athleteStats] = await Promise.all([
      getAthlete(tokenResponse.access_token),
      getAthleteStats(tokenResponse.access_token, stravaAthlete.id).catch(
        () => null
      ),
    ]);

    // Strava data to save
    const stravaData = {
      stravaId: stravaAthlete.id.toString(),
      stravaAccessToken: tokenResponse.access_token,
      stravaRefreshToken: tokenResponse.refresh_token,
      stravaTokenExpires: new Date(tokenResponse.expires_at * 1000),
      stravaConnectedAt: new Date(),
      stravaScope: STRAVA_CONFIG.scope,
      stravaFollowerCount: athleteProfile.follower_count || 0,
      stravaFriendCount: athleteProfile.friend_count || 0,
      stravaFTP: athleteProfile.ftp || null,
      stravaWeight: athleteProfile.weight || null,
      stravaPremium: athleteProfile.premium || athleteProfile.summit || false,
      stravaCreatedAt: new Date(athleteProfile.created_at),
    };

    const profileData = {
      name: `${stravaAthlete.firstname} ${stravaAthlete.lastname}`.trim(),
      firstName: stravaAthlete.firstname,
      lastName: stravaAthlete.lastname,
      avatarUrl: athleteProfile.profile || athleteProfile.profile_medium || null,
      sex: stravaAthlete.sex || null,
      city: stravaAthlete.city || null,
      state: stravaAthlete.state || null,
      country: stravaAthlete.country || null,
      measurementPreference:
        athleteProfile.measurement_preference === 'feet' ? 'imperial' : 'metric',
    };

    let user;

    // If linking to existing user (from Google login)
    if (linkToUserEmail) {
      user = await prisma.user.findUnique({
        where: { email: linkToUserEmail },
      });

      if (user) {
        // Link Strava to existing user
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            ...stravaData,
            // Only update profile if not already set
            avatarUrl: user.avatarUrl || profileData.avatarUrl,
            firstName: user.firstName || profileData.firstName,
            lastName: user.lastName || profileData.lastName,
          },
        });
      } else {
        // User not found, create new with Google email
        user = await prisma.user.create({
          data: {
            email: linkToUserEmail,
            ...profileData,
            ...stravaData,
          },
        });
      }
    } else {
      // No linking - check for existing Strava user or create new
      user = await prisma.user.findUnique({
        where: { stravaId: stravaAthlete.id.toString() },
      });

      const fullUserData = {
        email: `strava_${stravaAthlete.id}@couchproof.app`,
        ...profileData,
        ...stravaData,
      };

      if (user) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: fullUserData,
        });
      } else {
        user = await prisma.user.create({
          data: fullUserData,
        });
      }
    }

    // Update athlete stats if available
    if (athleteStats && user) {
      await prisma.athleteStats.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          biggestRideDistance: athleteStats.biggest_ride_distance || null,
          biggestClimbElevationGain:
            athleteStats.biggest_climb_elevation_gain || null,

          // Recent totals
          recentRideCount: athleteStats.recent_ride_totals.count,
          recentRideDistance: athleteStats.recent_ride_totals.distance,
          recentRideMovingTime: athleteStats.recent_ride_totals.moving_time,
          recentRideElevationGain: athleteStats.recent_ride_totals.elevation_gain,
          recentRideAchievements:
            athleteStats.recent_ride_totals.achievement_count || 0,

          recentRunCount: athleteStats.recent_run_totals.count,
          recentRunDistance: athleteStats.recent_run_totals.distance,
          recentRunMovingTime: athleteStats.recent_run_totals.moving_time,
          recentRunElevationGain: athleteStats.recent_run_totals.elevation_gain,
          recentRunAchievements:
            athleteStats.recent_run_totals.achievement_count || 0,

          recentSwimCount: athleteStats.recent_swim_totals.count,
          recentSwimDistance: athleteStats.recent_swim_totals.distance,
          recentSwimMovingTime: athleteStats.recent_swim_totals.moving_time,

          // YTD totals
          ytdRideCount: athleteStats.ytd_ride_totals.count,
          ytdRideDistance: athleteStats.ytd_ride_totals.distance,
          ytdRideMovingTime: athleteStats.ytd_ride_totals.moving_time,
          ytdRideElevationGain: athleteStats.ytd_ride_totals.elevation_gain,
          ytdRideAchievements:
            athleteStats.ytd_ride_totals.achievement_count || 0,

          ytdRunCount: athleteStats.ytd_run_totals.count,
          ytdRunDistance: athleteStats.ytd_run_totals.distance,
          ytdRunMovingTime: athleteStats.ytd_run_totals.moving_time,
          ytdRunElevationGain: athleteStats.ytd_run_totals.elevation_gain,
          ytdRunAchievements: athleteStats.ytd_run_totals.achievement_count || 0,

          ytdSwimCount: athleteStats.ytd_swim_totals.count,
          ytdSwimDistance: athleteStats.ytd_swim_totals.distance,
          ytdSwimMovingTime: athleteStats.ytd_swim_totals.moving_time,

          // All-time totals
          allRideCount: athleteStats.all_ride_totals.count,
          allRideDistance: athleteStats.all_ride_totals.distance,
          allRideMovingTime: athleteStats.all_ride_totals.moving_time,
          allRideElevationGain: athleteStats.all_ride_totals.elevation_gain,
          allRideAchievements:
            athleteStats.all_ride_totals.achievement_count || 0,

          allRunCount: athleteStats.all_run_totals.count,
          allRunDistance: athleteStats.all_run_totals.distance,
          allRunMovingTime: athleteStats.all_run_totals.moving_time,
          allRunElevationGain: athleteStats.all_run_totals.elevation_gain,
          allRunAchievements: athleteStats.all_run_totals.achievement_count || 0,

          allSwimCount: athleteStats.all_swim_totals.count,
          allSwimDistance: athleteStats.all_swim_totals.distance,
          allSwimMovingTime: athleteStats.all_swim_totals.moving_time,

          lastUpdated: new Date(),
        },
        update: {
          biggestRideDistance: athleteStats.biggest_ride_distance || null,
          biggestClimbElevationGain:
            athleteStats.biggest_climb_elevation_gain || null,

          // Recent totals
          recentRideCount: athleteStats.recent_ride_totals.count,
          recentRideDistance: athleteStats.recent_ride_totals.distance,
          recentRideMovingTime: athleteStats.recent_ride_totals.moving_time,
          recentRideElevationGain: athleteStats.recent_ride_totals.elevation_gain,
          recentRideAchievements:
            athleteStats.recent_ride_totals.achievement_count || 0,

          recentRunCount: athleteStats.recent_run_totals.count,
          recentRunDistance: athleteStats.recent_run_totals.distance,
          recentRunMovingTime: athleteStats.recent_run_totals.moving_time,
          recentRunElevationGain: athleteStats.recent_run_totals.elevation_gain,
          recentRunAchievements:
            athleteStats.recent_run_totals.achievement_count || 0,

          recentSwimCount: athleteStats.recent_swim_totals.count,
          recentSwimDistance: athleteStats.recent_swim_totals.distance,
          recentSwimMovingTime: athleteStats.recent_swim_totals.moving_time,

          // YTD totals
          ytdRideCount: athleteStats.ytd_ride_totals.count,
          ytdRideDistance: athleteStats.ytd_ride_totals.distance,
          ytdRideMovingTime: athleteStats.ytd_ride_totals.moving_time,
          ytdRideElevationGain: athleteStats.ytd_ride_totals.elevation_gain,
          ytdRideAchievements:
            athleteStats.ytd_ride_totals.achievement_count || 0,

          ytdRunCount: athleteStats.ytd_run_totals.count,
          ytdRunDistance: athleteStats.ytd_run_totals.distance,
          ytdRunMovingTime: athleteStats.ytd_run_totals.moving_time,
          ytdRunElevationGain: athleteStats.ytd_run_totals.elevation_gain,
          ytdRunAchievements: athleteStats.ytd_run_totals.achievement_count || 0,

          ytdSwimCount: athleteStats.ytd_swim_totals.count,
          ytdSwimDistance: athleteStats.ytd_swim_totals.distance,
          ytdSwimMovingTime: athleteStats.ytd_swim_totals.moving_time,

          // All-time totals
          allRideCount: athleteStats.all_ride_totals.count,
          allRideDistance: athleteStats.all_ride_totals.distance,
          allRideMovingTime: athleteStats.all_ride_totals.moving_time,
          allRideElevationGain: athleteStats.all_ride_totals.elevation_gain,
          allRideAchievements:
            athleteStats.all_ride_totals.achievement_count || 0,

          allRunCount: athleteStats.all_run_totals.count,
          allRunDistance: athleteStats.all_run_totals.distance,
          allRunMovingTime: athleteStats.all_run_totals.moving_time,
          allRunElevationGain: athleteStats.all_run_totals.elevation_gain,
          allRunAchievements: athleteStats.all_run_totals.achievement_count || 0,

          allSwimCount: athleteStats.all_swim_totals.count,
          allSwimDistance: athleteStats.all_swim_totals.distance,
          allSwimMovingTime: athleteStats.all_swim_totals.moving_time,

          lastUpdated: new Date(),
        },
      });
    }

    // Sync gear (bikes and shoes)
    const allGear = [
      ...(athleteProfile.bikes || []).map((g) => ({ ...g, type: 'bike' })),
      ...(athleteProfile.shoes || []).map((g) => ({ ...g, type: 'shoe' })),
    ];

    for (const gear of allGear) {
      await prisma.gear.upsert({
        where: { stravaId: gear.id },
        create: {
          stravaId: gear.id,
          userId: user.id,
          type: gear.type,
          name: gear.name,
          brandName: gear.brand_name || null,
          modelName: gear.model_name || null,
          description: gear.description || null,
          frameType: gear.frame_type || null,
          distance: gear.distance || 0,
          primary: gear.primary,
          retired: gear.retired,
        },
        update: {
          name: gear.name,
          brandName: gear.brand_name || null,
          modelName: gear.model_name || null,
          description: gear.description || null,
          frameType: gear.frame_type || null,
          distance: gear.distance || 0,
          primary: gear.primary,
          retired: gear.retired,
        },
      });
    }

    // Redirect to success page
    return NextResponse.redirect(
      new URL(`${returnTo}?connected=strava`, request.url)
    );
  } catch (error) {
    console.error('Error in Strava callback:', error);
    return NextResponse.redirect(
      new URL(
        `/dashboard?error=strava_callback_failed&message=${encodeURIComponent(
          error instanceof Error ? error.message : 'Unknown error'
        )}`,
        request.url
      )
    );
  }
}
