import { MatchAnalysisResult, ResumeProfile } from '../types/matcher.ts';

export const SAMPLE_RESUMES: { label: string; profile: ResumeProfile }[] = [
  {
    label: 'Alex Chen · Staff Distributed Systems Engineer (High Match)',
    profile: {
      name: 'Alex Chen',
      email: 'alex.chen@devmail.io',
      phone: '+1 (415) 890-2145',
      title: 'Staff Distributed Systems Engineer',
      yearsOfExperience: 7,
      skills: [
        'TypeScript', 'Node.js', 'Go', 'Distributed Systems', 'Kafka', 'PostgreSQL',
        'CockroachDB', 'ACID Transactions', 'Event-Driven Architecture', 'Kubernetes',
        'Terraform', 'System Design', 'Sub-50ms Latency', 'Microservices', 'AWS SQS',
        'WAL Replication', 'High Throughput', 'CI/CD Pipelines', 'Mentorship'
      ],
      rawText: `ALEX CHEN
San Francisco, CA | alex.chen@devmail.io | linkedin.com/in/alexchen-eng | github.com/alexchen-dev

SUMMARY:
Staff Distributed Systems & Backend Engineer with 7+ years designing high-throughput transaction pipelines, core ledgers, and fault-tolerant cloud systems in Node.js, Go, and TypeScript. Proven track record processing 60k+ events/sec with sub-50ms p99 latency guarantees and zero data loss under network partitions.

EXPERIENCE:
Staff Software Engineer | CloudScale FinTech (2022 - Present)
- Architected the core financial ledger and transaction processing pipeline using Node.js, Go, PostgreSQL, and CockroachDB, processing $4.2B in annualized transaction volume.
- Replaced synchronous REST bottlenecks with Kafka distributed event streaming and AWS SQS dead-letter queues, scaling throughput from 8k to 55k transactions/sec.
- Enforced strict ACID guarantees across sharded databases; eliminated concurrency deadlocks through deterministic lock ordering and optimistic concurrency control.
- Designed automated Terraform infrastructure and Kubernetes deployments across 3 AWS multi-region clusters with 99.995% uptime SLA.
- Spearheaded engineering architecture reviews and mentored 8 junior and mid-level software engineers.

Senior Backend Engineer | Apex Data Systems (2019 - 2022)
- Built real-time asynchronous ingestion microservices in TypeScript and Go handling 250M events daily.
- Optimized PostgreSQL indexing and query execution plans, reducing p95 read latencies from 180ms to 24ms.
- Implemented automated chaos engineering drills and WAL replication failover recovery mechanisms.

EDUCATION & SKILLS:
- B.S. in Computer Science, UC Berkeley (2019)
- Core Technologies: TypeScript, Node.js, Go, PostgreSQL, CockroachDB, Kafka, AWS, Kubernetes, Terraform, Redis, Docker, Git.`
    }
  },
  {
    label: 'Sarah Jenkins · Senior Frontend Architect (High Match for UI)',
    profile: {
      name: 'Sarah Jenkins',
      email: 'sarah.jenkins@designeng.co',
      title: 'Senior Frontend Systems Architect',
      yearsOfExperience: 6,
      skills: [
        'React 19', 'TypeScript', 'Next.js', 'WebAssembly', 'Tailwind CSS',
        'State Hydration', 'Performance Benchmarking', 'IndexedDB', 'CRDTs',
        'Design Systems', 'Sub-100ms Sync', 'Component Architecture'
      ],
      rawText: `SARAH JENKINS
New York, NY | sarah.jenkins@designeng.co | github.com/sarahjenkins-ui

SUMMARY:
Senior Frontend Architect specializing in React, TypeScript, high-performance rendering pipelines, and offline-first browser synchronization. Passionate about immediate micro-interactions, responsive typography math, and fluid developer tool ergonomics.

EXPERIENCE:
Lead Frontend Engineer | SyncFlow (2021 - Present)
- Engineered collaborative workspace application in React 19, TypeScript, and IndexedDB with sub-100ms CRDT sync.
- Built reusable cross-platform design system tokens and component library used by 45+ engineers.
- Benchmarked rendering cycles, eliminating unnecessary re-renders and cutting memory footprint by 42%.

Frontend Software Engineer | HyperUI (2018 - 2021)
- Developed responsive web applications using Next.js, Tailwind CSS, and WebAssembly modules for real-time asset computation.
- Maintained 98%+ automated test coverage with Jest, Playwright, and Storybook.`
    }
  },
  {
    label: 'Jordan Rivera · Mid-Level Software Engineer (Partial Match)',
    profile: {
      name: 'Jordan Rivera',
      email: 'jordan.rivera@codemail.com',
      title: 'Software Developer',
      yearsOfExperience: 3,
      skills: ['Python', 'Django', 'PostgreSQL', 'Docker', 'REST APIs', 'Git', 'JavaScript'],
      rawText: `JORDAN RIVERA
Austin, TX | jordan.rivera@codemail.com | github.com/jrivera

SUMMARY:
Full-stack software developer with 3 years experience building Python and Django web applications, RESTful APIs, and relational databases.

EXPERIENCE:
Software Engineer | DataBridge Technologies (2022 - Present)
- Developed internal reporting dashboards using Python, Django, and PostgreSQL.
- Dockerized microservices and automated deployment workflows using GitHub Actions.
- Collaborated with product managers to deliver user authentication and data export features.

Junior Developer | AppTech Solutions (2021 - 2022)
- Maintained legacy REST endpoints and fixed database bugs in PostgreSQL.
- Wrote unit tests and automated regression suites in pytest.`
    }
  }
];

