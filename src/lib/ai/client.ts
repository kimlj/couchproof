/**
 * AI Client Abstraction
 * Unified interface for both Anthropic and OpenAI
 */

import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { AI_CONFIG, type GenerationType } from './config';
import {
  ROAST_SYSTEM_PROMPT,
  HYPE_SYSTEM_PROMPT,
  NARRATIVE_SYSTEM_PROMPT,
  PERSONALITY_SYSTEM_PROMPT,
  SUMMARY_SYSTEM_PROMPT,
} from './prompts';

// ==================== CLIENT INITIALIZATION ====================

let anthropicClient: Anthropic | null = null;
let openaiClient: OpenAI | null = null;

function getAnthropicClient(): Anthropic {
  if (!anthropicClient) {
    if (!AI_CONFIG.anthropicApiKey) {
      throw new Error('ANTHROPIC_API_KEY is not configured');
    }
    anthropicClient = new Anthropic({
      apiKey: AI_CONFIG.anthropicApiKey,
    });
  }
  return anthropicClient;
}

function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    if (!AI_CONFIG.openaiApiKey) {
      throw new Error('OPENAI_API_KEY is not configured');
    }
    openaiClient = new OpenAI({
      apiKey: AI_CONFIG.openaiApiKey,
    });
  }
  return openaiClient;
}

// ==================== SYSTEM PROMPT MAPPING ====================

const SYSTEM_PROMPTS: Record<string, string> = {
  roast: ROAST_SYSTEM_PROMPT,
  hype: HYPE_SYSTEM_PROMPT,
  narrative: NARRATIVE_SYSTEM_PROMPT,
  personality: PERSONALITY_SYSTEM_PROMPT,
  summary: SUMMARY_SYSTEM_PROMPT,
};

// ==================== GENERATION TYPES ====================

