import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { handleApiError } from "@/lib/api-error-handler";
import { prisma } from "@vayva/db";

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id?: string }> }) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const storeId = auth.user.storeId;
    const { id } = await params;

    const products = await prisma.product?.findMany({
      where: { storeId },
      select: { id: true, metadata: true },
    });

    const target = products.find((p) => {
      const md = (p.metadata as Record<string, unknown>) || {};
      const list = Array.isArray(md.calendarSyncs) ? md.calendarSyncs : [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return list.some((s: any) => s?.id === id);
    });

    if (!target) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const metadata = (target.metadata as Record<string, unknown>) || {};
    const existing = Array.isArray(metadata.calendarSyncs) ? metadata.calendarSyncs : [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const next = existing.filter((s: any) => s?.id !== id);

    await prisma.product?.update({
      where: { id: target.id, storeId },
      data: {
        metadata: {
          ...metadata,
          calendarSyncs: next,
        },
      },
    });

    return NextResponse.json({ success: true }, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    handleApiError(error, {
      endpoint: '/api/calendar-sync/[id]',
      operation: 'DELETE_CALENDAR_SYNC',
    });
    return NextResponse.json(
      { error: 'Failed to complete operation' },
      { status: 500 }
    );
  }
}
