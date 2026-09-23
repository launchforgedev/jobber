import React from 'react';
import { Printer, Download, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { PrepKit } from '../types/prepkit.ts';
import { BrandLogo } from './BrandLogo.tsx';

interface PrintableOnePagerProps {
  kit: PrepKit;
  onBack: () => void;
}

export const PrintableOnePager: React.FC<PrintableOnePagerProps> = ({ kit, onBack }) => {
  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJson = () => {
    const blob = new Blob([JSON.stringify(kit, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jobber_prep_kit_${kit.role.title.replace(/\s+/g, '_').toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const mustReqs = kit.role.requirements.filter(r => r.priority === 'must');

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Action Header (hidden in print) */}
      <div className="print:hidden flex items-center justify-between border-b border-slate-200 dark:border-white/[0.08] pb-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Workspace</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadJson}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-white/[0.1] bg-white dark:bg-white/[0.04] px-3.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/[0.08] transition-colors shadow-xs"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export Appendix A JSON</span>
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 px-4 py-1.5 text-xs font-semibold text-white hover:from-indigo-500 hover:to-indigo-600 shadow transition-all duration-150 interactive-hover"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Print Executive One-Pager</span>
          </button>
        </div>
      </div>

      {/* Printable Sheet */}
      <div className="rounded-2xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#0d111c] print:bg-white print:text-black print:border-none p-6 sm:p-8 shadow-xl max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="border-b border-slate-200 dark:border-white/[0.08] print:border-black pb-4 flex justify-between items-start">
          <div className="flex items-start gap-3">
            <BrandLogo size={42} className="print:hidden mt-0.5" />
            <div>
              <div className="text-xs font-mono text-indigo-600 dark:text-indigo-400 print:text-slate-700 uppercase tracking-wider mb-1 font-semibold">
                Jobber AI Interview Preparation Kit · Confidential Briefing
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white print:text-black">
                {kit.role.title}
              </h1>
              <div className="text-xs text-slate-600 dark:text-slate-400 print:text-slate-700 mt-1">
                Target: <span className="font-semibold text-slate-900 dark:text-slate-200 print:text-black">{kit.source.company_url}</span> · Prep Window: <span className="font-semibold text-slate-900 dark:text-slate-200 print:text-black">{kit.schedule.days_available} Days</span> · Researched: {new Date(kit.source.researched_at).toLocaleDateString()}
              </div>
            </div>
          </div>
          <div className="text-right text-xs font-mono text-slate-500 dark:text-slate-400 print:text-slate-700">
            <div>Coverage Passes: {kit.coverage.passes}</div>
            <div>Must-Haves: {mustReqs.length}</div>
          </div>
        </div>

        {/* Company Brief */}
        <div className="space-y-1.5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 print:text-black">
            1. Company Research & Hiring Intelligence
          </h2>
          <p className="text-xs text-slate-700 dark:text-slate-300 print:text-slate-800 leading-relaxed">
            {kit.company_brief.summary}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 print:text-slate-600">
            {kit.company_brief.what_they_do}
          </p>
        </div>

        {/* Must-Have Requirements Checklist */}
        <div className="space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 print:text-black">
            2. Core Requirements to Prove in Interview
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {mustReqs.map(r => (
              <div key={r.id} className="flex items-start gap-2 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 print:bg-slate-100 border border-slate-200 dark:border-slate-800 print:border-slate-300">
                <span className="font-mono text-[10px] font-bold text-slate-400 dark:text-slate-500 print:text-slate-700">[{r.id}]</span>
                <span className="text-slate-800 dark:text-slate-200 print:text-black leading-snug">{r.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* High-Yield Questions & Rubrics */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 print:text-black">
            3. High-Yield Question Bank & Expected Rubrics
          </h2>
          <div className="space-y-2.5">
            {kit.questions.slice(0, 8).map(q => (
              <div key={q.id} className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 print:border-slate-300 bg-slate-50/70 dark:bg-slate-900/40 print:bg-white text-xs space-y-1">
                <div className="flex items-center justify-between font-mono text-[10px] text-slate-500 dark:text-slate-400 print:text-slate-600">
                  <span className="font-bold">[{q.id}] {q.category.toUpperCase()} (Difficulty: {q.difficulty}/3)</span>
                  <span>Targeted Requirements: {q.requirement_ids.join(', ')}</span>
                </div>
                <p className="font-semibold text-slate-900 dark:text-slate-100 print:text-black leading-snug">
                  {q.prompt}
                </p>
                <p className="text-slate-600 dark:text-slate-300 print:text-slate-700 text-[11px] leading-relaxed">
                  <span className="font-bold text-slate-500 dark:text-slate-400 print:text-slate-600">Rubric: </span>
                  {q.answer_outline}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Study Schedule Allocation */}
        <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800 print:border-black">
          <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 print:text-black">
            4. Study Schedule Progression
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
            {kit.schedule.days.map(d => (
              <div key={d.day} className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900/60 print:bg-slate-100 border border-slate-200 dark:border-slate-800 print:border-slate-300">
                <div className="font-mono text-[10px] font-bold text-indigo-600 dark:text-indigo-400 print:text-black">
                  Day {d.day} ({d.minutes}m)
                </div>
                <div className="text-[11px] text-slate-800 dark:text-slate-200 print:text-black truncate mt-0.5 font-medium">
                  {d.focus}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 print:text-slate-600 font-mono mt-1">
                  {d.question_ids.length} questions
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
