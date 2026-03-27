import { NextRequest, NextResponse } from "next/server";
import { apiClient, handleApiError } from "@/lib/api-client";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, firstName, lastName } = body;

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Call backend auth register endpoint
    const response = await apiClient.post<any>('/api/v1/auth/register', {
      email,
      password,
      firstName,
      lastName,
    });

    // Set auth token in cookies
    const nextResponse = NextResponse.json({
      success: true,
      user: response.data.user,
    });

    if (response.data.token) {
      nextResponse.cookies.set('auth_token', response.data.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
    }

    return nextResponse;
  } catch (error) {
    console.error("[AUTH_REGISTER] Error:", error);
    const { message, code } = handleApiError(error);
    return NextResponse.json(
      { error: message, code },
      { status: 500 }
    );
  }
}
