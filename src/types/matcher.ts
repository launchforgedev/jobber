export interface ResumeProfile {
  name: string;
  email: string;
  phone?: string;
  title: string;
  yearsOfExperience: number;
  skills: string[];
  rawText: string;
}

export interface MatchedKeyword {
  keyword: string;
  category: 'technical' | 'tools' | 'domain' | 'soft-skills';
  occurrencesInResume: number;
  matchedRequirementId?: string;
}

export interface MissingKeyword {
  keyword: string;
  category: 'technical' | 'tools' | 'domain' | 'soft-skills';
  importance: 'critical' | 'recommended' | 'bonus';
  suggestedAction: string;
}

export interface MatchCategoryScore {
  name: string;
  score: number; // 0-100
  weight: number; // percentage
  strengths: string;
  gaps: string;
}

export interface MatchAnalysisResult {
  id: string;
  analyzedAt: string;
  targetRole: string;
  targetCompany: string;
  targetCompanyUrl?: string;
  overallScore: number; // 0-100
  compatibilityLevel: 'Exceptional Match' | 'Strong Match' | 'Moderate Match' | 'Gaps Detected';
  categoryScores: {
    skillMatch: MatchCategoryScore;
    experienceLevel: MatchCategoryScore;
    keywordOptimization: MatchCategoryScore;
    technicalStackFit: MatchCategoryScore;
  };
  matchedKeywords: MatchedKeyword[];
  missingKeywords: MissingKeyword[];
  recommendations: string[];
  summary: string;
  mustHaveCoveragePercentage: number;
  niceToHaveCoveragePercentage: number;
  candidateName: string;
  jdText: string;
  resumeText: string;
}

export interface PipelineMetric {
  date: string;
  role: string;
  company: string;
  score: number;
  status: 'Interview Scheduled' | 'Application Review' | 'Screening Passed' | 'Offer Extended';
  coverage: number;
}
