import type { Activity } from '@/types';
import type { PersonalityTraits } from './types';

export function calculatePersonalityTraits(activities: Activity[]): PersonalityTraits {
  if (activities.length === 0) {
    return {
      consistency: 0,
      intensity: 0,
      versatility: 0,
      endurance: 0,
      dedication: 0,
    };
  }

  const consistency = calculateConsistency(activities);
  const intensity = calculateIntensity(activities);
  const versatility = calculateVersatility(activities);
  const endurance = calculateEndurance(activities);
  const dedication = calculateDedication(activities);

  return {
    consistency,
    intensity,
    versatility,
    endurance,
    dedication,
  };
}

function calculateConsistency(activities: Activity[]): number {
  const sortedDates = activities
    .map(a => new Date(a.startDate))
    .sort((a, b) => a.getTime() - b.getTime());

  if (sortedDates.length < 2) return 50;

  const gaps: number[] = [];
  for (let i = 1; i < sortedDates.length; i++) {
    const diffDays = Math.floor(
      (sortedDates[i].getTime() - sortedDates[i - 1].getTime()) / (1000 * 60 * 60 * 24)
    );
    gaps.push(diffDays);
  }

  const avgGap = gaps.reduce((sum, gap) => sum + gap, 0) / gaps.length;
  const score = Math.max(0, Math.min(100, 100 - avgGap * 5));

  return Math.round(score);
}

function calculateIntensity(activities: Activity[]): number {
  const paces = activities
    .filter(a => a.distance > 0 && (a.duration > 0 || (a as any).movingTime > 0))
    .map(a => (a.duration || (a as any).movingTime) / a.distance);

  if (paces.length === 0) return 50;

  const avgPace = paces.reduce((sum, pace) => sum + pace, 0) / paces.length;
  const score = Math.max(0, Math.min(100, (1 - avgPace / 600) * 100));

  return Math.round(score);
}

function calculateVersatility(activities: Activity[]): number {
  const activityTypes = new Set(activities.map(a => a.type));
  const typeCount = activityTypes.size;

  const score = Math.min(100, typeCount * 25);
  return Math.round(score);
}

function calculateEndurance(activities: Activity[]): number {
  if (activities.length === 0) return 0;

  const longestDistance = Math.max(...activities.map(a => a.distance));
  const score = Math.min(100, (longestDistance / 42195) * 100);

  return Math.round(score);
}

function calculateDedication(activities: Activity[]): number {
  const totalActivities = activities.length;
  const score = Math.min(100, (totalActivities / 100) * 100);

  return Math.round(score);
}
