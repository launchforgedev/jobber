import React, { useState } from 'react';
import {
  Play, Upload, Globe, Calendar, ArrowRight, Loader2, Sparkles,
  ShieldCheck, BrainCircuit, Target, CheckCircle2, AlertCircle, FileText, ChevronRight
} from 'lucide-react';
import { generateFullPrepKit } from '../services/aiGenerator.ts';
import { PrepKit, BatchInputCase } from '../types/prepkit.ts';
import { BrandLogo } from './BrandLogo.tsx';

interface KitCreatorProps {
  onKitCreated: (kit: PrepKit) => void;
  onBatchCasesLoaded?: (cases: BatchInputCase[]) => void;
  initialJd?: string;
  initialCompanyUrl?: string;
}

const SAMPLE_PRESETS = [
  {
    label: 'Senior Distributed Backend Engineer',
    company: 'https://stripe.com',
    days: 5,
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
    label: 'Lead Frontend Systems Architect',
    company: 'https://linear.app',
    days: 3,
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
    label: 'Reliability & Systems Engineer',
    company: 'https://datadoghq.com',
    days: 4,
    jd: `Site Reliability & Systems Engineer - Core Infrastructure

You will ensure high availability and observability across thousands of production Kubernetes clusters.

Key Requirements:
- Deep knowledge of Linux kernel tuning, eBPF telemetry, and cgroups.
- Experience with Prometheus, OpenTelemetry, and distributed tracing.
- Incident response leadership, post-mortem blameless culture, and Chaos Engineering drills.`
  },
  {
    label: 'Thin Stub (Negative / Guard Test)',
    company: 'https://example.com',
    days: 2,
    jd: `Software Developer needed. Must know Python and Git.`
  }
];

