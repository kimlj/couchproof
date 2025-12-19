'use client';

import { Card } from '@/components/ui/card';
import type { AchievementDefinition } from '@/types';

const TIER_COLORS = {
  bronze: 'from-amber-600 to-amber-700',
  silver: 'from-slate-400 to-slate-500',
  gold: 'from-yellow-400 to-yellow-500',
} as const;

const TIER_BG_COLORS = {
  bronze: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  silver: 'bg-slate-400/10 text-slate-300 border-slate-400/30',
  gold: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
} as const;

interface AchievementCardProps {
  achievement: AchievementDefinition;
  unlocked: boolean;
  progress?: number;
}

export function AchievementCard({ achievement, unlocked, progress }: AchievementCardProps) {
  return (
    <Card
      className={`p-6 bg-slate-800/30 backdrop-blur-sm border-slate-700/30 hover:border-slate-600/50 transition-all ${
        unlocked ? 'hover:bg-slate-800/40' : 'opacity-60'
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`text-4xl ${unlocked ? '' : 'grayscale opacity-50'}`}>
          {achievement.icon}
        </div>
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${TIER_BG_COLORS[achievement.tier]}`}>
          {achievement.tier}
        </span>
      </div>

      <h3 className={`text-lg font-semibold mb-2 ${unlocked ? 'text-white/90' : 'text-white/60'}`}>
        {achievement.name}
      </h3>
      <p className="text-sm text-slate-400/70 mb-4">{achievement.description}</p>

      {!unlocked && typeof progress === 'number' && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400/60">Progress</span>
            <span className="text-xs font-medium text-slate-300/80">{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-slate-700/30 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${TIER_COLORS[achievement.tier]} transition-all`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {unlocked && (
        <div className="flex items-center gap-2 text-sm font-medium text-emerald-400/80">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Unlocked
        </div>
      )}
    </Card>
  );
}
