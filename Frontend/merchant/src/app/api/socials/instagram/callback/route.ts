import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest): Promise<Response> {
  // Redirect to backend for OAuth handling
  const backendUrl = `${process.env.BACKEND_API_URL}/api/v1/platform/integrations/instagram/callback${request.nextUrl.search}`;
  
  // Forward cookies to backend
  const ig_oauth_state = request.cookies.get("ig_oauth_state")?.value || "";
  const ig_oauth_return_to = request.cookies.get("ig_oauth_return_to")?.value || "";
  const ig_oauth_store_id = request.cookies.get("ig_oauth_store_id")?.value || "";
  
  const response = NextResponse.redirect(backendUrl);
  
  // Forward cookies
  if (ig_oauth_state) {
    response.cookies.set("ig_oauth_state", ig_oauth_state, {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
  }
  if (ig_oauth_return_to) {
    response.cookies.set("ig_oauth_return_to", ig_oauth_return_to, {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
  }
  if (ig_oauth_store_id) {
    response.cookies.set("ig_oauth_store_id", ig_oauth_store_id, {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
  }
  
  return response;
}
