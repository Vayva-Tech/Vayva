/**
 * Insurance Claims API Routes
 * GET /api/healthcare/insurance/claims - List insurance claims
 * POST /api/healthcare/insurance/claims - Create insurance claim
 */

import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";

// GET List Insurance Claims
export const GET = withVayvaAPI(
  PERMISSIONS.FINANCE_VIEW,
  async (request, { storeId }) => {
    try {
      const { searchParams } = new URL(request.url);
      const limit = parseInt(searchParams.get("limit") || "50");
      const offset = parseInt(searchParams.get("offset") || "0");
      const status = searchParams.get("status"); // submitted, processed, paid, denied
      const patientId = searchParams.get("patientId");
      const providerId = searchParams.get("providerId");

      const claims = await prisma.insuranceClaim.findMany({
        where: {
          merchantId: storeId,
          ...(status ? { status } : {}),
          ...(patientId ? { patientId } : {}),
          ...(providerId ? { insuranceProviderId: providerId } : {}),
        },
        include: {
          patient: {
            select: {
              id: true,
              mrn: true,
              firstName: true,
              lastName: true,
            }
          },
          insuranceProvider: {
            select: {
              id: true,
              name: true,
              type: true,
            }
          },
          appointment: {
            select: {
              id: true,
              type: true,
              scheduledAt: true,
            }
          }
        },
        orderBy: { submittedAt: "desc" },
        take: limit,
        skip: offset,
      });

      const total = await prisma.insuranceClaim.count({
        where: {
          merchantId: storeId,
          ...(status ? { status } : {}),
          ...(patientId ? { patientId } : {}),
          ...(providerId ? { insuranceProviderId: providerId } : {}),
        },
      });

      // Add calculated fields
      const claimsWithCalcs = claims.map(claim => ({
        ...claim,
        patientName: `${claim.patient.firstName} ${claim.patient.lastName}`,
        providerName: claim.insuranceProvider.name,
        providerType: claim.insuranceProvider.type,
        isPaid: claim.status === "paid",
        isDenied: claim.status === "denied",
        daysInProcess: Math.floor((Date.now() - claim.submittedAt.getTime()) / (1000 * 60 * 60 * 24)),
        paymentPercentage: claim.billedAmount > 0 && claim.paidAmount
          ? Math.round((claim.paidAmount / claim.billedAmount) * 100)
          : (claim.status === "paid" ? 100 : 0),
        balanceDue: claim.billedAmount - (claim.paidAmount || 0) - (claim.patientResponsibility || 0),
        hasDenial: claim.denialReason !== null,
      }));

      // Summary statistics
      const stats = {
        totalClaims: claims.length,
        byStatus: {
          submitted: claims.filter(c => c.status === "submitted").length,
          processed: claims.filter(c => c.status === "processed").length,
          paid: claims.filter(c => c.status === "paid").length,
          denied: claims.filter(c => c.status === "denied").length,
        },
        totalBilled: claims.reduce((sum, c) => sum + c.billedAmount, 0),
        totalPaid: claims.reduce((sum, c) => sum + (c.paidAmount || 0), 0),
        totalBalance: claims.reduce((sum, c) => sum + (c.billedAmount - (c.paidAmount || 0) - (c.patientResponsibility || 0)), 0),
        averagePaymentRate: claims.length > 0 
          ? Math.round((claims.reduce((sum, c) => sum + (c.paidAmount || 0), 0) / 
                       claims.reduce((sum, c) => sum + c.billedAmount, 0)) * 100)
          : 0,
      };

      return NextResponse.json({
        success: true,
        data: claimsWithCalcs,
        meta: { 
          total, 
          limit, 
          offset,
          stats
        },
      });
    } catch (error: unknown) {
      logger.error("[INSURANCE_CLAIMS_GET]", error, { storeId });
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Internal Error" },
        { status: 500 }
      );
    }
  }
);

// POST Create Insurance Claim
export const POST = withVayvaAPI(
  PERMISSIONS.FINANCE_MANAGE,
  async (request, { storeId }) => {
    try {
      const body = await request.json();
      const {
        patientId,
        appointmentId,
        insuranceProviderId,
        serviceDate,
        diagnosisCodes,
        procedureCodes,
        billedAmount,
        notes,
      } = body;

      // Validation
      if (!patientId || !insuranceProviderId || !serviceDate || !diagnosisCodes || !billedAmount) {
        return NextResponse.json(
          { error: "Patient ID, insurance provider ID, service date, diagnosis codes, and billed amount are required" },
          { status: 400 }
        );
      }

      // Verify entities exist
      const [patient, insuranceProvider, appointment] = await Promise.all([
        prisma.patient.findFirst({ where: { id: patientId, merchantId: storeId } }),
        prisma.insuranceProvider.findFirst({ where: { id: insuranceProviderId, merchantId: storeId } }),
        appointmentId 
          ? prisma.appointment.findFirst({ where: { id: appointmentId, merchantId: storeId } })
          : Promise.resolve(null)
      ]);

      if (!patient) {
        return NextResponse.json(
          { error: "Patient not found" },
          { status: 404 }
        );
      }

      if (!insuranceProvider) {
        return NextResponse.json(
          { error: "Insurance provider not found" },
          { status: 404 }
        );
      }

      if (appointmentId && !appointment) {
        return NextResponse.json(
          { error: "Appointment not found" },
          { status: 404 }
        );
      }

      // Generate unique claim number
      const claimNumber = `CLM${Date.now()}${Math.random().toString(36).substr(2, 5)}`.toUpperCase();

      // Create claim
      const claim = await prisma.insuranceClaim.create({
        data: {
          merchantId: storeId,
          patientId,
          appointmentId: appointment?.id || null,
          insuranceProviderId,
          claimNumber,
          serviceDate: new Date(serviceDate),
          diagnosisCodes,
          procedureCodes: procedureCodes || [],
          billedAmount,
          status: "submitted",
          submittedAt: new Date(),
          notes,
        },
      });

      // Create audit log
      await prisma.healthcareAuditLog.create({
        data: {
          patientId,
          userId: "", // Would come from auth context
          action: "INSURANCE_CLAIM_SUBMITTED",
          details: {
            claimId: claim.id,
            claimNumber,
            insuranceProviderId,
            billedAmount,
          },
        },
      });

      return NextResponse.json({
        success: true,
        data: {
          ...claim,
          patientName: `${patient.firstName} ${patient.lastName}`,
          providerName: insuranceProvider.name,
        },
      });
    } catch (error: unknown) {
      logger.error("[INSURANCE_CLAIMS_POST]", error, { storeId });
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Internal Error" },
        { status: 500 }
      );
    }
  }
);