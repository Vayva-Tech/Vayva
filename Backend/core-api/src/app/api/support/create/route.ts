import { urls } from "@vayva/shared";
import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma , SupportTicketCategory, SupportTicketPriority } from "@vayva/db";
import { Resend } from "resend";
import { logger, ErrorCategory } from "@/lib/logger";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

export const POST = withVayvaAPI(
  PERMISSIONS.SUPPORT_MANAGE,
  async (req, { storeId, user }) => {
    try {
      const parsedBody: unknown = await req.json().catch(() => ({}));
      const body = isRecord(parsedBody) ? parsedBody : {};
      const subject = getString(body.subject);
      const description = getString(body.description);
      const category = getString(body.category);
      const priority = getString(body.priority);

      if (!subject || !description) {
        return NextResponse.json(
          { error: "Missing required fields" },
          { status: 400 },
        );
      }

      // AI Auto-Classification using Groq
      let finalPriority = (priority || "medium").toLowerCase();
      try {
        const { GroqClient } = await import("@/lib/ai/groq-client");
        const groq = new GroqClient("SUPPORT");
        const classification = await groq.chatCompletion(
          [
            {
              role: "system",
              content:
                "You are a support classifier. Classify the priority of the following support ticket as: low, medium, or high. urgent issues like site down or payment failure must be high. low is for general questions or feedback. Respond with ONLY the word: low, medium, or high.",
            },
            {
              role: "user",
              content: `Subject: ${subject}\nDescription: ${description}`,
            },
          ],
          { temperature: 0.1, maxTokens: 10 },
        );
        const aiPriority = classification?.choices[0]?.message?.content
          ?.toLowerCase()
          .trim();
        if (aiPriority && ["low", "medium", "high"].includes(aiPriority)) {
          finalPriority = aiPriority;
        }
      } catch (e) {
        logger.warn("[SUPPORT_AI_CLASSIFICATION_FAILED]", ErrorCategory.API, {
          storeId,
          error: e,
        });
        // Fallback to simple logic if Groq fails
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

      const priorityForStorage = (finalPriority || "medium").toUpperCase();
      const ticket = await prisma.supportTicket.create({
        data: {
          storeId,
          subject,
          category: (category || "OTHER") as SupportTicketCategory,
          description,
          status: "open",
          priority: priorityForStorage as SupportTicketPriority,
          metadata: {
            source: "MERCHANT_DASHBOARD",
          },
        },
      });

      // Send Email Notification
      if (user.email && process.env.RESEND_API_KEY) {
        try {
          const resend = new Resend(process.env.RESEND_API_KEY);
          await resend.emails.send({
            from:
              process.env.RESEND_FROM_EMAIL ||
              `Vayva Support <${urls.supportEmail()}>`,
            to: user.email,
            subject: `Ticket Received: ${subject} (#${ticket.id.slice(0, 8)})`,
            html: `<p>Hi there,</p>
                           <p>We received your support request. Our team is looking into it.</p>
                           <p><strong>Ticket ID:</strong> ${ticket.id}</p>
                           <p><strong>Priority:</strong> ${priorityForStorage}</p>
                           <p>Best,<br/>Vayva Support Team</p>`,
          });
        } catch (emailError) {
          logger.error("[SUPPORT_EMAIL_SEND_FAILED]", emailError, {
            storeId,
            ticketId: ticket.id,
          });
        }
      }
      return NextResponse.json({ success: true, ticket });
    } catch (error: unknown) {
      logger.error("[SUPPORT_TICKET_CREATE_POST]", error, {
        storeId,
        userId: user.id,
      });
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 },
      );
    }
  },
);
