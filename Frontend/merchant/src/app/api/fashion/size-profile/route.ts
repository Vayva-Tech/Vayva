import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";
import { fashionService } from "@/services/fashion.service";
import { z } from "zod";

const backendBase = () => process.env.BACKEND_API_URL?.replace(/\/$/, "") ?? "";

const measurementsSchema = z
  .object({
    chest: z.number().optional(),
    waist: z.number().optional(),
    hips: z.number().optional(),
    height: z.number().optional(),
    weight: z.number().optional(),
    inseam: z.number().optional(),
    sleeve: z.number().optional(),
    shoeSize: z.string().min(1).optional(),
  })
  .strict();

const sizePreferenceSchema = z
  .object({
    brand: z.string().min(1),
    size: z.string().min(1),
    fits: z.enum(["too_small", "tight", "well", "loose", "too_big"]),
  })
  .strict();

const createSizeProfileSchema = z
  .object({
    customerId: z.string().min(1),
    measurements: measurementsSchema,
    sizePreferences: z.array(sizePreferenceSchema).optional(),
  })
  .strict();

const updateSizeProfileSchema = z
  .object({
    measurements: measurementsSchema.optional(),
    sizePreferences: z.array(sizePreferenceSchema).optional(),
  })
  .strict();

// GET /api/fashion/size-profile?customerId=xxx
export async function GET(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get("customerId");

    if (!customerId) {
      return NextResponse.json({ error: "Missing customerId" }, { status: 400 });
    }

    const result = await apiJson<{
      success: boolean;
      data?: unknown;
      error?: string;
    }>(
      `${backendBase()}/api/fashion/size-profile?customerId=${encodeURIComponent(customerId)}`,
      { headers: auth.headers }
    );

    if (!result.success) {
      throw new Error(result.error || "Failed to fetch size profile");
    }

    if (result.data == null) {
      return NextResponse.json({ error: "Size profile not found" }, { status: 404 });
    }

    return NextResponse.json({ profile: result.data });
  } catch (error: unknown) {
    handleApiError(error, {
      endpoint: "/fashion/size-profile",
      operation: "FETCH_SIZE_PROFILE",
    });
    return NextResponse.json(
      {
        error: "Failed to fetch size profile",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// POST /api/fashion/size-profile
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const sessionStoreId = session?.user?.storeId;
    if (!session?.user || !sessionStoreId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: unknown = await req.json();

    const parsed = createSizeProfileSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const profile = await fashionService.createSizeProfile(sessionStoreId, {
      customerId: parsed.data.customerId,
      measurements: parsed.data.measurements,
      sizePreferences: parsed.data.sizePreferences,
    });

    return NextResponse.json({ profile }, { status: 201 });
  } catch (_error: unknown) {
    return NextResponse.json({ error: "Failed to create size profile" }, { status: 500 });
  }
}

// PATCH /api/fashion/size-profile?id=xxx
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const sessionStoreId = session?.user?.storeId;
    if (!session?.user || !sessionStoreId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const body: unknown = await req.json();

    const parsed = updateSizeProfileSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const profile = await fashionService.updateSizeProfile(
      sessionStoreId,
      id,
      parsed.data
    );

    return NextResponse.json({ profile });
  } catch (_error: unknown) {
    return NextResponse.json({ error: "Failed to update size profile" }, { status: 500 });
  }
}
