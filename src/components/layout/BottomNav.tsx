'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, Activity, Brain, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

interface NavItem {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    icon: Home,
    href: '/dashboard',
  },
  {
    label: 'Activities',
    icon: Activity,
    href: '/dashboard/activities',
  },
  {
    label: 'Insights',
    icon: Brain,
    href: '/dashboard/insights',
  },
  {
    label: 'Play',
    icon: Trophy,
    href: '/dashboard/play',
  },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 pb-safe">
      {/* Glass morphism background */}
      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-xl border-t border-slate-700/50" />

      {/* Navigation Items */}
      <div className="relative grid grid-cols-4 h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex flex-col items-center justify-center gap-1 group"
            >
              {/* Active Indicator */}
              {isActive && (
                <motion.div
                  layoutId="bottomNavActiveIndicator"
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-full"
                  transition={{
                    type: 'spring',
                    stiffness: 500,
                    damping: 30,
                  }}
                />
              )}

              {/* Icon */}
              <div className={clsx(
                'relative transition-transform duration-200',
                isActive ? 'scale-110' : 'group-hover:scale-105'
              )}>
                <Icon className={clsx(
                  'w-5 h-5 transition-colors',
                  isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-300'
                )} />
              </div>

              {/* Label */}
              <span className={clsx(
                'text-[10px] font-medium transition-colors',
                isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-300'
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
