import { NextRequest, NextResponse } from "next/server";
import { OpsAuthService } from "@/lib/ops-auth";
import { apiClient } from "@/lib/api-client";
import { logger } from "@vayva/shared";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await OpsAuthService.requireSession();
    const { id } = await params;

    const response = await apiClient.get(`/api/v1/admin/audit/${id}`);
    
    return NextResponse.json(response);
);

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  return getHandler(req, { params } as any);
}
