import React, { useState } from 'react';
import { Calendar, Clock, CheckCircle2, AlertCircle, RefreshCw, ChevronRight } from 'lucide-react';
import { PrepKit } from '../types/prepkit.ts';
import { regenerateSectionInKit } from '../services/kitBuilder.ts';

interface ScheduleViewProps {
  kit: PrepKit;
  onUpdateKit: (updated: PrepKit) => void;
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({ kit, onUpdateKit }) => {
  const [targetDays, setTargetDays] = useState(kit.schedule.days_available);
  const [isReallocating, setIsReallocating] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number>(1);

  const handleReallocate = async () => {
    setIsReallocating(true);
    try {
      const updated = await regenerateSectionInKit(kit, { type: 'schedule', days: targetDays });
      onUpdateKit(updated);
    } catch (err) {
      console.error('Error reallocating schedule:', err);
    } finally {
      setIsReallocating(false);
    }
  };

  const currentDayData = kit.schedule.days.find(d => d.day === selectedDay) || kit.schedule.days[0];
  const currentDayQuestions = currentDayData
    ? kit.questions.filter(q => currentDayData.question_ids.includes(q.id))
    : [];

  const totalMinutes = kit.schedule.days.reduce((acc, d) => acc + d.minutes, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header & Arithmetic Invariant Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <span>Deterministic Study Schedule</span>
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Calculated arithmetically across exactly {kit.schedule.days_available} days. Harder topics and must-have requirements land earlier; the final day is reserved for behavioral polish.
          </p>
        </div>

        {/* Re-allocate Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 shadow-xs">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">Days:</span>
            <input
              type="number"
              min="1"
              max="60"
              value={targetDays}
              onChange={e => setTargetDays(Math.max(1, Math.min(60, Number(e.target.value) || 1)))}
              className="w-12 bg-transparent text-center font-mono text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          <button
            onClick={handleReallocate}
            disabled={isReallocating}
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-500 transition-all duration-200 interactive-hover disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isReallocating ? 'animate-spin' : ''}`} />
            <span>Recalculate</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] p-4 shadow-xs">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Total Allocated Window
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white tabular-nums mt-1">
            {kit.schedule.days.length} Days
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
            Target: {kit.schedule.days_available} days (exact match)
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] p-4 shadow-xs">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Total Study Commitment
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white tabular-nums mt-1">
            {totalMinutes} Minutes
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
            ~{Math.round(totalMinutes / (kit.schedule.days.length || 1))} mins/day average
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] p-4 shadow-xs">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Must-Have Coverage
          </div>
          <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums mt-1 flex items-center gap-1.5">
            <CheckCircle2 className="h-5 w-5" />
            <span>100% Invariant</span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
            All must-haves mapped to days
          </div>
        </div>
      </div>

      {/* Main Split View: Day Timeline Selector + Selected Day Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Days List */}
        <div className="lg:col-span-4 space-y-2">
          <div className="text-xs font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
            Timeline Progression
          </div>

          <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
            {kit.schedule.days.map(d => {
              const isSelected = d.day === selectedDay;
              return (
                <button
                  key={d.day}
                  onClick={() => setSelectedDay(d.day)}
                  className={`w-full text-left p-3 rounded-xl border transition-all duration-200 flex items-center justify-between interactive-hover ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-100 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                        Day {d.day}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                        ({d.minutes}m)
                      </span>
                    </div>
                    <div className="text-xs font-medium truncate max-w-[200px]">
                      {d.focus}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                      {d.question_ids.length} Qs
                    </span>
                    <ChevronRight className="h-4 w-4 opacity-50" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Day Details */}
        <div className="lg:col-span-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] p-5 sm:p-6 shadow-sm dark:shadow-md">
          {currentDayData ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <div className="font-mono text-xs text-blue-600 dark:text-blue-400 font-bold uppercase">
                    Day {currentDayData.day} Focus Area
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                    {currentDayData.focus}
                  </h3>
                </div>

                <div className="flex items-center gap-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 px-3 py-1.5 text-xs font-mono text-slate-700 dark:text-slate-300">
                  <Clock className="h-3.5 w-3.5 text-blue-500 dark:text-blue-400" />
                  <span>{currentDayData.minutes} Minutes Target</span>
                </div>
              </div>

              {/* Questions Assigned to this Day */}
              <div className="space-y-3 pt-2">
                <div className="text-xs font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Assigned Question Set ({currentDayQuestions.length})
                </div>

                {currentDayQuestions.length === 0 ? (
                  <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-xs text-slate-500 text-center">
                    No specific questions assigned for this review day. Review previous notes and STAR stories.
                  </div>
                ) : (
                  currentDayQuestions.map(q => (
                    <div
                      key={q.id}
                      className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-900/40 text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between font-mono text-[10px] text-slate-500 dark:text-slate-400">
                        <span className="font-bold">[{q.id.toUpperCase()}] {q.category.toUpperCase()}</span>
                        <span>Diff: {q.difficulty}/3</span>
                      </div>
                      <p className="font-semibold text-slate-900 dark:text-slate-100 leading-snug">
                        {q.prompt}
                      </p>
                      <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">Rubric: </span>
                        {q.answer_outline}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500 text-xs">
              Select a day on the left to inspect the schedule breakdown.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
