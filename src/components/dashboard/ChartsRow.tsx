'use client';

import { useMemo, useState, useRef, useEffect } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from 'recharts';

interface Activity {
  startDate: string;
  distance: number;
  movingTime: number;
  type: string;
  totalElevationGain?: number;
}

interface ChartsRowProps {
  activities: Activity[];
}

// Colors for charts
const COLORS = {
  cyan: '#06b6d4',
  pink: '#ec4899',
  amber: '#f59e0b',
  emerald: '#10b981',
  purple: '#8b5cf6',
  orange: '#f97316',
};

const PIE_COLORS = [COLORS.cyan, COLORS.pink, COLORS.amber, COLORS.emerald, COLORS.purple, COLORS.orange];

// Custom tooltip style - consistent across all charts
const tooltipStyle = {
  backgroundColor: 'rgba(15, 23, 42, 0.95)',
  border: '1px solid rgba(51, 65, 85, 0.5)',
  borderRadius: '8px',
  padding: '8px 12px',
};

const tooltipLabelStyle = { color: '#94a3b8' };
const tooltipItemStyle = { color: '#e2e8f0' };

// Theme colors for dropdown
const THEME_COLORS = {
  cyan: {
    border: 'border-cyan-500/30',
    hoverBorder: 'hover:border-cyan-400/50',
    bg: 'bg-cyan-500/10',
    hoverBg: 'hover:bg-cyan-500/20',
    text: 'text-cyan-300',
    glow: 'shadow-[0_0_10px_rgba(6,182,212,0.15)]',
    selectedBg: 'bg-cyan-500/20',
    accent: COLORS.cyan,
  },
  pink: {
    border: 'border-pink-500/30',
    hoverBorder: 'hover:border-pink-400/50',
    bg: 'bg-pink-500/10',
    hoverBg: 'hover:bg-pink-500/20',
    text: 'text-pink-300',
    glow: 'shadow-[0_0_10px_rgba(236,72,153,0.15)]',
    selectedBg: 'bg-pink-500/20',
    accent: COLORS.pink,
  },
};

