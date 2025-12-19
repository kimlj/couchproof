'use client';

import { AchievementCard } from './AchievementCard';
import type { AchievementProgress } from '@/types';

interface AchievementGridProps {
  achievementProgress: AchievementProgress[];
}

export function AchievementGrid({ achievementProgress }: AchievementGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {achievementProgress.map((progress) => (
        <AchievementCard
          key={progress.achievement.id}
          achievement={progress.achievement}
          unlocked={progress.isUnlocked}
          progress={progress.percentage}
        />
      ))}
    </div>
  );
}
