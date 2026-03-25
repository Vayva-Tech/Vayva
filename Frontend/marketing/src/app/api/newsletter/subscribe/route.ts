import { urls, logger } from "@vayva/shared";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@vayva/db";
import { Resend } from "resend";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { email } = await request.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Valid email is required" },
        { status: 400 },
      );
    }

    // Store subscription in RescueIncident for now (can be migrated to dedicated table later)
    await prisma.rescueIncident?.create({
      data: {
        surface: "MARKETING_NEWSLETTER" as any,
        severity: "LOW",
        errorType: "NEWSLETTER_SUBSCRIPTION",
        errorMessage: `Newsletter subscription: ${email}`,
        fingerprint: `newsletter-${email}-${Date.now()}`,
        status: "OPEN",
        diagnostics: {
          email,
          subscribedAt: new Date().toISOString(),
          source: "marketing_page",
        },
      },
    });

    // Send confirmation email if Resend is configured
    if (process.env?.RESEND_API_KEY) {
      try {
        const resend = new Resend(process.env?.RESEND_API_KEY);

        await resend.emails?.send({
          from: `Vayva <${urls.noReplyEmail()}>`,
          to: [email],
          subject: "Welcome to the Vayva Newsletter!",
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #22C55E;">Welcome to Vayva!</h1>
              <p>Thanks for subscribing to our newsletter. You'll receive weekly tips on growing your WhatsApp business.</p>
              <p>Here's what you can expect:</p>
              <ul>
                <li>Business growth strategies</li>
                <li>Success stories from Nigerian merchants</li>
                <li>Product updates and new features</li>
                <li>Industry insights and trends</li>
              </ul>
              <p>Best regards,<br>The Vayva Team</p>
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
              <p style="font-size: 12px; color: #9ca3af; text-align: center;">
                &copy; ${new Date().getFullYear()} Vayva. All rights reserved.
              </p>
            </div>
          `,
        });
      } catch (emailError: unknown) {
        const errMsg = emailError instanceof Error ? emailError.message : String(emailError);
        logger.error("[Newsletter] Email send failed", { error: errMsg });
      }
    }

    return NextResponse.json(
      { success: true, message: "Successfully subscribed" },
      { status: 201 },
    );
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    logger.error("[Newsletter subscription error]", { error: errMsg });
    return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 });
  }
}
