import type { Activity } from '@/types';
import type { TimingPatterns } from './types';

export function calculateTimingPatterns(activities: Activity[]): TimingPatterns {
  if (activities.length === 0) {
    return {
      preferredDayOfWeek: [],
      preferredTimeOfDay: 'morning',
      weekendWarrior: false,
      earlyBird: false,
      nightOwl: false,
    };
  }

  const preferredDayOfWeek = calculatePreferredDays(activities);
  const preferredTimeOfDay = calculatePreferredTime(activities);
  const weekendWarrior = isWeekendWarrior(activities);
  const earlyBird = isEarlyBird(activities);
  const nightOwl = isNightOwl(activities);

  return {
    preferredDayOfWeek,
    preferredTimeOfDay,
    weekendWarrior,
    earlyBird,
    nightOwl,
  };
}

function calculatePreferredDays(activities: Activity[]): string[] {
  const dayCounts: { [key: number]: number } = {};

  activities.forEach(activity => {
    const day = new Date(activity.startDate).getDay();
    dayCounts[day] = (dayCounts[day] || 0) + 1;
  });

  const maxCount = Math.max(...Object.values(dayCounts));
  const preferredDays = Object.entries(dayCounts)
    .filter(([_, count]) => count === maxCount)
    .map(([day]) => {
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      return dayNames[parseInt(day)];
    });

  return preferredDays;
}

function calculatePreferredTime(activities: Activity[]): 'morning' | 'afternoon' | 'evening' | 'night' {
  const timeCounts = {
    morning: 0,   // 5am - 11:59am
    afternoon: 0, // 12pm - 4:59pm
    evening: 0,   // 5pm - 8:59pm
    night: 0,     // 9pm - 4:59am
  };

  activities.forEach(activity => {
    const hour = new Date(activity.startDate).getHours();

    if (hour >= 5 && hour < 12) {
      timeCounts.morning++;
    } else if (hour >= 12 && hour < 17) {
      timeCounts.afternoon++;
    } else if (hour >= 17 && hour < 21) {
      timeCounts.evening++;
    } else {
      timeCounts.night++;
    }
  });

  const maxTime = Object.entries(timeCounts).reduce((max, [time, count]) =>
    count > max[1] ? [time, count] : max
  , ['morning', 0] as [string, number]);

  return maxTime[0] as 'morning' | 'afternoon' | 'evening' | 'night';
}

function isWeekendWarrior(activities: Activity[]): boolean {
  let weekendCount = 0;
  let weekdayCount = 0;

  activities.forEach(activity => {
    const day = new Date(activity.startDate).getDay();
    if (day === 0 || day === 6) {
      weekendCount++;
    } else {
      weekdayCount++;
    }
  });

  return weekendCount > weekdayCount;
}

function isEarlyBird(activities: Activity[]): boolean {
  const morningCount = activities.filter(activity => {
    const hour = new Date(activity.startDate).getHours();
    return hour >= 5 && hour < 9;
  }).length;

  return morningCount / activities.length > 0.5;
}

function isNightOwl(activities: Activity[]): boolean {
  const nightCount = activities.filter(activity => {
    const hour = new Date(activity.startDate).getHours();
    return hour >= 21 || hour < 5;
  }).length;

  return nightCount / activities.length > 0.3;
}
