import { prisma } from '@/lib/prisma';
import { allAchievements, getAchievementById } from './definitions';
import type { AchievementDefinition } from '@/types';

/**
 * Achievement checking system
 * Checks all achievements for a user and returns newly unlocked ones
 */

interface UserStats {
  totalActivities: number;
  totalDistance: number; // meters
  totalElevation: number; // meters
  currentStreak: number; // days
  longestBreak: number; // days
}

interface UnlockedAchievement {
  achievement: AchievementDefinition;
  activityId?: string;
}

// ==================== MAIN CHECK FUNCTION ====================

/**
 * Check all achievements for a user after an activity
 * @param userId - User ID to check achievements for
 * @param activityId - Optional activity ID that triggered the check
 * @returns Array of newly unlocked achievements
 */
export async function checkAchievements(
  userId: string,
  activityId?: string
): Promise<UnlockedAchievement[]> {
  // Get user's existing achievements
  const existingAchievements = await prisma.userAchievement.findMany({
    where: { userId },
    select: { achievementId: true },
  });

  const existingIds = new Set(existingAchievements.map((a) => a.achievementId));

  // Get all user activities
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
      movingTime: true,
    },
  });

  // Calculate user stats
  const stats: UserStats = {
    totalActivities: activities.length,
    totalDistance: activities.reduce((sum, a) => sum + a.distance, 0),
    totalElevation: activities.reduce((sum, a) => sum + (a.totalElevationGain || 0), 0),
    currentStreak: calculateCurrentStreak(activities.map((a) => a.startDateLocal)),
    longestBreak: calculateLongestBreak(activities.map((a) => a.startDateLocal)),
  };

  // Find the specific activity if provided
  const triggeringActivity = activityId
    ? activities.find((a) => a.id === activityId)
    : undefined;

  // Check all achievement types
  const newlyUnlocked: UnlockedAchievement[] = [];

  // Check milestones
  const milestoneUnlocks = await checkMilestones(stats, activities, existingIds);
  newlyUnlocked.push(...milestoneUnlocks);

  // Check quirks (requires the triggering activity)
  if (triggeringActivity) {
    const quirkUnlocks = await checkQuirks(triggeringActivity, activities, existingIds);
    newlyUnlocked.push(...quirkUnlocks);
  } else {
    // Check quirks against all activities
    for (const activity of activities) {
      const quirkUnlocks = await checkQuirks(activity, activities, existingIds);
      newlyUnlocked.push(...quirkUnlocks);
    }
  }

  // Check streaks
  const streakUnlocks = await checkStreaks(stats, activities, existingIds);
  newlyUnlocked.push(...streakUnlocks);

  // Check couchproof
  const couchproofUnlocks = await checkCouchproof(stats, existingIds);
  newlyUnlocked.push(...couchproofUnlocks);

  // Remove duplicates (based on achievement ID)
  const uniqueUnlocks = Array.from(
    new Map(newlyUnlocked.map((item) => [item.achievement.id, item])).values()
  );

  return uniqueUnlocks;
}

// ==================== MILESTONE CHECKING ====================

export async function checkMilestones(
  stats: UserStats,
  activities: Array<{ type: string; distance: number; id: string }>,
  existingIds: Set<string>
): Promise<UnlockedAchievement[]> {
  const unlocked: UnlockedAchievement[] = [];

  // First Activity
  const firstActivity = getAchievementById('first_activity');
  if (firstActivity && !existingIds.has(firstActivity.id) && stats.totalActivities >= 1) {
    unlocked.push({ achievement: firstActivity, activityId: activities[0]?.id });
  }

  // Century Ride (100 miles in one ride)
  const centuryRide = getAchievementById('century_ride');
  if (centuryRide && !existingIds.has(centuryRide.id)) {
    const longRide = activities
      .filter((a) => a.type === 'Ride')
      .find((a) => a.distance >= 160934);
    if (longRide) {
      unlocked.push({ achievement: centuryRide, activityId: longRide.id });
    }
  }

  // Marathon (26.2 miles in one run)
  const marathon = getAchievementById('marathon');
  if (marathon && !existingIds.has(marathon.id)) {
    const longRun = activities
      .filter((a) => a.type === 'Run')
      .find((a) => a.distance >= 42195);
    if (longRun) {
      unlocked.push({ achievement: marathon, activityId: longRun.id });
    }
  }

  // Everest (8849m total elevation)
  const everest = getAchievementById('everest');
  if (everest && !existingIds.has(everest.id) && stats.totalElevation >= 8849) {
    unlocked.push({ achievement: everest });
  }

  // 1000km total distance
  const thousandK = getAchievementById('1000km');
  if (thousandK && !existingIds.has(thousandK.id) && stats.totalDistance >= 1000000) {
    unlocked.push({ achievement: thousandK });
  }

  // 100 activities
  const tripleDigits = getAchievementById('100_activities');
  if (tripleDigits && !existingIds.has(tripleDigits.id) && stats.totalActivities >= 100) {
    unlocked.push({ achievement: tripleDigits });
  }

  return unlocked;
}

