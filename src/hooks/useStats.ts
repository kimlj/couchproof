'use client';

import { useEffect, useState } from 'react';
import type { UserStats, PersonalityTraits, TimingPatterns } from '@/lib/stats/types';

interface StatsData {
  stats: UserStats;
  traits: PersonalityTraits;
  timing: TimingPatterns;
}

export function useStats() {
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/stats');
        if (!response.ok) throw new Error('Failed to fetch stats');
        const statsData = await response.json();
        setData(statsData);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const refetch = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/stats');
      if (!response.ok) throw new Error('Failed to fetch stats');
      const statsData = await response.json();
      setData(statsData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return { ...data, loading, error, refetch };
}
