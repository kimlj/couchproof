import type { AchievementDefinition } from '@/types';

/**
 * All achievement definitions for Couchproof
 * Categories: milestone, quirky, streak, couchproof
 * Tiers: bronze, silver, gold
 */

// ==================== MILESTONE ACHIEVEMENTS ====================

export const milestoneAchievements: AchievementDefinition[] = [
  {
    id: 'first_activity',
    code: 'FIRST_ACTIVITY',
    name: 'First Step',
    description: 'Complete your first activity',
    icon: '🎯',
    category: 'milestone',
    tier: 'bronze',
    requirement: {
      type: 'activity_count',
      value: 1,
      unit: 'count',
    },
    sortOrder: 1,
  },
  {
    id: 'century_ride',
    code: 'CENTURY_RIDE',
    name: 'Century Club',
    description: 'Complete a 100mi/160km ride in a single activity',
    icon: '💯',
    category: 'milestone',
    tier: 'gold',
    requirement: {
      type: 'single_activity_distance',
      value: 160934, // 100 miles in meters
      unit: 'meters',
      activityType: 'Ride',
    },
    sortOrder: 10,
  },
  {
    id: 'marathon',
    code: 'MARATHON',
    name: 'Marathoner',
    description: 'Run 26.2 miles in one activity',
    icon: '🏃',
    category: 'milestone',
    tier: 'gold',
    requirement: {
      type: 'single_activity_distance',
      value: 42195, // Marathon distance in meters
      unit: 'meters',
      activityType: 'Run',
    },
    sortOrder: 11,
  },
  {
    id: 'everest',
    code: 'EVEREST',
    name: 'Everesting',
    description: 'Climb 8849m total elevation gain',
    icon: '🏔️',
    category: 'milestone',
    tier: 'gold',
    requirement: {
      type: 'total_elevation',
      value: 8849,
      unit: 'meters',
    },
    sortOrder: 20,
  },
  {
    id: '1000km',
    code: 'THOUSAND_K',
    name: 'Thousand K Club',
    description: 'Log 1000km total distance across all activities',
    icon: '🌍',
    category: 'milestone',
    tier: 'silver',
    requirement: {
      type: 'total_distance',
      value: 1000000, // 1000km in meters
      unit: 'meters',
    },
    sortOrder: 30,
  },
  {
    id: '100_activities',
    code: 'TRIPLE_DIGITS',
    name: 'Triple Digits',
    description: 'Complete 100 activities',
    icon: '💪',
    category: 'milestone',
    tier: 'silver',
    requirement: {
      type: 'activity_count',
      value: 100,
      unit: 'count',
    },
    sortOrder: 40,
  },
];

// ==================== QUIRKY ACHIEVEMENTS ====================

export const quirkyAchievements: AchievementDefinition[] = [
  {
    id: 'pre_dawn',
    code: 'PRE_DAWN_WARRIOR',
    name: 'Pre-Dawn Warrior',
    description: 'Start an activity before 5am',
    icon: '🌅',
    category: 'quirky',
    tier: 'bronze',
    requirement: {
      type: 'time_based',
      value: 1,
      unit: 'count',
    },
    sortOrder: 100,
  },
  {
    id: 'night_owl',
    code: 'NIGHT_OWL',
    name: 'Night Owl',
    description: 'Complete activity after 11pm',
    icon: '🦉',
    category: 'quirky',
    tier: 'bronze',
    requirement: {
      type: 'time_based',
      value: 1,
      unit: 'count',
    },
    sortOrder: 101,
  },
  {
    id: 'holiday_hero',
    code: 'HOLIDAY_HERO',
    name: 'Holiday Hero',
    description: 'Exercise on a major holiday',
    icon: '🎉',
    category: 'quirky',
    tier: 'bronze',
    requirement: {
      type: 'special_day',
      value: 1,
      unit: 'count',
    },
    sortOrder: 102,
  },
  {
    id: 'double_day',
    code: 'DOUBLE_DIPPER',
    name: 'Double Dipper',
    description: 'Complete two activities in one day',
    icon: '🔄',
    category: 'quirky',
    tier: 'bronze',
    requirement: {
      type: 'activities_per_day',
      value: 2,
      unit: 'count',
    },
    sortOrder: 103,
  },
  {
    id: 'emoji_artist',
    code: 'EMOJI_ARTIST',
    name: 'Emoji Artist',
    description: 'Use emojis in activity names',
    icon: '😎',
    category: 'quirky',
    tier: 'bronze',
    requirement: {
      type: 'emoji_in_name',
      value: 5,
      unit: 'count',
    },
    sortOrder: 104,
  },
  {
    id: 'naming_convention',
    code: 'NAMING_WIZARD',
    name: 'Naming Wizard',
    description: 'Create 10 creative activity names',
    icon: '✨',
    category: 'quirky',
    tier: 'silver',
    requirement: {
      type: 'creative_names',
      value: 10,
      unit: 'count',
    },
    sortOrder: 105,
  },
];

