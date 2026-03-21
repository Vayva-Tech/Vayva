"use client";

import { useAuth } from "@/context/AuthContext";

export function useIsPaidPlan(): boolean {
  const { merchant } = useAuth();
  
  const plan = String((merchant as any)?.plan || "")
    .trim()
    .toLowerCase();
    
  return plan === "starter" || plan === "pro";
}
