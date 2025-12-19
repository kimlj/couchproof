/**
 * AI Generation System - Main Export
 * Centralized exports for all AI generation functionality
 */

// Configuration
export { AI_CONFIG } from './config';
export type { AIProvider, GenerationType } from './config';

// Client
export {
  generateContent,
  generateAndParseContent,
  streamContent,
  testConnection,
  getProviderInfo,
} from './client';
export type {
  GenerationOptions,
  GenerationResult,
  ParsedGenerationResult,
} from './client';

// Prompts
export {
  ROAST_SYSTEM_PROMPT,
  HYPE_SYSTEM_PROMPT,
  NARRATIVE_SYSTEM_PROMPT,
  PERSONALITY_SYSTEM_PROMPT,
  ROAST_STYLES,
  HYPE_STYLES,
  buildRoastUserPrompt,
  buildHypeUserPrompt,
  buildNarrativeUserPrompt,
  buildPersonalityUserPrompt,
} from './prompts';
export type { RoastStyle, HypeStyle } from './prompts';

// High-level generation functions
export {
  generateRoast,
  generateHype,
  generateNarrative,
  generatePersonalityProfile,
  generateAll,
  quickRoast,
  quickHype,
} from './generate';

// Avoidance and tracking
export {
  getRecentGenerations,
  getAllRecentGenerations,
  buildAvoidanceContext,
  buildFullAvoidanceContext,
  calculateSimilarity,
  isTooSimilar,
  saveGeneration,
  getTodayGenerationCount,
  hasCreditsRemaining,
  getGenerationStats,
} from './avoidance';
