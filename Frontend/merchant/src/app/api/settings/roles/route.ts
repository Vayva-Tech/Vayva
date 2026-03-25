import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { PERMISSIONS } from "@/lib/team/permissions";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

/**
 * GET /api/settings/roles
 * List custom roles for the current store.
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth?.user?.storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const storeId = auth.user.storeId;
    // Call backend API to fetch roles
    const roles = await apiJson<Array<{
        id: string;
        name: string;
        description: string;
        rolePermissions: Array<{
            permission: {
                id: string;
                key: string;
            };
        }>;
        _count: {
            memberships: number;
        };
    }>>(
        `${process.env.BACKEND_API_URL}/api/settings/roles`,
        {
            headers: auth.headers,
        }
    );

    return NextResponse.json(roles, {
        headers: {
            "Cache-Control": "no-store",
        },
    });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error) {
    handleApiError(error, {
      endpoint: '/api/settings/roles',
      operation: 'GET_ROLES',
    });
    return NextResponse.json(
      { error: 'Failed to complete operation' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/settings/roles
 * Create or update a custom role.
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth?.user?.storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const storeId = auth.user.storeId;
    const body = await request.json().catch(() => ({}));
    const { id, name, description, permissionIds } = body;

    if (!name) {
        return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    // Call backend API to create/update role
    const result = await apiJson<{
        id: string;
        name: string;
        description: string;
    }>(
        `${process.env.BACKEND_API_URL}/api/settings/roles`,
        {
            method: "POST",
            headers: auth.headers,
            body: JSON.stringify({
                id,
                name,
                description,
                permissionIds,
            }),
        }
    );

    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, {
      endpoint: '/api/settings/roles',
      operation: 'CREATE_ROLE',
    });
    return NextResponse.json(
      { error: 'Failed to complete operation' },
      { status: 500 }
    );
  }
}
