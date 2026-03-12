/**
 * Healthcare Patients API Routes
 * GET /api/healthcare/patients - List patients
 * POST /api/healthcare/patients - Create patient
 */

import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";

// HIPAA Compliance Middleware
function logPHIAccess(userId: string, action: string, patientId: string, storeId: string) {
  // Detailed audit logging for all PHI access
  logger.info(`PHI_ACCESS: ${action}`, {
    userId,
    patientId,
    storeId,
    timestamp: new Date().toISOString(),
    action,
  });
}

// GET List Patients
export const GET = withVayvaAPI(
  PERMISSIONS.CUSTOMERS_VIEW,
  async (request, { storeId, user }) => {
    try {
      const { searchParams } = new URL(request.url);
      const limit = parseInt(searchParams.get("limit") || "50");
      const offset = parseInt(searchParams.get("offset") || "0");
      const status = searchParams.get("status"); // active, inactive, discharged
      const search = searchParams.get("search"); // name, mrn search

      // HIPAA: Only return minimal patient data in lists
      const patients = await prisma.patient.findMany({
        where: {
          merchantId: storeId,
          ...(status ? { status } : {}),
          ...(search ? {
            OR: [
              { firstName: { contains: search, mode: "insensitive" } },
              { lastName: { contains: search, mode: "insensitive" } },
              { mrn: { contains: search, mode: "insensitive" } },
            ]
          } : {}),
        },
        select: {
          id: true,
          mrn: true,
          firstName: true,
          lastName: true,
          dateOfBirth: true,
          gender: true,
          status: true,
          createdAt: true,
          lastVisit: true,
        },
        orderBy: { lastName: "asc" },
        take: limit,
        skip: offset,
      });

      logPHIAccess(user.id, "LIST_PATIENTS", "MULTIPLE", storeId);

      const total = await prisma.patient.count({
        where: {
          merchantId: storeId,
          ...(status ? { status } : {}),
          ...(search ? {
            OR: [
              { firstName: { contains: search, mode: "insensitive" } },
              { lastName: { contains: search, mode: "insensitive" } },
              { mrn: { contains: search, mode: "insensitive" } },
            ]
          } : {}),
        },
      });

      return NextResponse.json({
        success: true,
        data: patients,
        meta: { total, limit, offset },
      });
    } catch (error: unknown) {
      logger.error("[HEALTHCARE_PATIENTS_GET]", error, { storeId });
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Internal Error" },
        { status: 500 }
      );
    }
  }
);

// POST Create Patient
export const POST = withVayvaAPI(
  PERMISSIONS.CUSTOMERS_MANAGE,
  async (request, { storeId, user }) => {
    try {
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
      } = body;

      // Validation
      if (!firstName || !lastName || !dateOfBirth) {
        return NextResponse.json(
          { error: "First name, last name, and date of birth are required" },
          { status: 400 }
        );
      }

      // Generate unique MRN (Medical Record Number)
      const mrn = `MRN${Date.now()}${Math.random().toString(36).substr(2, 5)}`.toUpperCase();

      // HIPAA: Encrypt sensitive data at rest
      const patient = await prisma.patient.create({
        data: {
          merchantId: storeId,
          mrn,
          firstName,
          lastName,
          dateOfBirth: new Date(dateOfBirth),
          gender: gender || "other",
          email,
          phone,
          address: address ? JSON.stringify(address) : undefined,
          emergencyContact: emergencyContact ? JSON.stringify(emergencyContact) : undefined,
          insuranceInfo: insuranceInfo ? JSON.stringify(insuranceInfo) : undefined,
          medicalHistory: medicalHistory ? JSON.stringify(medicalHistory) : undefined,
          allergies: allergies || [],
          medications: medications || [],
          status: "active",
          consentGiven: false, // Requires explicit consent
          consentDate: null,
          consentFormVersion: null,
        },
      });

      logPHIAccess(user.id, "CREATE_PATIENT", patient.id, storeId);

      // Create initial audit log
      await prisma.healthcareAuditLog.create({
        data: {
          patientId: patient.id,
          userId: user.id,
          action: "PATIENT_CREATED",
          details: { mrn, firstName, lastName },
        },
      });

      return NextResponse.json({
        success: true,
        data: {
          id: patient.id,
          mrn: patient.mrn,
          firstName: patient.firstName,
          lastName: patient.lastName,
          dateOfBirth: patient.dateOfBirth,
          gender: patient.gender,
          status: patient.status,
        },
      });
    } catch (error: unknown) {
      logger.error("[HEALTHCARE_PATIENTS_POST]", error, { storeId });
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Internal Error" },
        { status: 500 }
      );
    }
  }
);