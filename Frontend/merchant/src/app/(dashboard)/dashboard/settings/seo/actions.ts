"use server";
import { logger } from "@vayva/shared";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

async function getCookieHeader(): Promise<string> {
  const cookieStore = await cookies();
  return cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");
}

export async function updateStoreSeo(data: Record<string, unknown>) {
  const session = await getServerSession(authOptions);
  const user = session?.user;
  if (!user || !user.storeId) {
    throw new Error("Unauthorized");
  }
  try {
    const cookieHeader = await getCookieHeader();
    const backendResponse = await fetch(
      `${process?.env?.BACKEND_API_URL}/api/account/store`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          cookie: cookieHeader,
        },
        body: JSON.stringify({
          settings: {
            seoTitle: data.seoTitle,
            seoDescription: data.seoDescription,
            socialImage: data.socialImage,
          },
        }),
      }
    );

    if (!backendResponse.ok) {
      const error = await backendResponse.json().catch(() => ({ error: "Failed to update" }));
      throw new Error(error.error || "Failed to update settings");
    }

    revalidatePath("/dashboard/settings/seo");
    return { success: true };
  } catch (error) {
    logger.error("[SEO] Failed to update settings", {
      error: (error as Error)?.message,
      storeId: user.storeId,
    });
    return { success: false, error: "Failed to update settings" };
  }
}
