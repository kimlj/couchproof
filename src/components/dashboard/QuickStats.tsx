'use client';

import { useMemo, useState } from 'react';
import { GlassCard, GlassIcon } from '@/components/ui/glass-card';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy,
  Zap,
  Target,
  Clock,
  Mountain,
  Flame,
  Heart,
  ThumbsUp,
  Sun,
  Moon,
  Tv,
  Lightbulb,
  ChevronLeft,
  ChevronRight,
  Gauge,
  CookingPot,
} from 'lucide-react';

interface QuickStatsProps {
  totalDistance: number; // meters
  totalTime: number; // seconds
  totalElevation: number; // meters
  totalCalories: number;
  totalActivities: number;
  longestStreak: number;
  totalKudos: number;
  earlyBirdCount: number;
  nightOwlCount: number;
  totalHeartbeats: number;
  totalKilojoules: number;
  maxRunSpeedKmh: number;
}

interface FunStat {
  icon: typeof Trophy;
  label: string;
  value: string;
  description: string;
  theme: 'orange' | 'emerald' | 'cyan' | 'purple' | 'pink' | 'amber';
  bgEmoji: string;
}

// Animals and their max speeds in km/h
const animals = [
  { name: 'a sloth', speed: 0.27, emoji: '🦥' },
  { name: 'a tortoise', speed: 0.3, emoji: '🐢' },
  { name: 'a snail', speed: 0.05, emoji: '🐌' },
  { name: 'a chicken', speed: 9, emoji: '🐔' },
  { name: 'a pig', speed: 18, emoji: '🐷' },
  { name: 'a squirrel', speed: 20, emoji: '🐿️' },
  { name: 'an elephant', speed: 25, emoji: '🐘' },
  { name: 'a hippo', speed: 30, emoji: '🦛' },
  { name: 'a grizzly bear', speed: 35, emoji: '🐻' },
  { name: 'a cat', speed: 48, emoji: '🐱' },
  { name: 'a greyhound', speed: 70, emoji: '🐕' },
  { name: 'a cheetah', speed: 120, emoji: '🐆' },
];

function getAnimalComparison(speedKmh: number): { animal: string; emoji: string } | null {
  // Find the fastest animal the user can outrun
  const beatable = animals.filter((a) => speedKmh > a.speed);
  if (beatable.length === 0) return null;
  // Return the fastest one they can beat
  const fastest = beatable[beatable.length - 1];
  return { animal: fastest.name, emoji: fastest.emoji };
}

