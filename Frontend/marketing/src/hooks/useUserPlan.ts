"use client";

import { useEffect, useState } from "react";

type PlanTier = "free" | "starter" | "growth" | "scale";

interface UseUserPlanReturn {
  plan: PlanTier | null;
  tier: PlanTier | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: Error | null;
}

export function useUserPlan(): UseUserPlanReturn {
  const [plan, setPlan] = useState<PlanTier | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check for auth token
        const hasToken = document.cookie.includes("auth-token") || 
                         document.cookie.includes("session") ||
                         localStorage.getItem("auth-token") !== null;
        
        setIsAuthenticated(hasToken);
        
        if (hasToken) {
          // Fetch plan from API if authenticated
          try {
            const response = await fetch("/api/user/plan", { 
              credentials: "include",
              headers: { "Content-Type": "application/json" }
            });
            
            if (response.ok) {
              const data = await response.json();
              setPlan(data.plan || "free");
            } else {
              setPlan("free");
            }
          } catch {
            // Fallback to free tier on error
            setPlan("free");
          }
        } else {
          setPlan(null);
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
        setPlan(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  return {
    plan,
    tier: plan,
    isAuthenticated,
    loading,
    error,
  };
}
