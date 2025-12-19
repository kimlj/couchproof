import { prisma } from '@/lib/prisma';
import { allAchievements, getAchievementById } from './definitions';
import type { AchievementProgress, AchievementDefinition } from '@/types';

/**
 * Achievement progress tracking
 * Calculates progress toward all achievements
 */

interface UserStats {
  totalActivities: number;
  totalDistance: number; // meters
  totalElevation: number; // meters
  currentStreak: number; // days
  longestBreak: number; // days
  longestRide: number; // meters
  longestRun: number; // meters
  activitiesWithEmojis: number;
  creativeNameCount: number;
  preDawnCount: number;
  lateNightCount: number;
  holidayCount: number;
  doubleDayCount: number;
}

/**
 * Get progress for all achievements for a user
 */
export async function getAchievementProgress(userId: string): Promise<AchievementProgress[]> {
  // Get user's unlocked achievements
  const unlockedAchievements = await prisma.userAchievement.findMany({
    where: { userId },
    include: {
      achievement: true,
    },
  });

  const unlockedMap = new Map(
    unlockedAchievements.map((ua) => [
      ua.achievementId,
      {
        unlockedAt: ua.unlockedAt,
        activityId: ua.activityId,
      },
    ])
  );

  // Get user activities and calculate stats
  const activities = await prisma.activity.findMany({
    where: { userId },
    orderBy: { startDate: 'asc' },
    select: {
      id: true,
      type: true,
      distance: true,
      totalElevationGain: true,
      startDateLocal: true,
      name: true,
    },
  });

  const stats = calculateUserStats(activities);

  // Calculate progress for each achievement
  const progressList: AchievementProgress[] = allAchievements.map((achievement) => {
    const unlocked = unlockedMap.get(achievement.id);
    const currentValue = calculateCurrentValue(achievement, stats, activities);
    const targetValue = achievement.requirement.value;
    const percentage = Math.min(100, Math.round((currentValue / targetValue) * 100));

    return {
      achievement,
      currentValue,
      targetValue,
      percentage,
      isUnlocked: !!unlocked,
      unlockedAt: unlocked?.unlockedAt || null,
      activityId: unlocked?.activityId || null,
    };
  });

  // Sort by category and sortOrder
  progressList.sort((a, b) => {
    if (a.achievement.category !== b.achievement.category) {
      const categoryOrder = ['couchproof', 'milestone', 'streak', 'quirky'];
      return (
        categoryOrder.indexOf(a.achievement.category) -
        categoryOrder.indexOf(b.achievement.category)
      );
    }
    return a.achievement.sortOrder - b.achievement.sortOrder;
  });

  return progressList;
}

/**
 * Get the next milestone achievement closest to completion
 */
export async function getNextMilestone(userId: string): Promise<AchievementProgress | null> {
  const progress = await getAchievementProgress(userId);

  // Filter to unfinished milestones
  const unfinished = progress.filter(
    (p) =>
      !p.isUnlocked &&
      (p.achievement.category === 'milestone' || p.achievement.category === 'couchproof')
  );

  if (unfinished.length === 0) return null;

  // Sort by percentage complete (descending)
  unfinished.sort((a, b) => b.percentage - a.percentage);

  return unfinished[0];
}

/**
 * Get achievements that are close to being unlocked (>50% complete)
 */
export async function getCloseAchievements(
  userId: string,
  threshold: number = 50
): Promise<AchievementProgress[]> {
  const progress = await getAchievementProgress(userId);

  return progress.filter((p) => !p.isUnlocked && p.percentage >= threshold);
}

/**
 * Get recently unlocked achievements (last 30 days)
 */
export async function getRecentUnlocks(
  userId: string,
  days: number = 30
): Promise<AchievementProgress[]> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const progress = await getAchievementProgress(userId);

  return progress.filter(
    (p) => p.isUnlocked && p.unlockedAt && p.unlockedAt >= cutoffDate
  );
}

/**
 * Get achievement statistics for a user
 */
