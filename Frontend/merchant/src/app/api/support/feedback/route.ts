import { NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const ticketId = searchParams.get("ticketId");
    const rating = searchParams.get("rating");
    if (!ticketId || !rating) {
        return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }
    try {
        // Submit feedback via backend API
        const result = await apiJson<{
            success: boolean;
            data?: any;
            error?: string;
        }>(`${process.env.BACKEND_API_URL}/api/support/feedback?ticketId=${ticketId}&rating=${rating}`);

        if (!result.success) {
            throw new Error(result.error || 'Failed to submit feedback');
        }

        // Backend handles closed-loop feature for bad ratings

        // Return a nice HTML response or redirect to a thank you page
        return new NextResponse(`
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
                        <div class="icon">${rating === 'GREAT' ? '🎉' : rating === 'OKAY' ? '👍' : '🙏'}</div>
                        <h1>Thank you for your feedback!</h1>
                        <p>
                            ${rating === 'BAD'
            ? "We're sorry we didn't meet your expectations. We've re-opened your ticket and a manager will review it shortly."
            : "Your feedback helps us improve our service for everyone. We're glad we could help!"}
                        </p>
                    </div>
                </body>
            </html>
            `, { 
                headers: { 
                    "Content-Type": "text/html",
                    "Cache-Control": "no-store",
                } 
            });
    }
    catch (error) {
        handleApiError(
          error,
          {
            endpoint: "/api/support/feedback",
            operation: "SUBMIT_FEEDBACK",
          }
        );
        return NextResponse.json({ error: "Internal Server Error" }, { 
            status: 500,
            headers: {
                "Cache-Control": "no-store",
            },
        });
    }
}
