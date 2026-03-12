/**
 * Individual Prescription API Routes
 * GET /api/healthcare/prescriptions/[id] - Get prescription details
 * PUT /api/healthcare/prescriptions/[id] - Update prescription
 */

import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";

// HIPAA: Log prescription access
function logPrescriptionAccess(userId: string, action: string, prescriptionId: string, storeId: string) {
  logger.info(`PRESCRIPTION_ACCESS: ${action}`, {
    userId,
    prescriptionId,
    storeId,
    timestamp: new Date().toISOString(),
    action,
  });
}

// GET Prescription by ID
export const GET = withVayvaAPI(
  PERMISSIONS.PRODUCTS_VIEW,
  async (request, { storeId, params, user }) => {
    try {
      const { id: prescriptionId } = await params;
      
      if (!prescriptionId) {
        return NextResponse.json(
          { error: "Prescription ID required" },
          { status: 400 }
        );
      }

      const prescription = await prisma.prescription.findFirst({
        where: {
          id: prescriptionId,
          merchantId: storeId,
        },
        include: {
          patient: {
            select: {
              id: true,
              mrn: true,
              firstName: true,
              lastName: true,
              dateOfBirth: true,
              gender: true,
              allergies: true,
              medications: true,
            }
          },
          provider: {
            select: {
              id: true,
              name: true,
              email: true,
              deaNumber: true,
            }
          }
        },
      });

      if (!prescription) {
        return NextResponse.json(
          { error: "Prescription not found" },
          { status: 404 }
        );
      }

      logPrescriptionAccess(user.id, "VIEW_PRESCRIPTION", prescriptionId, storeId);

      // Create audit log
      await prisma.healthcareAuditLog.create({
        data: {
          patientId: prescription.patientId,
          userId: user.id,
          action: "PRESCRIPTION_VIEWED",
          details: { prescriptionId },
        },
      });

      // Calculate dynamic fields
      const now = new Date();
      const isExpired = prescription.endDate ? prescription.endDate < now : false;
      const daysRemaining = prescription.endDate 
        ? Math.ceil((prescription.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        : null;
      const canRefill = prescription.refillsAllowed > prescription.refillsUsed;
      const refillPercentage = prescription.refillsAllowed > 0 
        ? Math.round((prescription.refillsUsed / prescription.refillsAllowed) * 100)
        : 0;
      const isDueForRefill = canRefill && daysRemaining !== null && daysRemaining <= 7;

      // Check for drug interactions (simplified)
      const hasPotentialInteraction = prescription.patient.medications.some(med => 
        checkDrugInteraction(prescription.medicationName, med)
      );

      return NextResponse.json({
        success: true,
        data: {
          ...prescription,
          patientName: `${prescription.patient.firstName} ${prescription.patient.lastName}`,
          providerName: prescription.provider.name,
          providerDEA: prescription.provider.deaNumber,
          isExpired,
          daysRemaining,
          canRefill,
          refillPercentage,
          isDueForRefill,
          hasPotentialInteraction,
          alerts: [
            ...(isExpired ? ["EXPIRED"] : []),
            ...(isDueForRefill ? ["REFILL_DUE"] : []),
            ...(hasPotentialInteraction ? ["DRUG_INTERACTION_WARNING"] : []),
            ...(prescription.patient.allergies.includes(prescription.medicationName.toLowerCase()) ? 
              ["ALLERGY_ALERT"] : []),
          ],
        },
      });
    } catch (error: unknown) {
      logger.error("[HEALTHCARE_PRESCRIPTION_GET]", error, { storeId, prescriptionId: params.id });
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Internal Error" },
        { status: 500 }
      );
    }
  }
);

// Simplified drug interaction checker
function checkDrugInteraction(drug1: string, drug2: string): boolean {
  const interactions: Record<string, string[]> = {
    "warfarin": ["aspirin", "ibuprofen", "naproxen"],
    "lisinopril": ["potassium supplements"],
    "metformin": ["contrast dye"],
    "simvastatin": ["grapefruit juice"],
  };

  const lowerDrug1 = drug1.toLowerCase();
  const lowerDrug2 = drug2.toLowerCase();

  return (interactions[lowerDrug1] || []).includes(lowerDrug2) ||
         (interactions[lowerDrug2] || []).includes(lowerDrug1);
}

// PUT Update Prescription
export const PUT = withVayvaAPI(
  PERMISSIONS.PRODUCTS_MANAGE,
  async (request, { storeId, params, user }) => {
    try {
      const { id: prescriptionId } = await params;
      
      if (!prescriptionId) {
        return NextResponse.json(
          { error: "Prescription ID required" },
          { status: 400 }
        );
      }

      const body = await request.json();
      const {
        dosage,
        frequency,
        duration,
        instructions,
        status,
        startDate,
        endDate,
        pharmacy,
        notes,
      } = body;

      // Verify prescription exists
      const existingPrescription = await prisma.prescription.findFirst({
        where: {
          id: prescriptionId,
          merchantId: storeId,
        },
      });

      if (!existingPrescription) {
        return NextResponse.json(
          { error: "Prescription not found" },
          { status: 404 }
        );
      }

      // Prevent updates to completed/expired prescriptions
      if (existingPrescription.status === "discontinued" || 
          (existingPrescription.endDate && existingPrescription.endDate < new Date())) {
        return NextResponse.json(
          { error: "Cannot modify discontinued or expired prescription" },
          { status: 400 }
        );
      }

      const updateData: any = {
        ...(dosage !== undefined && { dosage }),
        ...(frequency !== undefined && { frequency }),
        ...(duration !== undefined && { duration }),
        ...(instructions !== undefined && { instructions }),
        ...(status !== undefined && { status }),
        ...(startDate !== undefined && { startDate: new Date(startDate) }),
        ...(endDate !== undefined && { endDate: new Date(endDate) }),
        ...(pharmacy !== undefined && { pharmacy }),
        ...(notes !== undefined && { notes }),
        updatedAt: new Date(),
      };

      const updatedPrescription = await prisma.prescription.update({
        where: { id: prescriptionId },
        data: updateData,
        include: {
          patient: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            }
          },
          provider: {
            select: {
              id: true,
              name: true,
            }
          }
        }
      });

      logPrescriptionAccess(user.id, "UPDATE_PRESCRIPTION", prescriptionId, storeId);

      // Create audit log
      await prisma.healthcareAuditLog.create({
        data: {
          patientId: updatedPrescription.patientId,
          userId: user.id,
          action: "PRESCRIPTION_UPDATED",
          details: {
            prescriptionId,
            changes: Object.keys(body).filter(key => key !== "id"),
            previousStatus: existingPrescription.status,
            newStatus: updatedPrescription.status,
          },
        },
      });

      return NextResponse.json({
        success: true,
        data: {
          ...updatedPrescription,
          patientName: `${updatedPrescription.patient.firstName} ${updatedPrescription.patient.lastName}`,
          providerName: updatedPrescription.provider.name,
        },
      });
    } catch (error: unknown) {
      logger.error("[HEALTHCARE_PRESCRIPTION_PUT]", error, { storeId, prescriptionId: params.id });
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Internal Error" },
        { status: 500 }
      );
    }
  }
);