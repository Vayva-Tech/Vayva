/**
 * Contract Analysis AI Service
 * 
 * Provides AI-powered contract review, risk assessment, and clause analysis
 * for legal professionals
 */

import { BaseAIService } from '@vayva/ai-agent';
import type { ContractAnalysisResult } from '@vayva/ai-agent';

export interface ContractAnalysisInput {
  /** Contract text content */
  contractText: string;
  /** Contract type if known */
  contractType?: string;
  /** Jurisdiction */
  jurisdiction?: string;
  /** Party representation */
  representingParty: 'client' | 'counterparty' | 'neutral';
  /** Specific concerns or focus areas */
  focusAreas?: string[];
  /** Risk tolerance level */
  riskTolerance?: 'low' | 'moderate' | 'high';
}

export class ContractAnalysisService extends BaseAIService<ContractAnalysisInput, ContractAnalysisResult> {
  constructor() {
    super({
      model: 'legal-analyst',
      temperature: 0.2, // Very low for precision
      requireHumanValidation: true, // Critical for legal advice
      confidenceThreshold: 0.85,
    });
  }

  protected async buildPrompt(input: ContractAnalysisInput): Promise<string> {
    const prompt = `You are an experienced attorney specializing in contract law and risk assessment. Analyze the following contract thoroughly and provide a comprehensive legal analysis.

CONTRACT INFORMATION:
${input.contractType ? `Type: ${input.contractType}` : ''}
${input.jurisdiction ? `Jurisdiction: ${input.jurisdiction}` : ''}
Representing: ${input.representingParty}
Risk Tolerance: ${input.riskTolerance || 'moderate'}
${input.focusAreas?.length ? `Focus Areas: ${input.focusAreas.join(', ')}` : ''}

CONTRACT TEXT:
---
${input.contractText}
---

Please provide a comprehensive contract analysis including:
1. Overall risk assessment (low/medium/high/critical)
2. Clause-by-clause analysis identifying issues and recommendations
3. Key obligations for each party
4. Missing or problematic clauses
5. Compliance issues with applicable regulations

Format your response as JSON with this exact structure:
{
  "contractType": "Identified contract type",
  "overallRisk": "low|medium|high|critical",
  "clauseAnalysis": [
    {
      "clauseType": "Type of clause",
      "riskLevel": "low|medium|high|critical",
      "issues": ["Issue 1", "Issue 2"],
      "recommendations": ["Recommendation 1"],
      "missingElements": ["Missing element if any"]
    }
  ],
  "keyObligations": [
    {
      "party": "client|counterparty|both",
      "obligation": "Description of obligation",
      "deadline": "If applicable"
    }
  ],
  "problematicClauses": [
    {
      "clause": "Problematic clause text",
      "issue": "What's wrong",
      "severity": "minor|moderate|major",
      "suggestion": "Suggested revision"
    }
  ],
  "complianceIssues": [
    {
      "regulation": "Applicable regulation",
      "issue": "Compliance issue",
      "remediation": "How to fix"
    }
  ]
}

Analyze from the perspective of protecting your client's interests while ensuring fair and enforceable terms.`;

    return prompt;
  }

