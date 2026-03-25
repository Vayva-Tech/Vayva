/**
 * Customer Preference AI Service
 * 
 * Analyzes customer preferences and provides personalized marketing recommendations
 */

import { BaseAIService } from '@vayva/ai-agent';

export type CustomerPreferenceInput = {
  customerId: string;
  visitHistory: Array<{
    date: string;
    itemsOrdered: string[];
    spend: number;
    partySize: number;
    occasion?: string;
  }>;
};

export type CustomerPreferenceOutput = {
  favoriteItems: string[];
  averageSpend: number;
  visitFrequency: string;
  preferredTimes: string[];
  dietaryRestrictions: string[];
  personalizedOffers: Array<{
    offer: string;
    relevance: number;
    optimalTiming: string;
  }>;
};

export class CustomerPreferenceService extends BaseAIService<
  CustomerPreferenceInput,
  CustomerPreferenceOutput
> {
  constructor() {
    super({
      model: 'restaurant-optimizer',
      temperature: 0.4,
      requireHumanValidation: false,
      confidenceThreshold: 0.75,
    });
  }

  protected defaultOutput(_input: CustomerPreferenceInput): CustomerPreferenceOutput {
    return {
      favoriteItems: [],
      averageSpend: 0,
      visitFrequency: 'unknown',
      preferredTimes: [],
      dietaryRestrictions: [],
      personalizedOffers: [],
    };
  }

  protected async buildPrompt(_input: CustomerPreferenceInput): Promise<string> {
    return `Analyze customer dining preferences and provide personalized recommendations...`;
  }

  protected async parseResponse(
    rawResponse: string,
    _input: CustomerPreferenceInput
  ): Promise<CustomerPreferenceOutput> {
    const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No valid JSON');
    return JSON.parse(jsonMatch[0]) as CustomerPreferenceOutput;
  }

  async analyzeCustomerPreferences(
    customerId: string,
    visitHistory: CustomerPreferenceInput['visitHistory']
  ): Promise<CustomerPreferenceOutput> {
    return this.execute({ customerId, visitHistory });
  }
}