// ==================== STREAK ACHIEVEMENTS ====================

export const streakAchievements: AchievementDefinition[] = [
  {
    id: 'week_streak',
    code: 'WEEK_WARRIOR',
    name: 'Week Warrior',
    description: 'Maintain a 7 day activity streak',
    icon: '📅',
    category: 'streak',
    tier: 'bronze',
    requirement: {
      type: 'streak_days',
      value: 7,
      unit: 'days',
    },
    sortOrder: 200,
  },
  {
    id: 'month_streak',
    code: 'MONTHLY_MANIAC',
    name: 'Monthly Maniac',
    description: 'Maintain a 30 day activity streak',
    icon: '🔥',
    category: 'streak',
    tier: 'silver',
    requirement: {
      type: 'streak_days',
      value: 30,
      unit: 'days',
    },
    sortOrder: 201,
  },
  {
    id: 'quarter_streak',
    code: 'QUARTERLY_QUEEN',
    name: 'Quarterly Queen',
    description: 'Maintain a 90 day activity streak',
    icon: '👑',
    category: 'streak',
    tier: 'gold',
    requirement: {
      type: 'streak_days',
      value: 90,
      unit: 'days',
    },
    sortOrder: 202,
  },
  {
    id: 'comeback_kid',
    code: 'COMEBACK_KID',
    name: 'Comeback Kid',
    description: 'Return to activity after a 30+ day break',
    icon: '🎊',
    category: 'streak',
    tier: 'bronze',
    requirement: {
      type: 'comeback',
      value: 30,
      unit: 'days',
    },
    sortOrder: 203,
  },
];

// ==================== COUCHPROOF ACHIEVEMENTS ====================

export const couchproofAchievements: AchievementDefinition[] = [
  {
    id: 'officially_not_a_couch_potato',
    code: 'NOT_A_COUCH_POTATO',
    name: 'Officially Not a Couch Potato',
    description: 'Complete any activity',
    icon: '🛋️',
    category: 'couchproof',
    tier: 'bronze',
    requirement: {
      type: 'activity_count',
      value: 1,
      unit: 'count',
    },
    sortOrder: 300,
  },
  {
    id: 'proof_of_movement',
    code: 'PROOF_OF_MOVEMENT',
    name: 'Proof of Movement',
    description: 'Complete 10 activities total',
    icon: '🚶',
    category: 'couchproof',
    tier: 'bronze',
    requirement: {
      type: 'activity_count',
      value: 10,
      unit: 'count',
    },
    sortOrder: 301,
  },
  {
    id: 'couch_destroyer',
    code: 'COUCH_DESTROYER',
    name: 'Couch Destroyer',
    description: 'Complete 50 activities total',
    icon: '🔨',
    category: 'couchproof',
    tier: 'silver',
    requirement: {
      type: 'activity_count',
      value: 50,
      unit: 'count',
    },
    sortOrder: 302,
  },
  {
    id: 'couch_annihilator',
    code: 'COUCH_ANNIHILATOR',
    name: 'Couch Annihilator',
    description: 'Complete 100 activities total',
    icon: '💥',
    category: 'couchproof',
    tier: 'gold',
    requirement: {
      type: 'activity_count',
      value: 100,
      unit: 'count',
    },
    sortOrder: 303,
  },
];

// ==================== MASTER ACHIEVEMENTS LIST ====================

export const allAchievements: AchievementDefinition[] = [
  ...milestoneAchievements,
  ...quirkyAchievements,
  ...streakAchievements,
  ...couchproofAchievements,
];

// Alias for backward compatibility
export const achievements = allAchievements;

// ==================== HELPER FUNCTIONS ====================

/**
 * Get achievement by ID
 */
export function getAchievementById(id: string): AchievementDefinition | undefined {
  return allAchievements.find((a) => a.id === id);
}

/**
 * Get achievement by code
 */
export function getAchievementByCode(code: string): AchievementDefinition | undefined {
  return allAchievements.find((a) => a.code === code);
}

/**
 * Get achievements by category
 */
export function getAchievementsByCategory(category: string): AchievementDefinition[] {
  return allAchievements.filter((a) => a.category === category);
}

/**
 * Get achievements by tier
 */
export function getAchievementsByTier(tier: string): AchievementDefinition[] {
  return allAchievements.filter((a) => a.tier === tier);
}
