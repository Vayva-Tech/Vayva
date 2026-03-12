/**
 * Table Turn Prediction Engine
 * Predicts when tables will become available
 */

import {
  type TableTurnPrediction,
  type TurnPredictionFactors,
  type TableReservation,
  type PartyInfo,
  type Table,
  type PredictionModel,
} from '../../types/table.js';

export interface PredictionInput {
  table: Table;
  reservation: TableReservation;
  historicalData?: number[]; // Previous turn times for this table
}

export interface PredictionConfig {
  model: PredictionModel;
  avgAppetizerTime: number; // minutes
  avgEntreeTime: number;
  avgDessertTime: number;
  avgCheckTime: number;
  avgPaymentTime: number;
  avgResetTime: number;
}

export class TableTurnPredictionEngine {
  private config: PredictionConfig;
  private historicalData: Map<string, number[]> = new Map(); // tableId -> turn times

  constructor(config: PredictionConfig) {
    this.config = config;
  }

  /**
   * Predict when a table will be ready
   */
  predict(input: PredictionInput): TableTurnPrediction {
    const { table, reservation } = input;

    // Build party info
    const partyInfo: PartyInfo = {
      reservationId: reservation.id,
      partyName: reservation.partyName,
      partySize: reservation.partySize,
      isVip: false, // Would be determined from customer history
      visitCount: 0,
    };

    // Calculate factors
    const factors = this.calculateFactors(reservation, table);

    // Calculate predicted ready time
    let predictedReadyTime: Date;
    let confidence: number;

    if (this.config.model === 'ml') {
      // ML model would be used here
      ({ predictedReadyTime, confidence } = this.predictWithML(input, factors));
    } else {
      ({ predictedReadyTime, confidence } = this.predictWithRules(input, factors));
    }

    // Determine suggested action
    const suggestedAction = this.determineSuggestedAction(reservation, factors);

    return {
      tableId: table.id,
      currentParty: partyInfo,
      predictedReadyTime,
      confidence,
      factors,
      suggestedAction,
    };
  }

  /**
   * Add historical turn time data
   */
  addHistoricalData(tableId: string, turnTimeMinutes: number): void {
    const data = this.historicalData.get(tableId) || [];
    data.push(turnTimeMinutes);
    // Keep last 50 data points
    if (data.length > 50) {
      data.shift();
    }
    this.historicalData.set(tableId, data);
  }

  /**
   * Get average turn time for a table
   */
  getAverageTurnTime(tableId: string): number {
    const data = this.historicalData.get(tableId) || [];
    if (data.length === 0) return 60; // Default 60 minutes
    return data.reduce((a, b) => a + b, 0) / data.length;
  }

  /**
   * Batch predict for multiple tables
   */
  batchPredict(inputs: PredictionInput[]): TableTurnPrediction[] {
    return inputs.map(input => this.predict(input));
  }

  /**
   * Get tables predicted to be ready within time window
   */
  getTablesReadySoon(
    inputs: PredictionInput[],
    withinMinutes: number = 15
  ): Array<{ input: PredictionInput; prediction: TableTurnPrediction }> {
    const cutoff = new Date(Date.now() + withinMinutes * 60000);
    const results = [];

    for (const input of inputs) {
      const prediction = this.predict(input);
      if (prediction.predictedReadyTime <= cutoff) {
        results.push({ input, prediction });
      }
    }

    return results.sort(
      (a, b) => a.prediction.predictedReadyTime.getTime() - b.prediction.predictedReadyTime.getTime()
    );
  }

  private calculateFactors(
    reservation: TableReservation,
    table: Table
  ): TurnPredictionFactors {
    const now = new Date();
    const seatedAt = reservation.seatedAt || now;
    const currentDuration = (now.getTime() - seatedAt.getTime()) / 60000;

    // Calculate course progress
    const courseProgress = this.calculateCourseProgress(reservation);

    // Determine payment status
    let paymentStatus: 'pending' | 'processing' | 'complete' = 'pending';
    if (reservation.paidAt) {
      paymentStatus = 'complete';
    } else if (reservation.checkDroppedAt) {
      paymentStatus = 'processing';
    }

    // Calculate average course time based on party size
    const partySizeFactor = Math.max(0.8, Math.min(1.3, reservation.partySize / 4));
    const avgCourseTime =
      (this.config.avgAppetizerTime +
        this.config.avgEntreeTime +
        this.config.avgDessertTime) *
      partySizeFactor;

    return {
      courseProgress,
      avgCourseTime,
      paymentStatus,
      tableResetTime: this.config.avgResetTime,
      partySize: reservation.partySize,
      historicalTurnTime: table.avgTurnTimeMinutes || this.getAverageTurnTime(table.id),
      currentDuration,
    };
  }

