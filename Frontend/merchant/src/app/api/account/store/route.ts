// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { PERMISSIONS } from "@/lib/team/permissions";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

interface StoreSettings {
  description?: string;
  supportEmail?: string;
  supportPhone?: string;
  whatsappNumber?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    landmark?: string;
  };
  isActive?: boolean;
  operatingHours?: Record<string, { isClosed: boolean; open?: string; close?: string }>;
}

export async function GET(request: NextRequest) {
  try {
    const storeId = request.headers.get("x-store-id") || "";
    const result = await apiJson<{
      name: string;
      slug: string;
      businessType: string;
      description: string;
      supportEmail: string;
      supportPhone: string;
      logoUrl: string;
      whatsappNumber: string;
      address: StoreSettings["address"];
      operatingHours: StoreSettings["operatingHours"];
      isActive: boolean;
    }>(`${process.env.BACKEND_API_URL}/api/account/store`, {
      headers: {
        "x-store-id": storeId,
      },
    });
    
    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, {
      endpoint: "/api/account/store",
      operation: "GET_STORE",
    });
    return NextResponse.json(
      { error: "Failed to fetch store" },
      { status: 500 }
    );
  }
}
