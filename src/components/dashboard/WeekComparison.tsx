'use client';

import { GlassCard, GlassIcon } from '@/components/ui/glass-card';
import { ArrowUp, ArrowDown, Minus, BarChart3 } from 'lucide-react';

interface WeekComparisonProps {
  thisWeek: {
    distance: number;
    activities: number;
    time: number;
    elevation: number;
  };
  lastWeek: {
    distance: number;
    activities: number;
    time: number;
    elevation: number;
  };
}

function formatDistance(meters: number): string {
  return `${(meters / 1000).toFixed(1)}`;
}

function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function formatElevation(meters: number): string {
  return `${Math.round(meters)}`;
}

function getChange(current: number, previous: number): { value: number; direction: 'up' | 'down' | 'same' } {
  if (previous === 0) {
    return { value: current > 0 ? 100 : 0, direction: current > 0 ? 'up' : 'same' };
  }
  const change = Math.round(((current - previous) / previous) * 100);
  return {
    value: Math.abs(change),
    direction: change > 2 ? 'up' : change < -2 ? 'down' : 'same',
  };
}

function ChangeIndicator({ direction, value }: { direction: 'up' | 'down' | 'same'; value: number }) {
  if (direction === 'same') {
    return (
      <div className="flex items-center gap-0.5 text-slate-500">
        <Minus className="w-3 h-3" />
        <span className="text-[10px]">same</span>
      </div>
    );
  }

  const Icon = direction === 'up' ? ArrowUp : ArrowDown;
  const colorClass = direction === 'up' ? 'text-emerald-400' : 'text-red-400';

  return (
    <div className={`flex items-center gap-0.5 ${colorClass}`}>
      <Icon className="w-3 h-3" />
      <span className="text-[10px] font-medium">{value}%</span>
    </div>
  );
}

function ProgressBar({ current, previous, max }: { current: number; previous: number; max: number }) {
  const currentPercent = max > 0 ? Math.min((current / max) * 100, 100) : 0;
  const previousPercent = max > 0 ? Math.min((previous / max) * 100, 100) : 0;

  return (
    <div className="relative h-2 bg-slate-800/50 rounded-full overflow-hidden">
      {/* Previous week (faded) */}
      <div
        className="absolute inset-y-0 left-0 bg-slate-600/30 rounded-full"
        style={{ width: `${previousPercent}%` }}
      />
      {/* This week */}
      <div
        className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full transition-all duration-500"
        style={{ width: `${currentPercent}%` }}
      />
    </div>
  );
}

export function WeekComparison({ thisWeek, lastWeek }: WeekComparisonProps) {
  const distanceChange = getChange(thisWeek.distance, lastWeek.distance);
  const activitiesChange = getChange(thisWeek.activities, lastWeek.activities);
  const timeChange = getChange(thisWeek.time, lastWeek.time);
  const elevationChange = getChange(thisWeek.elevation, lastWeek.elevation);

  // Calculate max values for progress bars
  const maxDistance = Math.max(thisWeek.distance, lastWeek.distance, 1);
  const maxTime = Math.max(thisWeek.time, lastWeek.time, 1);
  const maxElevation = Math.max(thisWeek.elevation, lastWeek.elevation, 1);

  const metrics = [
    {
      label: 'Distance',
      thisWeek: formatDistance(thisWeek.distance),
      lastWeek: formatDistance(lastWeek.distance),
      unit: 'km',
      change: distanceChange,
      current: thisWeek.distance,
      previous: lastWeek.distance,
      max: maxDistance,
    },
    {
      label: 'Active Time',
      thisWeek: formatTime(thisWeek.time),
      lastWeek: formatTime(lastWeek.time),
      unit: '',
      change: timeChange,
      current: thisWeek.time,
      previous: lastWeek.time,
      max: maxTime,
    },
    {
      label: 'Elevation',
      thisWeek: formatElevation(thisWeek.elevation),
      lastWeek: formatElevation(lastWeek.elevation),
      unit: 'm',
      change: elevationChange,
      current: thisWeek.elevation,
      previous: lastWeek.elevation,
      max: maxElevation,
    },
  ];

  return (
    <GlassCard theme="cyan" className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <GlassIcon theme="cyan" className="p-1.5">
            <BarChart3 className="w-3.5 h-3.5" />
          </GlassIcon>
          <h3 className="text-sm font-semibold text-white">This Week vs Last</h3>
        </div>
        <div className="flex items-center gap-3 text-[10px]">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500" />
            This week
          </span>
          <span className="flex items-center gap-1 text-slate-500">
            <span className="w-2 h-2 rounded-full bg-slate-600/50" />
            Last week
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">{metric.label}</span>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-white">
                  {metric.thisWeek}
                  {metric.unit && <span className="text-xs text-slate-500 ml-0.5">{metric.unit}</span>}
                </span>
                <ChangeIndicator direction={metric.change.direction} value={metric.change.value} />
              </div>
            </div>
            <ProgressBar current={metric.current} previous={metric.previous} max={metric.max} />
            <div className="flex justify-between text-[10px] text-slate-600">
              <span>Last: {metric.lastWeek}{metric.unit}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-4 pt-3 border-t border-slate-700/30">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-500">Activities</span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-white">{thisWeek.activities}</span>
            <span className="text-xs text-slate-500">vs {lastWeek.activities}</span>
            <ChangeIndicator direction={activitiesChange.direction} value={activitiesChange.value} />
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