// ==================== QUIRKY CHECKING ====================

export async function checkQuirks(
  activity: { startDateLocal: Date; name: string; id: string },
  allActivities: Array<{ startDateLocal: Date; name: string; id: string }>,
  existingIds: Set<string>
): Promise<UnlockedAchievement[]> {
  const unlocked: UnlockedAchievement[] = [];

  const activityDate = new Date(activity.startDateLocal);
  const hour = activityDate.getHours();

  // Pre-Dawn Warrior (before 5am)
  const preDawn = getAchievementById('pre_dawn');
  if (preDawn && !existingIds.has(preDawn.id) && hour < 5) {
    unlocked.push({ achievement: preDawn, activityId: activity.id });
  }

  // Night Owl (after 11pm)
  const nightOwl = getAchievementById('night_owl');
  if (nightOwl && !existingIds.has(nightOwl.id) && hour >= 23) {
    unlocked.push({ achievement: nightOwl, activityId: activity.id });
  }

  // Holiday Hero
  const holidayHero = getAchievementById('holiday_hero');
  if (holidayHero && !existingIds.has(holidayHero.id) && isHoliday(activityDate)) {
    unlocked.push({ achievement: holidayHero, activityId: activity.id });
  }

  // Double Day (two activities in one day)
  const doubleDay = getAchievementById('double_day');
  if (doubleDay && !existingIds.has(doubleDay.id)) {
    const activitiesOnSameDay = allActivities.filter((a) => {
      const aDate = new Date(a.startDateLocal);
      return (
        aDate.getFullYear() === activityDate.getFullYear() &&
        aDate.getMonth() === activityDate.getMonth() &&
        aDate.getDate() === activityDate.getDate()
      );
    });
    if (activitiesOnSameDay.length >= 2) {
      unlocked.push({ achievement: doubleDay, activityId: activity.id });
    }
  }

  // Emoji Artist
  const emojiArtist = getAchievementById('emoji_artist');
  if (emojiArtist && !existingIds.has(emojiArtist.id)) {
    const activitiesWithEmojis = allActivities.filter((a) => hasEmoji(a.name));
    if (activitiesWithEmojis.length >= 5) {
      unlocked.push({ achievement: emojiArtist, activityId: activity.id });
    }
  }

  // Naming Wizard
  const namingWizard = getAchievementById('naming_convention');
  if (namingWizard && !existingIds.has(namingWizard.id)) {
    const creativeNames = allActivities.filter((a) => isCreativeName(a.name));
    if (creativeNames.length >= 10) {
      unlocked.push({ achievement: namingWizard, activityId: activity.id });
    }
  }

  return unlocked;
}

// ==================== STREAK CHECKING ====================

export async function checkStreaks(
  stats: UserStats,
  activities: Array<{ startDateLocal: Date; id: string }>,
  existingIds: Set<string>
): Promise<UnlockedAchievement[]> {
  const unlocked: UnlockedAchievement[] = [];

  // Week Streak (7 days)
  const weekStreak = getAchievementById('week_streak');
  if (weekStreak && !existingIds.has(weekStreak.id) && stats.currentStreak >= 7) {
    unlocked.push({ achievement: weekStreak });
  }

  // Month Streak (30 days)
  const monthStreak = getAchievementById('month_streak');
  if (monthStreak && !existingIds.has(monthStreak.id) && stats.currentStreak >= 30) {
    unlocked.push({ achievement: monthStreak });
  }

  // Quarter Streak (90 days)
  const quarterStreak = getAchievementById('quarter_streak');
  if (quarterStreak && !existingIds.has(quarterStreak.id) && stats.currentStreak >= 90) {
    unlocked.push({ achievement: quarterStreak });
  }

  // Comeback Kid (return after 30+ day break)
  const comebackKid = getAchievementById('comeback_kid');
  if (comebackKid && !existingIds.has(comebackKid.id) && stats.longestBreak >= 30) {
    unlocked.push({ achievement: comebackKid });
  }

  return unlocked;
}

