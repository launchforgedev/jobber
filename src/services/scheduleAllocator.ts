/**
 * Deterministic Arithmetic Schedule Allocator
 * Strictly implements Section 8:
 * - Distributes material across exactly `daysAvailable` days
 * - Every day has a focus, a set of question ids, and an integer duration in minutes
 * - Every must-have requirement appears somewhere in the schedule
 * - Harder (diff 3 > 2 > 1) and higher-priority (must > nice) material lands earlier, not the night before
 * - Arithmetic and allocation done strictly in code, not in a prompt
 */

import { Question, KitRequirement, KitSchedule, DaySchedule } from '../types/prepkit.ts';

/**
 * Calculates estimated integer minutes for a question based on category and difficulty
 */
function getQuestionMinutes(q: Question): number {
  const baseMinutesByDiff: Record<number, number> = {
    1: 15,
    2: 20,
    3: 30
  };
  const diff = Math.min(3, Math.max(1, Math.round(q.difficulty || 2)));
  let mins = baseMinutesByDiff[diff] || 20;

  if (q.category === 'system-design') {
    mins += 10;
  }
  return mins;
}

/**
 * Generates an intuitive focus title based on the day's questions and progression
 */
function generateDayFocus(dayIndex: number, totalDays: number, dayQuestions: Question[]): string {
  if (dayIndex === totalDays - 1 && totalDays > 1) {
    return 'Final Simulation & Behavioural Alignment';
  }
  if (dayQuestions.length === 0) {
    return `Active Recall & Concept Reinforcement (Day ${dayIndex + 1})`;
  }

  const categories = Array.from(new Set(dayQuestions.map(q => q.category)));
  const hasHard = dayQuestions.some(q => q.difficulty === 3);

  if (categories.includes('system-design')) {
    return hasHard ? 'High-Scale System Architecture & Must-Haves' : 'System Design & Trade-Offs';
  }
  if (categories.includes('technical') && !categories.includes('behavioural')) {
    return hasHard ? 'Deep-Dive Technical Fundamentals & Must-Haves' : 'Core Technical Competencies';
  }
  if (categories.includes('behavioural') || categories.includes('company-fit')) {
    return 'Leadership, STAR Stories & Culture Fit';
  }
  return `Targeted Mastery & Requirements Review`;
}

/**
 * Allocates questions across exactly daysAvailable days
 */
export function allocateSchedule(
  questions: Question[],
  requirements: KitRequirement[],
  daysAvailable: number
): KitSchedule {
  // Normalize daysAvailable to integer >= 1 (handles edge cases like 1 day or 60 days)
  const totalDays = Math.max(1, Math.min(90, Math.round(Number(daysAvailable) || 1)));

  if (questions.length === 0) {
    // Edge case: Empty question list
    const fallbackDays: DaySchedule[] = [];
    for (let d = 1; d <= totalDays; d++) {
      fallbackDays.push({
        day: d,
        focus: d === 1 ? 'Job Description Overview & Requirement Analysis' : `Study & Preparation (Day ${d})`,
        question_ids: [],
        minutes: 45
      });
    }
    return {
      days_available: totalDays,
      days: fallbackDays
    };
  }

  // Build requirement priority map
  const reqPriorityMap = new Map<string, 'must' | 'nice'>();
  requirements.forEach(r => reqPriorityMap.set(r.id, r.priority));

  // Score questions for early placement:
  // Must-haves score higher than nice-to-haves
  // Difficulty 3 > 2 > 1
  function getQuestionWeight(q: Question): number {
    const isMust = q.requirement_ids.some(rid => reqPriorityMap.get(rid) === 'must');
    const priorityScore = isMust ? 100 : 20;
    const diffScore = (q.difficulty || 2) * 15;
    const sysDesignBonus = q.category === 'system-design' ? 10 : 0;
    return priorityScore + diffScore + sysDesignBonus;
  }

  // Sort questions: heaviest (must-have + hard) first
  const sortedQuestions = [...questions].sort((a, b) => getQuestionWeight(b) - getQuestionWeight(a));

  // Determine must-have requirements that need to be guaranteed
  const mustReqs = new Set(requirements.filter(r => r.priority === 'must').map(r => r.id));
  const coveredMustReqs = new Set<string>();

  // Allocate day buckets
  const days: DaySchedule[] = [];
  const dayBuckets: Question[][] = Array.from({ length: totalDays }, () => []);

  if (totalDays === 1) {
    // Single-day intensive crunch: all questions packed into Day 1
    dayBuckets[0] = [...sortedQuestions];
  } else {
    // Multi-day distribution
    // Rule: Harder & higher-priority questions land earlier!
    // For days totalDays > 1, reserve the final day primarily for review/wrap-up
    const teachDays = totalDays > 2 ? totalDays - 1 : totalDays;

    sortedQuestions.forEach((q, idx) => {
      // Distribute sequentially to earlier days
      const targetDay = Math.min(teachDays - 1, Math.floor((idx / sortedQuestions.length) * teachDays));
      dayBuckets[targetDay].push(q);
      q.requirement_ids.forEach(rid => {
        if (mustReqs.has(rid)) coveredMustReqs.add(rid);
      });
    });

    // Check if any must-have requirement was missed in schedule
    mustReqs.forEach(mustId => {
      if (!coveredMustReqs.has(mustId)) {
        // Find any question covering this requirement and ensure it is placed in an early day
        const matchingQ = questions.find(q => q.requirement_ids.includes(mustId));
        if (matchingQ) {
          // Add to Day 1
          if (!dayBuckets[0].some(q => q.id === matchingQ.id)) {
            dayBuckets[0].unshift(matchingQ);
          }
        }
      }
    });

    // If later days have 0 questions (e.g. daysAvailable > questions.length),
    // allocate spaced repetition / recall sessions referencing prior important questions
    for (let d = 0; d < totalDays; d++) {
      if (dayBuckets[d].length === 0) {
        // Pick 1-2 key questions from earlier for active recall review
        const sampleIdx = d % sortedQuestions.length;
        dayBuckets[d].push(sortedQuestions[sampleIdx]);
      }
    }
  }

  // Construct final DaySchedule array
  for (let d = 0; d < totalDays; d++) {
    const dayQuestions = dayBuckets[d];
    const totalMinutes = dayQuestions.reduce((acc, q) => acc + getQuestionMinutes(q), 0);
    // Ensure integer minutes between 30 and 180
    const boundedMinutes = Math.max(30, Math.min(180, Math.round(totalMinutes)));

    days.push({
      day: d + 1,
      focus: generateDayFocus(d, totalDays, dayQuestions),
      question_ids: dayQuestions.map(q => q.id),
      minutes: boundedMinutes
    });
  }

  return {
    days_available: totalDays,
    days
  };
}
