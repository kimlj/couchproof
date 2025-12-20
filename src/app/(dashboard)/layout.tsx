'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import Sidebar from '@/components/layout/Sidebar';
import PageContainer from '@/components/layout/PageContainer';
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton';
import { signOut } from '@/lib/supabase/auth';
import { motion } from 'framer-motion';

type User = {
  name: string;
  email: string;
  avatar?: string;
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  // Prevent browser back/forward swipe gestures on dashboard
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      // If horizontal scroll is dominant, prevent browser navigation
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && Math.abs(e.deltaX) > 10) {
        e.preventDefault();
      }
    };

    // Use passive: false to allow preventDefault
    document.addEventListener('wheel', handleWheel, { passive: false });
    return () => document.removeEventListener('wheel', handleWheel);
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/me');

        if (!response.ok) {
          router.push('/login');
          return;
        }

        const data = await response.json();

        if (data.user) {
          setUser({
            name: data.user.name || data.user.firstName || 'User',
            email: data.user.email,
            avatar: data.user.avatarUrl,
          });
          setIsAuthenticated(true);
        } else {
          router.push('/login');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      router.push('/login');
    }
  };

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleCloseMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Loading state - Show skeleton with activity rings overlay
  if (isLoading) {
    return (
      <div className="min-h-screen relative">
        {/* Activity Rings Overlay */}
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4">
            {/* Activity Rings */}
            <div className="relative w-16 h-16">
              {/* Outer ring - Move (cyan) */}
              <svg className="absolute inset-0 w-16 h-16 -rotate-90">
                <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(6, 182, 212, 0.15)" strokeWidth="5" />
                <motion.circle
                  cx="32" cy="32" r="28" fill="none" stroke="url(#cyan-gradient)" strokeWidth="5" strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: [0, 0.75, 0.75, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                />
              </svg>
              {/* Middle ring - Exercise (pink) */}
              <svg className="absolute inset-0 w-16 h-16 -rotate-90">
                <circle cx="32" cy="32" r="21" fill="none" stroke="rgba(236, 72, 153, 0.15)" strokeWidth="5" />
                <motion.circle
                  cx="32" cy="32" r="21" fill="none" stroke="url(#pink-gradient)" strokeWidth="5" strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: [0, 0.6, 0.6, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 0.15 }}
                />
              </svg>
              {/* Inner ring - Stand (amber) */}
              <svg className="absolute inset-0 w-16 h-16 -rotate-90">
                <circle cx="32" cy="32" r="14" fill="none" stroke="rgba(251, 191, 36, 0.15)" strokeWidth="5" />
                <motion.circle
                  cx="32" cy="32" r="14" fill="none" stroke="url(#amber-gradient)" strokeWidth="5" strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: [0, 0.85, 0.85, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
                />
              </svg>
              {/* Gradient definitions */}
              <svg className="absolute w-0 h-0">
                <defs>
                  <linearGradient id="cyan-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#06b6d4" />
                    <stop offset="100%" stopColor="#22d3ee" />
                  </linearGradient>
                  <linearGradient id="pink-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#ec4899" />
                    <stop offset="100%" stopColor="#f472b6" />
                  </linearGradient>
                  <linearGradient id="amber-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#fbbf24" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            {/* Loading text */}
            <motion.p
              className="text-slate-400 text-sm font-medium"
              initial={{ opacity: 0.5 }}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              Getting your stats...
            </motion.p>
          </div>
        </div>

        {/* Skeleton behind */}
        <main className="lg:ml-64 pt-16 lg:pt-0 pb-16 lg:pb-0 min-h-screen">
          <PageContainer>
            <DashboardSkeleton />
          </PageContainer>
        </main>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return null;
  }

  const currentUser = user || { name: 'User', email: '', avatar: undefined };

  return (
    <div className="min-h-screen">
      {/* Desktop Sidebar */}
      <Sidebar
        user={currentUser}
        onLogout={handleLogout}
        isOpen={isMobileMenuOpen}
        onClose={handleCloseMobileMenu}
      />

      {/* Mobile Header */}
      <Header
        onMobileMenuToggle={handleMobileMenuToggle}
        isMobileMenuOpen={isMobileMenuOpen}
      />

      {/* Main Content */}
      <main className="lg:ml-64 pt-16 lg:pt-0 pb-16 lg:pb-0 min-h-screen">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
