'use client';

import useSWR from 'swr';
import { useEffect } from 'react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

// Cache keys
const ACTIVITIES_KEY = '/api/activities?limit=1000';
const STATS_KEY = '/api/stats';
const USER_KEY = '/api/me';

// localStorage keys
const LS_ACTIVITIES = 'dashboard_activities';
const LS_STATS = 'dashboard_stats';
const LS_USER = 'dashboard_user';
const LS_TIMESTAMP = 'dashboard_cache_time';

// Cache duration: 5 minutes
const CACHE_DURATION = 5 * 60 * 1000;

// Get cached data from localStorage
function getCachedData(key: string) {
  if (typeof window === 'undefined') return undefined;
  try {
    const timestamp = localStorage.getItem(LS_TIMESTAMP);
    if (timestamp && Date.now() - parseInt(timestamp) > CACHE_DURATION) {
      // Cache expired
      return undefined;
    }
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : undefined;
  } catch {
    return undefined;
  }
}

// Save data to localStorage
function setCachedData(key: string, data: unknown) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
    localStorage.setItem(LS_TIMESTAMP, Date.now().toString());
  } catch {
    // localStorage full or unavailable
  }
}

// SWR options for dashboard data
const swrOptions = {
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  dedupingInterval: 60000,
  keepPreviousData: true,
};

export function useDashboardData() {
  const {
    data: activitiesData,
    error: activitiesError,
    isLoading: activitiesLoading,
    mutate: mutateActivities,
  } = useSWR(ACTIVITIES_KEY, fetcher, {
    ...swrOptions,
    fallbackData: getCachedData(LS_ACTIVITIES),
  });

  const {
    data: statsData,
    error: statsError,
    isLoading: statsLoading,
  } = useSWR(STATS_KEY, fetcher, {
    ...swrOptions,
    fallbackData: getCachedData(LS_STATS),
  });

  const {
    data: userData,
    error: userError,
    isLoading: userLoading,
  } = useSWR(USER_KEY, fetcher, {
    ...swrOptions,
    fallbackData: getCachedData(LS_USER),
  });

  // Persist data to localStorage when it changes
  useEffect(() => {
    if (activitiesData) setCachedData(LS_ACTIVITIES, activitiesData);
  }, [activitiesData]);

  useEffect(() => {
    if (statsData) setCachedData(LS_STATS, statsData);
  }, [statsData]);

  useEffect(() => {
    if (userData) setCachedData(LS_USER, userData);
  }, [userData]);

  // Check if we have cached data (for instant load)
  const hasCachedData = !!(
    getCachedData(LS_ACTIVITIES) &&
    getCachedData(LS_STATS) &&
    getCachedData(LS_USER)
  );

  // Only show loading if no cached data
  const isLoading = hasCachedData
    ? false
    : activitiesLoading || statsLoading || userLoading;

  const hasError = activitiesError || statsError || userError;

  // Refetch all data (e.g., after sync)
  const refetch = async () => {
    await Promise.all([mutateActivities()]);
  };

  return {
    activities: activitiesData?.activities || [],
    stats: statsData,
    user: userData?.user,
    isLoading,
    hasError,
    refetch,
  };
}
