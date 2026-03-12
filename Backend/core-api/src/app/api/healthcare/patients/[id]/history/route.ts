/**
 * Patient History API Route
 * GET /api/healthcare/patients/[id]/history - Get patient medical history
 */

import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";

// HIPAA: Enhanced PHI access logging
function logPHIAccess(userId: string, action: string, patientId: string, storeId: string, details: any = {}) {
  logger.info(`PHI_ACCESS: ${action}`, {
    userId,
    patientId,
    storeId,
    timestamp: new Date().toISOString(),
    action,
    ...details
  });
}

// GET Patient Medical History
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

      // Verify patient exists and get basic info
      const patient = await prisma.patient.findFirst({
        where: {
          id: patientId,
          merchantId: storeId,
        },
        select: {
          id: true,
          mrn: true,
          firstName: true,
          lastName: true,
          dateOfBirth: true,
          gender: true,
          status: true,
          medicalHistory: true,
          allergies: true,
          medications: true,
          lastVisit: true,
        }
      });

      if (!patient) {
        return NextResponse.json(
          { error: "Patient not found" },
          { status: 404 }
        );
      }

      // Get related medical data
      const [appointments, prescriptions, labResults, auditLogs] = await Promise.all([
        // Recent appointments
        prisma.appointment.findMany({
          where: {
            patientId,
            merchantId: storeId,
          },
          select: {
            id: true,
            type: true,
            status: true,
            scheduledAt: true,
            reason: true,
            notes: true,
            provider: {
              select: {
                id: true,
                name: true,
              }
            }
          },
          orderBy: { scheduledAt: "desc" },
          take: 20,
        }),
        
        // Active prescriptions
        prisma.prescription.findMany({
          where: {
            patientId,
            merchantId: storeId,
            status: "active",
          },
          select: {
            id: true,
            medicationName: true,
            dosage: true,
            frequency: true,
            startDate: true,
            endDate: true,
            provider: {
              select: {
                id: true,
                name: true,
              }
            }
          },
          orderBy: { prescribedAt: "desc" },
        }),
        
        // Recent lab results
        prisma.labResult.findMany({
          where: {
            patientId,
            merchantId: storeId,
          },
          select: {
            id: true,
            testName: true,
            result: true,
            unit: true,
            interpretation: true,
            performedAt: true,
            resultedAt: true,
          },
          orderBy: { performedAt: "desc" },
          take: 50,
        }),
        
        // Recent audit logs (last 10 accesses)
        prisma.healthcareAuditLog.findMany({
          where: {
            patientId,
          },
          select: {
            id: true,
            action: true,
            userId: true,
            createdAt: true,
            user: {
              select: {
                name: true,
                email: true,
              }
            }
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        })
      ]);

      logPHIAccess(user.id, "VIEW_PATIENT_HISTORY", patientId, storeId, {
        accessedComponents: ["medical_history", "appointments", "prescriptions", "lab_results"]
      });

      // Create audit log for comprehensive history access
      await prisma.healthcareAuditLog.create({
        data: {
          patientId,
          userId: user.id,
          action: "PATIENT_HISTORY_ACCESSED",
          details: { 
            components: ["full_medical_history"],
            appointmentCount: appointments.length,
            prescriptionCount: prescriptions.length,
            labResultCount: labResults.length
          },
        },
      });

      return NextResponse.json({
        success: true,
        data: {
          patient: {
            id: patient.id,
            mrn: patient.mrn,
            firstName: patient.firstName,
            lastName: patient.lastName,
            dateOfBirth: patient.dateOfBirth,
            gender: patient.gender,
            status: patient.status,
            lastVisit: patient.lastVisit,
          },
          medicalHistory: patient.medicalHistory ? JSON.parse(patient.medicalHistory) : null,
          allergies: patient.allergies,
          medications: patient.medications,
          appointments: appointments.map(appt => ({
            ...appt,
            providerName: appt.provider?.name || "Unknown Provider"
          })),
          prescriptions: prescriptions.map(rx => ({
            ...rx,
            providerName: rx.provider?.name || "Unknown Provider"
          })),
          labResults,
          recentAccessLogs: auditLogs.map(log => ({
            ...log,
            userName: log.user?.name || "System",
            userEmail: log.user?.email || "system@vayva.com"
          }))
        },
      });
    } catch (error: unknown) {
      logger.error("[PATIENT_HISTORY_GET]", error, { storeId, patientId: params.id });
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Internal Error" },
        { status: 500 }
      );
    }
  }
);