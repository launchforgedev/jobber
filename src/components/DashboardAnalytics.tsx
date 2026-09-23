import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from 'recharts';
import {
  ArrowRight,
  TrendingUp,
  Award,
  Target,
  FileCheck,
  Building2,
  Calendar,
  Sparkles,
  Search,
  SlidersHorizontal,
  ExternalLink,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { UserSession } from '../types/prepkit.ts';
import { RECENT_PIPELINE_APPLICATIONS, SKILL_DISTRIBUTION_RADAR } from '../services/matcherEngine.ts';

interface DashboardAnalyticsProps {
  session: UserSession;
  onNavigateToMatcher: () => void;
  onNavigateToGenerator: () => void;
  onSelectRoleForMatcher?: (role: string, company: string, jd: string) => void;
}

export const DashboardAnalytics: React.FC<DashboardAnalyticsProps> = ({
  session,
  onNavigateToMatcher,
  onNavigateToGenerator
}) => {
  const [filterCategory, setFilterCategory] = useState<'All' | 'Backend' | 'Frontend' | 'Infrastructure'>('All');
  const [activeMetricTab, setActiveMetricTab] = useState<'trends' | 'radar'>('trends');

  const filteredApplications = filterCategory === 'All'
    ? RECENT_PIPELINE_APPLICATIONS
    : RECENT_PIPELINE_APPLICATIONS.filter(a => a.category === filterCategory);

  // Compute live averages
  const avgScore = Math.round(
    RECENT_PIPELINE_APPLICATIONS.reduce((acc, c) => acc + c.score, 0) / RECENT_PIPELINE_APPLICATIONS.length
  );
  const avgCoverage = Math.round(
    RECENT_PIPELINE_APPLICATIONS.reduce((acc, c) => acc + c.coverage, 0) / RECENT_PIPELINE_APPLICATIONS.length
  );

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      {/* Top Welcome & Quick-Action Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-zinc-400">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span>Jobber Workspace · Signed in as {session.email}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 dark:text-zinc-100">
              Candidate Readiness & Match Analytics
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
              Real-time telemetry measuring technical requirement coverage, keyword ATS optimization, and interview question preparedness against high-growth engineering teams.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <button
              onClick={onNavigateToMatcher}
              className="flex-1 lg:flex-none inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white px-4 py-2.5 text-xs font-semibold shadow-xs transition-colors"
            >
              <span>Analyze Resume vs JD</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>

            <button
              onClick={onNavigateToGenerator}
              className="flex-1 lg:flex-none inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-2.5 text-xs font-medium text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors shadow-2xs"
            >
              <Sparkles className="h-3.5 w-3.5 text-blue-500" />
              <span>Create Full Prep Kit</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards adhering to SaaS standards (Linear / Vercel style) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 mb-1">
            <span>Average Match Score</span>
            <Award className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-zinc-100 tabular-nums">
            {avgScore}%
          </div>
          <div className="mt-2 flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400">
            <TrendingUp className="h-3 w-3" />
            <span>+4.2% from previous week</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 mb-1">
            <span>Must-Have Coverage</span>
            <Target className="h-4 w-4 text-blue-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-zinc-100 tabular-nums">
            {avgCoverage}%
          </div>
          <div className="mt-2 text-[11px] text-slate-500 dark:text-zinc-400">
            Zero critical gaps in 5 of 6 roles
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 mb-1">
            <span>Pipeline Applications</span>
            <Building2 className="h-4 w-4 text-purple-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-zinc-100 tabular-nums">
            6
          </div>
          <div className="mt-2 text-[11px] text-purple-600 dark:text-purple-400">
            2 interviews scheduled this week
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 mb-1">
            <span>Prep Readiness Index</span>
            <FileCheck className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-zinc-100 tabular-nums">
            91 / 100
          </div>
          <div className="mt-2 text-[11px] text-slate-500 dark:text-zinc-400">
            Deterministic calendar active
          </div>
        </div>
      </div>

      {/* Visual Analytics Graphs Section (Recharts) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Match Progression & Velocity (Col-span 2) */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-zinc-100">
                  Target Role Compatibility & Coverage Velocity
                </h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Comparative analysis of match score vs must-have requirement coverage across recent applications
                </p>
              </div>

              {/* Toggle metric tabs */}
              <div className="inline-flex rounded-lg border border-slate-200 dark:border-zinc-800 p-0.5 bg-slate-50 dark:bg-zinc-950 text-xs">
                <button
                  onClick={() => setActiveMetricTab('trends')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    activeMetricTab === 'trends'
                      ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white font-medium shadow-2xs'
                      : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
                  }`}
                >
                  Trend Area
                </button>
                <button
                  onClick={() => setActiveMetricTab('radar')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    activeMetricTab === 'radar'
                      ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white font-medium shadow-2xs'
                      : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
                  }`}
                >
                  Company Bars
                </button>
              </div>
            </div>

            {/* Recharts Area / Bar Chart */}
            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                {activeMetricTab === 'trends' ? (
                  <AreaChart
                    data={RECENT_PIPELINE_APPLICATIONS}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563EB" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="coverageGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-200 dark:text-zinc-800/80" />
                    <XAxis
                      dataKey="company"
                      tick={{ fontSize: 11, fill: 'currentColor' }}
                      className="text-slate-500 dark:text-zinc-400"
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      domain={[60, 100]}
                      tick={{ fontSize: 11, fill: 'currentColor' }}
                      className="text-slate-500 dark:text-zinc-400"
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#18181b',
                        borderColor: '#27272a',
                        borderRadius: '0.75rem',
                        fontSize: '12px',
                        color: '#f4f4f5'
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="score"
                      name="Match Score (%)"
                      stroke="#2563EB"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#scoreGradient)"
                    />
                    <Area
                      type="monotone"
                      dataKey="coverage"
                      name="Must-Have Coverage (%)"
                      stroke="#10B981"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#coverageGradient)"
                    />
                  </AreaChart>
                ) : (
                  <BarChart
                    data={RECENT_PIPELINE_APPLICATIONS}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-200 dark:text-zinc-800/80" />
                    <XAxis
                      dataKey="company"
                      tick={{ fontSize: 11, fill: 'currentColor' }}
                      className="text-slate-500 dark:text-zinc-400"
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={{ fontSize: 11, fill: 'currentColor' }}
                      className="text-slate-500 dark:text-zinc-400"
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#18181b',
                        borderColor: '#27272a',
                        borderRadius: '0.75rem',
                        fontSize: '12px',
                        color: '#f4f4f5'
                      }}
                    />
                    <Bar dataKey="score" name="Match Score" fill="#2563EB" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="coverage" name="Coverage %" fill="#10B981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 font-mono">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-blue-600" /> Match Score
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500" /> Must-Have Coverage
              </span>
            </div>
            <span>Threshold for Interview: 80%</span>
          </div>
        </div>

        {/* Right Column: Skill Competency Radar (Col-span 1) */}
        <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-zinc-100">
              Competency Radar Distribution
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Candidate profile vs high-bar engineering requirements
            </p>

            <div className="h-72 w-full pt-1">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart outerRadius={90} data={SKILL_DISTRIBUTION_RADAR}>
                  <PolarGrid stroke="currentColor" className="text-slate-200 dark:text-zinc-800" />
                  <PolarAngleAxis
                    dataKey="subject"
                    tick={{ fontSize: 9, fill: 'currentColor' }}
                    className="text-slate-500 dark:text-zinc-400"
                  />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar
                    name="Candidate"
                    dataKey="candidateScore"
                    stroke="#2563EB"
                    fill="#2563EB"
                    fillOpacity={0.3}
                  />
                  <Radar
                    name="Role Benchmark"
                    dataKey="jobTargetScore"
                    stroke="#94A3B8"
                    fill="#94A3B8"
                    fillOpacity={0.15}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#18181b',
                      borderColor: '#27272a',
                      borderRadius: '0.75rem',
                      fontSize: '11px',
                      color: '#f4f4f5'
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 font-mono">
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">+8% over benchmark in Systems</span>
            <span>Target: Stripe</span>
          </div>
        </div>
      </div>

      {/* Recent Applications Pipeline Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-xs">
        <div className="p-5 border-b border-slate-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-zinc-100">
              Active Candidate Application Pipeline
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Historical match evaluations, requirement coverage, and current interview status
            </p>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            {(['All', 'Backend', 'Frontend', 'Infrastructure'] as const).map(cat => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  filterCategory === cat
                    ? 'bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-white font-medium'
                    : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-zinc-800/80 bg-slate-50/50 dark:bg-zinc-950/40 text-slate-500 dark:text-zinc-400 font-mono uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4 sm:px-6">Role & Company</th>
                <th className="py-3 px-4">Domain</th>
                <th className="py-3 px-4">Compatibility Score</th>
                <th className="py-3 px-4">Coverage</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60 text-slate-700 dark:text-zinc-300">
              {filteredApplications.map((app, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-slate-50/80 dark:hover:bg-zinc-800/30 transition-colors"
                >
                  <td className="py-3.5 px-4 sm:px-6">
                    <div className="font-medium text-slate-900 dark:text-zinc-100">{app.role}</div>
                    <div className="text-[11px] text-slate-500 dark:text-zinc-400 font-mono">{app.company}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 font-mono">
                      {app.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <span className={`font-mono font-bold tabular-nums ${
                        app.score >= 90 ? 'text-emerald-600 dark:text-emerald-400' :
                        app.score >= 80 ? 'text-blue-600 dark:text-blue-400' : 'text-amber-600 dark:text-amber-400'
                      }`}>
                        {app.score}%
                      </span>
                      <div className="w-16 bg-slate-100 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-1.5 rounded-full ${
                            app.score >= 90 ? 'bg-emerald-500' :
                            app.score >= 80 ? 'bg-blue-600' : 'bg-amber-500'
                          }`}
                          style={{ width: `${app.score}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500 dark:text-zinc-400">
                    {app.coverage}% must-have
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium ${
                      app.status === 'Offer Extended' ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40' :
                      app.status === 'Interview Scheduled' ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/40' :
                      app.status === 'Screening Passed' ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/40' :
                      'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300'
                    }`}>
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      {app.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={onNavigateToMatcher}
                      className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                    >
                      <span>Re-evaluate</span>
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
