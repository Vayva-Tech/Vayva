import { urls, logger } from "@vayva/shared";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@vayva/db";
import { Resend } from "resend";

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 5; // Reasonable limit for authenticated merchants

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

    // Validate required fields
    const { requestType, title, description, priority, attachmentUrl } = body;
    
    if (!title?.trim() || !description?.trim()) {
      return NextResponse.json(
        { error: "Title and description are required." },
        { status: 400 },
      );
    }

    if (title.length > 100 || description.length > 2000) {
      return NextResponse.json(
        { error: "One or more fields exceed maximum length." },
        { status: 400 },
      );
    }

    // Get merchant info from session (assuming authentication middleware handles this)
    const merchantId = request.headers.get("x-merchant-id") || "anonymous";
    
    // Send email notification if Resend is configured
    let emailSent = false;
    if (process.env?.RESEND_API_KEY) {
      try {
        const resend = new Resend(process.env?.RESEND_API_KEY);
        const featureRequestEmail = process.env?.EMAIL_SUPPORT || "support@vayva.ng";
        const opsConsoleEmail = process.env?.EMAIL_OPS || "ops@vayva.ng";

        // Prepare email content
        const requestTypeLabel = requestType === "platform" ? "Platform Feature" : "Business Need";
        const priorityLabel = priority?.charAt(0).toUpperCase() + priority?.slice(1) || "Medium";
        
        const emailHtml = `
          <div style="font-family: sans-serif; max-width: 800px; margin: 0 auto;">
            <h1 style="color: #16a34a; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">
              🚀 New Feature Request
            </h1>
            
            <div style="background: #f9fafb; padding: 20px; border-radius: 12px; margin: 20px 0;">
              <div style="display: grid; grid-template-columns: auto 1fr; gap: 15px; align-items: start;">
                <div><strong>Type:</strong></div>
                <div style="padding: 4px 8px; background: #dbeafe; color: #1e40af; border-radius: 6px; font-weight: 500; display: inline-block;">
                  ${requestTypeLabel}
                </div>
                
                <div><strong>Priority:</strong></div>
                <div style="padding: 4px 8px; background: #fef3c7; color: #92400e; border-radius: 6px; font-weight: 500; display: inline-block;">
                  ${priorityLabel}
                </div>
                
                <div><strong>Merchant ID:</strong></div>
                <div>${merchantId}</div>
                
                ${attachmentUrl ? `
                  <div><strong>Attachment:</strong></div>
                  <div><a href="${attachmentUrl}" style="color: #3b82f6; text-decoration: underline;">View Attachment</a></div>
                ` : ''}
              </div>
            </div>

            <h2 style="color: #1f2937; margin: 25px 0 10px;">${title}</h2>
            
            <div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 15px 0;">
              <p style="margin: 0; line-height: 1.6; color: #374151;">${description.replace(/\n/g, "<br>")}</p>
            </div>

            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280;">
              <p><strong>Source:</strong> Merchant Admin Dashboard</p>
              <p><strong>IP Address:</strong> ${ip}</p>
              <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
            </div>
          </div>
        `;

        // Send to support team
        await resend.emails?.send({
          from: `Vayva Feature Requests <${urls.noReplyEmail()}>`,
          to: [featureRequestEmail, opsConsoleEmail],
          replyTo: featureRequestEmail,
          subject: `[Feature Request] ${requestTypeLabel} - ${title.slice(0, 50)}${title.length > 50 ? '...' : ''}`,
          html: emailHtml,
        });

        emailSent = true;
      } catch (emailError: unknown) {
        const errMsg = emailError instanceof Error ? emailError.message : String(emailError);
        logger.error("[Merchant Feature Request] Email send failed", { error: errMsg });
        // Continue to persist even if email fails
      }
    } else {
      logger.warn("[Merchant Feature Request] RESEND_API_KEY not configured, skipping email");
    }

    // Persist to database for tracking
    await prisma.featureRequest?.create({
      data: {
        merchantId,
        requestType: requestType.toUpperCase(), // PLATFORM or PERSONAL
        title: title.trim(),
        description: description.trim(),
        priority: priority?.toUpperCase() || "MEDIUM", // LOW, MEDIUM, HIGH
        attachmentUrl: attachmentUrl || null,
        status: "PENDING", // PENDING, REVIEWED, IMPLEMENTED, REJECTED
        source: "MERCHANT_ADMIN",
        metadata: {
          ip,
          userAgent: body.metadata?.userAgent || "Unknown",
          url: body.metadata?.url || "Unknown",
          screenSize: body.metadata?.screenSize || "Unknown",
          emailSent,
        },
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: "Feature request submitted successfully" 
    });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    logger.error("[Merchant Feature Request API Error]", { error: errMsg });
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 },
    );
  }
}

// GET endpoint to fetch feature requests for the merchant
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const merchantId = request.headers.get("x-merchant-id") || "anonymous";
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    const requests = await prisma.featureRequest?.findMany({
      where: { 
        merchantId 
      },
      orderBy: { 
        createdAt: "desc" 
      },
      skip: offset,
      take: limit,
    });

    const total = await prisma.featureRequest?.count({
      where: { merchantId },
    });

    return NextResponse.json({
      items: requests || [],
      total: total || 0,
      limit,
      offset,
    });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    logger.error("[Get Merchant Feature Requests Error]", { error: errMsg });
    return NextResponse.json(
      { error: "Failed to fetch feature requests" },
      { status: 500 },
    );
  }
}