// Modern dropdown component for period selection
function PeriodDropdown({
  value,
  onChange,
  theme = 'cyan'
}: {
  value: 'weekly' | 'monthly';
  onChange: (v: 'weekly' | 'monthly') => void;
  theme?: 'cyan' | 'pink';
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const colors = THEME_COLORS[theme];

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const options = [
    { value: 'weekly' as const, label: 'Weekly' },
    { value: 'monthly' as const, label: 'Monthly' },
  ];

  const selectedLabel = options.find(o => o.value === value)?.label || 'Monthly';

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 text-xs ${colors.bg} ${colors.hoverBg} border ${colors.border} ${colors.hoverBorder} rounded-lg px-2.5 py-1.5 ${colors.text} transition-all duration-200 cursor-pointer ${isOpen ? colors.glow : ''}`}
      >
        <span>{selectedLabel}</span>
        <motion.svg
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="w-3 h-3"
          style={{ color: colors.accent }}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </motion.svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -5, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={`absolute right-0 top-full mt-1 z-50 min-w-[100px] bg-slate-900/95 backdrop-blur-xl border ${colors.border} rounded-lg ${colors.glow} overflow-hidden`}
          >
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-xs transition-all duration-150 ${
                  value === option.value
                    ? colors.text
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span
                    className="w-1.5 h-1.5 rounded-full transition-opacity duration-150"
                    style={{
                      backgroundColor: colors.accent,
                      opacity: value === option.value ? 1 : 0
                    }}
                  />
                  {option.label}
                </span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Extended dropdown with All option for Activity Types
function PeriodDropdownExtended({
  value,
  onChange,
  theme = 'pink'
}: {
  value: 'all' | 'weekly' | 'monthly';
  onChange: (v: 'all' | 'weekly' | 'monthly') => void;
  theme?: 'cyan' | 'pink';
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const colors = THEME_COLORS[theme];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const options = [
    { value: 'all' as const, label: 'All Time' },
    { value: 'monthly' as const, label: 'Monthly' },
    { value: 'weekly' as const, label: 'Weekly' },
  ];

  const selectedLabel = options.find(o => o.value === value)?.label || 'All Time';

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 text-xs ${colors.bg} ${colors.hoverBg} border ${colors.border} ${colors.hoverBorder} rounded-lg px-2.5 py-1.5 ${colors.text} transition-all duration-200 cursor-pointer ${isOpen ? colors.glow : ''}`}
      >
        <span>{selectedLabel}</span>
        <motion.svg
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="w-3 h-3"
          style={{ color: colors.accent }}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </motion.svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -5, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={`absolute right-0 top-full mt-1 z-50 min-w-[100px] bg-slate-900/95 backdrop-blur-xl border ${colors.border} rounded-lg ${colors.glow} overflow-hidden`}
          >
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-xs transition-all duration-150 ${
                  value === option.value
                    ? colors.text
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span
                    className="w-1.5 h-1.5 rounded-full transition-opacity duration-150"
                    style={{
                      backgroundColor: colors.accent,
                      opacity: value === option.value ? 1 : 0
                    }}
                  />
                  {option.label}
                </span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Activity type colors
const ACTIVITY_TYPE_COLORS = {
  all: COLORS.cyan,
  Run: COLORS.emerald,
  Ride: COLORS.amber,
  Swim: COLORS.pink,
};

// Activity Type Toggle Component
function ActivityTypeToggle({
  value,
  onChange,
  availableTypes,
}: {
  value: 'all' | 'Run' | 'Ride' | 'Swim';
  onChange: (v: 'all' | 'Run' | 'Ride' | 'Swim') => void;
  availableTypes: Set<string>;
}) {
  const options: { value: 'all' | 'Run' | 'Ride' | 'Swim'; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'Run', label: 'Run' },
    { value: 'Ride', label: 'Ride' },
    { value: 'Swim', label: 'Swim' },
  ];

  // Only show options that have activities (except 'all' which is always shown)
  const visibleOptions = options.filter(
    (opt) => opt.value === 'all' || availableTypes.has(opt.value)
  );

  return (
    <div className="flex items-center gap-1 bg-slate-800/50 rounded-lg p-0.5">
      {visibleOptions.map((option) => {
        const isActive = value === option.value;
        const color = ACTIVITY_TYPE_COLORS[option.value];

        return (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`px-2 py-1 text-xs rounded-md transition-all duration-200 cursor-pointer ${
              isActive
                ? 'text-white'
                : 'text-slate-500 hover:text-slate-300'
            }`}
            style={{
              backgroundColor: isActive ? `${color}30` : 'transparent',
              color: isActive ? color : undefined,
            }}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

// Distance Trend Chart - Weekly or Monthly with Activity Type Filter
function DistanceTrendChart({ activities }: { activities: Activity[] }) {
  const [period, setPeriod] = useState<'weekly' | 'monthly'>('monthly');
  const [activityType, setActivityType] = useState<'all' | 'Run' | 'Ride' | 'Swim'>('all');

  // Get available activity types
  const availableTypes = useMemo(() => {
    const types = new Set<string>();
    activities.forEach((a) => {
      if (a.type === 'Run' || a.type === 'Ride' || a.type === 'Swim') {
        types.add(a.type);
      }
    });
    return types;
  }, [activities]);

  // Filter activities by type
  const filteredActivities = useMemo(() => {
    if (activityType === 'all') return activities;
    return activities.filter((a) => a.type === activityType);
  }, [activities, activityType]);

  // Get the current line color based on activity type
  const lineColor = ACTIVITY_TYPE_COLORS[activityType];

  const chartData = useMemo(() => {
    const now = new Date();

    if (period === 'monthly') {
      const months: { [key: string]: { distance: number; activities: number; name: string } } = {};

      // Initialize last 6 months
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const monthName = date.toLocaleDateString('en-US', { month: 'short' });
        months[key] = { distance: 0, activities: 0, name: monthName };
      }

      // Aggregate activities
      filteredActivities.forEach((activity) => {
        const date = new Date(activity.startDate);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (months[key]) {
          months[key].distance += activity.distance / 1000;
          months[key].activities += 1;
        }
      });

      return Object.values(months).map((m) => ({
        ...m,
        distance: Math.round(m.distance),
      }));
    } else {
      // Weekly view - last 8 weeks
      const weeks: { name: string; distance: number; activities: number }[] = [];

      for (let i = 7; i >= 0; i--) {
        const weekEnd = new Date(now);
        weekEnd.setDate(now.getDate() - i * 7);
        const weekStart = new Date(weekEnd);
        weekStart.setDate(weekEnd.getDate() - 6);

        const weekActivities = filteredActivities.filter((a) => {
          const date = new Date(a.startDate);
          return date >= weekStart && date <= weekEnd;
        });

        const distance = weekActivities.reduce((sum, a) => sum + a.distance, 0) / 1000;

        weeks.push({
          name: i === 0 ? 'Now' : `${i}w`,
          distance: Math.round(distance),
          activities: weekActivities.length,
        });
      }

      return weeks;
    }
  }, [filteredActivities, period]);

  return (
    <GlassCard theme="cyan" className="p-4 h-full border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-300">Distance Trend</h3>
        <div className="flex items-center gap-2">
          <ActivityTypeToggle
            value={activityType}
            onChange={setActivityType}
            availableTypes={availableTypes}
          />
          <PeriodDropdown value={period} onChange={setPeriod} theme="cyan" />
        </div>
      </div>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 11 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 11 }}
              tickFormatter={(v) => `${v}km`}
              width={45}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              labelStyle={tooltipLabelStyle}
              itemStyle={tooltipItemStyle}
              formatter={(value) => [`${value} km`, 'Distance']}
            />
            <Line
              type="monotone"
              dataKey="distance"
              stroke={lineColor}
              strokeWidth={2}
              dot={{ fill: lineColor, strokeWidth: 0, r: 4 }}
              activeDot={{ r: 6, fill: lineColor }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}

// Activity Types Pie Chart - All, Weekly or Monthly
function ActivityTypesChart({ activities }: { activities: Activity[] }) {
  const [period, setPeriod] = useState<'all' | 'weekly' | 'monthly'>('all');

  const typeData = useMemo(() => {
    const now = new Date();
    let filteredActivities = activities;

    if (period === 'weekly') {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - 7);
      filteredActivities = activities.filter((a) => new Date(a.startDate) >= weekStart);
    } else if (period === 'monthly') {
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      filteredActivities = activities.filter((a) => new Date(a.startDate) >= monthStart);
    }
    // 'all' uses all activities without filtering

    const types: { [key: string]: number } = {};

    filteredActivities.forEach((activity) => {
      const type = activity.type || 'Other';
      types[type] = (types[type] || 0) + 1;
    });

    return Object.entries(types)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6); // Show top 6 for all activities
  }, [activities, period]);

  const total = typeData.reduce((sum, t) => sum + t.value, 0);

  return (
    <GlassCard theme="pink" className="p-4 h-full border border-pink-500/30 shadow-[0_0_15px_rgba(236,72,153,0.1)]">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-300">Activity Types</h3>
        <PeriodDropdownExtended value={period} onChange={setPeriod} theme="pink" />
      </div>
      <div className="h-48 flex items-center">
        <div className="w-1/2 h-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={typeData}
                cx="50%"
                cy="50%"
                innerRadius={35}
                outerRadius={60}
                paddingAngle={2}
                dataKey="value"
              >
                {typeData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={tooltipStyle}
                labelStyle={tooltipLabelStyle}
                itemStyle={tooltipItemStyle}
                formatter={(value, name) => [`${value} activities`, name]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="w-1/2 pl-2">
          {typeData.length === 0 ? (
            <p className="text-xs text-slate-500">No activities</p>
          ) : (
            typeData.map((type, index) => (
              <div key={type.name} className="flex items-center gap-2 mb-1.5">
                <div
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                />
                <span className="text-xs text-slate-400 truncate flex-1">{type.name}</span>
                <span className="text-xs text-slate-500">
                  {total > 0 ? Math.round((type.value / total) * 100) : 0}%
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </GlassCard>
  );
}

// Weekly Stats Bar Chart - Last 4 weeks comparison
function WeeklyStatsChart({ activities }: { activities: Activity[] }) {
  const weeklyData = useMemo(() => {
    const now = new Date();
    const weeks: { name: string; distance: number; time: number }[] = [];

    for (let i = 3; i >= 0; i--) {
      const weekEnd = new Date(now);
      weekEnd.setDate(now.getDate() - i * 7);
      const weekStart = new Date(weekEnd);
      weekStart.setDate(weekEnd.getDate() - 6);

      const weekActivities = activities.filter((a) => {
        const date = new Date(a.startDate);
        return date >= weekStart && date <= weekEnd;
      });

      const distance = weekActivities.reduce((sum, a) => sum + a.distance, 0) / 1000;
      const time = weekActivities.reduce((sum, a) => sum + a.movingTime, 0) / 3600;

      weeks.push({
        name: i === 0 ? 'This Week' : i === 1 ? 'Last Week' : `${i}w ago`,
        distance: Math.round(distance),
        time: Math.round(time * 10) / 10,
      });
    }

    return weeks;
  }, [activities]);

  return (
    <GlassCard theme="amber" className="p-4 h-full border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
      <h3 className="text-sm font-semibold text-slate-300 mb-3">Weekly Progress</h3>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={weeklyData} barCategoryGap="20%">
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 10 }}
            />
            <YAxis
              yAxisId="left"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 10 }}
              tickFormatter={(v) => `${v}km`}
              width={40}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 10 }}
              tickFormatter={(v) => `${v}h`}
              width={30}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              labelStyle={tooltipLabelStyle}
              itemStyle={tooltipItemStyle}
              cursor={false}
              formatter={(value, name) => [
                name === 'distance' ? `${value} km` : `${value} hrs`,
                name === 'distance' ? 'Distance' : 'Time',
              ]}
            />
            <Legend
              wrapperStyle={{ fontSize: '11px' }}
              formatter={(value) => <span style={{ color: '#94a3b8' }}>{value === 'distance' ? 'Distance' : 'Time'}</span>}
            />
            <Bar yAxisId="left" dataKey="distance" fill={COLORS.amber} radius={[4, 4, 0, 0]} />
            <Bar yAxisId="right" dataKey="time" fill={COLORS.purple} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}

// Main Charts Row Component
export function ChartsRow({ activities }: ChartsRowProps) {
  if (activities.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <DistanceTrendChart activities={activities} />
      <ActivityTypesChart activities={activities} />
      <WeeklyStatsChart activities={activities} />
    </div>
  );
}
