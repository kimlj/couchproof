import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const clientId = process.env.STRAVA_CLIENT_ID;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/strava/callback`;
  const scope = 'read,activity:read_all,activity:write,profile:read_all';

  // Get current user from Supabase session
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Create state with user info and return URL
  const state = Buffer.from(
    JSON.stringify({
      returnTo: '/settings',
      linkToUser: user?.email || null, // Email to link Strava account to
    })
  ).toString('base64');

  const stravaAuthUrl = `https://www.strava.com/oauth/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&approval_prompt=auto&state=${state}`;

  return NextResponse.redirect(stravaAuthUrl);
}
