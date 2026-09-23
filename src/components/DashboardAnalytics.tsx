import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import {
  ArrowRight,
  ShieldCheck,
  Building2,
  Calendar,
  Sparkles,
  Upload,
  BookOpen,
  HelpCircle,
  Trash2,
  ExternalLink,
  Layers,
  Clock,
  LogOut,
  FolderOpen
} from 'lucide-react';
import { UserSession, PrepKit, BatchInputCase } from '../types/prepkit.ts';
import { getUserKits, deleteUserKit, getActiveSession } from '../services/authStorage.ts';

interface DashboardAnalyticsProps {
  session: UserSession;
  onOpenKit: (kit: PrepKit) => void;
  onNavigateToGenerator: (initialJd?: string, initialCompanyUrl?: string) => void;
  onNavigateToBatch: (loadedCases?: BatchInputCase[]) => void;
  onLogout: () => void;
  onSessionExpired: () => void;
}

export const DashboardAnalytics: React.FC<DashboardAnalyticsProps> = ({
  session,
  onOpenKit,
  onNavigateToGenerator,
  onNavigateToBatch,
  onLogout,
  onSessionExpired
}) => {
  const [userKits, setUserKits] = useState<Array<{ id: string; kit: PrepKit; savedAt: string }>>([]);
  const [batchUploadError, setBatchUploadError] = useState<string | null>(null);

  // Validate session and load user's isolated kits
  const refreshUserKits = () => {
    const currentSession = getActiveSession();
    if (!currentSession || currentSession.userId !== session.userId) {
      onSessionExpired();
      return;
    }
    const kits = getUserKits(session.userId);
    setUserKits(kits);
  };

  useEffect(() => {
    refreshUserKits();
  }, [session.userId]);

  const handleDeleteKit = (kitId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this prep kit? This cannot be undone.')) {
      deleteUserKit(session.userId, kitId);
      refreshUserKits();
    }
  };

  // Handle batch file upload (description-and-company pairs)
  const handleBatchFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBatchUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);

        if (!Array.isArray(parsed) || parsed.length === 0) {
          setBatchUploadError('File must contain a non-empty JSON array of role cases.');
          return;
        }

        // Validate structure
        const validatedCases: BatchInputCase[] = parsed.map((item, idx) => {
          if (!item.jd || typeof item.jd !== 'string') {
            throw new Error(`Item #${idx + 1} is missing a required "jd" string property.`);
          }
          if (!item.company_url || typeof item.company_url !== 'string') {
            throw new Error(`Item #${idx + 1} is missing a required "company_url" string property.`);
          }
          const days = typeof item.days === 'number' && Number.isInteger(item.days) && item.days > 0 ? item.days : 5;
          return {
            id: item.id || `case-${String(idx + 1).padStart(2, '0')}`,
            jd: item.jd,
            company_url: item.company_url,
            days
          };
        });

        // Navigate to batch evaluator with loaded cases
        onNavigateToBatch(validatedCases);
      } catch (err: any) {
        setBatchUploadError(err.message || 'Invalid JSON format. Expected: [{ "jd": "...", "company_url": "...", "days": 5 }]');
      }
    };
    reader.readAsText(file);
  };

  // Compute REAL metrics from the user's actual kits (NO fake dummy numbers)
  const totalKitsCount = userKits.length;
  let totalQuestionsCount = 0;
  let totalFlashcardsCount = 0;
  let totalMustHavesCount = 0;
  let totalUncoveredMustHaves = 0;

  const categoryCounts: Record<string, number> = {
    technical: 0,
    'system-design': 0,
    behavioural: 0,
    'company-fit': 0
  };

  const difficultyCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0 };

  userKits.forEach(({ kit }) => {
    if (kit?.questions) {
      totalQuestionsCount += kit.questions.length;
      kit.questions.forEach(q => {
        if (categoryCounts[q.category] !== undefined) {
          categoryCounts[q.category]++;
        }
        if (q.difficulty && difficultyCounts[q.difficulty] !== undefined) {
          difficultyCounts[q.difficulty]++;
        }
      });
    }

    if (kit?.flashcards) {
      totalFlashcardsCount += kit.flashcards.length;
    }

    if (kit?.role?.requirements) {
      const mustHaves = kit.role.requirements.filter(r => r.priority === 'must');
      totalMustHavesCount += mustHaves.length;
    }

    if (kit?.coverage?.uncovered_requirement_ids) {
      totalUncoveredMustHaves += kit.coverage.uncovered_requirement_ids.length;
    }
  });

  const overallCoverageRate = totalMustHavesCount > 0
    ? Math.round(((totalMustHavesCount - totalUncoveredMustHaves) / totalMustHavesCount) * 100)
    : 100;

  // Real data for charts (calculated strictly from user's kits)
  const realCategoryChartData = [
    { name: 'Technical', count: categoryCounts['technical'], fill: '#2563EB' },
    { name: 'System Design', count: categoryCounts['system-design'], fill: '#4F46E5' },
    { name: 'Behavioural', count: categoryCounts['behavioural'], fill: '#059669' },
    { name: 'Company Fit', count: categoryCounts['company-fit'], fill: '#D97706' }
  ];

  const realDifficultyChartData = [
    { level: 'Level 1 (Foundational)', count: difficultyCounts[1], fill: '#10B981' },
    { level: 'Level 2 (Applied / Senior)', count: difficultyCounts[2], fill: '#3B82F6' },
    { level: 'Level 3 (Hard / Architecture)', count: difficultyCounts[3], fill: '#8B5CF6' }
  ];

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      {/* Session Security & User Header Bar */}
      <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-xs font-mono font-medium text-slate-500 dark:text-zinc-400">
                Active Authenticated Session
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300">
                User ID: {session.userId}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-100">
              {session.email}
            </h1>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Only your generated kits are visible in this workspace. Session isolated in secure storage.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigateToGenerator()}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 text-xs font-semibold shadow-xs transition-colors"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Create New Prep Kit</span>
            </button>

            <button
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3.5 py-2.5 text-xs font-medium text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors shadow-2xs"
            >
              <LogOut className="h-3.5 w-3.5 text-slate-400" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Real Session Metadata telemetry */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800/80 flex flex-wrap items-center gap-4 text-[11px] font-mono text-slate-500 dark:text-zinc-400">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> Token: {session.token.slice(0, 14)}••••
          </span>
          <span>·</span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-slate-400" /> Session Expiration: 24 Hours from login
          </span>
          <span>·</span>
          <span>Isolation Scope: <code className="text-slate-700 dark:text-zinc-300 font-semibold">{`jobber_kits_${session.userId}`}</code></span>
        </div>
      </div>

      {/* Batch Preparation Shortcut (Multiple roles at once) */}
      <div className="rounded-2xl border border-dashed border-slate-300 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-900/40 p-5 sm:p-6 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Upload className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <h2 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                Prepare for Multiple Roles at Once
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Upload a JSON file of description-and-company pairs to run pipeline research across multiple positions simultaneously.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <label className="cursor-pointer inline-flex items-center gap-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 px-4 py-2 text-xs font-medium text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800 shadow-2xs transition-colors">
              <Upload className="h-3.5 w-3.5 text-blue-500" />
              <span>Select Pairs JSON File</span>
              <input
                type="file"
                accept=".json"
                onChange={handleBatchFileUpload}
                className="hidden"
              />
            </label>

            <button
              onClick={() => onNavigateToBatch()}
              className="inline-flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              <span>Batch CLI View</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </div>

        {batchUploadError && (
          <div className="mt-3 p-3 rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950/30 text-xs text-red-700 dark:text-red-300">
            {batchUploadError}
          </div>
        )}
      </div>

      {/* REAL METRICS SUMMARY (NO FAKE / DUMMY DATA) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 mb-1">
            <span>Your Active Kits</span>
            <Building2 className="h-4 w-4 text-blue-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-zinc-100 tabular-nums">
            {totalKitsCount}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 dark:text-zinc-400">
            Scoped to this user account
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 mb-1">
            <span>Generated Questions</span>
            <HelpCircle className="h-4 w-4 text-indigo-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-zinc-100 tabular-nums">
            {totalQuestionsCount}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 dark:text-zinc-400">
            Across {totalKitsCount} active kits
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 mb-1">
            <span>Flashcards Ready</span>
            <BookOpen className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-zinc-100 tabular-nums">
            {totalFlashcardsCount}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 dark:text-zinc-400">
            Spaced repetition enabled
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 mb-1">
            <span>Must-Have Coverage</span>
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-zinc-100 tabular-nums">
            {overallCoverageRate}%
          </div>
          <div className="mt-2 text-[11px] text-slate-500 dark:text-zinc-400">
            {totalUncoveredMustHaves === 0 ? 'Zero must-have gaps' : `${totalUncoveredMustHaves} gaps pending second pass`}
          </div>
        </div>
      </div>

      {/* REAL CHARTS SECTION: Shown when user has real kits */}
      {totalKitsCount > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Question Category Distribution Chart */}
          <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 sm:p-6 shadow-xs">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 mb-1">
              Your Question Bank Category Breakdown
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mb-4">
              Real aggregated count of questions in your saved kits by evaluation category
            </p>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={realCategoryChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-100 dark:text-zinc-800/80" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'currentColor' }} className="text-slate-500 dark:text-zinc-400" axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: 'currentColor' }} className="text-slate-500 dark:text-zinc-400" axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#18181b',
                      borderColor: '#27272a',
                      borderRadius: '0.75rem',
                      fontSize: '12px',
                      color: '#f4f4f5'
                    }}
                  />
                  <Bar dataKey="count" name="Questions Count" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Question Difficulty Distribution Chart */}
          <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 sm:p-6 shadow-xs">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 mb-1">
              Question Difficulty Distribution
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mb-4">
              Categorized by integer difficulty (1: foundational, 2: applied, 3: architectural)
            </p>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={realDifficultyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-100 dark:text-zinc-800/80" />
                  <XAxis dataKey="level" tick={{ fontSize: 10, fill: 'currentColor' }} className="text-slate-500 dark:text-zinc-400" axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: 'currentColor' }} className="text-slate-500 dark:text-zinc-400" axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#18181b',
                      borderColor: '#27272a',
                      borderRadius: '0.75rem',
                      fontSize: '12px',
                      color: '#f4f4f5'
                    }}
                  />
                  <Bar dataKey="count" name="Questions Count" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : null}

      {/* SAVED PREP KITS TABLE (Real User Data Only) */}
      <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-xs">
        <div className="p-5 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between">
          <div>
            <h2 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-zinc-100">
              Your Prepared Interview Kits ({totalKitsCount})
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Registered exclusively under {session.email}
            </p>
          </div>

          {totalKitsCount > 0 && (
            <button
              onClick={() => onNavigateToGenerator()}
              className="inline-flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 font-medium"
            >
              <span>+ Add Another Role</span>
            </button>
          )}
        </div>

        {totalKitsCount === 0 ? (
          <div className="p-12 text-center space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 dark:bg-zinc-800 text-slate-400">
              <FolderOpen className="h-6 w-6" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                No prep kits generated yet
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Paste a target job description and company website to crawl their hiring practices, synthesize role requirements, and build your study schedule.
              </p>
            </div>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => onNavigateToGenerator()}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 text-xs font-semibold shadow-xs transition-colors"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Create Your First Prep Kit</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-zinc-800/80 bg-slate-50/50 dark:bg-zinc-950/40 text-slate-500 dark:text-zinc-400 font-mono uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4 sm:px-6">Role & Company</th>
                  <th className="py-3 px-4">Timeline</th>
                  <th className="py-3 px-4">Coverage Status</th>
                  <th className="py-3 px-4">Content Assets</th>
                  <th className="py-3 px-4">Last Saved</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60 text-slate-700 dark:text-zinc-300">
                {userKits.map(({ id, kit, savedAt }) => {
                  const uncoveredCount = kit.coverage?.uncovered_requirement_ids?.length || 0;
                  const passes = kit.coverage?.passes || 1;

                  return (
                    <tr
                      key={id}
                      onClick={() => onOpenKit(kit)}
                      className="hover:bg-slate-50/80 dark:hover:bg-zinc-800/30 transition-colors cursor-pointer group"
                    >
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="font-semibold text-slate-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {kit.role.title}
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-zinc-400 font-mono">
                          <span>{kit.source.company || 'Target Company'}</span>
                          <span>·</span>
                          <a
                            href={kit.source.company_url}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-blue-600 hover:underline flex items-center gap-0.5"
                          >
                            <span>{kit.source.company_url}</span>
                            <ExternalLink className="h-2.5 w-2.5" />
                          </a>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono">
                        <span className="inline-flex items-center gap-1 text-slate-700 dark:text-zinc-300">
                          <Calendar className="h-3.5 w-3.5 text-blue-500" />
                          <span>{kit.schedule.days_available} Days</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        {uncoveredCount === 0 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40">
                            <span>100% Must-Haves Covered ({passes} Pass{passes > 1 ? 'es' : ''})</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40">
                            <span>{uncoveredCount} Gaps</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500 dark:text-zinc-400">
                        <span className="text-slate-800 dark:text-zinc-200 font-medium">{kit.questions.length}</span> questions · <span className="text-slate-800 dark:text-zinc-200 font-medium">{kit.flashcards.length}</span> cards
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400">
                        {new Date(savedAt).toLocaleDateString()}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenKit(kit);
                            }}
                            className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 font-medium"
                          >
                            <span>Open</span>
                            <ArrowRight className="h-3 w-3" />
                          </button>

                          <button
                            type="button"
                            onClick={(e) => handleDeleteKit(id, e)}
                            title="Delete Kit"
                            className="p-1 rounded-md text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
