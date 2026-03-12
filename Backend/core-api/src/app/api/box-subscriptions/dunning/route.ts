import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@/lib/logger";
import { z } from "zod";

export const dynamic = "force-dynamic";

const DunningConfigSchema = z.object({
  boxId: z.string().optional().nullable(),
  retrySchedule: z.array(z.number().min(1)).default([1, 3, 7, 14]),
  maxRetries: z.number().min(1).max(10).default(4),
  finalAction: z.enum(["cancel", "pause", "notify_only"]).default("cancel"),
  notifyCustomer: z.boolean().default(true),
  notifyOwner: z.boolean().default(true),
});

// GET /api/box-subscriptions/dunning/config - Get dunning configuration
export const GET_CONFIG = withVayvaAPI(
  PERMISSIONS.SETTINGS_VIEW,
  async (req, { storeId }) => {
    try {
      const { searchParams } = new URL(req.url);
      const boxId = searchParams.get("boxId");

      const where: any = { storeId };

      if (boxId) {
        where.boxId = boxId;
      } else {
        where.boxId = null; // Store-level default
      }

      const config = await prisma.boxDunningConfig.findUnique({
        where,
      });

      if (!config) {
        // Return default configuration
        return NextResponse.json({
          config: {
            storeId,
            boxId: boxId || null,
            retrySchedule: [1, 3, 7, 14],
            maxRetries: 4,
            finalAction: "cancel",
            notifyCustomer: true,
            notifyOwner: true,
            isDefault: true,
          },
        });
      }

      return NextResponse.json({
        config: {
          id: config.id,
          storeId: config.storeId,
          boxId: config.boxId,
          retrySchedule: config.retrySchedule,
          maxRetries: config.maxRetries,
          finalAction: config.finalAction,
          notifyCustomer: config.notifyCustomer,
          notifyOwner: config.notifyOwner,
          createdAt: config.createdAt.toISOString(),
          updatedAt: config.updatedAt.toISOString(),
        },
      });
    } catch (error: unknown) {
      logger.error("[BOX_DUNNING_CONFIG_GET]", error, { storeId });
      return NextResponse.json(
        { error: "Failed to load dunning configuration" },
        { status: 500 },
      );
    }
  },
);

// POST /api/box-subscriptions/dunning/config - Create/update dunning configuration
export const POST_CONFIG = withVayvaAPI(
  PERMISSIONS.SETTINGS_MANAGE,
  async (req, { storeId }) => {
    try {
      const body = await req.json();
      const result = DunningConfigSchema.safeParse(body);

      if (!result.success) {
        return NextResponse.json(
          { error: "Invalid request data", details: result.error.format() },
          { status: 400 },
        );
      }

      const { boxId, retrySchedule, maxRetries, finalAction, notifyCustomer, notifyOwner } = result.data;

      // Verify box exists if specified
      if (boxId) {
        const box = await prisma.subscriptionBox.findUnique({
          where: { id: boxId },
          select: { storeId: true },
        });

        if (!box || box.storeId !== storeId) {
          return NextResponse.json(
            { error: "Subscription box not found or access denied" },
            { status: 404 },
          );
        }
      }

      const config = await prisma.boxDunningConfig.upsert({
        where: {
          storeId_boxId: {
            storeId,
            boxId: boxId || null,
          },
        },
        update: {
          retrySchedule,
          maxRetries,
          finalAction,
          notifyCustomer,
          notifyOwner,
        },
        create: {
          storeId,
          boxId: boxId || null,
          retrySchedule,
          maxRetries,
          finalAction,
          notifyCustomer,
          notifyOwner,
        },
      });

      return NextResponse.json({
        config: {
          id: config.id,
          storeId: config.storeId,
          boxId: config.boxId,
          retrySchedule: config.retrySchedule,
          maxRetries: config.maxRetries,
          finalAction: config.finalAction,
          notifyCustomer: config.notifyCustomer,
          notifyOwner: config.notifyOwner,
          createdAt: config.createdAt.toISOString(),
          updatedAt: config.updatedAt.toISOString(),
        },
      });
    } catch (error: unknown) {
      logger.error("[BOX_DUNNING_CONFIG_POST]", error, { storeId });
      return NextResponse.json(
        { error: "Failed to save dunning configuration" },
        { status: 500 },
      );
    }
  },
);

// GET /api/box-subscriptions/dunning/attempts - List dunning attempts
export const GET_ATTEMPTS = withVayvaAPI(
  PERMISSIONS.CUSTOMERS_VIEW,
  async (req, { storeId }) => {
    try {
      const { searchParams } = new URL(req.url);
      const subscriptionId = searchParams.get("subscriptionId");
      const status = searchParams.get("status");
      const page = parseInt(searchParams.get("page") || "1");
      const limit = parseInt(searchParams.get("limit") || "20");

      const where: any = { 
        subscription: { storeId } 
      };

      if (subscriptionId) where.subscriptionId = subscriptionId;
      if (status) where.status = status;

      const [attempts, total] = await Promise.all([
        prisma.boxDunningAttempt.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { createdAt: "desc" },
          include: {
            subscription: {
              select: {
                id: true,
                boxId: true,
                customerId: true,
                status: true,
              },
            },
          },
        }),
        prisma.boxDunningAttempt.count({ where }),
      ]);

      const attemptList = attempts.map(attempt => ({
        id: attempt.id,
        subscriptionId: attempt.subscriptionId,
        subscriptionStatus: attempt.subscription?.status || "unknown",
        attemptNumber: attempt.attemptNumber,
        status: attempt.status,
        amount: attempt.amount,
        error: attempt.error,
        scheduledAt: attempt.scheduledAt.toISOString(),
        processedAt: attempt.processedAt?.toISOString() || null,
        nextAttemptAt: attempt.nextAttemptAt?.toISOString() || null,
        createdAt: attempt.createdAt.toISOString(),
      }));

      return NextResponse.json({
        attempts: attemptList,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error: unknown) {
      logger.error("[BOX_DUNNING_ATTEMPTS_GET]", error, { storeId });
      return NextResponse.json(
        { error: "Failed to load dunning attempts" },
        { status: 500 },
      );
    }
  },
);

// POST /api/box-subscriptions/dunning/process - Process pending dunning attempts
export const POST_PROCESS = withVayvaAPI(
  PERMISSIONS.CUSTOMERS_MANAGE,
  async (req, { storeId }) => {
    try {
      // In a real implementation, this would process pending dunning attempts
      // For now, we'll return a mock response
      
      const pendingAttempts = await prisma.boxDunningAttempt.findMany({
        where: {
          subscription: { storeId },
          status: "pending",
          scheduledAt: { lte: new Date() },
        },
        take: 10, // Process max 10 at a time
        include: {
          subscription: {
            select: {
              id: true,
              boxId: true,
              customerId: true,
            },
          },
        },
      });

      // Simulate processing
      const processed = pendingAttempts.map(attempt => ({
        id: attempt.id,
        subscriptionId: attempt.subscriptionId,
        processed: true,
        result: "success", // or "failed"
        processedAt: new Date().toISOString(),
      }));

      return NextResponse.json({
        processed,
        totalProcessed: processed.length,
      });
    } catch (error: unknown) {
      logger.error("[BOX_DUNNING_PROCESS_POST]", error, { storeId });
      return NextResponse.json(
        { error: "Failed to process dunning attempts" },
        { status: 500 },
      );
    }
  },
);