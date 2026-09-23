import React, { useState } from 'react';
import {
  Building2, Briefcase, CheckCircle2, AlertTriangle, ShieldCheck,
  RefreshCw, Globe, ChevronDown, ChevronUp, ExternalLink, Sparkles
} from 'lucide-react';
import { PrepKit, Requirement } from '../types/prepkit.ts';
import { regenerateSectionInKit } from '../services/kitBuilder.ts';

interface CompanyRoleHeaderProps {
  kit: PrepKit;
  onUpdateKit: (updated: PrepKit) => void;
}

export const CompanyRoleHeader: React.FC<CompanyRoleHeaderProps> = ({ kit, onUpdateKit }) => {
  const [isRegeneratingBrief, setIsRegeneratingBrief] = useState(false);
  const [showAllReqs, setShowAllReqs] = useState(false);

  const handleRegenerateBrief = async () => {
    setIsRegeneratingBrief(true);
    try {
      const updated = await regenerateSectionInKit(kit, { type: 'company_brief' });
      onUpdateKit(updated);
    } catch (err) {
      console.error('Error regenerating brief:', err);
    } finally {
      setIsRegeneratingBrief(false);
    }
  };

  const mustHaves = kit.role.requirements.filter(r => r.priority === 'must');
  const niceToHaves = kit.role.requirements.filter(r => r.priority === 'nice');
  const visibleMustHaves = showAllReqs ? mustHaves : mustHaves.slice(0, 6);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner: Role & Company Status */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] p-5 sm:p-6 shadow-sm dark:shadow-md transition-colors duration-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-5">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/50">
                {kit.role.seniority.toUpperCase()} LEVEL
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 font-mono">
                <Globe className="h-3 w-3" />
                <span>{kit.source.company_url}</span>
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">·</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">{kit.source.location || 'Remote / Hybrid'}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              {kit.role.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
              Deterministic interview preparation kit synthesized from job description ({kit.source.jd_chars} chars) and live web research.
            </p>
          </div>

          {/* Quick Metrics Badge */}
          <div className="flex flex-wrap md:flex-nowrap items-center gap-2 self-start md:self-center">
            <div className="rounded-xl border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/40 px-3.5 py-2 text-left">
              <div className="text-[10px] font-mono uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="h-3 w-3" />
                <span>Coverage Verified</span>
              </div>
              <div className="text-base font-bold text-slate-900 dark:text-white tabular-nums">
                {kit.coverage.passes} {kit.coverage.passes === 1 ? 'Pass' : 'Passes'}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 px-3.5 py-2 text-left">
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Study Window
              </div>
              <div className="text-base font-bold text-slate-900 dark:text-white tabular-nums">
                {kit.schedule.days_available} Days
              </div>
            </div>
          </div>
        </div>

        {/* Company Research Brief */}
        <div className="pt-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Company Research & Hiring Insights
              </h2>
            </div>

            <button
              onClick={handleRegenerateBrief}
              disabled={isRegeneratingBrief}
              title="Regenerate company brief while keeping questions"
              className="inline-flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors interactive-hover disabled:opacity-50"
            >
              <RefreshCw className={`h-3 w-3 ${isRegeneratingBrief ? 'animate-spin text-indigo-500' : ''}`} />
              <span>Regenerate Brief</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-900/40 text-slate-700 dark:text-slate-300 leading-relaxed">
              <span className="font-semibold text-slate-900 dark:text-white block mb-1">Company Overview</span>
              {kit.company_brief.summary}
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-900/40 text-slate-700 dark:text-slate-300 leading-relaxed">
              <span className="font-semibold text-slate-900 dark:text-white block mb-1">Product Scope & Focus</span>
              {kit.company_brief.what_they_do}
            </div>
          </div>

          {/* Sources used */}
          {kit.company_brief.sources.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-500 dark:text-slate-400">
              <span className="font-mono">Pages Crawled:</span>
              {kit.company_brief.sources.map((src, i) => (
                <a
                  key={i}
                  href={src}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono underline text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 truncate max-w-[200px]"
                >
                  {src}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Extracted Requirements Checklist */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] p-5 sm:p-6 shadow-sm dark:shadow-md transition-colors duration-200">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>Extracted Job Competencies & Requirements</span>
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              Strictly segmented into Must-Have vs Nice-to-Have without synthetic filler.
            </p>
          </div>

          <div className="text-xs font-mono text-slate-500 dark:text-slate-400">
            <span>{mustHaves.length} Must-Have</span>
            <span className="mx-1.5">·</span>
            <span>{niceToHaves.length} Nice-to-Have</span>
          </div>
        </div>

        {/* Must-Haves */}
        <div className="space-y-2">
          <div className="text-[11px] font-mono uppercase tracking-wider text-emerald-700 dark:text-emerald-400 font-bold">
            Must-Have Criteria (Guaranteed in Questions & Schedule)
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {visibleMustHaves.map(req => (
              <div
                key={req.id}
                className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/40 text-xs transition-colors"
              >
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-bold text-slate-500 dark:text-slate-400">
                      [{req.id.toUpperCase()}]
                    </span>
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {req.kind}
                    </span>
                  </div>
                  <p className="text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                    {req.text}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {mustHaves.length > 6 && (
            <button
              onClick={() => setShowAllReqs(!showAllReqs)}
              className="mt-2 text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium flex items-center gap-1"
            >
              {showAllReqs ? (
                <>
                  <ChevronUp className="h-3.5 w-3.5" />
                  <span>Show fewer requirements</span>
                </>
              ) : (
                <>
                  <ChevronDown className="h-3.5 w-3.5" />
                  <span>Show all {mustHaves.length} requirements</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Nice-to-haves */}
        {niceToHaves.length > 0 && (
          <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
            <div className="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">
              Bonus / Nice-to-Have (Secondary Priority)
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {niceToHaves.map(req => (
                <div
                  key={req.id}
                  className="flex items-start gap-2 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800/60 bg-white dark:bg-slate-900/20 text-xs text-slate-600 dark:text-slate-400"
                >
                  <span className="font-mono text-[10px] font-bold text-slate-400 dark:text-slate-500">[{req.id}]</span>
                  <span>{req.text}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
