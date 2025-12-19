import type { AchievementProgress } from '@/types';

/**
 * Utility functions for achievement system
 */

/**
 * Format achievement progress as a readable string
 */
export function formatProgress(progress: AchievementProgress): string {
  const { achievement, currentValue, targetValue, percentage } = progress;

  if (progress.isUnlocked) {
    return 'Unlocked!';
  }

  const { type, unit } = achievement.requirement;

  // Format the values based on unit
  let current: string;
  let target: string;

  switch (unit) {
    case 'meters':
      // Convert to km if > 1000m
      if (targetValue >= 1000) {
        current = `${(currentValue / 1000).toFixed(1)}km`;
        target = `${(targetValue / 1000).toFixed(1)}km`;
      } else {
        current = `${currentValue.toFixed(0)}m`;
        target = `${targetValue.toFixed(0)}m`;
      }
      break;

    case 'days':
      current = `${currentValue} days`;
      target = `${targetValue} days`;
      break;

    case 'count':
      current = `${currentValue}`;
      target = `${targetValue}`;
      break;

    default:
      current = `${currentValue}`;
      target = `${targetValue}`;
  }

  return `${current} / ${target} (${percentage}%)`;
}

/**
 * Get a motivational message based on progress
 */
export function getMotivationalMessage(progress: AchievementProgress): string {
  if (progress.isUnlocked) {
    return 'Achievement unlocked!';
  }

  const { percentage } = progress;

  if (percentage >= 90) {
    return "You're so close! Just a bit more!";
  } else if (percentage >= 75) {
    return 'Almost there! Keep pushing!';
  } else if (percentage >= 50) {
    return 'Halfway there! Keep it up!';
  } else if (percentage >= 25) {
    return 'Great progress! Keep going!';
  } else if (percentage > 0) {
    return "You've started! Every journey begins with a single step.";
  } else {
    return 'Time to get started on this one!';
  }
}

/**
 * Group achievements by category
 */
export function groupByCategory(
  achievements: AchievementProgress[]
): Record<string, AchievementProgress[]> {
  return achievements.reduce((acc, progress) => {
    const category = progress.achievement.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(progress);
    return acc;
  }, {} as Record<string, AchievementProgress[]>);
}

/**
 * Group achievements by tier
 */
export function groupByTier(
  achievements: AchievementProgress[]
): Record<string, AchievementProgress[]> {
  return achievements.reduce((acc, progress) => {
    const tier = progress.achievement.tier;
    if (!acc[tier]) {
      acc[tier] = [];
    }
    acc[tier].push(progress);
    return acc;
  }, {} as Record<string, AchievementProgress[]>);
}

/**
 * Get tier emoji
 */
export function getTierEmoji(tier: string): string {
  switch (tier) {
    case 'bronze':
      return '🥉';
    case 'silver':
      return '🥈';
    case 'gold':
      return '🥇';
    default:
      return '🏅';
  }
}

/**
 * Get category display name
 */
export function getCategoryDisplayName(category: string): string {
  switch (category) {
    case 'milestone':
      return 'Milestones';
    case 'quirky':
      return 'Quirky Achievements';
    case 'streak':
      return 'Streaks';
    case 'couchproof':
      return 'Couchproof';
    default:
      return category;
  }
}

/**
 * Sort achievements by completion (unlocked first, then by percentage)
 */
export function sortByCompletion(
  achievements: AchievementProgress[]
): AchievementProgress[] {
  return [...achievements].sort((a, b) => {
    // Unlocked first
    if (a.isUnlocked && !b.isUnlocked) return -1;
    if (!a.isUnlocked && b.isUnlocked) return 1;

    // Within unlocked, sort by unlock date (most recent first)
    if (a.isUnlocked && b.isUnlocked) {
      if (!a.unlockedAt || !b.unlockedAt) return 0;
      return b.unlockedAt.getTime() - a.unlockedAt.getTime();
    }

    // Within unfinished, sort by percentage (highest first)
    return b.percentage - a.percentage;
  });
}

/**
 * Calculate achievement score (for leaderboards, gamification)
 */
export function calculateAchievementScore(achievements: AchievementProgress[]): number {
  let score = 0;

  for (const progress of achievements) {
    if (!progress.isUnlocked) continue;

    // Points based on tier
    switch (progress.achievement.tier) {
      case 'bronze':
        score += 10;
        break;
      case 'silver':
        score += 25;
        break;
      case 'gold':
        score += 50;
        break;
    }

    // Bonus points for specific categories
    if (progress.achievement.category === 'couchproof') {
      score += 5; // Bonus for couch-destroying activities
    }
  }

  return score;
}

/**
 * Get achievement rarity (based on unlock percentage across all users)
 * This would need actual stats from database
 */
export function getAchievementRarity(unlockPercentage: number): {
  label: string;
  color: string;
} {
  if (unlockPercentage >= 80) {
    return { label: 'Common', color: '#9CA3AF' };
  } else if (unlockPercentage >= 50) {
    return { label: 'Uncommon', color: '#10B981' };
  } else if (unlockPercentage >= 20) {
    return { label: 'Rare', color: '#3B82F6' };
  } else if (unlockPercentage >= 5) {
    return { label: 'Epic', color: '#8B5CF6' };
  } else {
    return { label: 'Legendary', color: '#F59E0B' };
  }
}

/**
 * Format date for achievement unlock display
 */
export function formatUnlockDate(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months} month${months > 1 ? 's' : ''} ago`;
  } else {
    const years = Math.floor(diffDays / 365);
    return `${years} year${years > 1 ? 's' : ''} ago`;
  }
}

/**
 * Get share text for achievement unlock
 */
export function getShareText(progress: AchievementProgress): string {
  const { achievement } = progress;
  return `I just unlocked the "${achievement.name}" achievement on Couchproof! ${achievement.icon} ${achievement.description}`;
}
