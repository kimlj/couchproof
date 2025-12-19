'use client';

import { useState, useEffect } from 'react';
import { GlassCard, GlassIcon } from '@/components/ui/glass-card';
import { Flame, Heart, RefreshCw, Loader2 } from 'lucide-react';

interface DailyRoastProps {
  daysSinceLastActivity: number;
  totalActivities: number;
  currentStreak: number;
  weeklyDistance: number;
  avgActivitiesPerWeek: number;
  userName?: string;
}

type Mode = 'roast' | 'hype';

const ROASTS = {
  noActivity: [
    "Your running shoes are collecting dust and filing for divorce.",
    "The couch has officially claimed you as one of its own.",
    "Netflix asked if you're still watching. Your fitness tracker asked the same thing.",
    "Even your Apple Watch has given up sending you stand reminders.",
    "Your last activity was so long ago, archaeologists are interested.",
  ],
  fewDays: [
    "Taking 'rest days' a bit literally, aren't we?",
    "Your muscles are starting to forget what effort feels like.",
    "The snack drawer is getting more action than your running shoes.",
    "Is this a recovery week or a recovery month?",
  ],
  lowActivity: [
    "Your weekly distance wouldn't impress a sloth.",
    "At this pace, you'll finish that marathon by 2087.",
    "Your cardio is crying. Literally crying.",
    "Even walking to the fridge counts more steps than this.",
  ],
  decent: [
    "Not bad, but your potential is judging you silently.",
    "You're like a sports car stuck in traffic - capable, but not showing it.",
    "Average is just the best of the worst and worst of the best.",
  ],
  good: [
    "Okay fine, you're actually doing pretty well. Don't let it go to your head.",
    "Your consistency is annoyingly impressive.",
  ],
};

const HYPES = {
  noActivity: [
    "Rest days build champions! Your comeback is going to be legendary. 🔥",
    "Recharging for your next PR! The world isn't ready.",
    "Even champions need rest. Tomorrow, you rise! 💪",
  ],
  fewDays: [
    "Recovery mode activated! You're about to come back stronger than ever! 🚀",
    "Building that anticipation for an epic return! Let's go!",
  ],
  lowActivity: [
    "Every step counts! You're building momentum! 🌟",
    "Starting small leads to finishing BIG! Keep pushing!",
    "Progress is progress, no matter the pace! You've got this! 💫",
  ],
  decent: [
    "You're in the zone! Keep that energy rolling! 🔥",
    "Consistency is your superpower! Crushing it!",
    "The grind is real and YOU ARE GRINDING! 💪",
  ],
  good: [
    "ABSOLUTE MACHINE! You're inspiring everyone around you! 🏆",
    "Elite mentality, elite results! Keep dominating!",
    "You're not just meeting goals, you're DESTROYING them! 🚀",
  ],
  streak: [
    "🔥 STREAK ON FIRE! {streak} days and counting! Unstoppable!",
    "Day {streak} of being a total legend! Keep it up! 💪",
  ],
};

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getMessage(props: DailyRoastProps, mode: Mode): string {
  const { daysSinceLastActivity, currentStreak, weeklyDistance, avgActivitiesPerWeek } = props;
  const messages = mode === 'roast' ? ROASTS : HYPES;

  // Streak hype
  if (mode === 'hype' && currentStreak >= 3) {
    return getRandomItem(HYPES.streak).replace('{streak}', currentStreak.toString());
  }

  // No activity in a while
  if (daysSinceLastActivity >= 7) {
    return getRandomItem(messages.noActivity);
  }

  if (daysSinceLastActivity >= 3) {
    return getRandomItem(messages.fewDays);
  }

  // Low weekly activity
  if (weeklyDistance < 5000 || avgActivitiesPerWeek < 1) {
    return getRandomItem(messages.lowActivity);
  }

  // Decent activity
  if (weeklyDistance < 20000 || avgActivitiesPerWeek < 3) {
    return getRandomItem(messages.decent);
  }

  // Good activity
  return getRandomItem(messages.good);
}

export function DailyRoast(props: DailyRoastProps) {
  const [mode, setMode] = useState<Mode>('roast');
  const [message, setMessage] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    setMessage(getMessage(props, mode));
  }, [mode, props]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setMessage(getMessage(props, mode));
      setIsRefreshing(false);
    }, 300);
  };

  const toggleMode = () => {
    setMode(mode === 'roast' ? 'hype' : 'roast');
  };

  return (
    <GlassCard theme={mode === 'roast' ? 'orange' : 'pink'} className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <GlassIcon theme={mode === 'roast' ? 'orange' : 'pink'} className="p-1.5">
            {mode === 'roast' ? (
              <Flame className="w-3.5 h-3.5" />
            ) : (
              <Heart className="w-3.5 h-3.5" />
            )}
          </GlassIcon>
          <h3 className="text-sm font-semibold text-white">
            {mode === 'roast' ? 'Daily Roast' : 'Daily Hype'}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-1.5 rounded-lg hover:bg-slate-800/50 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-400 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={toggleMode}
            className={`px-2 py-1 rounded-full text-[10px] font-medium transition-all ${
              mode === 'roast'
                ? 'bg-pink-500/20 text-pink-400 hover:bg-pink-500/30'
                : 'bg-orange-500/20 text-orange-400 hover:bg-orange-500/30'
            }`}
          >
            {mode === 'roast' ? '💖 Hype me' : '🔥 Roast me'}
          </button>
        </div>
      </div>

      <div className={`p-3 rounded-lg ${mode === 'roast' ? 'bg-orange-500/10 border border-orange-500/20' : 'bg-pink-500/10 border border-pink-500/20'}`}>
        <p className="text-sm text-slate-200 leading-relaxed">
          {message}
        </p>
      </div>

      {props.currentStreak > 0 && (
        <div className="mt-3 flex items-center justify-center gap-2">
          <span className="text-xs text-slate-500">Current streak:</span>
          <span className="text-xs font-bold text-orange-400">🔥 {props.currentStreak} days</span>
        </div>
      )}
    </GlassCard>
  );
}
