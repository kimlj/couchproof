'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, Activity, Brain, Trophy, Settings, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

interface NavItem {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
}

interface SidebarProps {
  user?: {
    name?: string;
    email?: string;
    avatar?: string;
  };
  onLogout?: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

const navItems: (NavItem & { hoverColor: string; activeColor: string })[] = [
  {
    label: 'Dashboard',
    icon: Home,
    href: '/dashboard',
    hoverColor: 'hover:text-cyan-400',
    activeColor: 'text-cyan-400',
  },
  {
    label: 'Activities',
    icon: Activity,
    href: '/activities',
    hoverColor: 'hover:text-emerald-400',
    activeColor: 'text-emerald-400',
  },
  {
    label: 'Insights',
    icon: Brain,
    href: '/insights',
    hoverColor: 'hover:text-purple-400',
    activeColor: 'text-purple-400',
  },
  {
    label: 'Play',
    icon: Trophy,
    href: '/play',
    hoverColor: 'hover:text-amber-400',
    activeColor: 'text-amber-400',
  },
  {
    label: 'Settings',
    icon: Settings,
    href: '/settings',
    hoverColor: 'hover:text-pink-400',
    activeColor: 'text-pink-400',
  },
];

export default function Sidebar({ user, onLogout, isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={clsx(
        'fixed top-0 left-0 bottom-0 z-50 w-64 transition-transform duration-300',
        'lg:translate-x-0',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        {/* Sidebar background - lighter than main content */}
        <div className="absolute inset-0 bg-slate-900 border-r border-slate-800/50" />

        <div className="relative h-full flex flex-col">
          {/* Logo */}
          <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-800/50">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 via-purple-500 to-pink-500 flex items-center justify-center">
              <span className="text-white font-bold">CP</span>
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Couchproof
            </h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto overflow-x-hidden">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className="relative block"
                >
                  {/* Connected Tab Effect - extends into main content */}
                  <div
                    className={clsx(
                      'flex items-center gap-3 px-4 py-3 transition-all',
                      isActive
                        ? 'bg-slate-950 rounded-l-2xl w-[110%]'
                        : 'rounded-xl w-full',
                      isActive ? item.activeColor : `text-slate-500 ${item.hoverColor}`
                    )}
                  >
                    <Icon className="w-5 h-5 transition-colors" />

                    <span className="font-medium text-sm">
                      {item.label}
                    </span>
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* Logout Button - At Bottom */}
          <div className="p-4 border-t border-slate-800/50">
            <button
              onClick={onLogout}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-slate-500 hover:text-red-400 transition-all cursor-pointer"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium text-sm">Log out</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
