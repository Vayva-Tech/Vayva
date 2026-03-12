/**
 * Feedback API Routes
 * 
 * POST /api/feedback - Submit general feedback
 * POST /api/feedback/post-action - Submit post-action feedback
 * GET /api/feedback - Get feedback list (ops only)
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma, Prisma } from "@vayva/db";
import { z } from "zod";
import { logger } from "@vayva/shared";

const feedbackSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
  category: z.enum(["general", "bug", "feature", "ux", "onboarding"]).default("general"),
  screenshotUrl: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

const postActionFeedbackSchema = z.object({
  action: z.enum(["onboarding_complete", "first_order", "first_payout", "feature_usage"]),
  rating: z.number().min(1).max(5),
  feedback: z.string().optional(),
  timestamp: z.string(),
});

/**
 * Submit feedback
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    
    // Allow anonymous feedback but capture user if logged in
    const userId = session?.user?.id;

    const body = await req.json();
    const validated = feedbackSchema.parse(body);

    // Save to database
    const feedback = await prisma.feedback?.create({
      data: {
        userId,
        rating: validated.rating,
        comment: validated.comment || null,
        category: validated.category,
        screenshotUrl: validated.screenshotUrl || null,
        metadata: (validated.metadata || {}) as Prisma.InputJsonValue,
        type: "GENERAL",
      },
    });

    // Log for ops monitoring
    logger.info("Feedback submitted", {
      feedbackId: feedback.id,
      userId,
      rating: validated.rating,
      category: validated.category,
    });

    // Notify ops console via SSE if rating is low (1-2 stars) or bug report
    if (validated.rating <= 2 || validated.category === "bug") {
      // Add to notification queue for immediate attention
      await prisma.notificationOutbox?.create({
        data: {
          channel: "INTERNAL",
          to: "ops-team",
          type: "FEEDBACK_ALERT",
          status: "SENDING",
          storeId: "system",
          payload: {
            feedbackId: feedback.id,
            rating: validated.rating,
            category: validated.category,
            comment: validated.comment,
            priority: validated.rating <= 2 ? "high" : "medium",
          },
        },
      });
    }

    return NextResponse.json({ success: true, feedbackId: feedback.id });
  } catch (error) {
    logger.error("Feedback submission failed", { error });
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid feedback data", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to submit feedback" },
      { status: 500 }
    );
  }
}

/**
 * Get feedback list (ops/admin only)
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.role || !["ops", "admin", "superadmin"].includes(session.user?.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const category = searchParams.get("category");
    const minRating = searchParams.get("minRating");
    const maxRating = searchParams.get("maxRating");

    const where = {
      ...(category && { category }),
      ...(minRating && { rating: { gte: parseInt(minRating, 10) } }),
      ...(maxRating && { rating: { lte: parseInt(maxRating, 10) } }),
    };

    const [feedback, total, stats] = await Promise.all([
      prisma.feedback?.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.feedback?.count({ where }),
      prisma.$queryRaw<{ category: string; avg_rating: number; count: number }[]>`
        SELECT 
          category,
          AVG(rating) as avg_rating,
          COUNT(*) as count
        FROM feedback
        GROUP BY category
      `,
    ]);

    return NextResponse.json({
      feedback,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      stats: stats.map((s: { category: string; avg_rating: number; count: number }) => ({
        category: s.category,
        avgRating: parseFloat(s.avg_rating?.toFixed(2)),
        count: Number(s.count),
      })),
    });
  } catch (error) {
    logger.error("Failed to fetch feedback", { error });
    return NextResponse.json(
      { error: "Failed to fetch feedback" },
      { status: 500 }
    );
  }
}
