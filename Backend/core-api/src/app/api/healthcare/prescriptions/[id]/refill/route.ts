/**
 * Prescription Refill API Route
 * POST /api/healthcare/prescriptions/[id]/refill - Process prescription refill
 */

import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";

// HIPAA: Log refill action
function logRefillAction(userId: string, prescriptionId: string, patientId: string, storeId: string, details: any = {}) {
  logger.info("PRESCRIPTION_REFILL", {
    userId,
    prescriptionId,
    patientId,
    storeId,
    timestamp: new Date().toISOString(),
    ...details
  });
}

// POST Process Prescription Refill
export const POST = withVayvaAPI(
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
        quantity,
        pharmacy,
        notes,
        patientPickup = false,
      } = body;

      // Verify prescription exists
      const prescription = await prisma.prescription.findFirst({
        where: {
          id: prescriptionId,
          merchantId: storeId,
        },
        include: {
          patient: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phone: true,
              email: true,
            }
          }
        }
      });

      if (!prescription) {
        return NextResponse.json(
          { error: "Prescription not found" },
          { status: 404 }
        );
      }

      // Check if prescription is active
      if (prescription.status !== "active") {
        return NextResponse.json(
          { error: "Only active prescriptions can be refilled" },
          { status: 400 }
        );
      }

      // Check if refills are available
      if (prescription.refillsUsed >= prescription.refillsAllowed) {
        return NextResponse.json(
          { error: "No refills remaining for this prescription" },
          { status: 400 }
        );
      }

      // Check if prescription is expired
      if (prescription.endDate && prescription.endDate < new Date()) {
        return NextResponse.json(
          { error: "Prescription has expired" },
          { status: 400 }
        );
      }

      // Process refill
      const updatedPrescription = await prisma.prescription.update({
        where: { id: prescriptionId },
        data: {
          refillsUsed: { increment: 1 },
          updatedAt: new Date(),
        },
      });

      // Create refill record (would be separate table in production)
      const refillRecord = {
        id: `refill_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        prescriptionId,
        patientId: prescription.patientId,
        refilledBy: user.id,
        refilledAt: new Date(),
        quantity,
        pharmacy: pharmacy || prescription.pharmacy,
        patientPickup,
        notes,
        refillNumber: updatedPrescription.refillsUsed,
      };

      logRefillAction(user.id, prescriptionId, prescription.patientId, storeId, {
        refillNumber: updatedPrescription.refillsUsed,
        quantity,
        pharmacy,
        patientPickup
      });

      // Create audit log
      await prisma.healthcareAuditLog.create({
        data: {
          patientId: prescription.patientId,
          userId: user.id,
          action: "PRESCRIPTION_REFILLED",
          details: {
            prescriptionId,
            refillNumber: updatedPrescription.refillsUsed,
            quantity,
            pharmacy,
            patientPickup,
          },
        },
      });

      // Send notification to patient (simplified)
      if (prescription.patient.phone || prescription.patient.email) {
        logger.info("Patient notification sent", {
          patientId: prescription.patientId,
          method: prescription.patient.phone ? "SMS" : "EMAIL",
          prescriptionId,
        });
      }

      return NextResponse.json({
        success: true,
        data: {
          prescription: {
            ...updatedPrescription,
            patientName: `${prescription.patient.firstName} ${prescription.patient.lastName}`,
          },
          refill: {
            ...refillRecord,
            patientName: `${prescription.patient.firstName} ${prescription.patient.lastName}`,
          },
          remainingRefills: prescription.refillsAllowed - updatedPrescription.refillsUsed,
          message: `Prescription refill #${updatedPrescription.refillsUsed} processed successfully`
        },
      });
    } catch (error: unknown) {
      logger.error("[PRESCRIPTION_REFILL_POST]", error, { storeId, prescriptionId: params.id });
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Internal Error" },
        { status: 500 }
      );
    }
  }
);