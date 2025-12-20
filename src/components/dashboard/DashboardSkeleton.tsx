'use client';

import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

// Subtle glass-themed skeleton
function GlassSkeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-lg bg-slate-800/30',
        className
      )}
    />
  );
}

// Glass card skeleton with subtle border
function GlassCardSkeleton({ className, children }: { className?: string; children?: React.ReactNode }) {
  return (
    <div
      className={cn(
        'rounded-xl p-4 bg-gradient-to-br from-slate-800/20 to-slate-900/40 border border-slate-700/20',
        className
      )}
    >
      {children}
    </div>
  );
}

// Weekly Stats Row Skeleton
function WeeklyStatsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <GlassCardSkeleton key={i} className="p-3">
          <div className="flex items-center gap-2">
            <GlassSkeleton className="w-8 h-8 rounded-lg" />
            <div className="flex-1 space-y-1.5">
              <GlassSkeleton className="h-3 w-16" />
              <GlassSkeleton className="h-5 w-20" />
            </div>
          </div>
        </GlassCardSkeleton>
      ))}
    </div>
  );
}

// Quick Stats / Fun Facts Skeleton
function QuickStatsSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <GlassCardSkeleton key={i} className="p-3">
          <div className="flex items-start gap-2">
            <GlassSkeleton className="w-7 h-7 rounded-lg flex-shrink-0" />
            <div className="flex-1 space-y-1.5">
              <GlassSkeleton className="h-3 w-20" />
              <GlassSkeleton className="h-5 w-12" />
              <GlassSkeleton className="h-2 w-24" />
            </div>
          </div>
        </GlassCardSkeleton>
      ))}
    </div>
  );
}

// Activity Feed Skeleton
function ActivityFeedSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <GlassCardSkeleton key={i} className="p-3">
          <div className="flex items-center gap-3">
            <GlassSkeleton className="w-9 h-9 rounded-lg flex-shrink-0" />
            <div className="flex-1 min-w-0 space-y-1.5">
              <GlassSkeleton className="h-4 w-32" />
              <GlassSkeleton className="h-3 w-48" />
            </div>
            <GlassSkeleton className="h-4 w-16" />
          </div>
        </GlassCardSkeleton>
      ))}
    </div>
  );
}

// Calendar Heatmap Skeleton
function CalendarSkeleton() {
  return (
    <GlassCardSkeleton className="p-4">
      <div className="flex items-center justify-between mb-4">
        <GlassSkeleton className="h-4 w-24" />
        <div className="flex gap-2">
          <GlassSkeleton className="w-6 h-6 rounded" />
          <GlassSkeleton className="w-6 h-6 rounded" />
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: 35 }).map((_, i) => (
          <GlassSkeleton key={i} className="aspect-square rounded-sm" />
        ))}
      </div>
    </GlassCardSkeleton>
  );
}

// Map Skeleton
function MapSkeleton() {
  return (
    <GlassCardSkeleton className="aspect-video relative overflow-hidden">
      <GlassSkeleton className="absolute inset-0" />
      <div className="absolute bottom-3 left-3 space-y-1">
        <GlassSkeleton className="h-3 w-20" />
        <GlassSkeleton className="h-4 w-32" />
      </div>
    </GlassCardSkeleton>
  );
}

// Week Comparison Skeleton
function WeekComparisonSkeleton() {
  return (
    <GlassCardSkeleton className="p-4">
      <GlassSkeleton className="h-4 w-28 mb-3" />
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <GlassSkeleton className="w-16 h-3" />
            <GlassSkeleton className="flex-1 h-2 rounded-full" />
            <GlassSkeleton className="w-12 h-3" />
          </div>
        ))}
      </div>
    </GlassCardSkeleton>
  );
}

// Athlete Stats Skeleton
function AthleteStatsSkeleton() {
  return (
    <GlassCardSkeleton className="p-4">
      <div className="flex items-center gap-4 mb-4">
        <GlassSkeleton className="w-16 h-16 rounded-full" />
        <div className="space-y-2">
          <GlassSkeleton className="h-5 w-32" />
          <GlassSkeleton className="h-3 w-24" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-1">
            <GlassSkeleton className="h-3 w-16" />
            <GlassSkeleton className="h-5 w-12" />
          </div>
        ))}
      </div>
    </GlassCardSkeleton>
  );
}

// Full Dashboard Skeleton
export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <GlassSkeleton className="h-7 w-32" />
          <GlassSkeleton className="h-4 w-48" />
        </div>
        <GlassSkeleton className="w-20 h-9 rounded-lg" />
      </div>

      {/* Weekly Stats */}
      <div>
        <GlassSkeleton className="h-3 w-20 mb-3" />
        <WeeklyStatsSkeleton />
      </div>

      {/* Main Grid: Calendar + Map + Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <CalendarSkeleton />
        <MapSkeleton />
        <WeekComparisonSkeleton />
      </div>

      {/* Fun Facts */}
      <div>
        <GlassSkeleton className="h-3 w-16 mb-3" />
        <QuickStatsSkeleton />
      </div>

      {/* Athlete Stats */}
      <AthleteStatsSkeleton />
    </div>
  );
}

export {
  GlassSkeleton,
  GlassCardSkeleton,
  WeeklyStatsSkeleton,
  QuickStatsSkeleton,
  ActivityFeedSkeleton,
  CalendarSkeleton,
  MapSkeleton,
  WeekComparisonSkeleton,
  AthleteStatsSkeleton,
};
