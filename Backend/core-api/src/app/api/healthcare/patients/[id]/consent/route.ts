/**
 * Patient Consent API Route
 * POST /api/healthcare/patients/[id]/consent - Record patient consent
 */

import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";

// HIPAA: Consent management with detailed logging
function logConsentAction(userId: string, patientId: string, storeId: string, action: string, details: any = {}) {
  logger.info(`CONSENT_ACTION: ${action}`, {
    userId,
    patientId,
    storeId,
    timestamp: new Date().toISOString(),
    action,
    ...details
  });
}

// POST Record Patient Consent
export const POST = withVayvaAPI(
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
        consentType, // "general", "treatment", "research", "data_sharing"
        consentFormVersion,
        signatureMethod, // "electronic", "written", "verbal"
        witnessId,
        notes,
        expiresAt,
      } = body;

      // Validation
      if (!consentType || !consentFormVersion || !signatureMethod) {
        return NextResponse.json(
          { error: "Consent type, form version, and signature method are required" },
          { status: 400 }
        );
      }

      // Verify patient exists
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

      // Check if patient already has this type of consent
      const existingConsent = await prisma.patient.findFirst({
        where: {
          id: patientId,
          consentGiven: true,
        },
      });

      if (existingConsent && existingConsent.consentDate) {
        // Check if consent is still valid
        const consentAge = Date.now() - new Date(existingConsent.consentDate).getTime();
        const oneYear = 365 * 24 * 60 * 60 * 1000;
        
        if (consentAge < oneYear) {
          return NextResponse.json(
            { 
              error: "Valid consent already exists",
              existingConsent: {
                date: existingConsent.consentDate,
                formVersion: existingConsent.consentFormVersion,
                expiresAt: new Date(new Date(existingConsent.consentDate).getTime() + oneYear)
              }
            },
            { status: 409 }
          );
        }
      }

      // Update patient with consent information
      const updatedPatient = await prisma.patient.update({
        where: { id: patientId },
        data: {
          consentGiven: true,
          consentDate: new Date(),
          consentFormVersion,
        },
      });

      // Create consent record
      const consentRecord = await prisma.healthcareAuditLog.create({
        data: {
          patientId,
          userId: user.id,
          action: "CONSENT_GRANTED",
          details: {
            consentType,
            formVersion: consentFormVersion,
            signatureMethod,
            witnessId,
            notes,
            expiresAt: expiresAt ? new Date(expiresAt) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year default
            ipAddress: "", // Would come from request headers
            userAgent: "", // Would come from request headers
          },
        },
      });

      logConsentAction(user.id, patientId, storeId, "CONSENT_GRANTED", {
        consentType,
        formVersion: consentFormVersion,
        signatureMethod
      });

      return NextResponse.json({
        success: true,
        data: {
          patient: {
            id: updatedPatient.id,
            mrn: updatedPatient.mrn,
            firstName: updatedPatient.firstName,
            lastName: updatedPatient.lastName,
            consentGiven: updatedPatient.consentGiven,
            consentDate: updatedPatient.consentDate,
            consentFormVersion: updatedPatient.consentFormVersion,
          },
          consentRecord: {
            id: consentRecord.id,
            recordedAt: consentRecord.createdAt,
            recordedBy: user.name || user.email,
          },
          message: "Patient consent successfully recorded"
        },
      });
    } catch (error: unknown) {
      logger.error("[PATIENT_CONSENT_POST]", error, { storeId, patientId: params.id });
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Internal Error" },
        { status: 500 }
      );
    }
  }
);

// GET Patient Consent Status
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
        select: {
          id: true,
          mrn: true,
          firstName: true,
          lastName: true,
          consentGiven: true,
          consentDate: true,
          consentFormVersion: true,
        }
      });

      if (!patient) {
        return NextResponse.json(
          { error: "Patient not found" },
          { status: 404 }
        );
      }

      logConsentAction(user.id, patientId, storeId, "CHECK_CONSENT_STATUS");

      // Create audit log for consent status check
      await prisma.healthcareAuditLog.create({
        data: {
          patientId,
          userId: user.id,
          action: "CONSENT_STATUS_CHECKED",
          details: { 
            consentGiven: patient.consentGiven,
            consentDate: patient.consentDate
          },
        },
      });

      const consentInfo = {
        consentGiven: patient.consentGiven,
        consentDate: patient.consentDate,
        consentFormVersion: patient.consentFormVersion,
        isValid: false,
        expiresAt: null
      };

      if (patient.consentGiven && patient.consentDate) {
        const consentAge = Date.now() - new Date(patient.consentDate).getTime();
        const oneYear = 365 * 24 * 60 * 60 * 1000;
        consentInfo.isValid = consentAge < oneYear;
        consentInfo.expiresAt = new Date(new Date(patient.consentDate).getTime() + oneYear);
      }

      return NextResponse.json({
        success: true,
        data: {
          patient: {
            id: patient.id,
            mrn: patient.mrn,
            firstName: patient.firstName,
            lastName: patient.lastName,
          },
          consent: consentInfo
        },
      });
    } catch (error: unknown) {
      logger.error("[PATIENT_CONSENT_GET]", error, { storeId, patientId: params.id });
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Internal Error" },
        { status: 500 }
      );
    }
  }
);