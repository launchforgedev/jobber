import React, { useState } from 'react';
import {
  FileText,
  Upload,
  Globe,
  Play,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Award,
  ShieldCheck,
  RotateCcw,
  Check,
  AlertCircle
} from 'lucide-react';
import { SAMPLE_RESUMES, analyzeResumeJobMatch } from '../services/matcherEngine.ts';
import { MatchAnalysisResult } from '../types/matcher.ts';

interface ResumeMatcherProps {
  onLaunchPrepKitWithJd?: (jd: string, companyUrl: string) => void;
}

const SAMPLE_JOB_PRESETS = [
  {
    label: 'Stripe · Senior Distributed Backend Engineer',
    company: 'https://stripe.com',
    jd: `Senior Backend Engineer - Financial Infrastructure & Core Ledger

We are looking for an experienced Senior Backend Engineer to design and scale our mission-critical distributed transaction ledger. You will be responsible for building high-throughput payment pipelines that process billions in global capital flows daily.

Core Responsibilities:
- Architect distributed, fault-tolerant event processing pipelines handling 50k+ transactions/sec.
- Own schema design, read/write sharding, and ACID transaction guarantees on PostgreSQL and CockroachDB.
- Collaborate with security and infrastructure teams to ensure PCI-DSS compliance and sub-50ms p99 latencies.
- Lead architecture design reviews and mentor junior and mid-level engineers.

Must Have Qualifications:
- 5+ years of production experience in distributed systems using Node.js, Go, or TypeScript.
- Deep expertise in relational database internals, transaction isolation levels, indexing, and WAL replication.
- Hands-on mastery of asynchronous event streaming systems (Kafka, RabbitMQ, or AWS SQS).
- Proven track record diagnosing tricky distributed race conditions, deadlocks, and network partitions.

Bonus Points / Nice To Have:
- Hands-on experience with Kubernetes orchestration and Terraform infrastructure-as-code.
- Prior exposure to financial ledger systems, double-entry bookkeeping, or banking rail protocols.
- Active contributor to open-source systems software.`
  },
  {
    label: 'Linear · Lead Frontend Systems Architect',
    company: 'https://linear.app',
    jd: `Lead Frontend Architect - Web Platform

We craft software that feels immediate and effortless. We are looking for an exceptional Frontend Architect to lead our web application architecture and push the boundaries of browser performance.

What you will do:
- Own the end-to-end client-side architecture for our high-frequency sync engine.
- Benchmark and optimize rendering pipelines, state hydration, and memory footprints.
- Establish best practices and design token guidelines for our cross-platform design system.

Required Qualifications:
- Mastery of React 19, TypeScript, WebAssembly, and modern browser internals.
- Proven expertise in sub-100ms offline-first synchronization architectures (IndexedDB, CRDTs).
- Deep knowledge of modern CSS, layout math, and hardware-accelerated micro-interactions.

Nice to Have:
- Experience with WebGL / Three.js interactive canvas rendering.
- Background designing custom developer tooling and linting rules.`
  },
  {
    label: 'Datadog · Reliability & Systems Engineer',
    company: 'https://datadoghq.com',
    jd: `Site Reliability & Systems Engineer - Core Infrastructure

You will ensure high availability and observability across thousands of production Kubernetes clusters.

Key Requirements:
- Deep knowledge of Linux kernel tuning, eBPF telemetry, and cgroups.
- Experience with Prometheus, OpenTelemetry, and distributed tracing.
- Incident response leadership, post-mortem blameless culture, and Chaos Engineering drills.`
  }
];

