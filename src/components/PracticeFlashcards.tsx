import React, { useState, useEffect } from 'react';
import {
  BookOpen, RotateCw, CheckCircle2, AlertTriangle, ArrowRight,
  ArrowLeft, Shuffle, Check, Flame, Trophy, Award
} from 'lucide-react';
import { PrepKit, Flashcard, ConfidenceLevel } from '../types/prepkit.ts';
import {
  initializePracticeDeck,
  recordConfidenceScore,
  getDeckStats,
  resetDeckStats
} from '../services/practiceEngine.ts';

interface PracticeFlashcardsProps {
  kit: PrepKit;
}

export const PracticeFlashcards: React.FC<PracticeFlashcardsProps> = ({ kit }) => {
  const [deckState, setDeckState] = useState(() => initializePracticeDeck(kit));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Re-initialize if kit changes
  useEffect(() => {
    setDeckState(initializePracticeDeck(kit));
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [kit.source.company_url, kit.role.title]);

  const cards = deckState.cards;
  const currentCard = cards[currentIndex] || cards[0];
  const stats = getDeckStats(deckState);

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        setIsFlipped(prev => !prev);
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === '1') {
        handleScore(1);
      } else if (e.key === '2') {
        handleScore(2);
      } else if (e.key === '3') {
        handleScore(3);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, cards.length, isFlipped]);

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex(prev => (prev + 1) % Math.max(1, cards.length));
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex(prev => (prev - 1 + cards.length) % Math.max(1, cards.length));
  };

  const handleScore = (confidence: ConfidenceLevel) => {
    if (!currentCard) return;
    const nextState = recordConfidenceScore(deckState, currentCard.id, confidence);
    setDeckState(nextState);
    handleNext();
  };

  const handleReset = () => {
    const reset = resetDeckStats(deckState);
    setDeckState(reset);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  if (!currentCard) {
    return (
      <div className="p-12 text-center text-slate-500 text-sm">
        No active flashcards in this kit yet.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 animate-fade-in">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-amber-500 dark:text-amber-400" />
            <span>Spaced-Repetition Practice Deck</span>
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Active recall mode with confidence ratings. Cards flagged with lower confidence rotate forward dynamically.
          </p>
        </div>

        <button
          onClick={handleReset}
          className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors"
        >
          Reset Session Scores
        </button>
      </div>

      {/* Progress & Confidence Stats Bar */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-xs font-mono w-full sm:w-auto justify-between sm:justify-start">
          <span className="text-slate-500 dark:text-slate-400">
            Card <strong className="text-slate-900 dark:text-white">{currentIndex + 1}</strong> of <strong className="text-slate-900 dark:text-white">{cards.length}</strong>
          </span>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
            <Check className="h-3.5 w-3.5" />
            <span>{stats.mastered} Mastered</span>
          </span>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
            <span>{stats.needsWork} In Review</span>
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full sm:w-48 bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
          <div
            className="bg-amber-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${stats.progressPercentage}%` }}
          />
        </div>
      </div>

      {/* 3D Flashcard Flip Container */}
      <div className="perspective-1000 w-full min-h-[320px] sm:min-h-[360px] flex items-center justify-center">
        <div
          onClick={() => setIsFlipped(!isFlipped)}
          className={`w-full min-h-[320px] sm:min-h-[360px] relative cursor-pointer select-none rounded-2xl border transition-all duration-500 transform-style-3d shadow-md hover:shadow-xl ${
            isFlipped ? 'rotate-y-180' : ''
          } ${
            isFlipped
              ? 'border-indigo-400 dark:border-indigo-600/60 bg-indigo-50/30 dark:bg-slate-900'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a]'
          }`}
        >
          {/* Card Front: Prompt / Question */}
          <div className="absolute inset-0 backface-hidden p-6 sm:p-8 flex flex-col justify-between rounded-2xl">
            <div className="flex items-center justify-between text-xs font-mono text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-3">
              <span className="font-bold">FLASHCARD [{currentCard.id.toUpperCase()}]</span>
              <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] uppercase">
                Active Recall Prompt
              </span>
            </div>

            <div className="my-auto py-6">
              <p className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white leading-relaxed text-center">
                {currentCard.front}
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-mono">
              <RotateCw className="h-3.5 w-3.5" />
              <span>Click card or press <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">Space</kbd> to reveal expected rubric</span>
            </div>
          </div>

          {/* Card Back: Expected Answer & Rubric */}
          <div className="absolute inset-0 backface-hidden rotate-y-180 p-6 sm:p-8 flex flex-col justify-between rounded-2xl bg-slate-50 dark:bg-[#0b1120]">
            <div className="flex items-center justify-between text-xs font-mono text-indigo-600 dark:text-indigo-400 border-b border-slate-200 dark:border-slate-800 pb-3">
              <span className="font-bold">EXPECTED RUBRIC & KEY SIGNALS</span>
              <span className="px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-[10px] uppercase font-semibold">
                Answer Outline
              </span>
            </div>

            <div className="my-auto py-4 overflow-y-auto max-h-[220px]">
              <div className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed space-y-2">
                {currentCard.back.split('\n\n').map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-mono">
              <span>Rate your recall below to adjust frequency</span>
            </div>
          </div>
        </div>
      </div>

      {/* Confidence Rating Controls (Section 7) */}
      <div className="space-y-3">
        <div className="text-center text-xs font-mono text-slate-500 dark:text-slate-400">
          How confident were you answering this prompt?
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <button
            onClick={() => handleScore(1)}
            className="flex flex-col sm:flex-row items-center justify-center gap-1.5 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50/70 dark:bg-red-950/30 p-3 sm:py-3 text-xs font-semibold text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/50 transition-all duration-150 interactive-hover"
          >
            <span className="font-mono text-[10px] opacity-75 sm:inline hidden">[1]</span>
            <span>Needs Work</span>
          </button>

          <button
            onClick={() => handleScore(2)}
            className="flex flex-col sm:flex-row items-center justify-center gap-1.5 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/70 dark:bg-amber-950/30 p-3 sm:py-3 text-xs font-semibold text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-all duration-150 interactive-hover"
          >
            <span className="font-mono text-[10px] opacity-75 sm:inline hidden">[2]</span>
            <span>Familiar</span>
          </button>

          <button
            onClick={() => handleScore(3)}
            className="flex flex-col sm:flex-row items-center justify-center gap-1.5 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/70 dark:bg-emerald-950/30 p-3 sm:py-3 text-xs font-semibold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-all duration-150 interactive-hover"
          >
            <span className="font-mono text-[10px] opacity-75 sm:inline hidden">[3]</span>
            <span>Mastered</span>
          </button>
        </div>

        {/* Navigation Arrows */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={handlePrev}
            className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Previous Card (←)</span>
          </button>

          <button
            onClick={handleNext}
            className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <span>Next Card (→)</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
