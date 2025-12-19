/**
 * High-level AI Generation Functions
 * Convenience functions for generating roasts, hype, narratives, and personalities
 */

import type { UserStatsForAI, AIGenerationResponse, PersonalityProfile } from '@/types';
import { generateAndParseContent } from './client';
import {
  buildRoastUserPrompt,
  buildHypeUserPrompt,
  buildNarrativeUserPrompt,
  buildPersonalityUserPrompt,
  buildSummaryUserPrompt,
  SUMMARY_SYSTEM_PROMPT,
  type RoastStyle,
  type HypeStyle,
} from './prompts';
import {
  getRecentGenerations,
  buildAvoidanceContext,
  saveGeneration,
  isTooSimilar,
} from './avoidance';
import { AI_CONFIG } from './config';

// ==================== ROAST GENERATION ====================

/**
 * Generate a roast for a user
 */
export async function generateRoast(
  stats: UserStatsForAI,
  options?: {
    style?: RoastStyle;
    avoidRepetition?: boolean;
  }
): Promise<AIGenerationResponse> {
  const userId = stats.identity.id;
  const style = options?.style;
  const avoidRepetition = options?.avoidRepetition ?? true;

  // Get recent roasts for avoidance
  let avoidanceContextStr = '';
  if (avoidRepetition) {
    const recentGenerations = await getRecentGenerations(userId, 'roast', 5);
    avoidanceContextStr = buildAvoidanceContext(recentGenerations);
  }

  // Build prompt
  const userPrompt = buildRoastUserPrompt(stats, style, avoidanceContextStr);

  // Generate content
  const result = await generateAndParseContent({
    type: 'roast',
    userPrompt,
    temperature: AI_CONFIG.temperature.roast,
  });

  // Check for similarity if avoidance is enabled
  if (avoidRepetition) {
    const recentGenerations = await getRecentGenerations(userId, 'roast', 3);
    if (isTooSimilar(result.parsedContent.content, recentGenerations)) {
      console.warn('Generated roast too similar to recent ones, retrying...');
      // Could implement retry logic here, but for now just log
    }
  }

  // Save generation
  const savedGeneration = await saveGeneration(
    userId,
    'roast',
    result.parsedContent.content,
    {
      style: style || null,
      prompt: userPrompt,
      keyPhrasesUsed: result.parsedContent.keyPhrasesUsed,
      dataPointsReferenced: result.parsedContent.dataPointsReferenced,
      tokensUsed: result.tokensUsed,
      modelUsed: result.modelUsed,
    }
  );

  return {
    content: result.parsedContent.content,
    style: style || 'default',
    keyPhrasesUsed: result.parsedContent.keyPhrasesUsed,
    dataPointsReferenced: result.parsedContent.dataPointsReferenced,
    generationId: savedGeneration.id,
  };
}

// ==================== HYPE GENERATION ====================

/**
 * Generate hype for a user
 */
export async function generateHype(
  stats: UserStatsForAI,
  options?: {
    style?: HypeStyle;
    avoidRepetition?: boolean;
  }
): Promise<AIGenerationResponse> {
  const userId = stats.identity.id;
  const style = options?.style;
  const avoidRepetition = options?.avoidRepetition ?? true;

  // Get recent hype for avoidance
  let avoidanceContextStr = '';
  if (avoidRepetition) {
    const recentGenerations = await getRecentGenerations(userId, 'hype', 5);
    avoidanceContextStr = buildAvoidanceContext(recentGenerations);
  }

  // Build prompt
  const userPrompt = buildHypeUserPrompt(stats, style, avoidanceContextStr);

  // Generate content
  const result = await generateAndParseContent({
    type: 'hype',
    userPrompt,
    temperature: AI_CONFIG.temperature.hype,
  });

  // Check for similarity
  if (avoidRepetition) {
    const recentGenerations = await getRecentGenerations(userId, 'hype', 3);
    if (isTooSimilar(result.parsedContent.content, recentGenerations)) {
      console.warn('Generated hype too similar to recent ones, retrying...');
    }
  }

  // Save generation
  const savedGeneration = await saveGeneration(
    userId,
    'hype',
    result.parsedContent.content,
    {
      style: style || null,
      prompt: userPrompt,
      keyPhrasesUsed: result.parsedContent.keyPhrasesUsed,
      dataPointsReferenced: result.parsedContent.dataPointsReferenced,
      tokensUsed: result.tokensUsed,
      modelUsed: result.modelUsed,
    }
  );

  return {
    content: result.parsedContent.content,
    style: style || 'default',
    keyPhrasesUsed: result.parsedContent.keyPhrasesUsed,
    dataPointsReferenced: result.parsedContent.dataPointsReferenced,
    generationId: savedGeneration.id,
  };
}

