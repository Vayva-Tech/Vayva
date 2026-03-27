import { NextRequest, NextResponse } from "next/server";
import { apiClient, handleApiError } from "@/lib/api-client";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = searchParams.get("limit") || "20";
    
    const response = await apiClient.publicGet<any>('/api/v1/collections', {
      limit: Math.min(parseInt(limit), 50).toString(),
      status: "ACTIVE",
    });
    
    const transformed = (response.data || []).map((c: any) => ({
      id: c.id,
      name: c.title,
      slug: c.handle,
      description: c.description,
      imageUrl: null,
      productCount: c._count?.collectionProducts || 0,
      url: `/collections/${c.handle}`,
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
