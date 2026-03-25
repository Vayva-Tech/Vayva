/**
 * GDPR Data Export API Route
 * 
 * Handles data subject access requests (Right to Access)
 * Creates a downloadable export of all merchant data
 */

import { NextRequest, NextResponse } from "next/server";
import { GdprAutomation, StorageProvider, WhatsAppNotifier } from "@vayva/compliance";
import { auth } from "@/lib/auth";

// Simple storage provider implementation using Vercel Blob or similar
class VercelStorageProvider implements StorageProvider {
  async upload(data: Buffer | string, path: string): Promise<string> {
    // Implementation depends on your storage provider
    // This is a placeholder - implement with your actual storage (S3, Cloudflare R2, etc.)
    const response = await fetch(`${process.env.STORAGE_API_URL}/upload`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.STORAGE_API_KEY}`,
      },
      body: JSON.stringify({
        path,
        data: typeof data === "string" ? data : data.toString("base64"),
        encoding: typeof data === "string" ? "utf-8" : "base64",
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to upload to storage");
    }

    const result = await response.json();
    return result.path;
  }

  async getSignedUrl(path: string, expiresInSeconds: number): Promise<string> {
    const response = await fetch(
      `${process.env.STORAGE_API_URL}/signed-url?path=${encodeURIComponent(path)}&expires=${expiresInSeconds}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.STORAGE_API_KEY}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to generate signed URL");
    }

    const result = await response.json();
    return result.url;
  }
}

// WhatsApp notifier using Evolution API
class EvolutionWhatsAppNotifier implements WhatsAppNotifier {
  private apiUrl: string;
  private apiKey: string;

  constructor() {
    this.apiUrl = process.env.EVOLUTION_API_URL || "";
    this.apiKey = process.env.EVOLUTION_API_KEY || "";
  }

  async sendMessage(instanceName: string, phone: string, text: string): Promise<unknown> {
    const cleanPhone = phone.replace(/\D/g, "");
    
    const response = await fetch(
      `${this.apiUrl}/message/sendText/${instanceName}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: this.apiKey,
        },
        body: JSON.stringify({
          number: cleanPhone,
          options: { delay: 1200, presence: "composing" },
          text,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to send WhatsApp message: ${response.statusText}`);
    }

    return response.json();
  }
}

/**
 * POST /api/compliance/gdpr/export
 * Request a data export for the authenticated merchant
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const _userId = session.user.id;
    
    // Get store ID from request or user's default store
    const body = await request.json().catch(() => ({}));
    const storeId = body.storeId || session.user.storeId;

    if (!storeId) {
      return NextResponse.json(
        { error: "Store ID required" },
        { status: 400 }
      );
    }

    // Initialize GDPR automation
    const storage = new VercelStorageProvider();
    const whatsapp = new EvolutionWhatsAppNotifier();
    const gdpr = new GdprAutomation(storage, whatsapp, "vayva-official");

    // Generate export
    const exportPackage = await gdpr.handleDataExportRequest(storeId);

    return NextResponse.json({
      success: true,
      message: "Data export generated successfully",
      data: {
        exportedAt: exportPackage.exportedAt,
        profile: exportPackage.profile,
        stats: {
          products: exportPackage.products.length,
          orders: exportPackage.orders.length,
          customers: exportPackage.customers.length,
          conversations: exportPackage.conversations.length,
        },
      },
    });
  } catch (error) {
    console.error("GDPR export error:", error);
    return NextResponse.json(
      { error: "Failed to generate data export" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/compliance/gdpr/export
 * Check status of a pending export
 */
export async function GET(_request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Return export status or recent exports
    // This would typically query a database for export history
    return NextResponse.json({
      success: true,
      message: "Export status endpoint - implement based on your storage solution",
    });
  } catch (error) {
    console.error("GDPR export status error:", error);
    return NextResponse.json(
      { error: "Failed to get export status" },
      { status: 500 }
    );
  }
}
