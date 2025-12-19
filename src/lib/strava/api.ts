/**
 * Strava API Client
 * Handles all HTTP requests to Strava API with error handling and rate limiting
 */

import { STRAVA_CONFIG, STREAM_TYPES } from './config';
import type {
  StravaTokenResponse,
  StravaAthlete,
  StravaAthleteStats,
  StravaActivity,
  StravaActivityStreams,
  StravaStream,
  StravaErrorResponse,
} from './types';

class StravaAPIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public response?: StravaErrorResponse
  ) {
    super(message);
    this.name = 'StravaAPIError';
  }
}

/**
 * Make a request to Strava API with error handling
 */
async function stravaFetch<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    // Parse response body
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMessage = data.message || `HTTP ${response.status}: ${response.statusText}`;
      throw new StravaAPIError(errorMessage, response.status, data);
    }

    return data as T;
  } catch (error) {
    if (error instanceof StravaAPIError) {
      throw error;
    }
    throw new StravaAPIError(
      error instanceof Error ? error.message : 'Unknown error occurred'
    );
  }
}

/**
 * Generate OAuth authorization URL
 */
export function getAuthUrl(state?: string): string {
  const params = new URLSearchParams({
    client_id: STRAVA_CONFIG.clientId,
    redirect_uri: STRAVA_CONFIG.redirectUri,
    response_type: 'code',
    scope: STRAVA_CONFIG.scope,
    approval_prompt: 'auto',
  });

  if (state) {
    params.append('state', state);
  }

  return `${STRAVA_CONFIG.authUrl}?${params.toString()}`;
}

/**
 * Exchange authorization code for access tokens
 */
export async function exchangeToken(
  code: string
): Promise<StravaTokenResponse> {
  return stravaFetch<StravaTokenResponse>(STRAVA_CONFIG.tokenUrl, {
    method: 'POST',
    body: JSON.stringify({
      client_id: STRAVA_CONFIG.clientId,
      client_secret: STRAVA_CONFIG.clientSecret,
      code,
      grant_type: 'authorization_code',
    }),
  });
}

/**
 * Refresh expired access token
 */
export async function refreshToken(
  refreshToken: string
): Promise<StravaTokenResponse> {
  return stravaFetch<StravaTokenResponse>(STRAVA_CONFIG.tokenUrl, {
    method: 'POST',
    body: JSON.stringify({
      client_id: STRAVA_CONFIG.clientId,
      client_secret: STRAVA_CONFIG.clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });
}

/**
 * Get authenticated athlete profile
 */
export async function getAthlete(accessToken: string): Promise<StravaAthlete> {
  return stravaFetch<StravaAthlete>(`${STRAVA_CONFIG.apiUrl}/athlete`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

/**
 * Get athlete statistics
 */
export async function getAthleteStats(
  accessToken: string,
  athleteId: number
): Promise<StravaAthleteStats> {
  return stravaFetch<StravaAthleteStats>(
    `${STRAVA_CONFIG.apiUrl}/athletes/${athleteId}/stats`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
}

/**
 * Get paginated activities
 */
export async function getActivities(
  accessToken: string,
  options: {
    before?: number; // Unix timestamp
    after?: number; // Unix timestamp
    page?: number;
    per_page?: number;
  } = {}
): Promise<StravaActivity[]> {
  const params = new URLSearchParams();

  if (options.before) params.append('before', options.before.toString());
  if (options.after) params.append('after', options.after.toString());
  if (options.page) params.append('page', options.page.toString());
  if (options.per_page) params.append('per_page', options.per_page.toString());

  const url = `${STRAVA_CONFIG.apiUrl}/athlete/activities?${params.toString()}`;

  return stravaFetch<StravaActivity[]>(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

/**
 * Get single activity with full details
 */
export async function getActivity(
  accessToken: string,
  id: number,
  includeAllEfforts: boolean = true
): Promise<StravaActivity> {
  const params = new URLSearchParams({
    include_all_efforts: includeAllEfforts.toString(),
  });

  return stravaFetch<StravaActivity>(
    `${STRAVA_CONFIG.apiUrl}/activities/${id}?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
}

/**
 * Get activity streams (detailed time-series data)
 */
export async function getActivityStreams(
  accessToken: string,
  id: number,
  streamTypes: string[] = [...STREAM_TYPES]
): Promise<StravaActivityStreams> {
  const keys = streamTypes.join(',');

  const streams = await stravaFetch<StravaStream[]>(
    `${STRAVA_CONFIG.apiUrl}/activities/${id}/streams?keys=${keys}&key_by_type=true`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  // Convert array of streams to object keyed by type
  const result: StravaActivityStreams = {};

  if (Array.isArray(streams)) {
    streams.forEach((stream) => {
      const key = stream.type as keyof StravaActivityStreams;
      (result as any)[key] = stream.data;
    });
  }

  return result;
}

/**
 * Get activity with full details and streams
 * This is a helper that combines getActivity and getActivityStreams
 */
export async function getActivityWithStreams(
  accessToken: string,
  id: number
): Promise<{
  activity: StravaActivity;
  streams: StravaActivityStreams;
}> {
  const [activity, streams] = await Promise.all([
    getActivity(accessToken, id),
    getActivityStreams(accessToken, id).catch(() => ({} as StravaActivityStreams)),
  ]);

  return { activity, streams };
}

/**
 * Deauthorize application (revoke access)
 */
export async function deauthorize(accessToken: string): Promise<void> {
  await stravaFetch<void>(`${STRAVA_CONFIG.apiUrl}/oauth/deauthorize`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

// Legacy class-based API for backward compatibility
export class StravaAPI {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  async getAthlete(): Promise<StravaAthlete> {
    return getAthlete(this.accessToken);
  }

  async getActivities(page = 1, perPage = 30): Promise<StravaActivity[]> {
    return getActivities(this.accessToken, { page, per_page: perPage });
  }

  async getActivity(id: number): Promise<StravaActivity> {
    return getActivity(this.accessToken, id);
  }
}

export { StravaAPIError };
