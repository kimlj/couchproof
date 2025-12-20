'use client';

import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

// Cache keys
const ACTIVITIES_KEY = '/api/activities?limit=1000';
const STATS_KEY = '/api/stats';
const USER_KEY = '/api/me';

// SWR options for dashboard data
const swrOptions = {
  revalidateOnFocus: false, // Don't refetch when window regains focus
  revalidateOnReconnect: false, // Don't refetch on reconnect
  dedupingInterval: 60000, // Dedupe requests within 1 minute
  keepPreviousData: true, // Keep showing old data while fetching new
};

export function useDashboardData() {
  const {
    data: activitiesData,
    error: activitiesError,
    isLoading: activitiesLoading,
    mutate: mutateActivities,
  } = useSWR(ACTIVITIES_KEY, fetcher, swrOptions);

  const {
    data: statsData,
    error: statsError,
    isLoading: statsLoading,
  } = useSWR(STATS_KEY, fetcher, swrOptions);

  const {
    data: userData,
    error: userError,
    isLoading: userLoading,
  } = useSWR(USER_KEY, fetcher, swrOptions);

  const isLoading = activitiesLoading || statsLoading || userLoading;
  const hasError = activitiesError || statsError || userError;

  // Refetch all data (e.g., after sync)
  const refetch = async () => {
    await Promise.all([
      mutateActivities(),
    ]);
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
