import { useMemo } from "react";
import { AnalyticsEngine } from "../analytics.engine";

/**
 * Stable analytics engine instance for dashboard components.
 */
export function useAnalyticsEngine() {
  return useMemo(() => new AnalyticsEngine(), []);
}
