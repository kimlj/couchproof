/**
 * Repetition Avoidance System
 * Prevents AI from generating similar content repeatedly
 */

import { prisma } from '@/lib/prisma';
import type { AIGenerationResult, AvoidanceContext } from '@/types';
import { AI_CONFIG } from './config';

// ==================== DATABASE QUERIES ====================

/**
 * Get recent AI generations for a user
 */
export async function getRecentGenerations(
  userId: string,
  type: 'roast' | 'hype' | 'narrative' | 'personality',
  limit: number = AI_CONFIG.avoidance.lookbackLimit
): Promise<AIGenerationResult[]> {
  try {
    const generations = await prisma.aIGeneration.findMany({
      where: {
        userId,
        type,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return generations.map((record) => ({
      id: record.id,
      userId: record.userId,
      type: record.type as 'roast' | 'hype' | 'narrative' | 'personality',
      style: record.style,
      activityId: record.activityId,
      inputContext: record.inputContext as Record<string, any> | null,
      prompt: record.prompt,
      response: record.response,
      keyPhrasesUsed: record.keyPhrasesUsed || [],
      dataPointsReferenced: record.dataPointsReferenced || [],
      tokensUsed: record.tokensUsed,
      modelUsed: record.modelUsed,
      createdAt: record.createdAt,
    }));
  } catch (error) {
    console.error('Error fetching recent generations:', error);
    return [];
  }
}

/**
 * Get recent generations across all types
 */
export async function getAllRecentGenerations(
  userId: string,
  limit: number = 20
): Promise<AIGenerationResult[]> {
  try {
    const generations = await prisma.aIGeneration.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return generations.map((record) => ({
      id: record.id,
      userId: record.userId,
      type: record.type as 'roast' | 'hype' | 'narrative' | 'personality',
      style: record.style,
      activityId: record.activityId,
      inputContext: record.inputContext as Record<string, any> | null,
      prompt: record.prompt,
      response: record.response,
      keyPhrasesUsed: record.keyPhrasesUsed || [],
      dataPointsReferenced: record.dataPointsReferenced || [],
      tokensUsed: record.tokensUsed,
      modelUsed: record.modelUsed,
      createdAt: record.createdAt,
    }));
  } catch (error) {
    console.error('Error fetching all recent generations:', error);
    return [];
  }
}

// ==================== AVOIDANCE CONTEXT BUILDING ====================

/**
 * Build avoidance context from recent generations
 * This creates a string to append to the prompt
 */
export function buildAvoidanceContext(
  generations: AIGenerationResult[]
): string {
  if (generations.length === 0) {
    return '';
  }

  // Collect all key phrases and data points
  const allKeyPhrases = new Set<string>();
  const allDataPoints = new Set<string>();
  const recentStyles = new Set<string>();
  const recentContents: string[] = [];

  generations.forEach((gen) => {
    // Collect key phrases
    gen.keyPhrasesUsed?.forEach((phrase) => allKeyPhrases.add(phrase));

    // Collect data points
    gen.dataPointsReferenced?.forEach((point) => allDataPoints.add(point));

    // Collect styles
    if (gen.style) {
      recentStyles.add(gen.style);
    }

    // Collect recent content excerpts (first 100 chars)
    if (gen.response) {
      const excerpt = gen.response.substring(0, 100);
      recentContents.push(`"${excerpt}${gen.response.length > 100 ? '...' : ''}"`);
    }
  });

  // Build context string
  let context = '\n\n=== REPETITION AVOIDANCE ===\n';
  context += 'IMPORTANT: DO NOT reuse these elements from recent generations:\n\n';

  if (allKeyPhrases.size > 0) {
    context += 'Recent key phrases to avoid:\n';
    context += Array.from(allKeyPhrases)
      .slice(0, 15)
      .map((phrase) => `- "${phrase}"`)
      .join('\n');
    context += '\n\n';
  }

  if (allDataPoints.size > 0) {
    context += 'Recently referenced data points (vary your focus):\n';
    context += Array.from(allDataPoints)
      .slice(0, 10)
      .map((point) => `- ${point}`)
      .join('\n');
    context += '\n\n';
  }

  if (recentStyles.size > 0) {
    context += `Recent styles used: ${Array.from(recentStyles).join(', ')}\n\n`;
  }

  if (recentContents.length > 0) {
    context += 'Recent generation excerpts (avoid similar themes):\n';
    context += recentContents.slice(0, 3).join('\n');
    context += '\n';
  }

  context += '\nBe creative and find NEW angles, phrases, and data points to reference!\n';
  context += '===========================\n';

  return context;
}

/**
 * Build full avoidance context object
 */
export async function buildFullAvoidanceContext(
  userId: string,
  type: 'roast' | 'hype' | 'narrative' | 'personality'
): Promise<AvoidanceContext> {
  const generations = await getRecentGenerations(userId, type);

  const allKeyPhrases = new Set<string>();
  const allDataPoints = new Set<string>();
  const recentStyles = new Set<string>();
  let lastGenerationDate: Date | null = null;

  generations.forEach((gen) => {
    gen.keyPhrasesUsed?.forEach((phrase) => allKeyPhrases.add(phrase));
    gen.dataPointsReferenced?.forEach((point) => allDataPoints.add(point));
    if (gen.style) {
      recentStyles.add(gen.style);
    }
    if (!lastGenerationDate || gen.createdAt > lastGenerationDate) {
      lastGenerationDate = gen.createdAt;
    }
  });

  return {
    recentPhrasesUsed: Array.from(allKeyPhrases),
    recentDataPointsReferenced: Array.from(allDataPoints),
    recentStyles: Array.from(recentStyles),
    lastGenerationDate,
  };
}

// ==================== SIMILARITY DETECTION ====================

/**
 * Calculate simple similarity score between two texts
 * Returns a value between 0 (completely different) and 1 (identical)
 */
export function calculateSimilarity(text1: string, text2: string): number {
  // Normalize texts
  const normalize = (text: string) =>
    text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter((word) => word.length > 3); // Ignore short words

  const words1 = new Set(normalize(text1));
  const words2 = new Set(normalize(text2));

  if (words1.size === 0 || words2.size === 0) {
    return 0;
  }

  // Calculate Jaccard similarity
  const intersection = new Set([...words1].filter((word) => words2.has(word)));
  const union = new Set([...words1, ...words2]);

  return intersection.size / union.size;
}

/**
 * Check if new content is too similar to recent generations
 */
export function isTooSimilar(
  newContent: string,
  recentGenerations: AIGenerationResult[]
): boolean {
  const threshold = AI_CONFIG.avoidance.similarityThreshold;

  for (const gen of recentGenerations) {
    const similarity = calculateSimilarity(newContent, gen.response);
    if (similarity > threshold) {
      console.warn(
        `Content too similar (${(similarity * 100).toFixed(1)}%) to generation ${gen.id}`
      );
      return true;
    }
  }

  return false;
}

// ==================== SAVE GENERATION ====================

/**
 * Save AI generation to database
 */
export async function saveGeneration(
  userId: string,
  type: 'roast' | 'hype' | 'narrative' | 'personality',
  content: string,
  metadata: {
    style?: string | null;
    activityId?: string | null;
    inputContext?: Record<string, any> | null;
    prompt: string;
    keyPhrasesUsed: string[];
    dataPointsReferenced: string[];
    tokensUsed?: number | null;
    modelUsed?: string | null;
  }
): Promise<AIGenerationResult> {
  const generation = await prisma.aIGeneration.create({
    data: {
      userId,
      type,
      style: metadata.style,
      activityId: metadata.activityId,
      inputContext: metadata.inputContext || undefined,
      prompt: metadata.prompt,
      response: content,
      keyPhrasesUsed: metadata.keyPhrasesUsed,
      dataPointsReferenced: metadata.dataPointsReferenced,
      tokensUsed: metadata.tokensUsed,
      modelUsed: metadata.modelUsed,
    },
  });

  return {
    id: generation.id,
    userId: generation.userId,
    type: generation.type as 'roast' | 'hype' | 'narrative' | 'personality',
    style: generation.style,
    activityId: generation.activityId,
    inputContext: generation.inputContext as Record<string, any> | null,
    prompt: generation.prompt,
    response: generation.response,
    keyPhrasesUsed: generation.keyPhrasesUsed || [],
    dataPointsReferenced: generation.dataPointsReferenced || [],
    tokensUsed: generation.tokensUsed,
    modelUsed: generation.modelUsed,
    createdAt: generation.createdAt,
  };
}

// ==================== USAGE TRACKING ====================

/**
 * Get today's generation count for a user
 */
export async function getTodayGenerationCount(userId: string): Promise<number> {
  // Get start of today in UTC
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const count = await prisma.aIGeneration.count({
    where: {
      userId,
      createdAt: { gte: today },
    },
  });

  return count;
}

/**
 * Check if user has credits remaining
 */
export async function hasCreditsRemaining(
  userId: string,
  isPremium: boolean = false
): Promise<{ hasCredits: boolean; remaining: number; limit: number }> {
  const limit = isPremium
    ? AI_CONFIG.credits.premium.daily
    : AI_CONFIG.credits.free.daily;

  const used = await getTodayGenerationCount(userId);
  const remaining = Math.max(0, limit - used);

  return {
    hasCredits: remaining > 0,
    remaining,
    limit,
  };
}

/**
 * Get generation statistics for a user
 */
export async function getGenerationStats(userId: string): Promise<{
  total: number;
  today: number;
  thisWeek: number;
  thisMonth: number;
  byType: Record<string, number>;
}> {
  const now = new Date();
  const today = new Date(now);
  today.setUTCHours(0, 0, 0, 0);

  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const monthAgo = new Date(now);
  monthAgo.setMonth(monthAgo.getMonth() - 1);

  const [total, todayCount, weekCount, monthCount, allGenerations] = await Promise.all([
    prisma.aIGeneration.count({ where: { userId } }),
    prisma.aIGeneration.count({ where: { userId, createdAt: { gte: today } } }),
    prisma.aIGeneration.count({ where: { userId, createdAt: { gte: weekAgo } } }),
    prisma.aIGeneration.count({ where: { userId, createdAt: { gte: monthAgo } } }),
    prisma.aIGeneration.findMany({
      where: { userId },
      select: { type: true },
    }),
  ]);

  const byType: Record<string, number> = {};
  allGenerations.forEach((gen) => {
    byType[gen.type] = (byType[gen.type] || 0) + 1;
  });

  return {
    total,
    today: todayCount,
    thisWeek: weekCount,
    thisMonth: monthCount,
    byType,
  };
}
