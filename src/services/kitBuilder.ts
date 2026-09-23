/**
 * Kit Builder State Management & Granular Regeneration
 * Strictly addresses Section 6:
 * - Inline editing of questions, answer outlines, flashcards, briefs
 * - Moving questions across categories and reordering
 * - Preserving 'generated', 'edited', 'pinned', and 'manual' state
 * - Regenerating single sections without clobbering user modifications
 */

import { PrepKit, Question, Flashcard, QuestionCategory, KitSchedule } from '../types/prepkit.ts';
import { allocateSchedule } from './scheduleAllocator.ts';
import { buildCoverageReport } from './coverageChecker.ts';
import { stepGenerateCategoryQuestions, stepResearchCompany } from './aiGenerator.ts';
import { crawlCompanySite } from './scraper.ts';

/**
 * Updates a question inline and marks its state as 'edited' (unless already pinned or manual)
 */
export function updateQuestion(
  kit: PrepKit,
  questionId: string,
  updates: Partial<Question>
): PrepKit {
  const updatedQuestions: Question[] = kit.questions.map(q => {
    if (q.id === questionId) {
      const nextState: 'edited' | 'pinned' | 'manual' = q._state === 'pinned' ? 'pinned' : q._state === 'manual' ? 'manual' : 'edited';
      return {
        ...q,
        ...updates,
        _state: nextState
      };
    }
    return q;
  });

  return {
    ...kit,
    questions: updatedQuestions,
    coverage: buildCoverageReport(kit.role.requirements, updatedQuestions, kit.coverage.passes)
  };
}

/**
 * Toggles the pinned state of a question
 */
export function togglePinQuestion(kit: PrepKit, questionId: string): PrepKit {
  const updatedQuestions: Question[] = kit.questions.map(q => {
    if (q.id === questionId) {
      const nextState: 'edited' | 'pinned' = q._state === 'pinned' ? 'edited' : 'pinned';
      return {
        ...q,
        _state: nextState
      };
    }
    return q;
  });

  return { ...kit, questions: updatedQuestions };
}

/**
 * Adds a new question manually by hand
 */
export function addManualQuestion(
  kit: PrepKit,
  category: QuestionCategory,
  prompt: string,
  answer_outline: string,
  difficulty = 2,
  requirement_ids: string[] = []
): PrepKit {
  const newId = `q${Date.now().toString().slice(-4)}`;
  const newQuestion: Question = {
    id: newId,
    requirement_ids: requirement_ids.length > 0 ? requirement_ids : [kit.role.requirements[0]?.id || 'r1'],
    category,
    prompt: prompt || 'New Question Prompt',
    answer_outline: answer_outline || 'Key points to discuss...',
    difficulty: Math.min(3, Math.max(1, difficulty)),
    _state: 'manual'
  };

  const updatedQuestions = [...kit.questions, newQuestion];
  const updatedSchedule = allocateSchedule(updatedQuestions, kit.role.requirements, kit.schedule.days_available);

  return {
    ...kit,
    questions: updatedQuestions,
    schedule: updatedSchedule,
    coverage: buildCoverageReport(kit.role.requirements, updatedQuestions, kit.coverage.passes)
  };
}

/**
 * Deletes a question and re-balances schedule
 */
export function deleteQuestion(kit: PrepKit, questionId: string): PrepKit {
  const updatedQuestions = kit.questions.filter(q => q.id !== questionId);
  const updatedSchedule = allocateSchedule(updatedQuestions, kit.role.requirements, kit.schedule.days_available);

  return {
    ...kit,
    questions: updatedQuestions,
    schedule: updatedSchedule,
    coverage: buildCoverageReport(kit.role.requirements, updatedQuestions, kit.coverage.passes)
  };
}

/**
 * Moves question to a different category
 */
export function moveQuestionCategory(kit: PrepKit, questionId: string, newCategory: QuestionCategory): PrepKit {
  return updateQuestion(kit, questionId, { category: newCategory });
}

/**
 * Reorders questions within the kit
 */
export function reorderQuestions(kit: PrepKit, fromIndex: number, toIndex: number): PrepKit {
  if (fromIndex < 0 || toIndex < 0 || fromIndex >= kit.questions.length || toIndex >= kit.questions.length) {
    return kit;
  }

  const updated = [...kit.questions];
  const [moved] = updated.splice(fromIndex, 1);
  updated.splice(toIndex, 0, moved);

  return { ...kit, questions: updated };
}

