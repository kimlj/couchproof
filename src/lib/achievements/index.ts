/**
 * Achievement System Exports
 * Central export point for all achievement-related functionality
 */

// Definitions
export {
  allAchievements,
  milestoneAchievements,
  quirkyAchievements,
  streakAchievements,
  couchproofAchievements,
  getAchievementById,
  getAchievementByCode,
  getAchievementsByCategory,
  getAchievementsByTier,
} from './definitions';

// Checking
export {
  checkAchievements,
  checkMilestones,
  checkQuirks,
  checkStreaks,
  checkCouchproof,
  saveUnlockedAchievements,
} from './check';

// Progress
export {
  getAchievementProgress,
  getNextMilestone,
  getCloseAchievements,
  getRecentUnlocks,
  getAchievementStats,
} from './progress';
