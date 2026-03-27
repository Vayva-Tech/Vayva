import { NextResponse } from "next/server";
import { apiClient } from "@/lib/api-client";
import { OpsAuthService } from "@/lib/ops-auth";
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

    // Proxy to backend
    const response = await apiClient.get(`/api/v1/admin/merchants/${id}`);
    return NextResponse.json(response);

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
