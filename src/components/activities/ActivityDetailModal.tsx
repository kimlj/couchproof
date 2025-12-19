'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { formatDistance, formatDuration, formatSpeed, formatElevation, formatActivityDateTime, formatPace } from '@/lib/utils/formatters';
import { Bike, Footprints, Activity as ActivityIcon, Heart, Zap, Mountain, Clock, Flame, Trophy, MapPin, X, MessageCircle, ThumbsUp, Award, Timer, Sparkles, Loader2, Route } from 'lucide-react';

interface ActivityData {
  id: string;
  name: string;
  type: string;
  sportType?: string;
  distance: number;
  movingTime: number;
  elapsedTime?: number;
  totalElevationGain?: number;
  startDate: string;
  startDateLocal?: string;
  averageSpeed?: number;
  maxSpeed?: number;
  averageHeartrate?: number;
  maxHeartrate?: number;
  averageWatts?: number;
  maxWatts?: number;
  calories?: number;
  kudosCount?: number;
  commentCount?: number;
  achievementCount?: number;
  prCount?: number;
  description?: string;
  city?: string;
  state?: string;
  country?: string;
  aiSummary?: string;
  gear?: {
    name: string;
    type: string;
    distance?: number; // meters
  };
}

interface ActivityDetailModalProps {
  activity: ActivityData | null;
  open: boolean;
  onClose: () => void;
  onSummaryGenerated?: (activityId: string, summary: string) => void;
}

function getActivityIcon(type: string) {
  switch (type?.toLowerCase()) {
    case 'ride':
    case 'virtualride':
    case 'ebikeride':
      return Bike;
    case 'run':
    case 'virtualrun':
    case 'trailrun':
      return Footprints;
    default:
      return ActivityIcon;
  }
}

function getActivityColors(type: string) {
  switch (type?.toLowerCase()) {
    case 'ride':
    case 'virtualride':
      return { gradient: 'from-orange-500 to-red-500', bg: 'from-orange-500/10 to-red-500/10', border: 'border-orange-500/20', text: 'text-orange-400' };
    case 'run':
    case 'virtualrun':
      return { gradient: 'from-green-500 to-emerald-500', bg: 'from-green-500/10 to-emerald-500/10', border: 'border-green-500/20', text: 'text-green-400' };
    case 'swim':
      return { gradient: 'from-blue-500 to-cyan-500', bg: 'from-blue-500/10 to-cyan-500/10', border: 'border-blue-500/20', text: 'text-blue-400' };
    default:
      return { gradient: 'from-purple-500 to-pink-500', bg: 'from-purple-500/10 to-pink-500/10', border: 'border-purple-500/20', text: 'text-purple-400' };
  }
}