export const ResumeMatcher: React.FC<ResumeMatcherProps> = ({ onLaunchPrepKitWithJd }) => {
  const [selectedResumeIdx, setSelectedResumeIdx] = useState(0);
  const [resumeText, setResumeText] = useState(SAMPLE_RESUMES[0].profile.rawText);
  const [jdText, setJdText] = useState(SAMPLE_JOB_PRESETS[0].jd);
  const [companyUrl, setCompanyUrl] = useState(SAMPLE_JOB_PRESETS[0].company);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<MatchAnalysisResult | null>(null);

  // File drop/upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setResumeText(content);
        setSelectedResumeIdx(-1);
      }
    };
    reader.readAsText(file);
  };

  const handleSelectSampleResume = (idx: number) => {
    setSelectedResumeIdx(idx);
    setResumeText(SAMPLE_RESUMES[idx].profile.rawText);
  };

  const handleSelectSampleJob = (idx: number) => {
    setJdText(SAMPLE_JOB_PRESETS[idx].jd);
    setCompanyUrl(SAMPLE_JOB_PRESETS[idx].company);
  };

  const handleAnalyzeMatch = () => {
    if (!resumeText.trim() || !jdText.trim()) return;

    setIsAnalyzing(true);
    setAnalysisResult(null);

    // Simulate analytical processing with deterministic scoring
    setTimeout(() => {
      const result = analyzeResumeJobMatch(resumeText, jdText, companyUrl);
      setAnalysisResult(result);
      setIsAnalyzing(false);
    }, 650);
  };

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      {/* Header section */}
      <div className="border-b border-slate-200 dark:border-zinc-800 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-blue-600 dark:text-blue-400">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
              <span>Section 3 & 4 Assessment Rubric Compatible</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900 dark:text-zinc-100 mt-1">
              Resume & Job Description Compatibility Engine
            </h1>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
              Compare candidate competency tokens against target requirements, extract keyword gaps, and audit must-have alignment.
            </p>
          </div>

          <button
            onClick={handleAnalyzeMatch}
            disabled={isAnalyzing || !resumeText.trim() || !jdText.trim()}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white px-5 py-2.5 text-xs font-semibold shadow-xs transition-all duration-150 disabled:opacity-50"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Evaluating Rubrics...</span>
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>Analyze Match</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Dual-Input Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Panel: Resume Input */}
        <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <h2 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                  Candidate Resume
                </h2>
              </div>
              <span className="text-[11px] font-mono text-slate-400 dark:text-zinc-500">
                {resumeText.length} chars
              </span>
            </div>

            {/* Sample Resumes selector */}
            <div className="mb-3 flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium mr-1">
                Presets:
              </span>
              {SAMPLE_RESUMES.map((r, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSelectSampleResume(i)}
                  className={`text-[11px] px-2 py-1 rounded-lg transition-colors border ${
                    selectedResumeIdx === i
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-medium'
                      : 'border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
                  }`}
                >
                  {r.label.split(' · ')[0]}
                </button>
              ))}
            </div>

            <textarea
              rows={12}
              value={resumeText}
              onChange={(e) => {
                setResumeText(e.target.value);
                setSelectedResumeIdx(-1);
              }}
              placeholder="Paste candidate resume text or summary here..."
              className="w-full rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950 p-3.5 text-xs font-mono text-slate-800 dark:text-zinc-200 placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-hidden leading-relaxed transition-colors"
            />
          </div>

          {/* File drag-and-drop / upload trigger */}
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between">
            <label className="cursor-pointer inline-flex items-center gap-1.5 text-xs text-slate-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              <Upload className="h-3.5 w-3.5" />
              <span>Upload Resume file (.txt, .md, .json)</span>
              <input
                type="file"
                accept=".txt,.md,.json,.pdf"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
            <button
              onClick={() => setResumeText('')}
              className="text-[11px] text-slate-400 hover:text-red-500 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Right Panel: Target Job Description Input */}
        <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <h2 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                  Target Job Description
                </h2>
              </div>
              <span className="text-[11px] font-mono text-slate-400 dark:text-zinc-500">
                {jdText.length} chars
              </span>
            </div>

            {/* Sample JDs selector */}
            <div className="mb-3 flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium mr-1">
                Presets:
              </span>
              {SAMPLE_JOB_PRESETS.map((j, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSelectSampleJob(i)}
                  className="text-[11px] px-2 py-1 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 transition-colors"
                >
                  {j.label.split(' · ')[0]}
                </button>
              ))}
            </div>

            {/* Target Company URL */}
            <div className="mb-3">
              <input
                type="text"
                value={companyUrl}
                onChange={(e) => setCompanyUrl(e.target.value)}
                placeholder="Target company URL (e.g. https://stripe.com)"
                className="w-full rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950 px-3 py-1.5 text-xs font-mono text-slate-800 dark:text-zinc-200 placeholder-slate-400 focus:border-blue-500 focus:outline-hidden"
              />
            </div>

            <textarea
              rows={10}
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
              placeholder="Paste the target job description or paste specifications..."
              className="w-full rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950 p-3.5 text-xs font-mono text-slate-800 dark:text-zinc-200 placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-hidden leading-relaxed transition-colors"
            />
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
            <span>Includes technical & behavioural criteria</span>
            <button
              onClick={() => setJdText('')}
              className="text-[11px] text-slate-400 hover:text-red-500 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Comprehensive Score Breakdown View */}
      {analysisResult && (
        <div className="space-y-6 animate-scale-in">
          {/* Top Score Banner & Dynamic Ring Gauge */}
          <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 sm:p-8 shadow-xs">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              {/* Ring Gauge & Overall Metric */}
              <div className="flex items-center gap-6">
                {/* SVG Ring Gauge */}
                <div className="relative h-28 w-28 shrink-0 flex items-center justify-center">
                  <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      className="stroke-slate-100 dark:stroke-zinc-800"
                      strokeWidth="8"
                      fill="none"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      className={
                        analysisResult.overallScore >= 85
                          ? 'stroke-emerald-500 transition-all duration-700'
                          : analysisResult.overallScore >= 70
                          ? 'stroke-blue-600 transition-all duration-700'
                          : 'stroke-amber-500 transition-all duration-700'
                      }
                      strokeWidth="8"
                      strokeDasharray={251.2}
                      strokeDashoffset={251.2 - (251.2 * analysisResult.overallScore) / 100}
                      strokeLinecap="round"
                      fill="none"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-100 font-mono tabular-nums">
                      {analysisResult.overallScore}%
                    </span>
                    <span className="text-[10px] uppercase font-mono text-slate-400 dark:text-zinc-500">
                      Match
                    </span>
                  </div>
                </div>

                {/* Compatibility level & summary */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      analysisResult.overallScore >= 85
                        ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40'
                        : analysisResult.overallScore >= 70
                        ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/40'
                        : 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40'
                    }`}>
                      <CheckCircle2 className="h-3 w-3" />
                      {analysisResult.compatibilityLevel}
                    </span>
                    <span className="text-xs font-mono text-slate-500 dark:text-zinc-400">
                      {analysisResult.targetCompany} · {analysisResult.targetRole}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-zinc-400 max-w-xl leading-relaxed">
                    {analysisResult.summary}
                  </p>
                  <div className="flex items-center gap-4 text-[11px] font-mono text-slate-500 dark:text-zinc-400 pt-1">
                    <span>Must-Haves: <strong className="text-emerald-600 dark:text-emerald-400">{analysisResult.mustHaveCoveragePercentage}%</strong></span>
                    <span>·</span>
                    <span>Matched Keywords: <strong className="text-blue-600 dark:text-blue-400">{analysisResult.matchedKeywords.length}</strong></span>
                    <span>·</span>
                    <span>Missing Critical: <strong className="text-amber-600 dark:text-amber-400">{analysisResult.missingKeywords.filter(k => k.importance === 'critical').length}</strong></span>
                  </div>
                </div>
              </div>

              {/* Action: Transfer to Prep Kit */}
              {onLaunchPrepKitWithJd && (
                <div className="w-full md:w-auto shrink-0">
                  <button
                    onClick={() => onLaunchPrepKitWithJd(jdText, companyUrl)}
                    className="w-full md:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-5 py-3 text-xs font-semibold shadow-xs transition-all duration-150"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>Generate Tailored Interview Prep Kit</span>
                  </button>
                  <p className="text-[11px] text-center md:text-right text-slate-400 dark:text-zinc-500 mt-1 font-mono">
                    Includes company crawl & daily study schedule
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Category Scores breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(analysisResult.categoryScores).map(([key, cat]) => (
              <div
                key={key}
                className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-900 dark:text-zinc-100">{cat.name}</span>
                  <span className="font-mono text-slate-400 dark:text-zinc-500">Weight: {cat.weight}%</span>
                </div>

                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-100 font-mono tabular-nums">
                    {cat.score}%
                  </span>
                  <span className="text-[11px] font-mono text-slate-500 dark:text-zinc-400">
                    {cat.score >= 80 ? 'Aligned' : cat.score >= 65 ? 'Moderate' : 'Action Needed'}
                  </span>
                </div>

                <div className="w-full bg-slate-100 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-1.5 rounded-full ${
                      cat.score >= 80 ? 'bg-emerald-500' : cat.score >= 65 ? 'bg-blue-600' : 'bg-amber-500'
                    }`}
                    style={{ width: `${cat.score}%` }}
                  />
                </div>

                <div className="text-[11px] text-slate-500 dark:text-zinc-400 space-y-1">
                  <p className="line-clamp-2">{cat.strengths}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Keyword Insights: Matched vs Missing */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Matched Keywords (Green Pills) */}
            <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-500" />
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                    Matched Competencies & Keywords ({analysisResult.matchedKeywords.length})
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
                  Verified in Resume
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {analysisResult.matchedKeywords.map((item, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40"
                  >
                    <span>{item.keyword}</span>
                    <span className="font-mono text-[10px] text-emerald-600/70 dark:text-emerald-400/70">
                      ×{item.occurrencesInResume}
                    </span>
                  </span>
                ))}
              </div>
            </div>

            {/* Missing Keywords (Red/Amber Pills) */}
            <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                    Missing Target Competencies ({analysisResult.missingKeywords.length})
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-amber-600 dark:text-amber-400">
                  Recommended for ATS
                </span>
              </div>

              {analysisResult.missingKeywords.length === 0 ? (
                <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-zinc-800 text-center text-xs text-slate-500 dark:text-zinc-400">
                  Zero critical keyword gaps detected! All primary competencies appear in candidate text.
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {analysisResult.missingKeywords.map((item, idx) => (
                    <span
                      key={idx}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${
                        item.importance === 'critical'
                          ? 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-900/40'
                          : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900/40'
                      }`}
                      title={item.suggestedAction}
                    >
                      <span>{item.keyword}</span>
                      <span className="text-[10px] uppercase font-mono opacity-80">
                        {item.importance}
                      </span>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Actionable Recommendations to Improve Score */}
          <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 sm:p-6 shadow-xs space-y-3">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span>Actionable Recommendations to Elevate Match Score</span>
            </h3>

            <div className="space-y-2 text-xs">
              {analysisResult.recommendations.map((rec, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2.5 p-2.5 rounded-xl border border-slate-100 dark:border-zinc-800/60 bg-slate-50/50 dark:bg-zinc-950/30 text-slate-700 dark:text-zinc-300"
                >
                  <span className="font-mono text-blue-600 dark:text-blue-400 font-bold shrink-0">
                    {i + 1}.
                  </span>
                  <span className="leading-relaxed">{rec}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
