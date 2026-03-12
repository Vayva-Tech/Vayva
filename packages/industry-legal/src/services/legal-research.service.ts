/**
 * Legal Research AI Service
 * 
 * Provides AI-powered legal research, case law analysis, and argument development
 * for attorneys and legal professionals
 */

import { BaseAIService } from '@vayva/ai-agent';
import type { LegalResearchResult } from '@vayva/ai-agent';

export interface LegalResearchInput {
  /** Research question or legal issue */
  researchQuestion: string;
  /** Jurisdiction(s) of interest */
  jurisdictions: string[];
  /** Area of law */
  areaOfLaw: string;
  /** Key facts of the case */
  keyFacts?: string[];
  /** Desired outcome */
  desiredOutcome?: string;
  /** Opposing arguments to address */
  opposingArguments?: string[];
  /** Research depth */
  depth?: 'brief' | 'comprehensive' | 'exhaustive';
}

export class LegalResearchService extends BaseAIService<LegalResearchInput, LegalResearchResult> {
  constructor() {
    super({
      model: 'legal-analyst',
      temperature: 0.3, // Balanced for research creativity
      requireHumanValidation: false, // Research is advisory
      confidenceThreshold: 0.75,
    });
  }

  protected async buildPrompt(input: LegalResearchInput): Promise<string> {
    const prompt = `You are an expert legal researcher with extensive experience in ${input.areaOfLaw}. Conduct comprehensive legal research on the following issue.

RESEARCH QUESTION:
${input.researchQuestion}

JURISDICTION(S):
${input.jurisdictions.join(', ')}

AREA OF LAW:
${input.areaOfLaw}

KEY FACTS:
${input.keyFacts?.length ? input.keyFacts.map(f => `- ${f}`).join('\n') : 'Not provided'}

DESIRED OUTCOME:
${input.desiredOutcome || 'Best possible legal position'}

OPPOSING ARGUMENTS TO ADDRESS:
${input.opposingArguments?.length ? input.opposingArguments.map(a => `- ${a}`).join('\n') : 'None specified'}

RESEARCH DEPTH: ${input.depth || 'comprehensive'}

Please provide a comprehensive legal research memorandum including:
1. Relevant case law with citations and summaries
2. Applicable statutes and regulations
3. Key legal principles identified
4. Suggested legal arguments with supporting authority
5. Analysis of opposing arguments and counterarguments

Format your response as JSON with this exact structure:
{
  "query": "The research query",
  "cases": [
    {
      "citation": "Full legal citation",
      "court": "Court name",
      "date": "Decision date",
      "relevance": 0.0-1.0,
      "summary": "Brief summary",
      "keyHoldings": ["Holding 1", "Holding 2"]
    }
  ],
  "statutes": [
    {
      "citation": "Statutory citation",
      "jurisdiction": "Jurisdiction",
      "summary": "What it covers",
      "applicability": "How it applies to this case"
    }
  ],
  "legalPrinciples": ["Principle 1", "Principle 2"],
  "suggestedArguments": [
    {
      "argument": "Legal argument",
      "strength": "strong|moderate|weak",
      "supportingAuthority": ["Citation 1", "Citation 2"]
    }
  ]
}

Prioritize recent cases (last 10 years) unless historical precedent is particularly relevant. Include both binding and persuasive authority.`;

    return prompt;
  }

