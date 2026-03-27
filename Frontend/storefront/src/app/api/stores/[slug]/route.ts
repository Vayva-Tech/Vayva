import { NextRequest, NextResponse } from "next/server";
import { apiClient, handleApiError } from "@/lib/api-client";

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const storeSlug = params.slug;
    
    // Call backend stores endpoint
    const response = await apiClient.publicGet<any>(`/api/v1/stores/${storeSlug}`);
    
    const store = response.data;
    
    if (!store || !store.isActive) {
      return NextResponse.json(
        { error: "Store not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: store.id,
      name: store.name,
      slug: store.slug,
      logoUrl: store.logoUrl,
      settings: store.settings,
      plan: store.plan,
      isLive: store.isLive,
      isActive: store.isActive,
      theme: store.theme,
      sections: store.sections,
    });
  } catch (error) {
    console.error("[STORES_SLUG] Error:", error);
    const { message, code } = handleApiError(error);
    return NextResponse.json(
      { error: message, code },
      { status: 500 }
    );
  }
}
