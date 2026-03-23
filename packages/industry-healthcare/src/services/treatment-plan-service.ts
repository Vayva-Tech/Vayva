// @ts-nocheck
/**
 * Treatment Plan Service
 * 
 * Manages care plans, treatment goals, and clinical pathways
 * for healthcare patients.
 */

import { PrismaClient } from '@vayva/prisma';
import { z } from 'zod';

const prisma = new PrismaClient();

// Schema definitions
export const TreatmentPlanSchema = z.object({
  patientId: z.string(),
  storeId: z.string(),
  diagnosisCodes: z.array(z.string()),
  goals: z.array(z.string()),
  interventions: z.array(z.object({
    type: z.string(),
    description: z.string(),
    frequency: z.string(),
    duration: z.string().optional(),
  })),
  medications: z.array(z.object({
    name: z.string(),
    dosage: z.string(),
    frequency: z.string(),
    route: z.string().optional(),
  })).optional(),
  followUpSchedule: z.object({
    frequency: z.string(),
    nextAppointment: z.date().optional(),
  }).optional(),
  createdBy: z.string(),
});

export interface TreatmentGoal {
  id?: string;
  description: string;
  targetDate?: Date;
  status: 'pending' | 'in_progress' | 'achieved' | 'not_met';
  priority: 'low' | 'medium' | 'high';
}

export interface Intervention {
  type: string;
  description: string;
  frequency: string;
  duration?: string;
}

export interface MedicationPlan {
  name: string;
  dosage: string;
  frequency: string;
  route?: string;
}

export interface TreatmentPlanData {
  id?: string;
  patientId: string;
  storeId: string;
  diagnosisCodes: string[];
  goals: (string | TreatmentGoal)[];
  interventions: Intervention[];
  medications?: MedicationPlan[];
  followUpSchedule?: {
    frequency: string;
    nextAppointment?: Date;
  };
  createdBy: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class TreatmentPlanService {
  /**
   * Create a new treatment plan
   */
  async createTreatmentPlan(planData: TreatmentPlanData): Promise<any> {
    const { patientId, storeId, diagnosisCodes, goals, interventions, medications, followUpSchedule, createdBy } = planData;

    return prisma.treatmentPlan.create({
      data: {
        patientId,
        storeId,
        diagnosisCodes,
        goals: goals.map(g => typeof g === 'string' ? g : g.description),
        interventions: interventions as any[],
        medications: medications as any[] || [],
        followUpFrequency: followUpSchedule?.frequency,
        nextFollowUp: followUpSchedule?.nextAppointment,
        createdBy,
      },
      include: {
        patient: true,
      },
    });
  }

  /**
   * Get treatment plan by ID
   */
  async getTreatmentPlan(planId: string): Promise<any> {
    return prisma.treatmentPlan.findUnique({
      where: { id: planId },
      include: {
        patient: true,
        goals: true,
        interventions: true,
      },
    });
  }

  /**
   * Update treatment plan
   */
  async updateTreatmentPlan(
    planId: string,
    updates: Partial<TreatmentPlanData>
  ): Promise<any> {
    const updateData: any = {};

    if (updates.diagnosisCodes) {
      updateData.diagnosisCodes = updates.diagnosisCodes;
    }
    if (updates.goals) {
      updateData.goals = updates.goals.map(g => typeof g === 'string' ? g : g.description);
    }
    if (updates.interventions) {
      updateData.interventions = updates.interventions as any[];
    }
    if (updates.medications) {
      updateData.medications = updates.medications as any[];
    }
    if (updates.followUpSchedule) {
      updateData.followUpFrequency = updates.followUpSchedule.frequency;
      updateData.nextFollowUp = updates.followUpSchedule.nextAppointment;
    }

    updateData.updatedAt = new Date();

    return prisma.treatmentPlan.update({
      where: { id: planId },
      data: updateData,
    });
  }

  /**
   * Add goal to treatment plan
   */
  async addGoal(
    planId: string,
    goal: TreatmentGoal
  ): Promise<any> {
    const existingPlan = await this.getTreatmentPlan(planId);
    const currentGoals = existingPlan.goals || [];

    return prisma.treatmentPlan.update({
      where: { id: planId },
      data: {
        goals: [...currentGoals, goal.description] as any[],
      },
    });
  }

  /**
   * Update goal status
   */
  async updateGoalStatus(
    planId: string,
    goalIndex: number,
    status: 'pending' | 'in_progress' | 'achieved' | 'not_met'
  ): Promise<void> {
    // Implementation would depend on how goals are stored
    // This is a simplified version
    console.log(`[TreatmentPlan] Updated goal ${goalIndex} status to ${status}`);
  }

  /**
   * Track treatment plan progress
   */
  async trackProgress(
    planId: string,
    notes: string,
    outcomes?: string[]
  ): Promise<any> {
    return prisma.treatmentPlanProgress.create({
      data: {
        planId,
        notes,
        outcomes: outcomes || [],
        recordedAt: new Date(),
      },
    });
  }

  /**
   * Get treatment plans by patient
   */
  async getPlansByPatient(patientId: string): Promise<any[]> {
    return prisma.treatmentPlan.findMany({
      where: { patientId },
      orderBy: { createdAt: 'desc' },
      include: {
        goals: true,
        interventions: true,
      },
    });
  }

  /**
   * Get active treatment plans
   */
  async getActivePlans(storeId: string): Promise<any[]> {
    return prisma.treatmentPlan.findMany({
      where: {
        storeId,
        status: 'active',
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  /**
   * Archive completed treatment plan
   */
  async archivePlan(planId: string, reason: string): Promise<any> {
    return prisma.treatmentPlan.update({
      where: { id: planId },
      data: {
        status: 'completed',
        completionReason: reason,
        completedAt: new Date(),
      },
    });
  }

  /**
   * Generate treatment plan report
   */
  async generatePlanReport(planId: string): Promise<any> {
    const plan = await this.getTreatmentPlan(planId);

    if (!plan) {
      throw new Error('Treatment plan not found');
    }

    const progress = await prisma.treatmentPlanProgress.findMany({
      where: { planId },
      orderBy: { recordedAt: 'desc' },
    });

    return {
      plan,
      progress,
      totalProgressNotes: progress.length,
      generatedAt: new Date(),
    };
  }

  async initialize(): Promise<void> {
    console.log('[TreatmentPlanService] Initialized');
  }

  async dispose(): Promise<void> {
    // Cleanup if needed
  }
}
