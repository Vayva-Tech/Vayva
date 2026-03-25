/**
 * Symptom Checker AI Service
 * 
 * Provides AI-powered symptom analysis for healthcare applications
 * with clinical decision support capabilities
 */

import { BaseAIService, type ClinicalInsight } from '@vayva/ai-agent';

export interface SymptomCheckInput {
  /** Patient age */
  age?: number;
  /** Patient gender */
  gender?: 'male' | 'female' | 'other';
  /** List of symptoms */
  symptoms: string[];
  /** Duration of symptoms */
  duration?: string;
  /** Severity level (1-10) */
  severity?: number;
  /** Relevant medical history */
  medicalHistory?: string[];
  /** Current medications */
  currentMedications?: string[];
  /** Known allergies */
  allergies?: string[];
}

export class SymptomCheckerService extends BaseAIService<SymptomCheckInput, ClinicalInsight> {
  constructor() {
    super({
      model: 'clinical-assistant',
      temperature: 0.3, // Lower for medical accuracy
      requireHumanValidation: true, // Critical for medical advice
      confidenceThreshold: 0.8,
    });
  }

  protected async buildPrompt(input: SymptomCheckInput): Promise<string> {
    const prompt = `You are an experienced clinical assistant. Analyze the following patient presentation and provide a structured clinical assessment.

PATIENT INFORMATION:
${input.age ? `- Age: ${input.age}` : ''}
${input.gender ? `- Gender: ${input.gender}` : ''}
${input.duration ? `- Symptom Duration: ${input.duration}` : ''}
${input.severity ? `- Severity (1-10): ${input.severity}` : ''}

CHIEF COMPLAINT:
Symptoms: ${input.symptoms.join(', ')}

MEDICAL HISTORY:
${input.medicalHistory?.length ? input.medicalHistory.join(', ') : 'Not provided'}

CURRENT MEDICATIONS:
${input.currentMedications?.length ? input.currentMedications.join(', ') : 'None reported'}

ALLERGIES:
${input.allergies?.length ? input.allergies.join(', ') : 'None reported'}

Please provide a comprehensive clinical assessment including:
1. Possible conditions ranked by likelihood (include ICD-10 codes if applicable)
2. Recommended next steps with urgency levels
3. Red flags that would require immediate medical attention

Format your response as JSON with this exact structure:
{
  "possibleConditions": [
    {
      "name": "Condition name",
      "icd10Code": "X.XX",
      "likelihood": "high|medium|low",
      "description": "Brief description"
    }
  ],
  "recommendedSteps": [
    {
      "action": "Recommended action",
      "urgency": "immediate|soon|routine",
      "rationale": "Why this is recommended"
    }
  ],
  "redFlags": ["List of warning signs requiring immediate attention"],
  "confidence": 0.0-1.0
}

IMPORTANT: This is a clinical decision support tool only. Always recommend appropriate medical follow-up.`;

    return prompt;
  }

  protected async parseResponse(rawResponse: string, input: SymptomCheckInput): Promise<ClinicalInsight> {
    try {
      // Try to extract JSON from the response
      const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      // Validate structure
      if (!parsed.possibleConditions || !Array.isArray(parsed.possibleConditions)) {
        throw new Error('Missing possibleConditions array');
      }

      if (!parsed.recommendedSteps || !Array.isArray(parsed.recommendedSteps)) {
        throw new Error('Missing recommendedSteps array');
      }

      if (!parsed.redFlags || !Array.isArray(parsed.redFlags)) {
        throw new Error('Missing redFlags array');
      }

      // Add validation rules dynamically based on input
      this.addValidationRule({
        id: 'has_conditions',
        validate: (data) => data.possibleConditions.length > 0,
        errorMessage: 'No conditions identified',
        isCritical: true,
      });

      this.addValidationRule({
        id: 'has_recommendations',
        validate: (data) => data.recommendedSteps.length > 0,
        errorMessage: 'No recommendations provided',
        isCritical: false,
      });

      this.addValidationRule({
        id: 'includes_followup',
        validate: (data) => 
          data.recommendedSteps.some(step => 
            step.urgency === 'immediate' || step.urgency === 'soon'
          ),
        errorMessage: 'No timely follow-up recommended',
        isCritical: true,
      });

      return {
        possibleConditions: parsed.possibleConditions,
        recommendedSteps: parsed.recommendedSteps,
        redFlags: parsed.redFlags,
        confidence: parsed.confidence || 0.5,
      };
    } catch (error) {
      console.error('[SymptomChecker] Failed to parse response:', error);
      throw new Error(`Failed to parse clinical insight: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  protected defaultOutput(_input: SymptomCheckInput): ClinicalInsight {
    return {
      possibleConditions: [],
      recommendedSteps: [
        {
          action: 'Consult a licensed healthcare provider for evaluation',
          urgency: 'routine',
          rationale: 'Configure a clinical AI provider to enable automated triage output',
        },
      ],
      redFlags: [],
      confidence: 0,
    };
  }

  /**
   * Quick symptom check with minimal input
   */
  async quickCheck(symptoms: string[]): Promise<ClinicalInsight> {
    await this.initialize();
    return this.execute({ symptoms });
  }

  /**
   * Comprehensive symptom assessment with full patient context
   */
  async comprehensiveAssessment(input: SymptomCheckInput): Promise<ClinicalInsight> {
    await this.initialize();
    return this.execute(input);
  }

  /**
   * Check if symptoms indicate emergency condition
   */
  async isEmergency(symptoms: string[]): Promise<{ isEmergency: boolean; redFlags: string[]; action: string }> {
    const result = await this.quickCheck(symptoms);
    
    const hasImmediateAction = result.recommendedSteps.some(
      step => step.urgency === 'immediate'
    );

    const emergencyRedFlags = result.redFlags.filter(flag => 
      flag.toLowerCase().includes('emergency') ||
      flag.toLowerCase().includes('call 911') ||
      flag.toLowerCase().includes('er') ||
      flag.toLowerCase().includes('hospital')
    );

    return {
      isEmergency: hasImmediateAction || emergencyRedFlags.length > 0,
      redFlags: result.redFlags,
      action: hasImmediateAction 
        ? 'Seek immediate medical attention'
        : 'Schedule appointment with healthcare provider',
    };
  }
}
