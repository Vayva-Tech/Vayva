/**
 * Individual Patient API Routes
 * GET /api/healthcare/patients/[id] - Get patient details
 * PUT /api/healthcare/patients/[id] - Update patient
 */

import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";

// HIPAA Compliance Functions
function logPHIAccess(userId: string, action: string, patientId: string, storeId: string) {
  logger.info(`PHI_ACCESS: ${action}`, {
    userId,
    patientId,
    storeId,
    timestamp: new Date().toISOString(),
    action,
  });
}

function maskPHI(data: any) {
  // In production, this would implement proper PHI masking/redaction
  // For now, we'll return minimal data unless explicit permission
  return {
    id: data.id,
    mrn: data.mrn,
    firstName: data.firstName,
    lastName: data.lastName,
    dateOfBirth: data.dateOfBirth,
    gender: data.gender,
    status: data.status,
    lastVisit: data.lastVisit,
    createdAt: data.createdAt,
  };
}

// GET Patient by ID
export const GET = withVayvaAPI(
  PERMISSIONS.CUSTOMERS_VIEW,
  async (request, { storeId, params, user }) => {
    try {
      const { id: patientId } = await params;
      
      if (!patientId) {
        return NextResponse.json(
          { error: "Patient ID required" },
          { status: 400 }
        );
      }

      const patient = await prisma.patient.findFirst({
        where: {
          id: patientId,
          merchantId: storeId,
        },
      });

      if (!patient) {
        return NextResponse.json(
          { error: "Patient not found" },
          { status: 404 }
        );
      }

      logPHIAccess(user.id, "VIEW_PATIENT", patientId, storeId);

      // Create audit log
      await prisma.healthcareAuditLog.create({
        data: {
          patientId,
          userId: user.id,
          action: "PATIENT_VIEWED",
          details: { accessedFields: ["basic_info"] },
        },
      });

      // Return masked PHI for general access
      return NextResponse.json({
        success: true,
        data: maskPHI(patient),
      });
    } catch (error: unknown) {
      logger.error("[HEALTHCARE_PATIENT_GET]", error, { storeId, patientId: params.id });
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Internal Error" },
        { status: 500 }
      );
    }
  }
);

// PUT Update Patient
export const PUT = withVayvaAPI(
  PERMISSIONS.CUSTOMERS_MANAGE,
  async (request, { storeId, params, user }) => {
    try {
      const { id: patientId } = await params;
      
      if (!patientId) {
        return NextResponse.json(
          { error: "Patient ID required" },
          { status: 400 }
        );
      }

      const body = await request.json();
      const {
        firstName,
        lastName,
        dateOfBirth,
        gender,
        email,
        phone,
        address,
        emergencyContact,
        insuranceInfo,
        medicalHistory,
        allergies,
        medications,
        status,
      } = body;

      // Verify patient exists
      const existingPatient = await prisma.patient.findFirst({
        where: {
          id: patientId,
          merchantId: storeId,
        },
      });

      if (!existingPatient) {
        return NextResponse.json(
          { error: "Patient not found" },
          { status: 404 }
        );
      }

      const updatedPatient = await prisma.patient.update({
        where: { id: patientId },
        data: {
          ...(firstName !== undefined && { firstName }),
          ...(lastName !== undefined && { lastName }),
          ...(dateOfBirth !== undefined && { dateOfBirth: new Date(dateOfBirth) }),
          ...(gender !== undefined && { gender }),
          ...(email !== undefined && { email }),
          ...(phone !== undefined && { phone }),
          ...(address !== undefined && { address: JSON.stringify(address) }),
          ...(emergencyContact !== undefined && { emergencyContact: JSON.stringify(emergencyContact) }),
          ...(insuranceInfo !== undefined && { insuranceInfo: JSON.stringify(insuranceInfo) }),
          ...(medicalHistory !== undefined && { medicalHistory: JSON.stringify(medicalHistory) }),
          ...(allergies !== undefined && { allergies }),
          ...(medications !== undefined && { medications }),
          ...(status !== undefined && { status }),
          updatedAt: new Date(),
        },
      });

      logPHIAccess(user.id, "UPDATE_PATIENT", patientId, storeId);

      // Create detailed audit log
      await prisma.healthcareAuditLog.create({
        data: {
          patientId,
          userId: user.id,
          action: "PATIENT_UPDATED",
          details: { 
            updatedFields: Object.keys(body).filter(key => key !== "id"),
            previousStatus: existingPatient.status,
            newStatus: updatedPatient.status
          },
        },
      });

      return NextResponse.json({
        success: true,
        data: maskPHI(updatedPatient),
      });
    } catch (error: unknown) {
      logger.error("[HEALTHCARE_PATIENT_PUT]", error, { storeId, patientId: params.id });
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Internal Error" },
        { status: 500 }
      );
    }
  }
);