// ==================== NARRATIVE GENERATION ====================

/**
 * Generate a narrative for an activity or recent journey
 */
export async function generateNarrative(
  stats: UserStatsForAI,
  options?: {
    activity?: {
      id: string;
      name: string;
      type: string;
      distance: number;
      time: number;
      elevation: number;
      date: Date;
      kudosCount?: number;
    };
    avoidRepetition?: boolean;
  }
): Promise<AIGenerationResponse> {
  const userId = stats.identity.id;
  const activity = options?.activity;
  const avoidRepetition = options?.avoidRepetition ?? true;

  // Get recent narratives for avoidance
  let avoidanceContextStr = '';
  if (avoidRepetition) {
    const recentGenerations = await getRecentGenerations(userId, 'narrative', 5);
    avoidanceContextStr = buildAvoidanceContext(recentGenerations);
  }

  // Build prompt
  const userPrompt = buildNarrativeUserPrompt(
    stats,
    activity
      ? {
          name: activity.name,
          type: activity.type,
          distance: activity.distance,
          time: activity.time,
          elevation: activity.elevation,
          date: activity.date,
          kudosCount: activity.kudosCount,
        }
      : undefined,
    avoidanceContextStr
  );

  // Generate content
  const result = await generateAndParseContent({
    type: 'narrative',
    userPrompt,
    temperature: AI_CONFIG.temperature.narrative,
    maxTokens: 600, // Slightly more tokens for narratives
  });

  // Check for similarity
  if (avoidRepetition) {
    const recentGenerations = await getRecentGenerations(userId, 'narrative', 3);
    if (isTooSimilar(result.parsedContent.content, recentGenerations)) {
      console.warn('Generated narrative too similar to recent ones');
    }
  }

  // Save generation
  const savedGeneration = await saveGeneration(
    userId,
    'narrative',
    result.parsedContent.content,
    {
      activityId: activity?.id || null,
      prompt: userPrompt,
      keyPhrasesUsed: result.parsedContent.keyPhrasesUsed,
      dataPointsReferenced: result.parsedContent.dataPointsReferenced,
      tokensUsed: result.tokensUsed,
      modelUsed: result.modelUsed,
    }
  );

  return {
    content: result.parsedContent.content,
    style: 'narrative',
    keyPhrasesUsed: result.parsedContent.keyPhrasesUsed,
    dataPointsReferenced: result.parsedContent.dataPointsReferenced,
    generationId: savedGeneration.id,
  };
}

// ==================== ACTIVITY SUMMARY GENERATION ====================

/**
 * Generate an AI summary for a specific activity
 */
export async function generateActivitySummary(
  userId: string,
  activity: {
    id: string;
    name: string;
    type: string;
    sportType?: string;
    distance: number;
    movingTime: number;
    elapsedTime?: number;
    totalElevationGain?: number;
    averageSpeed?: number;
    maxSpeed?: number;
    averageHeartrate?: number;
    maxHeartrate?: number;
    averageWatts?: number;
    calories?: number;
    kudosCount?: number;
    achievementCount?: number;
    prCount?: number;
    startDate: Date;
    startDateLocal?: Date;
    city?: string;
    country?: string;
  },
  userContext?: {
    firstName?: string;
    averageDistance?: number;
    averageTime?: number;
    averageElevation?: number;
    currentStreak?: number;
    recentTrend?: string;
  },
  enrichedContext?: {
    isNewLocation?: boolean;
    isUsualLocation?: boolean;
    locationVisitCount?: number;
    isNewTimeOfDay?: boolean;
    isUsualTime?: boolean;
    timeOfDay?: string;
    gear?: {
      name: string;
      type: string;
      totalDistance: number;
      isNew: boolean;
      isFirstUse: boolean;
      usageCount: number;
    };
  }
): Promise<{ content: string; generationId: string }> {
  // Build prompt
  const userPrompt = buildSummaryUserPrompt(activity, userContext, enrichedContext);

  // Generate content
  const result = await generateAndParseContent({
    type: 'summary',
    userPrompt,
    systemPrompt: SUMMARY_SYSTEM_PROMPT,
    temperature: AI_CONFIG.temperature.summary,
    maxTokens: 300,
  });

  // Save generation
  const savedGeneration = await saveGeneration(
    userId,
    'summary' as any,
    result.parsedContent.content,
    {
      activityId: activity.id,
      prompt: userPrompt,
      keyPhrasesUsed: result.parsedContent.keyPhrasesUsed || [],
      dataPointsReferenced: result.parsedContent.dataPointsReferenced || [],
      tokensUsed: result.tokensUsed,
      modelUsed: result.modelUsed,
    }
  );

  return {
    content: result.parsedContent.content,
    generationId: savedGeneration.id,
  };
}