// ==================== COUCHPROOF CHECKING ====================

export async function checkCouchproof(
  stats: UserStats,
  existingIds: Set<string>
): Promise<UnlockedAchievement[]> {
  const unlocked: UnlockedAchievement[] = [];

  // Not a Couch Potato (1 activity)
  const notCouchPotato = getAchievementById('officially_not_a_couch_potato');
  if (notCouchPotato && !existingIds.has(notCouchPotato.id) && stats.totalActivities >= 1) {
    unlocked.push({ achievement: notCouchPotato });
  }

  // Proof of Movement (10 activities)
  const proofOfMovement = getAchievementById('proof_of_movement');
  if (proofOfMovement && !existingIds.has(proofOfMovement.id) && stats.totalActivities >= 10) {
    unlocked.push({ achievement: proofOfMovement });
  }

  // Couch Destroyer (50 activities)
  const couchDestroyer = getAchievementById('couch_destroyer');
  if (couchDestroyer && !existingIds.has(couchDestroyer.id) && stats.totalActivities >= 50) {
    unlocked.push({ achievement: couchDestroyer });
  }

  // Couch Annihilator (100 activities)
  const couchAnnihilator = getAchievementById('couch_annihilator');
  if (
    couchAnnihilator &&
    !existingIds.has(couchAnnihilator.id) &&
    stats.totalActivities >= 100
  ) {
    unlocked.push({ achievement: couchAnnihilator });
  }

  return unlocked;
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Calculate current streak of consecutive days with activities
 */
function calculateCurrentStreak(activityDates: Date[]): number {
  if (activityDates.length === 0) return 0;

  // Convert to dates only (no time)
  const dates = activityDates.map((d) => {
    const date = new Date(d);
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  });

  // Get unique dates and sort
  const uniqueDates = Array.from(new Set(dates.map((d) => d.getTime())))
    .map((t) => new Date(t))
    .sort((a, b) => b.getTime() - a.getTime());

  if (uniqueDates.length === 0) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const mostRecent = uniqueDates[0];

  // Check if most recent activity was today or yesterday
  if (
    mostRecent.getTime() !== today.getTime() &&
    mostRecent.getTime() !== yesterday.getTime()
  ) {
    return 0; // Streak is broken
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
  const month = date.getMonth() + 1; // 1-12
  const day = date.getDate();

  // Major US holidays
  const holidays = [
    [1, 1], // New Year's Day
    [7, 4], // Independence Day
    [12, 25], // Christmas
    [11, 24], // Thanksgiving (approximate - 4th Thursday of November)
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
  // Default Strava patterns: "Morning Run", "Afternoon Ride", etc.
  const defaultPatterns = [
    /^(Morning|Afternoon|Evening|Night|Lunch)\s+(Run|Ride|Swim|Walk|Hike)$/i,
    /^(Run|Ride|Swim|Walk|Hike)$/i,
  ];

  const isDefault = defaultPatterns.some((pattern) => pattern.test(name));
  return !isDefault && name.length > 5; // Not default and has some length
}

/**
 * Save newly unlocked achievements to the database
 */
export async function saveUnlockedAchievements(
  userId: string,
  achievements: UnlockedAchievement[]
): Promise<void> {
  if (achievements.length === 0) return;

  // First, ensure all achievements exist in the Achievement table
  for (const { achievement } of achievements) {
    await prisma.achievement.upsert({
      where: { code: achievement.code },
      update: {},
      create: {
        id: achievement.id,
        code: achievement.code,
        name: achievement.name,
        description: achievement.description,
        icon: achievement.icon,
        category: achievement.category,
        tier: achievement.tier,
        requirement: achievement.requirement as any,
        sortOrder: achievement.sortOrder,
      },
    });
  }

  // Then create UserAchievement records
  await prisma.userAchievement.createMany({
    data: achievements.map(({ achievement, activityId }) => ({
      userId,
      achievementId: achievement.id,
      activityId: activityId || null,
    })),
    skipDuplicates: true,
  });
}
