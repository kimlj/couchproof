'use client';

import { GlassCard, GlassIcon } from '@/components/ui/glass-card';
import { Heart, Zap, Weight, TrendingUp, Activity, Timer, Mountain, Award, User } from 'lucide-react';
import { motion } from 'framer-motion';

interface AthleteStatsProps {
  // User profile
  name?: string;
  avatarUrl?: string;
  sex?: string;
  city?: string;
  country?: string;

  // Physical metrics
  weight?: number; // kg
  ftp?: number; // watts

  // Heart rate
  avgHeartRate?: number;
  maxHeartRate?: number;

  // Performance metrics
  avgPace?: number; // m/s
  avgPower?: number; // watts
  totalElevation?: number; // meters

  // Records
  longestDistance?: number; // meters
  biggestClimb?: number; // meters

  // Strava stats
  followerCount?: number;
  friendCount?: number;
  isPremium?: boolean;
}

function formatPace(speedMs: number): string {
  // Convert m/s to min/km
  if (speedMs <= 0) return '--:--';
  const paceSecsPerKm = 1000 / speedMs;
  const mins = Math.floor(paceSecsPerKm / 60);
  const secs = Math.floor(paceSecsPerKm % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function formatDistance(meters: number): string {
  const km = meters / 1000;
  return km >= 100 ? `${km.toFixed(0)} km` : `${km.toFixed(1)} km`;
}

function formatElevation(meters: number): string {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)}k m`;
  }
  return `${Math.round(meters)} m`;
}

function calculateWattsPerKg(ftp?: number, weight?: number): string {
  if (!ftp || !weight || weight === 0) return '--';
  return (ftp / weight).toFixed(2);
}

function estimateVO2Max(ftp?: number, weight?: number): string {
  // Rough estimate: VO2max ≈ (FTP/weight) * 10.8 + 7
  // This is a very rough approximation
  if (!ftp || !weight || weight === 0) return '--';
  const wattsPerKg = ftp / weight;
  const vo2max = wattsPerKg * 10.8 + 7;
  return vo2max.toFixed(0);
}

export function AthleteStats({
  name,
  avatarUrl,
  sex,
  city,
  country,
  weight,
  ftp,
  avgHeartRate,
  maxHeartRate,
  avgPace,
  avgPower,
  totalElevation,
  longestDistance,
  biggestClimb,
  followerCount,
  friendCount,
  isPremium,
}: AthleteStatsProps) {
  const wattsPerKg = calculateWattsPerKg(ftp, weight);
  const estimatedVO2 = estimateVO2Max(ftp, weight);

  const performanceStats = [
    {
      label: 'Avg Heart Rate',
      value: avgHeartRate ? `${Math.round(avgHeartRate)}` : '--',
      unit: 'bpm',
      icon: Heart,
      theme: 'red' as const,
    },
    {
      label: 'Max Heart Rate',
      value: maxHeartRate ? `${Math.round(maxHeartRate)}` : '--',
      unit: 'bpm',
      icon: Heart,
      theme: 'red' as const,
    },
    {
      label: 'Est. VO2 Max',
      value: estimatedVO2,
      unit: 'ml/kg/min',
      icon: Activity,
      theme: 'purple' as const,
    },
    {
      label: 'FTP',
      value: ftp ? `${ftp}` : '--',
      unit: 'watts',
      icon: Zap,
      theme: 'amber' as const,
    },
    {
      label: 'W/kg',
      value: wattsPerKg,
      unit: 'watts/kg',
      icon: TrendingUp,
      theme: 'emerald' as const,
    },
    {
      label: 'Weight',
      value: weight ? `${weight.toFixed(1)}` : '--',
      unit: 'kg',
      icon: Weight,
      theme: 'blue' as const,
    },
  ];

  const recordStats = [
    {
      label: 'Longest Ride/Run',
      value: longestDistance ? formatDistance(longestDistance) : '--',
      icon: Timer,
      theme: 'cyan' as const,
    },
    {
      label: 'Biggest Climb',
      value: biggestClimb ? formatElevation(biggestClimb) : '--',
      icon: Mountain,
      theme: 'orange' as const,
    },
    {
      label: 'Total Elevation',
      value: totalElevation ? formatElevation(totalElevation) : '--',
      icon: TrendingUp,
      theme: 'green' as const,
    },
  ];

  return (
    <div className="space-y-4">
      {/* Athlete Profile Header */}
      <GlassCard theme="slate" className="p-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={name || 'Athlete'}
                className="w-14 h-14 rounded-full border-2 border-slate-700"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center border-2 border-slate-700">
                <User className="w-7 h-7 text-slate-500" />
              </div>
            )}
            {isPremium && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                <Award className="w-3 h-3 text-white" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white">{name || 'Athlete'}</h3>
            <p className="text-sm text-slate-400">
              {[city, country].filter(Boolean).join(', ') || 'Location unknown'}
            </p>
            {(followerCount !== undefined || friendCount !== undefined) && (
              <div className="flex items-center gap-3 mt-1">
                {followerCount !== undefined && (
                  <span className="text-xs text-slate-500">
                    <span className="text-slate-400 font-medium">{followerCount}</span> followers
                  </span>
                )}
                {friendCount !== undefined && (
                  <span className="text-xs text-slate-500">
                    <span className="text-slate-400 font-medium">{friendCount}</span> following
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </GlassCard>

      {/* Performance Metrics Grid */}
      <div>
        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
          Performance Metrics
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          {performanceStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <GlassCard theme={stat.theme} className="p-3 text-center">
                  <GlassIcon theme={stat.theme} className="p-1.5 mx-auto mb-2">
                    <Icon className="w-3.5 h-3.5" />
                  </GlassIcon>
                  <div className="text-lg font-bold text-white">{stat.value}</div>
                  <div className="text-[10px] text-slate-500 uppercase">{stat.unit}</div>
                  <div className="text-xs text-slate-400 mt-1">{stat.label}</div>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Records */}
      <div>
        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
          Personal Records
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {recordStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.05 }}
              >
                <GlassCard theme={stat.theme} className="p-3">
                  <div className="flex items-center gap-3">
                    <GlassIcon theme={stat.theme} className="p-2">
                      <Icon className="w-4 h-4" />
                    </GlassIcon>
                    <div>
                      <div className="text-xs text-slate-400">{stat.label}</div>
                      <div className="text-lg font-bold text-white">{stat.value}</div>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
