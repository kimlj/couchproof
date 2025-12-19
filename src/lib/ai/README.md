# Couchproof AI Generation System

A comprehensive AI-powered content generation system for creating personalized roasts, hype messages, activity narratives, and personality profiles based on Strava data.

## Features

- **Multiple Content Types**: Roasts, Hype, Narratives, and Personality Profiles
- **Dual Provider Support**: Works with both Anthropic (Claude) and OpenAI (GPT)
- **Style Variations**: 8 roast styles and 5 hype styles for variety
- **Repetition Avoidance**: Tracks recent generations to prevent repetitive content
- **Credit System**: Daily limits for free (3/day) and premium (50/day) users
- **Similarity Detection**: Prevents generating too-similar content
- **Full Type Safety**: Complete TypeScript types for all interfaces

## Quick Start

```typescript
import { generateRoast, generateHype, hasCreditsRemaining } from '@/lib/ai';

// Check if user has credits
const { hasCredits, remaining } = await hasCreditsRemaining(userId);

if (hasCredits) {
  // Generate a roast
  const roast = await generateRoast(userStats, {
    style: 'savage',
    avoidRepetition: true
  });

  console.log(roast.content);
  console.log(`Generation ID: ${roast.generationId}`);
}
```

## Content Types

### 1. Roasts
Witty, sarcastic commentary on athlete behavior and stats.

**Available Styles:**
- `savage` - Maximum sarcasm, drill sergeant energy
- `passive-aggressive` - Compliments that are actually roasts
- `disappointed-parent` - "I'm not mad, just disappointed"
- `gym-bro` - Gym culture language and irony
- `corporate-speak` - Business quarterly review style
- `british-politeness` - Aggressively polite roasting
- `poet` - Roasts delivered in verse
- `sports-commentator` - Dramatic sports broadcast style

```typescript
const roast = await generateRoast(stats, {
  style: 'gym-bro',
  avoidRepetition: true
});
```

### 2. Hype
Motivational, enthusiastic celebration of achievements.

**Available Styles:**
- `hype-beast` - Maximum energy and enthusiasm
- `wise-mentor` - Yoda meets running coach
- `sports-announcer` - Championship game energy
- `motivational-speaker` - Tony Robbins vibes
- `proud-friend` - Your best friend bragging about you

```typescript
const hype = await generateHype(stats, {
  style: 'motivational-speaker'
});
```

### 3. Narratives
Story-driven summaries of activities or training periods.

```typescript
// For a specific activity
const narrative = await generateNarrative(stats, {
  activity: {
    id: 'activity-123',
    name: 'Morning Run',
    type: 'Run',
    distance: 10000,
    time: 3600,
    elevation: 150,
    date: new Date(),
    kudosCount: 12
  }
});

// For recent journey summary
const narrative = await generateNarrative(stats);
```

### 4. Personality Profiles
Comprehensive analysis of training personality and patterns.

```typescript
const profile = await generatePersonalityProfile(stats);

console.log(profile.profileSummary);
console.log(profile.strengths);
console.log(profile.spiritAnimal, profile.spiritAnimalEmoji);
```

## Configuration

### Environment Variables

```bash
# Choose your AI provider
AI_PROVIDER=anthropic # or 'openai'

# Anthropic (Claude)
ANTHROPIC_API_KEY=sk-ant-...

# OpenAI (GPT)
OPENAI_API_KEY=sk-...
```

### Config Options

Edit `src/lib/ai/config.ts`:

```typescript
export const AI_CONFIG = {
  provider: 'anthropic', // or 'openai'
  anthropicModel: 'claude-3-5-sonnet-20241022',
  openaiModel: 'gpt-4o',
  maxTokens: 500,
  temperature: {
    roast: 0.9,
    hype: 0.8,
    narrative: 0.7,
    personality: 0.6
  },
  credits: {
    free: { daily: 3 },
    premium: { daily: 50 }
  }
};
```

## API Usage

### POST /api/ai/generate

Generate AI content via API endpoint.

```typescript
const response = await fetch('/api/ai/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'roast',
    style: 'savage',
    stats: userStatsForAI
  })
});

const { data, credits } = await response.json();
console.log(data.content);
console.log(`Credits remaining: ${credits.remaining}/${credits.limit}`);
```

### GET /api/ai/generate

Get generation stats and available options.

```typescript
const response = await fetch('/api/ai/generate');
const { credits, stats, availableTypes, availableStyles } = await response.json();

console.log(`You have ${credits.remaining} credits remaining`);
console.log(`Total generations: ${stats.total}`);
```

## Advanced Usage

