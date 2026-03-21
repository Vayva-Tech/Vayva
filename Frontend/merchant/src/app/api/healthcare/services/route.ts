import { NextRequest, NextResponse } from "next/server";
import { PERMISSIONS } from "@/lib/team/permissions";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

export async function GET(request: NextRequest) {
  try {
    const storeId = request.headers.get("x-store-id") || "";
    const { searchParams } = new URL(request.url);
      const limit = parseInt(searchParams.get("limit") || "50");
      const offset = parseInt(searchParams.get("offset") || "0");
      const status = searchParams.get("status");
      const category = searchParams.get("category");

      // Build query params
      const queryParams = new URLSearchParams();
      queryParams.set("storeId", storeId);
      queryParams.set("limit", limit.toString());
      queryParams.set("offset", offset.toString());
      if (status) queryParams.set("status", status);
      if (category) queryParams.set("category", category);

      // Call backend API to fetch healthcare services
      const result = await apiJson<{
        success: boolean;
        data: Array<{
          id: string;
          name: string;
          description: string;
          category: string;
          price: number;
          duration: number;
          status: string;
          requiresPreAuth: boolean;
          insuranceCodes: string[];
          preparationInstructions?: string;
          followUpInstructions?: string;
          providers: Array<{
            id: string;
            name: string;
            avatar?: string;
            title: string;
          }>;
          appointmentCount: number;
        }>;
        pagination: {
          total: number;
          limit: number;
          offset: number;
          hasMore: boolean;
        };
      }>(
        `${process.env.BACKEND_API_URL}/api/healthcare/services?${queryParams}`,
      {
          headers: {
            "x-store-id": storeId,
          },
        }
      );

      return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, { endpoint: "/api/healthcare/services", operation: "GET" });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const storeId = request.headers.get("x-store-id") || "";
    const body = await request.json();
      const {
        name,
        description,
        category,
        price,
        duration,
        status = "active",
        requiresPreAuth,
        insuranceCodes,
        preparationInstructions,
        followUpInstructions,
      } = body;

      if (!name || !price) {
        return NextResponse.json(
          { success: false, error: "Name and price are required" },
          { status: 400 }
        );
      }

      // Call backend API to create healthcare service
      const result = await apiJson<{
        success: boolean;
        data: {
          id: string;
          name: string;
          description: string;
          category: string;
          price: number;
          duration: number;
          status: string;
          requiresPreAuth: boolean;
          insuranceCodes: string[];
          preparationInstructions?: string;
          followUpInstructions?: string;
        };
      }>(
        `${process.env.BACKEND_API_URL}/api/healthcare/services`,
      {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-store-id": storeId,
          },
          body: JSON.stringify({
            name,
            description,
            category: category || "general",
            price,
            duration: duration || 30,
            status,
            requiresPreAuth: requiresPreAuth || false,
            insuranceCodes: insuranceCodes || [],
            preparationInstructions,
            followUpInstructions,
          }),
        }
      );

      return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, { endpoint: "/api/healthcare/services", operation: "POST" });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 }
    );
  }
}
