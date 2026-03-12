import { NextResponse } from "next/server";
import { prisma } from "@vayva/db";
import { OpsAuthService } from "@/lib/ops-auth";
import { validateStoreCompliance } from "@vayva/compliance";
import { logger } from "@vayva/shared";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { user } = await OpsAuthService.requireSession();
    if (!["OPS_OWNER", "OPS_ADMIN", "OPS_SUPPORT"].includes(user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const resolvedParams = await params;
    const { id } = resolvedParams;

    const [store, complianceReport] = await Promise.all([
      prisma.store.findUnique({
        where: { id },
        include: {
          tenant: {
            include: {
              tenantMemberships: {
                include: {
                  user: {
                    select: {
                      id: true,
                      firstName: true,
                      lastName: true,
                      email: true,
                    },
                  },
                },
              },
            },
          },
          _count: {
            select: {
              orders: true,
              products: true,
              customers: true,
            },
          },
        },
      }),
      validateStoreCompliance(id),
    ]);

    if (!store) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    const gmvAggregate = await prisma.order.aggregate({
      where: { storeId: id, paymentStatus: "SUCCESS" },
      _sum: { total: true },
    });

    const wallet = await prisma.wallet.findUnique({
      where: { storeId: id },
    });

    const recentAudit = await prisma.auditLog.findMany({
      where: { app: "ops", targetStoreId: id },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        action: true,
        ip: true,
        createdAt: true,
      },
    });

    const ownerMember = store.tenant?.tenantMemberships.find((m: any) => m.role === "OWNER",
    );
    const ownerEmail = ownerMember?.user.email;

    // Parse settings for notes
    const settings = (store.settings as Record<string, unknown>) || {};
    const notes = settings.internalNotes || [];

    return NextResponse.json({
      id: store.id,
      name: store.name,
      slug: store.slug,
      onboardingStatus: store.onboardingStatus,
      industrySlug: store.industrySlug,
      kycStatus: store.kycStatus,
      isActive: store.isActive,
      payoutsEnabled: store.payoutsEnabled,
      kycDetails: null,
      walletStatus: wallet
        ? {
            id: wallet.id,
            storeId: wallet.storeId,
            availableKobo: wallet.availableKobo,
            pendingKobo: wallet.pendingKobo,
            isLocked: wallet.isLocked,
            kycStatus: wallet.kycStatus,
            vaStatus: wallet.vaStatus,
            vaBankName: wallet.vaBankName,
            vaAccountNumber: wallet.vaAccountNumber,
            vaAccountName: wallet.vaAccountName,
            vaProviderRef: wallet.vaProviderRef,
            updatedAt: wallet.updatedAt,
          }
        : null,
      history: recentAudit.map((a) => ({
        action: a.action,
        timestamp: a.createdAt,
        ip: a.ip,
      })),
      profile: {
        id: store.id,
        name: store.name,
        slug: store.slug,
        logoUrl: store.logoUrl,
        isLive: store.isLive,
        createdAt: store.createdAt,
        ownerEmail,
      },
      stats: {
        ordersCount: store._count.orders,
        productsCount: store._count.products,
        customersCount: store._count.customers,
        gmv: gmvAggregate._sum.total || 0,
        walletBalance: wallet ? Number(wallet.availableKobo) / 100 : 0,
      },
      notes,
      compliance: complianceReport,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: unknown) {
    logger.error("[MERCHANT_DETAIL_ERROR]", { error });
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { user } = await OpsAuthService.requireSession();
    // Notes can be added by Support as well
    if (!["OPS_OWNER", "OPS_ADMIN", "OPS_SUPPORT"].includes(user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const resolvedParams = await params;
    const { id } = resolvedParams;
    const body = await request.json();
    const { note } = body;

    if (!note || typeof note !== "string") {
      return NextResponse.json({ error: "Invalid note" }, { status: 400 });
    }

    // 1. Fetch current settings
    const store = await prisma.store.findUnique({
      where: { id },
      select: { settings: true },
    });

    if (!store) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    const currentSettings = (store.settings as Record<string, unknown>) || {};
    const currentNotes = Array.isArray(currentSettings.internalNotes)
      ? currentSettings.internalNotes
      : [];

    // 2. Append new note
    const newNoteEntry = {
      id: Date.now().toString(),
      text: note,
      author: user.email, // Or name if available
      date: new Date().toISOString(),
    };

    const updatedNotes = [newNoteEntry, ...currentNotes];

    // 3. Save back to DB
    await prisma.store.update({
      where: { id },
      data: {
        settings: {
          ...currentSettings,
          internalNotes: updatedNotes,
        },
      },
    });

    // Audit Log
    await OpsAuthService.logEvent(user.id, "MERCHANT_NOTE_ADDED", {
      storeId: id,
      notePreview: note.substring(0, 50),
    });

    return NextResponse.json({ success: true, notes: updatedNotes });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: unknown) {
    logger.error("[MERCHANT_NOTE_UPDATE_ERROR]", { error });
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