### Batch Generation

Generate all content types at once:

```typescript
import { generateAll } from '@/lib/ai';

const all = await generateAll(userStats);

console.log(all.roast.content);
console.log(all.hype.content);
console.log(all.narrative.content);
console.log(all.personality.profileSummary);
```

### Quick Generation (Without Saving)

Generate content without saving to database:

```typescript
import { quickRoast, quickHype } from '@/lib/ai';

const roast = await quickRoast(stats, 'savage');
const hype = await quickHype(stats, 'hype-beast');
```

### Custom Avoidance

Build custom avoidance context:

```typescript
import { getRecentGenerations, buildAvoidanceContext } from '@/lib/ai';

const recentRoasts = await getRecentGenerations(userId, 'roast', 10);
const avoidanceContext = buildAvoidanceContext(recentRoasts);

// Use in custom generation...
```

### Similarity Detection

Check if content is too similar:

```typescript
import { isTooSimilar, getRecentGenerations } from '@/lib/ai';

const recent = await getRecentGenerations(userId, 'roast', 5);
const newContent = "Your generated content...";

if (isTooSimilar(newContent, recent)) {
  console.log('Content too similar, regenerating...');
}
```

## Credit Management

### Check Credits

```typescript
import { hasCreditsRemaining, getTodayGenerationCount } from '@/lib/ai';

const { hasCredits, remaining, limit } = await hasCreditsRemaining(userId, isPremium);

if (!hasCredits) {
  console.log(`Daily limit of ${limit} reached. Try again tomorrow!`);
}
```

### Generation Statistics

```typescript
import { getGenerationStats } from '@/lib/ai';

const stats = await getGenerationStats(userId);

console.log(`Total: ${stats.total}`);
console.log(`Today: ${stats.today}`);
console.log(`This week: ${stats.thisWeek}`);
console.log(`By type:`, stats.byType);
```

## Database Schema

The system requires an `ai_generations` table:

```sql
CREATE TABLE ai_generations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('roast', 'hype', 'narrative', 'personality')),
  style TEXT,
  activity_id TEXT,
  input_context JSONB,
  prompt TEXT NOT NULL,
  response TEXT NOT NULL,
  key_phrases_used TEXT[],
  data_points_referenced TEXT[],
  tokens_used INTEGER,
  model_used TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_ai_generations_user_id ON ai_generations(user_id);
CREATE INDEX idx_ai_generations_type ON ai_generations(type);
CREATE INDEX idx_ai_generations_created_at ON ai_generations(created_at DESC);
```

## Architecture

```
src/lib/ai/
├── config.ts          # AI configuration and settings
├── prompts.ts         # System prompts and prompt builders
├── client.ts          # AI client abstraction (Anthropic/OpenAI)
├── avoidance.ts       # Repetition avoidance and tracking
├── generate.ts        # High-level generation functions
└── index.ts           # Main exports

src/app/api/ai/
└── generate/
    └── route.ts       # API endpoint
```

## Error Handling

The system includes comprehensive error handling:

```typescript
try {
  const roast = await generateRoast(stats);
  console.log(roast.content);
} catch (error) {
  if (error.message.includes('credits')) {
    // Handle credit limit
  } else if (error.message.includes('API key')) {
    // Handle missing API key
  } else {
    // Handle other errors
  }
}
```

## Testing

Test AI connection:

```typescript
import { testConnection, getProviderInfo } from '@/lib/ai';

const isConnected = await testConnection();
const info = getProviderInfo();

console.log(`Provider: ${info.provider}`);
console.log(`Model: ${info.model}`);
console.log(`Configured: ${info.configured}`);
console.log(`Connected: ${isConnected}`);
```

## Best Practices

1. **Always check credits** before generating content
2. **Enable repetition avoidance** for user-facing generations
3. **Use appropriate styles** based on user context
4. **Save generations** to track usage and avoid repetition
5. **Handle errors gracefully** with user-friendly messages
6. **Monitor token usage** to control costs
7. **Implement rate limiting** on the API endpoint

## Performance

- **Average generation time**: 1-3 seconds
- **Tokens per generation**: 300-500 (roast/hype), 600-1000 (personality)
- **Database queries**: Optimized with indexes
- **Avoidance lookback**: Configurable (default: 10 generations)

## Future Enhancements

- [ ] Streaming responses for real-time generation
- [ ] Multi-language support
- [ ] User feedback loop for content quality
- [ ] A/B testing different prompt variations
- [ ] Caching for frequently requested content
- [ ] Webhook notifications for generation completion
- [ ] Rate limiting per IP address
- [ ] Content moderation filters
