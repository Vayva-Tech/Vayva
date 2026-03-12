"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

interface OpsUser {
  id: string;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  lastLoginAt: string | null;
}

export function useUser() {
  const router = useRouter();

  const { data: user, isLoading, error } = useQuery<OpsUser>({
    queryKey: ["ops-user"],
    queryFn: async () => {
      const res = await fetch("/api/ops/me");
      if (!res.ok) {
        if (res.status === 401) {
          router.push("/ops/login");
        }
        throw new Error("Failed to fetch user");
      }
      return res.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });

  return {
    user,
    isLoading,
    error,
    isAuthenticated: !!user,
  };
}
