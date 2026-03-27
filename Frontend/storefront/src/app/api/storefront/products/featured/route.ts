import { NextRequest, NextResponse } from "next/server";
import { apiClient, handleApiError } from "@/lib/api-client";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productIds = searchParams.get("productIds")?.split(",").filter(Boolean);
    const tag = searchParams.get("tag");
    
    const params: Record<string, string> = {
      limit: "20",
      status: "ACTIVE",
      featured: "true",
    };
    
    if (productIds && productIds.length > 0) {
      params.ids = productIds.join(",");
    }
    if (tag) params.tag = tag;
    
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
