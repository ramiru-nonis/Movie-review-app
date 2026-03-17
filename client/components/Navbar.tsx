'use client';

import Link from 'next/link';

import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Film, LogOut, Search, Heart, Sun, Moon } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <nav className="fixed top-0 inset-x-0 h-20 glass z-50 border-b border-white/5 flex items-center px-6 transition-all">
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-8">
        <Link href="/" className="flex items-center gap-2 group shrink-0" aria-label="CineVault Home">
          <Film className="w-8 h-8 text-primary group-hover:scale-110 transition-transform" />
          <span className="text-2xl font-black tracking-tighter hidden sm:block">CINEVAULT</span>
        </Link>

        <div className="flex-1 max-w-md hidden md:block">
          <form onSubmit={handleSearch} className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Search movies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 outline-none focus:border-primary/50 focus:ring-4 ring-primary/10 transition-all font-medium"
            />
          </form>
        </div>

        <div className="flex items-center gap-4 sm:gap-6">
          <Link href="/watchlist" className="flex items-center gap-2 text-sm font-bold text-foreground/70 hover:text-primary transition-colors" aria-label="View Watchlist">
            <Heart className="w-5 h-5 sm:w-4 sm:h-4" /> 
            <span className="hidden sm:block">Watchlist</span>
          </Link>

          {/* Theme Toggle */}
          <button 
            onClick={toggleTheme}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all active:scale-95 group"
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 text-yellow-500 transition-transform group-hover:rotate-45" />
            ) : (
              <Moon className="w-5 h-5 text-indigo-400 transition-transform group-hover:-rotate-12" />
            )}
          </button>

          <div className="h-6 w-px bg-white/10 hidden sm:block" />

          {user ? (
            <div className="flex items-center gap-4">
              <div className="hidden lg:flex flex-col items-end">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest leading-none mb-1">Explorer</span>
                <span className="text-sm font-bold leading-none">{user.username}</span>
              </div>
              <button
                onClick={logout}
                className="p-2.5 text-foreground/70 hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all"
                aria-label="Logout"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login" className="px-4 py-2 text-sm font-bold hover:text-primary transition-colors hidden sm:block">
                Login
              </Link>
              <Link
                href="/register"
                className="bg-primary text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-bold hover:scale-105 transition-all shadow-lg shadow-primary/20"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
