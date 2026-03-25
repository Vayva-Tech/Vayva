/** Symptom checker structured assessment */
export interface ClinicalInsight {
  possibleConditions: Array<{
    name: string;
    icd10Code?: string;
    likelihood: string;
    description: string;
  }>;
  recommendedSteps: Array<{
    action: string;
    urgency: string;
    rationale: string;
  }>;
  redFlags: string[];
  confidence: number;
}

/** Clinical note summarization output */
export interface ClinicalNoteSummary {
  chiefComplaint: string;
  hpi: string;
  keyFindings: string[];
  assessment: string;
  plan: string[];
  suggestedCptCodes?: string[];
}

/** Treatment recommendation bundle */
export interface TreatmentRecommendation {
  condition: string;
  treatments: Array<{
    name: string;
    type: string;
    evidenceLevel: string;
    dosage?: string;
    frequency?: string;
    contraindications?: string[];
    sideEffects?: string[];
  }>;
  patientConsiderations: string[];
  followUp: {
    timeframe: string;
    actions: string[];
  };
}

/** Contract review structured output */
export interface ContractAnalysisResult {
  contractType: string;
  overallRisk: string;
  clauseAnalysis: Array<{
    clauseType: string;
    riskLevel: string;
    issues: string[];
  }>;
  keyObligations: string[];
  problematicClauses: Array<{
    severity: string;
    issue: string;
    clause: string;
    suggestion: string;
  }>;
  complianceIssues: string[];
}

export interface DocumentAutomationResult {
  document: string;
  documentType: string;
  populatedFields: string[];
  missingFields: string[];
  suggestedAdditions: string[];
}

export interface LegalResearchResult {
  query: string;
  cases: Array<{
    citation: string;
    court: string;
    date?: string;
    relevance: number;
    summary: string;
    keyHoldings?: string[];
  }>;
  statutes: unknown[];
  legalPrinciples: unknown[];
  suggestedArguments: Array<{ argument: string; [key: string]: unknown }>;
}

export function getClinicalAIConfig(): Record<string, unknown> {
  return { model: "clinical-assistant", temperature: 0.2 };
}
