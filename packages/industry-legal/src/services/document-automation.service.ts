/**
 * Document Automation AI Service
 * 
 * Provides intelligent document generation, template population, and clause drafting
 * for legal professionals
 */

import { BaseAIService } from '@vayva/ai-agent';
import type { DocumentAutomationResult } from '@vayva/ai-agent';

export interface DocumentGenerationInput {
  /** Document type/template to use */
  documentType: string;
  /** Client/party information */
  parties: Array<{
    name: string;
    role: string;
    address?: string;
    email?: string;
    otherDetails?: Record<string, string>;
  }>;
  /** Key terms and conditions */
  terms?: {
    effectiveDate?: string;
    expirationDate?: string;
    paymentTerms?: string;
    jurisdiction?: string;
    governingLaw?: string;
    [key: string]: string | undefined;
  };
  /** Special provisions or clauses */
  specialProvisions?: string[];
  /** Jurisdiction requirements */
  jurisdiction?: string;
}

export class DocumentAutomationService extends BaseAIService<DocumentGenerationInput, DocumentAutomationResult> {
  constructor() {
    super({
      model: 'legal-drafter',
      temperature: 0.4, // Moderate for creative drafting within standards
      requireHumanValidation: true, // Legal documents require review
      confidenceThreshold: 0.8,
    });
  }

  protected async buildPrompt(input: DocumentGenerationInput): Promise<string> {
    const prompt = `You are an expert legal drafter specializing in ${input.documentType}. Generate a comprehensive legal document based on the following specifications.

DOCUMENT TYPE: ${input.documentType}
JURISDICTION: ${input.jurisdiction || 'General'}

PARTIES:
${input.parties.map((p, i) => `${i + 1}. ${p.name} (${p.role})${p.address ? ` - ${p.address}` : ''}`).join('\n')}

KEY TERMS:
${Object.entries(input.terms || {})
  .filter(([_, v]) => v !== undefined)
  .map(([k, v]) => `- ${k}: ${v}`)
  .join('\n') || 'Standard terms apply'}

SPECIAL PROVISIONS:
${input.specialProvisions?.length ? input.specialProvisions.map(p => `- ${p}`).join('\n') : 'None'}

Please draft a complete ${input.documentType} that includes:
1. Proper legal formatting and structure
2. All standard clauses for this document type
3. Integration of the specified terms and parties
4. Appropriate jurisdiction-specific language
5. Boilerplate provisions (governing law, dispute resolution, etc.)

Format your response as JSON with this exact structure:
{
  "document": "Full document text with proper formatting",
  "documentType": "Type of document generated",
  "populatedFields": [
    {
      "fieldName": "Field name",
      "value": "Populated value",
      "source": "user_input|ai_extracted|calculated"
    }
  ],
  "missingFields": ["List of any missing required fields"],
  "suggestedAdditions": [
    {
      "section": "Where to add",
      "content": "Suggested language",
      "rationale": "Why it's recommended"
    }
  ]
}

Ensure the document is professionally drafted, legally sound, and ready for attorney review.`;

    return prompt;
  }

