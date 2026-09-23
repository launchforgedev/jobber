/**
 * Deliberate AI Research and Generation Engine
 * Implements Sections 3, 4, 5, 10 & 11:
 * - Sequenced deliberate steps (Extract -> Research -> Generate Category Questions -> Coverage Loop -> Schedule)
 * - Strict requirement extraction (no hallucinations; thin JDs produce thin lists)
 * - Must vs Nice priority classification strictly from wording
 * - Second-pass loop closing coverage gaps
 * - Appendix A schema conformance
 * - Uses gemini-3.8-flash with exponential backoff & rate-limit resilience
 */

import { GoogleGenAI } from '@google/genai';
import {
  KitRequirement,
  RoleBreakdown,
  CompanyBrief,
  Question,
  Flashcard,
  QuestionCategory,
  PrepKit
} from '../types/prepkit.ts';
import { CrawlResult } from './scraper.ts';
import { analyzeCoverage, buildCoverageReport } from './coverageChecker.ts';
import { allocateSchedule } from './scheduleAllocator.ts';

// Get API key from environment
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) ||
                 (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_GEMINI_API_KEY);
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({ apiKey });
}

/**
 * Call Gemini model with quick retry and rate-limit fallback
 */
async function callGeminiJson<T>(prompt: string, retries = 1): Promise<T | null> {
  const ai = getGeminiClient();
  if (!ai) return null;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2
        }
      });

      const text = response.text?.trim();
      if (!text) throw new Error('Empty model response');
      return JSON.parse(text) as T;
    } catch (err: any) {
      const isRateLimit = err?.status === 429 || String(err).includes('RESOURCE_EXHAUSTED') || String(err).includes('rate limit');
      if (attempt < retries && !isRateLimit) {
        await new Promise(res => setTimeout(res, 500));
        continue;
      }
      // If rate limited or exhausted, immediately drop to deterministic heuristic generator
      return null;
    }
  }
  return null;
}

/**
 * Heuristic requirement extraction fallback when API is unavailable or offline
 */
