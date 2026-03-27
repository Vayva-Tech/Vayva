import { NextRequest, NextResponse } from "next/server";
import { apiClient, handleApiError } from "@/lib/api-client";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = searchParams.get("limit") || "8";
    const sort = searchParams.get("sort") || "newest";
    const collection = searchParams.get("collection");

    // Build query params for backend API
    const params: Record<string, string> = {
      limit: Math.min(parseInt(limit), 50).toString(),
      status: "ACTIVE",
    };

    if (collection) params.collection = collection;
    if (sort === "price-asc") params.sort = "price-asc";
    if (sort === "price-desc") params.sort = "price-desc";

    // Call backend products endpoint
    const response = await apiClient.publicGet<any>('/api/v1/products', params);

    const transformed = (response.data || []).map((p: any) => ({
      id: p.id,
      name: p.title,
      handle: p.handle,
      description: p.description,
      price: Number(p.price),
      compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
      images: p.productImages?.map((img: any) => img.url) || [],
      url: `/products/${p.handle}`,
    }));

    return NextResponse.json({ data: transformed });
  } catch (error) {
    const { message, code } = handleApiError(error);
    return NextResponse.json(
      { error: message, code },
      { status: 500 }
    );
  }
}
