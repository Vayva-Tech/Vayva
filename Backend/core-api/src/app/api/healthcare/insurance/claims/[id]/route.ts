/**
 * Individual Insurance Claim API Route
 * GET /api/healthcare/insurance/claims/[id] - Get claim details
 * PUT /api/healthcare/insurance/claims/[id] - Update claim status
 */

import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";

// GET Insurance Claim by ID
export const GET = withVayvaAPI(
  PERMISSIONS.FINANCE_VIEW,
  async (request, { storeId, params }) => {
    try {
      const { id: claimId } = await params;
      
      if (!claimId) {
        return NextResponse.json(
          { error: "Claim ID required" },
          { status: 400 }
        );
      }

      const claim = await prisma.insuranceClaim.findFirst({
        where: {
          id: claimId,
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
              insuranceInfo: true,
            }
          },
          insuranceProvider: {
            select: {
              id: true,
              name: true,
              type: true,
              phone: true,
              website: true,
            }
          },
          appointment: {
            select: {
              id: true,
              type: true,
              scheduledAt: true,
              reason: true,
              provider: {
                select: {
                  id: true,
                  name: true,
                }
              }
            }
          }
        },
      });

      if (!claim) {
        return NextResponse.json(
          { error: "Claim not found" },
          { status: 404 }
        );
      }

      // Parse insurance info
      let patientInsurance = null;
      if (claim.patient.insuranceInfo) {
        try {
          patientInsurance = JSON.parse(claim.patient.insuranceInfo);
        } catch (e) {
          patientInsurance = null;
        }
      }

      return NextResponse.json({
        success: true,
        data: {
          ...claim,
          patientName: `${claim.patient.firstName} ${claim.patient.lastName}`,
          providerName: claim.insuranceProvider.name,
          providerType: claim.insuranceProvider.type,
          appointmentProvider: claim.appointment?.provider?.name || null,
          patientInsurance,
          paymentPercentage: claim.billedAmount > 0 && claim.paidAmount
            ? Math.round((claim.paidAmount / claim.billedAmount) * 100)
            : (claim.status === "paid" ? 100 : 0),
          balanceDue: claim.billedAmount - (claim.paidAmount || 0) - (claim.patientResponsibility || 0),
          daysInProcess: Math.floor((Date.now() - claim.submittedAt.getTime()) / (1000 * 60 * 60 * 24)),
          isOverdue: claim.status === "submitted" && 
                    Math.floor((Date.now() - claim.submittedAt.getTime()) / (1000 * 60 * 60 * 24)) > 30,
        },
      });
    } catch (error: unknown) {
      logger.error("[INSURANCE_CLAIM_GET]", error, { storeId, claimId: params.id });
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Internal Error" },
        { status: 500 }
      );
    }
  }
);

// PUT Update Insurance Claim Status
export const PUT = withVayvaAPI(
  PERMISSIONS.FINANCE_MANAGE,
  async (request, { storeId, params }) => {
    try {
      const { id: claimId } = await params;
      
      if (!claimId) {
        return NextResponse.json(
          { error: "Claim ID required" },
          { status: 400 }
        );
      }

      const body = await request.json();
      const {
        status,
        paidAmount,
        patientResponsibility,
        denialReason,
        processedAt,
        paidAt,
        notes,
      } = body;

      // Verify claim exists
      const existingClaim = await prisma.insuranceClaim.findFirst({
        where: {
          id: claimId,
          merchantId: storeId,
        },
      });

      if (!existingClaim) {
        return NextResponse.json(
          { error: "Claim not found" },
          { status: 404 }
        );
      }

      // Validate status transitions
      const validTransitions: Record<string, string[]> = {
        "submitted": ["processed", "denied"],
        "processed": ["paid", "denied"],
        "paid": [],
        "denied": ["processed"] // Can reprocess denied claims
      };

      if (status && !validTransitions[existingClaim.status]?.includes(status)) {
        return NextResponse.json(
          { error: `Invalid status transition from ${existingClaim.status} to ${status}` },
          { status: 400 }
        );
      }

      const updateData: any = {
        ...(status !== undefined && { status }),
        ...(paidAmount !== undefined && { paidAmount }),
        ...(patientResponsibility !== undefined && { patientResponsibility }),
        ...(denialReason !== undefined && { denialReason }),
        ...(processedAt !== undefined && { processedAt: new Date(processedAt) }),
        ...(paidAt !== undefined && { paidAt: new Date(paidAt) }),
        ...(notes !== undefined && { notes }),
      };

      // Set timestamps automatically
      const now = new Date();
      if (status === "processed" && !processedAt) {
        updateData.processedAt = now;
      }
      if (status === "paid" && !paidAt) {
        updateData.paidAt = now;
      }

      const updatedClaim = await prisma.insuranceClaim.update({
        where: { id: claimId },
        data: updateData,
        include: {
          patient: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            }
          },
          insuranceProvider: {
            select: {
              id: true,
              name: true,
            }
          }
        }
      });

      // Create audit log
      await prisma.healthcareAuditLog.create({
        data: {
          patientId: updatedClaim.patientId,
          userId: "", // Would come from auth context
          action: "INSURANCE_CLAIM_UPDATED",
          details: {
            claimId,
            previousStatus: existingClaim.status,
            newStatus: status,
            paidAmount,
            patientResponsibility,
            denialReason,
          },
        },
      });

      return NextResponse.json({
        success: true,
        data: {
          ...updatedClaim,
          patientName: `${updatedClaim.patient.firstName} ${updatedClaim.patient.lastName}`,
          providerName: updatedClaim.insuranceProvider.name,
          paymentPercentage: updatedClaim.billedAmount > 0 && updatedClaim.paidAmount
            ? Math.round((updatedClaim.paidAmount / updatedClaim.billedAmount) * 100)
            : (updatedClaim.status === "paid" ? 100 : 0),
        },
      });
    } catch (error: unknown) {
      logger.error("[INSURANCE_CLAIM_PUT]", error, { storeId, claimId: params.id });
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Internal Error" },
        { status: 500 }
      );
    }
  }
);