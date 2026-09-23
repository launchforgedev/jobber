/**
 * Automated Unit Test Suite for Trao Assessment
 * Strictly tests Section 14:
 * 1. Schedule allocation (exact days, integer minutes, must-haves covered, harder earlier)
 * 2. Coverage checking and second-pass gap resolution
 * 3. Structure validation against Appendix A schema
 */

import { KitRequirement, Question, PrepKit } from '../src/types/prepkit.ts';
import { allocateSchedule } from '../src/services/scheduleAllocator.ts';
import { analyzeCoverage, buildCoverageReport } from '../src/services/coverageChecker.ts';
import { stepCloseCoverageGaps } from '../src/services/aiGenerator.ts';

let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, testName: string, errorDetails?: string) {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    passedTests++;
  } else {
    console.error(`  ✗ FAIL: ${testName}${errorDetails ? ` - ${errorDetails}` : ''}`);
    failedTests++;
  }
}

async function runTests() {
  console.log('====================================================');
  console.log('Running Trao AI Interview Prep Kit Automated Tests');
  console.log('====================================================\n');

  // Sample Mock Requirements
  const mockRequirements: KitRequirement[] = [
    { id: 'r1', text: '5+ years Node.js and TypeScript', kind: 'technical', priority: 'must' },
    { id: 'r2', text: 'PostgreSQL distributed transactions', kind: 'technical', priority: 'must' },
    { id: 'r3', text: 'Mentoring junior developers', kind: 'behavioural', priority: 'must' },
    { id: 'r4', text: 'Experience with Kubernetes', kind: 'technical', priority: 'nice' }
  ];

  // Sample Mock Questions
  const mockQuestions: Question[] = [
    {
      id: 'q1',
      requirement_ids: ['r1'],
      category: 'technical',
      prompt: 'Explain asynchronous event loops in Node.js',
      answer_outline: 'Event loop phases, microtasks vs macrotasks...',
      difficulty: 2
    },
    {
      id: 'q2',
      requirement_ids: ['r2'],
      category: 'system-design',
      prompt: 'Design ACID compliant ledger transactions across shards',
      answer_outline: 'Two-phase commits, saga patterns, idempotency keys...',
      difficulty: 3
    },
    {
      id: 'q3',
      requirement_ids: ['r3'],
      category: 'behavioural',
      prompt: 'Tell me about a time you coached an underperforming engineer',
      answer_outline: 'Empathy, structured milestone feedback, outcome...',
      difficulty: 1
    }
  ];

  // ----------------------------------------------------
  // TEST SUITE 1: Schedule Allocation
  // ----------------------------------------------------
  console.log('TEST SUITE 1: Deterministic Schedule Allocation');

  // 1.1 Match exact requested days (5 days)
  const schedule5 = allocateSchedule(mockQuestions, mockRequirements, 5);
  assert(schedule5.days_available === 5, 'Schedule days_available matches requested (5)');
  assert(schedule5.days.length === 5, 'Schedule days array length matches exactly (5)');

  // 1.2 Edge case: 1 day crunch
  const schedule1 = allocateSchedule(mockQuestions, mockRequirements, 1);
  assert(schedule1.days.length === 1, 'Schedule handles 1-day crunch exactly (1 day)');

  // 1.3 Edge case: 30 days
  const schedule30 = allocateSchedule(mockQuestions, mockRequirements, 30);
  assert(schedule30.days.length === 30, 'Schedule handles 30-day allocation exactly (30 days)');

  // 1.4 Durations are integer minutes
  const allMinutesIntegers = schedule5.days.every(d => Number.isInteger(d.minutes) && d.minutes > 0);
  assert(allMinutesIntegers, 'All day durations are positive integer minutes (no floats, no text)');

  // 1.5 Must-have requirements appear in the schedule
  const allScheduledQuestionIds = new Set(schedule5.days.flatMap(d => d.question_ids));
  const scheduledQuestions = mockQuestions.filter(q => allScheduledQuestionIds.has(q.id));
  const coveredReqsInSchedule = new Set(scheduledQuestions.flatMap(q => q.requirement_ids));
  const mustReqs = mockRequirements.filter(r => r.priority === 'must');
  const allMustInSchedule = mustReqs.every(mr => coveredReqsInSchedule.has(mr.id));
  assert(allMustInSchedule, 'Every must-have requirement appears somewhere in the schedule');

  // 1.6 Harder material lands earlier
  const day1Questions = mockQuestions.filter(q => schedule5.days[0].question_ids.includes(q.id));
  const day5Questions = mockQuestions.filter(q => schedule5.days[4].question_ids.includes(q.id));
  const day1MaxDiff = Math.max(...day1Questions.map(q => q.difficulty), 0);
  const day5MaxDiff = Math.max(...day5Questions.map(q => q.difficulty), 0);
  assert(day1MaxDiff >= day5MaxDiff, 'Harder material lands earlier in schedule, not the final night');

  console.log('');

  // ----------------------------------------------------
  // TEST SUITE 2: Coverage Checking & Second-Pass Loop
  // ----------------------------------------------------
  console.log('TEST SUITE 2: Coverage Checking & Gap Resolution');

  // Test coverage gap detection
  // Notice mockRequirements has 'r4' (Kubernetes, nice-to-have) not covered in mockQuestions
  const coverageAnalysis = analyzeCoverage(mockRequirements, mockQuestions);
  assert(!coverageAnalysis.coveredRequirementIds.includes('r4'), 'Correctly flags uncovered requirement r4');
  assert(coverageAnalysis.uncoveredMustIds.length === 0, 'Correctly verifies that all must-haves are covered in base set');
  assert(coverageAnalysis.isFullyCovered === true, 'isFullyCovered is true when all must-haves are satisfied');

  // Test when a must-have is missing
  const partialQuestions = mockQuestions.filter(q => !q.requirement_ids.includes('r2'));
  const partialAnalysis = analyzeCoverage(mockRequirements, partialQuestions);
  assert(partialAnalysis.uncoveredMustIds.includes('r2'), 'Correctly catches missing must-have requirement r2');
  assert(partialAnalysis.isFullyCovered === false, 'isFullyCovered is false when must-have is missing');

  // Test Second-Pass gap closing
  const closedResult = await stepCloseCoverageGaps(mockRequirements, partialQuestions, 'Backend Engineer', 2);
  const reAnalysis = analyzeCoverage(mockRequirements, closedResult.questions);
  assert(reAnalysis.uncoveredMustIds.length === 0, 'Second pass generates questions to close all must-have gaps');
  assert(closedResult.passes >= 1, 'Passes count is accurately tracked');

  console.log('');

  // ----------------------------------------------------
  // TEST SUITE 3: Appendix A Kit Structure Conformance
  // ----------------------------------------------------
  console.log('TEST SUITE 3: Appendix A Kit Structure Conformance');

  const testKit: PrepKit = {
    source: {
      company: 'Acme Payments',
      company_url: 'https://acme.example.com',
      role: 'Senior Backend Engineer',
      location: 'Remote',
      jd_chars: 1450,
      researched_at: new Date().toISOString(),
      pages_used: ['https://acme.example.com', 'https://acme.example.com/careers']
    },
    company_brief: {
      summary: 'Global payments infrastructure provider.',
      what_they_do: 'Process high-volume credit transactions.',
      sources: ['https://acme.example.com']
    },
    role: {
      title: 'Senior Backend Engineer',
      seniority: 'Senior',
      responsibilities: ['Architect scalable ledgers'],
      requirements: mockRequirements
    },
    questions: mockQuestions,
    flashcards: [
      { id: 'f1', front: 'ACID properties', back: 'Atomicity, Consistency, Isolation, Durability', requirement_ids: ['r2'] }
    ],
    schedule: schedule5,
    coverage: buildCoverageReport(mockRequirements, mockQuestions, 1)
  };

  // Validate all Appendix A required top-level keys
  const requiredKeys = ['source', 'company_brief', 'role', 'questions', 'flashcards', 'schedule', 'coverage'];
  const hasAllKeys = requiredKeys.every(k => k in testKit);
  assert(hasAllKeys, 'Kit contains all mandatory top-level keys specified in Appendix A');

  // Validate question schema
  const qValid = testKit.questions.every(q => (
    typeof q.id === 'string' &&
    Array.isArray(q.requirement_ids) &&
    ['technical', 'behavioural', 'system-design', 'company-fit'].includes(q.category) &&
    typeof q.prompt === 'string' &&
    typeof q.answer_outline === 'string' &&
    [1, 2, 3].includes(q.difficulty)
  ));
  assert(qValid, 'All questions adhere strictly to Appendix A question fields and constraints');

  // Validate schedule question_ids refer to existing questions
  const existingQIds = new Set(testKit.questions.map(q => q.id));
  const validScheduleRefs = testKit.schedule.days.every(d =>
    d.question_ids.every(qid => existingQIds.has(qid))
  );
  assert(validScheduleRefs, 'All schedule question_ids refer to questions that exist in the kit');

  console.log('\n====================================================');
  console.log(`Test Execution Summary: ${passedTests} Passed, ${failedTests} Failed.`);
  console.log('====================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Fatal test execution error:', err);
  process.exit(1);
});