export interface GenerationOptions {
  type: GenerationType | 'summary';
  userPrompt: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

export interface GenerationResult {
  content: string;
  tokensUsed: number;
  modelUsed: string;
  provider: 'anthropic' | 'openai';
  rawResponse?: any;
}

export interface ParsedGenerationResult extends GenerationResult {
  parsedContent: {
    content: string;
    keyPhrasesUsed: string[];
    dataPointsReferenced: string[];
    // Personality-specific fields
    profileSummary?: string;
    strengths?: string[];
    growthAreas?: string[];
    funFacts?: string[];
    spiritAnimal?: string;
    spiritAnimalEmoji?: string;
    spiritAnimalReason?: string;
    compatibility?: string;
  };
}

// ==================== ANTHROPIC GENERATION ====================

async function generateWithAnthropic(
  options: GenerationOptions
): Promise<GenerationResult> {
  const client = getAnthropicClient();
  const systemPrompt = options.systemPrompt || SYSTEM_PROMPTS[options.type];
  const temperature = options.temperature ?? (AI_CONFIG.temperature as any)[options.type] ?? 0.7;
  const maxTokens = options.maxTokens ?? AI_CONFIG.maxTokens;

  try {
    const response = await client.messages.create({
      model: AI_CONFIG.anthropicModel,
      max_tokens: maxTokens,
      temperature: temperature,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: options.userPrompt,
        },
      ],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Anthropic');
    }

    return {
      content: content.text,
      tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
      modelUsed: AI_CONFIG.anthropicModel,
      provider: 'anthropic',
      rawResponse: response,
    };
  } catch (error) {
    console.error('Anthropic generation error:', error);
    throw new Error(
      `Failed to generate with Anthropic: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

// ==================== OPENAI GENERATION ====================

async function generateWithOpenAI(
  options: GenerationOptions
): Promise<GenerationResult> {
  const client = getOpenAIClient();
  const systemPrompt = options.systemPrompt || SYSTEM_PROMPTS[options.type];
  const temperature = options.temperature ?? (AI_CONFIG.temperature as any)[options.type] ?? 0.7;
  const maxTokens = options.maxTokens ?? AI_CONFIG.maxTokens;

  try {
    const response = await client.chat.completions.create({
      model: AI_CONFIG.openaiModel,
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: options.userPrompt,
        },
      ],
      temperature: temperature,
      max_tokens: maxTokens,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content in OpenAI response');
    }

    return {
      content: content,
      tokensUsed: response.usage?.total_tokens ?? 0,
      modelUsed: AI_CONFIG.openaiModel,
      provider: 'openai',
      rawResponse: response,
    };
  } catch (error) {
    console.error('OpenAI generation error:', error);
    throw new Error(
      `Failed to generate with OpenAI: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

// ==================== UNIFIED GENERATION ====================

/**
 * Generate AI content using the configured provider
 */
export async function generateContent(
  options: GenerationOptions
): Promise<GenerationResult> {
  const provider = AI_CONFIG.provider;

  if (provider === 'anthropic') {
    return generateWithAnthropic(options);
  } else if (provider === 'openai') {
    return generateWithOpenAI(options);
  } else {
    throw new Error(`Unknown AI provider: ${provider}`);
  }
}

/**
 * Generate and parse AI content
 * Attempts to parse JSON response and extract structured data
 */
export async function generateAndParseContent(
  options: GenerationOptions
): Promise<ParsedGenerationResult> {
  const result = await generateContent(options);

  try {
    // Try to parse as JSON
    const parsed = JSON.parse(result.content);

    return {
      ...result,
      parsedContent: {
        content: parsed.content || result.content,
        keyPhrasesUsed: parsed.keyPhrasesUsed || [],
        dataPointsReferenced: parsed.dataPointsReferenced || [],
        // Personality-specific fields
        profileSummary: parsed.profileSummary,
        strengths: parsed.strengths,
        growthAreas: parsed.growthAreas,
        funFacts: parsed.funFacts,
        spiritAnimal: parsed.spiritAnimal,
        spiritAnimalEmoji: parsed.spiritAnimalEmoji,
        spiritAnimalReason: parsed.spiritAnimalReason,
        compatibility: parsed.compatibility,
      },
    };
  } catch (error) {
    // If parsing fails, try to extract JSON from markdown code blocks
    const jsonMatch = result.content.match(/```json?\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[1]);
        return {
          ...result,
          parsedContent: {
            content: parsed.content || result.content,
            keyPhrasesUsed: parsed.keyPhrasesUsed || [],
            dataPointsReferenced: parsed.dataPointsReferenced || [],
            profileSummary: parsed.profileSummary,
            strengths: parsed.strengths,
            growthAreas: parsed.growthAreas,
            funFacts: parsed.funFacts,
            spiritAnimal: parsed.spiritAnimal,
            spiritAnimalEmoji: parsed.spiritAnimalEmoji,
            spiritAnimalReason: parsed.spiritAnimalReason,
            compatibility: parsed.compatibility,
          },
        };
      } catch (e) {
        // Continue to fallback
      }
    }

    // Fallback: return raw content
    console.warn('Failed to parse AI response as JSON, using raw content');
    return {
      ...result,
      parsedContent: {
        content: result.content,
        keyPhrasesUsed: [],
        dataPointsReferenced: [],
      },
    };
  }
}

// ==================== STREAMING SUPPORT ====================

/**
 * Stream AI content generation
 * Returns an async iterator for streaming responses
 */
export async function* streamContent(
  options: GenerationOptions
): AsyncGenerator<string, void, unknown> {
  const provider = AI_CONFIG.provider;

  if (provider === 'anthropic') {
    yield* streamWithAnthropic(options);
  } else if (provider === 'openai') {
    yield* streamWithOpenAI(options);
  } else {
    throw new Error(`Unknown AI provider: ${provider}`);
  }
}

async function* streamWithAnthropic(
  options: GenerationOptions
): AsyncGenerator<string, void, unknown> {
  const client = getAnthropicClient();
  const systemPrompt = options.systemPrompt || SYSTEM_PROMPTS[options.type];
  const temperature = options.temperature ?? (AI_CONFIG.temperature as any)[options.type] ?? 0.7;
  const maxTokens = options.maxTokens ?? AI_CONFIG.maxTokens;

  const stream = await client.messages.stream({
    model: AI_CONFIG.anthropicModel,
    max_tokens: maxTokens,
    temperature: temperature,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: options.userPrompt,
      },
    ],
  });

  for await (const event of stream) {
    if (
      event.type === 'content_block_delta' &&
      event.delta.type === 'text_delta'
    ) {
      yield event.delta.text;
    }
  }
}

async function* streamWithOpenAI(
  options: GenerationOptions
): AsyncGenerator<string, void, unknown> {
  const client = getOpenAIClient();
  const systemPrompt = options.systemPrompt || SYSTEM_PROMPTS[options.type];
  const temperature = options.temperature ?? (AI_CONFIG.temperature as any)[options.type] ?? 0.7;
  const maxTokens = options.maxTokens ?? AI_CONFIG.maxTokens;

  const stream = await client.chat.completions.create({
    model: AI_CONFIG.openaiModel,
    messages: [
      {
        role: 'system',
        content: systemPrompt,
      },
      {
        role: 'user',
        content: options.userPrompt,
      },
    ],
    temperature: temperature,
    max_tokens: maxTokens,
    stream: true,
  });

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content;
    if (content) {
      yield content;
    }
  }
}

// ==================== UTILITY FUNCTIONS ====================

/**
 * Test connection to AI provider
 */
export async function testConnection(): Promise<boolean> {
  try {
    const result = await generateContent({
      type: 'roast',
      userPrompt: 'Test connection',
      maxTokens: 10,
    });
    return result.content.length > 0;
  } catch (error) {
    console.error('AI connection test failed:', error);
    return false;
  }
}

/**
 * Get current provider info
 */
export function getProviderInfo() {
  return {
    provider: AI_CONFIG.provider,
    model:
      AI_CONFIG.provider === 'anthropic'
        ? AI_CONFIG.anthropicModel
        : AI_CONFIG.openaiModel,
    configured:
      AI_CONFIG.provider === 'anthropic'
        ? !!AI_CONFIG.anthropicApiKey
        : !!AI_CONFIG.openaiApiKey,
  };
}