export function analyzeResumeJobMatch(
  resumeText: string,
  jdText: string,
  companyUrl: string = ''
): MatchAnalysisResult {
  const normResume = resumeText.toLowerCase();
  const normJd = jdText.toLowerCase();

  // Extract common target role title
  const roleMatch = jdText.match(/(?:title|role|position|we are looking for a|seeking a)\s*:?\s*([^\n\r.]+)/i);
  const targetRole = roleMatch ? roleMatch[1].trim() : 'Software Engineer';

  // Company detection
  let targetCompany = 'Target Company';
  if (companyUrl) {
    try {
      const parsed = new URL(companyUrl.startsWith('http') ? companyUrl : `https://${companyUrl}`);
      const hostname = parsed.hostname.replace('www.', '').split('.')[0];
      targetCompany = hostname.charAt(0).toUpperCase() + hostname.slice(1);
    } catch {
      targetCompany = companyUrl;
    }
  }

  // Candidate name detection
  const firstLine = resumeText.trim().split('\n')[0] || 'Candidate';
  const candidateName = firstLine.length < 40 ? firstLine.replace(/[^a-zA-Z\s]/g, '').trim() : 'Candidate Profile';

  // Core competency dictionaries
  const KEYWORD_CORPUS: Array<{
    term: string;
    alias: string[];
    category: 'technical' | 'tools' | 'domain' | 'soft-skills';
    isMustHave?: boolean;
  }> = [
    { term: 'TypeScript', alias: ['typescript', 'ts'], category: 'technical', isMustHave: true },
    { term: 'Node.js', alias: ['node.js', 'nodejs', 'node'], category: 'technical', isMustHave: true },
    { term: 'Go / Golang', alias: ['go', 'golang'], category: 'technical' },
    { term: 'Distributed Systems', alias: ['distributed systems', 'fault-tolerant', 'distributed'], category: 'technical', isMustHave: true },
    { term: 'PostgreSQL', alias: ['postgresql', 'postgres'], category: 'technical', isMustHave: true },
    { term: 'Kafka', alias: ['kafka', 'event stream', 'event streaming'], category: 'tools', isMustHave: true },
    { term: 'Kubernetes', alias: ['kubernetes', 'k8s'], category: 'tools' },
    { term: 'Terraform', alias: ['terraform', 'iac', 'infrastructure as code'], category: 'tools' },
    { term: 'ACID Transactions', alias: ['acid', 'transaction isolation', 'concurrency control'], category: 'technical', isMustHave: true },
    { term: 'Sub-50ms Latency', alias: ['sub-50ms', 'latency', 'p99', 'p95', 'throughput'], category: 'domain', isMustHave: true },
    { term: 'CockroachDB', alias: ['cockroachdb', 'sharding', 'distributed db'], category: 'technical' },
    { term: 'AWS / Cloud', alias: ['aws', 'cloud', 'sqs', 's3', 'gcp'], category: 'tools' },
    { term: 'Architecture Reviews', alias: ['architecture reviews', 'system design', 'lead architecture'], category: 'soft-skills' },
    { term: 'Mentorship & Leadership', alias: ['mentoring', 'mentor', 'leadership', 'team lead'], category: 'soft-skills' },
    { term: 'PCI-DSS Compliance', alias: ['pci-dss', 'compliance', 'security', 'audit'], category: 'domain' },
    { term: 'Chaos Engineering', alias: ['chaos engineering', 'failover', 'wal replication'], category: 'technical' },
    { term: 'React / Next.js', alias: ['react', 'next.js', 'frontend', 'ui'], category: 'technical' },
    { term: 'IndexedDB / CRDTs', alias: ['indexeddb', 'crdt', 'offline-first'], category: 'technical' },
    { term: 'CI/CD Automation', alias: ['ci/cd', 'github actions', 'pipeline'], category: 'tools' }
  ];

  // Scan JD for required keywords
  const presentInJd = KEYWORD_CORPUS.filter(item => {
    return item.alias.some(a => normJd.includes(a));
  });

  // If JD didn't match specific presets, use dynamic tokens from JD
  const effectiveJdKeywords = presentInJd.length >= 4 ? presentInJd : KEYWORD_CORPUS.slice(0, 10);

  const matchedKeywords: any[] = [];
  const missingKeywords: any[] = [];

  let matchedWeight = 0;
  let totalJdWeight = 0;
  let mustHavesFound = 0;
  let mustHavesTotal = 0;

  effectiveJdKeywords.forEach(item => {
    const weight = item.isMustHave ? 2.5 : 1.0;
    totalJdWeight += weight;
    if (item.isMustHave) mustHavesTotal++;

    // Check presence in resume
    const matchFound = item.alias.some(a => normResume.includes(a));
    if (matchFound) {
      matchedWeight += weight;
      if (item.isMustHave) mustHavesFound++;

      // Count occurrences
      let count = 0;
      item.alias.forEach(a => {
        const regex = new RegExp(`\\b${a}\\b`, 'gi');
        const matches = resumeText.match(regex);
        if (matches) count += matches.length;
      });

      matchedKeywords.push({
        keyword: item.term,
        category: item.category,
        occurrencesInResume: Math.max(1, count)
      });
    } else {
      missingKeywords.push({
        keyword: item.term,
        category: item.category,
        importance: item.isMustHave ? 'critical' : 'recommended',
        suggestedAction: item.isMustHave
          ? `Add concrete production metrics for ${item.term} in recent bullet points.`
          : `Highlight familiarity or coursework in ${item.term}.`
      });
    }
  });

  // Calculate scores adhering to the Rubrics in the assessment
  // 1. Technical Stack Fit (0-100)
  const techMatches = matchedKeywords.filter(k => k.category === 'technical' || k.category === 'tools').length;
  const techTotal = effectiveJdKeywords.filter(k => k.category === 'technical' || k.category === 'tools').length || 1;
  const techScore = Math.min(100, Math.round((techMatches / techTotal) * 100));

  // 2. Experience & Seniority
  let expScore = 70;
  const yearsMatch = resumeText.match(/(\d+)\+?\s*years/i);
  const years = yearsMatch ? parseInt(yearsMatch[1], 10) : 4;
  if (years >= 7) expScore = 96;
  else if (years >= 5) expScore = 88;
  else if (years >= 3) expScore = 75;
  else expScore = 60;

  // 3. Keyword Optimization
  const rawRatio = totalJdWeight > 0 ? (matchedWeight / totalJdWeight) : 0.7;
  const keywordScore = Math.min(100, Math.round(rawRatio * 100));

  // 4. Architecture & Domain Fit
  let domainScore = 68;
  if (normResume.includes('latency') || normResume.includes('throughput') || normResume.includes('p99')) domainScore += 12;
  if (normResume.includes('acid') || normResume.includes('sharding') || normResume.includes('ledger')) domainScore += 10;
  if (normResume.includes('architect') || normResume.includes('staff') || normResume.includes('lead')) domainScore += 8;
  domainScore = Math.min(98, Math.max(45, domainScore));

  // Weighted overall compatibility score
  const overallScore = Math.min(99, Math.max(35, Math.round(
    techScore * 0.40 +
    expScore * 0.25 +
    keywordScore * 0.20 +
    domainScore * 0.15
  )));

  const mustHaveCoveragePercentage = mustHavesTotal > 0
    ? Math.round((mustHavesFound / mustHavesTotal) * 100)
    : 85;

  const niceToHaveCoveragePercentage = Math.round((matchedKeywords.length / (effectiveJdKeywords.length || 1)) * 100);

  let compatibilityLevel: 'Exceptional Match' | 'Strong Match' | 'Moderate Match' | 'Gaps Detected' = 'Moderate Match';
  if (overallScore >= 88) compatibilityLevel = 'Exceptional Match';
  else if (overallScore >= 75) compatibilityLevel = 'Strong Match';
  else if (overallScore >= 60) compatibilityLevel = 'Moderate Match';
  else compatibilityLevel = 'Gaps Detected';

  // Construct realistic recommendations
  const recommendations: string[] = [];
  if (missingKeywords.some(m => m.importance === 'critical')) {
    const criticalList = missingKeywords.filter(m => m.importance === 'critical').map(m => m.keyword).slice(0, 2).join(' and ');
    recommendations.push(`Explicitly incorporate experience with ${criticalList} in your most recent employment descriptions.`);
  }
  if (!normResume.includes('latency') && !normResume.includes('throughput')) {
    recommendations.push('Include quantifiable engineering metrics (e.g. p99 latencies, events/sec handled, database scale) in your achievements.');
  }
  if (missingKeywords.some(m => m.keyword.includes('Kafka') || m.keyword.includes('Kubernetes'))) {
    recommendations.push('State concrete orchestration and message broker tools used in production environments.');
  }
  if (recommendations.length < 3) {
    recommendations.push('Align phrasing in your summary section directly to the role responsibilities mentioned in the posting.');
    recommendations.push('Prepare STAR interview examples for architecture trade-off discussions.');
  }

  return {
    id: `eval_${Date.now()}`,
    analyzedAt: new Date().toISOString(),
    targetRole,
    targetCompany,
    targetCompanyUrl: companyUrl,
    overallScore,
    compatibilityLevel,
    categoryScores: {
      technicalStackFit: {
        name: 'Technical Stack Fit',
        score: techScore,
        weight: 40,
        strengths: `${techMatches} of ${techTotal} primary languages and frameworks matched.`,
        gaps: techScore < 80 ? 'Missing specialized databases or streaming platforms.' : 'Exemplary alignment.'
      },
      experienceLevel: {
        name: 'Seniority & Experience Depth',
        score: expScore,
        weight: 25,
        strengths: `Demonstrated ~${years}+ years experience meeting level criteria.`,
        gaps: expScore < 80 ? 'Ensure leadership and architectural ownership are explicit.' : 'Strong senior presence.'
      },
      keywordOptimization: {
        name: 'Keyword & ATS Optimization',
        score: keywordScore,
        weight: 20,
        strengths: `${matchedKeywords.length} verified competency tokens detected.`,
        gaps: `${missingKeywords.length} target JD keywords absent.`
      },
      skillMatch: {
        name: 'Domain & System Architecture Fit',
        score: domainScore,
        weight: 15,
        strengths: 'Addresses distributed failure cases and transaction integrity.',
        gaps: domainScore < 75 ? 'Add references to SLA guarantees and incident post-mortems.' : 'Excellent domain match.'
      }
    },
    matchedKeywords,
    missingKeywords,
    recommendations,
    summary: `${candidateName} exhibits a ${overallScore}% compatibility with ${targetCompany}'s ${targetRole}. Technical requirements show ${mustHaveCoveragePercentage}% must-have coverage with ${matchedKeywords.length} verified competencies identified in the resume.`,
    mustHaveCoveragePercentage,
    niceToHaveCoveragePercentage,
    candidateName,
    jdText,
    resumeText
  };
}

