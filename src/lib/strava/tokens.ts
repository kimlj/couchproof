/**
 * Strava Token Management
 * Handles token refresh and database persistence
 */

import { prisma } from '@/lib/prisma';
import { refreshToken as refreshStravaToken } from './api';
import type { StravaTokenResponse } from './types';

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  expires_in: number;
}

/**
 * Check if a token is expired (with 5 minute buffer)
 */
export function isTokenExpired(expiresAt: Date | number | null): boolean {
  if (!expiresAt) return true;

  const expiresAtSeconds = typeof expiresAt === 'number'
    ? expiresAt
    : Math.floor(expiresAt.getTime() / 1000);

  // Add 5 minute buffer to prevent edge case failures
  const bufferSeconds = 300;
  const nowSeconds = Math.floor(Date.now() / 1000);

  return nowSeconds >= (expiresAtSeconds - bufferSeconds);
}

/**
 * Save tokens to database
 */
export async function saveTokens(
  userId: string,
  tokens: StravaTokenResponse
): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      stravaAccessToken: tokens.access_token,
      stravaRefreshToken: tokens.refresh_token,
      stravaTokenExpires: new Date(tokens.expires_at * 1000),
      stravaScope: tokens.athlete ? undefined : undefined, // Preserve existing scope
      stravaConnectedAt: new Date(),
    },
  });
}

/**
 * Get a valid access token for a user, refreshing if necessary
 */
export async function getValidToken(userId: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      stravaAccessToken: true,
      stravaRefreshToken: true,
      stravaTokenExpires: true,
    },
  });

  if (!user?.stravaAccessToken || !user?.stravaRefreshToken) {
    throw new Error('User is not connected to Strava');
  }

  // If token is still valid, return it
  if (!isTokenExpired(user.stravaTokenExpires)) {
    return user.stravaAccessToken;
  }

  // Token is expired, refresh it
  try {
    const newTokens = await refreshStravaToken(user.stravaRefreshToken);

    // Save new tokens to database
    await prisma.user.update({
      where: { id: userId },
      data: {
        stravaAccessToken: newTokens.access_token,
        stravaRefreshToken: newTokens.refresh_token,
        stravaTokenExpires: new Date(newTokens.expires_at * 1000),
      },
    });

    return newTokens.access_token;
  } catch (error) {
    // If refresh fails, the user needs to re-authenticate
    throw new Error('Failed to refresh Strava token. Please reconnect your account.');
  }
}

/**
 * Legacy function for backward compatibility
 */
export async function getValidAccessToken(
  currentAccessToken: string,
  refreshToken: string,
  expiresAt: number
): Promise<{ accessToken: string; needsUpdate: boolean; newTokens?: TokenResponse }> {
  if (!isTokenExpired(expiresAt)) {
    return { accessToken: currentAccessToken, needsUpdate: false };
  }

  const newTokens = await refreshStravaToken(refreshToken);
  return {
    accessToken: newTokens.access_token,
    needsUpdate: true,
    newTokens: {
      access_token: newTokens.access_token,
      refresh_token: newTokens.refresh_token,
      expires_at: newTokens.expires_at,
      expires_in: newTokens.expires_in,
    },
  };
}

/**
 * Disconnect Strava from user account
 */
export async function disconnectStrava(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      stravaAccessToken: null,
      stravaRefreshToken: null,
      stravaTokenExpires: null,
      stravaScope: null,
      stravaId: null,
    },
  });
}
