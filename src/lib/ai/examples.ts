/**
 * AI Generation System - Usage Examples
 * Demonstrates how to use the AI generation system in various scenarios
 */

import type { UserStatsForAI } from '@/types';
import {
  generateRoast,
  generateHype,
  generateNarrative,
  generatePersonalityProfile,
  generateAll,
  hasCreditsRemaining,
  getGenerationStats,
  quickRoast,
  quickHype,
} from './index';

// ==================== EXAMPLE 1: BASIC ROAST GENERATION ====================

async function example1_BasicRoast(stats: UserStatsForAI) {
  console.log('=== Example 1: Basic Roast ===\n');

  // Check if user has credits
  const { hasCredits, remaining, limit } = await hasCreditsRemaining(stats.identity.id);

  if (!hasCredits) {
    console.log(`No credits remaining! You've used ${limit}/${limit} for today.`);
    return;
  }

  console.log(`Credits: ${remaining}/${limit} remaining\n`);

  // Generate a roast
  const roast = await generateRoast(stats);

  console.log('Generated Roast:');
  console.log(roast.content);
  console.log(`\nGeneration ID: ${roast.generationId}`);
  console.log(`Style: ${roast.style}`);
  console.log(`Key phrases: ${roast.keyPhrasesUsed.join(', ')}`);
}

// ==================== EXAMPLE 2: ROAST WITH CUSTOM STYLE ====================

async function example2_StyledRoast(stats: UserStatsForAI) {
  console.log('=== Example 2: Styled Roast ===\n');

  // Generate a savage roast
  const savageRoast = await generateRoast(stats, {
    style: 'savage',
    avoidRepetition: true,
  });

  console.log('Savage Roast:');
  console.log(savageRoast.content);
  console.log();

  // Generate a passive-aggressive roast
  const passiveRoast = await generateRoast(stats, {
    style: 'passive-aggressive',
  });

  console.log('Passive-Aggressive Roast:');
  console.log(passiveRoast.content);
  console.log();

  // Generate a gym-bro roast
  const gymBroRoast = await generateRoast(stats, {
    style: 'gym-bro',
  });

  console.log('Gym Bro Roast:');
  console.log(gymBroRoast.content);
}

// ==================== EXAMPLE 3: HYPE GENERATION ====================

async function example3_HypeGeneration(stats: UserStatsForAI) {
  console.log('=== Example 3: Hype Generation ===\n');

  // Generate default hype
  const hype = await generateHype(stats);

  console.log('Hype Message:');
  console.log(hype.content);
  console.log();

  // Generate motivational speaker style hype
  const motivationalHype = await generateHype(stats, {
    style: 'motivational-speaker',
  });

  console.log('Motivational Speaker Hype:');
  console.log(motivationalHype.content);
  console.log();

  // Generate sports announcer style hype
  const announcerHype = await generateHype(stats, {
    style: 'sports-announcer',
  });

  console.log('Sports Announcer Hype:');
  console.log(announcerHype.content);
}

// ==================== EXAMPLE 4: NARRATIVE GENERATION ====================

async function example4_NarrativeGeneration(stats: UserStatsForAI) {
  console.log('=== Example 4: Narrative Generation ===\n');

  // Generate general narrative (recent journey)
  const generalNarrative = await generateNarrative(stats);

  console.log('Recent Journey Narrative:');
  console.log(generalNarrative.content);
  console.log();

  // Generate narrative for specific activity
  const activityNarrative = await generateNarrative(stats, {
    activity: {
      id: 'activity-123',
      name: 'Morning Tempo Run',
      type: 'Run',
      distance: 10000, // 10km in meters
      time: 2700, // 45 minutes in seconds
      elevation: 150, // meters
      date: new Date(),
      kudosCount: 15,
    },
  });

  console.log('Activity Narrative:');
  console.log(activityNarrative.content);
}

// ==================== EXAMPLE 5: PERSONALITY PROFILE ====================

async function example5_PersonalityProfile(stats: UserStatsForAI) {
  console.log('=== Example 5: Personality Profile ===\n');

  const profile = await generatePersonalityProfile(stats);

  console.log('PERSONALITY PROFILE');
  console.log('===================\n');

  console.log('Summary:');
  console.log(profile.profileSummary);
  console.log();

  console.log('Strengths:');
  profile.strengths.forEach((strength, i) => {
    console.log(`${i + 1}. ${strength}`);
  });
  console.log();

  console.log('Growth Areas:');
  profile.growthAreas.forEach((area, i) => {
    console.log(`${i + 1}. ${area}`);
  });
  console.log();

  console.log('Fun Facts:');
  profile.funFacts.forEach((fact, i) => {
    console.log(`${i + 1}. ${fact}`);
  });
  console.log();

  if (profile.spiritAnimal) {
    console.log(`Spirit Animal: ${profile.spiritAnimalEmoji} ${profile.spiritAnimal}`);
    console.log(`Why: ${profile.spiritAnimalReason}`);
    console.log();
  }

  if (profile.compatibility) {
    console.log('Ideal Training Partners:');
    console.log(profile.compatibility);
  }
}

// ==================== EXAMPLE 6: BATCH GENERATION ====================

async function example6_BatchGeneration(stats: UserStatsForAI) {
  console.log('=== Example 6: Batch Generation ===\n');

  // Generate all types at once
  const all = await generateAll(stats);

  console.log('ROAST:');
  console.log(all.roast.content);
  console.log();

  console.log('HYPE:');
  console.log(all.hype.content);
  console.log();

  console.log('NARRATIVE:');
  console.log(all.narrative.content);
  console.log();

  console.log('PERSONALITY SUMMARY:');
  console.log(all.personality.profileSummary);
}