export function QuickStats(props: QuickStatsProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);

  const funStats = useMemo<FunStat[]>(() => {
    const stats: FunStat[] = [];
    const {
      totalDistance,
      totalTime,
      totalElevation,
      totalCalories,
      longestStreak,
      totalKudos,
      earlyBirdCount,
      nightOwlCount,
      totalHeartbeats,
      totalKilojoules,
      maxRunSpeedKmh,
    } = props;

    // Distance equivalents
    const km = totalDistance / 1000;
    if (km > 0) {
      const marathons = km / 42.195;
      if (marathons >= 1) {
        stats.push({
          icon: Trophy,
          label: 'Marathons Equivalent',
          value: marathons.toFixed(1),
          description: `You've covered ${marathons.toFixed(1)} marathon distances!`,
          theme: 'orange',
          bgEmoji: '🏃',
        });
      }

      // Around the world progress (40,075 km)
      const worldPercent = (km / 40075) * 100;
      if (worldPercent >= 0.1) {
        stats.push({
          icon: Target,
          label: 'Around the World',
          value: `${worldPercent.toFixed(2)}%`,
          description: `${worldPercent.toFixed(2)}% of Earth's circumference`,
          theme: 'cyan',
          bgEmoji: '🌍',
        });
      }
    }

    // Elevation - Everests climbed (8,849m)
    if (totalElevation > 0) {
      const everests = totalElevation / 8849;
      stats.push({
        icon: Mountain,
        label: 'Everests Climbed',
        value: everests.toFixed(2),
        description: `${Math.round(totalElevation).toLocaleString()}m total elevation`,
        theme: 'emerald',
        bgEmoji: '🏔️',
      });
    }

    // Calories - Pizza slices burned (roughly 285 cal per slice)
    if (totalCalories > 0) {
      const slices = totalCalories / 285;
      stats.push({
        icon: Flame,
        label: 'Pizza Slices Burned',
        value: Math.round(slices).toLocaleString(),
        description: `${Math.round(totalCalories).toLocaleString()} total calories`,
        theme: 'pink',
        bgEmoji: '🍕',
      });
    }

    // Speed - Animal comparison (running only)
    if (maxRunSpeedKmh > 0) {
      const comparison = getAnimalComparison(maxRunSpeedKmh);
      if (comparison) {
        stats.push({
          icon: Gauge,
          label: 'Faster Than',
          value: comparison.animal,
          description: `Top running speed: ${maxRunSpeedKmh.toFixed(1)} km/h`,
          theme: 'orange',
          bgEmoji: comparison.emoji,
        });
      }
    }

    // Power - Toasters Run (800W toaster)
    if (totalKilojoules > 0) {
      // 1 kJ = 1000 J, Power = Energy / Time, so Time = Energy / Power
      // 800W = 800 J/s, so minutes = (kJ * 1000) / 800 / 60
      const toasterMinutes = (totalKilojoules * 1000) / 800 / 60;
      if (toasterMinutes >= 1) {
        const display = toasterMinutes >= 60
          ? `${(toasterMinutes / 60).toFixed(1)}h`
          : `${Math.round(toasterMinutes)} min`;
        stats.push({
          icon: CookingPot,
          label: 'Toasters Powered',
          value: display,
          description: `You could run a toaster for ${Math.round(toasterMinutes)} minutes`,
          theme: 'amber',
          bgEmoji: '🍞',
        });
      }
    }

    // Netflix Binges Avoided (2.5 hours per binge)
    if (totalTime > 0) {
      const binges = totalTime / (2.5 * 3600);
      if (binges >= 1) {
        stats.push({
          icon: Tv,
          label: 'Netflix Binges Avoided',
          value: Math.round(binges).toLocaleString(),
          description: `${Math.round(totalTime / 3600)} hours of activity instead`,
          theme: 'purple',
          bgEmoji: '📺',
        });
      }
    }

    // Kudos Collected
    if (totalKudos > 0) {
      stats.push({
        icon: ThumbsUp,
        label: 'Kudos Collected',
        value: totalKudos.toLocaleString(),
        description: `You're loved by ${totalKudos} people!`,
        theme: 'orange',
        bgEmoji: '👍',
      });
    }

    // Early Bird Score
    if (earlyBirdCount > 0) {
      stats.push({
        icon: Sun,
        label: 'Early Bird Score',
        value: earlyBirdCount.toString(),
        description: `${earlyBirdCount} workouts before 6am`,
        theme: 'amber',
        bgEmoji: '🌅',
      });
    }

    // Night Owl Score
    if (nightOwlCount > 0) {
      stats.push({
        icon: Moon,
        label: 'Night Owl Score',
        value: nightOwlCount.toString(),
        description: `${nightOwlCount} workouts after 6pm`,
        theme: 'purple',
        bgEmoji: '🌙',
      });
    }

    // Heartbeats During Exercise
    if (totalHeartbeats > 0) {
      const millions = totalHeartbeats / 1000000;
      const display = millions >= 1
        ? `${millions.toFixed(1)}M`
        : `${Math.round(totalHeartbeats / 1000)}K`;
      stats.push({
        icon: Heart,
        label: 'Heartbeats Pumped',
        value: display,
        description: `${totalHeartbeats.toLocaleString()} beats during exercise`,
        theme: 'pink',
        bgEmoji: '💓',
      });
    }

    // Power - Phone Charges (10Wh per charge, 1kJ = 0.2778Wh)
    if (totalKilojoules > 0) {
      const wattHours = totalKilojoules * 0.2778;
      const phoneCharges = wattHours / 10;
      if (phoneCharges >= 1) {
        stats.push({
          icon: Lightbulb,
          label: 'Phone Charges',
          value: Math.round(phoneCharges).toLocaleString(),
          description: `${Math.round(totalKilojoules).toLocaleString()} kJ of power output`,
          theme: 'cyan',
          bgEmoji: '🔋',
        });
      }
    }

    // Streak
    if (longestStreak > 0) {
      stats.push({
        icon: Zap,
        label: 'Longest Streak',
        value: `${longestStreak} days`,
        description: 'Your best consistency run',
        theme: 'amber',
        bgEmoji: '🔥',
      });
    }

    // Time - Days spent moving (lower priority)
    if (totalTime > 0) {
      const days = totalTime / 86400;
      const hours = totalTime / 3600;
      stats.push({
        icon: Clock,
        label: 'Active Time',
        value: days >= 1 ? `${days.toFixed(1)} days` : `${hours.toFixed(0)}h`,
        description: `${Math.round(hours)} hours of pure effort`,
        theme: 'purple',
        bgEmoji: '⏱️',
      });
    }

    return stats;
  }, [props]);

  if (funStats.length === 0) {
    return null;
  }

  const totalSlides = Math.ceil(funStats.length / 4);
  const visibleStats = funStats.slice(currentSlide * 4, (currentSlide + 1) * 4);

  const goToSlide = (index: number) => {
    setDirection(index > currentSlide ? 1 : -1);
    setCurrentSlide(index);
  };

  const goNext = () => {
    setDirection(1);
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const goPrev = () => {
    setDirection(-1);
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  // Handle trackpad/mouse wheel horizontal scroll
  const handleWheel = (e: React.WheelEvent) => {
    if (totalSlides <= 1 || isScrolling) return;

    // Detect horizontal scroll (trackpad two-finger swipe)
    const isHorizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY);
    if (!isHorizontal) return;

    const threshold = 30;
    if (Math.abs(e.deltaX) < threshold) return;

    setIsScrolling(true);

    if (e.deltaX > 0) {
      goNext();
    } else {
      goPrev();
    }

    // Debounce to prevent rapid scrolling
    setTimeout(() => setIsScrolling(false), 300);
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -50 : 50,
      opacity: 0,
    }),
  };

  return (
    <div className="relative group overflow-hidden" onWheel={handleWheel}>
      {/* Navigation arrows - subtle, show on hover */}
      {totalSlides > 1 && (
        <>
          <button
            onClick={goPrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 z-10 p-1 rounded-full opacity-0 group-hover:opacity-100 hover:bg-slate-800/50 transition-all duration-200"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-4 h-4 text-slate-500 hover:text-slate-300" />
          </button>
          <button
            onClick={goNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 z-10 p-1 rounded-full opacity-0 group-hover:opacity-100 hover:bg-slate-800/50 transition-all duration-200"
            aria-label="Next slide"
          >
            <ChevronRight className="w-4 h-4 text-slate-500 hover:text-slate-300" />
          </button>
        </>
      )}

      {/* Stats grid with animation */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={currentSlide}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-3"
        >
          {visibleStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <GlassCard key={index} theme={stat.theme} className="p-3 relative overflow-hidden">
                {/* Background emoji */}
                <div className="absolute -right-2 -bottom-2 text-6xl opacity-[0.15] pointer-events-none select-none">
                  {stat.bgEmoji}
                </div>
                <div className="flex items-start gap-2 relative z-10">
                  <GlassIcon theme={stat.theme} className="p-1.5 flex-shrink-0">
                    <Icon className="w-3.5 h-3.5" />
                  </GlassIcon>
                  <div className="min-w-0">
                    <p className="text-xs text-slate-400 truncate">{stat.label}</p>
                    <p className="text-lg font-bold text-white">{stat.value}</p>
                    <p className="text-[10px] text-slate-500 truncate">{stat.description}</p>
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </motion.div>
      </AnimatePresence>

      {/* Dots indicator */}
      {totalSlides > 1 && (
        <div className="flex justify-center gap-1.5 mt-3">
          {Array.from({ length: totalSlides }).map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
                index === currentSlide
                  ? 'bg-cyan-500 w-3'
                  : 'bg-slate-600 hover:bg-slate-500'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
