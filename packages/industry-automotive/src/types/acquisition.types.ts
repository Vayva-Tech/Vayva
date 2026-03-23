// @ts-nocheck
import { z } from 'zod';

export const AcquisitionType = z.enum(['purchase', 'trade_in', 'consignment']);
export type AcquisitionType = z.infer<typeof AcquisitionType>;

export const TradeInEvaluationSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  vehicleId: z.string(),
  customerId: z.string(),
  evaluatorId: z.string(),
  evaluationDate: z.date(),
  
  // Physical condition assessment
  exteriorRating: z.number().min(1).max(10),
  interiorRating: z.number().min(1).max(10),
  mechanicalRating: z.number().min(1).max(10),
  overallRating: z.number().min(1).max(10),
  
  // Detailed inspection
  inspectionItems: z.array(z.object({
    category: z.string(),
    item: z.string(),
    status: z.enum(['excellent', 'good', 'fair', 'poor']),
    notes: z.string().optional(),
    repairCostEstimate: z.number().optional(),
  })),
  
  // Valuation
  bookValue: z.number(),
  marketValue: z.number(),
  tradeInValue: z.number(),
  suggestedRetailPrice: z.number(),
  
  // Documentation
  titleStatus: z.enum(['clean', 'salvage', 'lien', 'missing']),
  accidentHistory: z.boolean(),
  maintenanceRecords: z.boolean(),
  tireCondition: z.string(),
  
  status: z.enum(['evaluated', 'accepted', 'rejected', 'completed']),
  notes: z.string().optional(),
  createdAt: z.date(),
});

export type TradeInEvaluation = z.infer<typeof TradeInEvaluationSchema>;