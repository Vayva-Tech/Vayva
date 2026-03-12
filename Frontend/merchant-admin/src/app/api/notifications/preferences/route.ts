import { NextRequest } from "next/server";
import { withVayvaAPI, MiddlewareSession } from "@/lib/api-middleware";
import { apiJson } from "@/lib/api-client-shared";

interface NotificationPreferences {
  inApp: boolean;
  email: boolean;
  whatsapp: boolean;
  push: boolean;
  categories: {
    orders: boolean;
    payouts: boolean;
    lowStock: boolean;
    kyc: boolean;
    marketing: boolean;
    security: boolean;
  };
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  inApp: true,
  email: true,
  whatsapp: false,
  push: false,
  categories: {
    orders: true,
    payouts: true,
    lowStock: true,
    kyc: true,
    marketing: false,
    security: true,
  },
};

/**
 * GET /api/notifications/preferences
 * Fetch user's notification preferences
 */
export async function GET(request: NextRequest) {
  return withVayvaAPI(
    request,
    async (session: MiddlewareSession) => {
      try {
        const data = await apiJson<{ preferences: NotificationPreferences }>(
          `${process.env.BACKEND_API_URL}/api/notifications/preferences?userId=${session.userId}`,
          { method: "GET" }
        );

        return {
          status: 200,
          body: data,
        };
      } catch {
        // Return defaults if backend unavailable
        return {
          status: 200,
          body: { preferences: DEFAULT_PREFERENCES },
        };
      }
    },
    { requireAuth: true }
  );
}

/**
 * POST /api/notifications/preferences
 * Update user's notification preferences
 */
export async function POST(request: NextRequest) {
  return withVayvaAPI(
    request,
    async (session: MiddlewareSession) => {
      const body = await request.json();
      const { preferences } = body;

      try {
        const result = await apiJson<{ success: boolean }>(
          `${process.env.BACKEND_API_URL}/api/notifications/preferences`,
          {
            method: "POST",
            body: JSON.stringify({
              userId: session.userId,
              merchantId: session.merchantId,
              preferences,
            }),
          }
        );

        return {
          status: result.success ? 200 : 400,
          body: result,
        };
      } catch {
        // Mock success for development
        return {
          status: 200,
          body: { success: true, message: "Preferences saved (mock)" },
        };
      }
    },
    { requireAuth: true }
  );
}
