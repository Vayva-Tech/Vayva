"use server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@vayva/db";
export async function checkAppLaunchStatus() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { status: "unauthenticated" };
  }
  const store = await prisma.store.findUnique({
    where: { id: session.user.storeId },
    select: { onboardingCompleted: true },
  });
  if (!store) return { status: "unauthenticated" }; // Safety fallback
  return {
    status: "authenticated",
    onboardingCompleted: store.onboardingCompleted,
  };
}
