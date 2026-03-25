import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { Queue } from "bullmq";
import { QUEUES } from "@vayva/shared";
import { getRedis } from "@vayva/redis";

// Evolution API message types that we handle
type MediaType = "audio" | "voice" | "image" | "video" | "document";

interface MediaInfo {
  type: MediaType | "text";
  url?: string;
  mimeType?: string;
  caption?: string;
  duration?: number;
  fileName?: string;
}

/**
 * Extract media information from Evolution API payload
 */
function extractMediaInfo(payload: Record<string, unknown>): MediaInfo {
  // Check for message type
  const message = payload.message as Record<string, unknown> | undefined;
  const messageType = message?.messageType as string | undefined;

  // Handle audio/voice messages
  if (messageType === "audioMessage" || messageType === "voiceMessage") {
    const audio = message?.audioMessage as Record<string, unknown> | undefined;
    return {
      type: "voice",
      url: (audio?.url as string) || (audio?.mediaUrl as string),
      mimeType: (audio?.mimetype as string) || "audio/ogg",
      duration: audio?.seconds as number | undefined,
    };
  }

  // Handle image messages
  if (messageType === "imageMessage") {
    const image = message?.imageMessage as Record<string, unknown> | undefined;
    return {
      type: "image",
      url: (image?.url as string) || (image?.mediaUrl as string),
      mimeType: (image?.mimetype as string) || "image/jpeg",
      caption: image?.caption as string | undefined,
    };
  }

  // Handle document messages
  if (messageType === "documentMessage") {
    const document = message?.documentMessage as Record<string, unknown> | undefined;
    return {
      type: "document",
      url: (document?.url as string) || (document?.mediaUrl as string),
      mimeType: document?.mimetype as string | undefined,
      fileName: document?.fileName as string | undefined,
    };
  }

  // Handle video messages
  if (messageType === "videoMessage") {
    const video = message?.videoMessage as Record<string, unknown> | undefined;
    return {
      type: "video",
      url: (video?.url as string) || (video?.mediaUrl as string),
      mimeType: (video?.mimetype as string) || "video/mp4",
      caption: video?.caption as string | undefined,
      duration: video?.seconds as number | undefined,
    };
  }

  // Default to text
  return { type: "text" };
}

/**
 * Extract text content from message
 */
function extractTextContent(payload: Record<string, unknown>): string {
  const message = payload.message as Record<string, unknown> | undefined;
  const messageType = message?.messageType as string | undefined;

  // Text messages
  if (messageType === "conversation" || messageType === "extendedTextMessage") {
    if (messageType === "conversation") {
      return (message?.conversation as string) || "";
    }
    const extended = message?.extendedTextMessage as Record<string, unknown> | undefined;
    return (extended?.text as string) || "";
  }

  // Media with captions
  if (messageType === "imageMessage") {
    const image = message?.imageMessage as Record<string, unknown> | undefined;
    return (image?.caption as string) || "";
  }

  if (messageType === "videoMessage") {
    const video = message?.videoMessage as Record<string, unknown> | undefined;
    return (video?.caption as string) || "";
  }

  if (messageType === "documentMessage") {
    const doc = message?.documentMessage as Record<string, unknown> | undefined;
    return (doc?.caption as string) || "";
  }

  return "";
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json().catch(() => ({}));

    // 1. Validation (Basic)
    // Evolution API sends data like: { instance: "merchant_123", data: { ... } }
    // or { type: "message", instance: "...", ... }

    const instanceName = rawBody.instance || rawBody.instanceName;

    if (!instanceName || typeof instanceName !== "string") {
      // Keep 200 OK to prevent webhook retries from provider if it's just garbage data
      return NextResponse.json(
        { received: true, ignored: "no_instance" },
        { status: 200 },
      );
    }

    // 2. Extract Store ID
    // Format: "merchant_" + storeId
    const prefix = "merchant_";
    if (!instanceName.startsWith(prefix)) {
      return NextResponse.json(
        { received: true, ignored: "invalid_instance_format" },
        { status: 200 },
      );
    }

    const storeId = instanceName.slice(prefix.length);

    if (!storeId) {
      return NextResponse.json(
        { received: true, ignored: "no_store_id" },
        { status: 200 },
      );
    }

    // Extract message metadata
    const payload = rawBody.data || rawBody;
    const mediaInfo = extractMediaInfo(payload);
    const textContent = extractTextContent(payload);

    // Log media type for monitoring
    if (mediaInfo.type !== "text") {
      logger.info("[WHATSAPP_MEDIA_RECEIVED]", {
        storeId,
        mediaType: mediaInfo.type,
        hasCaption: !!mediaInfo.caption,
        hasDuration: !!mediaInfo.duration,
      });
    }

    // 3. Queue Job with enriched payload
    const redis = await getRedis();
    const queue = new Queue(QUEUES.WHATSAPP_INBOUND, {
      connection: redis,
    });

    await queue.add("inbound", {
      storeId,
      payload,
      // Enriched fields for AI processing
      metadata: {
        mediaType: mediaInfo.type,
        mediaUrl: mediaInfo.url,
        mimeType: mediaInfo.mimeType,
        caption: mediaInfo.caption,
        duration: mediaInfo.duration,
        textContent,
        fileName: mediaInfo.fileName,
        timestamp: new Date().toISOString(),
      },
    });

    // Cleanup if necessary (Queue closes usually handle themselves or persist)
    // await queue.close(); // Don't close immediately in Next.js usually causing issues?
    // Actually for serverless, it's tricky. But for VPS/Node mode it's fine.

    return NextResponse.json({ success: true, queued: true }, { status: 200 });
  } catch (error: unknown) {
    logger.error("[WHATSAPP_WEBHOOK]", error);
    return NextResponse.json(
      { received: true, error: "internal" },
      { status: 500 },
    );
  }
}
