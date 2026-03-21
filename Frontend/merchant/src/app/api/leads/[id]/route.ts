// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { PERMISSIONS } from "@/lib/team/permissions";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { id } = await params;
    const storeId = request.headers.get("x-store-id") || "";
    const { id } = await params;
        
        // Call backend API to fetch lead
        const result = await apiJson<{
            lead?: {
                id: string;
                firstName: string;
                lastName: string;
                email: string;
                phone: string;
                notes: string;
                status: string;
                tags: string[];
            };
        }>(
            `${process.env.BACKEND_API_URL}/api/leads/${id}`,
      {
                headers: {
                    "x-store-id": storeId,
                },
            }
        );
        
        return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    handleApiError(error, { endpoint: "/api/leads/:id", operation: "GET" });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { id } = await params;
    const storeId = request.headers.get("x-store-id") || "";
    const { id } = await params;
        const body = await request.json().catch(() => ({})) as LeadBody;
        const { firstName, lastName, email, phone, notes, status, tags } = body;

        // Call backend API to update lead
        const result = await apiJson<{
            success: boolean;
            lead?: {
                id: string;
                firstName: string;
                lastName: string;
                email: string;
                phone: string;
                notes: string;
                status: string;
                tags: string[];
            };
        }>(
            `${process.env.BACKEND_API_URL}/api/leads/${id}`,
      {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "x-store-id": storeId,
                },
                body: JSON.stringify({ firstName, lastName, email, phone, notes, status, tags }),
            }
        );
        
        return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, { endpoint: "/api/leads/:id", operation: "PATCH" });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 }
    );
  }
}
