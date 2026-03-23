// @ts-nocheck
/**
 * Clinical Note Summarization AI Service
 * 
 * Automatically summarizes clinical notes and patient records
 * for efficient review and handoff
 */

import { BaseAIService } from '@vayva/ai-agent';
import type { ClinicalNoteSummary } from '@vayva/ai-agent';

export interface ClinicalNoteInput {
  /** Type of clinical note */
  noteType: 'history_physical' | 'progress_note' | 'consultation' | 'discharge_summary' | 'operative_note';
  /** Raw clinical text */
  clinicalText: string;
  /** Patient age (optional) */
  patientAge?: number;
  /** Chief complaint if known (optional) */
  chiefComplaint?: string;
  /** Encounter date */
  encounterDate?: string;
  /** Provider name */
  providerName?: string;
}

export class ClinicalNoteSummarizationService extends BaseAIService<ClinicalNoteInput, ClinicalNoteSummary> {
  constructor() {
    super({
      model: 'clinical-assistant',
      temperature: 0.2, // Low for accurate summarization
      requireHumanValidation: false, // Summarization is less critical
      confidenceThreshold: 0.75,
    });
  }

  protected async buildPrompt(input: ClinicalNoteInput): Promise<string> {
    const prompt = `You are an expert medical scribe and clinical documentation specialist. Summarize the following clinical note into a structured format.

NOTE TYPE: ${input.noteType.replace('_', ' ').toUpperCase()}
${input.patientAge ? `PATIENT AGE: ${input.patientAge}` : ''}
${input.chiefComplaint ? `CHIEF COMPLAINT: ${input.chiefComplaint}` : ''}
${input.encounterDate ? `ENCOUNTER DATE: ${input.encounterDate}` : ''}
${input.providerName ? `PROVIDER: ${input.providerName}` : ''}

CLINICAL TEXT:
---
${input.clinicalText}
---

Extract and summarize the key information into the following structure:
1. Chief Complaint - Primary reason for visit
2. History of Present Illness (HPI) - Detailed description of current issue
3. Key Findings - Important physical exam findings, vital signs, and diagnostic results
4. Assessment - Diagnosis or clinical impression
5. Plan - Treatment plan, medications, follow-up

Additionally, suggest appropriate CPT codes if the documentation supports them.

Format your response as JSON with this exact structure:
{
  "chiefComplaint": "Primary complaint",
  "hpi": "Detailed HPI summary",
  "keyFindings": ["Finding 1", "Finding 2", ...],
  "assessment": "Clinical assessment/diagnosis",
  "plan": ["Plan item 1", "Plan item 2", ...],
  "suggestedCptCodes": ["99213", "99214", ...] // if applicable
}

Ensure the summary is concise yet comprehensive, capturing all clinically relevant information while removing redundancy.`;

    return prompt;
  }

