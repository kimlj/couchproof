/**
 * Strava API Configuration
 * @see https://developers.strava.com/docs/reference/
 */

export const STRAVA_CONFIG = {
  clientId: process.env.STRAVA_CLIENT_ID!,
  clientSecret: process.env.STRAVA_CLIENT_SECRET!,
  redirectUri: process.env.NEXT_PUBLIC_BASE_URL + '/api/strava/callback',
  scope: 'read,activity:read_all,profile:read_all',
  authUrl: 'https://www.strava.com/oauth/authorize',
  tokenUrl: 'https://www.strava.com/oauth/token',
  apiUrl: 'https://www.strava.com/api/v3',
} as const;

/**
 * Strava API Rate Limits
 * @see https://developers.strava.com/docs/rate-limits/
 */
export const STRAVA_RATE_LIMITS = {
  // 100 requests every 15 minutes, 1000 daily
  per15Minutes: 100,
  perDay: 1000,
} as const;

/**
 * Activity stream types available from Strava
 */
export const STREAM_TYPES = [
  'time',
  'distance',
  'latlng',
  'altitude',
  'velocity_smooth',
  'heartrate',
  'cadence',
  'watts',
  'temp',
  'moving',
  'grade_smooth',
] as const;

export type StreamType = typeof STREAM_TYPES[number];