export async function getAchievementStats(userId: string) {
  const progress = await getAchievementProgress(userId);

  const totalAchievements = progress.length;
  const unlockedCount = progress.filter((p) => p.isUnlocked).length;
  const completionPercentage = Math.round((unlockedCount / totalAchievements) * 100);

  const byCategory = {
    milestone: {
      total: progress.filter((p) => p.achievement.category === 'milestone').length,
      unlocked: progress.filter(
        (p) => p.achievement.category === 'milestone' && p.isUnlocked
      ).length,
    },
    quirky: {
      total: progress.filter((p) => p.achievement.category === 'quirky').length,
      unlocked: progress.filter(
        (p) => p.achievement.category === 'quirky' && p.isUnlocked
      ).length,
    },
    streak: {
      total: progress.filter((p) => p.achievement.category === 'streak').length,
      unlocked: progress.filter(
        (p) => p.achievement.category === 'streak' && p.isUnlocked
      ).length,
    },
    couchproof: {
      total: progress.filter((p) => p.achievement.category === 'couchproof').length,
      unlocked: progress.filter(
        (p) => p.achievement.category === 'couchproof' && p.isUnlocked
      ).length,
    },
  };

  const byTier = {
    bronze: {
      total: progress.filter((p) => p.achievement.tier === 'bronze').length,
      unlocked: progress.filter((p) => p.achievement.tier === 'bronze' && p.isUnlocked).length,
    },
    silver: {
      total: progress.filter((p) => p.achievement.tier === 'silver').length,
      unlocked: progress.filter((p) => p.achievement.tier === 'silver' && p.isUnlocked).length,
    },
    gold: {
      total: progress.filter((p) => p.achievement.tier === 'gold').length,
      unlocked: progress.filter((p) => p.achievement.tier === 'gold' && p.isUnlocked).length,
    },
  };

  return {
    totalAchievements,
    unlockedCount,
    completionPercentage,
    byCategory,
    byTier,
  };
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Calculate all user statistics needed for achievement progress
 */
function calculateUserStats(
  activities: Array<{
    id: string;
    type: string;
    distance: number;
    totalElevationGain: number | null;
    startDateLocal: Date;
    name: string;
  }>
): UserStats {
  const totalActivities = activities.length;
  const totalDistance = activities.reduce((sum, a) => sum + a.distance, 0);
  const totalElevation = activities.reduce((sum, a) => sum + (a.totalElevationGain || 0), 0);
  const currentStreak = calculateCurrentStreak(activities.map((a) => a.startDateLocal));
  const longestBreak = calculateLongestBreak(activities.map((a) => a.startDateLocal));

  const longestRide = Math.max(
    0,
    ...activities.filter((a) => a.type === 'Ride').map((a) => a.distance)
  );
  const longestRun = Math.max(
    0,
    ...activities.filter((a) => a.type === 'Run').map((a) => a.distance)
  );

  const activitiesWithEmojis = activities.filter((a) => hasEmoji(a.name)).length;
  const creativeNameCount = activities.filter((a) => isCreativeName(a.name)).length;

  const preDawnCount = activities.filter((a) => {
    const hour = new Date(a.startDateLocal).getHours();
    return hour < 5;
  }).length;

  const lateNightCount = activities.filter((a) => {
    const hour = new Date(a.startDateLocal).getHours();
    return hour >= 23;
  }).length;

  const holidayCount = activities.filter((a) => isHoliday(new Date(a.startDateLocal))).length;

  // Calculate double day count
  const dayGroups = new Map<string, number>();
  activities.forEach((a) => {
    const date = new Date(a.startDateLocal);
    const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    dayGroups.set(key, (dayGroups.get(key) || 0) + 1);
  });
  const doubleDayCount = Array.from(dayGroups.values()).filter((count) => count >= 2).length;

  return {
    totalActivities,
    totalDistance,
    totalElevation,
    currentStreak,
    longestBreak,
    longestRide,
    longestRun,
    activitiesWithEmojis,
    creativeNameCount,
    preDawnCount,
    lateNightCount,
    holidayCount,
    doubleDayCount,
  };
}

/**
 * Calculate current value for an achievement based on its requirement type
 */
function calculateCurrentValue(
  achievement: AchievementDefinition,
  stats: UserStats,
  activities: Array<{ type: string; distance: number }>
): number {
  const { type, activityType } = achievement.requirement;

  switch (type) {
    case 'activity_count':
      return stats.totalActivities;

    case 'total_distance':
      return stats.totalDistance;

    case 'total_elevation':
      return stats.totalElevation;

    case 'streak_days':
      return stats.currentStreak;

    case 'comeback':
      return stats.longestBreak;

    case 'single_activity_distance':
      if (activityType === 'Ride') {
        return stats.longestRide;
      } else if (activityType === 'Run') {
        return stats.longestRun;
      }
      return Math.max(...activities.map((a) => a.distance));

    case 'time_based':
      // Pre-dawn or night owl
      if (achievement.id === 'pre_dawn') {
        return stats.preDawnCount;
      } else if (achievement.id === 'night_owl') {
        return stats.lateNightCount;
      }
      return 0;

    case 'special_day':
      // Holiday hero
      return stats.holidayCount;

    case 'activities_per_day':
      // Double day
      return stats.doubleDayCount;

    case 'emoji_in_name':
      return stats.activitiesWithEmojis;

    case 'creative_names':
      return stats.creativeNameCount;

    default:
      return 0;
  }
}

/**
 * Calculate current streak of consecutive days with activities
 */
function calculateCurrentStreak(activityDates: Date[]): number {
  if (activityDates.length === 0) return 0;

  const dates = activityDates.map((d) => {
    const date = new Date(d);
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  });

  const uniqueDates = Array.from(new Set(dates.map((d) => d.getTime())))
    .map((t) => new Date(t))
    .sort((a, b) => b.getTime() - a.getTime());

  if (uniqueDates.length === 0) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const mostRecent = uniqueDates[0];

  if (
    mostRecent.getTime() !== today.getTime() &&
    mostRecent.getTime() !== yesterday.getTime()
  ) {
    return 0;
  }

  let streak = 1;
  for (let i = 1; i < uniqueDates.length; i++) {
    const current = uniqueDates[i];
    const previous = uniqueDates[i - 1];
    const daysDiff = Math.floor(
      (previous.getTime() - current.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysDiff === 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Calculate longest break between activities
 */
function calculateLongestBreak(activityDates: Date[]): number {
  if (activityDates.length < 2) return 0;

  const sortedDates = activityDates
    .map((d) => new Date(d))
    .sort((a, b) => a.getTime() - b.getTime());

  let longestBreak = 0;

  for (let i = 1; i < sortedDates.length; i++) {
    const daysDiff = Math.floor(
      (sortedDates[i].getTime() - sortedDates[i - 1].getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysDiff > longestBreak) {
      longestBreak = daysDiff;
    }
  }

  return longestBreak;
}

/**
 * Check if a date is a major holiday
 */
function isHoliday(date: Date): boolean {
  const month = date.getMonth() + 1;
  const day = date.getDate();

  const holidays = [
    [1, 1], // New Year's Day
    [7, 4], // Independence Day
    [12, 25], // Christmas
    [11, 24], // Thanksgiving (approximate)
    [11, 25], // Day after Thanksgiving
  ];

  return holidays.some(([m, d]) => m === month && d === day);
}

/**
 * Check if a string contains emoji
 */
function hasEmoji(text: string): boolean {
  const emojiRegex =
    /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
  return emojiRegex.test(text);
}

/**
 * Check if activity name is creative (not default Strava naming)
 */
function isCreativeName(name: string): boolean {
  const defaultPatterns = [
    /^(Morning|Afternoon|Evening|Night|Lunch)\s+(Run|Ride|Swim|Walk|Hike)$/i,
    /^(Run|Ride|Swim|Walk|Hike)$/i,
  ];

  const isDefault = defaultPatterns.some((pattern) => pattern.test(name));
  return !isDefault && name.length > 5;
}
