import React, { useState } from 'react';
import {
  Sparkles, BookOpen, Calendar, HelpCircle, User, LogOut, Terminal,
  Award, Sun, Moon, Menu, X, ChevronRight, Plus
} from 'lucide-react';
import { UserSession } from '../types/prepkit.ts';
import { BrandLogo } from './BrandLogo.tsx';

export type ActiveTab = 'overview' | 'questions' | 'schedule' | 'practice' | 'mock' | 'batch';

interface TopNavProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  session: UserSession | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  onNewKit: () => void;
  hasActiveKit: boolean;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  activeTab,
  onSelectTab,
  session,
  onOpenAuth,
  onLogout,
  onNewKit,
  hasActiveKit,
  theme,
  onToggleTheme
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleTabClick = (tab: ActiveTab) => {
    onSelectTab(tab);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-white/[0.08] bg-white/90 dark:bg-[#070a12]/90 backdrop-blur-xl transition-colors duration-200">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Brand Wordmark (Strict Top Bar Contract: clean single text lockup) */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleTabClick('overview')}
            className="flex items-center gap-2.5 text-left focus:outline-none group interactive-hover"
          >
            <BrandLogo size={32} />
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                Jobber
              </span>
              <span className="text-[10px] font-mono tracking-wide text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-1.5 py-0.5 rounded border border-indigo-200 dark:border-indigo-800/60">
                AI
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 text-sm font-medium">
          <button
            onClick={() => handleTabClick('overview')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-200 ${
              activeTab === 'overview'
                ? 'bg-slate-100 dark:bg-white/[0.08] text-indigo-600 dark:text-white font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/[0.04]'
            }`}
          >
            <Sparkles className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
            <span className="whitespace-nowrap">Workspace</span>
          </button>

          {hasActiveKit && (
            <>
              <button
                onClick={() => handleTabClick('questions')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-200 ${
                  activeTab === 'questions'
                    ? 'bg-slate-100 dark:bg-white/[0.08] text-emerald-600 dark:text-white font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/[0.04]'
                }`}
              >
                <HelpCircle className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
                <span className="whitespace-nowrap">Question Bank</span>
              </button>

              <button
                onClick={() => handleTabClick('schedule')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-200 ${
                  activeTab === 'schedule'
                    ? 'bg-slate-100 dark:bg-white/[0.08] text-blue-600 dark:text-white font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/[0.04]'
                }`}
              >
                <Calendar className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                <span className="whitespace-nowrap">Timeline</span>
              </button>

              <button
                onClick={() => handleTabClick('practice')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-200 ${
                  activeTab === 'practice'
                    ? 'bg-slate-100 dark:bg-white/[0.08] text-amber-600 dark:text-white font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/[0.04]'
                }`}
              >
                <BookOpen className="h-4 w-4 text-amber-500 dark:text-amber-400" />
                <span className="whitespace-nowrap">Flashcards</span>
              </button>

              <button
                onClick={() => handleTabClick('mock')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-200 ${
                  activeTab === 'mock'
                    ? 'bg-slate-100 dark:bg-white/[0.08] text-purple-600 dark:text-white font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/[0.04]'
                }`}
              >
                <Award className="h-4 w-4 text-purple-500 dark:text-purple-400" />
                <span className="whitespace-nowrap">AI Mock Studio</span>
              </button>
            </>
          )}

          <button
            onClick={() => handleTabClick('batch')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-200 ${
              activeTab === 'batch'
                ? 'bg-slate-100 dark:bg-white/[0.08] text-cyan-600 dark:text-white font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/[0.04]'
            }`}
          >
            <Terminal className="h-4 w-4 text-cyan-500 dark:text-cyan-400" />
            <span className="whitespace-nowrap">Batch Evaluator</span>
          </button>
        </nav>

        {/* Zone 3: Actions, Theme Toggle & Account */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Dark Mode Toggle */}
          <button
            onClick={onToggleTheme}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-100/80 dark:bg-white/[0.05] text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/[0.1] transition-all duration-200 active:scale-95"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4 text-amber-400 rotate-0 transition-transform duration-300" />
            ) : (
              <Moon className="h-4 w-4 text-indigo-600 rotate-0 transition-transform duration-300" />
            )}
          </button>

          {/* New Prep Kit Action Button (Prompverse Minimal Accent) */}
          <button
            onClick={onNewKit}
            className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white px-3.5 py-2 text-xs font-semibold shadow-md shadow-indigo-600/25 transition-all duration-200 active:scale-95 whitespace-nowrap"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Generate Kit</span>
          </button>

          {/* User Account / Sign in */}
          {session ? (
            <div className="flex items-center gap-2 border-l border-slate-200 dark:border-white/[0.08] pl-2 sm:pl-3">
              <div className="flex items-center gap-2 text-xs">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 font-mono text-indigo-600 dark:text-indigo-400 text-xs font-bold border border-indigo-500/30">
                  {session.email.charAt(0).toUpperCase()}
                </div>
                <span className="hidden xl:inline text-slate-600 dark:text-slate-400 max-w-[120px] truncate font-mono text-[11px]">
                  {session.email}
                </span>
              </div>
              <button
                onClick={onLogout}
                title="Sign out"
                className="rounded-lg p-1.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.06] hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-white/[0.1] bg-white dark:bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/[0.08] transition-colors whitespace-nowrap"
            >
              <User className="h-3.5 w-3.5" />
              <span>Sign In</span>
            </button>
          )}

          {/* Mobile Hamburger Toggle Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="flex lg:hidden h-9 w-9 items-center justify-center rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-100/80 dark:bg-white/[0.05] text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/[0.1] transition-colors"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-200 dark:border-white/[0.08] bg-white/95 dark:bg-[#070a12]/95 backdrop-blur-xl px-4 py-4 space-y-2 animate-fade-in shadow-2xl">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-white/[0.06]">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Navigation</span>
            <button
              onClick={onNewKit}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400"
            >
              + Generate Kit
            </button>
          </div>

          <button
            onClick={() => handleTabClick('overview')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-colors ${
              activeTab === 'overview'
                ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-300 font-semibold'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.04]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Sparkles className="h-4 w-4 text-indigo-500" />
              <span>Workspace</span>
            </div>
            <ChevronRight className="h-4 w-4 opacity-50" />
          </button>

          {hasActiveKit && (
            <>
              <button
                onClick={() => handleTabClick('questions')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-colors ${
                  activeTab === 'questions'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-300 font-semibold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <HelpCircle className="h-4 w-4 text-emerald-500" />
                  <span>Question Bank</span>
                </div>
                <ChevronRight className="h-4 w-4 opacity-50" />
              </button>

              <button
                onClick={() => handleTabClick('schedule')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-colors ${
                  activeTab === 'schedule'
                    ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300 font-semibold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Calendar className="h-4 w-4 text-blue-500" />
                  <span>Timeline</span>
                </div>
                <ChevronRight className="h-4 w-4 opacity-50" />
              </button>

              <button
                onClick={() => handleTabClick('practice')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-colors ${
                  activeTab === 'practice'
                    ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-300 font-semibold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <BookOpen className="h-4 w-4 text-amber-500" />
                  <span>Flashcards</span>
                </div>
                <ChevronRight className="h-4 w-4 opacity-50" />
              </button>

              <button
                onClick={() => handleTabClick('mock')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-colors ${
                  activeTab === 'mock'
                    ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-300 font-semibold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Award className="h-4 w-4 text-purple-500" />
                  <span>AI Mock Studio</span>
                </div>
                <ChevronRight className="h-4 w-4 opacity-50" />
              </button>
            </>
          )}

          <button
            onClick={() => handleTabClick('batch')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-colors ${
              activeTab === 'batch'
                ? 'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-300 font-semibold'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.04]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Terminal className="h-4 w-4 text-cyan-500" />
              <span>Batch Evaluator</span>
            </div>
            <ChevronRight className="h-4 w-4 opacity-50" />
          </button>
        </div>
      )}
    </header>
  );
};
