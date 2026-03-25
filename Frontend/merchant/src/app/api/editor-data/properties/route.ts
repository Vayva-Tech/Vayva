import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { prisma } from "@vayva/db";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";
import { PERMISSIONS } from "@/lib/team/permissions";

export async function GET(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const storeId = auth.user.storeId;
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query") || "";
    const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 100);

    // Properties for real estate
    const properties = await prisma.property?.findMany({
      where: {
        storeId,
        ...(query && {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
            { address: { contains: query, mode: "insensitive" } },
            { city: { contains: query, mode: "insensitive" } },
            { state: { contains: query, mode: "insensitive" } },
          ],
        }),
      },
      select: {
        id: true,
        title: true,
        price: true,
        images: true,
        address: true,
        city: true,
        state: true,
        bedrooms: true,
        bathrooms: true,
        status: true,
      },
      orderBy: { updatedAt: "desc" },
      take: limit,
    }) || [];

    const formatted = properties.map((prop) => ({
      id: prop.id,
      name: prop.title,
      price: Number(prop.price) || 0,
      images: prop.images || [],
      location: prop.address ? `${prop.address}${prop.city ? `, ${prop.city}` : ""}${prop.state ? `, ${prop.state}` : ""}` : null,
      bedrooms: prop.bedrooms || null,
      bathrooms: prop.bathrooms || null,
      status: prop.status || "available",
    }));

    return NextResponse.json({
      success: true,
      data: formatted,
    }, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    handleApiError(error, { endpoint: "/api/editor-data/properties", operation: "GET" });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 }
    );
  }
}
