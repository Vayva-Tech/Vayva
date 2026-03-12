/**
 * Update Contract Status API Route
 * PUT /api/realestate/contracts/[id]/status - Update contract status
 */

import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";

// PUT Update Contract Status
export const PUT = withVayvaAPI(
  PERMISSIONS.ORDERS_MANAGE,
  async (request, { storeId, params }) => {
    try {
      const { id: contractId } = await params;
      
      if (!contractId) {
        return NextResponse.json(
          { error: "Contract ID required" },
          { status: 400 }
        );
      }

      const body = await request.json();
      const { status, notes } = body;

      if (!status) {
        return NextResponse.json(
          { error: "Status is required" },
          { status: 400 }
        );
      }

      // Verify contract exists
      const existingContract = await prisma.signedContract.findFirst({
        where: {
          id: contractId,
          merchantId: storeId,
        },
      });

      if (!existingContract) {
        return NextResponse.json(
          { error: "Contract not found" },
          { status: 404 }
        );
      }

      // Validate status transition
      const validTransitions: Record<string, string[]> = {
        draft: ["sent", "signed", "cancelled"],
        sent: ["signed", "draft", "cancelled"],
        signed: ["executed", "cancelled"],
        executed: ["completed", "terminated"],
        cancelled: [],
        terminated: [],
        completed: []
      };

      const currentStatus = existingContract.status;
      const allowedTransitions = validTransitions[currentStatus] || [];
      
      if (!allowedTransitions.includes(status)) {
        return NextResponse.json(
          { 
            error: `Cannot transition from ${currentStatus} to ${status}`,
            allowedTransitions
          },
          { status: 400 }
        );
      }

      // Update contract status
      const updatedContract = await prisma.signedContract.update({
        where: { id: contractId },
        data: {
          status,
          ...(status === "signed" && { signedAt: new Date() }),
          ...(status === "executed" && { executedAt: new Date() }),
          ...(status === "completed" && { completedAt: new Date() }),
          ...(status === "cancelled" && { cancelledAt: new Date() }),
          ...(status === "terminated" && { terminatedAt: new Date() }),
          ...(notes && { notes }),
          updatedAt: new Date(),
        },
        include: {
          property: {
            select: {
              id: true,
              title: true,
              address: true,
            }
          },
          template: {
            select: {
              id: true,
              name: true,
            }
          }
        }
      });

      // Create audit log
      await prisma.auditLog.create({
        data: {
          actorUserId: "", // Would come from auth context
          actorEmail: "", // Would come from auth context
          action: `CONTRACT_${status.toUpperCase()}`,
          targetType: "contract",
          targetId: contractId,
          targetStoreId: storeId,
          metadata: {
            previousStatus: currentStatus,
            newStatus: status,
            notes,
          },
          requestId: "",
        }
      });

      // If contract is executed, create commission record
      if (status === "executed" && existingContract.propertyId) {
        const property = await prisma.property.findFirst({
          where: { id: existingContract.propertyId }
        });
        
        if (property) {
          const commissionAmount = property.price.toNumber() * 0.03; // 3% standard
          await prisma.commission.create({
            data: {
              merchantId: storeId,
              agentId: existingContract.agentId,
              leadId: "", // Would link to lead when available
              propertyId: existingContract.propertyId,
              saleAmount: property.price.toNumber(),
              commissionRate: 0.03,
              commissionAmount,
              status: "pending",
              earnedAt: new Date(),
            }
          });
        }
      }

      return NextResponse.json({
        success: true,
        data: updatedContract,
        message: `Contract status updated to ${status}`,
      });
    } catch (error: unknown) {
      logger.error("[CONTRACT_STATUS_PUT]", error, { storeId, contractId: params.id });
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Internal Error" },
        { status: 500 }
      );
    }
  }
);