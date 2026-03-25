/**
 * Treatment Recommendation AI Service
 * 
 * Provides evidence-based treatment suggestions and care plan recommendations
 * for healthcare practitioners
 */

import { BaseAIService, type TreatmentRecommendation } from '@vayva/ai-agent';

export interface TreatmentRecommendationInput {
  /** Diagnosis or condition */
  diagnosis: string;
  /** ICD-10 code if known */
  icd10Code?: string;
  /** Patient age */
  age?: number;
  /** Patient gender */
  gender?: 'male' | 'female' | 'other';
  /** Patient weight (kg) - for dosing calculations */
  weightKg?: number;
  /** Comorbidities */
  comorbidities?: string[];
  /** Current medications */
  currentMedications?: string[];
  /** Known allergies */
  allergies?: string[];
  /** Pregnancy/breastfeeding status */
  pregnancyStatus?: 'pregnant' | 'breastfeeding' | 'not_applicable';
  /** Previous treatments tried */
  previousTreatments?: Array<{
    treatment: string;
    duration: string;
    outcome: 'effective' | 'ineffective' | 'partial' | 'adverse_reaction';
  }>;
  /** Patient preferences */
  preferences?: {
    preferNonPharmacological?: boolean;
    preferGeneric?: boolean;
    costConstraint?: 'low' | 'moderate' | 'none';
  };
}

export class TreatmentRecommendationService extends BaseAIService<TreatmentRecommendationInput, TreatmentRecommendation> {
  constructor() {
    super({
      model: 'clinical-assistant',
      temperature: 0.2, // Very low for precision
      requireHumanValidation: true, // Critical for treatment decisions
      confidenceThreshold: 0.85,
    });
  }

  protected async buildPrompt(input: TreatmentRecommendationInput): Promise<string> {
    const prompt = `You are an experienced clinical pharmacologist and treatment specialist. Provide evidence-based treatment recommendations for the following patient.

DIAGNOSIS:
${input.diagnosis}${input.icd10Code ? ` (ICD-10: ${input.icd10Code})` : ''}

PATIENT DEMOGRAPHICS:
${input.age ? `- Age: ${input.age}` : ''}
${input.gender ? `- Gender: ${input.gender}` : ''}
${input.weightKg ? `- Weight: ${input.weightKg} kg` : ''}
${input.pregnancyStatus && input.pregnancyStatus !== 'not_applicable' ? `- Status: ${input.pregnancyStatus}` : ''}

COMORBIDITIES:
${input.comorbidities?.length ? input.comorbidities.join(', ') : 'None reported'}

CURRENT MEDICATIONS:
${input.currentMedications?.length ? input.currentMedications.join(', ') : 'None'}

ALLERGIES:
${input.allergies?.length ? input.allergies.join(', ') : 'None reported'}

PREVIOUS TREATMENTS:
${input.previousTreatments?.length 
  ? input.previousTreatments.map(t => `- ${t.treatment} (${t.duration}): ${t.outcome}`).join('\n')
  : 'None'}

PATIENT PREFERENCES:
${input.preferences?.preferNonPharmacological ? '- Prefers non-pharmacological approaches' : ''}
${input.preferences?.preferGeneric ? '- Prefers generic medications' : ''}
${input.preferences?.costConstraint === 'low' ? '- Cost-sensitive: prefer low-cost options' : ''}
${input.preferences?.costConstraint === 'moderate' ? '- Moderate cost constraint' : ''}

Please provide comprehensive treatment recommendations including:
1. First-line treatments with dosing, frequency, and monitoring parameters
2. Alternative treatments if first-line is contraindicated or ineffective
3. Non-pharmacological interventions
4. Patient education points
5. Follow-up plan

Format your response as JSON with this exact structure:
{
  "condition": "Condition being treated",
  "treatments": [
    {
      "name": "Treatment name",
      "type": "medication|therapy|lifestyle|procedure",
      "evidenceLevel": "strong|moderate|weak",
      "dosage": "Dosage if applicable",
      "frequency": "Frequency if applicable",
      "contraindications": ["List"],
      "sideEffects": ["List"]
    }
  ],
  "patientConsiderations": ["Special considerations for this patient"],
  "followUp": {
    "timeframe": "When to follow up",
    "actions": ["What to monitor/do at follow-up"]
  }
}

IMPORTANT: Consider drug-drug interactions, contraindications, and patient-specific factors. This is a decision support tool only - final treatment decisions require clinical judgment.`;

    return prompt;
  }

