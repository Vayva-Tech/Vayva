import { urls, logger } from "@vayva/shared";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@vayva/db";
import { Resend } from "resend";

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 3; // Stricter limit for feature requests

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT_MAX;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const ip =
      request.headers?.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "unknown";
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 },
      );
    }

    const body = await request.json();

    // Honeypot: if the hidden 'website' field is filled, it's a bot
    if (body.website) {
      return NextResponse.json({ success: true, message: "Request received" });
    }

    // Validate required fields
    const { email, industry, category, note } = body;
    if (!email?.trim() || !note?.trim()) {
      return NextResponse.json(
        { error: "Email and note are required." },
        { status: 400 },
      );
    }
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "Invalid email address." },
        { status: 400 },
      );
    }
    if (email.length > 254 || note.length > 5000) {
      return NextResponse.json(
        { error: "One or more fields exceed maximum length." },
        { status: 400 },
      );
    }
    if (category && !["feature-request", "new-industry", "integration", "bug-report", "feedback"].includes(category)) {
      return NextResponse.json(
        { error: "Invalid category." },
        { status: 400 },
      );
    }

    // Send email notification if Resend is configured
    let emailSent = false;
    if (process.env?.RESEND_API_KEY) {
      try {
        const resend = new Resend(process.env?.RESEND_API_KEY);
        // Send feature requests to support team
        const featureRequestEmail = process.env?.EMAIL_SUPPORT || "support@vayva.ng";

        // 1. Send to Vayva Product Team
        await resend.emails?.send({
          from: `Vayva Feature Requests <${urls.noReplyEmail()}>`,
          to: [featureRequestEmail],
          replyTo: email,
          subject: `[Feature Request] ${category ? `[${category}]` : ""} ${industry || "General"}: ${note.slice(0, 50)}...`,
          html: `
            <h1>New Feature Request</h1>
            ${category ? `<p><strong>Category:</strong> ${category}</p>` : ""}
            <p><strong>Industry:</strong> ${industry || "Not specified"}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Request Details:</strong></p>
            <p style="background: #f5f5f5; padding: 16px; border-radius: 8px;">${note.replace(/\n/g, "<br>")}</p>
            <hr>
            <p style="font-size: 12px; color: #666;">Source: marketing_site/feature_request</p>
            <p style="font-size: 12px; color: #666;">IP: ${ip}</p>
          `,
        });

        // 2. Send Confirmation to User
        await resend.emails?.send({
          from: `Vayva Product Team <${urls.noReplyEmail()}>`,
          to: [email],
          subject: `We received your request${industry ? ` for ${industry}` : ""}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #16a34a;">Thank you for your feedback!</h1>
              <p>We've received your ${category ? `${category.replace("-", " ")}` : ""} request${industry ? ` for the <strong>${industry}</strong> industry` : ""}.</p>
              <div style="background: #f9fafb; padding: 20px; border-radius: 12px; margin: 20px 0;">
                <p style="margin: 0; font-size: 14px; color: #6b7280;">Your request:</p>
                <p style="margin: 10px 0 0 0; font-style: italic;">"${note.slice(0, 200)}${note.length > 200 ? '...' : ''}"</p>
              </div>
              <p>Our product team reviews all requests and will reach out if we need more details. While we can't build everything, your input directly shapes our roadmap.</p>
              <p>Best regards,<br>The Vayva Product Team</p>
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
              <p style="font-size: 12px; color: #9ca3af; text-align: center;">
                &copy; ${new Date().getFullYear()} Vayva. All rights reserved.
              </p>
            </div>
          `,
        });
        emailSent = true;
      } catch (emailError: unknown) {
        const errMsg = emailError instanceof Error ? emailError.message : String(emailError);
        logger.error("[Feature Request] Email send failed", { error: errMsg });
        // Continue to persist even if email fails
      }
    } else {
      logger.warn("[Feature Request] RESEND_API_KEY not configured, skipping email");
    }

    // Persist to RescueIncident for Ops visibility
    await prisma.rescueIncident?.create({
      data: {
        surface: "MARKETING_FEATURE_REQUEST" as any,
        severity: "LOW",
        errorType: "FEATURE_REQUEST_SUBMISSION",
        errorMessage: `[${category || "General"}] ${industry || "General"} from ${email}: ${note.slice(0, 100)}...`,
        fingerprint: `feature-${Date.now()}-${Math.random()}`,
        status: "OPEN" as any,
        diagnostics: {
          email,
          category: category || null,
          note,
          industry: industry || null,
          source: "marketing_site",
          emailSent,
        },
      },
    });

    return NextResponse.json({ success: true, message: "Feature request received" });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    logger.error("[Feature Request API Error]", { error: errMsg });
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 },
    );
  }
}