export function ActivityDetailModal({ activity, open, onClose, onSummaryGenerated }: ActivityDetailModalProps) {
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [localSummary, setLocalSummary] = useState<string | null>(null);

  // Reset local summary when activity changes
  useEffect(() => {
    setLocalSummary(null);
    setIsGeneratingSummary(false);
  }, [activity?.id]);

  if (!activity) return null;

  const Icon = getActivityIcon(activity.type);
  const colors = getActivityColors(activity.type);
  const isRun = activity.type?.toLowerCase().includes('run');
  const location = [activity.city, activity.state, activity.country].filter(Boolean).join(', ');

  const currentSummary = localSummary || activity.aiSummary;

  const handleGenerateSummary = async () => {
    if (isGeneratingSummary) return;

    setIsGeneratingSummary(true);
    try {
      const response = await fetch('/api/ai/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activityId: activity.id }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate summary');
      }

      const data = await response.json();
      setLocalSummary(data.content);
      onSummaryGenerated?.(activity.id, data.content);
    } catch (error) {
      console.error('Error generating summary:', error);
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        showCloseButton={false}
        className="max-w-2xl p-0 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 border border-cyan-500/20 rounded-2xl shadow-2xl shadow-cyan-500/10 text-white max-h-[90vh] overflow-hidden"
      >
        {/* Gradient accent line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-t-2xl" />

        {/* Header */}
        <div className="relative p-6 pb-4">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-slate-700/50 rounded-lg transition-colors group z-10 focus:outline-none"
          >
            <X className="w-5 h-5 text-gray-400 group-hover:text-gray-300" />
          </button>

          <div className="flex items-start gap-4">
            {/* Activity Icon */}
            <div className={`p-3 rounded-xl bg-gradient-to-br ${colors.bg} border ${colors.border}`}>
              <Icon className={`w-7 h-7 ${colors.text}`} />
            </div>

            <div className="flex-1 min-w-0 pr-8">
              <h2 className="text-xl font-bold text-white mb-1 truncate">
                {activity.name}
              </h2>
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <span className="text-slate-400">
                  {formatActivityDateTime(activity.startDateLocal || activity.startDate)}
                </span>
                {location && (
                  <span className="flex items-center gap-1 text-slate-500">
                    <MapPin className="w-3 h-3 text-cyan-400" />
                    {location}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="px-6 pb-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {/* AI Summary Section */}
          <div className="mb-4 p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl backdrop-blur-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                </div>
                <span className="text-xs uppercase tracking-wider text-purple-400 font-medium">AI Summary</span>
              </div>
              {!currentSummary && (
                <button
                  onClick={handleGenerateSummary}
                  disabled={isGeneratingSummary}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-purple-400 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGeneratingSummary ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3 h-3" />
                      Generate
                    </>
                  )}
                </button>
              )}
            </div>
            {currentSummary ? (
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                {currentSummary}
              </p>
            ) : (
              <p className="text-sm text-slate-500 italic">
                {isGeneratingSummary
                  ? 'Creating a personalized summary of your activity...'
                  : 'Click "Generate" to create an AI-powered summary of this activity.'}
              </p>
            )}
          </div>

          {/* Description */}
          {activity.description && (
            <div className="mb-4 p-4 bg-slate-800/50 border border-slate-700/50 rounded-xl">
              <p className="text-sm text-slate-300 leading-relaxed">{activity.description}</p>
            </div>
          )}

          {/* Main Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            <StatCard
              label="Distance"
              value={formatDistance(activity.distance)}
              icon={<Route className="w-4 h-4" />}
              iconColor="cyan"
            />
            <StatCard
              label="Moving Time"
              value={formatDuration(activity.movingTime)}
              icon={<Clock className="w-4 h-4" />}
              iconColor="purple"
            />
            <StatCard
              label={isRun ? "Pace" : "Avg Speed"}
              value={isRun ? formatPace(activity.averageSpeed || 0) : formatSpeed(activity.averageSpeed || 0)}
              icon={<Zap className="w-4 h-4" />}
              iconColor="amber"
            />
            <StatCard
              label="Elevation"
              value={formatElevation(activity.totalElevationGain || 0)}
              icon={<Mountain className="w-4 h-4" />}
              iconColor="green"
            />
          </div>

          {/* Secondary Stats */}
          {(activity.averageHeartrate || activity.averageWatts || activity.calories || (activity.elapsedTime && activity.elapsedTime !== activity.movingTime)) && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
              {activity.averageHeartrate && (
                <StatCard
                  label="Avg Heart Rate"
                  value={`${Math.round(activity.averageHeartrate)} bpm`}
                  subValue={activity.maxHeartrate ? `Max: ${Math.round(activity.maxHeartrate)}` : undefined}
                  icon={<Heart className="w-4 h-4" />}
                  iconColor="red"
                />
              )}
              {activity.averageWatts && (
                <StatCard
                  label="Avg Power"
                  value={`${Math.round(activity.averageWatts)} W`}
                  subValue={activity.maxWatts ? `Max: ${activity.maxWatts} W` : undefined}
                  icon={<Zap className="w-4 h-4" />}
                  iconColor="amber"
                />
              )}
              {activity.calories && (
                <StatCard
                  label="Calories"
                  value={`${Math.round(activity.calories)}`}
                  icon={<Flame className="w-4 h-4" />}
                  iconColor="red"
                />
              )}
              {activity.elapsedTime && activity.elapsedTime !== activity.movingTime && (
                <StatCard
                  label="Elapsed Time"
                  value={formatDuration(activity.elapsedTime)}
                  icon={<Timer className="w-4 h-4" />}
                  iconColor="purple"
                />
              )}
            </div>
          )}

          {/* Social Stats */}
          <div className="flex flex-wrap items-center gap-3 p-4 bg-slate-800/30 border border-slate-700/50 rounded-xl">
            {activity.kudosCount !== undefined && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                <ThumbsUp className="w-4 h-4 text-orange-400" />
                <span className="text-sm font-medium text-orange-400">{activity.kudosCount}</span>
                <span className="text-xs text-slate-500">kudos</span>
              </div>
            )}
            {activity.commentCount !== undefined && activity.commentCount > 0 && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
                <MessageCircle className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-medium text-cyan-400">{activity.commentCount}</span>
                <span className="text-xs text-slate-500">comments</span>
              </div>
            )}
            {activity.achievementCount !== undefined && activity.achievementCount > 0 && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <Award className="w-4 h-4 text-yellow-400" />
                <span className="text-sm font-medium text-yellow-400">{activity.achievementCount}</span>
                <span className="text-xs text-slate-500">achievements</span>
              </div>
            )}
            {activity.prCount !== undefined && activity.prCount > 0 && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-500/10 via-amber-500/10 to-yellow-500/10 border border-amber-500/30 rounded-lg">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-medium text-amber-400">{activity.prCount}</span>
                <span className="text-xs text-slate-500">PRs</span>
              </div>
            )}
          </div>

          {/* Gear */}
          {activity.gear && (
            <div className="mt-4 p-4 bg-slate-800/30 border border-slate-700/50 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">
                    {activity.gear.type === 'shoe' ? 'Shoes' : activity.gear.type === 'bike' ? 'Bike' : 'Gear'}
                  </p>
                  <p className="text-sm font-medium text-slate-300">{activity.gear.name}</p>
                </div>
                {activity.gear.distance !== undefined && activity.gear.distance > 0 && (
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Mileage</p>
                    <p className="text-sm font-medium text-cyan-400">
                      {(activity.gear.distance / 1000).toFixed(0)} km
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

const iconColorStyles = {
  cyan: 'bg-cyan-500/10 text-cyan-400',
  purple: 'bg-purple-500/10 text-purple-400',
  amber: 'bg-gradient-to-br from-amber-500/20 to-yellow-500/10 text-amber-400',
  green: 'bg-green-500/10 text-green-400',
  red: 'bg-red-500/10 text-red-400',
};

function StatCard({
  label,
  value,
  subValue,
  icon,
  iconColor = 'cyan',
}: {
  label: string;
  value: string;
  subValue?: string;
  icon?: React.ReactNode;
  iconColor?: 'cyan' | 'purple' | 'amber' | 'green' | 'red';
}) {
  return (
    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-xl p-3">
      <div className="flex items-center gap-2 mb-2">
        <div className={`p-1.5 rounded-lg ${iconColorStyles[iconColor]}`}>
          {icon}
        </div>
        <span className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">{label}</span>
      </div>
      <p className="text-lg font-bold text-white">{value}</p>
      {subValue && <p className="text-xs text-slate-500 mt-0.5">{subValue}</p>}
    </div>
  );
}
