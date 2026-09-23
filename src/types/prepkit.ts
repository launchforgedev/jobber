/**
 * Appendix A & B TypeScript Schemas for Jobber AI Interview Prep Kit
 */

export type RequirementKind = 'technical' | 'behavioural' | 'domain';
export type RequirementPriority = 'must' | 'nice';
export type QuestionCategory = 'technical' | 'behavioural' | 'system-design' | 'company-fit';

export interface KitRequirement {
  id: string; // e.g. "r1", "r2"
  text: string;
  kind: RequirementKind;
  priority: RequirementPriority;
}

export type Requirement = KitRequirement;
export type ConfidenceLevel = 1 | 2 | 3;

export interface RoleBreakdown {
  title: string;
  seniority: string;
  responsibilities: string[];
  requirements: KitRequirement[];
}

export interface KitSource {
  company: string;
  company_url: string;
  role: string;
  location: string;
  jd_chars: number;
  researched_at: string;
  pages_used: string[];
}

export interface CompanyBrief {
  summary: string;
  what_they_do: string;
  sources: string[];
}

export interface Question {
  id: string; // e.g. "q1", "q2"
  requirement_ids: string[];
  category: QuestionCategory;
  prompt: string;
  answer_outline: string;
  difficulty: number; // integer 1, 2, or 3
  // Builder state extension
  _state?: 'generated' | 'edited' | 'pinned' | 'manual';
}

export interface Flashcard {
  id: string; // e.g. "f1", "f2"
  front: string;
  back: string;
  requirement_ids: string[];
  _state?: 'generated' | 'edited' | 'pinned' | 'manual';
}

export interface DaySchedule {
  day: number;
  focus: string;
  question_ids: string[];
  minutes: number; // integer minutes
}

export interface KitSchedule {
  days_available: number;
  days: DaySchedule[];
}

export interface KitCoverage {
  uncovered_requirement_ids: string[];
  passes: number;
}

/**
 * Exact Appendix A Kit Structure
 */
export interface PrepKit {
  source: KitSource;
  company_brief: CompanyBrief;
  role: RoleBreakdown;
  questions: Question[];
  flashcards: Flashcard[];
  schedule: KitSchedule;
  coverage: KitCoverage;
}

/**
 * Practice tracking record
 */
export interface PracticeCardRecord {
  flashcard_id: string;
  confidence: 1 | 2 | 3; // 1 = Low / Forgot, 2 = Medium / Partial, 3 = High / Mastered
  reviewed_at: string;
  review_count: number;
}

/**
 * Appendix B Batch Input Case
 */
export interface BatchInputCase {
  id: string;
  jd: string;
  company_url: string;
  days: number;
}

/**
 * Appendix B Batch Output
 */
export interface BatchOutputKitSuccess {
  id: string;
  status: 'ok';
  kit: PrepKit;
  error: null;
}

export interface BatchOutputKitFailure {
  id: string;
  status: 'failed';
  kit: null;
  error: {
    code: string;
    message: string;
  };
}

export type BatchOutputItem = BatchOutputKitSuccess | BatchOutputKitFailure;

export interface BatchOutput {
  version: '1.0';
  generated_at: string;
  kits: BatchOutputItem[];
}

/**
 * User & Session Auth
 */
export interface UserSession {
  userId: string;
  email: string;
  token: string;
  createdAt: string;
}

export interface GenerationStepProgress {
  step: 'extracting' | 'crawling' | 'generating' | 'coverage' | 'scheduling' | 'complete' | 'failed';
  message: string;
  percentage: number;
  details?: string[];
}