  private calculateCourseProgress(reservation: TableReservation): number {
    const progress = reservation.courseProgress;
    if (!progress) return 0;

    // Calculate based on completed courses
    let completedTime = 0;
    let totalTime =
      this.config.avgAppetizerTime +
      this.config.avgEntreeTime +
      this.config.avgDessertTime;

    if (progress.appetizerCompleted) {
      completedTime += this.config.avgAppetizerTime;
    } else if (progress.appetizerStarted) {
      const elapsed = (new Date().getTime() - progress.appetizerStarted.getTime()) / 60000;
      completedTime += Math.min(elapsed, this.config.avgAppetizerTime);
    }

    if (progress.entreeCompleted) {
      completedTime += this.config.avgEntreeTime;
    } else if (progress.entreeStarted && !progress.entreeCompleted) {
      const elapsed = (new Date().getTime() - progress.entreeStarted.getTime()) / 60000;
      completedTime += Math.min(elapsed, this.config.avgEntreeTime);
    }

    if (progress.dessertCompleted) {
      completedTime += this.config.avgDessertTime;
    } else if (progress.dessertStarted && !progress.dessertCompleted) {
      const elapsed = (new Date().getTime() - progress.dessertStarted.getTime()) / 60000;
      completedTime += Math.min(elapsed, this.config.avgDessertTime);
    }

    return Math.round((completedTime / totalTime) * 100);
  }

  private predictWithRules(
    input: PredictionInput,
    factors: TurnPredictionFactors
  ): { predictedReadyTime: Date; confidence: number } {
    const { reservation } = input;
    const now = new Date();
    let remainingMinutes = 0;

    // Estimate remaining time based on current status
    switch (reservation.status) {
      case 'seated':
        remainingMinutes =
          this.config.avgAppetizerTime +
          this.config.avgEntreeTime +
          this.config.avgDessertTime +
          this.config.avgCheckTime +
          this.config.avgPaymentTime +
          this.config.avgResetTime;
        break;
      case 'ordered':
        remainingMinutes =
          this.config.avgAppetizerTime * 0.5 +
          this.config.avgEntreeTime +
          this.config.avgDessertTime +
          this.config.avgCheckTime +
          this.config.avgPaymentTime +
          this.config.avgResetTime;
        break;
      case 'eating':
        remainingMinutes =
          this.config.avgEntreeTime * 0.5 +
          this.config.avgDessertTime +
          this.config.avgCheckTime +
          this.config.avgPaymentTime +
          this.config.avgResetTime;
        break;
      case 'dessert':
        remainingMinutes =
          this.config.avgDessertTime * 0.5 +
          this.config.avgCheckTime +
          this.config.avgPaymentTime +
          this.config.avgResetTime;
        break;
      case 'check_dropped':
        remainingMinutes =
          this.config.avgPaymentTime + this.config.avgResetTime;
        break;
      case 'paid':
        remainingMinutes = this.config.avgResetTime;
        break;
      default:
        remainingMinutes = factors.historicalTurnTime - factors.currentDuration;
    }

    // Adjust for party size
    const partySizeFactor = Math.max(0.8, Math.min(1.3, factors.partySize / 4));
    remainingMinutes *= partySizeFactor;

    // Adjust for course progress
    const progressFactor = 1 - factors.courseProgress / 100;
    remainingMinutes = Math.min(remainingMinutes, factors.avgCourseTime * 3 * progressFactor);

    // Ensure minimum time
    remainingMinutes = Math.max(5, remainingMinutes);

    const predictedReadyTime = new Date(now.getTime() + remainingMinutes * 60000);

    // Calculate confidence based on data availability
    let confidence = 0.7; // Base confidence
    const historicalData = this.historicalData.get(input.table.id);
    if (historicalData && historicalData.length > 10) {
      confidence += 0.2;
    }
    if (factors.courseProgress > 50) {
      confidence += 0.1;
    }
    confidence = Math.min(0.95, confidence);

    return { predictedReadyTime, confidence };
  }

  private predictWithML(
    input: PredictionInput,
    factors: TurnPredictionFactors
  ): { predictedReadyTime: Date; confidence: number } {
    // Placeholder for ML model integration
    // In production, this would call a trained model
    // For now, fall back to rule-based
    return this.predictWithRules(input, factors);
  }

  private determineSuggestedAction(
    reservation: TableReservation,
    factors: TurnPredictionFactors
  ): 'start_check' | 'offer_dessert' | 'prepare_table' | 'none' {
    // Suggest actions based on progress
    if (reservation.status === 'eating' && factors.courseProgress > 80) {
      return 'offer_dessert';
    }

    if (reservation.status === 'dessert' && factors.courseProgress > 90) {
      return 'start_check';
    }

    if (reservation.status === 'paid') {
      return 'prepare_table';
    }

    // Check if predicted ready time is within notification lead time
    const remainingMinutes =
      (new Date(Date.now() + factors.tableResetTime * 60000).getTime() - Date.now()) / 60000;
    if (remainingMinutes <= 10) {
      return 'prepare_table';
    }

    return 'none';
  }
}

/**
 * Simple rule-based prediction for quick estimates
 */
export function quickTurnEstimate(
  partySize: number,
  courseCount: number = 3,
  hasDessert: boolean = true
): number {
  const baseTime = 15; // Seating + ordering
  const perPersonTime = 5;
  const perCourseTime = 15;

  let estimate = baseTime + partySize * perPersonTime + courseCount * perCourseTime;

  if (!hasDessert) {
    estimate -= 15;
  }

  // Add buffer for payment and reset
  estimate += 10;

  return estimate;
}
