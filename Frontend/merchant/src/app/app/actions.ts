"use server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { cookies } from "next/headers";

async function getCookieHeader(): Promise<string> {
  const cookieStore = await cookies();
  return cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");
}

export async function checkAppLaunchStatus() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { status: "unauthenticated" };
  }

  const cookieHeader = await getCookieHeader();
  const backendResponse = await fetch(
    `${process.env.BACKEND_API_URL}/api/auth/merchant/me`,
    {
      headers: {
        cookie: cookieHeader,
      },
      cache: "no-store",
    }
  );

  if (!backendResponse.ok) {
    return { status: "unauthenticated" };
  }

  const data = await backendResponse.json();
  const onboardingCompleted = data?.merchant?.onboardingCompleted || false;

  return {
    status: "authenticated",
    onboardingCompleted,
  };
}
