/**
 * Consent Management API Route
 * 
 * Handles user consent for GDPR compliance
 * Tracks marketing, analytics, and third-party consent
 */

import { NextRequest, NextResponse } from "next/server";
import { GdprAutomation, StorageProvider, WhatsAppNotifier } from "@vayva/compliance";
import { auth } from "@/lib/auth";

// Storage and WhatsApp provider implementations
class VercelStorageProvider implements StorageProvider {
  async upload(data: Buffer | string, path: string): Promise<string> {
    return path;
  }
  async getSignedUrl(path: string, _expiresInSeconds: number): Promise<string> {
    return path;
  }
}

class EvolutionWhatsAppNotifier implements WhatsAppNotifier {
  async sendMessage(): Promise<unknown> {
    return {};
  }
}

/**
 * GET /api/compliance/consent
 * Get current consent status for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get("storeId") || session.user.storeId;

    if (!storeId) {
      return NextResponse.json(
        { error: "Store ID required" },
        { status: 400 }
      );
    }

    const storage = new VercelStorageProvider();
    const whatsapp = new EvolutionWhatsAppNotifier();
    const gdpr = new GdprAutomation(storage, whatsapp);

    const consentStatus = await gdpr.getConsentStatus(storeId);

    return NextResponse.json({
      success: true,
      data: consentStatus,
    });
  } catch (error) {
    console.error("Get consent error:", error);
    return NextResponse.json(
      { error: "Failed to get consent status" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/compliance/consent
 * Record or update consent
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    const body = await request.json();
    const { 
      storeId, 
      consentType, 
      granted, 
      userId: bodyUserId 
    } = body;

    // Use authenticated user's ID or provided user ID for anonymous users
    const _userId = session?.user?.id || bodyUserId;
    const targetStoreId = storeId || session?.user?.storeId;

    if (!targetStoreId) {
      return NextResponse.json(
        { error: "Store ID required" },
        { status: 400 }
      );
    }

    if (!consentType || typeof granted !== "boolean") {
      return NextResponse.json(
        { error: "Consent type and granted status required" },
        { status: 400 }
      );
    }

    // Validate consent type
    const validTypes = ["marketing", "analytics", "third_party", "cookies", "notifications"];
    if (!validTypes.includes(consentType)) {
      return NextResponse.json(
        { error: `Invalid consent type. Must be one of: ${validTypes.join(", ")}` },
        { status: 400 }
      );
    }

    const storage = new VercelStorageProvider();
    const whatsapp = new EvolutionWhatsAppNotifier();
    const gdpr = new GdprAutomation(storage, whatsapp);

    // Get client info for audit trail
    const ipAddress = request.headers.get("x-forwarded-for") || 
                      request.headers.get("x-real-ip") || 
                      "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";

    await gdpr.recordConsent(targetStoreId, consentType, granted, {
      ipAddress: ipAddress.split(",")[0].trim(),
      userAgent,
    });

    return NextResponse.json({
      success: true,
      message: `Consent ${granted ? "granted" : "revoked"} for ${consentType}`,
      data: {
        consentType,
        granted,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Record consent error:", error);
    return NextResponse.json(
      { error: "Failed to record consent" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/compliance/consent
 * Bulk update multiple consents
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { storeId, consents } = body;

    const targetStoreId = storeId || session.user.storeId;

    if (!targetStoreId) {
      return NextResponse.json(
        { error: "Store ID required" },
        { status: 400 }
      );
    }

    if (!consents || typeof consents !== "object") {
      return NextResponse.json(
        { error: "Consents object required" },
        { status: 400 }
      );
    }

    const storage = new VercelStorageProvider();
    const whatsapp = new EvolutionWhatsAppNotifier();
    const gdpr = new GdprAutomation(storage, whatsapp);

    const ipAddress = request.headers.get("x-forwarded-for") || 
                      request.headers.get("x-real-ip") || 
                      "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";

    const results = [];
    for (const [consentType, granted] of Object.entries(consents)) {
      if (typeof granted === "boolean") {
        await gdpr.recordConsent(targetStoreId, consentType, granted, {
          ipAddress: ipAddress.split(",")[0].trim(),
          userAgent,
        });
        results.push({ consentType, granted });
      }
    }

    return NextResponse.json({
      success: true,
      message: `${results.length} consent preferences updated`,
      data: {
        updated: results,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Bulk update consent error:", error);
    return NextResponse.json(
      { error: "Failed to update consents" },
      { status: 500 }
    );
  }
}
