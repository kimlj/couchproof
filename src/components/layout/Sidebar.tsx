'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, Activity, Brain, Trophy, Settings, User, LogOut } from 'lucide-react';
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

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    icon: Home,
    href: '/dashboard',
  },
  {
    label: 'Activities',
    icon: Activity,
    href: '/activities',
  },
  {
    label: 'Insights',
    icon: Brain,
    href: '/insights',
  },
  {
    label: 'Play',
    icon: Trophy,
    href: '/play',
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
        {/* Glass morphism background */}
        <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-xl border-r border-slate-700/50" />

        <div className="relative h-full flex flex-col">
          {/* Logo */}
          <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-700/50">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 via-purple-500 to-pink-500 flex items-center justify-center">
              <span className="text-white font-bold">CP</span>
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Couchproof
            </h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={clsx(
                    'relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all group',
                    isActive
                      ? 'text-white bg-slate-800/50'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/30'
                  )}
                >
                  {/* Active Indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="sidebarActiveIndicator"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-cyan-500 via-purple-500 to-pink-500 rounded-r-full"
                      transition={{
                        type: 'spring',
                        stiffness: 500,
                        damping: 30,
                      }}
                    />
                  )}

                  <Icon className={clsx(
                    'w-5 h-5 transition-colors',
                    isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-300'
                  )} />

                  <span className="font-medium">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* Bottom Section */}
          <div className="border-t border-slate-700/50">
            {/* Settings Link */}
            <Link
              href="/settings"
              onClick={onClose}
              className={clsx(
                'flex items-center gap-3 px-6 py-3 text-slate-400 hover:text-white hover:bg-slate-800/30 transition-all group',
                pathname?.startsWith('/settings') && 'text-white bg-slate-800/50'
              )}
            >
              <Settings className="w-5 h-5" />
              <span className="font-medium">Settings</span>
            </Link>

            {/* User Profile */}
            {user && (
              <div className="p-4">
                <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-slate-800/30">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name || 'User'}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-5 h-5 text-white" />
                    )}
                  </div>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {user.name || 'User'}
                    </p>
                    <p className="text-xs text-slate-400 truncate">
                      {user.email}
                    </p>
                  </div>

                  {/* Logout Button */}
                  <button
                    onClick={onLogout}
                    className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                    title="Log out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
