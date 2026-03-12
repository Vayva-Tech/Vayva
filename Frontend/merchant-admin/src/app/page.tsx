"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getAuthRedirect } from "@/lib/session";
// import { LoadingSpinner } from "@vayva/ui";

export default function RootPage() {
  const router = useRouter();
  const { user, merchant, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.replace("/signin");
      return;
    }

    const destination = getAuthRedirect(
      user,
      merchant
        ? {
            onboardingStatus: merchant.onboardingStatus,
            onboardingCompleted: merchant.onboardingCompleted,
          }
        : null,
    );
    router.replace(destination);
  }, [user, merchant, isLoading, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-transparent">
      {/* Use simple spinner if component not verified, or simple SVG */}
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
}
