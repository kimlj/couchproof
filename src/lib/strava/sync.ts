import { StravaAPI } from './api';
import type { StravaActivity } from './types';

export async function syncStravaActivities(
  userId: string,
  accessToken: string
): Promise<{ synced: number; errors: number }> {
  const api = new StravaAPI(accessToken);
  let synced = 0;
  let errors = 0;
  let page = 1;
  const perPage = 100;

  try {
    while (true) {
      const activities = await api.getActivities(page, perPage);

      if (activities.length === 0) {
        break;
      }

      for (const activity of activities) {
        try {
          // Store activity in database
          // TODO: Implement database storage
          synced++;
        } catch (error) {
          console.error(`Failed to sync activity ${activity.id}:`, error);
          errors++;
        }
      }

      if (activities.length < perPage) {
        break;
      }

      page++;
    }
  } catch (error) {
    console.error('Strava sync error:', error);
    throw error;
  }

  return { synced, errors };
}

export async function syncSingleActivity(
  userId: string,
  activityId: number,
  accessToken: string
): Promise<void> {
  const api = new StravaAPI(accessToken);
  const activity = await api.getActivity(activityId);

  // Store activity in database
  // TODO: Implement database storage
}