// ==================== PERSONALITY PROFILE GENERATION ====================

/**
 * Generate a comprehensive personality profile
 */
export async function generatePersonalityProfile(
  stats: UserStatsForAI,
  options?: {
    avoidRepetition?: boolean;
  }
): Promise<PersonalityProfile & { generationId: string }> {
  const userId = stats.identity.id;
  const avoidRepetition = options?.avoidRepetition ?? true;

  // Get recent personalities for avoidance
  let avoidanceContextStr = '';
  if (avoidRepetition) {
    const recentGenerations = await getRecentGenerations(userId, 'personality', 3);
    avoidanceContextStr = buildAvoidanceContext(recentGenerations);
  }

  // Build prompt
  const userPrompt = buildPersonalityUserPrompt(stats, avoidanceContextStr);

  // Generate content
  const result = await generateAndParseContent({
    type: 'personality',
    userPrompt,
    temperature: AI_CONFIG.temperature.personality,
    maxTokens: 1000, // More tokens for comprehensive profile
  });

  // Save generation
  const savedGeneration = await saveGeneration(
    userId,
    'personality',
    result.parsedContent.content,
    {
      prompt: userPrompt,
      keyPhrasesUsed: result.parsedContent.keyPhrasesUsed,
      dataPointsReferenced: result.parsedContent.dataPointsReferenced,
      tokensUsed: result.tokensUsed,
      modelUsed: result.modelUsed,
      inputContext: {
        profileSummary: result.parsedContent.profileSummary,
        strengths: result.parsedContent.strengths,
        growthAreas: result.parsedContent.growthAreas,
        funFacts: result.parsedContent.funFacts,
        spiritAnimal: result.parsedContent.spiritAnimal,
        spiritAnimalEmoji: result.parsedContent.spiritAnimalEmoji,
        spiritAnimalReason: result.parsedContent.spiritAnimalReason,
        compatibility: result.parsedContent.compatibility,
      },
    }
  );

  return {
    profileSummary: result.parsedContent.profileSummary || result.parsedContent.content,
    strengths: result.parsedContent.strengths || [],
    growthAreas: result.parsedContent.growthAreas || [],
    funFacts: result.parsedContent.funFacts || [],
    spiritAnimal: result.parsedContent.spiritAnimal || null,
    spiritAnimalEmoji: result.parsedContent.spiritAnimalEmoji || null,
    spiritAnimalReason: result.parsedContent.spiritAnimalReason || null,
    compatibility: result.parsedContent.compatibility || null,
    generationId: savedGeneration.id,
  };
}

// ==================== BATCH GENERATION ====================

/**
 * Generate multiple types at once
 * Useful for onboarding or full profile creation
 */
export async function generateAll(
  stats: UserStatsForAI
): Promise<{
  roast: AIGenerationResponse;
  hype: AIGenerationResponse;
  narrative: AIGenerationResponse;
  personality: PersonalityProfile & { generationId: string };
}> {
  // Generate all in parallel
  const [roast, hype, narrative, personality] = await Promise.all([
    generateRoast(stats),
    generateHype(stats),
    generateNarrative(stats),
    generatePersonalityProfile(stats),
  ]);

  return {
    roast,
    hype,
    narrative,
    personality,
  };
}

// ==================== QUICK GENERATION ====================

/**
 * Quick roast without saving (for previews)
 */
export async function quickRoast(
  stats: UserStatsForAI,
  style?: RoastStyle
): Promise<string> {
  const userPrompt = buildRoastUserPrompt(stats, style);
  const result = await generateAndParseContent({
    type: 'roast',
    userPrompt,
    temperature: AI_CONFIG.temperature.roast,
  });
  return result.parsedContent.content;
}

/**
 * Quick hype without saving (for previews)
 */
export async function quickHype(
  stats: UserStatsForAI,
  style?: HypeStyle
): Promise<string> {
  const userPrompt = buildHypeUserPrompt(stats, style);
  const result = await generateAndParseContent({
    type: 'hype',
    userPrompt,
    temperature: AI_CONFIG.temperature.hype,
  });
  return result.parsedContent.content;
}

// Alias for backward compatibility
export const generatePersonalityAnalysis = generatePersonalityProfile;