// ==================== EXAMPLE 7: QUICK PREVIEW (NO SAVE) ====================

async function example7_QuickPreview(stats: UserStatsForAI) {
  console.log('=== Example 7: Quick Preview (No Save) ===\n');

  // Generate quick roast without saving to database
  const roast1 = await quickRoast(stats, 'savage');
  const roast2 = await quickRoast(stats, 'gym-bro');
  const roast3 = await quickRoast(stats, 'poet');

  console.log('Preview Roasts (not saved):');
  console.log('1.', roast1);
  console.log('2.', roast2);
  console.log('3.', roast3);
  console.log();

  // Generate quick hype
  const hype1 = await quickHype(stats, 'hype-beast');
  const hype2 = await quickHype(stats, 'wise-mentor');

  console.log('Preview Hype (not saved):');
  console.log('1.', hype1);
  console.log('2.', hype2);
}

// ==================== EXAMPLE 8: CREDIT MANAGEMENT ====================

async function example8_CreditManagement(userId: string) {
  console.log('=== Example 8: Credit Management ===\n');

  // Check credits
  const creditCheck = await hasCreditsRemaining(userId, false);

  console.log('Credit Status:');
  console.log(`Has credits: ${creditCheck.hasCredits}`);
  console.log(`Remaining: ${creditCheck.remaining}`);
  console.log(`Limit: ${creditCheck.limit}`);
  console.log(`Used today: ${creditCheck.limit - creditCheck.remaining}`);
  console.log();

  // Get detailed stats
  const stats = await getGenerationStats(userId);

  console.log('Generation Statistics:');
  console.log(`Total all time: ${stats.total}`);
  console.log(`Today: ${stats.today}`);
  console.log(`This week: ${stats.thisWeek}`);
  console.log(`This month: ${stats.thisMonth}`);
  console.log();

  console.log('By Type:');
  Object.entries(stats.byType).forEach(([type, count]) => {
    console.log(`  ${type}: ${count}`);
  });
}

// ==================== EXAMPLE 9: ERROR HANDLING ====================

async function example9_ErrorHandling(stats: UserStatsForAI) {
  console.log('=== Example 9: Error Handling ===\n');

  try {
    // Check credits first
    const { hasCredits, remaining } = await hasCreditsRemaining(stats.identity.id);

    if (!hasCredits) {
      throw new Error('NO_CREDITS_REMAINING');
    }

    // Generate content
    const roast = await generateRoast(stats);
    console.log('Success:', roast.content);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'NO_CREDITS_REMAINING') {
        console.error('You have reached your daily generation limit. Please try again tomorrow.');
      } else if (error.message.includes('API key')) {
        console.error('AI service not configured. Please contact support.');
      } else if (error.message.includes('Failed to generate')) {
        console.error('AI generation failed. Please try again.');
      } else {
        console.error('An unexpected error occurred:', error.message);
      }
    }
  }
}

// ==================== EXAMPLE 10: API ENDPOINT USAGE ====================

async function example10_APIUsage() {
  console.log('=== Example 10: API Endpoint Usage ===\n');

  // This example shows how a frontend would call the API

  // 1. Get generation info
  const infoResponse = await fetch('/api/ai/generate', {
    method: 'GET',
  });

  const info = await infoResponse.json();
  console.log('Available credits:', info.credits.remaining);
  console.log('Available styles:', info.availableStyles);
  console.log();

  // 2. Generate a roast
  const generateResponse = await fetch('/api/ai/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'roast',
      style: 'savage',
      stats: {
        /* UserStatsForAI object */
      },
    }),
  });

  if (generateResponse.ok) {
    const result = await generateResponse.json();
    console.log('Generated content:', result.data.content);
    console.log('Credits remaining:', result.credits.remaining);
  } else if (generateResponse.status === 429) {
    const error = await generateResponse.json();
    console.error('Rate limited:', error.error);
  } else {
    const error = await generateResponse.json();
    console.error('Generation failed:', error.error);
  }
}

// ==================== USAGE IN REACT COMPONENT ====================

/*
// Example React component usage:

import { useState } from 'react';
import { useUser } from '@/hooks/useUser';
import { useUserStats } from '@/hooks/useUserStats';

function RoastGenerator() {
  const { user } = useUser();
  const { stats } = useUserStats(user?.id);
  const [roast, setRoast] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [credits, setCredits] = useState({ remaining: 3, limit: 3 });

  const generateRoast = async (style: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'roast',
          style,
          stats,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setRoast(data.data.content);
        setCredits(data.credits);
      } else {
        const error = await response.json();
        alert(error.error);
      }
    } catch (error) {
      console.error('Generation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Get Roasted</h2>
      <p>Credits: {credits.remaining}/{credits.limit}</p>

      <div>
        <button onClick={() => generateRoast('savage')} disabled={loading}>
          Savage Roast
        </button>
        <button onClick={() => generateRoast('gym-bro')} disabled={loading}>
          Gym Bro Roast
        </button>
        <button onClick={() => generateRoast('poet')} disabled={loading}>
          Poetic Roast
        </button>
      </div>

      {loading && <p>Generating...</p>}
      {roast && (
        <div>
          <h3>Your Roast:</h3>
          <p>{roast}</p>
        </div>
      )}
    </div>
  );
}
*/

// ==================== EXPORT EXAMPLES ====================

export {
  example1_BasicRoast,
  example2_StyledRoast,
  example3_HypeGeneration,
  example4_NarrativeGeneration,
  example5_PersonalityProfile,
  example6_BatchGeneration,
  example7_QuickPreview,
  example8_CreditManagement,
  example9_ErrorHandling,
  example10_APIUsage,
};
