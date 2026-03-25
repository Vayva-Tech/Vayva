import { urls } from "@vayva/shared";
import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { handleApiError } from "@/lib/api-error-handler";
import { prisma } from "@vayva/db";
import { Resend } from "resend";
import { logger } from "@/lib/logger";

const TICKET_CATEGORIES = ["DELIVERY", "PAYMENT", "PRODUCT", "REFUND", "FRAUD", "OTHER"] as const;
type SupportTicketCategory = (typeof TICKET_CATEGORIES)[number];

function parseCategory(value: unknown): SupportTicketCategory {
  return typeof value === "string" && (TICKET_CATEGORIES as readonly string[]).includes(value)
    ? (value as SupportTicketCategory)
    : "OTHER";
}

type SupportTicketPriority = "low" | "medium" | "high" | "urgent";

function parsePriority(value: string): SupportTicketPriority {
  if (value === "low" || value === "medium" || value === "high" || value === "urgent") {
    return value;
  }
  return "medium";
}

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth?.user?.storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const storeId = auth.user.storeId;
    const userEmail = auth.user.email;

    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const subject = typeof body.subject === "string" ? body.subject : "";
    const description = typeof body.description === "string" ? body.description : "";
    const category = parseCategory(body.category);
    const priorityRaw = typeof body.priority === "string" ? body.priority : "medium";

    if (!subject || !description) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    let finalPriority = priorityRaw.toLowerCase();
    try {
      const { OpenRouterClient } = await import("@/lib/ai/openrouter-client");
      const ai = new OpenRouterClient("SUPPORT");
      const classification = await ai.chatCompletion(
        [
          {
            role: "system",
            content:
              "You are a support classifier. Classify the priority of the following support ticket as: low, medium, or high. urgent issues like site down or payment failure must be high. low is for general questions or feedback. Respond with ONLY the word: low, medium, or high.",
          },
          { role: "user", content: `Subject: ${subject}\nDescription: ${description}` },
        ],
        {
          model: "google/gemini-2.5-flash",
          temperature: 0.1,
          maxTokens: 10,
          storeId,
          requestId: `support-classify-${Date.now()}`,
        },
      );
      const aiPriority = (
        classification?.choices[0]?.message as { content?: string } | undefined
      )?.content?.toLowerCase().trim();
      if (aiPriority && ["low", "medium", "high"].includes(aiPriority)) {
        finalPriority = aiPriority;
      }
    } catch (e: unknown) {
      logger.error("[SUPPORT_CREATE] AI Classification failed", { error: e });
      const lowerDesc = description.toLowerCase();
      if (
        lowerDesc.includes("urgent") ||
        lowerDesc.includes("payment") ||
        lowerDesc.includes("down") ||
        lowerDesc.includes("404")
      ) {
        finalPriority = "high";
      }
    }

    const priorityForStorage = parsePriority(finalPriority || "medium");
    const ticket = await prisma.supportTicket.create({
      data: {
        storeId,
        subject,
        category,
        description,
        status: "open",
        priority: priorityForStorage,
        metadata: {
          source: "MERCHANT_DASHBOARD",
        },
      },
    });

    if (userEmail && process.env.RESEND_API_KEY) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || `Vayva Support <${urls.supportEmail()}>`,
          to: userEmail,
          subject: `Ticket Received: ${subject} (#${ticket.id.slice(0, 8)})`,
          html: `<p>Hi there,</p>
                           <p>We received your support request. Our team is looking into it.</p>
                           <p><strong>Ticket ID:</strong> ${ticket.id}</p>
                           <p><strong>Priority:</strong> ${priorityForStorage.toUpperCase()}</p>
                           <p>Best,<br/>Vayva Support Team</p>`,
        });
      } catch (emailError: unknown) {
        logger.error("[SUPPORT_CREATE] Failed to send support email", { error: emailError });
      }
    }
    return NextResponse.json({ success: true, ticket });
  } catch (error: unknown) {
    handleApiError(error, { endpoint: "/api/support/create", operation: "POST" });
    return NextResponse.json({ error: "Failed to complete operation" }, { status: 500 });
  }
}