  protected async parseResponse(rawResponse: string, input: ClinicalNoteInput): Promise<ClinicalNoteSummary> {
    try {
      // Extract JSON from response
      const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      // Validate required fields
      if (!parsed.chiefComplaint) {
        throw new Error('Missing chief complaint');
      }

      if (!parsed.hpi) {
        throw new Error('Missing HPI');
      }

      if (!parsed.assessment) {
        throw new Error('Missing assessment');
      }

      if (!parsed.plan || !Array.isArray(parsed.plan)) {
        throw new Error('Missing or invalid plan');
      }

      // Add validation rules
      this.addValidationRule({
        id: 'has_chief_complaint',
        validate: (data) => data.chiefComplaint.length > 0,
        errorMessage: 'No chief complaint identified',
        isCritical: true,
      });

      this.addValidationRule({
        id: 'has_assessment',
        validate: (data) => data.assessment.length > 0,
        errorMessage: 'No assessment identified',
        isCritical: true,
      });

      this.addValidationRule({
        id: 'has_plan',
        validate: (data) => data.plan.length > 0,
        errorMessage: 'No plan identified',
        isCritical: true,
      });

      this.addValidationRule({
        id: 'has_key_findings',
        validate: (data) => data.keyFindings.length > 0,
        errorMessage: 'No key findings identified',
        isCritical: false,
      });

      // For certain note types, add specific validations
      if (input.noteType === 'discharge_summary') {
        this.addValidationRule({
          id: 'discharge_instructions_present',
          validate: (data) => 
            data.plan.some(p => 
              p.toLowerCase().includes('discharge') ||
              p.toLowerCase().includes('follow-up') ||
              p.toLowerCase().includes('return')
            ),
          errorMessage: 'Discharge instructions not clearly identified',
          isCritical: false,
        });
      }

      if (input.noteType === 'operative_note') {
        this.addValidationRule({
          id: 'procedure_identified',
          validate: (data) => 
            data.assessment.toLowerCase().includes('procedure') ||
            data.assessment.toLowerCase().includes('operation') ||
            data.keyFindings.some(f => 
              f.toLowerCase().includes('procedure') ||
              f.toLowerCase().includes('operative')
            ),
          errorMessage: 'Procedure not clearly identified in operative note',
          isCritical: true,
        });
      }

      return {
        chiefComplaint: parsed.chiefComplaint,
        hpi: parsed.hpi,
        keyFindings: parsed.keyFindings || [],
        assessment: parsed.assessment,
        plan: parsed.plan,
        suggestedCptCodes: parsed.suggestedCptCodes,
      };
    } catch (error) {
      console.error('[ClinicalNoteSummarization] Failed to parse response:', error);
      throw new Error(`Failed to parse clinical note summary: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Quick summary of a clinical note
   */
  async summarize(clinicalText: string, noteType: ClinicalNoteInput['noteType'] = 'progress_note'): Promise<ClinicalNoteSummary> {
    await this.initialize();
    return this.execute({ noteType, clinicalText });
  }

  /**
   * Batch summarize multiple clinical notes
   */
  async batchSummarize(notes: Array<{ text: string; noteType: ClinicalNoteInput['noteType'] }>): Promise<ClinicalNoteSummary[]> {
    await this.initialize();
    
    const summaries = await Promise.all(
      notes.map(note => this.execute(note))
    );
    
    return summaries;
  }

  /**
   * Extract problem list from clinical notes
   */
  async extractProblemList(clinicalText: string): Promise<string[]> {
    const summary = await this.summarize(clinicalText, 'history_physical');
    
    // Extract problems from assessment and key findings
    const problems = new Set<string>();
    
    // Add assessment as primary problem
    if (summary.assessment) {
      problems.add(summary.assessment);
    }
    
    // Extract additional problems from key findings
    summary.keyFindings.forEach(finding => {
      if (
        finding.toLowerCase().includes('diagnosed') ||
        finding.toLowerCase().includes('positive') ||
        finding.toLowerCase().includes('abnormal') ||
        finding.toLowerCase().includes('elevated')
      ) {
        problems.add(finding);
      }
    });
    
    return Array.from(problems);
  }

  /**
   * Generate sign-out handoff summary
   */
  async generateSignOut(clinicalText: string): Promise<{
    patientSummary: string;
    activeIssues: string[];
    pendingItems: string[];
    contingencyPlans: string[];
  }> {
    const summary = await this.summarize(clinicalText, 'progress_note');
    
    // Identify active issues from assessment and plan
    const activeIssues = summary.keyFindings.filter(f => 
      f.toLowerCase().includes('active') ||
      f.toLowerCase().includes('ongoing') ||
      f.toLowerCase().includes('unresolved')
    );
    
    // Identify pending items from plan
    const pendingItems = summary.plan.filter(p => 
      p.toLowerCase().includes('pending') ||
      p.toLowerCase().includes('awaiting') ||
      p.toLowerCase().includes('to follow') ||
      p.toLowerCase().includes('wait for')
    );
    
    // Identify contingency plans
    const contingencyPlans = summary.plan.filter(p => 
      p.toLowerCase().includes('if') ||
      p.toLowerCase().includes('worsen') ||
      p.toLowerCase().includes('return if') ||
      p.toLowerCase().includes('call if')
    );
    
    return {
      patientSummary: `${summary.chiefComplaint}. ${summary.assessment}`,
      activeIssues,
      pendingItems,
      contingencyPlans,
    };
  }
}