  protected async parseResponse(rawResponse: string, input: TreatmentRecommendationInput): Promise<TreatmentRecommendation> {
    try {
      // Extract JSON from response
      const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      // Validate structure
      if (!parsed.treatments || !Array.isArray(parsed.treatments)) {
        throw new Error('Missing treatments array');
      }

      // Add validation rules
      this.addValidationRule({
        id: 'has_treatments',
        validate: (data) => data.treatments.length > 0,
        errorMessage: 'No treatments recommended',
        isCritical: true,
      });

      this.addValidationRule({
        id: 'considers_allergies',
        validate: (data) => {
          if (!input.allergies?.length) return true;
          // Check if any contraindications mention allergies
          return data.treatments.some(t => 
            t.contraindications?.some(c => 
              c.toLowerCase().includes('allergy') || c.toLowerCase().includes('hypersensitivity')
            )
          );
        },
        errorMessage: 'Allergies not adequately considered',
        isCritical: true,
      });

      this.addValidationRule({
        id: 'includes_monitoring',
        validate: (data) => 
          data.treatments.some(t => t.type === 'medication') &&
          data.followUp.actions.some(a => 
            a.toLowerCase().includes('monitor') || 
            a.toLowerCase().includes('follow') ||
            a.toLowerCase().includes('check')
          ),
        errorMessage: 'No monitoring plan for medications',
        isCritical: false,
      });

      // Check for drug interactions warning if on multiple medications
      if (input.currentMedications && input.currentMedications.length > 2) {
        this.addValidationRule({
          id: 'drug_interaction_check',
          validate: (data) => 
            data.treatments.some(t => 
              t.contraindications?.some(c => c.toLowerCase().includes('interaction'))
            ) ||
            data.patientConsiderations.some(c => 
              c.toLowerCase().includes('interaction')
            ),
          errorMessage: 'Drug interactions not addressed with polypharmacy',
          isCritical: true,
        });
      }

      return {
        condition: parsed.condition || input.diagnosis,
        treatments: parsed.treatments,
        patientConsiderations: parsed.patientConsiderations || [],
        followUp: parsed.followUp || { timeframe: 'As clinically indicated', actions: [] },
      };
    } catch (error) {
      console.error('[TreatmentRecommendation] Failed to parse response:', error);
      throw new Error(`Failed to parse treatment recommendation: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  protected defaultOutput(input: TreatmentRecommendationInput): TreatmentRecommendation {
    return {
      condition: input.diagnosis,
      treatments: [],
      patientConsiderations: ['Configure a clinical AI provider for treatment suggestions'],
      followUp: { timeframe: 'As clinically indicated', actions: ['Consult specialist'] },
    };
  }

  /**
   * Get first-line treatment recommendations
   */
  async getFirstLineTreatment(diagnosis: string): Promise<TreatmentRecommendation> {
    await this.initialize();
    return this.execute({ diagnosis });
  }

  /**
   * Comprehensive treatment planning with full patient context
   */
  async createTreatmentPlan(input: TreatmentRecommendationInput): Promise<TreatmentRecommendation> {
    await this.initialize();
    return this.execute(input);
  }

  /**
   * Check for contraindications between proposed treatment and patient factors
   */
  async checkContraindications(
    proposedTreatment: string,
    patientFactors: {
      medications?: string[];
      allergies?: string[];
      comorbidities?: string[];
      pregnancyStatus?: string;
    }
  ): Promise<{
    isContraindicated: boolean;
    contraindications: string[];
    alternatives: string[];
    warnings: string[];
  }> {
    const result = await this.execute({
      diagnosis: 'General',
      currentMedications: patientFactors.medications,
      allergies: patientFactors.allergies,
      comorbidities: patientFactors.comorbidities,
      pregnancyStatus: patientFactors.pregnancyStatus as any,
    });

    const contraindications: string[] = [];
    const warnings: string[] = [];
    const alternatives: string[] = [];

    result.treatments.forEach(treatment => {
      if (treatment.name.toLowerCase() === proposedTreatment.toLowerCase()) {
        contraindications.push(...(treatment.contraindications ?? []));
        
        // Look for alternatives in the same response
        result.treatments
          .filter(t => t.name !== proposedTreatment)
          .forEach(t => {
            alternatives.push(t.name);
          });
      }
    });

    // Extract warnings from patient considerations
    result.patientConsiderations.forEach(consideration => {
      if (
        consideration.toLowerCase().includes('warning') ||
        consideration.toLowerCase().includes('caution') ||
        consideration.toLowerCase().includes('monitor')
      ) {
        warnings.push(consideration);
      }
    });

    return {
      isContraindicated: contraindications.length > 0,
      contraindications,
      alternatives,
      warnings,
    };
  }
}
