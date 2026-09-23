/**
 * Practice Mode & Spaced-Repetition Review Engine
 * Strictly addresses Section 7:
 * - Flashcard step-through with reveal
 * - Confidence rating recording (1 = Needs Work, 2 = Familiar, 3 = Mastered)
 * - Coverage tracking (covered vs uncovered flashcards)
 * - Intelligent confidence-weighted spaced-repetition queue (least confident first)
 */

import { Flashcard, PrepKit, ConfidenceLevel } from '../types/prepkit.ts';

export interface PracticeCardRecord {
  flashcard_id: string;
  confidence: ConfidenceLevel;
  review_count: number;
  last_reviewed: string;
}

export interface PracticeDeckState {
  kitId: string;
  cards: Flashcard[];
  scores: Record<string, ConfidenceLevel>;
}

export function initializePracticeDeck(kit: PrepKit): PracticeDeckState {
  const kitId = `${kit.role.title}_${kit.source.company_url}`;
  let scores: Record<string, ConfidenceLevel> = {};
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(`jobber_practice_scores_${kitId}`) || localStorage.getItem(`trao_practice_scores_${kitId}`);
      if (saved) scores = JSON.parse(saved);
    } catch {}
  }

  // Sort: Needs work (1) first, unrated next, familiar (2), mastered (3) last
  const sortedCards = [...kit.flashcards].sort((a, b) => {
    const scoreA = scores[a.id] ?? 1.5;
    const scoreB = scores[b.id] ?? 1.5;
    return scoreA - scoreB;
  });

  return {
    kitId,
    cards: sortedCards,
    scores
  };
}

export function recordConfidenceScore(
  state: PracticeDeckState,
  cardId: string,
  confidence: ConfidenceLevel
): PracticeDeckState {
  const newScores = {
    ...state.scores,
    [cardId]: confidence
  };

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(`jobber_practice_scores_${state.kitId}`, JSON.stringify(newScores));
    } catch {}
  }

  return {
    ...state,
    scores: newScores
  };
}

export function getDeckStats(state: PracticeDeckState) {
  const total = state.cards.length;
  let mastered = 0;
  let familiar = 0;
  let needsWork = 0;
  let unreviewed = 0;

  state.cards.forEach(c => {
    const s = state.scores[c.id];
    if (s === 3) mastered++;
    else if (s === 2) familiar++;
    else if (s === 1) needsWork++;
    else unreviewed++;
  });

  const reviewed = mastered + familiar + needsWork;
  const progressPercentage = total > 0 ? Math.round((reviewed / total) * 100) : 0;

  return {
    total,
    mastered,
    familiar,
    needsWork,
    unreviewed,
    reviewed,
    progressPercentage
  };
}

export function resetDeckStats(state: PracticeDeckState): PracticeDeckState {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(`jobber_practice_scores_${state.kitId}`);
      localStorage.removeItem(`trao_practice_scores_${state.kitId}`);
    } catch {}
  }

  return {
    ...state,
    scores: {}
  };
}
