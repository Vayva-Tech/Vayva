/**
 * Prescriptions API Routes
 * GET /api/healthcare/prescriptions - List prescriptions
 * POST /api/healthcare/prescriptions - Create prescription
 */

import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";

// HIPAA: Log prescription access
function logPrescriptionAccess(userId: string, action: string, prescriptionId: string | null, storeId: string) {
  logger.info(`PRESCRIPTION_ACCESS: ${action}`, {
    userId,
    prescriptionId,
    storeId,
    timestamp: new Date().toISOString(),
    action,
  });
}

// GET List Prescriptions
export const GET = withVayvaAPI(
  PERMISSIONS.PRODUCTS_VIEW,
  async (request, { storeId, user }) => {
    try {
      const { searchParams } = new URL(request.url);
      const limit = parseInt(searchParams.get("limit") || "50");
      const offset = parseInt(searchParams.get("offset") || "0");
      const status = searchParams.get("status"); // active, discontinued, expired
      const patientId = searchParams.get("patientId");
      const providerId = searchParams.get("providerId");

      const prescriptions = await prisma.prescription.findMany({
        where: {
          merchantId: storeId,
          ...(status ? { status } : {}),
          ...(patientId ? { patientId } : {}),
          ...(providerId ? { providerId } : {}),
        },
        include: {
          patient: {
            select: {
              id: true,
              mrn: true,
              firstName: true,
              lastName: true,
              dateOfBirth: true,
            }
          },
          provider: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          }
        },
        orderBy: { prescribedAt: "desc" },
        take: limit,
        skip: offset,
      });

      logPrescriptionAccess(user.id, "LIST_PRESCRIPTIONS", "MULTIPLE", storeId);

      const total = await prisma.prescription.count({
        where: {
          merchantId: storeId,
          ...(status ? { status } : {}),
          ...(patientId ? { patientId } : {}),
          ...(providerId ? { providerId } : {}),
        },
      });

      // Add calculated fields
      const prescriptionsWithCalcs = prescriptions.map(rx => ({
        ...rx,
        patientName: `${rx.patient.firstName} ${rx.patient.lastName}`,
        providerName: rx.provider.name,
        isExpired: rx.endDate ? rx.endDate < new Date() : false,
        daysRemaining: rx.endDate 
          ? Math.ceil((rx.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
          : null,
        canRefill: rx.refillsAllowed > rx.refillsUsed,
        refillPercentage: rx.refillsAllowed > 0 
          ? Math.round((rx.refillsUsed / rx.refillsAllowed) * 100)
          : 0,
      }));

      return NextResponse.json({
        success: true,
        data: prescriptionsWithCalcs,
        meta: { total, limit, offset },
      });
    } catch (error: unknown) {
      logger.error("[HEALTHCARE_PRESCRIPTIONS_GET]", error, { storeId });
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Internal Error" },
        { status: 500 }
      );
    }
  }
);

// POST Create Prescription
export const POST = withVayvaAPI(
  PERMISSIONS.PRODUCTS_MANAGE,
  async (request, { storeId, user }) => {
    try {
      const body = await request.json();
      const {
        patientId,
        providerId,
        medicationName,
        dosage,
        frequency,
        duration,
        instructions,
        refillsAllowed,
        startDate,
        pharmacy,
        notes,
      } = body;

      // Validation
      if (!patientId || !providerId || !medicationName || !dosage || !frequency) {
        return NextResponse.json(
          { error: "Patient ID, provider ID, medication name, dosage, and frequency are required" },
          { status: 400 }
        );
      }

      // Verify patient exists
      const patient = await prisma.patient.findFirst({
        where: { id: patientId, merchantId: storeId },
      });

      if (!patient) {
        return NextResponse.json(
          { error: "Patient not found" },
          { status: 404 }
        );
      }

      // Verify provider exists and has prescribing authority
      const provider = await prisma.user.findFirst({
        where: { 
          id: providerId,
          storeMemberships: {
            some: { storeId, role: { in: ["PROVIDER", "ADMIN", "OWNER"] } }
          }
        },
      });

      if (!provider) {
        return NextResponse.json(
          { error: "Provider not found or unauthorized to prescribe" },
          { status: 404 }
        );
      }

      // Check DEA/NPI requirements (simplified)
      const providerProfile = await prisma.user.findFirst({
        where: { id: providerId },
      });

      if (!providerProfile?.deaNumber) {
        return NextResponse.json(
          { error: "Provider must have DEA number to prescribe controlled substances" },
          { status: 400 }
        );
      }

      // Calculate end date
      let endDate = null;
      if (startDate && duration) {
        const start = new Date(startDate);
        if (duration.includes("days")) {
          const days = parseInt(duration);
          endDate = new Date(start.getTime() + days * 24 * 60 * 60 * 1000);
        } else if (duration.includes("weeks")) {
          const weeks = parseInt(duration);
          endDate = new Date(start.getTime() + weeks * 7 * 24 * 60 * 60 * 1000);
        } else if (duration.includes("months")) {
          const months = parseInt(duration);
          endDate = new Date(start.setMonth(start.getMonth() + months));
        }
      }

      // Create prescription
      const prescription = await prisma.prescription.create({
        data: {
          merchantId: storeId,
          patientId,
          providerId,
          medicationName,
          dosage,
          frequency,
          duration,
          instructions,
          refillsAllowed: refillsAllowed || 0,
          refillsUsed: 0,
          status: "active",
          prescribedAt: new Date(),
          startDate: startDate ? new Date(startDate) : new Date(),
          endDate,
          pharmacy,
          notes,
        },
      });

      logPrescriptionAccess(user.id, "CREATE_PRESCRIPTION", prescription.id, storeId);

      // Create audit log
      await prisma.healthcareAuditLog.create({
        data: {
          patientId,
          userId: user.id,
          action: "PRESCRIPTION_CREATED",
          details: {
            prescriptionId: prescription.id,
            medicationName,
            dosage,
            frequency,
            refillsAllowed,
            startDate,
            endDate,
          },
        },
      });

      return NextResponse.json({
        success: true,
        data: {
          ...prescription,
          patientName: `${patient.firstName} ${patient.lastName}`,
          providerName: provider.name,
          isExpired: false,
          daysRemaining: endDate 
            ? Math.ceil((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
            : null,
        },
      });
    } catch (error: unknown) {
      logger.error("[HEALTHCARE_PRESCRIPTIONS_POST]", error, { storeId });
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Internal Error" },
        { status: 500 }
      );
    }
  }
);