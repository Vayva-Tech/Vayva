import { NextRequest } from "next/server";
import { withVayvaAPI } from "@/lib/api-middleware";
import { apiJson } from "@/lib/api-client-shared";

/**
 * GET /api/security/suspicious-activity
 * Fetch suspicious activity alerts
 */
export async function GET(request: NextRequest) {
  return withVayvaAPI(
    request,
    async (session: any) => {
      try {
        const data = await apiJson<{
          alerts: Array<{
            id: string;
            type: string;
            severity: string;
            timestamp: string;
            details: {
              ip: string;
              device: string;
              attempts?: number;
              location?: string;
            };
            resolved: boolean;
          }>;
        }>(
          `${process.env.BACKEND_API_URL}/api/security/suspicious-activity?userId=${session.userId}`,
          { method: "GET" }
        );

        return {
          status: 200,
          body: data,
        };
      } catch {
        // Mock alerts for development
        return {
          status: 200,
          body: { alerts: [] },
        };
      }
    },
    { requireAuth: true }
  );
}

/**
 * POST /api/security/verify-device
 * Verify or reject a new device
 */
export async function POST(request: NextRequest) {
  return withVayvaAPI(
    request,
    async (session: any) => {
      const body = await request.json();
      const { attemptId, trusted } = body;

      try {
        const result = await apiJson<{ success: boolean }>(
          `${process.env.BACKEND_API_URL}/api/security/verify-device`,
          {
            method: "POST",
            body: JSON.stringify({
              userId: session.userId,
              attemptId,
              trusted,
            }),
          }
        );

        return {
          status: 200,
          body: result,
        };
      } catch {
        return {
          status: 200,
          body: { success: true },
        };
      }
    },
    { requireAuth: true }
  );
}
