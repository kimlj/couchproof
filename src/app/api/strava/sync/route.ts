/**
 * Strava Activity Sync Endpoint
 * POST /api/strava/sync
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { getValidToken } from '@/lib/strava/tokens';
import { getActivities, getActivity, getActivityStreams } from '@/lib/strava/api';

interface SyncResult {
  synced: number;
  updated: number;
  skipped: number;
  errors: number;
  lastActivityDate?: string;
  rateLimited?: boolean;
}

export async function POST(request: NextRequest) {
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

    // Get user with Strava connection
    const user = await prisma.user.findUnique({
      where: { email: supabaseUser.email },
      select: {
        id: true,
        stravaId: true,
        lastStravaSync: true,
      },
    });

    if (!user || !user.stravaId) {
      return NextResponse.json(
        { error: 'User not connected to Strava' },
        { status: 400 }
      );
    }

    // Get valid access token (will refresh if needed)
    const accessToken = await getValidToken(user.id);

    // Check sync options
    const searchParams = request.nextUrl.searchParams;
    const fullSync = searchParams.get('full') === 'true';
    // Batch limit to avoid rate limits (default 30 for full sync, unlimited for regular)
    const batchLimit = parseInt(searchParams.get('limit') || (fullSync ? '30' : '0'));

    // Calculate sync start time
    // Full sync: last 365 days, Regular sync: since last sync or last 30 days
    const after = fullSync
      ? Math.floor((Date.now() - 365 * 24 * 60 * 60 * 1000) / 1000)
      : user.lastStravaSync
        ? Math.floor(user.lastStravaSync.getTime() / 1000)
        : Math.floor((Date.now() - 30 * 24 * 60 * 60 * 1000) / 1000);

    const result: SyncResult = {
      synced: 0,
      updated: 0,
      skipped: 0,
      errors: 0,
    };

    let processedCount = 0;

    // Fetch activities from Strava (paginated)
    let page = 1;
    const perPage = 50;
    let hasMore = true;

    while (hasMore) {
      const activities = await getActivities(accessToken, {
        after,
        page,
        per_page: perPage,
      });

      if (activities.length === 0) {
        hasMore = false;
        break;
      }

      // Process each activity
      for (const activitySummary of activities) {
        // Check batch limit
        if (batchLimit > 0 && processedCount >= batchLimit) {
          result.rateLimited = true;
          hasMore = false;
          break;
        }

        try {
          // Check if activity already exists and has detailed data
          const existing = await prisma.activity.findUnique({
            where: {
              userId_source_stravaId: {
                userId: user.id,
                source: 'strava',
                stravaId: activitySummary.id.toString(),
              },
            },
            select: {
              id: true,
              calories: true,
              hasStreams: true,
            },
          });

          // Skip if already has complete data (calories and streams)
          const needsDetailedData = !existing?.calories;
          const needsStreams = !existing?.hasStreams;

          if (existing && !needsDetailedData && !needsStreams) {
            result.skipped++;
            continue;
          }

          // Fetch detailed activity data only if needed
          let activity = activitySummary;
          if (needsDetailedData) {
            activity = await getActivity(accessToken, activitySummary.id).catch(() => activitySummary);
            // Rate limit delay after API call
            await new Promise((resolve) => setTimeout(resolve, 200));
          }

          // Fetch streams only if needed
          let streams = null;
          if (needsStreams) {
            streams = await getActivityStreams(accessToken, activitySummary.id).catch(() => null);
            // Rate limit delay after API call
            await new Promise((resolve) => setTimeout(resolve, 200));
          }

          processedCount++;

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

          if (existing) {
            await prisma.activity.update({
              where: { id: existing.id },
              data: activityData,
            });
            result.updated++;
          } else {
            await prisma.activity.create({
              data: activityData,
            });
            result.synced++;
          }

          // Track last activity date
          if (!result.lastActivityDate || activity.start_date > result.lastActivityDate) {
            result.lastActivityDate = activity.start_date;
          }
        } catch (error) {
          console.error(`Error syncing activity ${activitySummary.id}:`, error);
          result.errors++;
        }
      }

      // Check if we need to fetch more pages
      if (activities.length < perPage) {
        hasMore = false;
      } else {
        page++;
      }

      // Rate limiting: Strava allows 100 requests per 15 minutes
      // Add a small delay between pages to be safe
      if (hasMore) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    // Only update last sync time if not doing a batched full sync (to allow continuation)
    if (!fullSync || !result.rateLimited) {
      await prisma.user.update({
        where: { id: user.id },
        data: { lastStravaSync: new Date() },
      });
    }

    return NextResponse.json({
      success: true,
      fullSync,
      synced: result.synced,
      updated: result.updated,
      skipped: result.skipped,
      errors: result.errors,
      processed: processedCount,
      batchLimit: batchLimit || 'unlimited',
      hasMore: result.rateLimited || false,
      lastActivityDate: result.lastActivityDate,
      message: result.rateLimited
        ? `Processed ${processedCount} activities. Run again to continue.`
        : `Sync complete. ${result.synced} new, ${result.updated} updated, ${result.skipped} skipped.`,
    });
  } catch (error) {
    console.error('Sync error:', error);
    return NextResponse.json(
      {
        error: 'Failed to sync activities',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
