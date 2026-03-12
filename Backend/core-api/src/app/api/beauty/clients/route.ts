/**
 * Beauty Clients API Routes
 * GET /api/beauty/clients - List clients
 * POST /api/beauty/clients - Create client
 */

import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";

// GET List Clients
export const GET = withVayvaAPI(
  PERMISSIONS.CUSTOMERS_VIEW,
  async (request, { storeId }) => {
    try {
      const { searchParams } = new URL(request.url);
      const limit = parseInt(searchParams.get("limit") || "50");
      const offset = parseInt(searchParams.get("offset") || "0");
      const status = searchParams.get("status"); // active, inactive, vip
      const search = searchParams.get("search"); // name, phone, email search

      const clients = await prisma.beautyClient.findMany({
        where: {
          merchantId: storeId,
          ...(status ? { status } : {}),
          ...(search ? {
            OR: [
              { firstName: { contains: search, mode: "insensitive" } },
              { lastName: { contains: search, mode: "insensitive" } },
              { phone: { contains: search } },
              { email: { contains: search, mode: "insensitive" } },
            ]
          } : {}),
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phone: true,
          email: true,
          status: true,
          skinType: true,
          hairType: true,
          preferredServices: true,
          lastVisit: true,
          totalSpent: true,
          visitCount: true,
          nextAppointment: true,
          birthday: true,
          createdAt: true,
        },
        orderBy: { lastName: "asc" },
        take: limit,
        skip: offset,
      });

      const total = await prisma.beautyClient.count({
        where: {
          merchantId: storeId,
          ...(status ? { status } : {}),
          ...(search ? {
            OR: [
              { firstName: { contains: search, mode: "insensitive" } },
              { lastName: { contains: search, mode: "insensitive" } },
              { phone: { contains: search } },
              { email: { contains: search, mode: "insensitive" } },
            ]
          } : {}),
        },
      });

      // Add calculated fields
      const clientsWithMetrics = clients.map(client => ({
        ...client,
        fullName: `${client.firstName} ${client.lastName}`,
        isVip: client.status === "vip",
        isRegular: client.visitCount >= 5,
        daysSinceLastVisit: client.lastVisit 
          ? Math.floor((Date.now() - client.lastVisit.getTime()) / (1000 * 60 * 60 * 24))
          : null,
        hasUpcomingAppointment: client.nextAppointment && client.nextAppointment > new Date(),
        averageSpendPerVisit: client.visitCount > 0 
          ? Math.round(client.totalSpent / client.visitCount)
          : 0,
      }));

      return NextResponse.json({
        success: true,
        data: clientsWithMetrics,
        meta: { total, limit, offset },
      });
    } catch (error: unknown) {
      logger.error("[BEAUTY_CLIENTS_GET]", error, { storeId });
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Internal Error" },
        { status: 500 }
      );
    }
  }
);

// POST Create Client
export const POST = withVayvaAPI(
  PERMISSIONS.CUSTOMERS_MANAGE,
  async (request, { storeId }) => {
    try {
      const body = await request.json();
      const {
        firstName,
        lastName,
        phone,
        email,
        birthday,
        address,
        skinType,
        hairType,
        allergies,
        preferredServices,
        notes,
        referredBy,
        marketingConsent,
      } = body;

      // Validation
      if (!firstName || !lastName) {
        return NextResponse.json(
          { error: "First name and last name are required" },
          { status: 400 }
        );
      }

      // Check if client already exists
      const existingClient = await prisma.beautyClient.findFirst({
        where: {
          merchantId: storeId,
          OR: [
            { phone: phone || "" },
            { email: email || "" },
          ],
        },
      });

      if (existingClient) {
        return NextResponse.json(
          { error: "Client with this phone or email already exists" },
          { status: 409 }
        );
      }

      const client = await prisma.beautyClient.create({
        data: {
          merchantId: storeId,
          firstName,
          lastName,
          phone,
          email,
          birthday: birthday ? new Date(birthday) : null,
          address: address ? JSON.stringify(address) : null,
          skinType: skinType || "normal",
          hairType: hairType || "normal",
          allergies: allergies || [],
          preferredServices: preferredServices || [],
          notes,
          referredBy,
          marketingConsent: marketingConsent || false,
          status: "active",
          totalSpent: 0,
          visitCount: 0,
        },
      });

      return NextResponse.json({
        success: true,
        data: {
          ...client,
          fullName: `${client.firstName} ${client.lastName}`,
        },
      });
    } catch (error: unknown) {
      logger.error("[BEAUTY_CLIENTS_POST]", error, { storeId });
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Internal Error" },
        { status: 500 }
      );
    }
  }
);