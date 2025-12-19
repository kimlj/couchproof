import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user: supabaseUser } } = await supabase.auth.getUser();

    if (!supabaseUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Try to find user by email in Prisma
    let dbUser = await prisma.user.findUnique({
      where: { email: supabaseUser.email! },
      include: {
        athleteStats: true,
        personality: true,
        gear: true,
      },
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
        include: {
          athleteStats: true,
          personality: true,
          gear: true,
        },
      });
    }

    return NextResponse.json({ user: dbUser });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}
