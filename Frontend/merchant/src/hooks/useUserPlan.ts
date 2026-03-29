"use client";
import { logger } from "@vayva/shared";
import { useState, useEffect } from "react";
import { apiJson } from "@/lib/api-client-shared";

interface UserPlanResponse {
  plan?: string;
}

export function useUserPlan() {
  const [data, setData] = useState<UserPlanResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  useEffect(() => {
    let isMounted = true;
    async function fetchPlan() {
      try {
        const json = await apiJson<UserPlanResponse>("/me/plan");
        if (isMounted) setData(json);
      } catch (err) {
        const _errMsg = err instanceof Error ? err.message : String(err);
        logger.error("[FETCH_PLAN_ERROR]", { error: _errMsg, app: "merchant" });
        if (isMounted) setError(err as Error);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    void fetchPlan();
    return () => {
      isMounted = false;
    };
  }, []);
  return {
    plan: data?.plan,
    isLoading: loading,
    error,
  };
}
