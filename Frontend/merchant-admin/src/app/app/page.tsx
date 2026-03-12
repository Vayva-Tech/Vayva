"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getAuthRedirect } from "@/lib/session";
import Image from "next/image";

export default function AppLaunchPage() {
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
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50">
      <div className="animate-pulse">
        <Image
          src="/icons/icon-192.png"
          alt="Vayva"
          width={100}
          height={100}
          className="w-24 h-24 mb-4"
          priority
        />
      </div>
      <div className="mt-8 flex space-x-2">
        <div className="w-2 h-2 bg-background rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-2 h-2 bg-background rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-2 h-2 bg-background rounded-full animate-bounce"></div>
      </div>
    </div>
  );
}
