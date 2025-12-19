'use client';

import { Menu, X } from 'lucide-react';

interface HeaderProps {
  onMobileMenuToggle?: () => void;
  isMobileMenuOpen?: boolean;
}

export default function Header({
  onMobileMenuToggle,
  isMobileMenuOpen = false
}: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 lg:hidden bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50">
      <div className="px-4 h-16 flex items-center gap-4">
        {/* Mobile Menu Toggle */}
        <button
          onClick={onMobileMenuToggle}
          className="p-2 rounded-lg hover:bg-slate-800/50 transition-colors"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? (
            <X className="w-5 h-5 text-slate-300" />
          ) : (
            <Menu className="w-5 h-5 text-slate-300" />
          )}
        </button>

        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 via-purple-500 to-pink-500 flex items-center justify-center">
            <span className="text-white font-bold text-sm">CP</span>
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 bg-clip-text text-transparent hidden sm:block">
            Couchproof
          </h1>
        </div>
      </div>
    </header>
  );
}