  protected async parseResponse(rawResponse: string, input: ContractAnalysisInput): Promise<ContractAnalysisResult> {
    try {
      // Extract JSON from response
      const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      // Validate required fields
      if (!parsed.overallRisk) {
        throw new Error('Missing overall risk assessment');
      }

      if (!parsed.clauseAnalysis || !Array.isArray(parsed.clauseAnalysis)) {
        throw new Error('Missing clause analysis array');
      }

      // Add validation rules
      this.addValidationRule({
        id: 'has_risk_assessment',
        validate: (data) => ['low', 'medium', 'high', 'critical'].includes(data.overallRisk),
        errorMessage: 'Invalid or missing risk assessment',
        isCritical: true,
      });

      this.addValidationRule({
        id: 'has_clause_analysis',
        validate: (data) => data.clauseAnalysis.length > 0,
        errorMessage: 'No clauses analyzed',
        isCritical: true,
      });

      this.addValidationRule({
        id: 'identifies_key_obligations',
        validate: (data) => data.keyObligations.length > 0,
        errorMessage: 'No key obligations identified',
        isCritical: false,
      });

      // High-risk contracts require extra scrutiny
      if (parsed.overallRisk === 'high' || parsed.overallRisk === 'critical') {
        this.addValidationRule({
          id: 'high_risk_requires_problematic_clauses',
          validate: (data) => data.problematicClauses.length > 0,
          errorMessage: 'High-risk contract should identify problematic clauses',
          isCritical: true,
        });
      }

      // Check for indemnification analysis if representing client
      if (input.representingParty === 'client') {
        this.addValidationRule({
          id: 'client_representation_checks_indemnification',
          validate: (data) => 
            data.clauseAnalysis.some(c => 
              c.clauseType.toLowerCase().includes('indemnif') ||
              c.clauseType.toLowerCase().includes('liability')
            ),
          errorMessage: 'Should analyze indemnification and liability clauses for client',
          isCritical: true,
        });
      }

      return {
        contractType: parsed.contractType || input.contractType || 'General Contract',
        overallRisk: parsed.overallRisk,
        clauseAnalysis: parsed.clauseAnalysis,
        keyObligations: parsed.keyObligations || [],
        problematicClauses: parsed.problematicClauses || [],
        complianceIssues: parsed.complianceIssues || [],
      };
    } catch (error) {
      console.error('[ContractAnalysis] Failed to parse response:', error);
      throw new Error(`Failed to parse contract analysis: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Quick contract risk assessment
   */
  async quickRiskAssessment(contractText: string): Promise<{ risk: string; topIssues: string[] }> {
    await this.initialize();
    const result = await this.execute({
      contractText,
      representingParty: 'client',
      riskTolerance: 'moderate',
    });

    const topIssues: string[] = [];
    
    // Extract top issues from problematic clauses
    result.problematicClauses.slice(0, 3).forEach(clause => {
      topIssues.push(`${clause.severity.toUpperCase()}: ${clause.issue}`);
    });

    // Add critical clause issues
    result.clauseAnalysis
      .filter(c => c.riskLevel === 'high' || c.riskLevel === 'critical')
      .slice(0, 2)
      .forEach(clause => {
        topIssues.push(`${clause.clauseType}: ${clause.issues[0] || 'High risk identified'}`);
      });

    return {
      risk: result.overallRisk,
      topIssues,
    };
  }

  /**
   * Comprehensive contract analysis with full context
   */
  async comprehensiveAnalysis(input: ContractAnalysisInput): Promise<ContractAnalysisResult> {
    await this.initialize();
    return this.execute(input);
  }

  /**
   * Compare contract against standard/precedent
   */
  async compareWithStandard(
    contractText: string,
    standardProvisions: string[],
    jurisdiction?: string
  ): Promise<{
    deviations: Array<{ provision: string; deviation: string; risk: string }>;
    missingProvisions: string[];
    recommendedChanges: string[];
  }> {
    const result = await this.execute({
      contractText,
      jurisdiction,
      representingParty: 'client',
      focusAreas: ['standard provisions comparison'],
    });

    const deviations: Array<{ provision: string; deviation: string; risk: string }> = [];
    const missingProvisions: string[] = [];
    const recommendedChanges: string[] = [];

    // Check for missing standard provisions
    standardProvisions.forEach(stdProv => {
      const found = result.clauseAnalysis.some(clause => 
        clause.clauseType.toLowerCase().includes(stdProv.toLowerCase())
      );

      if (!found) {
        missingProvisions.push(stdProv);
      }
    });

    // Identify deviations from problematic clauses
    result.problematicClauses.forEach(problem => {
      deviations.push({
        provision: problem.clause.split('\n')[0].substring(0, 100), // First line
        deviation: problem.issue,
        risk: problem.severity,
      });
      recommendedChanges.push(problem.suggestion);
    });

    return {
      deviations,
      missingProvisions,
      recommendedChanges,
    };
  }
}