export const KitCreator: React.FC<KitCreatorProps> = ({
  onKitCreated,
  onBatchCasesLoaded,
  initialJd,
  initialCompanyUrl
}) => {
  const [jd, setJd] = useState(initialJd || SAMPLE_PRESETS[0].jd);
  const [companyUrl, setCompanyUrl] = useState(initialCompanyUrl || SAMPLE_PRESETS[0].company);
  const [days, setDays] = useState(SAMPLE_PRESETS[0].days);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progressState, setProgressState] = useState<{ step: string; message: string; percentage: number } | null>(null);
  const [generationLogs, setGenerationLogs] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleApplyPreset = (index: number) => {
    const p = SAMPLE_PRESETS[index];
    setJd(p.jd);
    setCompanyUrl(p.company);
    setDays(p.days);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed) && parsed.length > 0) {
          if (onBatchCasesLoaded) {
            onBatchCasesLoaded(parsed as BatchInputCase[]);
          }
          const first = parsed[0];
          if (first.jd) setJd(first.jd);
          if (first.company_url) setCompanyUrl(first.company_url);
          if (first.days) setDays(first.days);
        }
      } catch (err) {
        alert('Invalid JSON file format. Please upload an array of case objects.');
      }
    };
    reader.readAsText(file);
  };

  const handleStartGeneration = async () => {
    if (!jd.trim()) {
      setErrorMessage('Please paste a job description.');
      return;
    }
    if (!companyUrl.trim()) {
      setErrorMessage('Please enter a target company website.');
      return;
    }

    setErrorMessage(null);
    setIsGenerating(true);
    setGenerationLogs([]);
    setProgressState({ step: 'init', message: 'Initializing Jobber Intelligence Engine...', percentage: 5 });

    try {
      const kit = await generateFullPrepKit(jd, companyUrl, days, p => {
        setProgressState(p);
        setGenerationLogs(prev => [...prev.slice(-15), `[${p.step.toUpperCase()}] ${p.message}`]);
      });

      setIsGenerating(false);
      onKitCreated(kit);
    } catch (err: any) {
      console.error('Generation error:', err);
      setIsGenerating(false);
      setErrorMessage(err?.message || 'Kit generation encountered an unexpected error.');
    }
  };

  return (
    <div className="space-y-16 animate-fade-in">
      {/* Prompverse AI Hero Section */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#070a12] p-6 sm:p-12 lg:p-16 transition-colors">
        {/* Ambient background glow & grid */}
        <div className="absolute inset-0 prompverse-glow pointer-events-none opacity-80" />
        <div className="absolute inset-0 prompverse-grid pointer-events-none opacity-40" />

        <div className="relative z-10 max-w-3xl mx-auto text-center space-y-6">
          {/* Hero Kicker (Unboxed metadata, zero pill slop) */}
          <div className="inline-flex items-center gap-2 text-xs font-mono text-indigo-600 dark:text-indigo-400">
            <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse-subtle" />
            <span className="tracking-wider uppercase">Jobber Intelligence · Deterministic Interview Prep</span>
          </div>

          {/* Hero Headline with text-wrap: balance */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 dark:text-white leading-[1.15]" style={{ textWrap: 'balance' }}>
            Ace Any Tech Interview With Deterministic Precision
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Extract verified competencies directly from job descriptions, crawl company engineering blogs, and synthesize rigorous question rubrics, flashcard decks, and day-by-day study calendars.
          </p>

          {/* Proof metrics row */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs text-slate-500 dark:text-slate-400 font-mono">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span>100% Requirement Coverage</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-indigo-500" />
              <span>Zero Hallucination Guarantee</span>
            </div>
            <div className="flex items-center gap-1.5">
              <BrainCircuit className="h-4 w-4 text-purple-500" />
              <span>AI Mock Voice/Text Studio</span>
            </div>
          </div>
        </div>

        {/* Prompverse Prompt / Generator Console */}
        <div className="relative z-10 mt-10 max-w-3xl mx-auto rounded-2xl border border-slate-200 dark:border-white/[0.1] bg-slate-50/90 dark:bg-white/[0.03] backdrop-blur-xl p-5 sm:p-7 shadow-xl">
          {/* Quick Preset Selector Buttons */}
          <div className="mb-5 flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Quick Presets:</span>
            {SAMPLE_PRESETS.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleApplyPreset(idx)}
                className="text-xs text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white bg-white dark:bg-white/[0.05] hover:bg-slate-100 dark:hover:bg-white/[0.1] border border-slate-200 dark:border-white/[0.08] px-2.5 py-1 rounded-lg transition-all duration-150 interactive-hover"
              >
                {p.label}
              </button>
            ))}
          </div>

          {errorMessage && (
            <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-950/40 p-4 text-xs text-red-700 dark:text-red-200 animate-scale-in">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
              <div>
                <span className="font-semibold">Generation paused:</span> {errorMessage}
              </div>
            </div>
          )}

          {isGenerating ? (
            /* Live Pipeline Generation Monitor */
            <div className="space-y-5 animate-scale-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Synthesizing Preparation Kit</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{progressState?.message}</p>
                  </div>
                </div>
                <span className="font-mono text-sm font-bold text-indigo-600 dark:text-indigo-400 tabular-nums">
                  {progressState?.percentage || 10}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-200 dark:bg-white/[0.06] rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progressState?.percentage || 10}%` }}
                />
              </div>

              {/* Step badges */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs font-mono">
                <div className={`p-2 rounded-lg border text-center transition-colors ${progressState?.percentage && progressState.percentage >= 15 ? 'border-indigo-400 dark:border-indigo-500/40 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300' : 'border-slate-200 dark:border-white/[0.06] bg-slate-100 dark:bg-white/[0.02] text-slate-400'}`}>
                  1. Extract JD
                </div>
                <div className={`p-2 rounded-lg border text-center transition-colors ${progressState?.percentage && progressState.percentage >= 35 ? 'border-indigo-400 dark:border-indigo-500/40 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300' : 'border-slate-200 dark:border-white/[0.06] bg-slate-100 dark:bg-white/[0.02] text-slate-400'}`}>
                  2. Crawl Web
                </div>
                <div className={`p-2 rounded-lg border text-center transition-colors ${progressState?.percentage && progressState.percentage >= 60 ? 'border-indigo-400 dark:border-indigo-500/40 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300' : 'border-slate-200 dark:border-white/[0.06] bg-slate-100 dark:bg-white/[0.02] text-slate-400'}`}>
                  3. Question Banks
                </div>
                <div className={`p-2 rounded-lg border text-center transition-colors ${progressState?.percentage && progressState.percentage >= 80 ? 'border-indigo-400 dark:border-indigo-500/40 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300' : 'border-slate-200 dark:border-white/[0.06] bg-slate-100 dark:bg-white/[0.02] text-slate-400'}`}>
                  4. Coverage Loop
                </div>
                <div className={`p-2 rounded-lg border text-center transition-colors ${progressState?.percentage && progressState.percentage >= 95 ? 'border-indigo-400 dark:border-indigo-500/40 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300' : 'border-slate-200 dark:border-white/[0.06] bg-slate-100 dark:bg-white/[0.02] text-slate-400'}`}>
                  5. Daily Schedule
                </div>
              </div>

              {/* Live console log */}
              <div className="rounded-xl bg-slate-900 text-slate-200 p-4 font-mono text-xs border border-slate-800 max-h-40 overflow-y-auto space-y-1 shadow-inner">
                <div className="text-slate-500">// Jobber Execution Telemetry:</div>
                {generationLogs.map((log, i) => (
                  <div key={i} className="text-slate-300">
                    <span className="text-indigo-400">›</span> {log}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Target Company URL */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Target Company Domain
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      value={companyUrl}
                      onChange={e => setCompanyUrl(e.target.value)}
                      placeholder="https://company.com"
                      className="w-full rounded-xl border border-slate-200 dark:border-white/[0.1] bg-white dark:bg-[#070a12] pl-10 pr-3 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none font-mono transition-colors"
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                    Live crawling extracts engineering principles, tech stack shifts, and interview formats.
                  </p>
                </div>

                {/* Preparation Days Slider */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                    <span>Days Available</span>
                    <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold tabular-nums">
                      {days} {days === 1 ? 'Day' : 'Days'}
                    </span>
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="1"
                      max="60"
                      value={days}
                      onChange={e => setDays(Number(e.target.value))}
                      className="w-full accent-indigo-600 cursor-pointer"
                    />
                    <input
                      type="number"
                      min="1"
                      max="60"
                      value={days}
                      onChange={e => setDays(Math.max(1, Math.min(60, Number(e.target.value) || 1)))}
                      className="w-16 rounded-xl border border-slate-200 dark:border-white/[0.1] bg-white dark:bg-[#070a12] px-2 py-1.5 text-center text-sm text-slate-900 dark:text-white font-mono focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                    Deterministic distribution across days.
                  </p>
                </div>
              </div>

              {/* Job Description Textarea */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Target Job Description (JD)
                  </label>
                  <span className="font-mono text-[11px] text-slate-400 tabular-nums">
                    {jd.length} chars
                  </span>
                </div>
                <textarea
                  rows={9}
                  value={jd}
                  onChange={e => setJd(e.target.value)}
                  placeholder="Paste the full job specification or bullet points..."
                  className="w-full rounded-xl border border-slate-200 dark:border-white/[0.1] bg-white dark:bg-[#070a12] p-3.5 text-xs font-mono text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none leading-relaxed transition-colors"
                />
              </div>

              {/* Action Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <label className="cursor-pointer w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-white/[0.1] bg-white dark:bg-white/[0.04] px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.08] transition-colors interactive-hover">
                  <Upload className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                  <span>Load Batch Cases (.json)</span>
                  <input
                    type="file"
                    accept=".json,.csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                <button
                  type="button"
                  onClick={handleStartGeneration}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/40 transition-all duration-200 interactive-hover"
                >
                  <Play className="h-4 w-4 fill-white" />
                  <span>Generate Preparation Kit</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Prompverse AI Bento Grid Showcase */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Engineered For High-Stakes Engineering Interviews
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            A deterministic pipeline that replaces generic prep with verified, company-grounded mastery.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {/* Bento Card 1: Web Crawling & Company Culture (Col-Span-2) */}
          <div className="md:col-span-2 rounded-3xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#070a12] p-6 sm:p-8 hover-glow transition-all duration-200 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono text-indigo-600 dark:text-indigo-400">
                <Globe className="h-4 w-4" />
                <span>Live Grounding Engine</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Company Culture & Engineering Intelligence
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Jobber explores the target company's web domain, engineering blog posts, technical talks, and product mission. It extracts genuine architectural values and culture questions so you walk into the interview speaking their exact dialect.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/[0.06] flex flex-wrap items-center gap-4 text-xs font-mono text-slate-500 dark:text-slate-400">
              <span>· Engineering Values & DNA</span>
              <span>· Target Product Architecture</span>
              <span>· Behavioral Expectations</span>
            </div>
          </div>

          {/* Bento Card 2: AI Mock Diagnostic Studio with Image */}
          <div className="rounded-3xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#070a12] p-6 sm:p-8 hover-glow transition-all duration-200 flex flex-col justify-between overflow-hidden">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono text-purple-600 dark:text-purple-400">
                <BrainCircuit className="h-4 w-4" />
                <span>AI Mock Interview Studio</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Live Voice/Text Simulation & Radar Audit
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Practice answering questions live with instant bar-raiser evaluation, strength highlights, and blind spots diagnosis.
              </p>
            </div>

            <div className="mt-4 rounded-xl overflow-hidden border border-slate-200 dark:border-white/[0.08] bg-slate-900">
              <img
                src="/src/assets/images/jobber_feature_radar_1790184534602.jpg"
                alt="Jobber Diagnostic Radar"
                className="w-full h-32 object-cover object-center"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>

          {/* Bento Card 3: Deterministic Coverage Loop */}
          <div className="rounded-3xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#070a12] p-6 sm:p-8 hover-glow transition-all duration-200 space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="h-4 w-4" />
              <span>Coverage Enforcement</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Strict Competency Mapping
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Every single extracted requirement from the job description is mapped to questions. If any requirement lacks adequate coverage, the generator self-repairs automatically.
            </p>
          </div>

          {/* Bento Card 4: Spaced Repetition Practice Deck */}
          <div className="rounded-3xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#070a12] p-6 sm:p-8 hover-glow transition-all duration-200 space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-600 dark:text-amber-400">
              <Target className="h-4 w-4" />
              <span>Active Recall Flashcards</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Confidence-Weighted Review
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              3D flip cards with self-rated confidence (Needs Work, Familiar, Mastered). The algorithm prioritizes weak items first for maximum retention.
            </p>
          </div>

          {/* Bento Card 5: Day-by-Day Calendar & Print Export */}
          <div className="rounded-3xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#070a12] p-6 sm:p-8 hover-glow transition-all duration-200 space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono text-blue-600 dark:text-blue-400">
              <Calendar className="h-4 w-4" />
              <span>Executive Timeline</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Deterministic Daily Plan & 1-Pager
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Calculates daily study sessions with exact question breakdowns, milestone reviews, and clean printable one-page executive sheets.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