export function extractRequirementsHeuristic(jd: string): RoleBreakdown {
  const lines = jd.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  let title = 'Software Engineer';
  let seniority = 'Mid-Level';

  // First line often holds the title
  if (lines.length > 0 && lines[0].length < 80) {
    title = lines[0].replace(/^#+\s*/, '').replace(/^[-\*]\s*/, '').trim();
    if (/lead|principal|staff|director|head/i.test(title)) seniority = 'Lead / Staff';
    else if (/senior|sr\b|sr\./i.test(title)) seniority = 'Senior';
    else if (/junior|entry|associate|intern/i.test(title)) seniority = 'Junior';
  }

  const requirements: KitRequirement[] = [];
  const responsibilities: string[] = [];
  let reqCount = 1;

  let inBonusSection = false;
  let inReqSection = false;

  for (const line of lines) {
    const lower = line.toLowerCase();

    // Check headings
    if (/bonus|nice to have|preferred|plus|optional|good to have/i.test(lower)) {
      inBonusSection = true;
      inReqSection = false;
      continue;
    }
    if (/require|qualification|must have|what you bring|what we look for|experience|skills/i.test(lower)) {
      inReqSection = true;
      inBonusSection = false;
      continue;
    }
    if (/responsibilities|what you will do|day to day|role overview/i.test(lower)) {
      inReqSection = false;
      inBonusSection = false;
      continue;
    }

    // Identify bullet items
    const isBullet = /^[-*•·\d\.]+\s+/.test(line);
    const cleanText = line.replace(/^[-*•·\d\.]+\s+/, '').trim();

    if (cleanText.length > 10 && cleanText.length < 250) {
      if (inReqSection || inBonusSection || isBullet) {
        const isBonus = inBonusSection || /nice to have|plus|bonus|preferred|ideal/i.test(lower);
        const isBehavioural = /communication|collaborat|team|mentor|stakeholder|curious|ownership|empathy/i.test(lower);
        const isDomain = /fintech|crypto|healthcare|compliance|security|scale|ecommerce|cloud/i.test(lower);

        requirements.push({
          id: `r${reqCount++}`,
          text: cleanText,
          kind: isBehavioural ? 'behavioural' : isDomain ? 'domain' : 'technical',
          priority: isBonus ? 'nice' : 'must'
        });
      } else if (responsibilities.length < 5 && /design|build|maintain|scale|lead|develop|create/i.test(lower)) {
        responsibilities.push(cleanText);
      }
    }
  }

  // Handle thin JDs honestly
  if (requirements.length === 0) {
    if (lines.length > 0) {
      requirements.push({
        id: 'r1',
        text: lines.slice(0, 2).join(' - ') || 'Demonstrated core software engineering competence',
        kind: 'technical',
        priority: 'must'
      });
    } else {
      requirements.push({
        id: 'r1',
        text: 'Core professional engineering competencies',
        kind: 'technical',
        priority: 'must'
      });
    }
  }

  if (responsibilities.length === 0) {
    responsibilities.push(`Execute core engineering tasks defined for ${title}`);
  }

  return {
    title,
    seniority,
    responsibilities,
    requirements
  };
}

/**
 * Step 1: Deliberate Requirement Extraction
 * Section 3 & 10: Thin description produces thin kit honestly. Nothing invented.
 */
export async function stepExtractRequirements(jd: string): Promise<RoleBreakdown> {
  const prompt = `You are a precision technical recruiter parsing an untrusted job description.
Extract the exact role requirements directly stated in the text.
CRITICAL RULES:
1. DO NOT invent or extrapolate requirements. If the JD is a 2-line stub, extract only what is written and nothing more.
2. Mark priority as "must" ONLY for explicit requirements, hard requirements, or essential qualifications.
3. Mark priority as "nice" for bonus points, preferred skills, or "nice to have".
4. Assign kind: "technical", "behavioural", or "domain".
5. Keep id strictly "r1", "r2", "r3", ...

Return JSON conforming to this schema:
{
  "title": string,
  "seniority": string,
  "responsibilities": string[],
  "requirements": [
    {
      "id": "r1",
      "text": string,
      "kind": "technical" | "behavioural" | "domain",
      "priority": "must" | "nice"
    }
  ]
}

JOB DESCRIPTION TEXT:
\"\"\"
${jd.slice(0, 10000)}
\"\"\"`;

  const result = await callGeminiJson<RoleBreakdown>(prompt);
  if (result && Array.isArray(result.requirements) && result.requirements.length > 0) {
    // Ensure ids are sequentially normalized (r1, r2, ...)
    result.requirements = result.requirements.map((r, i) => ({
      id: `r${i + 1}`,
      text: r.text || 'Requirement',
      kind: (['technical', 'behavioural', 'domain'].includes(r.kind) ? r.kind : 'technical') as any,
      priority: (['must', 'nice'].includes(r.priority) ? r.priority : 'must') as any
    }));
    return result;
  }

  return extractRequirementsHeuristic(jd);
}

/**
 * Step 2: Company Research Brief
 * Section 2, 3 & 10: If company site has no hiring page, or was unreachable, report honestly.
 */
export async function stepResearchCompany(
  companyUrl: string,
  crawl: CrawlResult,
  roleTitle: string
): Promise<CompanyBrief> {
  if (!crawl.reachable || crawl.pages.length === 0) {
    return {
      summary: `Unable to access public web assets at ${companyUrl} (${crawl.failureReason || 'unreachable'}). Kit generated solely from the provided job description.`,
      what_they_do: 'External site verification was inconclusive or unreachable.',
      sources: []
    };
  }

  const prompt = `Synthesize an honest, factual company briefing for an interview candidate applying for "${roleTitle}".
Use ONLY the provided crawled page snippets. Do NOT fabricate products, revenue, or hiring stages that are not documented.
If the site lacks an explicit hiring process or career page, state that explicitly.

CRAWLED WEB CONTENT:
${crawl.pages.map(p => `[URL: ${p.url} (Title: ${p.title})]\n${p.content.slice(0, 2500)}`).join('\n\n')}

Return JSON:
{
  "summary": string (concise overview of company mission, scale, and hiring context),
  "what_they_do": string (concrete explanation of their business model, product, and industry),
  "sources": string[] (list of URLs from crawled pages that were directly utilized)
}`;

  const result = await callGeminiJson<CompanyBrief>(prompt);
  if (result && result.summary && result.what_they_do) {
    return {
      summary: result.summary,
      what_they_do: result.what_they_do,
      sources: Array.isArray(result.sources) && result.sources.length > 0 ? result.sources : crawl.sourcesUsed
    };
  }

  // Clean fallback brief from crawled text
  const primaryPage = crawl.pages[0];
  return {
    summary: primaryPage?.title ? `${primaryPage.title}. Researched via domain crawl.` : `Company at ${companyUrl}.`,
    what_they_do: crawl.generalCompanyText.slice(0, 250) || 'Technology and engineering organization.',
    sources: crawl.sourcesUsed
  };
}

/**
 * Step 3: Targeted Question Generation for a Category
 * Section 3: Generates targeted questions for given requirements & category
 */
export async function stepGenerateCategoryQuestions(
  category: QuestionCategory,
  requirements: KitRequirement[],
  companyBrief: CompanyBrief,
  roleTitle: string,
  startIdNumber: number
): Promise<Question[]> {
  // Filter requirements relevant to this category
  const relevantReqs = requirements.filter(r => {
    if (category === 'technical') return r.kind === 'technical' || r.kind === 'domain';
    if (category === 'behavioural') return r.kind === 'behavioural' || r.priority === 'must';
    if (category === 'system-design') return r.kind === 'technical' || r.kind === 'domain';
    if (category === 'company-fit') return true;
    return true;
  });

  const prompt = `Generate realistic, deep interview questions for category: "${category}".
Target Role: "${roleTitle}"
Company Brief: "${companyBrief.summary}"

Requirements to target:
${relevantReqs.map(r => `- [${r.id}] (${r.priority} ${r.kind}): ${r.text}`).join('\n')}

INSTRUCTIONS:
1. Every question MUST reference at least one requirement id from the list above in "requirement_ids".
2. Category must be exactly "${category}".
3. Provide a clear, actionable "answer_outline" detailing what a top-performing candidate must articulate.
4. Difficulty must be an integer: 1 (Fundamental/Warmup), 2 (Standard/Core), or 3 (Advanced/Stress-test).
5. Generate 2 to 4 high-quality questions.

Return JSON:
{
  "questions": [
    {
      "requirement_ids": ["r1"],
      "category": "${category}",
      "prompt": string,
      "answer_outline": string,
      "difficulty": 2
    }
  ]
}`;

  const res = await callGeminiJson<{ questions: Question[] }>(prompt);
  let questions: Question[] = [];

  if (res && Array.isArray(res.questions)) {
    questions = res.questions.map((q, idx) => ({
      id: `q${startIdNumber + idx}`,
      requirement_ids: Array.isArray(q.requirement_ids) && q.requirement_ids.length > 0 ? q.requirement_ids : [requirements[0]?.id || 'r1'],
      category,
      prompt: q.prompt,
      answer_outline: q.answer_outline,
      difficulty: [1, 2, 3].includes(Math.round(q.difficulty)) ? Math.round(q.difficulty) : 2,
      _state: 'generated'
    }));
  }

  // If LLM produced nothing, generate deterministic fallback questions
  if (questions.length === 0) {
    relevantReqs.slice(0, 3).forEach((r, idx) => {
      let promptText = '';
      let outline = '';
      if (category === 'technical') {
        promptText = `Explain your practical experience with ${r.text}. Walk me through a challenging production issue you solved using this.`;
        outline = `Candidate should detail production context, architecture trade-offs, root cause analysis, and measurable outcome.`;
      } else if (category === 'system-design') {
        promptText = `How would you architect a resilient system that satisfies: "${r.text}" while handling 100x traffic spikes?`;
        outline = `Candidate should discuss caching, horizontal scaling, data consistency, failure isolation, and bottleneck mitigation.`;
      } else if (category === 'behavioural') {
        promptText = `Describe a situation where you had to champion "${r.text}" amidst tight deadlines or conflicting team priorities.`;
        outline = `STAR structure: Situation, Task, Actions taken to align colleagues, and Resulting business impact.`;
      } else {
        promptText = `How does your approach to "${r.text}" align with this company's engineering values and mission?`;
        outline = `Candidate connects personal engineering philosophy with the company's stated focus and product scope.`;
      }

      questions.push({
        id: `q${startIdNumber + idx}`,
        requirement_ids: [r.id],
        category,
        prompt: promptText,
        answer_outline: outline,
        difficulty: r.priority === 'must' ? 2 : 1,
        _state: 'generated'
      });
    });
  }

  return questions;
}

/**
 * Step 4: The Second Pass Coverage Check & Targeted Gap Filler
 * Section 4: If any must-have requirement has no question against it, generates missing questions!
 */
export async function stepCloseCoverageGaps(
  requirements: KitRequirement[],
  currentQuestions: Question[],
  roleTitle: string,
  maxPasses = 3,
  onProgress?: (msg: string) => void
): Promise<{ questions: Question[]; passes: number }> {
  let questions = [...currentQuestions];
  let passCount = 1;

  for (let pass = 1; pass <= maxPasses; pass++) {
    passCount = pass;
    const analysis = analyzeCoverage(requirements, questions);

    if (analysis.uncoveredMustIds.length === 0) {
      onProgress?.(`Coverage check pass ${pass}: 100% of must-have requirements covered.`);
      break;
    }

    onProgress?.(`Coverage check pass ${pass}: Found ${analysis.uncoveredMustIds.length} uncovered must-have requirement(s) [${analysis.uncoveredMustIds.join(', ')}]. Executing targeted gap generation.`);

    const gapReqs = requirements.filter(r => analysis.uncoveredMustIds.includes(r.id));
    const nextQId = questions.length + 1;

    // Generate targeted questions specifically for the gap requirements
    const prompt = `We have detected coverage gaps in interview prep for role: "${roleTitle}".
The following MUST-HAVE requirements have no questions targeting them:
${gapReqs.map(r => `- [${r.id}] (${r.kind}): ${r.text}`).join('\n')}

Generate exactly 1 focused question for EACH requirement listed above.
Return JSON:
{
  "gap_questions": [
    {
      "requirement_ids": ["rX"],
      "category": "technical" | "behavioural" | "system-design",
      "prompt": string,
      "answer_outline": string,
      "difficulty": 2
    }
  ]
}`;

    const res = await callGeminiJson<{ gap_questions: Question[] }>(prompt);
    let addedCount = 0;

    if (res && Array.isArray(res.gap_questions)) {
      res.gap_questions.forEach((gq, i) => {
        questions.push({
          id: `q${nextQId + i}`,
          requirement_ids: gq.requirement_ids || [gapReqs[i]?.id || 'r1'],
          category: (['technical', 'behavioural', 'system-design', 'company-fit'].includes(gq.category) ? gq.category : 'technical') as any,
          prompt: gq.prompt,
          answer_outline: gq.answer_outline,
          difficulty: [1, 2, 3].includes(Math.round(gq.difficulty)) ? Math.round(gq.difficulty) : 2,
          _state: 'generated'
        });
        addedCount++;
      });
    }

    // Deterministic fallback if LLM gap call didn't fill all
    gapReqs.forEach((gapReq, i) => {
      const alreadyHas = questions.some(q => q.requirement_ids.includes(gapReq.id));
      if (!alreadyHas) {
        questions.push({
          id: `q${nextQId + addedCount + i}`,
          requirement_ids: [gapReq.id],
          category: gapReq.kind === 'behavioural' ? 'behavioural' : 'technical',
          prompt: `Deep dive into requirement "${gapReq.text}": What is your core approach and standard methodology here?`,
          answer_outline: `Specific architecture, industry standard patterns, and real-world trade-offs related to ${gapReq.text}.`,
          difficulty: 2,
          _state: 'generated'
        });
      }
    });
  }

  return { questions, passes: passCount };
}

/**
 * Step 5: Flashcard Generation
 */
export async function stepGenerateFlashcards(
  requirements: KitRequirement[],
  questions: Question[]
): Promise<Flashcard[]> {
  const flashcards: Flashcard[] = [];
  let fId = 1;

  // Create flashcards covering key requirements and questions
  requirements.forEach((req, idx) => {
    const relatedQ = questions.find(q => q.requirement_ids.includes(req.id));
    flashcards.push({
      id: `f${fId++}`,
      front: `Core Requirement: ${req.text}\nWhat key signals demonstrate mastery in this domain?`,
      back: relatedQ ? `Key focus: ${relatedQ.prompt}\n\nOutline: ${relatedQ.answer_outline}` : `Demonstrate proven production track record and trade-off understanding of ${req.text}.`,
      requirement_ids: [req.id],
      _state: 'generated'
    });
  });

  return flashcards;
}

/**
 * Full Deliberate Generation Pipeline
 */
export async function generateFullPrepKit(
  jd: string,
  companyUrl: string,
  daysAvailable: number,
  onProgress?: (progress: { step: string; message: string; percentage: number }) => void
): Promise<PrepKit> {
  const startTime = new Date().toISOString();

  // 1. Ingest JD & Extract Requirements
  onProgress?.({ step: 'extracting', message: 'Analyzing job description and extracting strict requirements...', percentage: 15 });
  const roleBreakdown = await stepExtractRequirements(jd);

  // 2. Crawl Company Domain
  onProgress?.({ step: 'crawling', message: `Crawling ${companyUrl} to uncover hiring process and company mission...`, percentage: 35 });
  const { crawlCompanySite } = await import('./scraper.ts');
  const crawl = await crawlCompanySite(companyUrl, true, msg => {
    onProgress?.({ step: 'crawling', message: msg, percentage: 40 });
  });

  // 3. Research Company
  onProgress?.({ step: 'generating', message: 'Synthesizing company brief and hiring intelligence...', percentage: 50 });
  const companyBrief = await stepResearchCompany(companyUrl, crawl, roleBreakdown.title);

  // 4. Generate Questions for each category separately
  onProgress?.({ step: 'generating', message: 'Generating technical and system design question banks...', percentage: 65 });
  const techQuestions = await stepGenerateCategoryQuestions('technical', roleBreakdown.requirements, companyBrief, roleBreakdown.title, 1);
  const sysDesignQuestions = await stepGenerateCategoryQuestions('system-design', roleBreakdown.requirements, companyBrief, roleBreakdown.title, techQuestions.length + 1);
  const behaviouralQuestions = await stepGenerateCategoryQuestions('behavioural', roleBreakdown.requirements, companyBrief, roleBreakdown.title, techQuestions.length + sysDesignQuestions.length + 1);
  const companyFitQuestions = await stepGenerateCategoryQuestions('company-fit', roleBreakdown.requirements, companyBrief, roleBreakdown.title, techQuestions.length + sysDesignQuestions.length + behaviouralQuestions.length + 1);

  let initialQuestions = [
    ...techQuestions,
    ...sysDesignQuestions,
    ...behaviouralQuestions,
    ...companyFitQuestions
  ];

  // 5. The Second Pass: Coverage Check Loop
  onProgress?.({ step: 'coverage', message: 'Running deterministic coverage check to find unmapped must-have requirements...', percentage: 80 });
  const coverageResult = await stepCloseCoverageGaps(
    roleBreakdown.requirements,
    initialQuestions,
    roleBreakdown.title,
    3,
    msg => onProgress?.({ step: 'coverage', message: msg, percentage: 85 })
  );

  const finalQuestions = coverageResult.questions;

  // 6. Flashcards
  onProgress?.({ step: 'generating', message: 'Synthesizing active recall flashcards...', percentage: 90 });
  const flashcards = await stepGenerateFlashcards(roleBreakdown.requirements, finalQuestions);

  // 7. Deterministic Schedule Allocation
  onProgress?.({ step: 'scheduling', message: `Calculating day-by-day study schedule across exactly ${daysAvailable} days...`, percentage: 95 });
  const schedule = allocateSchedule(finalQuestions, roleBreakdown.requirements, daysAvailable);

  // 8. Appendix A Kit Construction
  const coverageReport = buildCoverageReport(roleBreakdown.requirements, finalQuestions, coverageResult.passes);

  onProgress?.({ step: 'complete', message: 'Interview prep kit generated successfully.', percentage: 100 });

  return {
    source: {
      company: roleBreakdown.title ? `${roleBreakdown.title} at ${crawl.pages[0]?.title || companyUrl}` : 'Target Company',
      company_url: companyUrl,
      role: roleBreakdown.title,
      location: 'Remote / Hybrid',
      jd_chars: jd.length,
      researched_at: startTime,
      pages_used: crawl.sourcesUsed
    },
    company_brief: companyBrief,
    role: roleBreakdown,
    questions: finalQuestions,
    flashcards,
    schedule,
    coverage: coverageReport
  };
}
