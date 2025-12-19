'use client';

import { PageContainer } from '@/components/layout/PageContainer';
import { AchievementGrid } from '@/components/play/AchievementGrid';
import { useEffect, useState } from 'react';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import type { AchievementProgress } from '@/types';

export default function PlayPage() {
  const [achievementProgress, setAchievementProgress] = useState<AchievementProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        const response = await fetch('/api/achievements');
        if (!response.ok) throw new Error('Failed to fetch achievements');
        const data = await response.json();
        setAchievementProgress(data.achievements || []);
      } catch (error) {
        console.error('Error fetching achievements:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAchievements();
  }, []);

  const unlockedCount = achievementProgress.filter(a => a.isUnlocked).length;
  const totalCount = achievementProgress.length;

  if (loading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner size="lg" />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Achievements"
      description="Track your milestones and unlock badges"
    >
      <div className="mb-6">
        <div className="inline-flex items-center gap-3 px-4 py-2 bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/30">
          <span className="text-3xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 text-transparent bg-clip-text">{unlockedCount}</span>
          <span className="text-slate-400">/</span>
          <span className="text-xl font-semibold text-slate-300">{totalCount}</span>
          <span className="text-sm text-slate-500">achievements</span>
        </div>
      </div>
      <AchievementGrid achievementProgress={achievementProgress} />
    </PageContainer>
  );
}
