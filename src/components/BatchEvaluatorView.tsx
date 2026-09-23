import React, { useState } from 'react';
import { Terminal, Play, Download, CheckCircle2, AlertTriangle, FileJson, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { BatchInputCase, BatchOutput, PrepKit } from '../types/prepkit.ts';
import { generateFullPrepKit } from '../services/aiGenerator.ts';

interface BatchEvaluatorViewProps {
  onLoadKitToWorkspace: (kit: PrepKit) => void;
}

const DEFAULT_CASES: BatchInputCase[] = [
  {
    id: "case-01",
    company_url: "https://stripe.com",
    days: 5,
    jd: "Senior Backend Engineer - Financial Infrastructure & Core Ledger\nMust-have qualifications:\n- 5+ years building distributed payment pipelines in Go or Node.js\n- Deep expertise in PostgreSQL, schema optimization, and ACID transactions\n- Proven track record mentoring junior engineers and conducting code reviews\n- Familiarity with PCI-DSS fintech compliance standards"
  },
  {
    id: "case-02",
    company_url: "https://linear.app",
    days: 3,
    jd: "Lead Frontend Architect - Web Platform\nMust have:\n- Advanced proficiency in React 19, TypeScript, and modern state architectures\n- Experience building real-time multi-client synchronization systems\n- Deep intuition for UI latency optimization and micro-interactions\nNice to have:\n- WebAssembly or canvas rendering experience"
  },
  {
    id: "case-03-thin-stub",
    company_url: "https://example.com",
    days: 1,
    jd: "Software Developer needed. Must know Python and Git."
  }
];

export const BatchEvaluatorView: React.FC<BatchEvaluatorViewProps> = ({ onLoadKitToWorkspace }) => {
  const [casesJson, setCasesJson] = useState(JSON.stringify(DEFAULT_CASES, null, 2));
  const [isRunning, setIsRunning] = useState(false);
  const [currentRunningIndex, setCurrentRunningIndex] = useState<number | null>(null);
  const [results, setResults] = useState<BatchOutput | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const handleRunBatch = async () => {
    let parsedCases: BatchInputCase[];
    try {
      parsedCases = JSON.parse(casesJson);
      if (!Array.isArray(parsedCases)) throw new Error('Input must be a JSON array of case objects.');
    } catch (err: any) {
      alert('Invalid JSON input: ' + err.message);
      return;
    }

    setIsRunning(true);
    setLogs([`Starting batch evaluation of ${parsedCases.length} case(s)...`]);

    const batchOutput: BatchOutput = {
      version: '1.0',
      generated_at: new Date().toISOString(),
      kits: []
    };

    for (let i = 0; i < parsedCases.length; i++) {
      const c = parsedCases[i];
      setCurrentRunningIndex(i);
      setLogs(prev => [...prev, `[${i + 1}/${parsedCases.length}] Processing case id="${c.id}" (${c.company_url}, ${c.days} days)...`]);

      try {
        const kit = await generateFullPrepKit(c.jd, c.company_url, c.days, progress => {
          setLogs(prev => [...prev, `  ↳ [${progress.step}] ${progress.message}`]);
        });

        batchOutput.kits.push({
          id: c.id,
          status: 'ok',
          kit,
          error: null
        });
        setLogs(prev => [...prev, `  ✓ Finished case "${c.id}" successfully.`]);
      } catch (err: any) {
        batchOutput.kits.push({
          id: c.id,
          status: 'failed',
          kit: null,
          error: {
            code: 'E_GENERATION_FAILED',
            message: err?.message || 'Generation failed'
          }
        });
        setLogs(prev => [...prev, `  ✗ Error on case "${c.id}": ${err?.message}`]);
      }
    }

    setIsRunning(false);
    setCurrentRunningIndex(null);
    setResults(batchOutput);
    setLogs(prev => [...prev, `Batch run complete! All ${parsedCases.length} kits evaluated.`]);
  };

  const handleDownloadResults = () => {
    if (!results) return;
    const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jobber_batch_results_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Terminal className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
            <span>Section 9 Batch Evaluator & Appendix B Exporter</span>
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Run batch cases through the full pipeline. Compliant with Section 9 CLI contract: <code className="font-mono text-indigo-600 dark:text-indigo-400">npm run evaluate -- --input cases.json --output kits.json</code>
          </p>
        </div>

        <button
          onClick={handleRunBatch}
          disabled={isRunning}
          className="inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-5 py-2 text-xs font-semibold text-white shadow-md hover:bg-cyan-500 transition-all duration-200 interactive-hover disabled:opacity-50"
        >
          {isRunning ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Evaluating Cases...</span>
            </>
          ) : (
            <>
              <Play className="h-4 w-4 fill-white" />
              <span>Execute Batch Cases</span>
            </>
          )}
        </button>
      </div>

      {/* Editor & Execution Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Input Cases JSON */}
        <div className="lg:col-span-6 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Input Cases (Array of Objects)
            </label>
            <span className="text-[11px] font-mono text-slate-400">Section 9 Spec</span>
          </div>

          <textarea
            rows={16}
            value={casesJson}
            onChange={e => setCasesJson(e.target.value)}
            disabled={isRunning}
            className="w-full rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/90 p-4 text-xs font-mono text-slate-800 dark:text-slate-200 focus:border-cyan-500 focus:outline-none leading-relaxed transition-colors"
          />
        </div>

        {/* Right: Live Monitor & Appendix B Results */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Execution Logs & Results
            </label>
            {results && (
              <button
                onClick={handleDownloadResults}
                className="inline-flex items-center gap-1.5 text-xs text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Export Appendix B kits.json</span>
              </button>
            )}
          </div>

          {/* Console Output */}
          <div className="rounded-2xl border border-slate-800 bg-[#070b12] p-4 text-xs font-mono text-slate-300 min-h-[300px] max-h-[380px] overflow-y-auto space-y-1 shadow-inner">
            <div className="text-slate-500">// Terminal Output:</div>
            {logs.length === 0 ? (
              <div className="text-slate-600 py-8 text-center">
                Press "Execute Batch Cases" to run the pipeline across multiple target roles.
              </div>
            ) : (
              logs.map((line, i) => (
                <div key={i} className="leading-snug">
                  {line}
                </div>
              ))
            )}
          </div>

          {/* Completed Results Cards */}
          {results && (
            <div className="space-y-3 pt-2">
              <div className="text-xs font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Generated Prep Kits ({results.kits.length})
              </div>

              {results.kits.map(k => (
                <div
                  key={k.id}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] p-3.5 flex items-center justify-between gap-3 text-xs shadow-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2 font-mono">
                      <strong className="text-slate-900 dark:text-white font-bold">{k.id}</strong>
                      <span className={`px-1.5 py-0.2 rounded text-[10px] uppercase font-bold ${
                        k.status === 'ok' ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400' : 'bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-400'
                      }`}>
                        {k.status}
                      </span>
                    </div>
                    {k.kit && (
                      <div className="text-slate-500 dark:text-slate-400 text-[11px]">
                        {k.kit.role.title} · {k.kit.schedule.days_available} Days · {k.kit.questions.length} Questions
                      </div>
                    )}
                  </div>

                  {k.kit && (
                    <button
                      onClick={() => onLoadKitToWorkspace(k.kit!)}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    >
                      <span>Load into Workspace</span>
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
