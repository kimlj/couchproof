import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';

export type CurrentUser = {
  id: string;
  email: string;
  name: string | null;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  stravaId: string | null;
  stravaConnected: boolean;
};

/**
 * Get the current authenticated user from the database
 * Works for both Google (Supabase) and Strava authentication
 */
export async function getCurrentDbUser(): Promise<CurrentUser | null> {
  try {
    const supabase = await createClient();
    const { data: { user: supabaseUser } } = await supabase.auth.getUser();

    if (!supabaseUser) {
      return null;
    }

    // Try to find user by email in Prisma
    let dbUser = await prisma.user.findUnique({
      where: { email: supabaseUser.email! },
    });

    // If no user found, create one from Supabase data
    if (!dbUser) {
      const metadata = supabaseUser.user_metadata || {};
      dbUser = await prisma.user.create({
        data: {
          email: supabaseUser.email!,
          name: metadata.full_name || metadata.name || null,
          firstName: metadata.given_name || null,
          lastName: metadata.family_name || null,
          avatarUrl: metadata.avatar_url || metadata.picture || null,
        },
      });
    }

    return {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      firstName: dbUser.firstName,
      lastName: dbUser.lastName,
      avatarUrl: dbUser.avatarUrl,
      stravaId: dbUser.stravaId,
      stravaConnected: !!dbUser.stravaId,
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

/**
 * Get the full user record with all related data
 */
export async function getFullDbUser(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      athleteStats: true,
      personality: true,
      gear: true,
    },
  });
}
