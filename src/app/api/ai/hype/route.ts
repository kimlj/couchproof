import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { generateHype } from '@/lib/ai/generate';
import { calculateUserStats } from '@/lib/stats/calculate';

export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from database
    const dbUser = await prisma.user.findUnique({
      where: { email: user.email! },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Build stats for AI
    const stats = await calculateUserStats(dbUser.id);

    // Generate hype
    const result = await generateHype(stats);

    return NextResponse.json({
      content: result.content,
      generationId: result.generationId,
    });
  } catch (error) {
    console.error('Error generating hype:', error);
    return NextResponse.json(
      { error: 'Failed to generate hype' },
      { status: 500 }
    );
  }
}
