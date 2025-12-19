import type { Activity } from '@/types';
import type { UserStats } from './types';

export function calculateUserStats(activities: Activity[]): UserStats {
  if (activities.length === 0) {
    return {
      totalActivities: 0,
      totalDistance: 0,
      totalDuration: 0,
      totalElevation: 0,
      averagePace: 0,
      averageDistance: 0,
      longestRun: 0,
      currentStreak: 0,
      longestStreak: 0,
      activeDays: 0,
    };
  }

  const totalActivities = activities.length;
  const totalDistance = activities.reduce((sum, a) => sum + a.distance, 0);
  const totalDuration = activities.reduce((sum, a) => sum + a.duration, 0);
  const totalElevation = activities.reduce((sum, a) => sum + (a.elevation || 0), 0);

  const averagePace = totalDistance > 0 ? totalDuration / totalDistance : 0;
  const averageDistance = totalDistance / totalActivities;
  const longestRun = Math.max(...activities.map(a => a.distance));

  const { currentStreak, longestStreak } = calculateStreaks(activities);
  const activeDays = calculateActiveDays(activities);

  return {
    totalActivities,
    totalDistance,
    totalDuration,
    totalElevation,
    averagePace,
    averageDistance,
    longestRun,
    currentStreak,
    longestStreak,
    activeDays,
  };
}

function calculateStreaks(activities: Activity[]): {
  currentStreak: number;
  longestStreak: number;
} {
  const sortedDates = activities
    .map(a => new Date(a.startDate).toDateString())
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  const uniqueDates = [...new Set(sortedDates)];

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 1;

  for (let i = 0; i < uniqueDates.length - 1; i++) {
    const current = new Date(uniqueDates[i]);
    const next = new Date(uniqueDates[i + 1]);
    const diffDays = Math.floor((current.getTime() - next.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      tempStreak++;
    } else {
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 1;
    }

    if (i === 0) {
      const today = new Date().toDateString();
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      if (uniqueDates[0] === today || uniqueDates[0] === yesterday) {
        currentStreak = tempStreak;
      }
    }
  }

  longestStreak = Math.max(longestStreak, tempStreak);

  return { currentStreak, longestStreak };
}

function calculateActiveDays(activities: Activity[]): number {
  const uniqueDates = new Set(
    activities.map(a => new Date(a.startDate).toDateString())
  );
  return uniqueDates.size;
}
