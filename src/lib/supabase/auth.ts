import { createClient } from './client';

/**
 * Sign in with Google OAuth
 */
export async function signInWithGoogle() {
  const supabase = createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Sign in with Strava OAuth
 * Redirects to Strava authorization page
 */
export function signInWithStrava() {
  const clientId = process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID;
  const redirectUri = `${window.location.origin}/api/strava/callback`;
  const scope = 'read,activity:read_all,activity:write,profile:read_all';

  const authUrl = `https://www.strava.com/oauth/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&approval_prompt=auto`;

  window.location.href = authUrl;
}

/**
 * Sign out the current user
 */
export async function signOut() {
  const supabase = createClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }
}

/**
 * Get the current user session
 */
export async function getCurrentUser() {
  const supabase = createClient();

  const { data: { session }, error } = await supabase.auth.getSession();

  if (error) {
    throw error;
  }

  return session?.user ?? null;
}

/**
 * Get the current session
 */
export async function getSession() {
  const supabase = createClient();

  const { data: { session }, error } = await supabase.auth.getSession();

  if (error) {
    throw error;
  }

  return session;
}
