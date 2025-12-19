export interface UserStats {
  totalActivities: number;
  totalDistance: number;
  totalDuration: number;
  totalElevation: number;
  averagePace: number;
  averageDistance: number;
  longestRun: number;
  currentStreak: number;
  longestStreak: number;
  activeDays: number;
}

export interface PersonalityTraits {
  consistency: number;
  intensity: number;
  versatility: number;
  endurance: number;
  dedication: number;
}

export interface TimingPatterns {
  preferredDayOfWeek: string[];
  preferredTimeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  weekendWarrior: boolean;
  earlyBird: boolean;
  nightOwl: boolean;
}