  protected async parseResponse(rawResponse: string, input: LegalResearchInput): Promise<LegalResearchResult> {
    try {
      // Extract JSON from response
      const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      // Validate required fields
      if (!parsed.cases || !Array.isArray(parsed.cases)) {
        throw new Error('Missing cases array');
      }

      if (!parsed.suggestedArguments || !Array.isArray(parsed.suggestedArguments)) {
        throw new Error('Missing suggested arguments');
      }

      // Add validation rules
      this.addValidationRule({
        id: 'has_authority',
        validate: (data) => data.cases.length > 0 || data.statutes.length > 0,
        errorMessage: 'No legal authority identified',
        isCritical: true,
      });

      this.addValidationRule({
        id: 'has_arguments',
        validate: (data) => data.suggestedArguments.length > 0,
        errorMessage: 'No legal arguments suggested',
        isCritical: false,
      });

      this.addValidationRule({
        id: 'addresses_jurisdiction',
        validate: (data) => {
          if (input.jurisdictions.length === 0) return true;
          return data.cases.some(c => 
            input.jurisdictions.some(j => 
              c.court.toLowerCase().includes(j.toLowerCase()) ||
              c.citation.toLowerCase().includes(j.toLowerCase())
            )
          ) || data.statutes.some(s =>
            input.jurisdictions.some(j => 
              s.jurisdiction.toLowerCase().includes(j.toLowerCase())
            )
          );
        },
        errorMessage: 'Research does not address specified jurisdiction',
        isCritical: true,
      });

      // Check for relevance scoring
      this.addValidationRule({
        id: 'proper_relevance_scoring',
        validate: (data) => 
          data.cases.every(c => 
            typeof c.relevance === 'number' && 
            c.relevance >= 0 && 
            c.relevance <= 1
          ),
        errorMessage: 'Case relevance scores not properly formatted',
        isCritical: false,
      });

      // For comprehensive/exhaustive research, verify depth
      if (input.depth === 'comprehensive' || input.depth === 'exhaustive') {
        this.addValidationRule({
          id: 'sufficient_depth',
          validate: (data) => 
            data.cases.length >= 3 && 
            data.suggestedArguments.length >= 2,
          errorMessage: 'Insufficient research depth for comprehensive request',
          isCritical: false,
        });
      }

      // Address opposing arguments if specified
      if (input.opposingArguments && input.opposingArguments.length > 0) {
        this.addValidationRule({
          id: 'addresses_opposition',
          validate: (data) => 
            data.suggestedArguments.some(arg => 
              arg.argument.toLowerCase().includes('counter') ||
              arg.argument.toLowerCase().includes('oppos') ||
              arg.argument.toLowerCase().includes('rebuttal')
            ),
          errorMessage: 'Opposing arguments not adequately addressed',
          isCritical: true,
        });
      }

      return {
        query: parsed.query || input.researchQuestion,
        cases: parsed.cases,
        statutes: parsed.statutes || [],
        legalPrinciples: parsed.legalPrinciples || [],
        suggestedArguments: parsed.suggestedArguments,
      };
    } catch (error) {
      console.error('[LegalResearch] Failed to parse response:', error);
      throw new Error(`Failed to parse legal research: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Quick case law search
   */
  async findRelevantCases(
    legalIssue: string,
    jurisdiction: string,
    limit: number = 5
  ): Promise<Array<{
    citation: string;
    court: string;
    relevance: number;
    summary: string;
  }>> {
    await this.initialize();
    
    const result = await this.execute({
      researchQuestion: legalIssue,
      jurisdictions: [jurisdiction],
      areaOfLaw: 'General',
      depth: 'brief',
    });

    return result.cases.slice(0, limit).map(c => ({
      citation: c.citation,
      court: c.court,
      relevance: c.relevance,
      summary: c.summary,
    }));
  }

  /**
   * Comprehensive legal research memorandum
   */
  async prepareResearchMemo(input: LegalResearchInput): Promise<LegalResearchResult> {
    await this.initialize();
    return this.execute(input);
  }

  /**
   * Shepardize/validate case citator check simulation
   */
  async validateCitation(citation: string): Promise<{
    isValid: boolean;
    treatment: string[];
    subsequentHistory: string;
    warningFlags: string[];
  }> {
    // This would integrate with actual citator services in production
    // For now, provides basic validation guidance
    
    const warningFlags: string[] = [];
    const treatment: string[] = [];
    
    // Common warning indicators
    if (citation.includes('overruled') || citation.includes('abrogated')) {
      warningFlags.push('Case may have been overruled');
      treatment.push('Negative treatment indicated');
    }
    
    if (citation.includes('distinguished') || citation.includes('limited')) {
      treatment.push('Limited precedential value');
    }
    
    if (citation.includes('affirmed') || citation.includes('upheld')) {
      treatment.push('Positive treatment - affirmed');
    }
    
    return {
      isValid: warningFlags.length === 0,
      treatment,
      subsequentHistory: 'Check actual citator database for complete history',
      warningFlags,
    };
  }

  /**
   * Develop counterarguments to opposing position
   */
  async developCounterarguments(
    opposingArgument: string,
    yourPosition: string,
    jurisdiction: string
  ): Promise<{
    counterarguments: Array<{
      argument: string;
      strength: 'strong' | 'moderate' | 'weak';
      authority: string[];
    }>;
    weaknesses: string[];
    recommendations: string[];
  }> {
    const result = await this.execute({
      researchQuestion: `Counterarguments to: ${opposingArgument}`,
      jurisdictions: [jurisdiction],
      areaOfLaw: 'General',
      keyFacts: [`Our position: ${yourPosition}`],
      opposingArguments: [opposingArgument],
      depth: 'comprehensive',
    });

    const counterarguments = result.suggestedArguments.map(arg => ({
      argument: arg.argument,
      strength: arg.strength as 'strong' | 'moderate' | 'weak',
      authority: arg.supportingAuthority,
    }));

    // Identify potential weaknesses
    const weaknesses: string[] = [];
    const weakArguments = counterarguments.filter(a => a.strength === 'weak');
    
    if (weakArguments.length > 0) {
      weaknesses.push('Some arguments have limited strength');
    }
    
    if (result.cases.length < 3) {
      weaknesses.push('Limited case law support in jurisdiction');
    }

    // Generate recommendations
    const recommendations: string[] = [
      'Lead with strongest argument supported by binding authority',
      'Distinguish unfavorable cases rather than ignore them',
      'Emphasize policy considerations that support your position',
    ];

    return {
      counterarguments,
      weaknesses,
      recommendations,
    };
  }
}