/**
 * Regenerates ONE category without clobbering user-edited, pinned, or manual questions!
 */
export async function regenerateCategory(
  kit: PrepKit,
  targetCategory: QuestionCategory,
  onProgress?: (msg: string) => void
): Promise<PrepKit> {
  onProgress?.(`Preserving user-edited and pinned items in "${targetCategory}"...`);

  // 1. Separate questions: keep untouched items in other categories, and preserve user-edited items in this category
  const otherCategoryQuestions = kit.questions.filter(q => q.category !== targetCategory);
  const preservedCategoryQuestions = kit.questions.filter(
    q => q.category === targetCategory && (q._state === 'pinned' || q._state === 'edited' || q._state === 'manual')
  );

  // 2. Generate fresh questions for target category
  onProgress?.(`Generating new candidate questions for "${targetCategory}"...`);
  const freshQuestions = await stepGenerateCategoryQuestions(
    targetCategory,
    kit.role.requirements,
    kit.company_brief,
    kit.role.title,
    Date.now() % 1000
  );

  // 3. Merge: Keep preserved items first, then add fresh questions
  const mergedCategoryQuestions = [...preservedCategoryQuestions, ...freshQuestions];
  const allQuestions = [...otherCategoryQuestions, ...mergedCategoryQuestions];

  // 4. Re-allocate schedule to incorporate new question ids
  onProgress?.('Re-allocating study schedule with updated question bank...');
  const updatedSchedule = allocateSchedule(allQuestions, kit.role.requirements, kit.schedule.days_available);

  return {
    ...kit,
    questions: allQuestions,
    schedule: updatedSchedule,
    coverage: buildCoverageReport(kit.role.requirements, allQuestions, kit.coverage.passes)
  };
}

/**
 * Regenerates the company brief section independently
 */
export async function regenerateCompanyBrief(
  kit: PrepKit,
  onProgress?: (msg: string) => void
): Promise<PrepKit> {
  onProgress?.(`Re-crawling company domain: ${kit.source.company_url}...`);
  const crawl = await crawlCompanySite(kit.source.company_url, true, msg => onProgress?.(msg));

  onProgress?.('Synthesizing updated company brief...');
  const newBrief = await stepResearchCompany(kit.source.company_url, crawl, kit.role.title);

  return {
    ...kit,
    company_brief: newBrief,
    source: {
      ...kit.source,
      pages_used: crawl.sourcesUsed
    }
  };
}

/**
 * Regenerates only the study schedule with new day count
 */
export function regenerateSchedule(kit: PrepKit, newDaysAvailable: number): PrepKit {
  const newSchedule = allocateSchedule(kit.questions, kit.role.requirements, newDaysAvailable);
  return {
    ...kit,
    schedule: newSchedule
  };
}

// Aliases matching component import names
export const updateQuestionInKit = updateQuestion;
export const deleteQuestionFromKit = deleteQuestion;

export function addManualQuestionToKit(
  kit: PrepKit,
  params: {
    category: QuestionCategory;
    prompt: string;
    answer_outline: string;
    difficulty?: number;
    requirement_ids?: string[];
  }
): PrepKit {
  return addManualQuestion(
    kit,
    params.category,
    params.prompt,
    params.answer_outline,
    params.difficulty ?? 2,
    params.requirement_ids ?? []
  );
}

export function reorderQuestionInKit(kit: PrepKit, questionId: string, direction: 'up' | 'down'): PrepKit {
  const idx = kit.questions.findIndex(q => q.id === questionId);
  if (idx === -1) return kit;
  const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
  return reorderQuestions(kit, idx, targetIdx);
}

export type RegenerateAction =
  | { type: 'category'; category: QuestionCategory }
  | { type: 'company_brief' }
  | { type: 'schedule'; days: number };

export async function regenerateSectionInKit(
  kit: PrepKit,
  action: RegenerateAction,
  onProgress?: (msg: string) => void
): Promise<PrepKit> {
  if (action.type === 'category') {
    return regenerateCategory(kit, action.category, onProgress);
  }
  if (action.type === 'company_brief') {
    return regenerateCompanyBrief(kit, onProgress);
  }
  if (action.type === 'schedule') {
    return regenerateSchedule(kit, action.days);
  }
  return kit;
}
