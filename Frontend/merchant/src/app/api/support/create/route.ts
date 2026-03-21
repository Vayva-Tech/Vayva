// @ts-nocheck
import { urls } from "@vayva/shared";
import { NextRequest, NextResponse } from "next/server";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { Resend } from "resend";
import { logger } from "@/lib/logger";

export async function POST(request: NextRequest) {
  try {
    const storeId = request.headers.get("x-store-id") || "";
    const body = await request.json().catch(() => ({}));
        const { subject, category, description, priority } = body;

        if (!subject || !description) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // AI Auto-Classification using Groq
        let finalPriority = (priority || "medium").toLowerCase();
        try {
            const { GroqClient } = await import("@/lib/ai/groq-client");
            const groq = new GroqClient("SUPPORT");
            const classification = await groq.chatCompletion([
                { role: "system", content: "You are a support classifier. Classify the priority of the following support ticket as: low, medium, or high. urgent issues like site down or payment failure must be high. low is for general questions or feedback. Respond with ONLY the word: low, medium, or high." },
                { role: "user", content: `Subject: ${subject}\nDescription: ${description}` }
            ], { temperature: 0.1, maxTokens: 10 });
            const aiPriority = (classification?.choices[0]?.message as { content?: string })?.content?.toLowerCase().trim();
            if (aiPriority && ["low", "medium", "high"].includes(aiPriority)) {
                finalPriority = aiPriority;
            }
        }
        catch (e) {
            logger.error("[SUPPORT_CREATE] AI Classification failed", { error: e });
            // Fallback to simple logic if Groq fails
            const lowerDesc = description.toLowerCase();
            if (lowerDesc.includes("urgent") || lowerDesc.includes("payment") || lowerDesc.includes("down") || lowerDesc.includes("404")) {
                finalPriority = "high";
            }
        }

        const priorityForStorage = (finalPriority || "medium").toUpperCase();
        const ticket = await prisma.supportTicket?.create({
            data: {
                storeId,
                subject,
                category: category || "OTHER",
                description,
                status: "open",
                priority: priorityForStorage,
                metadata: {
                    source: "MERCHANT_DASHBOARD"
                }
            }
        });

        // Send Email Notification
        if (user.email && process.env?.RESEND_API_KEY) {
            try {
                const resend = new Resend(process.env?.RESEND_API_KEY);
                await resend.emails?.send({
                    from: process.env?.RESEND_FROM_EMAIL || `Vayva Support <${urls.supportEmail()}>`,
                    to: user.email,
                    subject: `Ticket Received: ${subject} (#${ticket?.id?.slice(0, 8)})`,
                    html: `<p>Hi there,</p>
                           <p>We received your support request. Our team is looking into it.</p>
                           <p><strong>Ticket ID:</strong> ${ticket.id}</p>
                           <p><strong>Priority:</strong> ${priorityForStorage}</p>
                           <p>Best,<br/>Vayva Support Team</p>`
                });
            }
            catch (emailError) {
                logger.error("[SUPPORT_CREATE] Failed to send support email", { error: emailError });
            }
        }
        return NextResponse.json({ success: true, ticket });
  } catch (error) {
    handleApiError(error, { endpoint: "/api/support/create", operation: "POST" });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 }
    );
  }
}
