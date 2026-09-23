/**
 * Deterministic Coverage Checker
 * Strictly implements Section 3 & 4 of Jobber Assessment:
 * - Compares generated questions against extracted requirements in code (NOT delegated to LLM)
 * - Identifies all requirements lacking corresponding question coverage
 * - Tracks must-have gaps as critical, triggers second-pass targeted question generation
 * - Returns structured KitCoverage: { uncovered_requirement_ids: string[], passes: number }
 */

import { KitRequirement, Question, KitCoverage } from '../types/prepkit.ts';

export interface CoverageAnalysis {
  coveredRequirementIds: string[];
  uncoveredRequirementIds: string[];
  uncoveredMustIds: string[];
  uncoveredNiceIds: string[];
  coverageRatio: number; // 0 to 1
  isFullyCovered: boolean;
}

/**
 * Pure deterministic comparison between extracted requirements and questions
 */
export function analyzeCoverage(
  requirements: KitRequirement[],
  questions: Question[]
): CoverageAnalysis {
  if (requirements.length === 0) {
    return {
      coveredRequirementIds: [],
      uncoveredRequirementIds: [],
      uncoveredMustIds: [],
      uncoveredNiceIds: [],
      coverageRatio: 1.0,
      isFullyCovered: true
    };
  }

  // Set of all requirement IDs that appear in any question's requirement_ids
  const coveredSet = new Set<string>();
  questions.forEach(q => {
    if (Array.isArray(q.requirement_ids)) {
      q.requirement_ids.forEach(rid => {
        if (rid) coveredSet.add(rid);
      });
    }
  });

  const uncoveredRequirementIds: string[] = [];
  const uncoveredMustIds: string[] = [];
  const uncoveredNiceIds: string[] = [];

  requirements.forEach(req => {
    if (!coveredSet.has(req.id)) {
      uncoveredRequirementIds.push(req.id);
      if (req.priority === 'must') {
        uncoveredMustIds.push(req.id);
      } else {
        uncoveredNiceIds.push(req.id);
      }
    }
  });

  const coveredCount = requirements.length - uncoveredRequirementIds.length;
  const coverageRatio = coveredCount / requirements.length;

  return {
    coveredRequirementIds: Array.from(coveredSet),
    uncoveredRequirementIds,
    uncoveredMustIds,
    uncoveredNiceIds,
    coverageRatio,
    isFullyCovered: uncoveredMustIds.length === 0
  };
}

/**
 * Builds the Appendix A coverage block
 */
export function buildCoverageReport(
  requirements: KitRequirement[],
  questions: Question[],
  passes: number
): KitCoverage {
  const analysis = analyzeCoverage(requirements, questions);
  return {
    uncovered_requirement_ids: analysis.uncoveredRequirementIds,
    passes: Math.max(1, Math.round(passes))
  };
}
