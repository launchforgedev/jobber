import React, { useState, useEffect } from 'react';
import { TopNav, ActiveTab } from './components/TopNav.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { KitCreator } from './components/KitCreator.tsx';
import { CompanyRoleHeader } from './components/CompanyRoleHeader.tsx';
import { QuestionBank } from './components/QuestionBank.tsx';
import { ScheduleView } from './components/ScheduleView.tsx';
import { PracticeFlashcards } from './components/PracticeFlashcards.tsx';
import { MockInterviewStudio } from './components/MockInterviewStudio.tsx';
import { BatchEvaluatorView } from './components/BatchEvaluatorView.tsx';
import { PrintableOnePager } from './components/PrintableOnePager.tsx';
import { PrepKit, UserSession } from './types/prepkit.ts';
import { getActiveSession, logoutUser, getUserKits, saveUserKit } from './services/authStorage.ts';
import { useThemeState } from './services/theme.ts';
import { Printer, Sparkles, BookOpen, Calendar, HelpCircle, Award, Terminal, ArrowRight } from 'lucide-react';
import { BrandLogo } from './components/BrandLogo.tsx';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [session, setSession] = useState<UserSession | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [activeKit, setActiveKit] = useState<PrepKit | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [showPrintView, setShowPrintView] = useState(false);
  const { theme, toggleTheme } = useThemeState();

  // Initialize session and restore user kits
  useEffect(() => {
    const s = getActiveSession();
    setSession(s);
    if (s) {
      const userKits = getUserKits(s.userId);
      if (userKits.length > 0 && !activeKit) {
        setActiveKit(userKits[0].kit);
      }
    }
  }, []);

  const handleSessionChange = (newSession: UserSession) => {
    setSession(newSession);
    const userKits = getUserKits(newSession.userId);
    if (userKits.length > 0) {
      setActiveKit(userKits[0].kit);
    } else if (activeKit) {
      const kitId = `kit_${Date.now()}`;
      saveUserKit(newSession.userId, kitId, activeKit);
    }
  };

  const handleLogout = () => {
    logoutUser();
    setSession(null);
  };

  const handleKitCreated = (newKit: PrepKit) => {
    setActiveKit(newKit);
    setIsCreatingNew(false);
    setActiveTab('overview');

    if (session) {
      const kitId = `kit_${Date.now()}`;
      saveUserKit(session.userId, kitId, newKit);
    }
  };

  const handleUpdateKit = (updated: PrepKit) => {
    setActiveKit(updated);
    if (session) {
      const kitId = `kit_current`;
      saveUserKit(session.userId, kitId, updated);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#070a12] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Bar Contract (3 zones + Dark Mode toggle + Mobile Drawer) */}
      <TopNav
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          setIsCreatingNew(false);
          setShowPrintView(false);
        }}
        session={session}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        onNewKit={() => {
          setIsCreatingNew(true);
          setShowPrintView(false);
        }}
        hasActiveKit={!!activeKit}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Main Viewport Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Auth Modal */}
        <AuthModal
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
          onSessionChange={handleSessionChange}
        />

        {showPrintView && activeKit ? (
          <PrintableOnePager kit={activeKit} onBack={() => setShowPrintView(false)} />
        ) : isCreatingNew || !activeKit ? (
          <KitCreator
            onKitCreated={handleKitCreated}
            onBatchCasesLoaded={(_cases) => {
              setActiveTab('batch');
              setIsCreatingNew(false);
            }}
          />
        ) : (
          <div className="space-y-6">
            {/* View Sub-header / Fast-action toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-white/[0.08]">
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400">
                <span className="text-slate-900 dark:text-white font-semibold">{activeKit.role.title}</span>
                <span>/</span>
                <span className="text-indigo-600 dark:text-indigo-400">{activeKit.source.company_url}</span>
                <span>/</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">{activeKit.schedule.days_available} Days</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowPrintView(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-white/[0.1] bg-white dark:bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.08] transition-colors shadow-xs interactive-hover"
                >
                  <Printer className="h-3.5 w-3.5 text-slate-400" />
                  <span>Executive One-Pager</span>
                </button>

                <button
                  onClick={() => setIsCreatingNew(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-white/[0.1] bg-white dark:bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.08] transition-colors shadow-xs interactive-hover"
                >
                  <span>New Role</span>
                </button>
              </div>
            </div>

            {/* Tab Views with animated transition */}
            <div className="transition-all duration-300 ease-in-out">
              {activeTab === 'overview' && (
                <div className="space-y-8 animate-fade-in">
                  <CompanyRoleHeader kit={activeKit} onUpdateKit={handleUpdateKit} />

                  {/* Prompverse-style Quick Navigation Bento Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div
                      onClick={() => setActiveTab('questions')}
                      className="group cursor-pointer rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#0d111c] p-5 hover-glow transition-all duration-200 shadow-sm dark:shadow-none"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <HelpCircle className="h-5 w-5 text-emerald-500" />
                        <span className="font-mono text-xs text-slate-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors flex items-center gap-1">
                          View <ArrowRight className="h-3 w-3" />
                        </span>
                      </div>
                      <div className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
                        {activeKit.questions.length}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Questions & Rubrics
                      </div>
                    </div>

                    <div
                      onClick={() => setActiveTab('schedule')}
                      className="group cursor-pointer rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#0d111c] p-5 hover-glow transition-all duration-200 shadow-sm dark:shadow-none"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Calendar className="h-5 w-5 text-blue-500" />
                        <span className="font-mono text-xs text-slate-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors flex items-center gap-1">
                          View <ArrowRight className="h-3 w-3" />
                        </span>
                      </div>
                      <div className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
                        {activeKit.schedule.days_available} Days
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Deterministic Daily Plan
                      </div>
                    </div>

                    <div
                      onClick={() => setActiveTab('practice')}
                      className="group cursor-pointer rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#0d111c] p-5 hover-glow transition-all duration-200 shadow-sm dark:shadow-none"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <BookOpen className="h-5 w-5 text-amber-500" />
                        <span className="font-mono text-xs text-slate-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors flex items-center gap-1">
                          View <ArrowRight className="h-3 w-3" />
                        </span>
                      </div>
                      <div className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
                        {activeKit.flashcards.length} Cards
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Spaced-Repetition Deck
                      </div>
                    </div>

                    <div
                      onClick={() => setActiveTab('mock')}
                      className="group cursor-pointer rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#0d111c] p-5 hover-glow transition-all duration-200 shadow-sm dark:shadow-none"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Award className="h-5 w-5 text-purple-500" />
                        <span className="font-mono text-xs text-slate-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors flex items-center gap-1">
                          View <ArrowRight className="h-3 w-3" />
                        </span>
                      </div>
                      <div className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
                        AI Studio
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Voice/Text & Radar Audit
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'questions' && (
                <QuestionBank kit={activeKit} onUpdateKit={handleUpdateKit} />
              )}

              {activeTab === 'schedule' && (
                <ScheduleView kit={activeKit} onUpdateKit={handleUpdateKit} />
              )}

              {activeTab === 'practice' && (
                <PracticeFlashcards kit={activeKit} />
              )}

              {activeTab === 'mock' && (
                <MockInterviewStudio kit={activeKit} />
              )}

              {activeTab === 'batch' && (
                <BatchEvaluatorView onLoadKitToWorkspace={(k) => {
                  setActiveKit(k);
                  setActiveTab('overview');
                }} />
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer strictly adhering to professional design principles */}
      <footer className="border-t border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#070a12] py-6 text-xs text-slate-500 dark:text-slate-400 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <BrandLogo size={22} />
            <span className="font-semibold text-slate-800 dark:text-slate-200">Jobber AI</span>
            <span>·</span>
            <span>Deterministic Interview Preparation Platform</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-mono">
            <span>Deterministic Specification FS-AI-01</span>
            <span>·</span>
            <span>Batch CLI: <code className="text-slate-800 dark:text-slate-300">npm run evaluate</code></span>
          </div>
        </div>
      </footer>
    </div>
  );
}
