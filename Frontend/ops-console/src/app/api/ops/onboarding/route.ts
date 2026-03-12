import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@vayva/db";
import { OpsAuthService } from "@/lib/ops-auth";
import { logger } from "@vayva/shared";

export async function GET(req: NextRequest) {
  await OpsAuthService.requireSession();

  try {
    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") || "week";

    const now = new Date();
    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const weekStart = new Date(todayStart.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(
      todayStart.getTime() - 30 * 24 * 60 * 60 * 1000,
    );

    // Get period filter date
    let periodStart: Date;
    switch (period) {
      case "today":
        periodStart = todayStart;
        break;
      case "week":
        periodStart = weekStart;
        break;
      case "month":
        periodStart = monthStart;
        break;
      default:
        periodStart = new Date(0); // All time
    }

    // Count completions by period (using onboardingUpdatedAt as completion timestamp)
    const [
      completedToday,
      completedThisWeek,
      completedThisMonth,
      pendingOnboarding,
    ] = await Promise.all([
      prisma.store.count({
        where: {
          onboardingCompleted: true,
          onboardingUpdatedAt: { gte: todayStart },
        },
      }),
      prisma.store.count({
        where: {
          onboardingCompleted: true,
          onboardingUpdatedAt: { gte: weekStart },
        },
      }),
      prisma.store.count({
        where: {
          onboardingCompleted: true,
          onboardingUpdatedAt: { gte: monthStart },
        },
      }),
      prisma.store.count({
        where: {
          onboardingCompleted: false,
        },
      }),
    ]);

    // Get recent completions for the selected period
    const recentStores = await prisma.store.findMany({
      where: {
        onboardingCompleted: true,
        onboardingUpdatedAt: { gte: periodStart },
      },
      include: {
        memberships: {
          where: { role_enum: "OWNER" },
          include: {
            user: {
              select: {
                email: true,
                phone: true,
              },
            },
          },
          take: 1,
        },
      },
      orderBy: { onboardingUpdatedAt: "desc" },
      take: 100,
    });

    const recentCompletions = recentStores.map((store) => {
      const owner = store.memberships[0]?.user;
      return {
        id: store.id,
        name: store.name,
        slug: store.slug,
        ownerEmail: owner?.email || "Unknown",
        ownerPhone: owner?.phone || null,
        industry: store.industrySlug || store.category || "general",
        plan: store.plan || "FREE",
        completedAt:
          store.onboardingUpdatedAt?.toISOString() ||
          store.createdAt.toISOString(),
        createdAt: store.createdAt.toISOString(),
      };
    });

    return NextResponse.json({
      completedToday,
      completedThisWeek,
      completedThisMonth,
      pendingOnboarding,
      recentCompletions,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: unknown) {
    logger.error("[ONBOARDING_STATS_ERROR]", { error });
    return NextResponse.json(
      { error: "Failed to fetch onboarding stats" },
      { status: 500 },
    );
  }
}
