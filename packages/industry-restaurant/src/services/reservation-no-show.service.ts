/**
 * Reservation No-Show Prediction Service
 * 
 * Predicts reservation no-show probability and recommends overbooking strategies
 */

import { BaseAIService } from '@vayva/ai-agent';

export type ReservationNoShowInput = {
  partySize: number;
  timeSlot: string;
  dayOfWeek: string;
  bookingLeadTime: number;
  customerHistory?: { pastNoShows: number; pastReservations: number };
};

export type ReservationNoShowOutput = {
  probability: number;
  riskLevel: 'low' | 'medium' | 'high';
  factors: string[];
  recommendation: 'confirm' | 'overbook' | 'decline';
};

export class ReservationNoShowService extends BaseAIService<
  ReservationNoShowInput,
  ReservationNoShowOutput
> {
  constructor() {
    super({
      model: 'restaurant-optimizer',
      temperature: 0.3,
      requireHumanValidation: false,
      confidenceThreshold: 0.75,
    });
  }

  protected defaultOutput(_input: ReservationNoShowInput): ReservationNoShowOutput {
    return {
      probability: 0.15,
      riskLevel: 'low',
      factors: [],
      recommendation: 'confirm',
    };
  }

  protected async buildPrompt(_input: ReservationNoShowInput): Promise<string> {
    return `Analyze reservation patterns and predict no-show probability...`;
  }

  protected async parseResponse(
    rawResponse: string,
    _input: ReservationNoShowInput
  ): Promise<ReservationNoShowOutput> {
    const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No valid JSON');
    return JSON.parse(jsonMatch[0]) as ReservationNoShowOutput;
  }

  async predictNoShowProbability(
    reservationData: ReservationNoShowInput
  ): Promise<ReservationNoShowOutput> {
    return this.execute(reservationData);
  }
}
