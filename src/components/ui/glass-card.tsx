import { cn } from '@/lib/utils';

type ColorTheme = 'blue' | 'emerald' | 'pink' | 'orange' | 'purple' | 'cyan' | 'amber' | 'red' | 'green' | 'slate';

const themeStyles: Record<ColorTheme, { bg: string; border: string; shadow: string }> = {
  blue: {
    bg: 'from-blue-500/5 to-slate-900/50',
    border: 'border-blue-500/20',
    shadow: 'shadow-blue-500/5',
  },
  emerald: {
    bg: 'from-emerald-500/5 to-slate-900/50',
    border: 'border-emerald-500/20',
    shadow: 'shadow-emerald-500/5',
  },
  pink: {
    bg: 'from-pink-500/5 to-slate-900/50',
    border: 'border-pink-500/20',
    shadow: 'shadow-pink-500/5',
  },
  orange: {
    bg: 'from-orange-500/5 to-slate-900/50',
    border: 'border-orange-500/20',
    shadow: 'shadow-orange-500/5',
  },
  purple: {
    bg: 'from-purple-500/5 to-slate-900/50',
    border: 'border-purple-500/20',
    shadow: 'shadow-purple-500/5',
  },
  cyan: {
    bg: 'from-cyan-500/5 to-slate-900/50',
    border: 'border-cyan-500/20',
    shadow: 'shadow-cyan-500/5',
  },
  amber: {
    bg: 'from-amber-500/5 to-slate-900/50',
    border: 'border-amber-500/20',
    shadow: 'shadow-amber-500/5',
  },
  red: {
    bg: 'from-red-500/5 to-slate-900/50',
    border: 'border-red-500/20',
    shadow: 'shadow-red-500/5',
  },
  green: {
    bg: 'from-green-500/5 to-slate-900/50',
    border: 'border-green-500/20',
    shadow: 'shadow-green-500/5',
  },
  slate: {
    bg: 'from-slate-700/5 to-slate-900/50',
    border: 'border-slate-700/20',
    shadow: 'shadow-slate-700/5',
  },
};

interface GlassCardProps {
  children: React.ReactNode;
  theme?: ColorTheme;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export function GlassCard({
  children,
  theme = 'slate',
  className,
  hover = false,
  onClick,
}: GlassCardProps) {
  const styles = themeStyles[theme];

  return (
    <div
      onClick={onClick}
      className={cn(
        'rounded-xl p-4',
        'bg-gradient-to-br',
        styles.bg,
        'border',
        styles.border,
        'shadow-sm',
        styles.shadow,
        hover && 'cursor-pointer transition-all hover:scale-[1.01]',
        onClick && 'cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  );
}

// Icon container with matching theme
interface GlassIconProps {
  children: React.ReactNode;
  theme?: ColorTheme;
  className?: string;
}

const iconThemeStyles: Record<ColorTheme, string> = {
  blue: 'from-blue-500/15 to-cyan-500/10 text-blue-400',
  emerald: 'from-emerald-500/15 to-green-500/10 text-emerald-400',
  pink: 'from-pink-500/15 to-purple-500/10 text-pink-400',
  orange: 'from-orange-500/15 to-amber-500/10 text-orange-400',
  purple: 'from-purple-500/15 to-pink-500/10 text-purple-400',
  cyan: 'from-cyan-500/15 to-blue-500/10 text-cyan-400',
  amber: 'from-amber-500/15 to-yellow-500/10 text-amber-400',
  red: 'from-red-500/15 to-orange-500/10 text-red-400',
  green: 'from-green-500/15 to-emerald-500/10 text-green-400',
  slate: 'from-slate-500/15 to-slate-700/10 text-slate-400',
};

export function GlassIcon({ children, theme = 'slate', className }: GlassIconProps) {
  return (
    <div
      className={cn(
        'inline-flex p-2.5 rounded-lg bg-gradient-to-br',
        iconThemeStyles[theme],
        className
      )}
    >
      {children}
    </div>
  );
}
