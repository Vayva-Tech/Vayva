import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

const backendBase = () => process.env.BACKEND_API_URL?.replace(/\/$/, "") ?? "";

// GET /api/healthcare/patients - Get patients with filters
export async function GET(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const page = parseInt(searchParams.get("page") || "1", 10);

    const queryParams = new URLSearchParams();
    if (search) queryParams.set("search", search);
    if (status) queryParams.set("status", status);
    queryParams.set("limit", limit.toString());
    queryParams.set("page", page.toString());

    const result = await apiJson<{
      success: boolean;
      data?: {
        patients: Array<{
          id: string;
          mrn: string;
          firstName: string;
          lastName: string;
          dateOfBirth: string;
          gender: string;
          email: string;
          phone: string;
          status: string;
          bloodGroup: string;
          primaryCarePhysician: string;
          insuranceProvider: string;
          emergencyContact: string;
          createdAt: string;
          _count: {
            appointments: number;
            prescriptions: number;
            labResults: number;
          };
        }>;
        pagination: {
          total: number;
          page: number;
          limit: number;
          totalPages: number;
        };
      };
      error?: string;
    }>(`${backendBase()}/api/healthcare/patients?${queryParams.toString()}`, {
      headers: auth.headers,
    });

    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, {
      endpoint: "/api/healthcare/patients",
      operation: "GET_PATIENTS",
    });
    return NextResponse.json({ error: "Failed to fetch patients" }, { status: 500 });
  }
}
