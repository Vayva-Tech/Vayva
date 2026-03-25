import { urls, logger } from "@vayva/shared";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@vayva/db";
import { Resend } from "resend";

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 5;

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
      return NextResponse.json({ success: true, message: "Message received" });
    }

    // Validate required fields
    const { firstName, lastName, email, subject, message } = body;
    if (
      !firstName?.trim() ||
      !lastName?.trim() ||
      !email?.trim() ||
      !subject?.trim() ||
      !message?.trim()
    ) {
      return NextResponse.json(
        { error: "All fields are required." },
        { status: 400 },
      );
    }
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "Invalid email address." },
        { status: 400 },
      );
    }
    if (
      firstName.length > 100 ||
      lastName.length > 100 ||
      email.length > 254 ||
      subject.length > 200 ||
      message.length > 5000
    ) {
      return NextResponse.json(
        { error: "One or more fields exceed maximum length." },
        { status: 400 },
      );
    }

    // Send email notification if Resend is configured
    let emailSent = false;
    if (process.env?.RESEND_API_KEY) {
      try {
        const resend = new Resend(process.env?.RESEND_API_KEY);
        const helloEmail = "hello@vayva.ng";

        // 1. Send to Vayva Team
        await resend.emails?.send({
          from: `Vayva Contact Form <${urls.noReplyEmail()}>`,
          to: [helloEmail],
          replyTo: body.email,
          subject: `[Contact Form] ${body.subject}`,
          html: `
            <h1>New Contact Submission</h1>
            <p><strong>Name:</strong> ${body.firstName} ${body.lastName}</p>
            <p><strong>Email:</strong> ${body.email}</p>
            <p><strong>Subject:</strong> ${body.subject}</p>
            <p><strong>Message:</strong></p>
            <p>${body?.message?.replace(/\n/g, "<br>")}</p>
            <hr>
            <p style="font-size: 12px; color: #666;">Source: ${body.source || "marketing_site"}</p>
          `,
        });

        // 2. Send Confirmation to User
        await resend.emails?.send({
          from: `Vayva Support <${urls.noReplyEmail()}>`,
          to: [body.email],
          subject: `We received your inquiry: ${body.subject}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #16a34a;">Hello ${body.firstName},</h1>
              <p>Thank you for reaching out to Vayva! We've received your message regarding "<strong>${body.subject}</strong>".</p>
              <p>Our team will review your inquiry and get back to you as soon as possible (usually within 24 hours).</p>
              <div style="background: #f9fafb; padding: 20px; border-radius: 12px; margin: 20px 0;">
                <p style="margin: 0; font-size: 14px; color: #6b7280;">Your message:</p>
                <p style="margin: 10px 0 0 0; font-style: italic;">"${body.message}"</p>
              </div>
              <p>Best regards,<br>The Vayva Team</p>
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
        logger.error("[Contact Form] Email send failed", { error: errMsg });
        // Continue even if email fails
      }
    } else {
      logger.warn("[Contact Form] RESEND_API_KEY not configured, skipping email");
    }

    // Persist to RescueIncident for Ops visibility (never block success response)
    try {
      await prisma.rescueIncident?.create({
        data: {
          surface: "MARKETING_CONTACT" as any,
          severity: "LOW",
          errorType: "CONTACT_FORM_SUBMISSION",
          errorMessage: `[Subject: ${body.subject}] from ${body.email}`,
          fingerprint: `contact-${Date.now()}-${Math.random()}`,
          status: "OPEN",
          diagnostics: {
            name: `${body.firstName} ${body.lastName}`,
            email: body.email,
            message: body.message,
            subject: body.subject,
            source: body.source || "marketing_site",
            emailSent,
          },
        },
      });
    } catch (persistError: unknown) {
      const errMsg =
        persistError instanceof Error ? persistError.message : String(persistError);
      logger.warn("[Contact Form] Persist failed", { error: errMsg });
    }

    return NextResponse.json({ success: true, message: "Message received" });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    logger.error("[Contact API Error]", { error: errMsg });
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 },
    );
  }
}
