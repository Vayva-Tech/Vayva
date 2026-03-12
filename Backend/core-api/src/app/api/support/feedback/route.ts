import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { SupportRating } from "@vayva/db";
import { logger } from "@/lib/logger";
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ticketId = searchParams.get("ticketId");
  const rating = searchParams.get("rating");
  if (!ticketId || !rating) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }
  try {
    // 1. Create feedback record
    await prisma.supportTicketFeedback.upsert({
      where: { ticketId },
      create: {
        ticketId,
        rating: rating as SupportRating,
      },
      update: {
        rating: rating as SupportRating,
        createdAt: new Date(),
      },
    });
    // 2. Handle Closed-Loop Feature: If Raiting is BAD, re-open and escalate
    if (rating === "BAD") {
      await prisma.supportTicket.update({
        where: { id: ticketId },
        data: {
          status: "open",
          priority: "urgent",
          metadata: {
            reopenedReason: "NEGATIVE_FEEDBACK",
            reopenedAt: new Date().toISOString(),
          },
        },
      });
    }
    // 3. Return a nice HTML response or redirect to a thank you page
    return new NextResponse(
      `
            <html>
                <head>
                    <title>Thank You - Vayva Support</title>
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                    <style>
                        body { font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f9fafb; }
                        .card { background: white; padding: 40px; border-radius: 16px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); text-align: center; max-width: 400px; }
                        h1 { color: #111827; margin-bottom: 16px; font-size: 24px; }
                        p { color: #4b5563; line-height: 1.5; }
                        .icon { font-size: 48px; margin-bottom: 20px; }
                    </style>
                </head>
                <body>
                    <div class="card">
                        <div class="icon">${rating === "GREAT" ? "🎉" : rating === "OKAY" ? "👍" : "🙏"}</div>
                        <h1>Thank you for your feedback!</h1>
                        <p>
                            ${
                              rating === "BAD"
                                ? "We're sorry we didn't meet your expectations. We've re-opened your ticket and a manager will review it shortly."
                                : "Your feedback helps us improve our service for everyone. We're glad we could help!"
                            }
                        </p>
                    </div>
                </body>
            </html>
            `,
      {
        headers: {
          "Content-Type": "text/html",
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    logger.error("[SUPPORT_FEEDBACK]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }
}