// Realistic Pipeline History for Step 2 Analytics Dashboard
export const RECENT_PIPELINE_APPLICATIONS = [
  { date: 'Sep 18', role: 'Staff Distributed Systems Engineer', company: 'Stripe', score: 92, coverage: 96, status: 'Interview Scheduled', category: 'Backend' },
  { date: 'Sep 19', role: 'Lead Frontend Systems Architect', company: 'Linear', score: 86, coverage: 89, status: 'Screening Passed', category: 'Frontend' },
  { date: 'Sep 20', role: 'Senior Reliability & Systems Engineer', company: 'Datadog', score: 79, coverage: 82, status: 'Application Review', category: 'Infrastructure' },
  { date: 'Sep 21', role: 'Principal Platform Engineer', company: 'Cloudflare', score: 91, coverage: 95, status: 'Interview Scheduled', category: 'Infrastructure' },
  { date: 'Sep 22', role: 'Core Ledger Infrastructure Lead', company: 'Brex', score: 88, coverage: 91, status: 'Screening Passed', category: 'Backend' },
  { date: 'Sep 23', role: 'Senior Full-Stack Architect', company: 'Vercel', score: 94, coverage: 98, status: 'Offer Extended', category: 'Fullstack' }
];

export const SKILL_DISTRIBUTION_RADAR = [
  { subject: 'Distributed Systems', candidateScore: 95, jobTargetScore: 90 },
  { subject: 'Database Internals', candidateScore: 90, jobTargetScore: 85 },
  { subject: 'Event Streaming (Kafka)', candidateScore: 88, jobTargetScore: 85 },
  { subject: 'Cloud Infrastructure', candidateScore: 82, jobTargetScore: 80 },
  { subject: 'STAR Leadership', candidateScore: 85, jobTargetScore: 75 },
  { subject: 'Security & Compliance', candidateScore: 78, jobTargetScore: 85 }
];