  protected async parseResponse(rawResponse: string, input: DocumentGenerationInput): Promise<DocumentAutomationResult> {
    try {
      // Extract JSON from response
      const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      // Validate required fields
      if (!parsed.document || parsed.document.length === 0) {
        throw new Error('No document content generated');
      }

      if (!parsed.documentType) {
        throw new Error('Document type not identified');
      }

      // Add validation rules
      this.addValidationRule({
        id: 'has_document_content',
        validate: (data) => data.document.length > 500, // Minimum reasonable length
        errorMessage: 'Generated document is too short',
        isCritical: true,
      });

      this.addValidationRule({
        id: 'includes_all_parties',
        validate: (data) => {
          return input.parties.every(party => 
            data.document.includes(party.name)
          );
        },
        errorMessage: 'Not all parties included in document',
        isCritical: true,
      });

      this.addValidationRule({
        id: 'includes_governing_law',
        validate: (data) => 
          data.document.toLowerCase().includes('governing law') ||
          data.document.toLowerCase().includes('choice of law'),
        errorMessage: 'Missing governing law provision',
        isCritical: false,
      });

      this.addValidationRule({
        id: 'includes_dispute_resolution',
        validate: (data) => 
          data.document.toLowerCase().includes('arbitration') ||
          data.document.toLowerCase().includes('litigation') ||
          data.document.toLowerCase().includes('dispute resolution') ||
          data.document.toLowerCase().includes('venue'),
        errorMessage: 'Missing dispute resolution provision',
        isCritical: false,
      });

      // Check for signature blocks
      this.addValidationRule({
        id: 'has_signature_blocks',
        validate: (data) => 
          data.document.toLowerCase().includes('signature') ||
          data.document.toLowerCase().includes('signed') ||
          data.document.toLowerCase().includes('executed'),
        errorMessage: 'Missing signature blocks',
        isCritical: true,
      });

      // Verify populated fields tracking
      this.addValidationRule({
        id: 'tracks_populated_fields',
        validate: (data) => data.populatedFields.length > 0,
        errorMessage: 'No populated fields tracked',
        isCritical: false,
      });

      return {
        document: parsed.document,
        documentType: parsed.documentType,
        populatedFields: parsed.populatedFields || [],
        missingFields: parsed.missingFields || [],
        suggestedAdditions: parsed.suggestedAdditions || [],
      };
    } catch (error) {
      console.error('[DocumentAutomation] Failed to parse response:', error);
      throw new Error(`Failed to parse document: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate document from template
   */
  async generateDocument(input: DocumentGenerationInput): Promise<DocumentAutomationResult> {
    await this.initialize();
    return this.execute(input);
  }

  /**
   * Draft specific clause or provision
   */
  async draftClause(
    clauseType: string,
    context: {
      partyRepresentation: string;
      keyTerms: Record<string, string>;
      jurisdiction?: string;
    }
  ): Promise<{
    clauseText: string;
    alternatives: string[];
    notes: string[];
  }> {
    const result = await this.execute({
      documentType: clauseType,
      parties: [{ name: context.party_representation, role: 'Drafting Party' }],
      terms: context.keyTerms,
      jurisdiction: context.jurisdiction,
      specialProvisions: [`Draft ${clauseType} clause`],
    });

    // Extract the clause from the full document
    const clauseText = result.document;
    
    // Generate alternatives
    const alternatives: string[] = [
      'Alternative 1: More protective version',
      'Alternative 2: Balanced approach',
      'Alternative 3: Minimalist version',
    ];

    // Drafting notes
    const notes: string[] = [
      'Review for compliance with applicable law',
      'Consider negotiation position',
      'Verify consistency with rest of agreement',
    ];

    return {
      clauseText,
      alternatives,
      notes,
    };
  }

  /**
   * Review and suggest improvements to existing document
   */
  async reviewDocument(
    existingDocument: string,
    documentType: string,
    focusAreas?: string[]
  ): Promise<{
    issues: Array<{
      issue: string;
      severity: 'minor' | 'moderate' | 'major';
      suggestion: string;
      location?: string;
    }>;
    missingClauses: string[];
    improvementSuggestions: string[];
  }> {
    // Reuse analysis by treating as contract-like document
    const result = await this.execute({
      documentType,
      parties: [], // Not needed for review
      terms: {},
      specialProvisions: focusAreas || ['General review'],
    });

    const issues: Array<{
      issue: string;
      severity: 'minor' | 'moderate' | 'major';
      suggestion: string;
      location?: string;
    }> = [];

    // Convert problematic clauses to issues
    result.problematicClauses.forEach(pc => {
      issues.push({
        issue: pc.issue,
        severity: pc.severity as 'minor' | 'moderate' | 'major',
        suggestion: pc.suggestion,
        location: pc.clause.substring(0, 50),
      });
    });

    // Add compliance issues
    result.complianceIssues.forEach(ci => {
      issues.push({
        issue: ci.issue,
        severity: 'major',
        suggestion: ci.remediation,
        location: ci.regulation,
      });
    });

    const missingClauses = result.missingFields || [];
    const improvementSuggestions = result.suggestedAdditions.map(sa => sa.content);

    return {
      issues,
      missingClauses,
      improvementSuggestions,
    };
  }

  /**
   * Extract key terms from existing document
   */
  async extractKeyTerms(document: string): Promise<{
    parties: string[];
    dates: Array<{ type: string; date: string }>;
    monetaryAmounts: Array<{ description: string; amount: string }>;
    obligations: string[];
    governingLaw: string;
  }> {
    // This would use NLP extraction in production
    // For now, provides structured guidance
    
    const parties: string[] = [];
    const dates: Array<{ type: string; date: string }> = [];
    const monetaryAmounts: Array<{ description: string; amount: string }> = [];
    const obligations: string[] = [];
    let governingLaw = 'Not specified';

    // Simple pattern matching (would be enhanced with actual NLP)
    const datePattern = /\b(\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})\b/g;
    const moneyPattern = /\$[\d,]+(?:\.\d{2})?/g;

    const dateMatches = document.match(datePattern);
    if (dateMatches) {
      dateMatches.forEach(d => {
        dates.push({ type: 'Date mentioned', date: d });
      });
    }

    const moneyMatches = document.match(moneyPattern);
    if (moneyMatches) {
      moneyMatches.forEach(m => {
        monetaryAmounts.push({ description: 'Monetary term', amount: m });
      });
    }

    // Look for governing law
    const govLawMatch = document.match(/governing law.*?(?:shall be governed by).*?([A-Za-z\s]+)/i);
    if (govLawMatch) {
      governingLaw = govLawMatch[1].trim();
    }

    return {
      parties,
      dates,
      monetaryAmounts,
      obligations,
      governingLaw,
    };
  }
}
