/**
 * AI Configuration
 * Centralized configuration for AI providers and models
 */

export const AI_CONFIG = {
  // Provider selection - 'anthropic' or 'openai'
  provider: (process.env.AI_PROVIDER || 'anthropic') as 'anthropic' | 'openai',

  // Anthropic (Claude) configuration
  anthropicModel: 'claude-3-5-sonnet-20241022',
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,

  // OpenAI (GPT) configuration
  openaiModel: 'gpt-4o',
  openaiApiKey: process.env.OPENAI_API_KEY,

  // Generation parameters
  maxTokens: 500,
  temperature: {
    roast: 0.9,      // High creativity for roasts
    hype: 0.8,       // High energy for hype
    narrative: 0.7,  // Balanced for narratives
    personality: 0.6, // More focused for analysis
    summary: 0.6     // Balanced for activity summaries
  },

  // Rate limiting
  credits: {
    free: {
      daily: 3,
      reset: 'daily' as const
    },
    premium: {
      daily: 50,
      reset: 'daily' as const
    }
  },

  // Repetition avoidance
  avoidance: {
    lookbackLimit: 10, // Check last N generations
    similarityThreshold: 0.7 // Avoid if > 70% similar
  }
} as const;

export type AIProvider = typeof AI_CONFIG.provider;
export type GenerationType = keyof typeof AI_CONFIG.temperature;
