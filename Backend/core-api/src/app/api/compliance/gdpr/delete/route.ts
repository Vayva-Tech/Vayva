/**
 * GDPR Data Deletion API Route
 * 
 * Handles data subject deletion requests (Right to be Forgotten)
 * Schedules account deletion with 30-day grace period
 */

import { NextRequest, NextResponse } from "next/server";
import { GdprAutomation, StorageProvider, WhatsAppNotifier } from "@vayva/compliance";
import { auth } from "@/lib/auth";
import { prisma } from "@vayva/db";

// Storage and WhatsApp provider implementations
class VercelStorageProvider implements StorageProvider {
  async upload(data: Buffer | string, path: string): Promise<string> {
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
 * POST /api/compliance/gdpr/delete
 * Request account deletion (30-day grace period)
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

    const userId = session.user.id;
    
    // Get request body
    const body = await request.json().catch(() => ({}));
    const { storeId, _reason, confirm } = body;

    if (!storeId) {
      return NextResponse.json(
        { error: "Store ID required" },
        { status: 400 }
      );
    }

    // Verify user owns this store
    const store = await prisma.store.findFirst({
      where: {
        id: storeId,
        ownerId: userId,
      },
    });

    if (!store) {
      return NextResponse.json(
        { error: "Store not found or access denied" },
        { status: 403 }
      );
    }

    // Check for confirmation
    if (!confirm) {
      return NextResponse.json(
        { 
          error: "Confirmation required",
          message: "Please confirm deletion by setting confirm: true. This action cannot be undone.",
          warning: "Your account will be permanently deleted after 30 days. You can cancel this request before then."
        },
        { status: 400 }
      );
    }

    // Initialize GDPR automation
    const storage = new VercelStorageProvider();
    const whatsapp = new EvolutionWhatsAppNotifier();
    const gdpr = new GdprAutomation(storage, whatsapp, "vayva-official");

    // Check if there's already a pending deletion
    const hasPending = await gdpr.hasPendingDeletion(storeId);
    if (hasPending) {
      return NextResponse.json(
        { 
          error: "Deletion already scheduled",
          message: "There is already a pending deletion request for this account."
        },
        { status: 409 }
      );
    }

    // Schedule deletion
    const result = await gdpr.handleDeletionRequest(storeId, userId);

    return NextResponse.json({
      success: true,
      message: "Account deletion scheduled successfully",
      data: {
        deletionRequestId: result.deletionRequestId,
        scheduledFor: result.scheduledFor,
        gracePeriodDays: 30,
        canCancelUntil: result.scheduledFor,
      },
    });
  } catch (error) {
    console.error("GDPR deletion error:", error);
    return NextResponse.json(
      { error: "Failed to schedule account deletion" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/compliance/gdpr/delete
 * Cancel a pending deletion request
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const deletionRequestId = searchParams.get("id");

    if (!deletionRequestId) {
      return NextResponse.json(
        { error: "Deletion request ID required" },
        { status: 400 }
      );
    }

    // Initialize GDPR automation
    const storage = new VercelStorageProvider();
    const whatsapp = new EvolutionWhatsAppNotifier();
    const gdpr = new GdprAutomation(storage, whatsapp, "vayva-official");

    // Cancel deletion
    await gdpr.cancelDeletionRequest(deletionRequestId);

    return NextResponse.json({
      success: true,
      message: "Account deletion request canceled successfully",
    });
  } catch (error) {
    console.error("GDPR cancel deletion error:", error);
    return NextResponse.json(
      { error: "Failed to cancel deletion request" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/compliance/gdpr/delete
 * Check deletion status
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

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get("storeId");

    if (!storeId) {
      return NextResponse.json(
        { error: "Store ID required" },
        { status: 400 }
      );
    }

    // Verify ownership
    const store = await prisma.store.findFirst({
      where: {
        id: storeId,
        ownerId: userId,
      },
    });

    if (!store) {
      return NextResponse.json(
        { error: "Store not found or access denied" },
        { status: 403 }
      );
    }

    // Get pending deletion requests
    const pendingDeletions = await prisma.accountDeletionRequest.findMany({
      where: {
        storeId,
        status: "SCHEDULED",
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 1,
    });

    const hasPending = pendingDeletions.length > 0;

    return NextResponse.json({
      success: true,
      data: {
        hasPendingDeletion: hasPending,
        pendingDeletion: hasPending ? {
          id: pendingDeletions[0].id,
          scheduledFor: pendingDeletions[0].scheduledFor,
          daysRemaining: Math.ceil(
            (new Date(pendingDeletions[0].scheduledFor).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
          ),
        } : null,
      },
    });
  } catch (error) {
    console.error("GDPR deletion status error:", error);
    return NextResponse.json(
      { error: "Failed to get deletion status" },
      { status: 500 }
    );
  }
}
