import React, { useState, useEffect } from 'react';
import { TopNav, ActiveTab } from './components/TopNav.tsx';
import { AuthScreen } from './components/AuthScreen.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { DashboardAnalytics } from './components/DashboardAnalytics.tsx';
import { ResumeMatcher } from './components/ResumeMatcher.tsx';
import { KitCreator } from './components/KitCreator.tsx';
import { CompanyRoleHeader } from './components/CompanyRoleHeader.tsx';
import { QuestionBank } from './components/QuestionBank.tsx';
import { ScheduleView } from './components/ScheduleView.tsx';
import { PracticeFlashcards } from './components/PracticeFlashcards.tsx';
import { MockInterviewStudio } from './components/MockInterviewStudio.tsx';
import { BatchEvaluatorView } from './components/BatchEvaluatorView.tsx';
import { PrintableOnePager } from './components/PrintableOnePager.tsx';
import { PrepKit, UserSession, BatchInputCase } from './types/prepkit.ts';
import { getActiveSession, logoutUser, getUserKits, saveUserKit } from './services/authStorage.ts';
import { useThemeState } from './services/theme.ts';
import { Printer, HelpCircle, Calendar, BookOpen, Award, ArrowRight } from 'lucide-react';
import { BrandLogo } from './components/BrandLogo.tsx';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [session, setSession] = useState<UserSession | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [activeKit, setActiveKit] = useState<PrepKit | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [showPrintView, setShowPrintView] = useState(false);
  const [preseededJd, setPreseededJd] = useState<string | undefined>(undefined);
  const [preseededCompanyUrl, setPreseededCompanyUrl] = useState<string | undefined>(undefined);
  const [batchCases, setBatchCases] = useState<BatchInputCase[] | undefined>(undefined);
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

  const handleAuthenticated = (newSession: UserSession) => {
    setSession(newSession);
    setActiveTab('dashboard');
    const userKits = getUserKits(newSession.userId);
    if (userKits.length > 0) {
      setActiveKit(userKits[0].kit);
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

  const handleLaunchPrepKitFromMatcher = (jd: string, companyUrl: string) => {
    setPreseededJd(jd);
    setPreseededCompanyUrl(companyUrl);
    setIsCreatingNew(true);
    setActiveTab('overview');
    setShowPrintView(false);
  };

  // Step 1: When user is not authenticated, show enterprise AuthScreen
  if (!session) {
    return <AuthScreen onAuthenticated={handleAuthenticated} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Bar Navigation */}
      <TopNav
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          setIsCreatingNew(false);
          setShowPrintView(false);
        }}
        session={session}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
        onNewKit={() => {
          setIsCreatingNew(true);
          setPreseededJd(undefined);
          setPreseededCompanyUrl(undefined);
          setActiveTab('overview');
          setShowPrintView(false);
        }}
        hasActiveKit={!!activeKit}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onSessionChange={handleAuthenticated}
        />

        {/* STEP 2: Dashboard Analytics & Interactive Charts */}
        {activeTab === 'dashboard' && (
          <DashboardAnalytics
            session={session}
            onOpenKit={(kit) => {
              setActiveKit(kit);
              setActiveTab('overview');
            }}
            onNavigateToGenerator={(initialJd, initialCompanyUrl) => {
              setPreseededJd(initialJd);
              setPreseededCompanyUrl(initialCompanyUrl);
              setIsCreatingNew(true);
              setActiveTab('overview');
            }}
            onNavigateToBatch={(loadedCases) => {
              if (loadedCases) {
                setBatchCases(loadedCases);
              }
              setActiveTab('batch');
            }}
            onLogout={handleLogout}
            onSessionExpired={() => {
              logoutUser();
              setSession(null);
            }}
          />
        )}

        {/* STEP 3: Resume & Job Description Matcher Module */}
        {activeTab === 'matcher' && (
          <ResumeMatcher
            onLaunchPrepKitWithJd={handleLaunchPrepKitFromMatcher}
          />
        )}

        {/* Assessment Kit & Tools Views */}
        {activeTab !== 'dashboard' && activeTab !== 'matcher' && (
          <>
            {showPrintView && activeKit ? (
              <PrintableOnePager kit={activeKit} onBack={() => setShowPrintView(false)} />
            ) : isCreatingNew || !activeKit ? (
              <KitCreator
                initialJd={preseededJd}
                initialCompanyUrl={preseededCompanyUrl}
                onKitCreated={handleKitCreated}
                onBatchCasesLoaded={(_cases) => {
                  setActiveTab('batch');
                  setIsCreatingNew(false);
                }}
              />
            ) : (
              <div className="space-y-6">
                {/* Fast Action Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-zinc-800">
                  <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-500 dark:text-zinc-400">
                    <span className="text-slate-900 dark:text-zinc-100 font-semibold">{activeKit.role.title}</span>
                    <span>/</span>
                    <span className="text-blue-600 dark:text-blue-400">{activeKit.source.company_url}</span>
                    <span>/</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">{activeKit.schedule.days_available} Days</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowPrintView(true)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors shadow-2xs"
                    >
                      <Printer className="h-3.5 w-3.5 text-slate-400" />
                      <span>Print One-Pager</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsCreatingNew(true);
                        setPreseededJd(undefined);
                        setPreseededCompanyUrl(undefined);
                      }}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors shadow-2xs"
                    >
                      <span>New Role</span>
                    </button>
                  </div>
                </div>

                {/* Sub Tab Views */}
                <div>
                  {activeTab === 'overview' && (
                    <div className="space-y-8 animate-fade-in">
                      <CompanyRoleHeader kit={activeKit} onUpdateKit={handleUpdateKit} />

                      {/* Quick Navigation Cards */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div
                          onClick={() => setActiveTab('questions')}
                          className="cursor-pointer rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 hover:border-blue-500 transition-colors shadow-xs"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <HelpCircle className="h-5 w-5 text-emerald-500" />
                            <span className="font-mono text-xs text-slate-400 hover:text-blue-500 flex items-center gap-1">
                              View <ArrowRight className="h-3 w-3" />
                            </span>
                          </div>
                          <div className="text-2xl font-bold text-slate-900 dark:text-zinc-100 tabular-nums">
                            {activeKit.questions.length}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                            Questions & Rubrics
                          </div>
                        </div>

                        <div
                          onClick={() => setActiveTab('schedule')}
                          className="cursor-pointer rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 hover:border-blue-500 transition-colors shadow-xs"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <Calendar className="h-5 w-5 text-blue-500" />
                            <span className="font-mono text-xs text-slate-400 hover:text-blue-500 flex items-center gap-1">
                              View <ArrowRight className="h-3 w-3" />
                            </span>
                          </div>
                          <div className="text-2xl font-bold text-slate-900 dark:text-zinc-100 tabular-nums">
                            {activeKit.schedule.days_available} Days
                          </div>
                          <div className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                            Deterministic Daily Plan
                          </div>
                        </div>

                        <div
                          onClick={() => setActiveTab('practice')}
                          className="cursor-pointer rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 hover:border-blue-500 transition-colors shadow-xs"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <BookOpen className="h-5 w-5 text-amber-500" />
                            <span className="font-mono text-xs text-slate-400 hover:text-blue-500 flex items-center gap-1">
                              View <ArrowRight className="h-3 w-3" />
                            </span>
                          </div>
                          <div className="text-2xl font-bold text-slate-900 dark:text-zinc-100 tabular-nums">
                            {activeKit.flashcards.length} Cards
                          </div>
                          <div className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                            Spaced-Repetition Deck
                          </div>
                        </div>

                        <div
                          onClick={() => setActiveTab('mock')}
                          className="cursor-pointer rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 hover:border-blue-500 transition-colors shadow-xs"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <Award className="h-5 w-5 text-purple-500" />
                            <span className="font-mono text-xs text-slate-400 hover:text-blue-500 flex items-center gap-1">
                              View <ArrowRight className="h-3 w-3" />
                            </span>
                          </div>
                          <div className="text-2xl font-bold text-slate-900 dark:text-zinc-100 tabular-nums">
                            AI Studio
                          </div>
                          <div className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
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
                    <BatchEvaluatorView
                      initialCases={batchCases}
                      onLoadKitToWorkspace={(k) => {
                        setActiveKit(k);
                        if (session) {
                          const kitId = `kit_${Date.now()}`;
                          saveUserKit(session.userId, kitId, k);
                        }
                        setActiveTab('overview');
                      }}
                    />
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Clean SaaS Footer */}
      <footer className="border-t border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 py-5 text-xs text-slate-500 dark:text-zinc-400 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <BrandLogo size={20} />
            <span className="font-semibold text-slate-800 dark:text-zinc-200">Jobber</span>
            <span>·</span>
            <span>Deterministic AI Interview Intelligence & Compatibility Platform</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-mono">
            <span>Appendix A & B Standard</span>
            <span>·</span>
            <span>CLI Batch: <code className="text-slate-800 dark:text-zinc-300">npm run evaluate</code></span>
          </div>
        </div>
      </footer>
    </div>
  );
}
