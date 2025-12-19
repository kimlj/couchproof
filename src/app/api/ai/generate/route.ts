/**
 * AI Generation API Endpoint
 * POST /api/ai/generate - Generate AI content (roasts, hype, narratives, personality)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/supabase/server';
import { hasCreditsRemaining } from '@/lib/ai/avoidance';
import {
  generateRoast,
  generateHype,
  generateNarrative,
  generatePersonalityProfile,
} from '@/lib/ai/generate';
import type { UserStatsForAI } from '@/types';

// ==================== REQUEST TYPES ====================

interface GenerateRequest {
  type: 'roast' | 'hype' | 'narrative' | 'personality';
  style?: string;
  activityId?: string;
  stats: UserStatsForAI; // Client must provide stats
}

// ==================== POST HANDLER ====================

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user
    const user = await getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    // 2. Parse request body
    const body: GenerateRequest = await request.json();
    const { type, style, activityId, stats } = body;

    // 3. Validate request
    if (!type || !['roast', 'hype', 'narrative', 'personality'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid generation type. Must be: roast, hype, narrative, or personality' },
        { status: 400 }
      );
    }

    if (!stats) {
      return NextResponse.json(
        { error: 'Missing stats data. Please provide UserStatsForAI object' },
        { status: 400 }
      );
    }

    // Verify user owns these stats
    if (stats.identity.id !== user.id) {
      return NextResponse.json(
        { error: 'Stats user ID does not match authenticated user' },
        { status: 403 }
      );
    }

    // 4. Check AI credits
    // TODO: Get actual premium status from user subscription
    const isPremium = false; // For now, default to free tier
    const creditCheck = await hasCreditsRemaining(user.id, isPremium);

    if (!creditCheck.hasCredits) {
      return NextResponse.json(
        {
          error: 'Daily AI generation limit reached',
          limit: creditCheck.limit,
          remaining: 0,
          resetTime: 'tomorrow',
        },
        { status: 429 }
      );
    }

    // 5. Generate content based on type
    let result: any;

    try {
      switch (type) {
        case 'roast':
          result = await generateRoast(stats, {
            style: style as any,
            avoidRepetition: true,
          });
          break;

        case 'hype':
          result = await generateHype(stats, {
            style: style as any,
            avoidRepetition: true,
          });
          break;

        case 'narrative':
          // If activityId is provided, we'd need to fetch activity details
          // For now, generate general narrative
          result = await generateNarrative(stats, {
            avoidRepetition: true,
          });
          break;

        case 'personality':
          result = await generatePersonalityProfile(stats, {
            avoidRepetition: true,
          });
          break;

        default:
          return NextResponse.json(
            { error: 'Unsupported generation type' },
            { status: 400 }
          );
      }
    } catch (genError) {
      console.error('Generation error:', genError);
      return NextResponse.json(
        {
          error: 'Failed to generate content',
          details: genError instanceof Error ? genError.message : 'Unknown error',
        },
        { status: 500 }
      );
    }

    // 6. Return success response with updated credits
    const updatedCredits = await hasCreditsRemaining(user.id, isPremium);

    return NextResponse.json({
      success: true,
      data: result,
      credits: {
        remaining: updatedCredits.remaining,
        limit: updatedCredits.limit,
        used: updatedCredits.limit - updatedCredits.remaining,
      },
    });
  } catch (error) {
    console.error('AI generation API error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// ==================== GET HANDLER (Stats/Info) ====================

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const user = await getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    // Get credits info
    const isPremium = false; // TODO: Get from user subscription
    const creditCheck = await hasCreditsRemaining(user.id, isPremium);

    // Get generation stats
    const { getGenerationStats } = await import('@/lib/ai/avoidance');
    const stats = await getGenerationStats(user.id);

    return NextResponse.json({
      credits: {
        remaining: creditCheck.remaining,
        limit: creditCheck.limit,
        used: creditCheck.limit - creditCheck.remaining,
      },
      stats: {
        total: stats.total,
        today: stats.today,
        thisWeek: stats.thisWeek,
        thisMonth: stats.thisMonth,
        byType: stats.byType,
      },
      availableTypes: ['roast', 'hype', 'narrative', 'personality'],
      availableStyles: {
        roast: [
          'savage',
          'passive-aggressive',
          'disappointed-parent',
          'gym-bro',
          'corporate-speak',
          'british-politeness',
          'poet',
          'sports-commentator',
        ],
        hype: [
          'hype-beast',
          'wise-mentor',
          'sports-announcer',
          'motivational-speaker',
          'proud-friend',
        ],
      },
    });
  } catch (error) {
    console.error('AI info API error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// ==================== OPTIONS HANDLER (CORS) ====================

export async function OPTIONS(request: NextRequest) {
  return NextResponse.json(
    {},
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    }
  );
}
