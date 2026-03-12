/**
 * Real Estate Contracts API Routes
 * GET /api/realestate/contracts - List contracts
 * POST /api/realestate/contracts - Create contract
 */

import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";

// GET List Contracts
export const GET = withVayvaAPI(
  PERMISSIONS.ORDERS_VIEW,
  async (request, { storeId }) => {
    try {
      const { searchParams } = new URL(request.url);
      const limit = parseInt(searchParams.get("limit") || "50");
      const offset = parseInt(searchParams.get("offset") || "0");
      const status = searchParams.get("status"); // draft, sent, signed, executed, cancelled
      const propertyId = searchParams.get("propertyId");
      const agentId = searchParams.get("agentId");

      const contracts = await prisma.signedContract.findMany({
        where: {
          merchantId: storeId,
          ...(status ? { status } : {}),
          ...(propertyId ? { propertyId } : {}),
          ...(agentId ? { agentId } : {}),
        },
        include: {
          property: {
            select: {
              id: true,
              title: true,
              address: true,
              price: true,
            }
          },
          template: {
            select: {
              id: true,
              name: true,
              type: true,
            }
          }
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      });

      const total = await prisma.signedContract.count({
        where: {
          merchantId: storeId,
          ...(status ? { status } : {}),
          ...(propertyId ? { propertyId } : {}),
          ...(agentId ? { agentId } : {}),
        },
      });

      // Get contract statistics
      const stats = await prisma.signedContract.groupBy({
        by: ["status"],
        where: { merchantId: storeId },
        _count: { id: true }
      });

      return NextResponse.json({
        success: true,
        data: contracts,
        meta: { 
          total, 
          limit, 
          offset,
          stats: stats.reduce((acc, item) => {
            acc[item.status] = item._count.id;
            return acc;
          }, {} as Record<string, number>)
        },
      });
    } catch (error: unknown) {
      logger.error("[CONTRACTS_GET]", error, { storeId });
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Internal Error" },
        { status: 500 }
      );
    }
  }
);

// POST Create Contract
export const POST = withVayvaAPI(
  PERMISSIONS.ORDERS_MANAGE,
  async (request, { storeId, user }) => {
    try {
      const body = await request.json();
      const {
        propertyId,
        templateId,
        parties,
        terms,
        effectiveDate,
        expirationDate,
        notes,
      } = body;

      if (!propertyId || !templateId || !parties) {
        return NextResponse.json(
          { error: "Property ID, template ID, and parties are required" },
          { status: 400 }
        );
      }

      // Verify property exists
      const property = await prisma.property.findFirst({
        where: { id: propertyId, storeId },
      });

      if (!property) {
        return NextResponse.json(
          { error: "Property not found" },
          { status: 404 }
        );
      }

      // Verify template exists
      const template = await prisma.contractTemplate.findFirst({
        where: { id: templateId, merchantId: storeId },
      });

      if (!template) {
        return NextResponse.json(
          { error: "Contract template not found" },
          { status: 404 }
        );
      }

      // Create contract
      const contract = await prisma.signedContract.create({
        data: {
          merchantId: storeId,
          propertyId,
          templateId,
          agentId: user.id,
          parties: JSON.stringify(parties),
          terms: JSON.stringify(terms || {}),
          status: "draft",
          effectiveDate: effectiveDate ? new Date(effectiveDate) : new Date(),
          expirationDate: expirationDate ? new Date(expirationDate) : undefined,
          notes,
        },
      });

      return NextResponse.json({
        success: true,
        data: contract,
      });
    } catch (error: unknown) {
      logger.error("[CONTRACTS_POST]", error, { storeId });
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Internal Error" },
        { status: 500 }
      );
    }
  }
);