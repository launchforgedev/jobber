import React, { useState } from 'react';
import {
  LayoutDashboard,
  FileSearch,
  Sparkles,
  HelpCircle,
  Calendar,
  BookOpen,
  Award,
  Terminal,
  Sun,
  Moon,
  LogOut,
  User,
  Menu,
  X,
  Plus
} from 'lucide-react';
import { UserSession } from '../types/prepkit.ts';
import { BrandLogo } from './BrandLogo.tsx';

export type ActiveTab =
  | 'dashboard'
  | 'matcher'
  | 'overview'
  | 'questions'
  | 'schedule'
  | 'practice'
  | 'mock'
  | 'batch';

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
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md transition-colors duration-200">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Lockup */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleTabClick('dashboard')}
            className="flex items-center gap-2.5 text-left focus:outline-hidden group"
          >
            <BrandLogo size={32} />
            <div className="flex items-center gap-2">
              <span className="text-base font-bold tracking-tight text-slate-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                Jobber
              </span>
              <span className="text-[10px] font-mono tracking-wide text-slate-500 dark:text-zinc-400 border border-slate-200 dark:border-zinc-800 px-1.5 py-0.5 rounded-md bg-slate-50 dark:bg-zinc-900 uppercase">
                v2.4
              </span>
            </div>
          </button>
        </div>

        {/* Primary Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 text-xs font-medium">
          <button
            onClick={() => handleTabClick('dashboard')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'dashboard'
                ? 'bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-white font-semibold'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-900'
            }`}
          >
            <LayoutDashboard className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => handleTabClick('matcher')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'matcher'
                ? 'bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-white font-semibold'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-900'
            }`}
          >
            <FileSearch className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Resume Matcher</span>
          </button>

          <div className="h-4 w-px bg-slate-200 dark:border-zinc-800 mx-1" />

          {/* Prep Kit Generator & Tools */}
          <button
            onClick={() => handleTabClick('overview')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'overview'
                ? 'bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-white font-semibold'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-900'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
            <span>Prep Kit Workspace</span>
          </button>

          {hasActiveKit && (
            <>
              <button
                onClick={() => handleTabClick('questions')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors ${
                  activeTab === 'questions'
                    ? 'bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-white font-semibold'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-900'
                }`}
              >
                <HelpCircle className="h-3.5 w-3.5 text-blue-500" />
                <span>Questions</span>
              </button>

              <button
                onClick={() => handleTabClick('schedule')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors ${
                  activeTab === 'schedule'
                    ? 'bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-white font-semibold'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-900'
                }`}
              >
                <Calendar className="h-3.5 w-3.5 text-purple-500" />
                <span>Timeline</span>
              </button>

              <button
                onClick={() => handleTabClick('practice')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors ${
                  activeTab === 'practice'
                    ? 'bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-white font-semibold'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-900'
                }`}
              >
                <BookOpen className="h-3.5 w-3.5 text-amber-500" />
                <span>Flashcards</span>
              </button>

              <button
                onClick={() => handleTabClick('mock')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors ${
                  activeTab === 'mock'
                    ? 'bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-white font-semibold'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-900'
                }`}
              >
                <Award className="h-3.5 w-3.5 text-pink-500" />
                <span>AI Mock</span>
              </button>
            </>
          )}

          <button
            onClick={() => handleTabClick('batch')}
            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition-colors ${
              activeTab === 'batch'
                ? 'bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-white font-semibold'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-900'
            }`}
          >
            <Terminal className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" />
            <span>CLI Batch</span>
          </button>
        </nav>

        {/* Right Section: Theme Toggle, Quick Actions & Auth */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors"
          >
            {theme === 'dark' ? (
              <Sun className="h-3.5 w-3.5 text-amber-400" />
            ) : (
              <Moon className="h-3.5 w-3.5 text-slate-600" />
            )}
          </button>

          {/* Quick Create Kit button */}
          <button
            onClick={onNewKit}
            className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-800 dark:text-zinc-200 px-3 py-1.5 text-xs font-medium shadow-2xs transition-colors"
          >
            <Plus className="h-3.5 w-3.5 text-blue-500" />
            <span>New Prep Kit</span>
          </button>

          {/* User Account / Sign In */}
          {session ? (
            <div className="flex items-center gap-2 border-l border-slate-200 dark:border-zinc-800 pl-2 sm:pl-3">
              <div className="flex items-center gap-1.5 text-xs">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-900/60 font-mono text-blue-600 dark:text-blue-400 text-xs font-semibold">
                  {session.email.charAt(0).toUpperCase()}
                </div>
                <span className="hidden xl:inline text-slate-600 dark:text-zinc-400 max-w-[120px] truncate font-mono text-[11px]">
                  {session.email}
                </span>
              </div>
              <button
                onClick={onLogout}
                title="Sign out"
                className="rounded-lg p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 text-xs font-medium shadow-2xs transition-colors"
            >
              <User className="h-3.5 w-3.5" />
              <span>Sign In</span>
            </button>
          )}

          {/* Mobile Drawer Trigger */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="flex lg:hidden h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-3 space-y-1.5 text-xs">
          <button
            onClick={() => handleTabClick('dashboard')}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-800 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-900"
          >
            <LayoutDashboard className="h-4 w-4 text-blue-500" />
            <span>Analytics Dashboard</span>
          </button>

          <button
            onClick={() => handleTabClick('matcher')}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-800 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-900"
          >
            <FileSearch className="h-4 w-4 text-emerald-500" />
            <span>Resume & JD Matcher</span>
          </button>

          <button
            onClick={() => handleTabClick('overview')}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-800 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-900"
          >
            <Sparkles className="h-4 w-4 text-indigo-500" />
            <span>Prep Kit Workspace</span>
          </button>

          {hasActiveKit && (
            <>
              <button
                onClick={() => handleTabClick('questions')}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-800 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-900"
              >
                <HelpCircle className="h-4 w-4 text-blue-500" />
                <span>Question Bank</span>
              </button>

              <button
                onClick={() => handleTabClick('schedule')}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-800 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-900"
              >
                <Calendar className="h-4 w-4 text-purple-500" />
                <span>Study Timeline</span>
              </button>

              <button
                onClick={() => handleTabClick('practice')}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-800 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-900"
              >
                <BookOpen className="h-4 w-4 text-amber-500" />
                <span>Flashcards</span>
              </button>
            </>
          )}

          <button
            onClick={() => handleTabClick('batch')}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-800 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-900"
          >
            <Terminal className="h-4 w-4 text-cyan-500" />
            <span>Batch CLI Evaluator</span>
          </button>
        </div>
      )}
    </header>
  );
};
