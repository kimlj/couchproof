/**
 * Strava Webhook Handler
 * GET /api/strava/webhook - Subscription validation
 * POST /api/strava/webhook - Activity event processing
 *
 * @see https://developers.strava.com/docs/webhooks/
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getValidToken } from '@/lib/strava/tokens';
import { getActivity, getActivityStreams } from '@/lib/strava/api';
import type { StravaWebhookEvent } from '@/lib/strava/types';

/**
 * GET handler for webhook subscription validation
 * Strava sends a challenge parameter that must be echoed back
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  // Validate subscription request
  if (mode === 'subscribe' && token === process.env.STRAVA_WEBHOOK_VERIFY_TOKEN) {
    console.log('Strava webhook subscription validated');
    return NextResponse.json({ 'hub.challenge': challenge });
  }

  console.error('Invalid webhook subscription request');
  return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
}

/**
 * POST handler for webhook events
 * Handles activity create, update, and delete events
 */
export async function POST(request: NextRequest) {
  try {
    const event: StravaWebhookEvent = await request.json();

    console.log('Strava webhook event received:', {
      type: event.object_type,
      aspect: event.aspect_type,
      id: event.object_id,
      owner: event.owner_id,
    });

    // Only handle activity events
    if (event.object_type !== 'activity') {
      // For athlete deauthorization events
      if (event.object_type === 'athlete' && event.updates?.authorized === 'false') {
        await handleAthleteDeauthorization(event.owner_id);
      }
      return NextResponse.json({ success: true });
    }

    // Handle activity events
    switch (event.aspect_type) {
      case 'create':
        await handleActivityCreate(event);
        break;
      case 'update':
        await handleActivityUpdate(event);
        break;
      case 'delete':
        await handleActivityDelete(event);
        break;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    // Return 200 anyway to prevent Strava from retrying
    return NextResponse.json({ success: false, error: 'Processing failed' });
  }
}

/**
 * Handle new activity creation
 */
async function handleActivityCreate(event: StravaWebhookEvent) {
  try {
    // Find user by Strava athlete ID
    const user = await prisma.user.findUnique({
      where: { stravaId: event.owner_id.toString() },
    });

    if (!user) {
      console.log(`User not found for Strava ID: ${event.owner_id}`);
      return;
    }

    // Get valid access token
    const accessToken = await getValidToken(user.id);

    // Fetch full activity details
    const [activity, streams] = await Promise.all([
      getActivity(accessToken, event.object_id),
      getActivityStreams(accessToken, event.object_id).catch(() => null),
    ]);

    // Prepare activity data
    const activityData = {
      userId: user.id,
      source: 'strava',
      stravaId: activity.id.toString(),
      uploadId: activity.upload_id_str || activity.upload_id?.toString() || null,
      externalId: activity.external_id || null,

      name: activity.name,
      description: activity.description || null,
      type: activity.type,
      sportType: activity.sport_type || activity.type,
      workoutType: activity.workout_type || null,

      startDate: new Date(activity.start_date),
      startDateLocal: new Date(activity.start_date_local),
      timezone: activity.timezone,

      distance: activity.distance,
      movingTime: activity.moving_time,
      elapsedTime: activity.elapsed_time,
      totalElevationGain: activity.total_elevation_gain || 0,

      elevHigh: activity.elev_high || null,
      elevLow: activity.elev_low || null,

      averageSpeed: activity.average_speed,
      maxSpeed: activity.max_speed,

      hasHeartrate: activity.has_heartrate,
      averageHeartrate: activity.average_heartrate || null,
      maxHeartrate: activity.max_heartrate || null,

      averageWatts: activity.average_watts || null,
      maxWatts: activity.weighted_average_watts || null,
      weightedAverageWatts: activity.weighted_average_watts || null,
      deviceWatts: activity.device_watts || false,
      kilojoules: activity.kilojoules || null,

      averageCadence: activity.average_cadence || null,
      averageTemp: activity.average_temp || null,

      startLat: activity.start_latlng?.[0] || null,
      startLng: activity.start_latlng?.[1] || null,
      endLat: activity.end_latlng?.[0] || null,
      endLng: activity.end_latlng?.[1] || null,

      city: activity.location_city || null,
      state: activity.location_state || null,
      country: activity.location_country || null,

      summaryPolyline: activity.map?.summary_polyline || null,

      kudosCount: activity.kudos_count || 0,
      commentCount: activity.comment_count || 0,
      athleteCount: activity.athlete_count || 1,
      photoCount: activity.photo_count || 0,
      totalPhotoCount: activity.total_photo_count || 0,
      hasKudoed: activity.has_kudoed || false,

      trainer: activity.trainer || false,
      commute: activity.commute || false,
      manual: activity.manual || false,
      private: activity.private || false,
      flagged: activity.flagged || false,
      hideFromHome: activity.hide_from_home || false,

      deviceName: activity.device_name || null,
      embedToken: activity.embed_token || null,

      calories: activity.calories || null,
      sufferScore: activity.suffer_score || null,

      achievementCount: activity.achievement_count || 0,
      prCount: activity.pr_count || 0,

      splitsMetric: activity.splits_metric ? JSON.parse(JSON.stringify(activity.splits_metric)) : undefined,
      splitsStandard: activity.splits_standard ? JSON.parse(JSON.stringify(activity.splits_standard)) : undefined,
      laps: activity.laps ? JSON.parse(JSON.stringify(activity.laps)) : undefined,
      bestEfforts: activity.best_efforts ? JSON.parse(JSON.stringify(activity.best_efforts)) : undefined,
      segmentEfforts: activity.segment_efforts ? JSON.parse(JSON.stringify(activity.segment_efforts)) : undefined,
      segmentEffortCount: activity.segment_efforts?.length || 0,

      streams: streams ? JSON.parse(JSON.stringify(streams)) : undefined,
      hasStreams: !!streams && Object.keys(streams).length > 0,
    };

    // Handle gear if present
    if (activity.gear_id) {
      const gear = await prisma.gear.findUnique({
        where: { stravaId: activity.gear_id },
      });
      if (gear) {
        (activityData as any).gearId = gear.id;
      }
    }

    // Create activity in database
    await prisma.activity.create({
      data: activityData,
    });

    console.log(`Activity ${activity.id} created for user ${user.id}`);
  } catch (error) {
    console.error('Error handling activity create:', error);
    throw error;
  }
}

/**
 * Handle activity update
 */
async function handleActivityUpdate(event: StravaWebhookEvent) {
  try {
    // Find user
    const user = await prisma.user.findUnique({
      where: { stravaId: event.owner_id.toString() },
    });

    if (!user) {
      console.log(`User not found for Strava ID: ${event.owner_id}`);
      return;
    }

    // Find existing activity
    const existing = await prisma.activity.findUnique({
      where: {
        userId_source_stravaId: {
          userId: user.id,
          source: 'strava',
          stravaId: event.object_id.toString(),
        },
      },
    });

    if (!existing) {
      // Activity doesn't exist, treat as create
      await handleActivityCreate(event);
      return;
    }

    // Get valid access token
    const accessToken = await getValidToken(user.id);

    // Fetch updated activity details
    const activity = await getActivity(accessToken, event.object_id);

    // Update activity in database
    await prisma.activity.update({
      where: { id: existing.id },
      data: {
        name: activity.name,
        description: activity.description || null,
        type: activity.type,
        sportType: activity.sport_type || activity.type,

        distance: activity.distance,
        movingTime: activity.moving_time,
        elapsedTime: activity.elapsed_time,
        totalElevationGain: activity.total_elevation_gain || 0,

        private: activity.private || false,
        hideFromHome: activity.hide_from_home || false,

        kudosCount: activity.kudos_count || 0,
        commentCount: activity.comment_count || 0,
      },
    });

    console.log(`Activity ${activity.id} updated for user ${user.id}`);
  } catch (error) {
    console.error('Error handling activity update:', error);
    throw error;
  }
}

/**
 * Handle activity deletion
 */
async function handleActivityDelete(event: StravaWebhookEvent) {
  try {
    // Find user
    const user = await prisma.user.findUnique({
      where: { stravaId: event.owner_id.toString() },
    });

    if (!user) {
      console.log(`User not found for Strava ID: ${event.owner_id}`);
      return;
    }

    // Delete activity from database
    await prisma.activity.deleteMany({
      where: {
        userId: user.id,
        source: 'strava',
        stravaId: event.object_id.toString(),
      },
    });

    console.log(`Activity ${event.object_id} deleted for user ${user.id}`);
  } catch (error) {
    console.error('Error handling activity delete:', error);
    throw error;
  }
}

/**
 * Handle athlete deauthorization
 */
async function handleAthleteDeauthorization(athleteId: number) {
  try {
    // Find user
    const user = await prisma.user.findUnique({
      where: { stravaId: athleteId.toString() },
    });

    if (!user) {
      console.log(`User not found for Strava ID: ${athleteId}`);
      return;
    }

    // Clear Strava tokens
    await prisma.user.update({
      where: { id: user.id },
      data: {
        stravaAccessToken: null,
        stravaRefreshToken: null,
        stravaTokenExpires: null,
      },
    });

    console.log(`User ${user.id} deauthorized Strava access`);
  } catch (error) {
    console.error('Error handling athlete deauthorization:', error);
    throw error;
  }
}
