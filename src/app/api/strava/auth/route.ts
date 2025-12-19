/**
 * Strava OAuth - Initiate Authorization Flow
 * GET /api/strava/auth
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthUrl } from '@/lib/strava/api';

export async function GET(request: NextRequest) {
  try {
    // Get return URL from query params (optional)
    const searchParams = request.nextUrl.searchParams;
    const returnTo = searchParams.get('returnTo') || '/dashboard';

    // Generate a state parameter for CSRF protection
    const state = Buffer.from(
      JSON.stringify({
        returnTo,
        timestamp: Date.now(),
      })
    ).toString('base64');

    // Generate Strava OAuth URL
    const authUrl = getAuthUrl(state);

    // Redirect to Strava authorization page
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('Error initiating Strava auth:', error);
    return NextResponse.json(
      { error: 'Failed to initiate Strava authorization' },
      { status: 500 }
    );
  }
}
