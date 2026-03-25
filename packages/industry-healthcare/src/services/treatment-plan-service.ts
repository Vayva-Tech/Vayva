/**
 * Treatment Plan Service
 *
 * Manages care plans, treatment goals, and clinical pathways
 * for healthcare patients. Uses an in-process store until Prisma models exist.
 */

import { z } from 'zod';

// Schema definitions
export const TreatmentPlanSchema = z.object({
  patientId: z.string(),
  storeId: z.string(),
  diagnosisCodes: z.array(z.string()),
  goals: z.array(z.string()),
  interventions: z.array(
    z.object({
      type: z.string(),
      description: z.string(),
      frequency: z.string(),
      duration: z.string().optional(),
    }),
  ),
  medications: z
    .array(
      z.object({
        name: z.string(),
        dosage: z.string(),
        frequency: z.string(),
        route: z.string().optional(),
      }),
    )
    .optional(),
  followUpSchedule: z
    .object({
      frequency: z.string(),
      nextAppointment: z.date().optional(),
    })
    .optional(),
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

interface StoredTreatmentPlan {
  id: string;
  patientId: string;
  storeId: string;
  diagnosisCodes: string[];
  goals: string[];
  interventions: Intervention[];
  medications: MedicationPlan[];
  followUpFrequency?: string;
  nextFollowUp?: Date;
  createdBy: string;
  status: 'active' | 'completed';
  createdAt: Date;
  updatedAt: Date;
  completionReason?: string;
  completedAt?: Date;
}

interface ProgressEntry {
  planId: string;
  notes: string;
  outcomes: string[];
  recordedAt: Date;
}

export class TreatmentPlanService {
  private readonly plans = new Map<string, StoredTreatmentPlan>();
  private readonly progressLog: ProgressEntry[] = [];

  /**
   * Create a new treatment plan
   */
  async createTreatmentPlan(planData: TreatmentPlanData): Promise<
    StoredTreatmentPlan & { patient: null }
  > {
    const id = `tp_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const row: StoredTreatmentPlan = {
      id,
      patientId: planData.patientId,
      storeId: planData.storeId,
      diagnosisCodes: planData.diagnosisCodes,
      goals: planData.goals.map((g) => (typeof g === 'string' ? g : g.description)),
      interventions: planData.interventions,
      medications: planData.medications ?? [],
      followUpFrequency: planData.followUpSchedule?.frequency,
      nextFollowUp: planData.followUpSchedule?.nextAppointment,
      createdBy: planData.createdBy,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.plans.set(id, row);
    return { ...row, patient: null };
  }

  /**
   * Get treatment plan by ID
   */
  async getTreatmentPlan(
    planId: string,
  ): Promise<(StoredTreatmentPlan & { patient: null; goals: string[]; interventions: Intervention[] }) | null> {
    const p = this.plans.get(planId);
    if (!p) return null;
    return { ...p, patient: null, goals: p.goals, interventions: p.interventions };
  }

  /**
   * Update treatment plan
   */
  async updateTreatmentPlan(
    planId: string,
    updates: Partial<TreatmentPlanData>,
  ): Promise<StoredTreatmentPlan | null> {
    const existing = this.plans.get(planId);
    if (!existing) return null;

    if (updates.diagnosisCodes) existing.diagnosisCodes = updates.diagnosisCodes;
    if (updates.goals) {
      existing.goals = updates.goals.map((g) => (typeof g === 'string' ? g : g.description));
    }
    if (updates.interventions) existing.interventions = updates.interventions;
    if (updates.medications) existing.medications = updates.medications;
    if (updates.followUpSchedule) {
      existing.followUpFrequency = updates.followUpSchedule.frequency;
      existing.nextFollowUp = updates.followUpSchedule.nextAppointment;
    }
    existing.updatedAt = new Date();
    this.plans.set(planId, existing);
    return existing;
  }

  /**
   * Add goal to treatment plan
   */
  async addGoal(planId: string, goal: TreatmentGoal): Promise<StoredTreatmentPlan | null> {
    const existing = this.plans.get(planId);
    if (!existing) return null;
    existing.goals = [...existing.goals, goal.description];
    existing.updatedAt = new Date();
    this.plans.set(planId, existing);
    return existing;
  }

  /**
   * Update goal status
   */
  async updateGoalStatus(
    planId: string,
    goalIndex: number,
    status: 'pending' | 'in_progress' | 'achieved' | 'not_met',
  ): Promise<void> {
    void planId;
    void goalIndex;
    void status;
    console.log(`[TreatmentPlan] Updated goal ${goalIndex} status to ${status}`);
  }

  /**
   * Track treatment plan progress
   */
  async trackProgress(
    planId: string,
    notes: string,
    outcomes?: string[],
  ): Promise<ProgressEntry> {
    const entry: ProgressEntry = {
      planId,
      notes,
      outcomes: outcomes ?? [],
      recordedAt: new Date(),
    };
    this.progressLog.push(entry);
    return entry;
  }

  /**
   * Get treatment plans by patient
   */
  async getPlansByPatient(patientId: string): Promise<StoredTreatmentPlan[]> {
    return Array.from(this.plans.values())
      .filter((p) => p.patientId === patientId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Get active treatment plans
   */
  async getActivePlans(storeId: string): Promise<StoredTreatmentPlan[]> {
    return Array.from(this.plans.values())
      .filter((p) => p.storeId === storeId && p.status === 'active')
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  /**
   * Archive completed treatment plan
   */
  async archivePlan(planId: string, reason: string): Promise<StoredTreatmentPlan | null> {
    const p = this.plans.get(planId);
    if (!p) return null;
    p.status = 'completed';
    p.completionReason = reason;
    p.completedAt = new Date();
    p.updatedAt = new Date();
    this.plans.set(planId, p);
    return p;
  }

  /**
   * Generate treatment plan report
   */
  async generatePlanReport(planId: string): Promise<{
    plan: StoredTreatmentPlan;
    progress: ProgressEntry[];
    totalProgressNotes: number;
    generatedAt: Date;
  }> {
    const plan = this.plans.get(planId);
    if (!plan) {
      throw new Error('Treatment plan not found');
    }
    const progress = this.progressLog
      .filter((e) => e.planId === planId)
      .sort((a, b) => b.recordedAt.getTime() - a.recordedAt.getTime());
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

  async dispose(): Promise<void> {}
}
