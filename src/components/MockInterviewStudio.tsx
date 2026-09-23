import React, { useState } from 'react';
import {
  Mic, MicOff, Send, Award, CheckCircle2, AlertTriangle, Sparkles,
  BarChart3, RefreshCw, ChevronRight, Play, Loader2
} from 'lucide-react';
import { PrepKit, Question } from '../types/prepkit.ts';
import { evaluateCandidateAnswer, buildDiagnosticRadar, InterviewEvaluation } from '../services/mockInterview.ts';

interface MockInterviewStudioProps {
  kit: PrepKit;
}

export const MockInterviewStudio: React.FC<MockInterviewStudioProps> = ({ kit }) => {
  const [selectedQuestionId, setSelectedQuestionId] = useState<string>(kit.questions[0]?.id || '');
  const [candidateAnswer, setCandidateAnswer] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<InterviewEvaluation | null>(null);
  const [history, setHistory] = useState<InterviewEvaluation[]>([]);
  const [isListening, setIsListening] = useState(false);

  const selectedQuestion = kit.questions.find(q => q.id === selectedQuestionId) || kit.questions[0];
  const diagnostic = buildDiagnosticRadar(kit, history);

  const handleStartSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please type your response.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        setCandidateAnswer(prev => prev + ' ' + transcript);
      };

      recognition.start();
    } catch (err) {
      setIsListening(false);
    }
  };

  const handleEvaluate = async () => {
    if (!candidateAnswer.trim() || !selectedQuestion) return;

    setIsEvaluating(true);
    try {
      const result = await evaluateCandidateAnswer(kit, selectedQuestion, candidateAnswer.trim());
      setEvaluation(result);
      setHistory(prev => [result, ...prev]);
    } catch (err) {
      console.error('Evaluation error:', err);
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Award className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            <span>AI Mock Interview Simulator & Weak-Spots Diagnostic</span>
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Simulate a high-stakes interview scenario. Speak or write your response to test readiness against the employer's rubric.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400">
          <span>Evaluated Answers:</span>
          <strong className="text-slate-900 dark:text-white font-bold">{history.length}</strong>
        </div>
      </div>

      {/* Main Grid: Interviewer Console (Left) + Weak Spots Radar (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Simulation Studio */}
        <div className="lg:col-span-8 space-y-4">
          {/* Question Selector & Prompt */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] p-5 sm:p-6 shadow-sm dark:shadow-md space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <span className="text-xs font-mono uppercase tracking-wider text-purple-600 dark:text-purple-400 font-bold">
                Interviewer Prompt
              </span>

              <select
                value={selectedQuestionId}
                onChange={e => {
                  setSelectedQuestionId(e.target.value);
                  setEvaluation(null);
                }}
                className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-900 dark:text-white max-w-full sm:max-w-xs truncate focus:outline-none"
              >
                {kit.questions.map(q => (
                  <option key={q.id} value={q.id}>
                    [{q.id.toUpperCase()}] {q.category.toUpperCase()}: {q.prompt.slice(0, 45)}...
                  </option>
                ))}
              </select>
            </div>

            {selectedQuestion && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-500 dark:text-slate-400">
                    [{selectedQuestion.id.toUpperCase()}]
                  </span>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
                    {selectedQuestion.category}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">
                    Diff: {selectedQuestion.difficulty}/3
                  </span>
                </div>

                <p className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white leading-relaxed">
                  "{selectedQuestion.prompt}"
                </p>
              </div>
            )}

            {/* Answer Input Area */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Your Answer (Type or Dictate)
                </label>
                <button
                  type="button"
                  onClick={handleStartSpeechRecognition}
                  className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border transition-colors ${
                    isListening
                      ? 'border-red-500 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 animate-pulse'
                      : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                >
                  {isListening ? <MicOff className="h-3 w-3" /> : <Mic className="h-3 w-3" />}
                  <span>{isListening ? 'Listening...' : 'Voice Dictate'}</span>
                </button>
              </div>

              <textarea
                rows={6}
                value={candidateAnswer}
                onChange={e => setCandidateAnswer(e.target.value)}
                placeholder="Structure your answer clearly. For behavioural questions, use the STAR format (Situation, Task, Action, Result). For technical questions, state trade-offs, scale constraints, and failure modes..."
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/90 p-4 text-xs font-mono text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:border-purple-500 focus:outline-none leading-relaxed transition-colors"
              />

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] font-mono text-slate-400">
                  {candidateAnswer.trim().split(/\s+/).filter(Boolean).length} words
                </span>

                <button
                  onClick={handleEvaluate}
                  disabled={isEvaluating || !candidateAnswer.trim()}
                  className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-2 text-xs font-semibold text-white shadow-md hover:bg-purple-500 transition-all duration-200 interactive-hover disabled:opacity-40"
                >
                  {isEvaluating ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Grading Against Rubric...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5" />
                      <span>Submit for Evaluation</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* AI Feedback & Rubric Diagnostic (if evaluated) */}
          {evaluation && (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] p-5 sm:p-6 shadow-sm dark:shadow-md space-y-4 animate-scale-in">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <div className="text-2xl font-bold font-mono text-purple-600 dark:text-purple-400 tabular-nums">
                    {evaluation.score}/100
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase text-slate-400">Hiring Decision Verdict</span>
                    <div className="text-sm font-bold text-slate-900 dark:text-white">{evaluation.verdict}</div>
                  </div>
                </div>

                <div className="text-xs font-mono text-slate-400">
                  Feedback against [{evaluation.questionId}]
                </div>
              </div>

              {/* Strengths & Weaknesses */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/20 space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-700 dark:text-emerald-400">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Key Demonstrated Strengths</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300">
                    {evaluation.strengths.map((s: string, i: number) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-3.5 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/20 space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-amber-700 dark:text-amber-400">
                    <AlertTriangle className="h-4 w-4" />
                    <span>Critical Blind Spots & Weaknesses</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300">
                    {evaluation.weaknesses.map((w: string, i: number) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Exemplar Model Answer */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-4 space-y-1.5 text-xs">
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-purple-500" />
                  <span>Principal Engineer Exemplar Answer:</span>
                </div>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-mono text-[11px]">
                  {evaluation.exemplarAnswer}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right: Weak-Spots Diagnostic Radar */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] p-5 sm:p-6 shadow-sm dark:shadow-md space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <BarChart3 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Readiness Diagnostic Radar
              </h3>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Competency score aggregated from your flashcard practice ratings and mock interview evaluations.
            </p>

            {/* Category Breakdown Bars */}
            <div className="space-y-3 pt-2">
              {diagnostic.categoryScores.map(cat => (
                <div key={cat.category} className="space-y-1 text-xs">
                  <div className="flex items-center justify-between font-mono">
                    <span className="text-slate-700 dark:text-slate-300 font-semibold">{cat.name}</span>
                    <span className="font-bold text-slate-900 dark:text-white">{cat.score}%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        cat.score >= 75
                          ? 'bg-emerald-500'
                          : cat.score >= 50
                          ? 'bg-amber-500'
                          : 'bg-red-500'
                      }`}
                      style={{ width: `${cat.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* High Priority Weak Spots */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <div className="text-[11px] font-mono uppercase tracking-wider text-amber-700 dark:text-amber-400 font-bold">
                Identified Pre-Interview Focus Areas:
              </div>

              {diagnostic.weakSpots.length === 0 ? (
                <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-xs text-emerald-700 dark:text-emerald-300">
                  All competencies trending above benchmark.
                </div>
              ) : (
                diagnostic.weakSpots.map((ws, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 text-xs text-slate-700 dark:text-slate-300 space-y-0.5"
                  >
                    <div className="font-semibold text-slate-900 dark:text-white">{ws.topic}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">{ws.reason}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
